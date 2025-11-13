import React, { useState, useEffect } from 'react';
import bridgeService from '../services/bridgeService';
import sharedDataService from '../services/sharedDataService';
import notificationService from '../services/notificationService';
import healthCheckService from '../services/healthCheckService';

interface DashboardWidgetProps {
    type: 'system_health' | 'notifications' | 'mining_status' | 'user_activity' | 'recent_discoveries' | 'org_overview';
    title: string;
    size?: 'small' | 'medium' | 'large';
    onOpenApp?: (appName: string, data?: any) => void;
}

const DashboardWidget: React.FC<DashboardWidgetProps> = ({ type, title, size = 'medium', onOpenApp }) => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadWidgetData();
        
        // Set up real-time updates
        const unsubscribe = bridgeService.subscribe('*', (event) => {
            // Refresh widget data when relevant events occur
            if (shouldRefreshForEvent(event.type)) {
                loadWidgetData();
            }
        });

        return unsubscribe;
    }, [type]);

    const shouldRefreshForEvent = (eventType: string): boolean => {
        switch (type) {
            case 'system_health':
                return eventType.includes('health') || eventType.includes('system');
            case 'notifications':
                return eventType === 'notification_sent';
            case 'mining_status':
                return eventType.includes('mining');
            case 'user_activity':
                return eventType.includes('user');
            case 'recent_discoveries':
                return eventType === 'web_discovery_saved';
            case 'org_overview':
                return eventType === 'org_structure_updated';
            default:
                return false;
        }
    };

    const loadWidgetData = async () => {
        setLoading(true);
        setError(null);
        
        try {
            let widgetData;
            
            switch (type) {
                case 'system_health':
                    widgetData = await loadSystemHealthData();
                    break;
                case 'notifications':
                    widgetData = await loadNotificationsData();
                    break;
                case 'mining_status':
                    widgetData = await loadMiningStatusData();
                    break;
                case 'user_activity':
                    widgetData = await loadUserActivityData();
                    break;
                case 'recent_discoveries':
                    widgetData = await loadRecentDiscoveriesData();
                    break;
                case 'org_overview':
                    widgetData = await loadOrgOverviewData();
                    break;
                default:
                    widgetData = { message: 'Unknown widget type' };
            }
            
            setData(widgetData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load widget data');
        } finally {
            setLoading(false);
        }
    };

    const loadSystemHealthData = async () => {
        const healthReport = await healthCheckService.generateSystemHealthReport();
        return {
            overallStatus: healthReport.overallStatus,
            activeApps: healthReport.systemMetrics.activeApps,
            totalApps: healthReport.apps.length,
            issues: healthReport.apps.filter(app => app.status === 'error').length,
            warnings: healthReport.apps.filter(app => app.status === 'warning').length,
            uptime: healthReport.systemMetrics.systemUptime,
            recommendations: healthReport.recommendations.slice(0, 3)
        };
    };

    const loadNotificationsData = () => {
        const stats = notificationService.getNotificationStats();
        const recentNotifications = notificationService.getNotifications().slice(0, 5);
        return {
            ...stats,
            recent: recentNotifications
        };
    };

    const loadMiningStatusData = async () => {
        const metrics = await sharedDataService.getMiningMetrics();
        return metrics || {
            blocksFound: 0,
            hashRate: 0,
            efficiency: 0,
            status: 'offline'
        };
    };

    const loadUserActivityData = async () => {
        const profiles = await sharedDataService.getAllUserProfiles();
        const activeUsers = profiles.filter(p => Date.now() - p.activity.lastLogin < 3600000); // Last hour
        return {
            totalUsers: profiles.length,
            activeUsers: activeUsers.length,
            recentActivity: profiles.map(p => ({
                username: p.username,
                lastLogin: p.activity.lastLogin,
                appsUsed: p.activity.appsUsed.slice(-3)
            })).slice(0, 5)
        };
    };

    const loadRecentDiscoveriesData = async () => {
        const discoveries = await sharedDataService.getWebDiscoveries();
        return {
            total: discoveries.length,
            recent: discoveries.slice(0, 5)
        };
    };

    const loadOrgOverviewData = async () => {
        const orgStructure = await sharedDataService.getOrgStructure();
        if (!orgStructure) {
            return { message: 'No organizational structure defined' };
        }
        
        const totalRoles = orgStructure.departments.reduce((sum, dept) => sum + dept.roles.length, 0);
        const aiAgents = orgStructure.departments.reduce((sum, dept) => 
            sum + dept.roles.filter(role => role.type === 'ai_agent').length, 0);
        
        return {
            companyName: orgStructure.companyName,
            departments: orgStructure.departments.length,
            totalRoles,
            aiAgents,
            humanRoles: totalRoles - aiAgents
        };
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'healthy': return 'text-green-400';
            case 'warning': return 'text-yellow-400';
            case 'error': return 'text-red-400';
            default: return 'text-slate-400';
        }
    };

    const formatUptime = (uptime: number) => {
        const hours = Math.floor(uptime / 3600000);
        const minutes = Math.floor((uptime % 3600000) / 60000);
        return `${hours}h ${minutes}m`;
    };

    const renderWidgetContent = () => {
        if (loading) {
            return (
                <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
                </div>
            );
        }

        if (error) {
            return (
                <div className="flex items-center justify-center h-32 text-red-400">
                    <div className="text-center">
                        <p className="text-sm">Error loading data</p>
                        <p className="text-xs text-slate-500 mt-1">{error}</p>
                    </div>
                </div>
            );
        }

        switch (type) {
            case 'system_health':
                return (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className={`text-lg font-semibold ${getStatusColor(data.overallStatus)}`}>
                                {data.overallStatus.toUpperCase()}
                            </span>
                            <span className="text-sm text-slate-400">
                                {data.activeApps}/{data.totalApps} apps active
                            </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-sm">
                            <div className="text-center">
                                <div className="text-red-400 font-semibold">{data.issues}</div>
                                <div className="text-slate-500">Issues</div>
                            </div>
                            <div className="text-center">
                                <div className="text-yellow-400 font-semibold">{data.warnings}</div>
                                <div className="text-slate-500">Warnings</div>
                            </div>
                            <div className="text-center">
                                <div className="text-slate-300 font-semibold">{formatUptime(data.uptime)}</div>
                                <div className="text-slate-500">Uptime</div>
                            </div>
                        </div>
                        {data.recommendations.length > 0 && (
                            <div className="mt-3">
                                <p className="text-xs text-slate-400 mb-1">Top Recommendations:</p>
                                <ul className="text-xs text-slate-300 space-y-1">
                                    {data.recommendations.map((rec: string, index: number) => (
                                        <li key={index} className="truncate">• {rec}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                );

            case 'notifications':
                return (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-lg font-semibold text-slate-200">{data.total}</span>
                            <span className="text-sm text-slate-400">Total notifications</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="text-center">
                                <div className="text-red-400 font-semibold">{data.unread}</div>
                                <div className="text-slate-500">Unread</div>
                            </div>
                            <div className="text-center">
                                <div className="text-cyan-400 font-semibold">{data.recentActivity}</div>
                                <div className="text-slate-500">Recent</div>
                            </div>
                        </div>
                        {data.recent.length > 0 && (
                            <div className="mt-3">
                                <p className="text-xs text-slate-400 mb-1">Latest:</p>
                                <div className="space-y-1">
                                    {data.recent.slice(0, 3).map((notif: any, index: number) => (
                                        <div key={index} className="text-xs text-slate-300 truncate">
                                            {notif.title}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                );

            case 'mining_status':
                return (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className={`text-lg font-semibold ${getStatusColor(data.status)}`}>
                                {data.status?.toUpperCase() || 'OFFLINE'}
                            </span>
                            <span className="text-sm text-slate-400">Mining Status</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="text-center">
                                <div className="text-cyan-400 font-semibold">{data.blocksFound || 0}</div>
                                <div className="text-slate-500">Blocks</div>
                            </div>
                            <div className="text-center">
                                <div className="text-green-400 font-semibold">{data.hashRate || 0}</div>
                                <div className="text-slate-500">Hash Rate</div>
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-yellow-400 font-semibold">{data.efficiency || 0}%</div>
                            <div className="text-slate-500 text-xs">Efficiency</div>
                        </div>
                    </div>
                );

            case 'user_activity':
                return (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-lg font-semibold text-slate-200">{data.totalUsers}</span>
                            <span className="text-sm text-slate-400">Total Users</span>
                        </div>
                        <div className="text-center">
                            <div className="text-green-400 font-semibold">{data.activeUsers}</div>
                            <div className="text-slate-500 text-sm">Active Now</div>
                        </div>
                        {data.recentActivity.length > 0 && (
                            <div className="mt-3">
                                <p className="text-xs text-slate-400 mb-1">Recent Activity:</p>
                                <div className="space-y-1">
                                    {data.recentActivity.slice(0, 3).map((user: any, index: number) => (
                                        <div key={index} className="text-xs text-slate-300">
                                            {user.username} - {user.appsUsed.join(', ')}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                );

            case 'recent_discoveries':
                return (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-lg font-semibold text-slate-200">{data.total}</span>
                            <span className="text-sm text-slate-400">Discoveries</span>
                        </div>
                        {data.recent.length > 0 ? (
                            <div className="space-y-2">
                                {data.recent.slice(0, 4).map((discovery: any, index: number) => (
                                    <div key={index} className="text-xs text-slate-300 truncate">
                                        {discovery.title || discovery.url || 'Unknown discovery'}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center text-slate-400 text-sm">
                                No recent discoveries
                            </div>
                        )}
                    </div>
                );

            case 'org_overview':
                return (
                    <div className="space-y-3">
                        <div className="text-center">
                            <div className="text-lg font-semibold text-slate-200">{data.companyName || 'No Company'}</div>
                            <div className="text-sm text-slate-400">Organization</div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="text-center">
                                <div className="text-cyan-400 font-semibold">{data.departments || 0}</div>
                                <div className="text-slate-500">Departments</div>
                            </div>
                            <div className="text-center">
                                <div className="text-green-400 font-semibold">{data.totalRoles || 0}</div>
                                <div className="text-slate-500">Total Roles</div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="text-center">
                                <div className="text-blue-400 font-semibold">{data.aiAgents || 0}</div>
                                <div className="text-slate-500">AI Agents</div>
                            </div>
                            <div className="text-center">
                                <div className="text-purple-400 font-semibold">{data.humanRoles || 0}</div>
                                <div className="text-slate-500">Human Roles</div>
                            </div>
                        </div>
                    </div>
                );

            default:
                return (
                    <div className="text-center text-slate-400">
                        Unknown widget type: {type}
                    </div>
                );
        }
    };

    const getWidgetSize = () => {
        switch (size) {
            case 'small': return 'w-64 h-32';
            case 'large': return 'w-96 h-64';
            default: return 'w-80 h-48';
        }
    };

    const handleWidgetClick = () => {
        if (onOpenApp) {
            switch (type) {
                case 'system_health':
                    onOpenApp('SystemAnatomy');
                    break;
                case 'notifications':
                    // Open notification center instead of an app
                    break;
                case 'mining_status':
                    onOpenApp('BitcoinMiner');
                    break;
                case 'user_activity':
                    onOpenApp('UserAccounts');
                    break;
                case 'recent_discoveries':
                    onOpenApp('NexusBrowser');
                    break;
                case 'org_overview':
                    onOpenApp('EnterpriseWorkspace');
                    break;
            }
        }
    };

    return (
        <div 
            className={`${getWidgetSize()} bg-slate-800 rounded-lg border border-slate-700 p-4 hover:border-slate-600 transition-colors cursor-pointer`}
            onClick={handleWidgetClick}
        >
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-slate-300">{title}</h3>
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        loadWidgetData();
                    }}
                    className="text-slate-400 hover:text-slate-200 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                </button>
            </div>
            {renderWidgetContent()}
        </div>
    );
};

export default DashboardWidget;
