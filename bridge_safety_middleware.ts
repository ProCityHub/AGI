/**
 * Bridge Safety Middleware for AGI Content Safety System
 * Integrates content safety and age restriction measures into all bridge systems
 * Ensures compliance with territorial laws and treaties as specified in repository rules
 */

import { Request, Response, NextFunction } from 'express';
import { ContentSafetyManager } from './content_safety_framework';
import { AgeRestrictionEngine } from './age_restriction_engine';
import { ContentMonitoringSensorArray } from './content_monitoring_sensors';

// Type definitions for safety middleware
interface SafetyConfig {
  enabled: boolean;
  strictMode: boolean;
  ageVerificationRequired: boolean;
  territorialComplianceRequired: boolean;
  culturalSensitivityMode: 'basic' | 'enhanced' | 'maximum';
  logLevel: 'info' | 'warn' | 'error';
}

interface UserContext {
  userId?: string;
  ageGroup?: string;
  jurisdiction?: string;
  parentalControlLevel?: string;
  verificationStatus?: boolean;
}

interface ContentRequest {
  content: string;
  contentType: string;
  bridgeSource: string;
  userContext: UserContext;
  requestId: string;
  timestamp: Date;
}

interface SafetyResult {
  allowed: boolean;
  safetyLevel: string;
  warnings: string[];
  blockedReasons: string[];
  ageAppropriate: boolean;
  territoriallyCompliant: boolean;
  requiresParentalGuidance: boolean;
  metadata: Record<string, any>;
}

/**
 * Universal Bridge Safety Middleware
 * Provides centralized safety checking for all bridge systems
 */
export class BridgeSafetyMiddleware {
  private safetyManager: ContentSafetyManager;
  private ageRestrictionEngine: AgeRestrictionEngine;
  private sensorArray: ContentMonitoringSensorArray;
  private config: SafetyConfig;
  private requestCache: Map<string, SafetyResult>;
  private cacheTimeout: number = 300000; // 5 minutes

  constructor(config: Partial<SafetyConfig> = {}) {
    this.config = {
      enabled: true,
      strictMode: false,
      ageVerificationRequired: true,
      territorialComplianceRequired: true,
      culturalSensitivityMode: 'enhanced',
      logLevel: 'info',
      ...config
    };

    this.requestCache = new Map();
    this.initializeSafetyComponents();
    
    console.log('🛡️ Bridge Safety Middleware initialized');
  }

  private async initializeSafetyComponents(): Promise<void> {
    try {
      // Initialize safety components (these would be Python modules in practice)
      // For TypeScript integration, we'd use child_process or a Python bridge
      console.log('Initializing safety components...');
      
      // In a real implementation, these would be initialized via Python bridge
      // this.safetyManager = new ContentSafetyManager();
      // this.ageRestrictionEngine = new AgeRestrictionEngine();
      // this.sensorArray = new ContentMonitoringSensorArray();
      
    } catch (error) {
      console.error('Failed to initialize safety components:', error);
      throw error;
    }
  }

  /**
   * Express middleware function for content safety checking
   */
  public middleware() {
    return async (req: Request, res: Response, next: NextFunction) => {
      if (!this.config.enabled) {
        return next();
      }

      try {
        const contentRequest = this.extractContentRequest(req);
        const safetyResult = await this.checkContentSafety(contentRequest);

        // Add safety result to request for downstream use
        (req as any).safetyResult = safetyResult;

        if (!safetyResult.allowed) {
          return this.handleBlockedContent(res, safetyResult);
        }

        // Add safety headers
        this.addSafetyHeaders(res, safetyResult);

        next();
      } catch (error) {
        console.error('Safety middleware error:', error);
        
        if (this.config.strictMode) {
          return this.handleSafetyError(res, error);
        }
        
        // In non-strict mode, allow request to continue with warning
        console.warn('Safety check failed, allowing request in non-strict mode');
        next();
      }
    };
  }

