// Comprehensive Business Platform Types with Legal Compliance
export interface BusinessService {
  id: string;
  name: string;
  category: ServiceCategory;
  description: string;
  shortDescription: string;
  icon: string;
  features: string[];
  pricing: ServicePricing;
  isPopular: boolean;
  estimatedTime: string;
  requirements: string[];
  benefits: string[];
  processSteps: ProcessStep[];
  legalRequirements: LegalRequirement[];
  complianceLevel: 'basic' | 'professional' | 'expert' | 'government';
  jurisdictions: string[]; // States/countries where service is available
}

export interface LegalRequirement {
  id: string;
  type: 'license' | 'certification' | 'insurance' | 'bond' | 'registration';
  name: string;
  description: string;
  issuingAuthority: string;
  validationRequired: boolean;
  renewalPeriod: string;
  minimumExperience?: string;
  educationRequirements?: string[];
  examRequirements?: string[];
}

export interface ServiceProvider {
  id: string;
  type: 'individual' | 'firm' | 'corporation' | 'government_agency';
  businessName: string;
  legalName: string;
  taxId: string;
  licenses: ProviderLicense[];
  certifications: ProviderCertification[];
  insurance: InsurancePolicy[];
  bonds: SuretyBond[];
  verificationStatus: 'pending' | 'verified' | 'suspended' | 'revoked';
  verificationDate: number;
  nextVerificationDue: number;
  serviceCategories: string[];
  jurisdictions: string[];
  yearsInBusiness: number;
  clientReviews: ClientReview[];
  complianceScore: number;
  backgroundCheckStatus: 'pending' | 'cleared' | 'flagged';
}

export interface ProviderLicense {
  id: string;
  licenseNumber: string;
  type: string;
  issuingState: string;
  issuingAuthority: string;
  issueDate: number;
  expirationDate: number;
  status: 'active' | 'expired' | 'suspended' | 'revoked';
  verificationUrl?: string;
  documentUrl: string;
  isVerified: boolean;
  verificationDate: number;
}

export interface ProviderCertification {
  id: string;
  certificationName: string;
  issuingOrganization: string;
  certificationNumber: string;
  issueDate: number;
  expirationDate?: number;
  status: 'active' | 'expired' | 'suspended';
  continuingEducationRequired: boolean;
  documentUrl: string;
  isVerified: boolean;
}

export interface InsurancePolicy {
  id: string;
  type: 'general_liability' | 'professional_liability' | 'errors_omissions' | 'cyber_liability';
  carrier: string;
  policyNumber: string;
  coverageAmount: number;
  effectiveDate: number;
  expirationDate: number;
  certificateUrl: string;
  isVerified: boolean;
}

export interface SuretyBond {
  id: string;
  bondType: string;
  bondAmount: number;
  bondNumber: string;
  surety: string;
  effectiveDate: number;
  expirationDate: number;
  certificateUrl: string;
  isVerified: boolean;
}

export interface ClientReview {
  id: string;
  clientName: string;
  rating: number;
  content: string;
  serviceUsed: string;
  isVerified: boolean;
  createdAt: number;
}

export interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  services: string[];
  regulatoryBody?: string;
  complianceRequirements: LegalRequirement[];
  isRegulated: boolean;
  parentCategory?: string;
  subCategories: string[];
}

