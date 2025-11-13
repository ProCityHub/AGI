import bridgeService, { CrossAppNotification } from './bridgeService';

export interface NotificationTemplate {
    id: string;
    name: string;
    title: string;
    messageTemplate: string;
    type: 'info' | 'warning' | 'error' | 'success';
    category: string;
    variables: string[];
    actions?: {
        label: string;
        action: string;
        data?: any;
    }[];
}

export interface NotificationRule {
    id: string;
    name: string;
    eventType: string;
    sourceApp?: string;
    targetApp?: string;
    condition?: string;
    templateId: string;
    enabled: boolean;
    priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface NotificationHistory {
    id: string;
    notification: CrossAppNotification;
    deliveredAt: number;
    readAt?: number;
    actionTaken?: string;
}

// Notification Service Class
class NotificationService {
    private templates: Map<string, NotificationTemplate> = new Map();
    private rules: Map<string, NotificationRule> = new Map();
    private history: NotificationHistory[] = [];

    constructor() {
        this.initializeDefaultTemplates();
        this.initializeDefaultRules();
        this.setupEventListeners();
    }

    // Template Management
    private initializeDefaultTemplates(): void {
        const defaultTemplates: NotificationTemplate[] = [
            {
                id: 'user_login',
                name: 'User Login',
                title: 'User Logged In',
                messageTemplate: 'User {{username}} has logged into the system',
                type: 'info',
                category: 'authentication',
                variables: ['username']
            },
            {
                id: 'directive_saved',
                name: 'Directive Saved',
                title: 'New Directive Saved',
                messageTemplate: 'Directive "{{topic}}" has been saved successfully',
                type: 'success',
                category: 'workflow',
                variables: ['topic'],
                actions: [
                    { label: 'View', action: 'open_directive', data: { directiveId: '{{directiveId}}' } }
                ]
            },
            {
                id: 'system_warning',
                name: 'System Warning',
                title: 'System Warning',
                messageTemplate: 'System warning: {{message}}',
                type: 'warning',
                category: 'system',
                variables: ['message']
            },
            {
                id: 'mining_milestone',
                name: 'Mining Milestone',
                title: 'Mining Milestone Reached',
                messageTemplate: 'Bitcoin mining has reached {{milestone}} blocks mined',
                type: 'success',
                category: 'mining',
                variables: ['milestone']
            },
            {
                id: 'workflow_completed',
                name: 'Workflow Completed',
                title: 'Workflow Completed',
                messageTemplate: 'Workflow "{{workflowName}}" has completed {{status}}',
                type: 'info',
                category: 'workflow',
                variables: ['workflowName', 'status']
            },
            {
                id: 'data_sync_error',
                name: 'Data Sync Error',
                title: 'Data Synchronization Failed',
                messageTemplate: 'Failed to sync data between {{sourceApp}} and {{targetApp}}: {{error}}',
                type: 'error',
                category: 'integration',
                variables: ['sourceApp', 'targetApp', 'error']
            },
            {
                id: 'web_discovery',
                name: 'Web Discovery',
                title: 'New Web Discovery',
                messageTemplate: 'Nexus Browser discovered: {{title}} - {{description}}',
                type: 'info',
                category: 'discovery',
                variables: ['title', 'description'],
                actions: [
                    { label: 'View', action: 'open_browser', data: { url: '{{url}}' } }
                ]
            }
        ];

        defaultTemplates.forEach(template => {
            this.templates.set(template.id, template);
        });
    }

    private initializeDefaultRules(): void {
        const defaultRules: NotificationRule[] = [
            {
                id: 'user_login_rule',
                name: 'Notify on User Login',
                eventType: 'user_logged_in',
                sourceApp: 'UserAccounts',
                templateId: 'user_login',
                enabled: true,
                priority: 'low'
            },
            {
                id: 'directive_saved_rule',
                name: 'Notify on Directive Save',
                eventType: 'directive_saved',
                sourceApp: 'Dashboard',
                templateId: 'directive_saved',
                enabled: true,
                priority: 'medium'
            },
            {
                id: 'system_warning_rule',
                name: 'Notify on System Warnings',
                eventType: 'system_warning',
                sourceApp: 'SystemAnatomy',
                templateId: 'system_warning',
                enabled: true,
                priority: 'high'
            },
            {
                id: 'mining_milestone_rule',
                name: 'Notify on Mining Milestones',
                eventType: 'mining_milestone',
                sourceApp: 'BitcoinMiner',
                templateId: 'mining_milestone',
                enabled: true,
                priority: 'medium'
            },
            {
                id: 'workflow_completed_rule',
                name: 'Notify on Workflow Completion',
                eventType: 'workflow_completed',
                templateId: 'workflow_completed',
                enabled: true,
                priority: 'medium'
            },
            {
                id: 'data_sync_error_rule',
                name: 'Notify on Data Sync Errors',
                eventType: 'data_sync_error',
                templateId: 'data_sync_error',
                enabled: true,
                priority: 'high'
            },
            {
                id: 'web_discovery_rule',
                name: 'Notify on Web Discoveries',
                eventType: 'web_discovery_saved',
                sourceApp: 'NexusBrowser',
                templateId: 'web_discovery',
                enabled: true,
                priority: 'low'
            }
        ];

        defaultRules.forEach(rule => {
            this.rules.set(rule.id, rule);
        });
    }

