import React, { useState, useEffect, useCallback } from 'react';
import { GoogleGenerativeAI } from '@google/genai';

// Types for governance system
interface GovernanceAgent {
  id: string;
  name: string;
  agency: string;
  clearanceLevel: 'PUBLIC' | 'CONFIDENTIAL' | 'SECRET' | 'TOP_SECRET';
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
  capabilities: string[];
  lastActivity: string;
}

interface GovernanceTask {
  id: string;
  type: 'ANALYSIS' | 'INVESTIGATION' | 'MONITORING' | 'PREDICTION' | 'COMPLIANCE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  classification: string;
  agency: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  progress: number;
  results?: any;
  createdAt: string;
  completedAt?: string;
}

interface SystemMetrics {
  totalAgents: number;
  activeAgents: number;
  totalTasks: number;
  completedTasks: number;
  systemHealth: 'HEALTHY' | 'WARNING' | 'CRITICAL';
  securityStatus: 'SECURE' | 'ALERT' | 'BREACH';
  memoryUtilization: number;
  processingSpeed: string;
}

const GovernanceBridge: React.FC = () => {
  const [agents, setAgents] = useState<GovernanceAgent[]>([]);
  const [tasks, setTasks] = useState<GovernanceTask[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [selectedAgency, setSelectedAgency] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [geminiAI, setGeminiAI] = useState<GoogleGenerativeAI | null>(null);

  // Initialize Gemini AI
  useEffect(() => {
    const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
    if (apiKey) {
      setGeminiAI(new GoogleGenerativeAI(apiKey));
    }
  }, []);

  // Initialize governance agents
  useEffect(() => {
    initializeGovernanceAgents();
    loadSystemMetrics();
    
    // Set up real-time updates
    const interval = setInterval(() => {
      loadSystemMetrics();
      updateTaskStatuses();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const initializeGovernanceAgents = useCallback(() => {
    const governanceAgents: GovernanceAgent[] = [
      {
        id: 'fbi-criminal-analysis',
        name: 'FBI Criminal Analysis AI',
        agency: 'FBI',
        clearanceLevel: 'SECRET',
        status: 'ACTIVE',
        capabilities: [
          'Criminal Pattern Analysis',
          'Evidence Correlation',
          'Behavioral Profiling',
          'Threat Assessment',
          'Financial Crime Detection'
        ],
        lastActivity: new Date().toISOString()
      },
      {
        id: 'cia-intelligence-analysis',
        name: 'CIA Intelligence Analysis AI',
        agency: 'CIA',
        clearanceLevel: 'TOP_SECRET',
        status: 'ACTIVE',
        capabilities: [
          'Geopolitical Analysis',
          'Threat Intelligence',
          'Foreign Actor Tracking',
          'Strategic Assessment',
          'Counterintelligence'
        ],
        lastActivity: new Date().toISOString()
      },
      {
        id: 'nsa-cyber-defense',
        name: 'NSA Cyber Defense AI',
        agency: 'NSA',
        clearanceLevel: 'TOP_SECRET',
        status: 'ACTIVE',
        capabilities: [
          'Cyber Threat Detection',
          'Network Analysis',
          'Cryptographic Analysis',
          'Malware Detection',
          'Attribution Analysis'
        ],
        lastActivity: new Date().toISOString()
      },
      {
        id: 'dhs-homeland-security',
        name: 'DHS Homeland Security AI',
        agency: 'DHS',
        clearanceLevel: 'SECRET',
        status: 'ACTIVE',
        capabilities: [
          'Border Security Analysis',
          'Transportation Security',
          'Critical Infrastructure Protection',
          'Emergency Response Coordination',
          'Immigration Analysis'
        ],
        lastActivity: new Date().toISOString()
      },
      {
        id: 'interagency-coordinator',
        name: 'Interagency Coordination AI',
        agency: 'MULTI_AGENCY',
        clearanceLevel: 'TOP_SECRET',
        status: 'ACTIVE',
        capabilities: [
          'Cross-Agency Coordination',
          'Information Sharing',
          'Joint Operations Support',
          'Resource Optimization',
          'Policy Compliance'
        ],
        lastActivity: new Date().toISOString()
      }
    ];

    setAgents(governanceAgents);
  }, []);

  const loadSystemMetrics = useCallback(() => {
    // Simulate loading system metrics
    const mockMetrics: SystemMetrics = {
      totalAgents: agents.length,
      activeAgents: agents.filter(a => a.status === 'ACTIVE').length,
      totalTasks: tasks.length,
      completedTasks: tasks.filter(t => t.status === 'COMPLETED').length,
      systemHealth: 'HEALTHY',
      securityStatus: 'SECURE',
      memoryUtilization: Math.floor(Math.random() * 30) + 60, // 60-90%
      processingSpeed: `${(Math.random() * 2 + 1).toFixed(1)}s avg`
    };

    setMetrics(mockMetrics);
  }, [agents, tasks]);

  const updateTaskStatuses = useCallback(() => {
    setTasks(prevTasks => 
      prevTasks.map(task => {
        if (task.status === 'PROCESSING' && task.progress < 100) {
          const newProgress = Math.min(100, task.progress + Math.random() * 20);
          const newStatus = newProgress >= 100 ? 'COMPLETED' : 'PROCESSING';
          
          return {
            ...task,
            progress: newProgress,
            status: newStatus,
            completedAt: newStatus === 'COMPLETED' ? new Date().toISOString() : task.completedAt
          };
        }
        return task;
      })
    );
  }, []);

  const createGovernanceTask = useCallback(async (taskData: Partial<GovernanceTask>) => {
    setIsLoading(true);
    setError(null);

    try {
      const newTask: GovernanceTask = {
        id: `task-${Date.now()}`,
        type: taskData.type || 'ANALYSIS',
        priority: taskData.priority || 'MEDIUM',
        classification: taskData.classification || 'CONFIDENTIAL',
        agency: taskData.agency || 'FBI',
        status: 'PENDING',
        progress: 0,
        createdAt: new Date().toISOString()
      };

      setTasks(prevTasks => [...prevTasks, newTask]);

      // Simulate task processing
      setTimeout(() => {
        setTasks(prevTasks =>
          prevTasks.map(task =>
            task.id === newTask.id
              ? { ...task, status: 'PROCESSING', progress: 10 }
              : task
          )
        );
      }, 1000);

      return newTask;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const processWithGemini = useCallback(async (query: string, agentId: string) => {
    if (!geminiAI) {
      throw new Error('Gemini AI not initialized');
    }

    const agent = agents.find(a => a.id === agentId);
    if (!agent) {
      throw new Error('Agent not found');
    }

    const model = geminiAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const prompt = `
      You are ${agent.name} with ${agent.clearanceLevel} clearance level.
      Your capabilities include: ${agent.capabilities.join(', ')}.
      
      Process this governance query: ${query}
      
      Provide a detailed analysis appropriate for ${agent.agency} operations.
      Include recommendations and next steps.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    return {
      agentId,
      agentName: agent.name,
      agency: agent.agency,
      response: response.text(),
      timestamp: new Date().toISOString(),
      classification: agent.clearanceLevel
    };
  }, [geminiAI, agents]);

  const filteredAgents = selectedAgency === 'ALL' 
    ? agents 
    : agents.filter(agent => agent.agency === selectedAgency);

  const filteredTasks = selectedAgency === 'ALL'
    ? tasks
    : tasks.filter(task => task.agency === selectedAgency);

  return (
    <div className="governance-bridge">
      <div className="governance-header">
        <h1>🏛️ AI Governance Bridge System</h1>
        <div className="classification-banner">
          CONTROLLED UNCLASSIFIED INFORMATION (CUI)
        </div>
      </div>

      {/* System Metrics Dashboard */}
      {metrics && (
        <div className="metrics-dashboard">
          <div className="metric-card">
            <h3>System Health</h3>
            <div className={`status-indicator ${metrics.systemHealth.toLowerCase()}`}>
              {metrics.systemHealth}
            </div>
          </div>
          
          <div className="metric-card">
            <h3>Security Status</h3>
            <div className={`status-indicator ${metrics.securityStatus.toLowerCase()}`}>
              {metrics.securityStatus}
            </div>
          </div>
          
          <div className="metric-card">
            <h3>Active Agents</h3>
            <div className="metric-value">
              {metrics.activeAgents} / {metrics.totalAgents}
            </div>
          </div>
          
          <div className="metric-card">
            <h3>Task Completion</h3>
            <div className="metric-value">
              {metrics.completedTasks} / {metrics.totalTasks}
            </div>
          </div>
          
          <div className="metric-card">
            <h3>Memory Usage</h3>
            <div className="metric-value">
              {metrics.memoryUtilization}%
            </div>
          </div>
          
          <div className="metric-card">
            <h3>Processing Speed</h3>
            <div className="metric-value">
              {metrics.processingSpeed}
            </div>
          </div>
        </div>
      )}

      {/* Agency Filter */}
      <div className="agency-filter">
        <label htmlFor="agency-select">Filter by Agency:</label>
        <select
          id="agency-select"
          value={selectedAgency}
          onChange={(e) => setSelectedAgency(e.target.value)}
        >
          <option value="ALL">All Agencies</option>
          <option value="FBI">FBI</option>
          <option value="CIA">CIA</option>
          <option value="NSA">NSA</option>
          <option value="DHS">DHS</option>
          <option value="MULTI_AGENCY">Multi-Agency</option>
        </select>
      </div>

      <div className="governance-content">
        {/* Agents Panel */}
        <div className="agents-panel">
          <h2>🤖 Governance Agents</h2>
          <div className="agents-grid">
            {filteredAgents.map(agent => (
              <div key={agent.id} className="agent-card">
                <div className="agent-header">
                  <h3>{agent.name}</h3>
                  <div className={`clearance-badge ${agent.clearanceLevel.toLowerCase().replace('_', '-')}`}>
                    {agent.clearanceLevel}
                  </div>
                </div>
                
                <div className="agent-info">
                  <p><strong>Agency:</strong> {agent.agency}</p>
                  <p><strong>Status:</strong> 
                    <span className={`status ${agent.status.toLowerCase()}`}>
                      {agent.status}
                    </span>
                  </p>
                </div>
                
                <div className="agent-capabilities">
                  <h4>Capabilities:</h4>
                  <ul>
                    {agent.capabilities.map((capability, index) => (
                      <li key={index}>{capability}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="agent-actions">
                  <button
                    onClick={() => createGovernanceTask({
                      type: 'ANALYSIS',
                      agency: agent.agency,
                      priority: 'MEDIUM'
                    })}
                    disabled={isLoading || agent.status !== 'ACTIVE'}
                  >
                    Create Analysis Task
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tasks Panel */}
        <div className="tasks-panel">
          <h2>📋 Active Tasks</h2>
          <div className="tasks-list">
            {filteredTasks.length === 0 ? (
              <p>No tasks found for selected agency.</p>
            ) : (
              filteredTasks.map(task => (
                <div key={task.id} className="task-card">
                  <div className="task-header">
                    <h3>Task {task.id}</h3>
                    <div className={`priority-badge ${task.priority.toLowerCase()}`}>
                      {task.priority}
                    </div>
                  </div>
                  
                  <div className="task-info">
                    <p><strong>Type:</strong> {task.type}</p>
                    <p><strong>Agency:</strong> {task.agency}</p>
                    <p><strong>Classification:</strong> {task.classification}</p>
                    <p><strong>Status:</strong> 
                      <span className={`status ${task.status.toLowerCase()}`}>
                        {task.status}
                      </span>
                    </p>
                  </div>
                  
                  {task.status === 'PROCESSING' && (
                    <div className="task-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                      <span>{Math.round(task.progress)}%</span>
                    </div>
                  )}
                  
                  <div className="task-timestamps">
                    <p><strong>Created:</strong> {new Date(task.createdAt).toLocaleString()}</p>
                    {task.completedAt && (
                      <p><strong>Completed:</strong> {new Date(task.completedAt).toLocaleString()}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="error-message">
          <h3>⚠️ Error</h3>
          <p>{error}</p>
          <button onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Processing governance request...</p>
          </div>
        </div>
      )}

      <style jsx>{`
        .governance-bridge {
          padding: 20px;
          max-width: 1400px;
          margin: 0 auto;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .governance-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .governance-header h1 {
          color: #1a365d;
          margin-bottom: 10px;
        }

        .classification-banner {
          background: #e53e3e;
          color: white;
          padding: 8px 16px;
          border-radius: 4px;
          font-weight: bold;
          display: inline-block;
        }

        .metrics-dashboard {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .metric-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .metric-card h3 {
          margin: 0 0 10px 0;
          color: #2d3748;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .status-indicator {
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: bold;
          text-transform: uppercase;
        }

        .status-indicator.healthy { background: #c6f6d5; color: #22543d; }
        .status-indicator.warning { background: #fef5e7; color: #c05621; }
        .status-indicator.critical { background: #fed7d7; color: #c53030; }
        .status-indicator.secure { background: #c6f6d5; color: #22543d; }
        .status-indicator.alert { background: #fef5e7; color: #c05621; }
        .status-indicator.breach { background: #fed7d7; color: #c53030; }

        .metric-value {
          font-size: 24px;
          font-weight: bold;
          color: #2b6cb0;
        }

        .agency-filter {
          margin-bottom: 30px;
          padding: 20px;
          background: #f7fafc;
          border-radius: 8px;
        }

        .agency-filter label {
          margin-right: 10px;
          font-weight: bold;
        }

        .agency-filter select {
          padding: 8px 12px;
          border: 1px solid #cbd5e0;
          border-radius: 4px;
          background: white;
        }

        .governance-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
        }

        .agents-panel, .tasks-panel {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 20px;
        }

        .agents-panel h2, .tasks-panel h2 {
          margin: 0 0 20px 0;
          color: #1a365d;
          border-bottom: 2px solid #3182ce;
          padding-bottom: 10px;
        }

        .agents-grid {
          display: grid;
          gap: 20px;
        }

        .agent-card, .task-card {
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 16px;
          background: #f8f9fa;
        }

        .agent-header, .task-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .agent-header h3, .task-header h3 {
          margin: 0;
          color: #2d3748;
          font-size: 16px;
        }

        .clearance-badge, .priority-badge {
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: bold;
          text-transform: uppercase;
        }

        .clearance-badge.public { background: #e6fffa; color: #234e52; }
        .clearance-badge.confidential { background: #fef5e7; color: #c05621; }
        .clearance-badge.secret { background: #fed7d7; color: #c53030; }
        .clearance-badge.top-secret { background: #e9d8fd; color: #553c9a; }

        .priority-badge.low { background: #c6f6d5; color: #22543d; }
        .priority-badge.medium { background: #fef5e7; color: #c05621; }
        .priority-badge.high { background: #fed7d7; color: #c53030; }
        .priority-badge.critical { background: #e9d8fd; color: #553c9a; }

        .agent-info, .task-info {
          margin-bottom: 12px;
        }

        .agent-info p, .task-info p {
          margin: 4px 0;
          font-size: 14px;
        }

        .status.active { color: #22543d; }
        .status.inactive { color: #718096; }
        .status.maintenance { color: #c05621; }
        .status.pending { color: #3182ce; }
        .status.processing { color: #c05621; }
        .status.completed { color: #22543d; }
        .status.failed { color: #c53030; }

        .agent-capabilities {
          margin-bottom: 16px;
        }

        .agent-capabilities h4 {
          margin: 0 0 8px 0;
          font-size: 14px;
          color: #4a5568;
        }

        .agent-capabilities ul {
          margin: 0;
          padding-left: 16px;
          font-size: 13px;
        }

        .agent-capabilities li {
          margin-bottom: 2px;
        }

        .agent-actions button {
          background: #3182ce;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }

        .agent-actions button:hover:not(:disabled) {
          background: #2c5282;
        }

        .agent-actions button:disabled {
          background: #a0aec0;
          cursor: not-allowed;
        }

        .tasks-list {
          display: grid;
          gap: 16px;
        }

        .task-progress {
          margin: 12px 0;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .progress-bar {
          flex: 1;
          height: 8px;
          background: #e2e8f0;
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: #3182ce;
          transition: width 0.3s ease;
        }

        .task-timestamps {
          font-size: 12px;
          color: #718096;
          margin-top: 12px;
        }

        .task-timestamps p {
          margin: 2px 0;
        }

        .error-message {
          position: fixed;
          top: 20px;
          right: 20px;
          background: #fed7d7;
          border: 1px solid #feb2b2;
          border-radius: 8px;
          padding: 16px;
          max-width: 400px;
          z-index: 1000;
        }

        .error-message h3 {
          margin: 0 0 8px 0;
          color: #c53030;
        }

        .error-message button {
          background: #c53030;
          color: white;
          border: none;
          padding: 4px 8px;
          border-radius: 4px;
          cursor: pointer;
          margin-top: 8px;
        }

        .loading-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .loading-spinner {
          background: white;
          padding: 40px;
          border-radius: 8px;
          text-align: center;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #e2e8f0;
          border-top: 4px solid #3182ce;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 16px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .governance-content {
            grid-template-columns: 1fr;
          }
          
          .metrics-dashboard {
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          }
        }
      `}</style>
    </div>
  );
};

export default GovernanceBridge;

