import React, { useState, useEffect } from 'react';
import { AgentState, AgentTask, AgentConfiguration, AgentPersonality } from '../types/agentTypes';
import { getAgentCore } from '../services/agentCore';
import { getMemoryService } from '../services/memoryService';
import { getReasoningEngine } from '../services/reasoningEngine';

interface AgentControlPanelProps {
  onClose: () => void;
}

const AgentControlPanel: React.FC<AgentControlPanelProps> = ({ onClose }) => {
  const [agents, setAgents] = useState<AgentState[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<AgentState | null>(null);
  const [tasks, setTasks] = useState<AgentTask[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<any>(null);
  const [isCreatingAgent, setIsCreatingAgent] = useState(false);
  const [newAgentForm, setNewAgentForm] = useState({
    name: '',
    type: 'general',
    personality: {
      creativity: 0.5,
      analytical: 0.5,
      collaborative: 0.5,
      risktaking: 0.3,
      empathy: 0.5
    } as AgentPersonality,
    capabilities: [] as string[]
  });

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 2000); // Refresh every 2 seconds
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const agentCore = getAgentCore();
      const allAgents = agentCore.getAllAgents();
      const allTasks = agentCore.getAllTasks();
      const metrics = agentCore.getSystemMetrics();
      
      setAgents(allAgents);
      setTasks(allTasks);
      setSystemMetrics(metrics);
    } catch (error) {
      console.error('Failed to load agent data:', error);
    }
  };

  const handleCreateAgent = async () => {
    try {
      const agentCore = getAgentCore();
      const agentId = await agentCore.createAgent(
        newAgentForm.name,
        newAgentForm.type,
        newAgentForm.personality,
        newAgentForm.capabilities
      );
      
      console.log(`✅ Created agent: ${agentId}`);
      setIsCreatingAgent(false);
      setNewAgentForm({
        name: '',
        type: 'general',
        personality: {
          creativity: 0.5,
          analytical: 0.5,
          collaborative: 0.5,
          risktaking: 0.3,
          empathy: 0.5
        },
        capabilities: []
      });
      loadData();
    } catch (error) {
      console.error('Failed to create agent:', error);
    }
  };

  const handleDestroyAgent = async (agentId: string) => {
    if (confirm('Are you sure you want to destroy this agent?')) {
      try {
        const agentCore = getAgentCore();
        await agentCore.destroyAgent(agentId);
        loadData();
      } catch (error) {
        console.error('Failed to destroy agent:', error);
      }
    }
  };

  const handleAssignTask = async () => {
    const taskDescription = prompt('Enter task description:');
    if (!taskDescription || !selectedAgent) return;

    try {
      const agentCore = getAgentCore();
      const taskId = await agentCore.assignTask({
        description: taskDescription,
        type: 'general',
        input: { description: taskDescription },
        assignedAgents: [selectedAgent.id],
        priority: 0.5,
        dependencies: []
      });
      
      // Execute the task
      await agentCore.executeTask(taskId);
      loadData();
    } catch (error) {
      console.error('Failed to assign task:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'idle': return '#4ade80';
      case 'thinking': return '#fbbf24';
      case 'acting': return '#3b82f6';
      case 'learning': return '#8b5cf6';
      case 'collaborating': return '#06b6d4';
      case 'error': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'in_progress': return '#3b82f6';
      case 'failed': return '#ef4444';
      case 'queued': return '#f59e0b';
      case 'assigned': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-5/6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">🤖 Agent Control Panel</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Agent List */}
          <div className="w-1/3 border-r p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Agents ({agents.length})</h3>
              <button
                onClick={() => setIsCreatingAgent(true)}
                className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
              >
                + Create
              </button>
            </div>

            {/* System Metrics */}
            {systemMetrics && (
              <div className="bg-gray-50 p-3 rounded mb-4 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div>Active Tasks: {systemMetrics.activeTasks}</div>
                  <div>Completed: {systemMetrics.completedTasks}</div>
                  <div>Failed: {systemMetrics.failedTasks}</div>
                  <div>Queue: {systemMetrics.messageQueueSize}</div>
                </div>
              </div>
            )}

            {/* Agent List */}
            <div className="space-y-2">
              {agents.map(agent => (
                <div
                  key={agent.id}
                  className={`p-3 border rounded cursor-pointer transition-colors ${
                    selectedAgent?.id === agent.id ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedAgent(agent)}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{agent.name}</div>
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getStatusColor(agent.status) }}
                    />
                  </div>
                  <div className="text-sm text-gray-600">{agent.type}</div>
                  <div className="text-xs text-gray-500">
                    Tasks: {agent.performance.tasksCompleted} | 
                    Success: {(agent.performance.successRate * 100).toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Panel - Agent Details */}
          <div className="flex-1 p-4 overflow-y-auto">
            {selectedAgent ? (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold">{selectedAgent.name}</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleAssignTask}
                      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    >
                      Assign Task
                    </button>
                    <button
                      onClick={() => handleDestroyAgent(selectedAgent.id)}
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    >
                      Destroy
                    </button>
                  </div>
                </div>

                {/* Agent Status */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div className="bg-gray-50 p-4 rounded">
                    <h4 className="font-semibold mb-2">Status</h4>
                    <div className="space-y-2 text-sm">
                      <div>Status: <span className="font-medium" style={{ color: getStatusColor(selectedAgent.status) }}>{selectedAgent.status}</span></div>
                      <div>Type: {selectedAgent.type}</div>
                      <div>Current Task: {selectedAgent.currentTask || 'None'}</div>
                      <div>Created: {new Date(selectedAgent.createdAt).toLocaleString()}</div>
                      <div>Last Active: {new Date(selectedAgent.lastActive).toLocaleString()}</div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded">
                    <h4 className="font-semibold mb-2">Performance</h4>
                    <div className="space-y-2 text-sm">
                      <div>Tasks Completed: {selectedAgent.performance.tasksCompleted}</div>
                      <div>Success Rate: {(selectedAgent.performance.successRate * 100).toFixed(1)}%</div>
                      <div>Avg Response Time: {selectedAgent.performance.averageResponseTime.toFixed(0)}ms</div>
                      <div>Learning Rate: {(selectedAgent.performance.learningRate * 100).toFixed(1)}%</div>
                    </div>
                  </div>
                </div>

                {/* Personality */}
                <div className="bg-gray-50 p-4 rounded mb-6">
                  <h4 className="font-semibold mb-2">Personality</h4>
                  <div className="grid grid-cols-5 gap-4 text-sm">
                    {Object.entries(selectedAgent.personality).map(([trait, value]) => (
                      <div key={trait} className="text-center">
                        <div className="capitalize font-medium">{trait}</div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${typeof value === 'number' ? value * 100 : 0}%` }}
                          />
                        </div>
                        <div className="text-xs text-gray-600 mt-1">{typeof value === 'number' ? (value * 100).toFixed(0) : '0'}%</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Capabilities */}
                <div className="bg-gray-50 p-4 rounded mb-6">
                  <h4 className="font-semibold mb-2">Capabilities ({selectedAgent.capabilities.length})</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedAgent.capabilities.map(cap => (
                      <span
                        key={cap.id}
                        className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm"
                      >
                        {cap.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Memory Stats */}
                <div className="bg-gray-50 p-4 rounded mb-6">
                  <h4 className="font-semibold mb-2">Memory</h4>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="font-medium">Episodic</div>
                      <div>{selectedAgent.memory.episodic.length}</div>
                    </div>
                    <div>
                      <div className="font-medium">Semantic</div>
                      <div>{selectedAgent.memory.semantic.size}</div>
                    </div>
                    <div>
                      <div className="font-medium">Short-term</div>
                      <div>{selectedAgent.memory.shortTerm.size}</div>
                    </div>
                    <div>
                      <div className="font-medium">Long-term</div>
                      <div>{selectedAgent.memory.longTerm.size}</div>
                    </div>
                  </div>
                </div>

                {/* Goals */}
                <div className="bg-gray-50 p-4 rounded">
                  <h4 className="font-semibold mb-2">Goals ({selectedAgent.goals.length})</h4>
                  {selectedAgent.goals.length > 0 ? (
                    <div className="space-y-2">
                      {selectedAgent.goals.map(goal => (
                        <div key={goal.id} className="bg-white p-2 rounded text-sm">
                          <div className="font-medium">{goal.description}</div>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-gray-600">Priority: {(goal.priority * 100).toFixed(0)}%</span>
                            <span className={`px-2 py-1 rounded text-xs ${
                              goal.status === 'completed' ? 'bg-green-100 text-green-800' :
                              goal.status === 'active' ? 'bg-blue-100 text-blue-800' :
                              goal.status === 'failed' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {goal.status}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                            <div
                              className="bg-blue-500 h-1 rounded-full"
                              style={{ width: `${goal.progress * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-500 text-sm">No active goals</div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Select an agent to view details
              </div>
            )}
          </div>
        </div>

        {/* Create Agent Modal */}
        {isCreatingAgent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Create New Agent</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    type="text"
                    value={newAgentForm.name}
                    onChange={(e) => setNewAgentForm({...newAgentForm, name: e.target.value})}
                    className="w-full border rounded px-3 py-2"
                    placeholder="Agent name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select
                    value={newAgentForm.type}
                    onChange={(e) => setNewAgentForm({...newAgentForm, type: e.target.value})}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="general">General</option>
                    <option value="analyst">Analyst</option>
                    <option value="creative">Creative</option>
                    <option value="researcher">Researcher</option>
                    <option value="coordinator">Coordinator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Personality Traits</label>
                  {Object.entries(newAgentForm.personality).map(([trait, value]) => (
                    <div key={trait} className="flex items-center justify-between mb-2">
                      <span className="capitalize text-sm">{trait}</span>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={value}
                        onChange={(e) => setNewAgentForm({
                          ...newAgentForm,
                          personality: {
                            ...newAgentForm.personality,
                            [trait]: parseFloat(e.target.value)
                          }
                        })}
                        className="w-32"
                      />
                      <span className="text-sm w-8">{typeof value === 'number' ? (value * 100).toFixed(0) : '0'}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <button
                  onClick={() => setIsCreatingAgent(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateAgent}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  disabled={!newAgentForm.name}
                >
                  Create Agent
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Task List at Bottom */}
        <div className="border-t p-4 max-h-48 overflow-y-auto">
          <h4 className="font-semibold mb-2">Recent Tasks ({tasks.length})</h4>
          <div className="space-y-1">
            {tasks.slice(-10).map(task => (
              <div key={task.id} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                <div className="flex-1">
                  <span className="font-medium">{task.description}</span>
                  <span className="text-gray-500 ml-2">({task.assignedAgents.length} agents)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-gray-200 rounded-full h-1">
                    <div
                      className="bg-blue-500 h-1 rounded-full"
                      style={{ width: `${task.progress * 100}%` }}
                    />
                  </div>
                  <span
                    className="px-2 py-1 rounded text-xs"
                    style={{ 
                      backgroundColor: getTaskStatusColor(task.status) + '20',
                      color: getTaskStatusColor(task.status)
                    }}
                  >
                    {task.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentControlPanel;
