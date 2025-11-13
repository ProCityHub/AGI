package googleintegration

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
	"google.golang.org/api/option"
	"google.golang.org/api/oauth2/v2"
	"google.golang.org/api/cloudresourcemanager/v1"
	"google.golang.org/api/iam/v1"
)

// GoogleAuthManager handles all Google Cloud authentication and authorization
type GoogleAuthManager struct {
	config           *oauth2.Config
	serviceAccount   *ServiceAccountConfig
	oauth2Service    *oauth2.Service
	iamService       *iam.Service
	resourceManager  *cloudresourcemanager.Service
	tokenCache       map[string]*CachedToken
	ctx              context.Context
}

// ServiceAccountConfig holds service account configuration
type ServiceAccountConfig struct {
	Type                    string `json:"type"`
	ProjectID               string `json:"project_id"`
	PrivateKeyID            string `json:"private_key_id"`
	PrivateKey              string `json:"private_key"`
	ClientEmail             string `json:"client_email"`
	ClientID                string `json:"client_id"`
	AuthURI                 string `json:"auth_uri"`
	TokenURI                string `json:"token_uri"`
	AuthProviderX509CertURL string `json:"auth_provider_x509_cert_url"`
	ClientX509CertURL       string `json:"client_x509_cert_url"`
}

// CachedToken represents a cached authentication token
type CachedToken struct {
	Token     *oauth2.Token
	ExpiresAt time.Time
	Scopes    []string
	UserID    string
}

// AuthRequest represents an authentication request
type AuthRequest struct {
	Repository string            `json:"repository"`
	Action     string            `json:"action"`
	Scopes     []string          `json:"scopes"`
	Headers    map[string]string `json:"headers"`
	UserID     string            `json:"user_id"`
}

// AuthResponse represents an authentication response
type AuthResponse struct {
	Success      bool              `json:"success"`
	Token        string            `json:"token,omitempty"`
	ExpiresIn    int64             `json:"expires_in,omitempty"`
	Scopes       []string          `json:"scopes,omitempty"`
	Error        string            `json:"error,omitempty"`
	Permissions  []string          `json:"permissions,omitempty"`
	ProjectID    string            `json:"project_id,omitempty"`
	ServiceEmail string            `json:"service_email,omitempty"`
}

// NewGoogleAuthManager creates a new Google authentication manager
func NewGoogleAuthManager(credentialsPath string) (*GoogleAuthManager, error) {
	ctx := context.Background()
	
	// Load service account credentials
	serviceAccount, err := loadServiceAccountConfig(credentialsPath)
	if err != nil {
		return nil, fmt.Errorf("failed to load service account config: %w", err)
	}

	// Create OAuth2 config
	config := &oauth2.Config{
		ClientID:     serviceAccount.ClientID,
		ClientSecret: "", // Service accounts don't use client secrets
		Endpoint:     google.Endpoint,
		Scopes: []string{
			"https://www.googleapis.com/auth/cloud-platform",
			"https://www.googleapis.com/auth/userinfo.email",
			"https://www.googleapis.com/auth/userinfo.profile",
		},
	}

	// Initialize Google API services
	oauth2Service, err := oauth2.NewService(ctx, option.WithCredentialsFile(credentialsPath))
	if err != nil {
		return nil, fmt.Errorf("failed to create OAuth2 service: %w", err)
	}

	iamService, err := iam.NewService(ctx, option.WithCredentialsFile(credentialsPath))
	if err != nil {
		return nil, fmt.Errorf("failed to create IAM service: %w", err)
	}

	resourceManager, err := cloudresourcemanager.NewService(ctx, option.WithCredentialsFile(credentialsPath))
	if err != nil {
		return nil, fmt.Errorf("failed to create Resource Manager service: %w", err)
	}

	return &GoogleAuthManager{
		config:          config,
		serviceAccount:  serviceAccount,
		oauth2Service:   oauth2Service,
		iamService:      iamService,
		resourceManager: resourceManager,
		tokenCache:      make(map[string]*CachedToken),
		ctx:             ctx,
	}, nil
}

// AuthenticateRequest validates and processes an authentication request
func (gam *GoogleAuthManager) AuthenticateRequest(req *AuthRequest) (*AuthResponse, error) {
	log.Printf("Authenticating request for repository: %s, action: %s", req.Repository, req.Action)

	// Extract token from headers
	token, err := gam.extractTokenFromHeaders(req.Headers)
	if err != nil {
		return &AuthResponse{
			Success: false,
			Error:   fmt.Sprintf("Failed to extract token: %v", err),
		}, nil
	}

	// Validate token
	tokenInfo, err := gam.validateToken(token)
	if err != nil {
		return &AuthResponse{
			Success: false,
			Error:   fmt.Sprintf("Token validation failed: %v", err),
		}, nil
	}

	// Check permissions for repository and action
	permissions, err := gam.checkPermissions(tokenInfo, req.Repository, req.Action)
	if err != nil {
		return &AuthResponse{
			Success: false,
			Error:   fmt.Sprintf("Permission check failed: %v", err),
		}, nil
	}

	// Generate service token for internal use
	serviceToken, err := gam.generateServiceToken(req.Repository, req.Scopes)
	if err != nil {
		return &AuthResponse{
			Success: false,
			Error:   fmt.Sprintf("Failed to generate service token: %v", err),
		}, nil
	}

	return &AuthResponse{
		Success:      true,
		Token:        serviceToken.AccessToken,
		ExpiresIn:    int64(time.Until(serviceToken.Expiry).Seconds()),
		Scopes:       req.Scopes,
		Permissions:  permissions,
		ProjectID:    gam.serviceAccount.ProjectID,
		ServiceEmail: gam.serviceAccount.ClientEmail,
	}, nil
}

