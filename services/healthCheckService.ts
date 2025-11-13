import bridgeService from './bridgeService';
import sharedDataService from './sharedDataService';
import notificationService from './notificationService';

export interface AppHealthStatus {
    appName: string;
    status: 'healthy' | 'warning' | 'error' | 'offline';
    lastCheck: number;
    responseTime: number;
    metrics: {
        memoryUsage?: number;
        cpuUsage?: number;
        activeConnections?: number;
        errorRate?: number;
        uptime?: number;
    };
    issues: string[];
    capabilities: string[];
}

export interface SystemHealthReport {
    timestamp: number;
    overallStatus: 'healthy' | 'warning' | 'error';
    apps: AppHealthStatus[];
    systemMetrics: {
        totalMemoryUsage: number;
        totalCpuUsage: number;
        activeApps: number;
        totalConnections: number;
        systemUptime: number;
    };
    bridgeServiceHealth: {
        status: 'healthy' | 'warning' | 'error';
        metrics: {
            registeredApps: number;
            activeListeners: number;
            sharedDataItems: number;
            unreadNotifications: number;
            recentEvents: number;
        };
        issues: string[];
    };
    recommendations: string[];
}

export interface HealthCheckConfig {
    checkInterval: number; // milliseconds
    timeout: number; // milliseconds
    retryAttempts: number;
    alertThresholds: {
        memoryUsage: number; // percentage
        cpuUsage: number; // percentage
        responseTime: number; // milliseconds
        errorRate: number; // percentage
    };
}

// Health Check Service Class
class HealthCheckService {
    private config: HealthCheckConfig;
    private appHealthStatus: Map<string, AppHealthStatus> = new Map();
    private systemStartTime: number = Date.now();
    private checkInterval: NodeJS.Timeout | null = null;
    private isRunning: boolean = false;

    constructor() {
        this.config = {
            checkInterval: 30000, // 30 seconds
            timeout: 5000, // 5 seconds
            retryAttempts: 3,
            alertThresholds: {
                memoryUsage: 80, // 80%
                cpuUsage: 70, // 70%
                responseTime: 2000, // 2 seconds
                errorRate: 5 // 5%
            }
        };

        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        // Listen for app registration events
        bridgeService.subscribe('app_registered', (event) => {
            this.registerApp(event.data.appName, event.data.capabilities);
        });

        // Listen for health check requests
        bridgeService.subscribe('health_check_request', (event) => {
            this.handleHealthCheckRequest(event);
        });

        // Listen for app health updates
        bridgeService.subscribe('app_health_update', (event) => {
            this.updateAppHealth(event.data);
        });
    }

    private registerApp(appName: string, capabilities: string[]): void {
        const healthStatus: AppHealthStatus = {
            appName,
            status: 'healthy',
            lastCheck: Date.now(),
            responseTime: 0,
            metrics: {},
            issues: [],
            capabilities
        };

        this.appHealthStatus.set(appName, healthStatus);
        console.log(`Registered app for health monitoring: ${appName}`);
    }

    private async handleHealthCheckRequest(event: any): Promise<void> {
        const { source } = event;
        const startTime = Date.now();

        try {
            // Simulate health check response
            const responseTime = Date.now() - startTime;
            
            bridgeService.publish({
                type: 'health_check_response',
                source: 'HealthCheckService',
                target: source,
                data: {
                    status: 'healthy',
                    responseTime,
                    timestamp: Date.now(),
                    metrics: this.generateMockMetrics()
                }
            });
        } catch (error) {
            console.error(`Health check failed for ${source}:`, error);
        }
    }

    private generateMockMetrics(): any {
        return {
            memoryUsage: Math.random() * 100,
            cpuUsage: Math.random() * 100,
            activeConnections: Math.floor(Math.random() * 50),
            errorRate: Math.random() * 10,
            uptime: Date.now() - this.systemStartTime
        };
    }

    private updateAppHealth(healthData: any): void {
        const { appName, status, metrics, issues } = healthData;
        const existingHealth = this.appHealthStatus.get(appName);

        if (existingHealth) {
            existingHealth.status = status;
            existingHealth.lastCheck = Date.now();
            existingHealth.metrics = { ...existingHealth.metrics, ...metrics };
            existingHealth.issues = issues || [];
            
            this.appHealthStatus.set(appName, existingHealth);
        }
    }

    public async performHealthCheck(appName?: string): Promise<AppHealthStatus | AppHealthStatus[]> {
        if (appName) {
            return this.checkSingleApp(appName);
        } else {
            return this.checkAllApps();
        }
    }

