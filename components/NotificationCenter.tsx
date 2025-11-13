import React, { useState, useEffect } from 'react';
import { CrossAppNotification } from '../services/bridgeService';
import notificationService from '../services/notificationService';

interface NotificationCenterProps {
    isOpen: boolean;
    onClose: () => void;
    targetApp?: string;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose, targetApp }) => {
    const [notifications, setNotifications] = useState<CrossAppNotification[]>([]);
    const [filter, setFilter] = useState<'all' | 'unread' | 'info' | 'warning' | 'error' | 'success'>('all');
    const [stats, setStats] = useState<any>({});

    useEffect(() => {
        if (isOpen) {
            loadNotifications();
            loadStats();
        }
    }, [isOpen, filter, targetApp]);

    const loadNotifications = () => {
        let allNotifications = notificationService.getNotifications(targetApp);
        
        // Apply filter
        switch (filter) {
            case 'unread':
                allNotifications = allNotifications.filter(n => !n.read);
                break;
            case 'info':
            case 'warning':
            case 'error':
            case 'success':
                allNotifications = allNotifications.filter(n => n.type === filter);
                break;
        }
        
        setNotifications(allNotifications);
    };

    const loadStats = () => {
        const notificationStats = notificationService.getNotificationStats();
        setStats(notificationStats);
    };

    const handleMarkAsRead = (id: string) => {
        notificationService.markNotificationRead(id);
        loadNotifications();
        loadStats();
    };

    const handleMarkAllAsRead = () => {
        notifications.forEach(notification => {
            if (!notification.read) {
                notificationService.markNotificationRead(notification.id);
            }
        });
        loadNotifications();
        loadStats();
    };

    const handleNotificationAction = (notification: CrossAppNotification, action: any) => {
        // Handle notification actions (e.g., open app, navigate to specific view)
        console.log('Notification action:', action, notification);
        
        // Mark as read when action is taken
        if (!notification.read) {
            handleMarkAsRead(notification.id);
        }
        
        // TODO: Implement action handling based on action.action
        switch (action.action) {
            case 'open_directive':
                // Open Dashboard with specific directive
                break;
            case 'open_browser':
                // Open Nexus Browser with specific URL
                break;
            default:
                console.log('Unknown action:', action.action);
        }
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'info':
                return (
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                    </div>
                );
            case 'success':
                return (
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                    </div>
                );
            case 'warning':
                return (
                    <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                    </div>
                );
            case 'error':
                return (
                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                    </div>
                );
            default:
                return (
                    <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                    </div>
                );
        }
    };

    const formatTimestamp = (timestamp: number) => {
        const now = Date.now();
        const diff = now - timestamp;
        
        if (diff < 60000) { // Less than 1 minute
            return 'Just now';
        } else if (diff < 3600000) { // Less than 1 hour
            const minutes = Math.floor(diff / 60000);
            return `${minutes}m ago`;
        } else if (diff < 86400000) { // Less than 1 day
            const hours = Math.floor(diff / 3600000);
            return `${hours}h ago`;
        } else {
            const days = Math.floor(diff / 86400000);
            return `${days}d ago`;
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-slate-800 rounded-lg shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-700">
                    <div className="flex items-center space-x-4">
                        <h2 className="text-xl font-semibold text-slate-200">Notification Center</h2>
                        {stats.unread > 0 && (
                            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                                {stats.unread} unread
                            </span>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-200 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Stats Bar */}
                <div className="px-6 py-3 bg-slate-750 border-b border-slate-700">
                    <div className="flex items-center justify-between text-sm text-slate-400">
                        <div className="flex space-x-4">
                            <span>Total: {stats.total}</span>
                            <span>Unread: {stats.unread}</span>
                            <span>Recent: {stats.recentActivity}</span>
                        </div>
                        {notifications.filter(n => !n.read).length > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                className="text-cyan-400 hover:text-cyan-300 transition-colors"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="px-6 py-3 border-b border-slate-700">
                    <div className="flex space-x-1">
                        {['all', 'unread', 'info', 'success', 'warning', 'error'].map((filterType) => (
                            <button
                                key={filterType}
                                onClick={() => setFilter(filterType as any)}
                                className={`px-3 py-1 rounded text-sm transition-colors ${
                                    filter === filterType
                                        ? 'bg-cyan-500 text-white'
                                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                                }`}
                            >
                                {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Notifications List */}
                <div className="flex-1 overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="flex items-center justify-center h-32 text-slate-400">
                            No notifications to display
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-700">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`p-4 hover:bg-slate-750 transition-colors ${
                                        !notification.read ? 'bg-slate-750/50' : ''
                                    }`}
                                >
                                    <div className="flex items-start space-x-3">
                                        {getNotificationIcon(notification.type)}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <h3 className={`text-sm font-medium ${
                                                    !notification.read ? 'text-slate-200' : 'text-slate-300'
                                                }`}>
                                                    {notification.title}
                                                </h3>
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-xs text-slate-500">
                                                        {formatTimestamp(notification.timestamp)}
                                                    </span>
                                                    {!notification.read && (
                                                        <button
                                                            onClick={() => handleMarkAsRead(notification.id)}
                                                            className="text-xs text-cyan-400 hover:text-cyan-300"
                                                        >
                                                            Mark read
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-sm text-slate-400 mt-1">
                                                {notification.message}
                                            </p>
                                            <div className="flex items-center justify-between mt-2">
                                                <span className="text-xs text-slate-500">
                                                    From: {notification.source}
                                                </span>
                                                {notification.actions && notification.actions.length > 0 && (
                                                    <div className="flex space-x-2">
                                                        {notification.actions.map((action, index) => (
                                                            <button
                                                                key={index}
                                                                onClick={() => handleNotificationAction(notification, action)}
                                                                className="text-xs bg-cyan-500 hover:bg-cyan-600 text-white px-2 py-1 rounded transition-colors"
                                                            >
                                                                {action.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-3 border-t border-slate-700 bg-slate-750">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>
                            Showing {notifications.length} of {stats.total} notifications
                        </span>
                        <span>
                            Press Ctrl+Shift+N to open notification center
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotificationCenter;
