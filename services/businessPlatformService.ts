import { 
  BusinessService, 
  ServiceCategory, 
  LeadCapture, 
  ServiceProvider, 
  ServiceInquiry, 
  BusinessMetrics,
  ComplianceVerification,
  RegulatoryCompliance,
  AIRecommendation,
  ConsultationBooking,
  NewsletterSubscriber,
  SERVICE_CATEGORIES
} from '../types/businessTypes';
import { getReasoningEngine } from './reasoningEngine';
import { getMultiModalService } from './multiModalService';

export class BusinessPlatformService {
  private leads: Map<string, LeadCapture> = new Map();
  private providers: Map<string, ServiceProvider> = new Map();
  private services: Map<string, BusinessService> = new Map();
  private inquiries: Map<string, ServiceInquiry> = new Map();
  private consultations: Map<string, ConsultationBooking> = new Map();
  private subscribers: Map<string, NewsletterSubscriber> = new Map();
  private verifications: Map<string, ComplianceVerification> = new Map();
  private recommendations: AIRecommendation[] = [];

  constructor() {
    this.initializeServices();
    this.initializeProviders();
  }

  // Lead Management
  async captureLeadWithEmail(leadData: Omit<LeadCapture, 'id' | 'createdAt' | 'updatedAt' | 'leadScore' | 'notes'>): Promise<string> {
    const leadId = this.generateId();
    const leadScore = await this.calculateLeadScore(leadData);
    
    const lead: LeadCapture = {
      ...leadData,
      id: leadId,
      leadScore,
      notes: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      status: 'new',
      priority: this.determinePriority(leadScore, leadData.urgency),
      consentGiven: true,
      marketingOptIn: leadData.marketingOptIn || false,
      gdprCompliant: true
    };

    this.leads.set(leadId, lead);
    
    // Trigger AI recommendations
    await this.generateLeadRecommendations(lead);
    
    // Auto-assign if configured
    await this.autoAssignLead(lead);
    
    // Send welcome email
    await this.sendWelcomeEmail(lead);
    
    console.log(`📧 New lead captured: ${lead.email} - Score: ${leadScore}`);
    return leadId;
  }