    private async checkSingleApp(appName: string): Promise<AppHealthStatus> {
        const startTime = Date.now();
        let status: 'healthy' | 'warning' | 'error' | 'offline' = 'healthy';
        let responseTime = 0;
        let metrics = {};
        let issues: string[] = [];

        try {
            // Send health check request
            bridgeService.publish({
                type: 'health_check_request',
                source: 'HealthCheckService',
                target: appName,
                data: { timestamp: startTime }
            });

            // Wait for response with timeout
            const response = await this.waitForHealthResponse(appName, this.config.timeout);
            responseTime = Date.now() - startTime;

            if (response) {
                status = response.status || 'healthy';
                metrics = response.metrics || {};
                
                // Check thresholds
                issues = this.checkThresholds(metrics, responseTime);
                if (issues.length > 0) {
                    status = 'warning';
                }
            } else {
                status = 'offline';
                issues.push('No response to health check');
            }
        } catch (error) {
            status = 'error';
            issues.push(`Health check failed: ${error}`);
            responseTime = Date.now() - startTime;
        }

        const healthStatus: AppHealthStatus = {
            appName,
            status,
            lastCheck: Date.now(),
            responseTime,
            metrics,
            issues,
            capabilities: this.appHealthStatus.get(appName)?.capabilities || []
        };

        this.appHealthStatus.set(appName, healthStatus);
        return healthStatus;
    }

    private async checkAllApps(): Promise<AppHealthStatus[]> {
        const apps = Array.from(this.appHealthStatus.keys());
        const healthChecks = apps.map(app => this.checkSingleApp(app));
        
        try {
            return await Promise.all(healthChecks);
        } catch (error) {
            console.error('Error performing health checks:', error);
            return Array.from(this.appHealthStatus.values());
        }
    }

    private async waitForHealthResponse(appName: string, timeout: number): Promise<any> {
        return new Promise((resolve) => {
            let responseReceived = false;
            
            const unsubscribe = bridgeService.subscribe('health_check_response', (event) => {
                if (event.source === appName && !responseReceived) {
                    responseReceived = true;
                    unsubscribe();
                    resolve(event.data);
                }
            });

            setTimeout(() => {
                if (!responseReceived) {
                    responseReceived = true;
                    unsubscribe();
                    resolve(null);
                }
            }, timeout);
        });
    }

    private checkThresholds(metrics: any, responseTime: number): string[] {
        const issues: string[] = [];
        const thresholds = this.config.alertThresholds;

        if (metrics.memoryUsage && metrics.memoryUsage > thresholds.memoryUsage) {
            issues.push(`High memory usage: ${metrics.memoryUsage.toFixed(1)}%`);
        }

        if (metrics.cpuUsage && metrics.cpuUsage > thresholds.cpuUsage) {
            issues.push(`High CPU usage: ${metrics.cpuUsage.toFixed(1)}%`);
        }

        if (responseTime > thresholds.responseTime) {
            issues.push(`Slow response time: ${responseTime}ms`);
        }

        if (metrics.errorRate && metrics.errorRate > thresholds.errorRate) {
            issues.push(`High error rate: ${metrics.errorRate.toFixed(1)}%`);
        }

        return issues;
    }

    public async generateSystemHealthReport(): Promise<SystemHealthReport> {
        const appHealthStatuses = await this.checkAllApps();
        const bridgeHealth = bridgeService.getHealthStatus();
        
        // Calculate overall system status
        let overallStatus: 'healthy' | 'warning' | 'error' = 'healthy';
        const errorApps = appHealthStatuses.filter(app => app.status === 'error').length;
        const warningApps = appHealthStatuses.filter(app => app.status === 'warning').length;
        
        if (errorApps > 0 || bridgeHealth.status === 'error') {
            overallStatus = 'error';
        } else if (warningApps > 0 || bridgeHealth.status === 'warning') {
            overallStatus = 'warning';
        }

        // Calculate system metrics
        const systemMetrics = {
            totalMemoryUsage: this.calculateAverageMetric(appHealthStatuses, 'memoryUsage'),
            totalCpuUsage: this.calculateAverageMetric(appHealthStatuses, 'cpuUsage'),
            activeApps: appHealthStatuses.filter(app => app.status !== 'offline').length,
            totalConnections: this.calculateSumMetric(appHealthStatuses, 'activeConnections'),
            systemUptime: Date.now() - this.systemStartTime
        };

        // Generate recommendations
        const recommendations = this.generateRecommendations(appHealthStatuses, systemMetrics, bridgeHealth);

        const report: SystemHealthReport = {
            timestamp: Date.now(),
            overallStatus,
            apps: appHealthStatuses,
            systemMetrics,
            bridgeServiceHealth: bridgeHealth,
            recommendations
        };

        // Save report to shared data
        await sharedDataService.updateSystemMetrics({
            healthReport: report,
            timestamp: Date.now()
        });

        // Send notifications for critical issues
        if (overallStatus === 'error') {
            notificationService.sendCustomNotification(
                'System Health Alert',
                'Critical system health issues detected. Check System Anatomy for details.',
                'error',
                'HealthCheckService'
            );
        }

        return report;
    }