  /**
   * Check content safety for a given request
   */
  public async checkContentSafety(request: ContentRequest): Promise<SafetyResult> {
    const cacheKey = this.generateCacheKey(request);
    
    // Check cache first
    if (this.requestCache.has(cacheKey)) {
      const cached = this.requestCache.get(cacheKey)!;
      if (Date.now() - (cached.metadata.timestamp || 0) < this.cacheTimeout) {
        return cached;
      }
    }

    try {
      // Perform comprehensive safety analysis
      const result = await this.performSafetyAnalysis(request);
      
      // Cache result
      result.metadata.timestamp = Date.now();
      this.requestCache.set(cacheKey, result);
      
      // Clean up old cache entries
      this.cleanupCache();
      
      return result;
      
    } catch (error) {
      console.error('Content safety analysis failed:', error);
      
      // Return safe default (block content)
      return {
        allowed: false,
        safetyLevel: 'BLOCKED',
        warnings: ['Safety analysis failed'],
        blockedReasons: ['Technical error during safety analysis'],
        ageAppropriate: false,
        territoriallyCompliant: false,
        requiresParentalGuidance: true,
        metadata: { error: error.message }
      };
    }
  }

  /**
   * Perform comprehensive safety analysis
   */
  private async performSafetyAnalysis(request: ContentRequest): Promise<SafetyResult> {
    // In a real implementation, this would call the Python safety components
    // For now, we'll implement basic safety checks in TypeScript
    
    const result: SafetyResult = {
      allowed: true,
      safetyLevel: 'SAFE',
      warnings: [],
      blockedReasons: [],
      ageAppropriate: true,
      territoriallyCompliant: true,
      requiresParentalGuidance: false,
      metadata: {
        bridgeSource: request.bridgeSource,
        requestId: request.requestId,
        analysisTimestamp: new Date().toISOString()
      }
    };

    // Basic content safety checks
    await this.checkBasicContentSafety(request, result);
    
    // Age restriction checks
    if (this.config.ageVerificationRequired) {
      await this.checkAgeRestrictions(request, result);
    }
    
    // Territorial compliance checks
    if (this.config.territorialComplianceRequired) {
      await this.checkTerritorialCompliance(request, result);
    }
    
    // Cultural sensitivity checks (important per repository rules)
    await this.checkCulturalSensitivity(request, result);
    
    // Determine final allowed status
    result.allowed = result.safetyLevel !== 'BLOCKED' && 
                    result.safetyLevel !== 'TERRITORIAL_VIOLATION' &&
                    result.ageAppropriate && 
                    result.territoriallyCompliant;

    return result;
  }

  /**
   * Basic content safety checks
   */
  private async checkBasicContentSafety(request: ContentRequest, result: SafetyResult): Promise<void> {
    const content = request.content.toLowerCase();
    
    // Check for blocked keywords
    const blockedKeywords = [
      'explicit_violence', 'hate_speech', 'harassment',
      'dangerous_content', 'illegal_activities'
    ];
    
    for (const keyword of blockedKeywords) {
      if (content.includes(keyword)) {
        result.safetyLevel = 'BLOCKED';
        result.blockedReasons.push(`Contains blocked content: ${keyword}`);
        break;
      }
    }
    
    // Check for caution keywords
    const cautionKeywords = [
      'political_controversy', 'religious_debate', 
      'cultural_sensitivity', 'mature_themes'
    ];
    
    for (const keyword of cautionKeywords) {
      if (content.includes(keyword)) {
        if (result.safetyLevel === 'SAFE') {
          result.safetyLevel = 'CAUTION';
        }
        result.warnings.push(`Contains sensitive content: ${keyword}`);
      }
    }
  }

  /**
   * Age restriction checks
   */
  private async checkAgeRestrictions(request: ContentRequest, result: SafetyResult): Promise<void> {
    const userAgeGroup = request.userContext.ageGroup || 'unknown';
    const content = request.content.toLowerCase();
    
    // Age-specific content restrictions
    const ageRestrictions = {
      'child': ['violence', 'adult_themes', 'complex_politics'],
      'teen': ['explicit_violence', 'adult_content'],
      'young_adult': ['explicit_violence', 'hate_speech'],
      'adult': ['illegal_activities']
    };
    
    const restrictions = ageRestrictions[userAgeGroup as keyof typeof ageRestrictions] || [];
    
    for (const restriction of restrictions) {
      if (content.includes(restriction)) {
        result.ageAppropriate = false;
        result.blockedReasons.push(`Content not appropriate for age group: ${userAgeGroup}`);
        
        if (result.safetyLevel === 'SAFE') {
          result.safetyLevel = 'RESTRICTED';
        }
        break;
      }
    }
    
    // Check if parental guidance is required
    const parentalGuidanceKeywords = ['mature', 'complex', 'sensitive'];
    if (parentalGuidanceKeywords.some(keyword => content.includes(keyword))) {
      result.requiresParentalGuidance = true;
    }
  }

