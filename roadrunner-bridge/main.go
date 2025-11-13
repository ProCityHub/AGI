package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"github.com/gorilla/mux"
	"github.com/roadrunner-server/roadrunner/v2/pkg/rr"
	"github.com/roadrunner-server/roadrunner/v2/plugins/http"
	"github.com/roadrunner-server/roadrunner/v2/plugins/grpc"
	"github.com/roadrunner-server/roadrunner/v2/plugins/jobs"
	"github.com/roadrunner-server/roadrunner/v2/plugins/kv"
	"google.golang.org/api/option"
	"google.golang.org/api/oauth2/v2"
)

// BridgeGateway represents the main RoadRunner bridge service
type BridgeGateway struct {
	router           *mux.Router
	httpPlugin       *http.Plugin
	grpcPlugin       *grpc.Plugin
	jobsPlugin       *jobs.Plugin
	kvPlugin         *kv.Plugin
	googleAuth       *GoogleAuthManager
	repositoryManager *RepositoryManager
	config           *BridgeConfig
}

// BridgeConfig holds the configuration for the bridge
type BridgeConfig struct {
	Port                string            `json:"port"`
	GoogleCredentials   string            `json:"google_credentials"`
	Repositories        map[string]RepoConfig `json:"repositories"`
	RateLimits          map[string]int    `json:"rate_limits"`
	EnableMetrics       bool              `json:"enable_metrics"`
	EnableTracing       bool              `json:"enable_tracing"`
}

// RepoConfig represents configuration for a specific repository
type RepoConfig struct {
	Name        string `json:"name"`
	URL         string `json:"url"`
	Type        string `json:"type"` // python, typescript, rust, generic
	AuthMethod  string `json:"auth_method"`
	HealthCheck string `json:"health_check"`
	Priority    int    `json:"priority"`
}

// GoogleAuthManager handles Google Cloud authentication
type GoogleAuthManager struct {
	oauth2Service *oauth2.Service
	credentials   string
}

// RepositoryManager manages connections to all repositories
type RepositoryManager struct {
	repositories map[string]*RepositoryAdapter
	healthStatus map[string]bool
}

// RepositoryAdapter represents an adapter for a specific repository
type RepositoryAdapter struct {
	Config     RepoConfig
	Client     *http.Client
	LastHealth time.Time
	IsHealthy  bool
}

// BridgeRequest represents a request coming through the bridge
type BridgeRequest struct {
	Repository string                 `json:"repository"`
	Action     string                 `json:"action"`
	Data       map[string]interface{} `json:"data"`
	Headers    map[string]string      `json:"headers"`
	Metadata   map[string]string      `json:"metadata"`
}

// BridgeResponse represents a response from the bridge
type BridgeResponse struct {
	Success      bool                   `json:"success"`
	Data         map[string]interface{} `json:"data"`
	Error        string                 `json:"error,omitempty"`
	ProcessingTime string               `json:"processing_time"`
	Repository   string                 `json:"repository"`
	Metadata     map[string]string      `json:"metadata"`
}

// NewBridgeGateway creates a new bridge gateway instance
func NewBridgeGateway(configPath string) (*BridgeGateway, error) {
	config, err := loadConfig(configPath)
	if err != nil {
		return nil, fmt.Errorf("failed to load config: %w", err)
	}

	// Initialize Google Auth Manager
	googleAuth, err := NewGoogleAuthManager(config.GoogleCredentials)
	if err != nil {
		return nil, fmt.Errorf("failed to initialize Google auth: %w", err)
	}

	// Initialize Repository Manager
	repoManager := NewRepositoryManager(config.Repositories)

	// Create router
	router := mux.NewRouter()

	gateway := &BridgeGateway{
		router:            router,
		googleAuth:        googleAuth,
		repositoryManager: repoManager,
		config:            config,
	}

	// Setup routes
	gateway.setupRoutes()

	return gateway, nil
}

