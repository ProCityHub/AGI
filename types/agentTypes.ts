// Advanced Agent System Types
export interface AgentCapability {
  id: string;
  name: string;
  description: string;
  inputTypes: string[];
  outputTypes: string[];
  complexity: 'low' | 'medium' | 'high';
  resourceRequirements: {
    memory: number;
    cpu: number;
    gpu?: number;
  };
}

export interface AgentPersonality {
  creativity: number; // 0-1
  analytical: number; // 0-1
  collaborative: number; // 0-1
  risktaking: number; // 0-1
  empathy: number; // 0-1
}

export interface AgentMemory {
  shortTerm: Map<string, any>;
  longTerm: Map<string, any>;
  episodic: Array<{
    timestamp: number;
    event: string;
    context: any;
    outcome: any;
  }>;
  semantic: Map<string, {
    concept: string;
    relationships: string[];
    confidence: number;
  }>;
}

export interface AgentGoal {
  id: string;
  description: string;
  priority: number; // 0-1
  deadline?: number;
  subgoals: string[];
  status: 'pending' | 'active' | 'completed' | 'failed';
  progress: number; // 0-1
}

export interface AgentState {
  id: string;
  name: string;
  type: string;
  status: 'idle' | 'thinking' | 'acting' | 'learning' | 'collaborating' | 'error';
  capabilities: AgentCapability[];
  personality: AgentPersonality;
  memory: AgentMemory;
  goals: AgentGoal[];
  currentTask?: string;
  performance: {
    tasksCompleted: number;
    successRate: number;
    averageResponseTime: number;
    learningRate: number;
  };
  resources: {
    memoryUsage: number;
    cpuUsage: number;
    gpuUsage?: number;
  };
  createdAt: number;
  lastActive: number;
}

export interface AgentMessage {
  id: string;
  from: string;
  to: string | string[]; // single agent or broadcast
  type: 'request' | 'response' | 'notification' | 'collaboration' | 'emergency';
  content: any;
  priority: 'low' | 'medium' | 'high' | 'critical';
  timestamp: number;
  requiresResponse: boolean;
  metadata?: {
    taskId?: string;
    sessionId?: string;
    correlationId?: string;
  };
}

export interface AgentTask {
  id: string;
  description: string;
  type: string;
  input: any;
  expectedOutput?: any;
  assignedAgents: string[];
  status: 'queued' | 'assigned' | 'in_progress' | 'completed' | 'failed';
  priority: number;
  deadline?: number;
  dependencies: string[];
  progress: number;
  result?: any;
  error?: string;
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
}

export interface AgentCollaboration {
  id: string;
  participants: string[];
  goal: string;
  strategy: 'parallel' | 'sequential' | 'hierarchical' | 'democratic';
  status: 'forming' | 'active' | 'completed' | 'failed';
  sharedContext: any;
  decisions: Array<{
    decision: string;
    votes: Map<string, boolean>;
    timestamp: number;
  }>;
  createdAt: number;
}

export interface AgentLearningEvent {
  id: string;
  agentId: string;
  type: 'success' | 'failure' | 'feedback' | 'observation';
  context: any;
  outcome: any;
  lesson: string;
  confidence: number;
  timestamp: number;
}

export interface AgentMetrics {
  agentId: string;
  timestamp: number;
  performance: {
    responseTime: number;
    accuracy: number;
    efficiency: number;
    creativity: number;
  };
  resource_usage: {
    memory: number;
    cpu: number;
    gpu?: number;
  };
  collaboration: {
    messagesExchanged: number;
    collaborationsInitiated: number;
    collaborationsCompleted: number;
  };
  learning: {
    newConceptsLearned: number;
    skillsImproved: number;
    mistakesCorrected: number;
  };
}

export interface AgentConfiguration {
  maxConcurrentTasks: number;
  memoryLimit: number;
  learningRate: number;
  collaborationThreshold: number;
  personalityWeights: AgentPersonality;
  enabledCapabilities: string[];
  securityLevel: 'low' | 'medium' | 'high';
  auditLevel: 'minimal' | 'standard' | 'comprehensive';
}

export interface AgentRegistry {
  agents: Map<string, AgentState>;
  capabilities: Map<string, AgentCapability>;
  activeCollaborations: Map<string, AgentCollaboration>;
  taskQueue: AgentTask[];
  messageQueue: AgentMessage[];
  metrics: AgentMetrics[];
}
