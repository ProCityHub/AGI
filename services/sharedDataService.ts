import { User, SystemAuditReport, FinancialReport, OrgChart, Block } from '../types';
import bridgeService, { SharedData } from './bridgeService';

// Shared data type definitions
export interface UserProfile extends User {
    preferences: {
        theme: 'dark' | 'light';
        notifications: boolean;
        autoSave: boolean;
        defaultApps: string[];
    };
    activity: {
        lastLogin: number;
        appsUsed: string[];
        totalSessions: number;
    };
    permissions: {
        adminAccess: boolean;
        appPermissions: Record<string, boolean>;
    };
}

export interface SystemSettings {
    id: string;
    autoSyncEnabled: boolean;
    notificationSettings: {
        enabled: boolean;
        types: string[];
        frequency: 'immediate' | 'hourly' | 'daily';
    };
    performanceSettings: {
        maxConcurrentApps: number;
        enableResourceMonitoring: boolean;
        autoOptimize: boolean;
    };
    securitySettings: {
        sessionTimeout: number;
        requireAuth: boolean;
        enableAuditLog: boolean;
    };
    lastModified: number;
}

export interface CrossAppWorkflow {
    id: string;
    name: string;
    description: string;
    steps: {
        app: string;
        action: string;
        data: any;
        condition?: string;
    }[];
    triggers: {
        event: string;
        source: string;
        condition?: string;
    }[];
    enabled: boolean;
    lastExecuted?: number;
}

export interface AppIntegration {
    sourceApp: string;
    targetApp: string;
    dataTypes: string[];
    syncFrequency: 'realtime' | 'hourly' | 'daily' | 'manual';
    lastSync: number;
    enabled: boolean;
    transformRules?: {
        field: string;
        transformation: string;
    }[];
}

// Shared Data Service Class
class SharedDataService {
    // User Profile Management
    async getUserProfile(userId: string): Promise<UserProfile | null> {
        const sharedData = bridgeService.getSharedData(`user_profile_${userId}`, 'SharedDataService');
        return sharedData ? sharedData.data : null;
    }

    async saveUserProfile(profile: UserProfile): Promise<void> {
        const sharedData: Omit<SharedData, 'lastModified'> = {
            id: `user_profile_${profile.id}`,
            type: 'user-profiles',
            data: profile,
            owner: 'UserAccounts',
            permissions: {
                read: ['*'], // All apps can read user profiles
                write: ['UserAccounts', 'Dashboard'] // Only specific apps can modify
            }
        };

        bridgeService.setSharedData(sharedData);
        
        // Notify other apps of profile update
        bridgeService.publish({
            type: 'user_profile_updated',
            source: 'SharedDataService',
            data: { userId: profile.id, profile }
        });
    }

    async getAllUserProfiles(): Promise<UserProfile[]> {
        const profiles = bridgeService.getSharedDataByType('user-profiles', 'SharedDataService');
        return profiles.map(p => p.data);
    }

    // System Settings Management
    async getSystemSettings(): Promise<SystemSettings> {
        const sharedData = bridgeService.getSharedData('system_settings', 'SharedDataService');
        
        if (!sharedData) {
            // Return default settings
            const defaultSettings: SystemSettings = {
                id: 'system_settings',
                autoSyncEnabled: true,
                notificationSettings: {
                    enabled: true,
                    types: ['info', 'warning', 'error'],
                    frequency: 'immediate'
                },
                performanceSettings: {
                    maxConcurrentApps: 10,
                    enableResourceMonitoring: true,
                    autoOptimize: false
                },
                securitySettings: {
                    sessionTimeout: 3600000, // 1 hour
                    requireAuth: true,
                    enableAuditLog: true
                },
                lastModified: Date.now()
            };
            
            await this.saveSystemSettings(defaultSettings);
            return defaultSettings;
        }
        
        return sharedData.data;
    }

    async saveSystemSettings(settings: SystemSettings): Promise<void> {
        const sharedData: Omit<SharedData, 'lastModified'> = {
            id: 'system_settings',
            type: 'system-settings',
            data: { ...settings, lastModified: Date.now() },
            owner: 'SystemAnatomy',
            permissions: {
                read: ['*'],
                write: ['SystemAnatomy', 'UserAccounts']
            }
        };

        bridgeService.setSharedData(sharedData);
        
        bridgeService.publish({
            type: 'system_settings_updated',
            source: 'SharedDataService',
            data: settings
        });
    }

    // Workflow Management
    async getWorkflows(): Promise<CrossAppWorkflow[]> {
        const workflows = bridgeService.getSharedDataByType('workflows', 'SharedDataService');
        return workflows.map(w => w.data);
    }

    async saveWorkflow(workflow: CrossAppWorkflow): Promise<void> {
        const sharedData: Omit<SharedData, 'lastModified'> = {
            id: `workflow_${workflow.id}`,
            type: 'workflows',
            data: workflow,
            owner: 'EnterpriseWorkspace',
            permissions: {
                read: ['*'],
                write: ['EnterpriseWorkspace', 'Dashboard']
            }
        };

        bridgeService.setSharedData(sharedData);
        
        bridgeService.publish({
            type: 'workflow_updated',
            source: 'SharedDataService',
            data: workflow
        });
    }

    async executeWorkflow(workflowId: string, triggerData: any): Promise<any> {
        const workflow = await this.getWorkflow(workflowId);
        if (!workflow || !workflow.enabled) {
            throw new Error('Workflow not found or disabled');
        }

        return bridgeService.executeWorkflow(workflow.name, {
            workflow,
            triggerData
        }, 'SharedDataService');
    }

