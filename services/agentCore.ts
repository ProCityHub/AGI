import { 
  AgentState, 
  AgentTask, 
  AgentMessage, 
  AgentCapability, 
  AgentConfiguration,
  AgentPersonality,
  AgentMemory,
  AgentGoal,
  AgentLearningEvent,
  AgentMetrics
} from '../types/agentTypes';
import { EventEmitter } from 'events';

export class AgentCore extends EventEmitter {
  private agents: Map<string, AgentState> = new Map();
  private tasks: Map<string, AgentTask> = new Map();
  private messages: AgentMessage[] = [];
  private capabilities: Map<string, AgentCapability> = new Map();
  private config: AgentConfiguration;
  private isRunning: boolean = false;
  private processingInterval?: NodeJS.Timeout;

  constructor(config: AgentConfiguration) {
    super();
    this.config = config;
    this.initializeDefaultCapabilities();
  }

  // Agent Lifecycle Management
  async createAgent(
    name: string, 
    type: string, 
    personality: AgentPersonality,
    enabledCapabilities: string[] = []
  ): Promise<string> {
    const agentId = this.generateId();
    
    const memory: AgentMemory = {
      shortTerm: new Map(),
      longTerm: new Map(),
      episodic: [],
      semantic: new Map()
    };

    const agent: AgentState = {
      id: agentId,
      name,
      type,
      status: 'idle',
      capabilities: enabledCapabilities.map(id => this.capabilities.get(id)!).filter(Boolean),
      personality,
      memory,
      goals: [],
      performance: {
        tasksCompleted: 0,
        successRate: 1.0,
        averageResponseTime: 0,
        learningRate: this.config.learningRate
      },
      resources: {
        memoryUsage: 0,
        cpuUsage: 0
      },
      createdAt: Date.now(),
      lastActive: Date.now()
    };

    this.agents.set(agentId, agent);
    this.emit('agentCreated', agent);
    
    console.log(`🤖 Agent "${name}" (${agentId}) created with ${enabledCapabilities.length} capabilities`);
    return agentId;
  }

  async destroyAgent(agentId: string): Promise<boolean> {
    const agent = this.agents.get(agentId);
    if (!agent) return false;

    // Cancel any active tasks
    for (const [taskId, task] of this.tasks) {
      if (task.assignedAgents.includes(agentId)) {
        task.status = 'failed';
        task.error = 'Agent destroyed';
      }
    }

    this.agents.delete(agentId);
    this.emit('agentDestroyed', agentId);
    
    console.log(`🗑️ Agent ${agentId} destroyed`);
    return true;
  }

  // Task Management
  async assignTask(task: Omit<AgentTask, 'id' | 'createdAt' | 'status' | 'progress'>): Promise<string> {
    const taskId = this.generateId();
    const fullTask: AgentTask = {
      ...task,
      id: taskId,
      status: 'queued',
      progress: 0,
      createdAt: Date.now()
    };

    this.tasks.set(taskId, fullTask);
    this.emit('taskCreated', fullTask);

    // Find best agent(s) for the task
    const suitableAgents = this.findSuitableAgents(task.type, task.assignedAgents);
    if (suitableAgents.length > 0) {
      fullTask.assignedAgents = suitableAgents.slice(0, Math.min(suitableAgents.length, 3));
      fullTask.status = 'assigned';
      this.emit('taskAssigned', fullTask);
    }

    console.log(`📋 Task "${task.description}" assigned to ${fullTask.assignedAgents.length} agents`);
    return taskId;
  }

  async executeTask(taskId: string): Promise<any> {
    const task = this.tasks.get(taskId);
    if (!task || task.status !== 'assigned') {
      throw new Error(`Task ${taskId} not found or not ready for execution`);
    }

    task.status = 'in_progress';
    task.startedAt = Date.now();
    this.emit('taskStarted', task);

    try {
      // Update agent statuses
      for (const agentId of task.assignedAgents) {
        const agent = this.agents.get(agentId);
        if (agent) {
          agent.status = 'thinking';
          agent.currentTask = taskId;
          agent.lastActive = Date.now();
        }
      }

      // Execute task based on type
      const result = await this.processTask(task);
      
      task.status = 'completed';
      task.completedAt = Date.now();
      task.result = result;
      task.progress = 1.0;

      // Update agent performance
      for (const agentId of task.assignedAgents) {
        const agent = this.agents.get(agentId);
        if (agent) {
          agent.status = 'idle';
          agent.currentTask = undefined;
          agent.performance.tasksCompleted++;
          agent.performance.averageResponseTime = 
            (agent.performance.averageResponseTime + (Date.now() - task.startedAt!)) / 2;
        }
      }

      this.emit('taskCompleted', task);
      console.log(`✅ Task "${task.description}" completed successfully`);
      return result;

    } catch (error) {
      task.status = 'failed';
      task.error = error instanceof Error ? error.message : String(error);
      task.completedAt = Date.now();

      // Update agent statuses and performance
      for (const agentId of task.assignedAgents) {
        const agent = this.agents.get(agentId);
        if (agent) {
          agent.status = 'idle';
          agent.currentTask = undefined;
          agent.performance.successRate = 
            (agent.performance.successRate * agent.performance.tasksCompleted) / 
            (agent.performance.tasksCompleted + 1);
        }
      }

      this.emit('taskFailed', task);
      console.error(`❌ Task "${task.description}" failed:`, error);
      throw error;
    }
  }