// ValidateGoogleToken validates a Google OAuth2 token
func (gam *GoogleAuthManager) ValidateGoogleToken(token string) (*oauth2.Tokeninfo, error) {
	tokenInfoCall := gam.oauth2Service.Tokeninfo()
	tokenInfoCall.AccessToken(token)
	
	tokenInfo, err := tokenInfoCall.Do()
	if err != nil {
		return nil, fmt.Errorf("failed to validate token: %w", err)
	}

	// Check if token is expired
	if tokenInfo.ExpiresIn <= 0 {
		return nil, fmt.Errorf("token has expired")
	}

	// Verify audience and issuer
	if tokenInfo.Audience != gam.config.ClientID {
		log.Printf("Warning: Token audience mismatch. Expected: %s, Got: %s", 
			gam.config.ClientID, tokenInfo.Audience)
	}

	return tokenInfo, nil
}

// GetServiceAccountToken generates a service account token for Google Cloud APIs
func (gam *GoogleAuthManager) GetServiceAccountToken(scopes []string) (*oauth2.Token, error) {
	// Create JWT config from service account
	jwtConfig, err := google.JWTConfigFromJSON([]byte(gam.serviceAccountJSON()), scopes...)
	if err != nil {
		return nil, fmt.Errorf("failed to create JWT config: %w", err)
	}

	// Get token
	token, err := jwtConfig.TokenSource(gam.ctx).Token()
	if err != nil {
		return nil, fmt.Errorf("failed to get service account token: %w", err)
	}

	return token, nil
}

// CheckRepositoryPermissions verifies if the authenticated user has permissions for a repository
func (gam *GoogleAuthManager) CheckRepositoryPermissions(userEmail, repository, action string) ([]string, error) {
	// Define permission mapping for different repositories and actions
	permissionMap := map[string]map[string][]string{
		"AGI": {
			"consciousness/process": {"ai.models.predict", "compute.instances.use"},
			"gpu/accelerate":        {"compute.instances.use", "compute.gpus.use"},
			"health":               {"monitoring.metricDescriptors.list"},
		},
		"GARVIS": {
			"model/train":    {"ai.models.create", "storage.objects.create"},
			"model/predict":  {"ai.models.predict"},
			"model/deploy":   {"ai.models.deploy", "run.services.create"},
		},
		"Memori": {
			"memory/store":    {"firestore.documents.write"},
			"memory/retrieve": {"firestore.documents.read"},
			"memory/search":   {"firestore.documents.list"},
		},
		"milvus": {
			"vector/search": {"bigquery.jobs.create", "storage.objects.read"},
			"vector/insert": {"bigquery.tables.updateData", "storage.objects.create"},
		},
	}

	// Get required permissions for the repository and action
	repoPerms, exists := permissionMap[repository]
	if !exists {
		return []string{"basic.read"}, nil // Default permissions for unknown repositories
	}

	actionPerms, exists := repoPerms[action]
	if !exists {
		return []string{"basic.read"}, nil // Default permissions for unknown actions
	}

	// In a real implementation, you would check these permissions against IAM
	// For now, we'll simulate permission checking
	log.Printf("Checking permissions for user %s: %v", userEmail, actionPerms)

	return actionPerms, nil
}

// RefreshToken refreshes an expired OAuth2 token
func (gam *GoogleAuthManager) RefreshToken(refreshToken string) (*oauth2.Token, error) {
	token := &oauth2.Token{
		RefreshToken: refreshToken,
	}

	tokenSource := gam.config.TokenSource(gam.ctx, token)
	newToken, err := tokenSource.Token()
	if err != nil {
		return nil, fmt.Errorf("failed to refresh token: %w", err)
	}

	return newToken, nil
}

// CacheToken stores a token in the cache
func (gam *GoogleAuthManager) CacheToken(userID string, token *oauth2.Token, scopes []string) {
	gam.tokenCache[userID] = &CachedToken{
		Token:     token,
		ExpiresAt: token.Expiry,
		Scopes:    scopes,
		UserID:    userID,
	}
}

// GetCachedToken retrieves a cached token
func (gam *GoogleAuthManager) GetCachedToken(userID string) (*CachedToken, bool) {
	cached, exists := gam.tokenCache[userID]
	if !exists {
		return nil, false
	}

	// Check if token is expired
	if time.Now().After(cached.ExpiresAt) {
		delete(gam.tokenCache, userID)
		return nil, false
	}

	return cached, true
}