    async getWorkflow(workflowId: string): Promise<CrossAppWorkflow | null> {
        const sharedData = bridgeService.getSharedData(`workflow_${workflowId}`, 'SharedDataService');
        return sharedData ? sharedData.data : null;
    }

    // App Integration Management
    async getAppIntegrations(): Promise<AppIntegration[]> {
        const integrations = bridgeService.getSharedDataByType('app-integrations', 'SharedDataService');
        return integrations.map(i => i.data);
    }

    async saveAppIntegration(integration: AppIntegration): Promise<void> {
        const sharedData: Omit<SharedData, 'lastModified'> = {
            id: `integration_${integration.sourceApp}_${integration.targetApp}`,
            type: 'app-integrations',
            data: integration,
            owner: 'BridgeService',
            permissions: {
                read: ['*'],
                write: ['SystemAnatomy', 'EnterpriseWorkspace']
            }
        };

        bridgeService.setSharedData(sharedData);
        
        bridgeService.publish({
            type: 'app_integration_updated',
            source: 'SharedDataService',
            data: integration
        });
    }

    // Organizational Data Management
    async getOrgStructure(): Promise<OrgChart | null> {
        const sharedData = bridgeService.getSharedData('org_structure', 'SharedDataService');
        return sharedData ? sharedData.data : null;
    }

    async saveOrgStructure(orgChart: OrgChart): Promise<void> {
        const sharedData: Omit<SharedData, 'lastModified'> = {
            id: 'org_structure',
            type: 'org-structure',
            data: orgChart,
            owner: 'EnterpriseWorkspace',
            permissions: {
                read: ['*'],
                write: ['EnterpriseWorkspace', 'FormProcessor']
            }
        };

        bridgeService.setSharedData(sharedData);
        
        bridgeService.publish({
            type: 'org_structure_updated',
            source: 'SharedDataService',
            data: orgChart
        });
    }

    // Mining Metrics Management
    async getMiningMetrics(): Promise<any> {
        const sharedData = bridgeService.getSharedData('mining_metrics', 'SharedDataService');
        return sharedData ? sharedData.data : null;
    }

    async saveMiningMetrics(metrics: any): Promise<void> {
        const sharedData: Omit<SharedData, 'lastModified'> = {
            id: 'mining_metrics',
            type: 'mining-metrics',
            data: metrics,
            owner: 'BitcoinMiner',
            permissions: {
                read: ['*'],
                write: ['BitcoinMiner']
            }
        };

        bridgeService.setSharedData(sharedData);
        
        bridgeService.publish({
            type: 'mining_metrics_updated',
            source: 'SharedDataService',
            data: metrics
        });
    }

    // Web Discoveries Management
    async getWebDiscoveries(): Promise<any[]> {
        const discoveries = bridgeService.getSharedDataByType('web-discoveries', 'SharedDataService');
        return discoveries.map(d => d.data);
    }

    async saveWebDiscovery(discovery: any): Promise<void> {
        const sharedData: Omit<SharedData, 'lastModified'> = {
            id: `discovery_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: 'web-discoveries',
            data: discovery,
            owner: 'NexusBrowser',
            permissions: {
                read: ['*'],
                write: ['NexusBrowser', 'Codex', 'AegisCommand']
            }
        };

        bridgeService.setSharedData(sharedData);
        
        bridgeService.publish({
            type: 'web_discovery_saved',
            source: 'SharedDataService',
            data: discovery
        });
    }

    // System Metrics for Health Monitoring
    async getSystemMetrics(): Promise<any> {
        const sharedData = bridgeService.getSharedData('system_metrics', 'SharedDataService');
        return sharedData ? sharedData.data : {
            timestamp: Date.now(),
            apps: {},
            performance: {
                memoryUsage: 0,
                cpuUsage: 0,
                activeConnections: 0
            },
            health: 'unknown'
        };
    }

    async updateSystemMetrics(metrics: any): Promise<void> {
        const sharedData: Omit<SharedData, 'lastModified'> = {
            id: 'system_metrics',
            type: 'system-metrics',
            data: { ...metrics, timestamp: Date.now() },
            owner: 'SystemAnatomy',
            permissions: {
                read: ['*'],
                write: ['SystemAnatomy']
            }
        };

        bridgeService.setSharedData(sharedData);
        
        bridgeService.publish({
            type: 'system_metrics_updated',
            source: 'SharedDataService',
            data: metrics
        });
    }

    // Bulk data operations
    async exportAllData(): Promise<Record<string, any>> {
        const allData: Record<string, any> = {};
        
        const dataTypes = ['user-profiles', 'system-settings', 'workflows', 'app-integrations', 
                          'org-structure', 'mining-metrics', 'web-discoveries', 'system-metrics'];
        
        for (const type of dataTypes) {
            const data = bridgeService.getSharedDataByType(type, 'SharedDataService');
            allData[type] = data.map(d => d.data);
        }
        
        return allData;
    }

    async importData(data: Record<string, any[]>): Promise<void> {
        for (const [type, items] of Object.entries(data)) {
            if (Array.isArray(items)) {
                for (const item of items) {
                    if (item && typeof item === 'object' && item.id) {
                        const sharedData: Omit<SharedData, 'lastModified'> = {
                            id: item.id,
                            type: type,
                            data: item,
                            owner: 'SharedDataService',
                            permissions: {
                                read: ['*'],
                                write: ['*']
                            }
                        };
                        bridgeService.setSharedData(sharedData);
                    }
                }
            }
        }
        
        bridgeService.publish({
            type: 'bulk_data_imported',
            source: 'SharedDataService',
            data: { types: Object.keys(data) }
        });
    }
}

// Create singleton instance
export const sharedDataService = new SharedDataService();

export default sharedDataService;