// Professional Service Categories with Legal Requirements
export const SERVICE_CATEGORIES = {
  TAX_SERVICES: {
    id: 'tax_services',
    name: 'Tax Services',
    description: 'Professional tax preparation, planning, and compliance services',
    icon: '📊',
    color: '#10B981',
    regulatoryBody: 'IRS',
    isRegulated: true,
    services: [
      'individual_tax_prep',
      'business_tax_prep',
      'tax_planning',
      'irs_representation',
      'payroll_tax',
      'sales_tax',
      'international_tax'
    ]
  },
  LEGAL_SERVICES: {
    id: 'legal_services',
    name: 'Legal Services',
    description: 'Licensed attorney services for business and personal legal matters',
    icon: '⚖️',
    color: '#3B82F6',
    regulatoryBody: 'State Bar Association',
    isRegulated: true,
    services: [
      'business_formation',
      'contract_law',
      'intellectual_property',
      'employment_law',
      'real_estate_law',
      'family_law',
      'criminal_defense',
      'immigration_law'
    ]
  },
  ACCOUNTING_SERVICES: {
    id: 'accounting_services',
    name: 'Accounting Services',
    description: 'CPA and professional accounting services',
    icon: '🧮',
    color: '#8B5CF6',
    regulatoryBody: 'State Board of Accountancy',
    isRegulated: true,
    services: [
      'bookkeeping',
      'financial_statements',
      'auditing',
      'forensic_accounting',
      'business_valuation',
      'cfo_services',
      'quickbooks_setup'
    ]
  },
  GOVERNMENT_SERVICES: {
    id: 'government_services',
    name: 'Government Services',
    description: 'Official government agency services and compliance assistance',
    icon: '🏛️',
    color: '#DC2626',
    regulatoryBody: 'Various Government Agencies',
    isRegulated: true,
    services: [
      'business_licensing',
      'permit_assistance',
      'regulatory_compliance',
      'government_contracting',
      'grant_applications',
      'zoning_assistance',
      'environmental_compliance'
    ]
  },
  FINANCIAL_SERVICES: {
    id: 'financial_services',
    name: 'Financial Services',
    description: 'Licensed financial planning and investment services',
    icon: '💰',
    color: '#F59E0B',
    regulatoryBody: 'SEC/FINRA',
    isRegulated: true,
    services: [
      'financial_planning',
      'investment_advisory',
      'retirement_planning',
      'insurance_services',
      'estate_planning',
      'business_loans',
      'merchant_services'
    ]
  },
  CONSULTING_SERVICES: {
    id: 'consulting_services',
    name: 'Business Consulting',
    description: 'Professional business consulting and advisory services',
    icon: '💼',
    color: '#6366F1',
    regulatoryBody: 'Industry Associations',
    isRegulated: false,
    services: [
      'business_strategy',
      'operations_consulting',
      'hr_consulting',
      'marketing_consulting',
      'it_consulting',
      'management_consulting',
      'startup_consulting'
    ]
  },
  REAL_ESTATE_SERVICES: {
    id: 'real_estate_services',
    name: 'Real Estate Services',
    description: 'Licensed real estate and property services',
    icon: '🏠',
    color: '#059669',
    regulatoryBody: 'State Real Estate Commission',
    isRegulated: true,
    services: [
      'residential_sales',
      'commercial_sales',
      'property_management',
      'real_estate_appraisal',
      'property_development',
      'real_estate_law',
      'mortgage_services'
    ]
  },
  HEALTHCARE_SERVICES: {
    id: 'healthcare_services',
    name: 'Healthcare Services',
    description: 'Licensed healthcare and medical services',
    icon: '🏥',
    color: '#EF4444',
    regulatoryBody: 'State Medical Board',
    isRegulated: true,
    services: [
      'telemedicine',
      'medical_consulting',
      'healthcare_compliance',
      'medical_billing',
      'healthcare_it',
      'clinical_research',
      'medical_device_consulting'
    ]
  }
};

export interface ServicePricing {
  type: 'fixed' | 'hourly' | 'package' | 'consultation';
  basePrice: number;
  currency: string;
  packages?: PricingPackage[];
  hourlyRate?: number;
  consultationFee?: number;
}

export interface PricingPackage {
  id: string;
  name: string;
  price: number;
  features: string[];
  isPopular: boolean;
  savings?: string;
}

export interface ProcessStep {
  id: string;
  title: string;
  description: string;
  estimatedTime: string;
  requirements?: string[];
}