// NewGoogleAuthManager creates a new Google authentication manager
func NewGoogleAuthManager(credentialsPath string) (*GoogleAuthManager, error) {
	ctx := context.Background()
	
	oauth2Service, err := oauth2.NewService(ctx, option.WithCredentialsFile(credentialsPath))
	if err != nil {
		return nil, fmt.Errorf("failed to create OAuth2 service: %w", err)
	}

	return &GoogleAuthManager{
		oauth2Service: oauth2Service,
		credentials:   credentialsPath,
	}, nil
}

// NewRepositoryManager creates a new repository manager
func NewRepositoryManager(repoConfigs map[string]RepoConfig) *RepositoryManager {
	repositories := make(map[string]*RepositoryAdapter)
	healthStatus := make(map[string]bool)

	for name, config := range repoConfigs {
		adapter := &RepositoryAdapter{
			Config:    config,
			Client:    &http.Client{Timeout: 30 * time.Second},
			IsHealthy: false,
		}
		repositories[name] = adapter
		healthStatus[name] = false
	}

	manager := &RepositoryManager{
		repositories: repositories,
		healthStatus: healthStatus,
	}

	// Start health checking
	go manager.startHealthChecking()

	return manager
}

// setupRoutes configures all the HTTP routes for the bridge
func (bg *BridgeGateway) setupRoutes() {
	// Health check endpoint
	bg.router.HandleFunc("/health", bg.healthHandler).Methods("GET")
	
	// Bridge endpoints
	bg.router.HandleFunc("/bridge/{repository}/{action}", bg.bridgeHandler).Methods("POST", "GET", "PUT", "DELETE")
	
	// Google Cloud integration endpoints
	bg.router.HandleFunc("/google/{service}", bg.googleServiceHandler).Methods("POST", "GET")
	
	// Repository management endpoints
	bg.router.HandleFunc("/repositories", bg.listRepositoriesHandler).Methods("GET")
	bg.router.HandleFunc("/repositories/{name}/health", bg.repositoryHealthHandler).Methods("GET")
	
	// Metrics endpoint (if enabled)
	if bg.config.EnableMetrics {
		bg.router.HandleFunc("/metrics", bg.metricsHandler).Methods("GET")
	}

	// Middleware
	bg.router.Use(bg.loggingMiddleware)
	bg.router.Use(bg.authMiddleware)
	bg.router.Use(bg.rateLimitMiddleware)
}

