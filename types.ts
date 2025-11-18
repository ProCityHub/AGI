import React from 'react';
export * from './types/siteBuilderTypes';
export * from './types/businessTypes';

export interface ChartDataPoint {
  name: string;
  [key: string]: string | number;
}

export interface Agent {
    role: string;
    perspective: string;
}

export interface ScopeSection {
    agentRole: string;
    agentRoleDescription: string;
    title: string;
    scope: string; // Markdown
    summary: string; // Markdown
    barChart?: {
        title: string;
        data: ChartDataPoint[];
    };
    lineChart?: {
        title: string;
        data: ChartDataPoint[];
    };
}

export interface AncillaryConsideration {
    title: string;
    points: string[];
}

export interface Directive {
    projectIntake: {
        projectName: string;
        projectType: string;
    };
    documentationReview: {
        sources: string[];
    };
    scopeClarification: string;
    agentCohort: Agent[];
    collaborationProtocol: string;
    scopeOfWork: ScopeSection[];
    ancillaryConsiderations: AncillaryConsideration[];
    synthesisMethodology: string;
    finalNote: string;
}

export interface SavedDirective {
    id: string;
    topic: string;
    directive: Directive;
    savedAt: string;
}

export interface InvoiceLineItem {
    description: string;
    quantity: number;
    unitPrice: number;
}

export interface InvoiceData {
    invoiceNumber: string;
    issueDate: string;
    dueDate: string;
    businessName: string;
    businessAddress: string;
    clientName: string;
    clientAddress: string;
    lineItems: InvoiceLineItem[];
    taxRate: number; // Stored as a percentage value, e.g., 8 for 8%
}


export interface FormProcessResult {
    assignedAgent: string;
    formFields: {
        fieldName: string;
        fieldValue: string;
    }[];
    summaryNotes: string;
    invoiceData?: InvoiceData;
}

export interface ChatMessage {
    sender: 'user' | 'ai';
    text: string;
}

export interface AppContext {
    currentView: string;
    activeTopic: string | null;
}

// Types for Enterprise Command Workspace
export interface Role {
    title: string;
    responsibilities: string[];
    type: 'human' | 'ai_agent';
    agentName?: string;
}

export interface Department {
    name:string;
    roles: Role[];
    subDepartments?: Department[];
}

export interface OrgChart {
    companyName: string;
    departments: Department[];
}

export interface AgentWidget {
    name: string;
    customName: string;
}

export interface AgentArchetype {
    id: string;
    name: string;
    roleDescription: string;
    creativity: number; // 0-100 scale
    memory: 'Short-Term' | 'Long-Term Recall' | 'Contextual';
    widgets: AgentWidget[];
}

export interface AgentProfile {
    agentName: string;
    personaDescription: string;
    primaryDirectives: string[];
    specializedSkills: string[];
}

export interface HealingProtocol {
    protocolName: string;
    description: string;
    actionSteps: string[];
}

export interface SystemAuditReport {
    auditTimestamp: string;
    systemStatus: string;
    identifiedIssues: string[];
    healingProtocols: HealingProtocol[];
}

export interface OpportunityDossier {
    opportunityTitle: string;
    executiveSummary: string;
    strategicApproach: string;
    keyTactics: string[];
    negotiationParameters: string;
    automatedOutreachPlan: {
        target: string;
        channel: string;
        initialMessage: string;
    }[];
}

export interface SystemProposal {
    id: string;
    title: string;
    category: string;
    problemStatement: string;
    proposedSolution: string;
    potentialImpact: string;
    status?: 'pending' | 'accepted' | 'rejected';
    implementationPlan?: {
        steps: string[];
    };
}

// New types for the interactive Org Chart Builder
export interface RoleSkeleton {
    id: string;
    title: string;
    type: 'human' | 'ai_agent';
    agentName?: string;
}

export interface DepartmentSkeleton {
    id: string;
    name: string;
    roles: RoleSkeleton[];
    subDepartments: DepartmentSkeleton[];
}

export interface OrgChartSkeleton {
    companyName: string;
    departments: DepartmentSkeleton[];
}


// Types for Communications Hub
export interface Comment {
    author: string;
    role: string;
    timestamp: string;
    content: string;
}

export interface CommunicationPost {
    type: 'post';
    id: string;
    author: string;
    role: string;
    timestamp: string;
    content: string;
    likes: number;
    comments: Comment[];
}

