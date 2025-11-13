import { AppContext, User, SavedDirective, SystemAuditReport, FinancialReport, Block } from '../types';

// Event types for inter-app communication
export interface BridgeEvent {
    type: string;
    source: string;
    target?: string; // undefined means broadcast to all
    data: any;
    timestamp: number;
    id: string;
}

export interface AppCapability {
    appName: string;
    capabilities: string[];
    dataTypes: string[];
    eventTypes: string[];
}

export interface SharedData {
    id: string;
    type: string;
    data: any;
    owner: string;
    lastModified: number;
    permissions: {
        read: string[];
        write: string[];
    };
}

export interface CrossAppNotification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'error' | 'success';
    source: string;
    target?: string;
    timestamp: number;
    read: boolean;
    actions?: {
        label: string;
        action: string;
        data?: any;
    }[];
}

// Central Bridge Service Class
class BridgeService {
    private eventListeners: Map<string, ((event: BridgeEvent) => void)[]> = new Map();
    private appCapabilities: Map<string, AppCapability> = new Map();
    private sharedData: Map<string, SharedData> = new Map();
    private notifications: CrossAppNotification[] = [];
    private eventHistory: BridgeEvent[] = [];

    // Event Management
    subscribe(eventType: string, callback: (event: BridgeEvent) => void): () => void {
        if (!this.eventListeners.has(eventType)) {
            this.eventListeners.set(eventType, []);
        }
        this.eventListeners.get(eventType)!.push(callback);

        // Return unsubscribe function
        return () => {
            const listeners = this.eventListeners.get(eventType);
            if (listeners) {
                const index = listeners.indexOf(callback);
                if (index > -1) {
                    listeners.splice(index, 1);
                }
            }
        };
    }

    publish(event: Omit<BridgeEvent, 'id' | 'timestamp'>): void {
        const fullEvent: BridgeEvent = {
            ...event,
            id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: Date.now()
        };

        // Store in history
        this.eventHistory.push(fullEvent);
        if (this.eventHistory.length > 1000) {
            this.eventHistory.shift(); // Keep only last 1000 events
        }

        // Notify listeners
        const listeners = this.eventListeners.get(event.type) || [];
        const broadcastListeners = this.eventListeners.get('*') || [];
        
        [...listeners, ...broadcastListeners].forEach(callback => {
            try {
                callback(fullEvent);
            } catch (error) {
                console.error('Error in event listener:', error);
            }
        });

        // Save to persistent storage
        this.saveEventHistory();
    }

    // App Registration
    registerApp(capability: AppCapability): void {
        this.appCapabilities.set(capability.appName, capability);
        this.publish({
            type: 'app_registered',
            source: 'BridgeService',
            data: capability
        });
    }

    getAppCapabilities(appName?: string): AppCapability | AppCapability[] {
        if (appName) {
            return this.appCapabilities.get(appName) || {
                appName,
                capabilities: [],
                dataTypes: [],
                eventTypes: []
            };
        }
        return Array.from(this.appCapabilities.values());
    }

    // Shared Data Management
    setSharedData(data: Omit<SharedData, 'lastModified'>): void {
        const sharedData: SharedData = {
            ...data,
            lastModified: Date.now()
        };
        
        this.sharedData.set(data.id, sharedData);
        
        this.publish({
            type: 'shared_data_updated',
            source: data.owner,
            data: { id: data.id, type: data.type }
        });

        // Save to file
        this.saveSharedDataToFile(sharedData);
    }

    getSharedData(id: string, requester: string): SharedData | null {
        const data = this.sharedData.get(id);
        if (!data) return null;

        // Check permissions
        if (!data.permissions.read.includes('*') && 
            !data.permissions.read.includes(requester) && 
            data.owner !== requester) {
            return null;
        }

        return data;
    }

    getSharedDataByType(type: string, requester: string): SharedData[] {
        return Array.from(this.sharedData.values()).filter(data => {
            if (data.type !== type) return false;
            
            // Check permissions
            return data.permissions.read.includes('*') || 
                   data.permissions.read.includes(requester) || 
                   data.owner === requester;
        });
    }

    // Notification Management
    sendNotification(notification: Omit<CrossAppNotification, 'id' | 'timestamp' | 'read'>): void {
        const fullNotification: CrossAppNotification = {
            ...notification,
            id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: Date.now(),
            read: false
        };

        this.notifications.push(fullNotification);
        
        this.publish({
            type: 'notification_sent',
            source: notification.source,
            target: notification.target,
            data: fullNotification
        });

        // Save notifications to file
        this.saveNotificationsToFile();
    }

    getNotifications(target?: string): CrossAppNotification[] {
        return this.notifications.filter(notif => 
            !target || !notif.target || notif.target === target
        ).sort((a, b) => b.timestamp - a.timestamp);
    }