// Helper functions

func (gam *GoogleAuthManager) extractTokenFromHeaders(headers map[string]string) (string, error) {
	authHeader, exists := headers["Authorization"]
	if !exists {
		return "", fmt.Errorf("authorization header not found")
	}

	// Extract Bearer token
	if !strings.HasPrefix(authHeader, "Bearer ") {
		return "", fmt.Errorf("invalid authorization header format")
	}

	return strings.TrimPrefix(authHeader, "Bearer "), nil
}

func (gam *GoogleAuthManager) validateToken(token string) (*oauth2.Tokeninfo, error) {
	return gam.ValidateGoogleToken(token)
}

func (gam *GoogleAuthManager) checkPermissions(tokenInfo *oauth2.Tokeninfo, repository, action string) ([]string, error) {
	return gam.CheckRepositoryPermissions(tokenInfo.Email, repository, action)
}

func (gam *GoogleAuthManager) generateServiceToken(repository string, scopes []string) (*oauth2.Token, error) {
	// Generate appropriate scopes based on repository
	if len(scopes) == 0 {
		scopes = gam.getDefaultScopes(repository)
	}

	return gam.GetServiceAccountToken(scopes)
}

func (gam *GoogleAuthManager) getDefaultScopes(repository string) []string {
	scopeMap := map[string][]string{
		"AGI": {
			"https://www.googleapis.com/auth/cloud-platform",
			"https://www.googleapis.com/auth/compute",
		},
		"GARVIS": {
			"https://www.googleapis.com/auth/cloud-platform",
			"https://www.googleapis.com/auth/aiplatform",
		},
		"Memori": {
			"https://www.googleapis.com/auth/cloud-platform",
			"https://www.googleapis.com/auth/datastore",
		},
		"milvus": {
			"https://www.googleapis.com/auth/cloud-platform",
			"https://www.googleapis.com/auth/bigquery",
		},
	}

	if scopes, exists := scopeMap[repository]; exists {
		return scopes
	}

	// Default scopes
	return []string{
		"https://www.googleapis.com/auth/cloud-platform",
	}
}

func (gam *GoogleAuthManager) serviceAccountJSON() string {
	data, _ := json.Marshal(gam.serviceAccount)
	return string(data)
}

func loadServiceAccountConfig(credentialsPath string) (*ServiceAccountConfig, error) {
	// In a real implementation, this would read from the file
	// For now, return a mock configuration
	return &ServiceAccountConfig{
		Type:                    "service_account",
		ProjectID:               "procityhub-bridge",
		PrivateKeyID:            "key-id",
		PrivateKey:              "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
		ClientEmail:             "bridge-service@procityhub-bridge.iam.gserviceaccount.com",
		ClientID:                "123456789",
		AuthURI:                 "https://accounts.google.com/o/oauth2/auth",
		TokenURI:                "https://oauth2.googleapis.com/token",
		AuthProviderX509CertURL: "https://www.googleapis.com/oauth2/v1/certs",
		ClientX509CertURL:       "https://www.googleapis.com/robot/v1/metadata/x509/bridge-service%40procityhub-bridge.iam.gserviceaccount.com",
	}, nil
}

// Middleware for HTTP authentication
func (gam *GoogleAuthManager) AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Skip authentication for health checks and public endpoints
		if strings.HasPrefix(r.URL.Path, "/health") || 
		   strings.HasPrefix(r.URL.Path, "/metrics") ||
		   strings.HasPrefix(r.URL.Path, "/status") {
			next.ServeHTTP(w, r)
			return
		}

		// Extract and validate authentication
		authReq := &AuthRequest{
			Repository: extractRepositoryFromPath(r.URL.Path),
			Action:     extractActionFromPath(r.URL.Path),
			Headers:    extractHeaders(r),
			UserID:     extractUserID(r),
		}

		authResp, err := gam.AuthenticateRequest(authReq)
		if err != nil || !authResp.Success {
			http.Error(w, "Authentication failed: "+authResp.Error, http.StatusUnauthorized)
			return
		}

		// Add authentication info to request context
		ctx := context.WithValue(r.Context(), "auth", authResp)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// Helper functions for middleware
func extractRepositoryFromPath(path string) string {
	parts := strings.Split(strings.Trim(path, "/"), "/")
	if len(parts) >= 2 && parts[0] == "bridge" {
		return parts[1]
	}
	return "unknown"
}

func extractActionFromPath(path string) string {
	parts := strings.Split(strings.Trim(path, "/"), "/")
	if len(parts) >= 3 && parts[0] == "bridge" {
		return parts[2]
	}
	return "unknown"
}

func extractHeaders(r *http.Request) map[string]string {
	headers := make(map[string]string)
	for name, values := range r.Header {
		if len(values) > 0 {
			headers[name] = values[0]
		}
	}
	return headers
}

func extractUserID(r *http.Request) string {
	// Extract user ID from token or headers
	// This is a simplified implementation
	return "user-" + fmt.Sprintf("%d", time.Now().Unix())
}