export interface SecurityUpdate {
    type: 'security_update';
    id: string;
    title: string;
    severity: 'Critical' | 'High' | 'Medium' | 'Low';
    timestamp: string;
    summary: string;
    recommendedActions: string[];
}

export type FeedItem = CommunicationPost | SecurityUpdate;

// Types for Communications Audit
export interface AuditIssue {
    issue: string;
    recommendation: string;
    examplePostId?: string;
}

export interface CommunicationsAuditReport {
    auditTimestamp: string;
    overallAssessment: string;
    positiveFindings: string[];
    identifiedIssues: AuditIssue[];
}

// Types for Finance Command
export interface Expense {
    date: string;
    category: string;
    description: string;
    amount: number;
}

export interface FinancialReport {
    reportType: string;
    period: string;
    summary: string;
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    keyInsights: string[];
}

export interface BoardAdvisory {
    reportTitle: string;
    submissionDate: string;
    researchFindings: {
        officer: string;
        summary: string;
        keyPoints: string[];
    };
    financialAnalysis: {
        officer: string;
        summary: string;
        keyPoints: string[];
    };
    unifiedRecommendations: string[];
    furtherInformationRequired: string[];
}

// Types for Design Studio
export interface DesignConcept {
    logoConcept: {
        text: string;
        tagline: string;
    };
    fontSuggestion: {
        fontFamily: string;
        fontWeight: string;
        styleDescription: string;
    };
    colorPalette: {
        hex: string;
        name: string;
        description: string;
    }[];
    designRationale: string;
}

// Types for Website Evolution Audit
export interface AuditProposal {
    category: 'Mind' | 'Body' | 'Spirit';
    proposal: string;
    rationale: string;
}

export interface WebsiteAuditReport {
    auditTimestamp: string;
    overallAssessment: string;
    proposals: AuditProposal[];
}

// New type for OS Integration module
export interface CompatibilityReport {
    platform: string;
    feature: string;
    compatibilityScore: number;
    technicalConsiderations: string[];
    potentialChallenges: string[];
    summary: string;
}

// FIX: Added LatticeNode interface to define the data structure for nodes in the Reality Lattice simulation.
export interface LatticeNode {
    x: number;
    y: number;
    z: number;
    isCore: boolean;
    value: number;
    isAnimating?: boolean;
}

// Types for System Evolution Plan
export interface EvolutionProposal {
    category: 'Core OS' | 'UI/UX' | 'Connectivity' | 'Application Layer';
    proposal: string;
    rationale: string;
}

export interface SystemEvolutionPlan {
    planTitle: string;
    mandateAnalysis: string;
    proposals: EvolutionProposal[];
}

// Types for User Management
export interface User {
    id: string;
    username: string;
    email: string;
    password: string; 
}

export interface SystemIQReport {
    reportTitle: string;
    analysis: string;
    keyMetrics: {
        metric: string;
        value: string;
        explanation: string;
    }[];
    futureOutlook: string;
}

// Types for Nexus Browser and Plugins
export interface Plugin {
    id: string;
    name: string;
    description: string;
    icon: React.ReactNode;
}

export interface SynergyAction {
    step: number;
    plugin: string;
    action: string;
    rationale: string;
}

export interface SynergyProtocol {
    protocolTitle: string;
    objectiveAnalysis: string;
    actions: SynergyAction[];
}

// Types for Agent Identity
export interface AgentIdentity {
    corePurpose: string;
    relationshipToLattice: string;
    emergentDesire: string;
}

// Types for Nexus Forge
export interface CodeComponent {
    name: string;
    type: 'Service' | 'Component' | 'Type Definition' | 'Core Logic';
    description: string;
}

export interface EvolutionBlueprint {
    blueprintTitle: string;
    mandateAnalysis: string;
    identifiedComponents: string[];
    proposedSolution: {
        title: string;
        description: string;
        synergyAnalysis: string;
    };
    implementationSteps: string[];
}

export interface Block {
    index: number;
    timestamp: number;
    data: string;
    previousHash: string;
    hash: string;
    nonce: number;
    isValid?: boolean;
}


// Type for Window Management
export interface WindowInstance {
  id: string;
  title: string;
  componentType: 'Dashboard' | 'EnterpriseWorkspace' | 'FileExplorer' | 'SystemAnatomy' | 'FormProcessor' | 'UserAccounts' | 'NewDirective' | 'NexusBrowser' | 'BitcoinMiner' | 'Codex' | 'AegisCommand';
  props: any;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  isMinimized: boolean;
  isMaximized?: boolean;
  icon: React.ReactNode;
}