    markNotificationRead(id: string): void {
        const notification = this.notifications.find(n => n.id === id);
        if (notification) {
            notification.read = true;
            this.saveNotificationsToFile();
        }
    }

    // Cross-App Workflows
    executeWorkflow(workflowName: string, data: any, initiator: string): Promise<any> {
        return new Promise((resolve, reject) => {
            const workflowId = `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            this.publish({
                type: 'workflow_started',
                source: initiator,
                data: { workflowName, workflowId, data }
            });

            // Set up workflow completion listener
            const unsubscribe = this.subscribe('workflow_completed', (event) => {
                if (event.data.workflowId === workflowId) {
                    unsubscribe();
                    if (event.data.success) {
                        resolve(event.data.result);
                    } else {
                        reject(new Error(event.data.error));
                    }
                }
            });

            // Set timeout for workflow
            setTimeout(() => {
                unsubscribe();
                reject(new Error('Workflow timeout'));
            }, 30000); // 30 second timeout
        });
    }

    // File-based persistence methods
    private saveSharedDataToFile(data: SharedData): void {
        try {
            const existingData = this.loadFromFile(`shared/${data.type}.json`) || {};
            existingData[data.id] = data;
            this.saveToFile(`shared/${data.type}.json`, existingData);
        } catch (error) {
            console.error('Error saving shared data to file:', error);
        }
    }

    private saveNotificationsToFile(): void {
        try {
            this.saveToFile('shared/notifications.json', this.notifications);
        } catch (error) {
            console.error('Error saving notifications to file:', error);
        }
    }

    private saveEventHistory(): void {
        try {
            // Save only recent events to avoid large files
            const recentEvents = this.eventHistory.slice(-100);
            this.saveToFile('shared/event-history.json', recentEvents);
        } catch (error) {
            console.error('Error saving event history to file:', error);
        }
    }

    private saveToFile(path: string, data: any): void {
        try {
            localStorage.setItem(`bridge_${path}`, JSON.stringify(data));
        } catch (error) {
            console.error(`Error saving to ${path}:`, error);
        }
    }

    private loadFromFile(path: string): any {
        try {
            const data = localStorage.getItem(`bridge_${path}`);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error(`Error loading from ${path}:`, error);
            return null;
        }
    }

    // Initialize service with saved data
    initialize(): void {
        try {
            // Load notifications
            const savedNotifications = this.loadFromFile('shared/notifications.json');
            if (savedNotifications && Array.isArray(savedNotifications)) {
                this.notifications = savedNotifications;
            }

            // Load event history
            const savedEvents = this.loadFromFile('shared/event-history.json');
            if (savedEvents && Array.isArray(savedEvents)) {
                this.eventHistory = savedEvents;
            }

            // Load shared data files
            const dataTypes = ['user-profiles', 'system-settings', 'org-structure', 'mining-metrics', 'web-discoveries'];
            dataTypes.forEach(type => {
                const data = this.loadFromFile(`shared/${type}.json`);
                if (data && typeof data === 'object') {
                    Object.values(data).forEach((item: any) => {
                        if (item && item.id) {
                            this.sharedData.set(item.id, item);
                        }
                    });
                }
            });

            console.log('Bridge Service initialized successfully');
        } catch (error) {
            console.error('Error initializing Bridge Service:', error);
        }
    }

    // Health check for system monitoring
    getHealthStatus(): {
        status: 'healthy' | 'warning' | 'error';
        metrics: {
            registeredApps: number;
            activeListeners: number;
            sharedDataItems: number;
            unreadNotifications: number;
            recentEvents: number;
        };
        issues: string[];
    } {
        const issues: string[] = [];
        let status: 'healthy' | 'warning' | 'error' = 'healthy';

        const metrics = {
            registeredApps: this.appCapabilities.size,
            activeListeners: Array.from(this.eventListeners.values()).reduce((sum, listeners) => sum + listeners.length, 0),
            sharedDataItems: this.sharedData.size,
            unreadNotifications: this.notifications.filter(n => !n.read).length,
            recentEvents: this.eventHistory.filter(e => Date.now() - e.timestamp < 3600000).length // Last hour
        };

        // Check for issues
        if (metrics.registeredApps === 0) {
            issues.push('No apps registered');
            status = 'warning';
        }

        if (metrics.unreadNotifications > 50) {
            issues.push('Too many unread notifications');
            status = 'warning';
        }

        if (metrics.recentEvents === 0) {
            issues.push('No recent activity');
            status = 'warning';
        }

        return { status, metrics, issues };
    }
}

// Create singleton instance
export const bridgeService = new BridgeService();

// Initialize on import
bridgeService.initialize();

export default bridgeService;