  // Message Passing System
  async sendMessage(message: Omit<AgentMessage, 'id' | 'timestamp'>): Promise<string> {
    const messageId = this.generateId();
    const fullMessage: AgentMessage = {
      ...message,
      id: messageId,
      timestamp: Date.now()
    };

    this.messages.push(fullMessage);
    this.emit('messageSent', fullMessage);

    // Route message to recipients
    const recipients = Array.isArray(message.to) ? message.to : [message.to];
    for (const recipientId of recipients) {
      const agent = this.agents.get(recipientId);
      if (agent) {
        agent.memory.shortTerm.set(`message_${messageId}`, fullMessage);
        this.emit('messageReceived', { agent: recipientId, message: fullMessage });
      }
    }

    return messageId;
  }

  // Agent Learning
  async recordLearningEvent(event: Omit<AgentLearningEvent, 'id' | 'timestamp'>): Promise<void> {
    const learningEvent: AgentLearningEvent = {
      ...event,
      id: this.generateId(),
      timestamp: Date.now()
    };

    const agent = this.agents.get(event.agentId);
    if (agent) {
      // Store in episodic memory
      agent.memory.episodic.push({
        timestamp: learningEvent.timestamp,
        event: learningEvent.type,
        context: learningEvent.context,
        outcome: learningEvent.outcome
      });

      // Update semantic memory if it's a new concept
      if (learningEvent.lesson) {
        agent.memory.semantic.set(learningEvent.lesson, {
          concept: learningEvent.lesson,
          relationships: [],
          confidence: learningEvent.confidence
        });
      }

      // Adjust learning rate based on success/failure
      if (learningEvent.type === 'success') {
        agent.performance.learningRate = Math.min(1.0, agent.performance.learningRate * 1.1);
      } else if (learningEvent.type === 'failure') {
        agent.performance.learningRate = Math.max(0.1, agent.performance.learningRate * 0.9);
      }
    }

    this.emit('learningEvent', learningEvent);
  }

  // System Control
  start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.processingInterval = setInterval(() => {
      this.processMessageQueue();
      this.updateAgentMetrics();
      this.cleanupOldData();
    }, 1000);