    private setupEventListeners(): void {
        // Listen to all events and process notification rules
        bridgeService.subscribe('*', (event) => {
            this.processEvent(event);
        });

        // Listen specifically for notification-related events
        bridgeService.subscribe('notification_sent', (event) => {
            this.recordNotificationHistory(event.data);
        });
    }

    private processEvent(event: any): void {
        // Find matching rules for this event
        const matchingRules = Array.from(this.rules.values()).filter(rule => {
            if (!rule.enabled) return false;
            if (rule.eventType !== event.type) return false;
            if (rule.sourceApp && rule.sourceApp !== event.source) return false;
            if (rule.targetApp && rule.targetApp !== event.target) return false;
            
            // TODO: Implement condition evaluation
            if (rule.condition) {
                // For now, skip conditional rules
                return false;
            }
            
            return true;
        });

        // Process each matching rule
        matchingRules.forEach(rule => {
            this.executeNotificationRule(rule, event);
        });
    }

    private executeNotificationRule(rule: NotificationRule, event: any): void {
        const template = this.templates.get(rule.templateId);
        if (!template) {
            console.error(`Template ${rule.templateId} not found for rule ${rule.id}`);
            return;
        }

        try {
            const notification = this.createNotificationFromTemplate(template, event.data, event.source, rule.targetApp);
            bridgeService.sendNotification(notification);
        } catch (error) {
            console.error(`Error creating notification from template ${rule.templateId}:`, error);
        }
    }

    private createNotificationFromTemplate(
        template: NotificationTemplate, 
        data: any, 
        source: string, 
        target?: string
    ): Omit<CrossAppNotification, 'id' | 'timestamp' | 'read'> {
        // Replace template variables
        let title = template.title;
        let message = template.messageTemplate;
        
        template.variables.forEach(variable => {
            const value = this.getNestedValue(data, variable) || `{{${variable}}}`;
            title = title.replace(new RegExp(`{{${variable}}}`, 'g'), String(value));
            message = message.replace(new RegExp(`{{${variable}}}`, 'g'), String(value));
        });

        // Process actions if they exist
        let actions = template.actions;
        if (actions) {
            actions = actions.map(action => ({
                ...action,
                data: this.replaceVariablesInObject(action.data, data)
            }));
        }

        return {
            title,
            message,
            type: template.type,
            source,
            target,
            actions
        };
    }

    private getNestedValue(obj: any, path: string): any {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }

    private replaceVariablesInObject(obj: any, data: any): any {
        if (typeof obj === 'string') {
            let result = obj;
            const matches = obj.match(/{{(\w+)}}/g);
            if (matches) {
                matches.forEach(match => {
                    const variable = match.slice(2, -2);
                    const value = this.getNestedValue(data, variable);
                    if (value !== undefined) {
                        result = result.replace(match, String(value));
                    }
                });
            }
            return result;
        } else if (Array.isArray(obj)) {
            return obj.map(item => this.replaceVariablesInObject(item, data));
        } else if (obj && typeof obj === 'object') {
            const result: any = {};
            for (const [key, value] of Object.entries(obj)) {
                result[key] = this.replaceVariablesInObject(value, data);
            }
            return result;
        }
        return obj;
    }

    private recordNotificationHistory(notification: CrossAppNotification): void {
        const historyEntry: NotificationHistory = {
            id: `history_${notification.id}`,
            notification,
            deliveredAt: Date.now()
        };
        
        this.history.push(historyEntry);
        
        // Keep only last 1000 notifications in history
        if (this.history.length > 1000) {
            this.history.shift();
        }
        
        this.saveHistoryToStorage();
    }