export interface LeadCapture {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  company?: string;
  serviceInterest: string[];
  message?: string;
  source: 'website' | 'consultation' | 'service_inquiry' | 'newsletter';
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'closed';
  priority: 'low' | 'medium' | 'high';
  createdAt: number;
  updatedAt: number;
  notes: LeadNote[];
  estimatedValue?: number;
}

export interface LeadNote {
  id: string;
  content: string;
  author: string;
  createdAt: number;
  type: 'call' | 'email' | 'meeting' | 'note';
}

export interface ServiceInquiry {
  id: string;
  leadId: string;
  serviceId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  requestedDate?: number;
  estimatedCompletion?: number;
  actualCompletion?: number;
  requirements: string[];
  documents: InquiryDocument[];
  communications: InquiryCommunication[];
  pricing: ServicePricing;
  createdAt: number;
  updatedAt: number;
}

export interface InquiryDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: number;
  url: string;
  isRequired: boolean;
}

export interface InquiryCommunication {
  id: string;
  type: 'email' | 'call' | 'meeting' | 'message';
  direction: 'inbound' | 'outbound';
  subject?: string;
  content: string;
  timestamp: number;
  author: string;
}

export interface BusinessMetrics {
  totalLeads: number;
  qualifiedLeads: number;
  conversionRate: number;
  averageLeadValue: number;
  totalRevenue: number;
  servicePopularity: Array<{
    serviceId: string;
    inquiries: number;
    conversions: number;
  }>;
  leadSources: Array<{
    source: string;
    count: number;
    percentage: number;
  }>;
  monthlyGrowth: number;
  customerSatisfaction: number;
}

export interface ConsultationBooking {
  id: string;
  leadId: string;
  serviceCategories: string[];
  preferredDate: number;
  preferredTime: string;
  duration: number; // minutes
  type: 'phone' | 'video' | 'in_person';
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled';
  meetingLink?: string;
  location?: string;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  interests: string[];
  subscriptionDate: number;
  isActive: boolean;
  source: string;
  preferences: {
    frequency: 'weekly' | 'monthly' | 'quarterly';
    topics: string[];
  };
}

export interface BusinessContent {
  id: string;
  type: 'blog' | 'case_study' | 'whitepaper' | 'guide' | 'news';
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  publishedAt: number;
  updatedAt: number;
  tags: string[];
  category: string;
  isPublished: boolean;
  seoTitle: string;
  seoDescription: string;
  featuredImage?: string;
  readTime: number;
  views: number;
}

export interface Testimonial {
  id: string;
  clientName: string;
  clientTitle?: string;
  clientCompany?: string;
  serviceUsed: string;
  rating: number;
  content: string;
  isVerified: boolean;
  isFeatured: boolean;
  createdAt: number;
  clientImage?: string;
}

export interface BusinessSettings {
  companyInfo: {
    name: string;
    tagline: string;
    description: string;
    logo: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    socialMedia: {
      linkedin?: string;
      twitter?: string;
      facebook?: string;
      instagram?: string;
    };
  };
  businessHours: {
    monday: { open: string; close: string; isOpen: boolean };
    tuesday: { open: string; close: string; isOpen: boolean };
    wednesday: { open: string; close: string; isOpen: boolean };
    thursday: { open: string; close: string; isOpen: boolean };
    friday: { open: string; close: string; isOpen: boolean };
    saturday: { open: string; close: string; isOpen: boolean };
    sunday: { open: string; close: string; isOpen: boolean };
  };
  emailSettings: {
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPassword: string;
    fromEmail: string;
    fromName: string;
  };
  integrations: {
    googleAnalytics?: string;
    facebookPixel?: string;
    linkedinInsight?: string;
    hubspot?: string;
    salesforce?: string;
  };
  leadSettings: {
    autoResponder: boolean;
    leadAssignment: 'round_robin' | 'manual' | 'ai_based';
    followUpSchedule: number[]; // Days after initial contact
    qualificationCriteria: {
      minimumBudget?: number;
      requiredFields: string[];
      scoringRules: Array<{
        field: string;
        value: string;
        score: number;
      }>;
    };
  };
}