  async scheduleConsultation(leadId: string, consultationData: Omit<ConsultationBooking, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const consultationId = this.generateId();
    const consultation: ConsultationBooking = {
      ...consultationData,
      id: consultationId,
      leadId,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    this.consultations.set(consultationId, consultation);
    
    // Update lead status
    const lead = this.leads.get(leadId);
    if (lead) {
      lead.status = 'qualified';
      lead.updatedAt = Date.now();
      this.leads.set(leadId, lead);
    }

    console.log(`📅 Consultation scheduled for lead: ${leadId}`);
    return consultationId;
  }

  // Service Provider Management
  async registerServiceProvider(providerData: Omit<ServiceProvider, 'id' | 'verificationStatus' | 'verificationDate' | 'nextVerificationDue' | 'complianceScore' | 'clientReviews'>): Promise<string> {
    const providerId = this.generateId();
    const provider: ServiceProvider = {
      ...providerData,
      id: providerId,
      verificationStatus: 'pending',
      verificationDate: 0,
      nextVerificationDue: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 days
      complianceScore: 0,
      clientReviews: [],
      backgroundCheckStatus: 'pending'
    };

    this.providers.set(providerId, provider);
    
    // Start verification process
    await this.initiateProviderVerification(provider);
    
    console.log(`🏢 New service provider registered: ${provider.businessName}`);
    return providerId;
  }

  async verifyProviderLicense(providerId: string, licenseId: string): Promise<boolean> {
    const provider = this.providers.get(providerId);
    if (!provider) return false;

    const license = provider.licenses.find(l => l.id === licenseId);
    if (!license) return false;

    // Simulate license verification with regulatory body
    const isValid = await this.verifyWithRegulatoryBody(license);
    
    if (isValid) {
      license.isVerified = true;
      license.verificationDate = Date.now();
      
      // Update provider compliance score
      provider.complianceScore = this.calculateComplianceScore(provider);
      
      if (this.isProviderFullyVerified(provider)) {
        provider.verificationStatus = 'verified';
        provider.verificationDate = Date.now();
      }
      
      this.providers.set(providerId, provider);
      console.log(`✅ License verified for provider: ${provider.businessName}`);
      return true;
    }

    return false;
  }

  // Service Inquiry Management
  async createServiceInquiry(inquiryData: Omit<ServiceInquiry, 'id' | 'createdAt' | 'updatedAt' | 'complianceVerified' | 'jurisdictionVerified'>): Promise<string> {
    const inquiryId = this.generateId();
    
    // Verify service compliance and jurisdiction
    const service = this.services.get(inquiryData.serviceId);
    const lead = this.leads.get(inquiryData.leadId);
    
    if (!service || !lead) {
      throw new Error('Invalid service or lead ID');
    }

    const complianceVerified = await this.verifyServiceCompliance(service, lead);
    const jurisdictionVerified = this.verifyJurisdiction(service, lead);

    const inquiry: ServiceInquiry = {
      ...inquiryData,
      id: inquiryId,
      complianceVerified,
      jurisdictionVerified,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    this.inquiries.set(inquiryId, inquiry);
    
    // Match with qualified providers
    await this.matchProvidersToInquiry(inquiry);
    
    console.log(`📋 Service inquiry created: ${inquiryId}`);
    return inquiryId;
  }

  // AI-Powered Features
  async generateLeadRecommendations(lead: LeadCapture): Promise<AIRecommendation[]> {
    const reasoningEngine = getReasoningEngine();
    const recommendations: AIRecommendation[] = [];

    try {
      // Analyze lead data for service recommendations
      const serviceAnalysis = await reasoningEngine.reason(
        'Analyze this lead and recommend appropriate services',
        {
          leadData: lead,
          availableServices: Array.from(this.services.values()),
          marketTrends: this.getMarketTrends()
        },
        'abductive'
      );

      recommendations.push({
        id: this.generateId(),
        type: 'service',
        title: 'Recommended Services',
        description: 'AI-identified services that match this lead\'s profile',
        confidence: 0.85,
        reasoning: serviceAnalysis.steps.map(step => step.content).join('; '),
        actionItems: [
          'Send targeted service information',
          'Schedule consultation for high-value services',
          'Provide relevant case studies'
        ],
        priority: 'high',
        estimatedImpact: 'High potential for increased conversion rates and customer satisfaction',
        createdAt: Date.now()
      });

      // Lead scoring insights
      recommendations.push({
        id: this.generateId(),
        type: 'optimization',
        title: 'Lead Quality Assessment',
        description: `High-quality lead with score ${lead.leadScore}/100`,
        confidence: 0.92,
        reasoning: 'Company size indicates substantial budget; Urgency level suggests immediate need; Multiple service interests show comprehensive requirements',
        actionItems: [
          'Prioritize immediate follow-up',
          'Assign to senior consultant',
          'Prepare comprehensive proposal'
        ],
        priority: lead.leadScore > 80 ? 'high' : 'medium',
        estimatedImpact: 'Improved lead qualification and conversion optimization',
        createdAt: Date.now()
      });

      this.recommendations.push(...recommendations);
      return recommendations;
    } catch (error) {
      console.error('Failed to generate lead recommendations:', error);
      return [];
    }
  }

  async matchProvidersToInquiry(inquiry: ServiceInquiry): Promise<ServiceProvider[]> {
    const service = this.services.get(inquiry.serviceId);
    if (!service) return [];

    const qualifiedProviders = Array.from(this.providers.values()).filter(provider => {
      return (
        provider.verificationStatus === 'verified' &&
        provider.serviceCategories.includes(service.category.id) &&
        provider.complianceScore >= 80 &&
        this.checkJurisdictionMatch(provider, inquiry)
      );
    });

    // AI-powered provider ranking
    const rankedProviders = await this.rankProvidersByFit(qualifiedProviders, inquiry);
    
    console.log(`🎯 Found ${rankedProviders.length} qualified providers for inquiry ${inquiry.id}`);
    return rankedProviders;
  }

  // Analytics and Metrics
  async getBusinessMetrics(): Promise<BusinessMetrics> {
    const leads = Array.from(this.leads.values());
    const providers = Array.from(this.providers.values());
    const inquiries = Array.from(this.inquiries.values());

    const totalLeads = leads.length;
    const qualifiedLeads = leads.filter(l => l.status === 'qualified' || l.status === 'converted').length;
    const convertedLeads = leads.filter(l => l.status === 'converted').length;
    const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

    const totalRevenue = inquiries
      .filter(i => i.status === 'completed')
      .reduce((sum, i) => sum + (i.pricing.basePrice || 0), 0);

    const averageLeadValue = convertedLeads > 0 ? totalRevenue / convertedLeads : 0;

    return {
      totalLeads,
      qualifiedLeads,
      conversionRate,
      averageLeadValue,
      totalRevenue,
      verifiedProviders: providers.filter(p => p.verificationStatus === 'verified').length,
      complianceScore: this.calculateOverallComplianceScore(),
      servicePopularity: this.calculateServicePopularity(),
      leadSources: this.calculateLeadSources(),
      monthlyGrowth: this.calculateMonthlyGrowth(),
      customerSatisfaction: this.calculateCustomerSatisfaction()
    };
  }

  // Email Marketing
  async subscribeToNewsletter(email: string, preferences: Partial<NewsletterSubscriber>): Promise<string> {
    const subscriberId = this.generateId();
    const subscriber: NewsletterSubscriber = {
      id: subscriberId,
      email,
      firstName: preferences.firstName,
      lastName: preferences.lastName,
      interests: preferences.interests || [],
      subscriptionDate: Date.now(),
      isActive: true,
      source: 'website',
      preferences: {
        frequency: preferences.preferences?.frequency || 'monthly',
        topics: preferences.preferences?.topics || []
      }
    };

    this.subscribers.set(subscriberId, subscriber);
    console.log(`📧 New newsletter subscriber: ${email}`);
    return subscriberId;
  }

  // Compliance and Verification
  async initiateProviderVerification(provider: ServiceProvider): Promise<void> {
    // Verify licenses
    for (const license of provider.licenses) {
      const verificationId = this.generateId();
      const verification: ComplianceVerification = {
        id: verificationId,
        type: 'license',
        providerId: provider.id,
        verificationType: 'license',
        status: 'pending',
        verificationDate: Date.now(),
        verifiedBy: 'system',
        documentUrl: license.documentUrl
      };
      
      this.verifications.set(verificationId, verification);
    }

    // Verify insurance
    for (const insurance of provider.insurance) {
      const verificationId = this.generateId();
      const verification: ComplianceVerification = {
        id: verificationId,
        type: 'insurance',
        providerId: provider.id,
        verificationType: 'insurance',
        status: 'pending',
        verificationDate: Date.now(),
        verifiedBy: 'system',
        documentUrl: insurance.certificateUrl
      };
      
      this.verifications.set(verificationId, verification);
    }

    console.log(`🔍 Initiated verification process for provider: ${provider.businessName}`);
  }

  // Private Helper Methods
  private async calculateLeadScore(leadData: Partial<LeadCapture>): Promise<number> {
    let score = 0;

    // Company size scoring
    if (leadData.companySize) {
      const sizeScores = {
        'startup': 20,
        'small': 40,
        'medium': 70,
        'large': 90,
        'enterprise': 100
      };
      score += sizeScores[leadData.companySize as keyof typeof sizeScores] || 0;
    }

    // Budget scoring
    if (leadData.budget) {
      const budgetScores = {
        'under_10k': 20,
        '10k_50k': 50,
        '50k_100k': 70,
        '100k_500k': 85,
        'over_500k': 100
      };
      score += budgetScores[leadData.budget as keyof typeof budgetScores] || 0;
    }

    // Urgency scoring
    if (leadData.urgency) {
      const urgencyScores = {
        'immediate': 100,
        'within_month': 75,
        'within_quarter': 50,
        'planning_ahead': 25
      };
      score += urgencyScores[leadData.urgency] || 0;
    }

    // Service interest scoring
    score += Math.min(leadData.serviceInterest?.length || 0 * 10, 50);

    // Contact information completeness
    if (leadData.phone) score += 10;
    if (leadData.company) score += 10;
    if (leadData.jobTitle) score += 10;

    return Math.min(Math.round(score / 3), 100); // Normalize to 0-100
  }

  private determinePriority(leadScore: number, urgency?: string): 'low' | 'medium' | 'high' | 'urgent' {
    if (urgency === 'immediate' || leadScore >= 90) return 'urgent';
    if (leadScore >= 70) return 'high';
    if (leadScore >= 40) return 'medium';
    return 'low';
  }

  private async verifyWithRegulatoryBody(license: any): Promise<boolean> {
    // Simulate API call to regulatory body
    // In real implementation, this would make actual API calls to verify licenses
    return Math.random() > 0.1; // 90% success rate for simulation
  }

  private calculateComplianceScore(provider: ServiceProvider): number {
    let score = 0;
    let totalChecks = 0;

    // License verification
    provider.licenses.forEach(license => {
      totalChecks++;
      if (license.isVerified && license.status === 'active') {
        score += 25;
      }
    });

    // Insurance verification
    provider.insurance.forEach(insurance => {
      totalChecks++;
      if (insurance.isVerified && insurance.expirationDate > Date.now()) {
        score += 20;
      }
    });

    // Background check
    totalChecks++;
    if (provider.backgroundCheckStatus === 'cleared') {
      score += 15;
    }

    // Years in business
    totalChecks++;
    if (provider.yearsInBusiness >= 5) {
      score += 10;
    } else if (provider.yearsInBusiness >= 2) {
      score += 5;
    }

    return totalChecks > 0 ? Math.round(score / totalChecks * 4) : 0; // Normalize to 0-100
  }

  private isProviderFullyVerified(provider: ServiceProvider): boolean {
    const hasValidLicense = provider.licenses.some(l => l.isVerified && l.status === 'active');
    const hasValidInsurance = provider.insurance.some(i => i.isVerified && i.expirationDate > Date.now());
    const backgroundCleared = provider.backgroundCheckStatus === 'cleared';
    
    return hasValidLicense && hasValidInsurance && backgroundCleared;
  }

  private async verifyServiceCompliance(service: BusinessService, lead: LeadCapture): Promise<boolean> {
    // Check if service requires special compliance based on lead location/type
    return service.complianceLevel !== 'government' || lead.company !== undefined;
  }

  private verifyJurisdiction(service: BusinessService, lead: LeadCapture): boolean {
    // In real implementation, would check lead's location against service jurisdictions
    return service.jurisdictions.length === 0 || service.jurisdictions.includes('US');
  }

  private checkJurisdictionMatch(provider: ServiceProvider, inquiry: ServiceInquiry): boolean {
    // Check if provider can serve in the required jurisdiction
    return provider.jurisdictions.length === 0 || provider.jurisdictions.includes('US');
  }

  private async rankProvidersByFit(providers: ServiceProvider[], inquiry: ServiceInquiry): Promise<ServiceProvider[]> {
    // AI-powered ranking based on multiple factors
    return providers.sort((a, b) => {
      const scoreA = this.calculateProviderFitScore(a, inquiry);
      const scoreB = this.calculateProviderFitScore(b, inquiry);
      return scoreB - scoreA;
    });
  }

  private calculateProviderFitScore(provider: ServiceProvider, inquiry: ServiceInquiry): number {
    let score = 0;
    
    // Compliance score weight
    score += provider.complianceScore * 0.4;
    
    // Experience weight
    score += Math.min(provider.yearsInBusiness * 2, 20) * 0.3;
    
    // Client reviews weight
    const avgRating = provider.clientReviews.reduce((sum, review) => sum + review.rating, 0) / provider.clientReviews.length || 0;
    score += avgRating * 4 * 0.3; // Convert 5-star to 20-point scale
    
    return score;
  }

  private calculateServicePopularity(): Array<{ serviceId: string; inquiries: number; conversions: number; averageValue: number }> {
    const serviceStats = new Map<string, { inquiries: number; conversions: number; totalValue: number }>();
    
    Array.from(this.inquiries.values()).forEach(inquiry => {
      const stats = serviceStats.get(inquiry.serviceId) || { inquiries: 0, conversions: 0, totalValue: 0 };
      stats.inquiries++;
      
      if (inquiry.status === 'completed') {
        stats.conversions++;
        stats.totalValue += inquiry.pricing.basePrice || 0;
      }
      
      serviceStats.set(inquiry.serviceId, stats);
    });

    return Array.from(serviceStats.entries()).map(([serviceId, stats]) => ({
      serviceId,
      inquiries: stats.inquiries,
      conversions: stats.conversions,
      averageValue: stats.conversions > 0 ? stats.totalValue / stats.conversions : 0
    }));
  }

  private calculateLeadSources(): Array<{ source: string; count: number; percentage: number; conversionRate: number }> {
    const sources = new Map<string, { count: number; conversions: number }>();
    const totalLeads = this.leads.size;
    
    Array.from(this.leads.values()).forEach(lead => {
      const sourceStats = sources.get(lead.source) || { count: 0, conversions: 0 };
      sourceStats.count++;
      
      if (lead.status === 'converted') {
        sourceStats.conversions++;
      }
      
      sources.set(lead.source, sourceStats);
    });

    return Array.from(sources.entries()).map(([source, stats]) => ({
      source,
      count: stats.count,
      percentage: totalLeads > 0 ? (stats.count / totalLeads) * 100 : 0,
      conversionRate: stats.count > 0 ? (stats.conversions / stats.count) * 100 : 0
    }));
  }

  private calculateProviderMetrics(): Array<{ providerId: string; completedServices: number; averageRating: number; complianceScore: number }> {
    return Array.from(this.providers.values()).map(provider => ({
      providerId: provider.id,
      completedServices: Array.from(this.inquiries.values()).filter(i => i.providerId === provider.id && i.status === 'completed').length,
      averageRating: provider.clientReviews.reduce((sum, review) => sum + review.rating, 0) / provider.clientReviews.length || 0,
      complianceScore: provider.complianceScore
    }));
  }

  private calculateOverallComplianceScore(): number {
    const providers = Array.from(this.providers.values());
    if (providers.length === 0) return 100;
    
    const totalScore = providers.reduce((sum, provider) => sum + provider.complianceScore, 0);
    return Math.round(totalScore / providers.length);
  }

  private calculateMonthlyGrowth(): number {
    // Simulate monthly growth calculation
    return Math.random() * 20 + 5; // 5-25% growth
  }

  private calculateCustomerSatisfaction(): number {
    const allReviews = Array.from(this.providers.values()).flatMap(p => p.clientReviews);
    if (allReviews.length === 0) return 0;
    
    const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0);
    return Math.round((totalRating / allReviews.length) * 20); // Convert to 100-point scale
  }

  private calculateRegulatoryCompliance(): number {
    const verifiedProviders = Array.from(this.providers.values()).filter(p => p.verificationStatus === 'verified').length;
    const totalProviders = this.providers.size;
    
    return totalProviders > 0 ? Math.round((verifiedProviders / totalProviders) * 100) : 100;
  }

  private getMarketTrends(): any {
    // Mock market trends data
    return {
      growingServices: ['tax_services', 'digital_marketing', 'cybersecurity'],
      seasonalDemand: {
        'tax_services': 'Q1',
        'accounting_services': 'Q4',
        'legal_services': 'year_round'
      }
    };
  }

  private async autoAssignLead(lead: LeadCapture): Promise<void> {
    // Auto-assign high-priority leads
    if (lead.priority === 'urgent' || lead.priority === 'high') {
      lead.assignedTo = 'senior_consultant';
      lead.nextFollowUp = Date.now() + (2 * 60 * 60 * 1000); // 2 hours
      this.leads.set(lead.id, lead);
    }
  }

  private async sendWelcomeEmail(lead: LeadCapture): Promise<void> {
    // Simulate sending welcome email
    console.log(`📧 Welcome email sent to: ${lead.email}`);
  }

  private initializeServices(): void {
    // Initialize with comprehensive service catalog
    Object.values(SERVICE_CATEGORIES).forEach(category => {
      category.services.forEach(serviceId => {
        const service: BusinessService = {
          id: serviceId,
          name: this.formatServiceName(serviceId),
          category: category as any,
          description: `Professional ${this.formatServiceName(serviceId)} services`,
          shortDescription: `Expert ${this.formatServiceName(serviceId)}`,
          icon: category.icon,
          features: ['Professional Service', 'Licensed Providers', 'Compliance Guaranteed'],
          pricing: {
            type: 'consultation',
            basePrice: 0,
            currency: 'USD',
            consultationFee: 150,
            paymentTerms: 'Net 30',
            refundPolicy: 'Satisfaction guaranteed'
          },
          isPopular: Math.random() > 0.7,
          estimatedTime: '1-2 weeks',
          requirements: ['Initial consultation', 'Document review'],
          benefits: ['Expert guidance', 'Compliance assurance', 'Risk mitigation'],
          processSteps: [
            {
              id: '1',
              title: 'Initial Consultation',
              description: 'Discuss your needs and requirements',
              estimatedTime: '1 hour'
            },
            {
              id: '2',
              title: 'Service Delivery',
              description: 'Professional service execution',
              estimatedTime: '1-2 weeks'
            }
          ],
          legalRequirements: [],
          complianceLevel: category.isRegulated ? 'professional' : 'basic',
          jurisdictions: ['US']
        };
        
        this.services.set(serviceId, service);
      });
    });
  }

  private initializeProviders(): void {
    // Initialize with sample verified providers
    const sampleProvider: ServiceProvider = {
      id: this.generateId(),
      type: 'firm',
      businessName: 'ProCity Professional Services',
      legalName: 'ProCity Professional Services LLC',
      taxId: '12-3456789',
      licenses: [],
      certifications: [],
      insurance: [],
      bonds: [],
      verificationStatus: 'verified',
      verificationDate: Date.now(),
      nextVerificationDue: Date.now() + (365 * 24 * 60 * 60 * 1000),
      serviceCategories: ['tax_services', 'accounting_services', 'legal_services'],
      jurisdictions: ['US'],
      yearsInBusiness: 10,
      clientReviews: [],
      complianceScore: 95,
      backgroundCheckStatus: 'cleared'
    };
    
    this.providers.set(sampleProvider.id, sampleProvider);
  }

  private formatServiceName(serviceId: string): string {
    return serviceId.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  private generateId(): string {
    return `biz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Public Getters
  getAllLeads(): LeadCapture[] {
    return Array.from(this.leads.values());
  }

  getAllProviders(): ServiceProvider[] {
    return Array.from(this.providers.values());
  }

  getAllServices(): BusinessService[] {
    return Array.from(this.services.values());
  }

  getServicesByCategory(categoryId: string): BusinessService[] {
    return Array.from(this.services.values()).filter(service => 
      service.category.id === categoryId
    );
  }

  getLead(leadId: string): LeadCapture | undefined {
    return this.leads.get(leadId);
  }

  getProvider(providerId: string): ServiceProvider | undefined {
    return this.providers.get(providerId);
  }

  getService(serviceId: string): BusinessService | undefined {
    return this.services.get(serviceId);
  }
}

// Singleton instance
let businessPlatformServiceInstance: BusinessPlatformService | null = null;

export function getBusinessPlatformService(): BusinessPlatformService {
  if (!businessPlatformServiceInstance) {
    businessPlatformServiceInstance = new BusinessPlatformService();
  }
  return businessPlatformServiceInstance;
}

export function initializeBusinessPlatformService(): BusinessPlatformService {
  businessPlatformServiceInstance = new BusinessPlatformService();
  return businessPlatformServiceInstance;
}