    // Public API Methods
    public sendCustomNotification(
        title: string,
        message: string,
        type: 'info' | 'warning' | 'error' | 'success',
        source: string,
        target?: string,
        actions?: { label: string; action: string; data?: any }[]
    ): void {
        bridgeService.sendNotification({
            title,
            message,
            type,
            source,
            target,
            actions
        });
    }

    public getNotifications(target?: string): CrossAppNotification[] {
        return bridgeService.getNotifications(target);
    }

    public markNotificationRead(id: string): void {
        bridgeService.markNotificationRead(id);
        
        // Update history
        const historyEntry = this.history.find(h => h.notification.id === id);
        if (historyEntry && !historyEntry.readAt) {
            historyEntry.readAt = Date.now();
            this.saveHistoryToStorage();
        }
    }

    public getNotificationHistory(limit?: number): NotificationHistory[] {
        const sorted = this.history.sort((a, b) => b.deliveredAt - a.deliveredAt);
        return limit ? sorted.slice(0, limit) : sorted;
    }

    public addTemplate(template: NotificationTemplate): void {
        this.templates.set(template.id, template);
        this.saveTemplatesToStorage();
    }

    public getTemplates(): NotificationTemplate[] {
        return Array.from(this.templates.values());
    }

    public addRule(rule: NotificationRule): void {
        this.rules.set(rule.id, rule);
        this.saveRulesToStorage();
    }

    public getRules(): NotificationRule[] {
        return Array.from(this.rules.values());
    }

    public enableRule(ruleId: string): void {
        const rule = this.rules.get(ruleId);
        if (rule) {
            rule.enabled = true;
            this.saveRulesToStorage();
        }
    }

    public disableRule(ruleId: string): void {
        const rule = this.rules.get(ruleId);
        if (rule) {
            rule.enabled = false;
            this.saveRulesToStorage();
        }
    }

    public getNotificationStats(): {
        total: number;
        unread: number;
        byType: Record<string, number>;
        bySource: Record<string, number>;
        recentActivity: number;
    } {
        const notifications = this.getNotifications();
        const stats = {
            total: notifications.length,
            unread: notifications.filter(n => !n.read).length,
            byType: {} as Record<string, number>,
            bySource: {} as Record<string, number>,
            recentActivity: notifications.filter(n => Date.now() - n.timestamp < 3600000).length // Last hour
        };

        notifications.forEach(notification => {
            stats.byType[notification.type] = (stats.byType[notification.type] || 0) + 1;
            stats.bySource[notification.source] = (stats.bySource[notification.source] || 0) + 1;
        });

        return stats;
    }

    // Storage methods
    private saveTemplatesToStorage(): void {
        try {
            const templates = Array.from(this.templates.values());
            localStorage.setItem('notification_templates', JSON.stringify(templates));
        } catch (error) {
            console.error('Error saving notification templates:', error);
        }
    }

    private saveRulesToStorage(): void {
        try {
            const rules = Array.from(this.rules.values());
            localStorage.setItem('notification_rules', JSON.stringify(rules));
        } catch (error) {
            console.error('Error saving notification rules:', error);
        }
    }

    private saveHistoryToStorage(): void {
        try {
            // Save only recent history to avoid large storage
            const recentHistory = this.history.slice(-100);
            localStorage.setItem('notification_history', JSON.stringify(recentHistory));
        } catch (error) {
            console.error('Error saving notification history:', error);
        }
    }

    public initialize(): void {
        try {
            // Load templates
            const savedTemplates = localStorage.getItem('notification_templates');
            if (savedTemplates) {
                const templates: NotificationTemplate[] = JSON.parse(savedTemplates);
                templates.forEach(template => {
                    this.templates.set(template.id, template);
                });
            }

            // Load rules
            const savedRules = localStorage.getItem('notification_rules');
            if (savedRules) {
                const rules: NotificationRule[] = JSON.parse(savedRules);
                rules.forEach(rule => {
                    this.rules.set(rule.id, rule);
                });
            }

            // Load history
            const savedHistory = localStorage.getItem('notification_history');
            if (savedHistory) {
                this.history = JSON.parse(savedHistory);
            }

            console.log('Notification Service initialized successfully');
        } catch (error) {
            console.error('Error initializing Notification Service:', error);
        }
    }
}

// Create singleton instance
export const notificationService = new NotificationService();

// Initialize on import
notificationService.initialize();

export default notificationService;