// bridgeHandler handles requests to repository services
func (bg *BridgeGateway) bridgeHandler(w http.ResponseWriter, r *http.Request) {
	startTime := time.Now()
	vars := mux.Vars(r)
	repository := vars["repository"]
	action := vars["action"]

	// Validate repository exists
	adapter, exists := bg.repositoryManager.repositories[repository]
	if !exists {
		bg.sendErrorResponse(w, fmt.Sprintf("Repository '%s' not found", repository), http.StatusNotFound)
		return
	}

	// Check repository health
	if !adapter.IsHealthy {
		bg.sendErrorResponse(w, fmt.Sprintf("Repository '%s' is unhealthy", repository), http.StatusServiceUnavailable)
		return
	}

	// Parse request body
	var requestData map[string]interface{}
	if r.Body != nil {
		if err := json.NewDecoder(r.Body).Decode(&requestData); err != nil {
			requestData = make(map[string]interface{})
		}
	}

	// Create bridge request
	bridgeReq := BridgeRequest{
		Repository: repository,
		Action:     action,
		Data:       requestData,
		Headers:    extractHeaders(r),
		Metadata: map[string]string{
			"client_ip":    r.RemoteAddr,
			"user_agent":   r.UserAgent(),
			"request_id":   generateRequestID(),
			"timestamp":    time.Now().UTC().Format(time.RFC3339),
		},
	}

	// Route to appropriate adapter
	response, err := bg.routeToRepository(adapter, bridgeReq)
	if err != nil {
		bg.sendErrorResponse(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Add processing time
	response.ProcessingTime = time.Since(startTime).String()
	response.Repository = repository

	// Send response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// googleServiceHandler handles Google Cloud service requests
func (bg *BridgeGateway) googleServiceHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	service := vars["service"]

	// Validate Google authentication
	if !bg.validateGoogleAuth(r) {
		bg.sendErrorResponse(w, "Invalid Google authentication", http.StatusUnauthorized)
		return
	}

	// Route to appropriate Google service
	response, err := bg.routeToGoogleService(service, r)
	if err != nil {
		bg.sendErrorResponse(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// healthHandler returns the overall health status of the bridge
func (bg *BridgeGateway) healthHandler(w http.ResponseWriter, r *http.Request) {
	healthStatus := map[string]interface{}{
		"status":       "healthy",
		"timestamp":    time.Now().UTC().Format(time.RFC3339),
		"repositories": bg.repositoryManager.healthStatus,
		"version":      "1.0.0",
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(healthStatus)
}

// listRepositoriesHandler returns the list of all repositories
func (bg *BridgeGateway) listRepositoriesHandler(w http.ResponseWriter, r *http.Request) {
	repositories := make([]map[string]interface{}, 0)
	
	for name, adapter := range bg.repositoryManager.repositories {
		repo := map[string]interface{}{
			"name":         name,
			"type":         adapter.Config.Type,
			"url":          adapter.Config.URL,
			"healthy":      adapter.IsHealthy,
			"last_health":  adapter.LastHealth.Format(time.RFC3339),
			"priority":     adapter.Config.Priority,
		}
		repositories = append(repositories, repo)
	}

	response := map[string]interface{}{
		"repositories": repositories,
		"total":        len(repositories),
		"timestamp":    time.Now().UTC().Format(time.RFC3339),
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// repositoryHealthHandler returns health status for a specific repository
func (bg *BridgeGateway) repositoryHealthHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	name := vars["name"]

	adapter, exists := bg.repositoryManager.repositories[name]
	if !exists {
		bg.sendErrorResponse(w, fmt.Sprintf("Repository '%s' not found", name), http.StatusNotFound)
		return
	}

	health := map[string]interface{}{
		"name":        name,
		"healthy":     adapter.IsHealthy,
		"last_check":  adapter.LastHealth.Format(time.RFC3339),
		"url":         adapter.Config.URL,
		"type":        adapter.Config.Type,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(health)
}

// metricsHandler returns Prometheus-style metrics
func (bg *BridgeGateway) metricsHandler(w http.ResponseWriter, r *http.Request) {
	// TODO: Implement Prometheus metrics
	w.Header().Set("Content-Type", "text/plain")
	fmt.Fprintf(w, "# HELP bridge_requests_total Total number of bridge requests\n")
	fmt.Fprintf(w, "# TYPE bridge_requests_total counter\n")
	fmt.Fprintf(w, "bridge_requests_total 0\n")
}

// Middleware functions
func (bg *BridgeGateway) loggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		next.ServeHTTP(w, r)
		log.Printf("%s %s %s %v", r.Method, r.RequestURI, r.RemoteAddr, time.Since(start))
	})
}

func (bg *BridgeGateway) authMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Skip auth for health checks
		if strings.HasPrefix(r.URL.Path, "/health") || strings.HasPrefix(r.URL.Path, "/metrics") {
			next.ServeHTTP(w, r)
			return
		}

		// TODO: Implement proper authentication
		next.ServeHTTP(w, r)
	})
}

func (bg *BridgeGateway) rateLimitMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// TODO: Implement rate limiting
		next.ServeHTTP(w, r)
	})
}

// Helper functions
func (bg *BridgeGateway) routeToRepository(adapter *RepositoryAdapter, req BridgeRequest) (*BridgeResponse, error) {
	// TODO: Implement repository-specific routing logic
	return &BridgeResponse{
		Success: true,
		Data: map[string]interface{}{
			"message": fmt.Sprintf("Routed to %s for action %s", req.Repository, req.Action),
		},
	}, nil
}