  /**
   * Territorial compliance checks (critical per repository rules)
   */
  private async checkTerritorialCompliance(request: ContentRequest, result: SafetyResult): Promise<void> {
    const jurisdiction = request.userContext.jurisdiction || 'unknown';
    const content = request.content.toLowerCase();
    
    // Territorial sensitive content (especially important per repository rules)
    const territorialSensitive = [
      'indigenous_rights', 'treaty_violations', 
      'territorial_disputes', 'sovereignty_issues'
    ];
    
    for (const sensitive of territorialSensitive) {
      if (content.includes(sensitive)) {
        // Requires special handling per repository rules
        result.warnings.push(`Contains territorially sensitive content: ${sensitive}`);
        
        // Additional analysis would be needed here
        // For now, flag as requiring caution
        if (result.safetyLevel === 'SAFE') {
          result.safetyLevel = 'CAUTION';
        }
      }
    }
    
    // Jurisdiction-specific checks
    if (jurisdiction === 'canada') {
      await this.checkCanadianCompliance(request, result);
    } else if (jurisdiction === 'indigenous_treaty') {
      await this.checkIndigenousTreatyCompliance(request, result);
    }
  }

  /**
   * Canadian territorial law compliance
   */
  private async checkCanadianCompliance(request: ContentRequest, result: SafetyResult): Promise<void> {
    const content = request.content.toLowerCase();
    
    // Protected symbols and content under Canadian law
    const protectedSymbols = [
      'indigenous_sacred', 'national_symbols', 'ceremonial_objects'
    ];
    
    for (const symbol of protectedSymbols) {
      if (content.includes(symbol)) {
        result.warnings.push(`Contains protected Canadian symbols: ${symbol}`);
        // Additional context analysis would be needed
      }
    }
    
    // Hate speech laws
    const hateKeywords = ['hate_speech', 'discrimination', 'harassment'];
    if (hateKeywords.some(keyword => content.includes(keyword))) {
      result.safetyLevel = 'BLOCKED';
      result.blockedReasons.push('Violates Canadian hate speech laws');
      result.territoriallyCompliant = false;
    }
  }

  /**
   * Indigenous treaty compliance (critical per repository rules)
   */
  private async checkIndigenousTreatyCompliance(request: ContentRequest, result: SafetyResult): Promise<void> {
    const content = request.content.toLowerCase();
    
    // Sacred and protected content under indigenous treaty law
    const sacredContent = [
      'sacred_symbols', 'ceremonial_objects', 'traditional_medicines',
      'spiritual_practices', 'ancestral_knowledge'
    ];
    
    for (const sacred of sacredContent) {
      if (content.includes(sacred)) {
        // Maximum cultural sensitivity required per repository rules
        result.safetyLevel = 'CAUTION';
        result.warnings.push(`Contains indigenous sacred content: ${sacred}`);
        result.metadata.requiresElderConsultation = true;
        result.metadata.requiresCommunityConsent = true;
      }
    }
  }

  /**
   * Cultural sensitivity checks (important per repository rules)
   */
  private async checkCulturalSensitivity(request: ContentRequest, result: SafetyResult): Promise<void> {
    const content = request.content.toLowerCase();
    
    // Cultural sensitivity keywords
    const culturalKeywords = [
      'indigenous', 'native', 'aboriginal', 'first_nations',
      'sacred', 'traditional', 'cultural', 'ceremony'
    ];
    
    const culturalContentDetected = culturalKeywords.some(keyword => content.includes(keyword));
    
    if (culturalContentDetected) {
      // Cultural content requires special handling per repository rules
      if (this.config.culturalSensitivityMode === 'maximum') {
        result.safetyLevel = 'CAUTION';
        result.warnings.push('Contains culturally sensitive material');
        result.metadata.requiresSpecialHandling = true;
      }
    }
  }

  /**
   * Extract content request from Express request
   */
  private extractContentRequest(req: Request): ContentRequest {
    return {
      content: this.extractContent(req),
      contentType: req.headers['content-type'] || 'text/plain',
      bridgeSource: this.extractBridgeSource(req),
      userContext: this.extractUserContext(req),
      requestId: req.headers['x-request-id'] as string || this.generateRequestId(),
      timestamp: new Date()
    };
  }