    private calculateAverageMetric(apps: AppHealthStatus[], metricName: string): number {
        const values = apps
            .map(app => app.metrics[metricName])
            .filter(value => typeof value === 'number') as number[];
        
        return values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
    }

    private calculateSumMetric(apps: AppHealthStatus[], metricName: string): number {
        const values = apps
            .map(app => app.metrics[metricName])
            .filter(value => typeof value === 'number') as number[];
        
        return values.reduce((sum, val) => sum + val, 0);
    }

    private generateRecommendations(
        apps: AppHealthStatus[], 
        systemMetrics: any, 
        bridgeHealth: any
    ): string[] {
        const recommendations: string[] = [];

        // App-specific recommendations
        const offlineApps = apps.filter(app => app.status === 'offline');
        if (offlineApps.length > 0) {
            recommendations.push(`Restart offline apps: ${offlineApps.map(app => app.appName).join(', ')}`);
        }

        const highMemoryApps = apps.filter(app => 
            app.metrics.memoryUsage && app.metrics.memoryUsage > this.config.alertThresholds.memoryUsage
        );
        if (highMemoryApps.length > 0) {
            recommendations.push(`Optimize memory usage for: ${highMemoryApps.map(app => app.appName).join(', ')}`);
        }

        // System-wide recommendations
        if (systemMetrics.totalMemoryUsage > 85) {
            recommendations.push('Consider closing unused applications to free memory');
        }

        if (systemMetrics.totalCpuUsage > 80) {
            recommendations.push('System CPU usage is high - consider reducing concurrent operations');
        }

        // Bridge service recommendations
        if (bridgeHealth.metrics.unreadNotifications > 20) {
            recommendations.push('Clear unread notifications to improve performance');
        }

        if (bridgeHealth.metrics.registeredApps < 5) {
            recommendations.push('Some apps may not be properly registered with the bridge service');
        }

        return recommendations;
    }

    public startMonitoring(): void {
        if (this.isRunning) {
            console.log('Health monitoring is already running');
            return;
        }

        this.isRunning = true;
        this.checkInterval = setInterval(async () => {
            try {
                await this.generateSystemHealthReport();
            } catch (error) {
                console.error('Error during scheduled health check:', error);
            }
        }, this.config.checkInterval);

        console.log(`Health monitoring started with ${this.config.checkInterval}ms interval`);
    }

    public stopMonitoring(): void {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
        this.isRunning = false;
        console.log('Health monitoring stopped');
    }

    public updateConfig(newConfig: Partial<HealthCheckConfig>): void {
        this.config = { ...this.config, ...newConfig };
        
        // Restart monitoring with new config if it was running
        if (this.isRunning) {
            this.stopMonitoring();
            this.startMonitoring();
        }
    }

    public getConfig(): HealthCheckConfig {
        return { ...this.config };
    }

    public getAppHealth(appName: string): AppHealthStatus | null {
        return this.appHealthStatus.get(appName) || null;
    }

    public getAllAppHealth(): AppHealthStatus[] {
        return Array.from(this.appHealthStatus.values());
    }

    public async triggerEmergencyCheck(): Promise<SystemHealthReport> {
        console.log('Emergency health check triggered');
        const report = await this.generateSystemHealthReport();
        
        // Send immediate notification
        notificationService.sendCustomNotification(
            'Emergency Health Check Complete',
            `System status: ${report.overallStatus}. ${report.recommendations.length} recommendations generated.`,
            report.overallStatus === 'healthy' ? 'success' : 'warning',
            'HealthCheckService'
        );

        return report;
    }

    public initialize(): void {
        console.log('Health Check Service initialized');
        
        // Register default apps that should be monitored
        const defaultApps = [
            'Dashboard', 'EnterpriseWorkspace', 'FileExplorer', 'SystemAnatomy',
            'FormProcessor', 'UserAccounts', 'NexusBrowser', 'BitcoinMiner',
            'Codex', 'AegisCommand'
        ];

        defaultApps.forEach(appName => {
            this.registerApp(appName, []);
        });

        // Start monitoring
        this.startMonitoring();
    }
}

// Create singleton instance
export const healthCheckService = new HealthCheckService();

export default healthCheckService;
