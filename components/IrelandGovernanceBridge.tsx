import React, { useState, useEffect } from 'react';
import { 
  getIrelandGovernanceService, 
  IrishGovernmentRepository, 
  IrishGovernmentOrganization,
  GovernanceCategory 
} from '../services/irelandGovernanceService';

interface IrelandGovernanceBridgeProps {
  onClose: () => void;
}

const IrelandGovernanceBridge: React.FC<IrelandGovernanceBridgeProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'repositories' | 'organizations' | 'bridge'>('overview');
  const [repositories, setRepositories] = useState<IrishGovernmentRepository[]>([]);
  const [organizations, setOrganizations] = useState<IrishGovernmentOrganization[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [isBridging, setIsBridging] = useState(false);
  const [bridgeResults, setBridgeResults] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<GovernanceCategory | 'all'>('all');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');

  const governanceService = getIrelandGovernanceService();

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const orgs = governanceService.getAllOrganizations();
      const repos = governanceService.getAllRepositories();
      const metricsData = await governanceService.getGovernanceMetrics();
      
      setOrganizations(orgs);
      setRepositories(repos);
      setMetrics(metricsData);
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const handleDiscoverRepositories = async () => {
    setIsDiscovering(true);
    try {
      const discoveredRepos = await governanceService.discoverIrishGovernmentRepositories();
      setRepositories(discoveredRepos);
      
      // Refresh metrics
      const metricsData = await governanceService.getGovernanceMetrics();
      setMetrics(metricsData);
    } catch (error) {
      console.error('Error discovering repositories:', error);
    } finally {
      setIsDiscovering(false);
    }
  };

  const handleBridgeRepositories = async () => {
    setIsBridging(true);
    try {
      const results = await governanceService.bridgeRepositoriesToLocal();
      setBridgeResults(results);
      
      // Refresh data
      await loadInitialData();
    } catch (error) {
      console.error('Error bridging repositories:', error);
    } finally {
      setIsBridging(false);
    }
  };

  const handleStartAutoSync = async () => {
    try {
      await governanceService.startAutoSync();
    } catch (error) {
      console.error('Error starting auto sync:', error);
    }
  };

  const getFilteredRepositories = () => {
    let filtered = repositories;
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(repo => repo.category === selectedCategory);
    }
    
    if (selectedDepartment !== 'all') {
      filtered = filtered.filter(repo => repo.department === selectedDepartment);
    }
    
    return filtered;
  };

  const getDepartments = () => {
    const departments = new Set(repositories.map(repo => repo.department));
    return Array.from(departments).sort();
  };

  const getCategories = (): GovernanceCategory[] => {
    return [
      'central_government',
      'health_services',
      'education',
      'justice',
      'revenue',
      'social_protection',
      'transport',
      'environment',
      'agriculture',
      'enterprise',
      'digital_services',
      'data_analytics'
    ];
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const getCategoryIcon = (category: GovernanceCategory) => {
    const icons: Record<GovernanceCategory, string> = {
      central_government: '🏛️',
      local_government: '🏢',
      health_services: '🏥',
      education: '🎓',
      justice: '⚖️',
      revenue: '💰',
      social_protection: '🛡️',
      transport: '🚗',
      environment: '🌱',
      agriculture: '🌾',
      enterprise: '🏭',
      foreign_affairs: '🌍',
      defence: '🛡️',
      housing: '🏠',
      culture: '🎭',
      digital_services: '💻',
      data_analytics: '📊',
      citizen_services: '👥',
      business_services: '💼'
    };
    
    return icons[category] || '📁';
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-blue-600 text-2xl mr-3">📚</div>
            <div>
              <div className="text-2xl font-bold text-blue-900">
                {metrics ? formatNumber(metrics.totalRepositories) : '0'}
              </div>
              <div className="text-sm text-blue-600">Total Repositories</div>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-green-600 text-2xl mr-3">🏛️</div>
            <div>
              <div className="text-2xl font-bold text-green-900">
                {metrics ? formatNumber(metrics.totalOrganizations) : '0'}
              </div>
              <div className="text-sm text-green-600">Government Organizations</div>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-purple-600 text-2xl mr-3">👥</div>
            <div>
              <div className="text-2xl font-bold text-purple-900">
                {metrics ? formatNumber(metrics.totalCitizensServed) : '0'}
              </div>
              <div className="text-sm text-purple-600">Citizens Served</div>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-orange-600 text-2xl mr-3">💼</div>
            <div>
              <div className="text-2xl font-bold text-orange-900">
                {metrics ? formatNumber(metrics.totalBusinessUsers) : '0'}
              </div>
              <div className="text-sm text-orange-600">Business Users</div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="text-lg font-semibold text-gray-900 mb-2">Compliance Rate</div>
          <div className="text-3xl font-bold text-green-600">
            {metrics ? `${metrics.complianceRate.toFixed(1)}%` : '0%'}
          </div>
          <div className="text-sm text-gray-600">GDPR Compliant Repositories</div>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="text-lg font-semibold text-gray-900 mb-2">Active Services</div>
          <div className="text-3xl font-bold text-blue-600">
            {metrics ? formatNumber(metrics.activeServices) : '0'}
          </div>
          <div className="text-sm text-gray-600">Digital Services Online</div>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="text-lg font-semibold text-gray-900 mb-2">Last Sync</div>
          <div className="text-lg font-bold text-gray-700">
            {metrics ? formatDate(metrics.lastSyncTime) : 'Never'}
          </div>
          <div className="text-sm text-gray-600">Repository Discovery</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={handleDiscoverRepositories}
            disabled={isDiscovering}
            className={`p-4 rounded-lg border-2 border-dashed text-center transition-colors ${
              isDiscovering
                ? 'border-gray-300 text-gray-500 cursor-not-allowed'
                : 'border-blue-300 text-blue-600 hover:border-blue-400 hover:bg-blue-50'
            }`}
          >
            <div className="text-2xl mb-2">🔍</div>
            <div className="font-medium">
              {isDiscovering ? 'Discovering...' : 'Discover Repositories'}
            </div>
            <div className="text-sm text-gray-600">
              Scan for Irish government repositories
            </div>
          </button>

          <button
            onClick={handleBridgeRepositories}
            disabled={isBridging || repositories.length === 0}
            className={`p-4 rounded-lg border-2 border-dashed text-center transition-colors ${
              isBridging || repositories.length === 0
                ? 'border-gray-300 text-gray-500 cursor-not-allowed'
                : 'border-green-300 text-green-600 hover:border-green-400 hover:bg-green-50'
            }`}
          >
            <div className="text-2xl mb-2">🌉</div>
            <div className="font-medium">
              {isBridging ? 'Bridging...' : 'Bridge Repositories'}
            </div>
            <div className="text-sm text-gray-600">
              Create local mirrors and setup monitoring
            </div>
          </button>

          <button
            onClick={handleStartAutoSync}
            className="p-4 rounded-lg border-2 border-dashed border-purple-300 text-purple-600 hover:border-purple-400 hover:bg-purple-50 text-center transition-colors"
          >
            <div className="text-2xl mb-2">🔄</div>
            <div className="font-medium">Start Auto Sync</div>
            <div className="text-sm text-gray-600">
              Enable automatic repository synchronization
            </div>
          </button>
        </div>
      </div>

      {/* Bridge Results */}
      {bridgeResults && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Bridge Results</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{bridgeResults.success}</div>
              <div className="text-sm text-gray-600">Successfully Bridged</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{bridgeResults.failed}</div>
              <div className="text-sm text-gray-600">Failed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {((bridgeResults.success / (bridgeResults.success + bridgeResults.failed)) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Success Rate</div>
            </div>
          </div>
          {bridgeResults.errors.length > 0 && (
            <div className="mt-4">
              <div className="text-sm font-medium text-red-600 mb-2">Errors:</div>
              <div className="bg-red-50 border border-red-200 rounded p-3 max-h-32 overflow-y-auto">
                {bridgeResults.errors.map((error: string, index: number) => (
                  <div key={index} className="text-sm text-red-700">{error}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderRepositories = () => {
    const filteredRepos = getFilteredRepositories();
    
    return (
      <div className="space-y-4">
        {/* Filters */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as GovernanceCategory | 'all')}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                {getCategories().map(category => (
                  <option key={category} value={category}>
                    {getCategoryIcon(category)} {category.replace(/_/g, ' ').toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Departments</option>
                {getDepartments().map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Repository List */}
        <div className="space-y-3">
          {filteredRepos.map(repo => (
            <div key={repo.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="text-lg">{getCategoryIcon(repo.category)}</div>
                    <h3 className="text-lg font-semibold text-gray-900">{repo.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      repo.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {repo.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-2">{repo.description}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>📁 {repo.department}</span>
                    <span>💻 {repo.language}</span>
                    <span>⭐ {repo.stars}</span>
                    <span>🍴 {repo.forks}</span>
                    <span>📏 {formatNumber(repo.size)} KB</span>
                  </div>
                  <div className="flex items-center space-x-2 mt-2">
                    {repo.topics.map(topic => (
                      <span key={topic} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500 mb-1">
                    Updated {formatDate(repo.lastUpdated)}
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className={`w-2 h-2 rounded-full ${
                      repo.compliance.gdprCompliant ? 'bg-green-500' : 'bg-red-500'
                    }`}></span>
                    <span className="text-xs text-gray-600">
                      {repo.compliance.gdprCompliant ? 'GDPR Compliant' : 'Non-Compliant'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredRepos.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No repositories found matching the selected filters.
          </div>
        )}
      </div>
    );
  };

  const renderOrganizations = () => (
    <div className="space-y-4">
      {organizations.map(org => (
        <div key={org.name} className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{org.name}</h3>
              <p className="text-gray-600">{org.description}</p>
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                <span>🏛️ {org.type.replace(/_/g, ' ').toUpperCase()}</span>
                <span>🌐 <a href={org.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Website</a></span>
                {org.githubOrg && <span>📁 {org.githubOrg}</span>}
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                {formatNumber(org.citizens_served)}
              </div>
              <div className="text-sm text-gray-600">Citizens Served</div>
            </div>
          </div>

          {/* Digital Services */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-3">Digital Services</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {org.digitalServices.map(service => (
                <div key={service.name} className="bg-gray-50 border border-gray-200 rounded p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-gray-900">{service.name}</h5>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      service.status === 'active' 
                        ? 'bg-green-100 text-green-800'
                        : service.status === 'development'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {service.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{service.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>👥 {formatNumber(service.citizens)} citizens</span>
                    <span>💼 {formatNumber(service.businessUsers)} businesses</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderBridge = () => (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Bridge Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Sync Settings</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Auto Sync</span>
                <span className="text-sm font-medium text-green-600">Enabled</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Sync Interval</span>
                <span className="text-sm font-medium text-gray-900">60 minutes</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Mirror to Local</span>
                <span className="text-sm font-medium text-green-600">Enabled</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Webhooks</span>
                <span className="text-sm font-medium text-green-600">Enabled</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Security & Compliance</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Compliance Checks</span>
                <span className="text-sm font-medium text-green-600">Enabled</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Security Scanning</span>
                <span className="text-sm font-medium text-green-600">Enabled</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Public Access</span>
                <span className="text-sm font-medium text-green-600">Enabled</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Private Repos</span>
                <span className="text-sm font-medium text-red-600">Disabled</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Bridge Status</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <span className="font-medium text-green-900">Ireland Governance Bridge</span>
            </div>
            <span className="text-sm text-green-700">Active</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{repositories.length}</div>
              <div className="text-sm text-gray-600">Repositories Bridged</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{organizations.length}</div>
              <div className="text-sm text-gray-600">Organizations Connected</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {metrics ? `${metrics.complianceRate.toFixed(0)}%` : '0%'}
              </div>
              <div className="text-sm text-gray-600">Compliance Rate</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-7xl h-5/6 flex flex-col">
        {/* Header */}
        <div className="bg-green-600 px-6 py-4 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-white text-2xl">🇮🇪</div>
            <div>
              <h2 className="text-white text-xl font-bold">Ireland Governance Repository Bridge</h2>
              <p className="text-green-100 text-sm">Comprehensive integration of Irish government digital infrastructure</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'repositories', label: 'Repositories', icon: '📚' },
              { id: 'organizations', label: 'Organizations', icon: '🏛️' },
              { id: 'bridge', label: 'Bridge Status', icon: '🌉' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'repositories' && renderRepositories()}
          {activeTab === 'organizations' && renderOrganizations()}
          {activeTab === 'bridge' && renderBridge()}
        </div>
      </div>
    </div>
  );
};

export default IrelandGovernanceBridge;