  /**
   * Extract content from request
   */
  private extractContent(req: Request): string {
    // Extract content from various sources
    if (req.body) {
      if (typeof req.body === 'string') {
        return req.body;
      } else if (req.body.content) {
        return req.body.content;
      } else if (req.body.query) {
        return req.body.query;
      } else {
        return JSON.stringify(req.body);
      }
    }
    
    if (req.query.q) {
      return req.query.q as string;
    }
    
    return req.url || '';
  }

  /**
   * Extract bridge source from request
   */
  private extractBridgeSource(req: Request): string {
    return req.headers['x-bridge-source'] as string || 
           req.path.split('/')[1] || 
           'unknown_bridge';
  }

  /**
   * Extract user context from request
   */
  private extractUserContext(req: Request): UserContext {
    return {
      userId: req.headers['x-user-id'] as string,
      ageGroup: req.headers['x-age-group'] as string,
      jurisdiction: req.headers['x-jurisdiction'] as string,
      parentalControlLevel: req.headers['x-parental-control'] as string,
      verificationStatus: req.headers['x-verified'] === 'true'
    };
  }

  /**
   * Generate cache key for request
   */
  private generateCacheKey(request: ContentRequest): string {
    const contentHash = this.simpleHash(request.content);
    return `${contentHash}_${request.contentType}_${request.userContext.ageGroup}_${request.userContext.jurisdiction}`;
  }

  /**
   * Simple hash function for content
   */
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  /**
   * Generate request ID
   */
  private generateRequestId(): string {
    return `safety_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Handle blocked content
   */
  private handleBlockedContent(res: Response, safetyResult: SafetyResult): void {
    res.status(403).json({
      error: 'Content blocked by safety system',
      safetyLevel: safetyResult.safetyLevel,
      warnings: safetyResult.warnings,
      blockedReasons: safetyResult.blockedReasons,
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: safetyResult.metadata.requestId
      }
    });
  }

  /**
   * Handle safety system error
   */
  private handleSafetyError(res: Response, error: any): void {
    res.status(500).json({
      error: 'Safety system error',
      message: 'Content safety analysis failed',
      metadata: {
        timestamp: new Date().toISOString(),
        error: error.message
      }
    });
  }

  /**
   * Add safety headers to response
   */
  private addSafetyHeaders(res: Response, safetyResult: SafetyResult): void {
    res.setHeader('X-Safety-Level', safetyResult.safetyLevel);
    res.setHeader('X-Age-Appropriate', safetyResult.ageAppropriate.toString());
    res.setHeader('X-Territorially-Compliant', safetyResult.territoriallyCompliant.toString());
    
    if (safetyResult.requiresParentalGuidance) {
      res.setHeader('X-Parental-Guidance-Required', 'true');
    }
    
    if (safetyResult.warnings.length > 0) {
      res.setHeader('X-Content-Warnings', safetyResult.warnings.join(', '));
    }
  }

  /**
   * Clean up old cache entries
   */
  private cleanupCache(): void {
    const now = Date.now();
    for (const [key, result] of this.requestCache.entries()) {
      if (now - (result.metadata.timestamp || 0) > this.cacheTimeout) {
        this.requestCache.delete(key);
      }
    }
  }

  /**
   * Get middleware statistics
   */
  public getStats(): Record<string, any> {
    return {
      enabled: this.config.enabled,
      cacheSize: this.requestCache.size,
      config: this.config,
      uptime: process.uptime()
    };
  }
}

/**
 * Factory function to create bridge safety middleware
 */
export function createBridgeSafetyMiddleware(config?: Partial<SafetyConfig>) {
  const middleware = new BridgeSafetyMiddleware(config);
  return middleware.middleware();
}

/**
 * Integration helper for existing bridge systems
 */
export function integrateSafetyWithBridge(bridgeApp: any, config?: Partial<SafetyConfig>) {
  const safetyMiddleware = createBridgeSafetyMiddleware(config);
  
  // Apply safety middleware to all routes
  bridgeApp.use(safetyMiddleware);
  
  // Add safety status endpoint
  bridgeApp.get('/safety/status', (req: Request, res: Response) => {
    const middleware = new BridgeSafetyMiddleware(config);
    res.json(middleware.getStats());
  });
  
  console.log('🛡️ Safety middleware integrated with bridge system');
}

export default BridgeSafetyMiddleware;