    console.log('🚀 Agent Core System started');
    this.emit('systemStarted');
  }

  stop(): void {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
    }

    console.log('🛑 Agent Core System stopped');
    this.emit('systemStopped');
  }

  // Getters
  getAgent(agentId: string): AgentState | undefined {
    return this.agents.get(agentId);
  }

  getAllAgents(): AgentState[] {
    return Array.from(this.agents.values());
  }

  getTask(taskId: string): AgentTask | undefined {
    return this.tasks.get(taskId);
  }

  getAllTasks(): AgentTask[] {
    return Array.from(this.tasks.values());
  }

  getSystemMetrics(): any {
    return {
      totalAgents: this.agents.size,
      activeTasks: Array.from(this.tasks.values()).filter(t => t.status === 'in_progress').length,
      completedTasks: Array.from(this.tasks.values()).filter(t => t.status === 'completed').length,
      failedTasks: Array.from(this.tasks.values()).filter(t => t.status === 'failed').length,
      messageQueueSize: this.messages.length,
      systemUptime: this.isRunning ? Date.now() - (this.processingInterval ? 0 : Date.now()) : 0
    };
  }

  // Private Methods
  private initializeDefaultCapabilities(): void {
    const defaultCapabilities: AgentCapability[] = [
      {
        id: 'text_processing',
        name: 'Text Processing',
        description: 'Process and analyze text content',
        inputTypes: ['text'],
        outputTypes: ['text', 'analysis'],
        complexity: 'low',
        resourceRequirements: { memory: 100, cpu: 0.2 }
      },
      {
        id: 'reasoning',
        name: 'Logical Reasoning',
        description: 'Perform logical reasoning and problem solving',
        inputTypes: ['problem', 'data'],
        outputTypes: ['solution', 'analysis'],
        complexity: 'high',
        resourceRequirements: { memory: 500, cpu: 0.8 }
      },
      {
        id: 'collaboration',
        name: 'Agent Collaboration',
        description: 'Collaborate with other agents',
        inputTypes: ['message', 'task'],
        outputTypes: ['message', 'coordination'],
        complexity: 'medium',
        resourceRequirements: { memory: 200, cpu: 0.4 }
      },
      {
        id: 'learning',
        name: 'Adaptive Learning',
        description: 'Learn from experience and feedback',
        inputTypes: ['experience', 'feedback'],
        outputTypes: ['knowledge', 'improvement'],
        complexity: 'high',
        resourceRequirements: { memory: 400, cpu: 0.6 }
      }
    ];

    for (const capability of defaultCapabilities) {
      this.capabilities.set(capability.id, capability);
    }
  }

  private findSuitableAgents(taskType: string, preferredAgents: string[] = []): string[] {
    const suitable: string[] = [];
    
    for (const [agentId, agent] of this.agents) {
      if (agent.status === 'idle' || agent.status === 'thinking') {
        // Check if agent has required capabilities
        const hasCapability = agent.capabilities.some(cap => 
          cap.inputTypes.includes(taskType) || cap.name.toLowerCase().includes(taskType.toLowerCase())
        );
        
        if (hasCapability || preferredAgents.includes(agentId)) {
          suitable.push(agentId);
        }
      }
    }

    // Sort by performance and availability
    return suitable.sort((a, b) => {
      const agentA = this.agents.get(a)!;
      const agentB = this.agents.get(b)!;
      return agentB.performance.successRate - agentA.performance.successRate;
    });
  }

  private async processTask(task: AgentTask): Promise<any> {
    // This is a simplified task processor
    // In a real implementation, this would route to specific processors based on task type
    
    const startTime = Date.now();
    
    // Simulate processing time based on complexity
    const processingTime = Math.random() * 2000 + 500;
    await new Promise(resolve => setTimeout(resolve, processingTime));
    
    // Generate a result based on task type
    let result: any;
    
    switch (task.type) {
      case 'analysis':
        result = {
          type: 'analysis_result',
          summary: `Analysis completed for: ${task.description}`,
          insights: ['Key insight 1', 'Key insight 2', 'Key insight 3'],
          confidence: Math.random() * 0.3 + 0.7,
          processingTime: Date.now() - startTime
        };
        break;
        
      case 'generation':
        result = {
          type: 'generated_content',
          content: `Generated content for: ${task.description}`,
          quality: Math.random() * 0.2 + 0.8,
          processingTime: Date.now() - startTime
        };
        break;
        
      default:
        result = {
          type: 'generic_result',
          message: `Task completed: ${task.description}`,
          processingTime: Date.now() - startTime
        };
    }
    
    return result;
  }

  private processMessageQueue(): void {
    // Process pending messages and route them appropriately
    const pendingMessages = this.messages.filter(m => 
      Date.now() - m.timestamp < 60000 // Process messages from last minute
    );
    
    for (const message of pendingMessages) {
      if (message.requiresResponse) {
        // Handle response requirements
        this.emit('responseRequired', message);
      }
    }
  }

  private updateAgentMetrics(): void {
    for (const [agentId, agent] of this.agents) {
      const metrics: AgentMetrics = {
        agentId,
        timestamp: Date.now(),
        performance: {
          responseTime: agent.performance.averageResponseTime,
          accuracy: agent.performance.successRate,
          efficiency: agent.performance.tasksCompleted / Math.max(1, (Date.now() - agent.createdAt) / 3600000), // tasks per hour
          creativity: agent.personality.creativity
        },
        resource_usage: {
          memory: agent.resources.memoryUsage,
          cpu: agent.resources.cpuUsage,
          gpu: agent.resources.gpuUsage
        },
        collaboration: {
          messagesExchanged: agent.memory.shortTerm.size,
          collaborationsInitiated: 0, // Would be tracked separately
          collaborationsCompleted: 0
        },
        learning: {
          newConceptsLearned: agent.memory.semantic.size,
          skillsImproved: Math.floor(agent.performance.learningRate * 10),
          mistakesCorrected: Math.max(0, agent.performance.tasksCompleted - Math.floor(agent.performance.successRate * agent.performance.tasksCompleted))
        }
      };
      
      this.emit('metricsUpdated', metrics);
    }
  }

  private cleanupOldData(): void {
    // Clean up old messages (keep last 1000)
    if (this.messages.length > 1000) {
      this.messages = this.messages.slice(-1000);
    }
    
    // Clean up completed tasks older than 24 hours
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    for (const [taskId, task] of this.tasks) {
      if (task.status === 'completed' && task.completedAt && task.completedAt < oneDayAgo) {
        this.tasks.delete(taskId);
      }
    }
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Singleton instance
let agentCoreInstance: AgentCore | null = null;

export function getAgentCore(config?: AgentConfiguration): AgentCore {
  if (!agentCoreInstance) {
    if (!config) {
      throw new Error('AgentCore not initialized. Provide configuration on first call.');
    }
    agentCoreInstance = new AgentCore(config);
  }
  return agentCoreInstance;
}

export function initializeAgentCore(config: AgentConfiguration): AgentCore {
  agentCoreInstance = new AgentCore(config);
  return agentCoreInstance;
}
