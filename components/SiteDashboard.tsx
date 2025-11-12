import React, { useState, useEffect } from 'react';
import { SiteProject, SiteAnalytics } from '../types/siteBuilderTypes';
import { getSiteBuilderService } from '../services/siteBuilderService';

interface SiteDashboardProps {
  onClose: () => void;
  onOpenBuilder: (projectId?: string) => void;
}

const SiteDashboard: React.FC<SiteDashboardProps> = ({ onClose, onOpenBuilder }) => {
  const [projects, setProjects] = useState<SiteProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<SiteProject | null>(null);
  const [analytics, setAnalytics] = useState<SiteAnalytics | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'settings'>('overview');
  const [isLoading, setIsLoading] = useState(false);

  const siteBuilderService = getSiteBuilderService();

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (selectedProject && activeTab === 'analytics') {
      loadAnalytics(selectedProject.id);
    }
  }, [selectedProject, activeTab]);

  const loadProjects = () => {
    const allProjects = siteBuilderService.getAllProjects();
    setProjects(allProjects);
    if (allProjects.length > 0 && !selectedProject) {
      setSelectedProject(allProjects[0]);
    }
  };

  const loadAnalytics = async (projectId: string) => {
    setIsLoading(true);
    try {
      const analyticsData = await siteBuilderService.getAnalytics(projectId, {
        start: Date.now() - 30 * 24 * 60 * 60 * 1000, // Last 30 days
        end: Date.now()
      });
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublishToggle = async (projectId: string, isPublished: boolean) => {
    try {
      if (isPublished) {
        await siteBuilderService.unpublishProject(projectId);
      } else {
        await siteBuilderService.publishProject(projectId, {
          subdomain: projects.find(p => p.id === projectId)?.name.toLowerCase().replace(/\s+/g, '-')
        });
      }
      loadProjects();
    } catch (error) {
      console.error('Failed to toggle publish status:', error);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      try {
        await siteBuilderService.deleteProject(projectId);
        loadProjects();
        if (selectedProject?.id === projectId) {
          setSelectedProject(projects.length > 1 ? projects.find(p => p.id !== projectId) || null : null);
        }
      } catch (error) {
        console.error('Failed to delete project:', error);
      }
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl h-5/6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">🌐 ProCity Sites Dashboard</h2>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => onOpenBuilder()}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              + New Site
            </button>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar - Project List */}
          <div className="w-1/3 border-r bg-gray-50 overflow-y-auto">
            <div className="p-4">
              <h3 className="font-semibold mb-4">Your Sites ({projects.length})</h3>
              
              {projects.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">🌐</div>
                  <h4 className="font-semibold mb-2">No sites yet</h4>
                  <p className="text-gray-600 text-sm mb-4">Create your first website to get started</p>
                  <button
                    onClick={() => onOpenBuilder()}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Create Your First Site
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {projects.map(project => (
                    <div
                      key={project.id}
                      onClick={() => setSelectedProject(project)}
                      className={`p-4 rounded-lg cursor-pointer transition-colors ${
                        selectedProject?.id === project.id
                          ? 'bg-blue-100 border-blue-300 border'
                          : 'bg-white hover:bg-gray-50 border border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-sm">{project.name}</h4>
                        <div className="flex items-center space-x-2">
                          {project.isPublished && (
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                              Live
                            </span>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenBuilder(project.id);
                            }}
                            className="text-blue-500 hover:text-blue-700 text-xs"
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                      <p className="text-gray-600 text-xs mb-2 line-clamp-2">{project.description}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{project.pages.length} pages</span>
                        <span>{new Date(project.updatedAt).toLocaleDateString()}</span>
                      </div>
                      {project.publishedUrl && (
                        <div className="mt-2">
                          <a
                            href={project.publishedUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-700 text-xs"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {project.publishedUrl}
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Project Details */}
          <div className="flex-1 flex flex-col">
            {selectedProject ? (
              <>
                {/* Project Header */}
                <div className="p-6 border-b">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold">{selectedProject.name}</h3>
                      <p className="text-gray-600">{selectedProject.description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handlePublishToggle(selectedProject.id, selectedProject.isPublished)}
                        className={`px-4 py-2 rounded ${
                          selectedProject.isPublished
                            ? 'bg-red-500 text-white hover:bg-red-600'
                            : 'bg-green-500 text-white hover:bg-green-600'
                        }`}
                      >
                        {selectedProject.isPublished ? 'Unpublish' : 'Publish'}
                      </button>
                      <button
                        onClick={() => onOpenBuilder(selectedProject.id)}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                      >
                        Edit Site
                      </button>
                      <button
                        onClick={() => handleDeleteProject(selectedProject.id)}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Tabs */}
                  <div className="flex space-x-4">
                    {(['overview', 'analytics', 'settings'] as const).map(tab => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium ${
                          activeTab === tab
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                        }`}
                      >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tab Content */}
                <div className="flex-1 p-6 overflow-y-auto">
                  {activeTab === 'overview' && (
                    <div className="space-y-6">
                      {/* Quick Stats */}
                      <div className="grid grid-cols-4 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">{selectedProject.pages.length}</div>
                          <div className="text-sm text-gray-600">Pages</div>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">
                            {selectedProject.isPublished ? 'Live' : 'Draft'}
                          </div>
                          <div className="text-sm text-gray-600">Status</div>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600">{selectedProject.theme.name}</div>
                          <div className="text-sm text-gray-600">Theme</div>
                        </div>
                        <div className="bg-orange-50 p-4 rounded-lg">
                          <div className="text-2xl font-bold text-orange-600">
                            {Math.floor((Date.now() - selectedProject.createdAt) / (1000 * 60 * 60 * 24))}d
                          </div>
                          <div className="text-sm text-gray-600">Age</div>
                        </div>
                      </div>

                      {/* Pages List */}
                      <div>
                        <h4 className="font-semibold mb-3">Pages</h4>
                        <div className="space-y-2">
                          {selectedProject.pages.map(page => (
                            <div key={page.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                              <div>
                                <div className="font-medium">{page.name}</div>
                                <div className="text-sm text-gray-600">/{page.slug}</div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-500">{page.elements.length} elements</span>
                                <span className={`px-2 py-1 rounded text-xs ${
                                  page.isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                                }`}>
                                  {page.isPublished ? 'Published' : 'Draft'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Recent Activity */}
                      <div>
                        <h4 className="font-semibold mb-3">Recent Activity</h4>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <div className="flex-1">
                              <div className="text-sm">Project created</div>
                              <div className="text-xs text-gray-500">
                                {new Date(selectedProject.createdAt).toLocaleString()}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <div className="flex-1">
                              <div className="text-sm">Last updated</div>
                              <div className="text-xs text-gray-500">
                                {new Date(selectedProject.updatedAt).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'analytics' && (
                    <div className="space-y-6">
                      {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                          <div className="text-gray-500">Loading analytics...</div>
                        </div>
                      ) : analytics ? (
                        <>
                          {/* Key Metrics */}
                          <div className="grid grid-cols-4 gap-4">
                            <div className="bg-blue-50 p-4 rounded-lg">
                              <div className="text-2xl font-bold text-blue-600">
                                {formatNumber(analytics.pageViews)}
                              </div>
                              <div className="text-sm text-gray-600">Page Views</div>
                            </div>
                            <div className="bg-green-50 p-4 rounded-lg">
                              <div className="text-2xl font-bold text-green-600">
                                {formatNumber(analytics.uniqueVisitors)}
                              </div>
                              <div className="text-sm text-gray-600">Unique Visitors</div>
                            </div>
                            <div className="bg-orange-50 p-4 rounded-lg">
                              <div className="text-2xl font-bold text-orange-600">
                                {(analytics.bounceRate * 100).toFixed(1)}%
                              </div>
                              <div className="text-sm text-gray-600">Bounce Rate</div>
                            </div>
                            <div className="bg-purple-50 p-4 rounded-lg">
                              <div className="text-2xl font-bold text-purple-600">
                                {formatDuration(analytics.averageSessionDuration)}
                              </div>
                              <div className="text-sm text-gray-600">Avg. Session</div>
                            </div>
                          </div>

                          {/* Top Pages */}
                          <div>
                            <h4 className="font-semibold mb-3">Top Pages</h4>
                            <div className="space-y-2">
                              {analytics.topPages.map((page, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                                  <div className="font-medium">{page.page}</div>
                                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                                    <span>{formatNumber(page.views)} views</span>
                                    <span>{formatNumber(page.uniqueViews)} unique</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Traffic Sources */}
                          <div>
                            <h4 className="font-semibold mb-3">Traffic Sources</h4>
                            <div className="space-y-2">
                              {analytics.trafficSources.map((source, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                                  <div className="font-medium">{source.source}</div>
                                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                                    <span>{formatNumber(source.visits)} visits</span>
                                    <span>{source.percentage}%</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Device Breakdown */}
                          <div>
                            <h4 className="font-semibold mb-3">Device Breakdown</h4>
                            <div className="grid grid-cols-3 gap-4">
                              <div className="bg-gray-50 p-4 rounded-lg text-center">
                                <div className="text-2xl mb-2">📱</div>
                                <div className="font-semibold">{analytics.deviceBreakdown.mobile}%</div>
                                <div className="text-sm text-gray-600">Mobile</div>
                              </div>
                              <div className="bg-gray-50 p-4 rounded-lg text-center">
                                <div className="text-2xl mb-2">💻</div>
                                <div className="font-semibold">{analytics.deviceBreakdown.desktop}%</div>
                                <div className="text-sm text-gray-600">Desktop</div>
                              </div>
                              <div className="bg-gray-50 p-4 rounded-lg text-center">
                                <div className="text-2xl mb-2">📱</div>
                                <div className="font-semibold">{analytics.deviceBreakdown.tablet}%</div>
                                <div className="text-sm text-gray-600">Tablet</div>
                              </div>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-12">
                          <div className="text-4xl mb-4">📊</div>
                          <h4 className="font-semibold mb-2">No analytics data</h4>
                          <p className="text-gray-600">Publish your site to start collecting analytics</p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'settings' && (
                    <div className="space-y-6">
                      {/* General Settings */}
                      <div>
                        <h4 className="font-semibold mb-3">General Settings</h4>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-1">Site Name</label>
                            <input
                              type="text"
                              value={selectedProject.name}
                              className="w-full border rounded px-3 py-2"
                              readOnly
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Description</label>
                            <textarea
                              value={selectedProject.description}
                              className="w-full border rounded px-3 py-2 h-20"
                              readOnly
                            />
                          </div>
                        </div>
                      </div>

                      {/* Domain Settings */}
                      <div>
                        <h4 className="font-semibold mb-3">Domain Settings</h4>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-1">Published URL</label>
                            <input
                              type="text"
                              value={selectedProject.publishedUrl || 'Not published'}
                              className="w-full border rounded px-3 py-2"
                              readOnly
                            />
                          </div>
                        </div>
                      </div>

                      {/* SEO Settings */}
                      <div>
                        <h4 className="font-semibold mb-3">SEO Settings</h4>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-1">Site Title</label>
                            <input
                              type="text"
                              value={selectedProject.settings.seo.siteName}
                              className="w-full border rounded px-3 py-2"
                              readOnly
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Default Description</label>
                            <textarea
                              value={selectedProject.settings.seo.defaultDescription}
                              className="w-full border rounded px-3 py-2 h-20"
                              readOnly
                            />
                          </div>
                        </div>
                      </div>

                      {/* Theme Settings */}
                      <div>
                        <h4 className="font-semibold mb-3">Theme Settings</h4>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-1">Current Theme</label>
                            <div className="p-3 bg-gray-50 rounded">
                              <div className="font-medium">{selectedProject.theme.name}</div>
                              <div className="text-sm text-gray-600">{selectedProject.theme.description}</div>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-1">Primary Color</label>
                              <div className="flex items-center space-x-2">
                                <div
                                  className="w-8 h-8 rounded border"
                                  style={{ backgroundColor: selectedProject.settings.primaryColor }}
                                />
                                <span className="text-sm">{selectedProject.settings.primaryColor}</span>
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1">Secondary Color</label>
                              <div className="flex items-center space-x-2">
                                <div
                                  className="w-8 h-8 rounded border"
                                  style={{ backgroundColor: selectedProject.settings.secondaryColor }}
                                />
                                <span className="text-sm">{selectedProject.settings.secondaryColor}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <div className="text-6xl mb-4">🌐</div>
                  <h3 className="text-xl font-semibold mb-2">Select a site</h3>
                  <p>Choose a site from the sidebar to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiteDashboard;