func (bg *BridgeGateway) routeToGoogleService(service string, r *http.Request) (map[string]interface{}, error) {
	// TODO: Implement Google service routing
	return map[string]interface{}{
		"service": service,
		"message": "Google service integration placeholder",
	}, nil
}

func (bg *BridgeGateway) validateGoogleAuth(r *http.Request) bool {
	// TODO: Implement Google authentication validation
	return true
}

func (bg *BridgeGateway) sendErrorResponse(w http.ResponseWriter, message string, statusCode int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(map[string]string{
		"error":     message,
		"timestamp": time.Now().UTC().Format(time.RFC3339),
	})
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

func generateRequestID() string {
	return fmt.Sprintf("req_%d", time.Now().UnixNano())
}

func loadConfig(configPath string) (*BridgeConfig, error) {
	// TODO: Load configuration from file
	// For now, return default configuration
	return &BridgeConfig{
		Port:              "8080",
		GoogleCredentials: "/etc/google/credentials.json",
		Repositories: map[string]RepoConfig{
			"AGI": {
				Name:        "AGI",
				URL:         "http://agi-service:3000",
				Type:        "typescript",
				AuthMethod:  "bearer",
				HealthCheck: "/health",
				Priority:    1,
			},
			"GARVIS": {
				Name:        "GARVIS",
				URL:         "http://garvis-service:8000",
				Type:        "python",
				AuthMethod:  "api_key",
				HealthCheck: "/health",
				Priority:    1,
			},
		},
		RateLimits: map[string]int{
			"AGI":    1000,
			"GARVIS": 500,
		},
		EnableMetrics: true,
		EnableTracing: true,
	}, nil
}

// startHealthChecking starts the health checking routine
func (rm *RepositoryManager) startHealthChecking() {
	ticker := time.NewTicker(30 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			rm.checkAllRepositories()
		}
	}
}

func (rm *RepositoryManager) checkAllRepositories() {
	for name, adapter := range rm.repositories {
		healthy := rm.checkRepositoryHealth(adapter)
		adapter.IsHealthy = healthy
		adapter.LastHealth = time.Now()
		rm.healthStatus[name] = healthy
	}
}

func (rm *RepositoryManager) checkRepositoryHealth(adapter *RepositoryAdapter) bool {
	if adapter.Config.HealthCheck == "" {
		return true // Assume healthy if no health check configured
	}

	url := adapter.Config.URL + adapter.Config.HealthCheck
	resp, err := adapter.Client.Get(url)
	if err != nil {
		log.Printf("Health check failed for %s: %v", adapter.Config.Name, err)
		return false
	}
	defer resp.Body.Close()

	return resp.StatusCode == http.StatusOK
}

// Start starts the bridge gateway server
func (bg *BridgeGateway) Start() error {
	log.Printf("Starting RoadRunner Bridge Gateway on port %s", bg.config.Port)
	
	server := &http.Server{
		Addr:         ":" + bg.config.Port,
		Handler:      bg.router,
		ReadTimeout:  30 * time.Second,
		WriteTimeout: 30 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Graceful shutdown
	go func() {
		sigChan := make(chan os.Signal, 1)
		signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
		<-sigChan

		log.Println("Shutting down bridge gateway...")
		ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
		defer cancel()
		
		if err := server.Shutdown(ctx); err != nil {
			log.Printf("Server shutdown error: %v", err)
		}
	}()

	return server.ListenAndServe()
}

func main() {
	configPath := os.Getenv("BRIDGE_CONFIG_PATH")
	if configPath == "" {
		configPath = "./config.json"
	}

	gateway, err := NewBridgeGateway(configPath)
	if err != nil {
		log.Fatalf("Failed to create bridge gateway: %v", err)
	}

	if err := gateway.Start(); err != nil && err != http.ErrServerClosed {
		log.Fatalf("Server failed to start: %v", err)
	}

	log.Println("Bridge gateway stopped")
}
