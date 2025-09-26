

import React, { useState, useEffect } from 'react';
import { Plugin, SynergyProtocol } from '../types';
import { generateSynergyProtocol } from '../services/geminiService';
import { getApiKeys, saveApiKey, clearApiKey } from '../services/storageService';
import { ApiIcon, KnowledgeBaseIcon, SlackIcon, CheckIcon, SparklesIcon, PlusIcon, CloseIcon } from './icons';
import SkeletonLoader from './SkeletonLoader';

const SynergyProtocolSkeleton = () => (
    <div className="glass-panel p-4 rounded-lg">
        <SkeletonLoader className="h-7 w-3/4 mb-2" />
        <SkeletonLoader className="h-4 w-full mb-4" />
        <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-[var(--sol-bg-end)] p-3 rounded-lg border border-[var(--sol-panel-border)]">
                    <SkeletonLoader className="h-5 w-1/3 mb-2" />
                    <SkeletonLoader className="h-4 w-full mb-1" />
                    <SkeletonLoader className="h-3 w-2/3" />
                </div>
            ))}
        </div>
    </div>
);

const NexusBrowser: React.FC = () => {
    const availablePlugins: Plugin[] = [
        { id: 'api', name: 'Generic REST API', description: 'Interact with any RESTful API to fetch or send data.', icon: <ApiIcon className="h-8 w-8" /> },
        { id: 'kb', name: 'Knowledge Base', description: 'Search and retrieve information from internal documentation.', icon: <KnowledgeBaseIcon className="h-8 w-8" /> },
        { id: 'slack', name: 'Slack Messenger', description: 'Send messages and notifications to Slack channels.', icon: <SlackIcon className="h-8 w-8" /> },
    ];

    const [installedPlugins, setInstalledPlugins] = useState<Plugin[]>([]);
    const [mandate, setMandate] = useState('');
    const [selectedPlugins, setSelectedPlugins] = useState<Plugin[]>([]);
    const [synergyProtocol, setSynergyProtocol] = useState<SynergyProtocol | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // API Key Management State
    const [apiKeys, setApiKeys] = useState<Record<string, { apiKey: string, baseUrl?: string }>>({});
    const [tempApiKey, setTempApiKey] = useState('');
    const [tempBaseUrl, setTempBaseUrl] = useState('');

    useEffect(() => {
        setApiKeys(getApiKeys());
    }, []);
    
    const handleSaveApiKey = (pluginId: string) => {
        saveApiKey(pluginId, { apiKey: tempApiKey, baseUrl: tempBaseUrl });
        setApiKeys(getApiKeys());
        setTempApiKey('');
        setTempBaseUrl('');
    };

    const handleClearApiKey = (pluginId: string) => {
        clearApiKey(pluginId);
        setApiKeys(getApiKeys());
    };

    const togglePlugin = (plugin: Plugin) => {
        setInstalledPlugins(prev =>
            prev.find(p => p.id === plugin.id)
                ? prev.filter(p => p.id !== plugin.id)
                : [...prev, plugin]
        );
        setSelectedPlugins(prev => prev.filter(p => p.id !== plugin.id));
    };

    const toggleSelectedPlugin = (plugin: Plugin) => {
        setSelectedPlugins(prev =>
            prev.find(p => p.id === plugin.id)
                ? prev.filter(p => p.id !== plugin.id)
                : [...prev, plugin]
        );
    };

    const handleGenerateProtocol = async () => {
        if (!mandate.trim() || selectedPlugins.length === 0) {
            setError("A mandate and at least one plugin must be selected.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setSynergyProtocol(null);
        try {
            const result = await generateSynergyProtocol(mandate, selectedPlugins);
            setSynergyProtocol(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to generate synergy protocol.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full h-full flex flex-col bg-transparent text-[var(--sol-text-primary)] overflow-hidden">
            <div className="flex-shrink-0 p-2 border-b border-[var(--sol-panel-border)]">
                <div className="w-full bg-[var(--sol-bg-end)] rounded-full px-4 py-1 text-sm text-[var(--sol-text-secondary)]">
                    sol://nexus/agent-plugins
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="glass-panel p-4 rounded-lg">
                        <h3 className="text-xl font-bold text-white mb-3">Agent Plugin Matrix</h3>
                        <div className="space-y-3">
                            {availablePlugins.map(plugin => {
                                const isInstalled = installedPlugins.some(p => p.id === plugin.id);
                                const isConfigured = !!apiKeys[plugin.id]?.apiKey;
                                return (
                                    <div key={plugin.id} className={`bg-[var(--sol-bg-end)] p-3 rounded-lg flex items-center gap-4 border ${isInstalled ? 'border-[var(--sol-accent-cyan)]/30' : 'border-[var(--sol-panel-border)]'}`}>
                                        <div className="text-[var(--sol-accent-cyan)] flex-shrink-0">{plugin.icon}</div>
                                        <div className="flex-grow">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-semibold text-white">{plugin.name}</h4>
                                                {isInstalled && isConfigured && plugin.id === 'api' && <span title="Configured"><CheckIcon className="h-4 w-4 text-green-400" /></span>}
                                            </div>
                                            <p className="text-xs text-[var(--sol-text-secondary)]">{plugin.description}</p>
                                        </div>
                                        <button onClick={() => togglePlugin(plugin)} className={`w-28 text-sm font-semibold py-1 px-3 rounded-md transition-colors ${isInstalled ? 'bg-red-500/20 text-red-300 hover:bg-red-500/40 border border-red-500/30' : 'bg-green-500/20 text-green-300 hover:bg-green-500/40 border border-green-500/30'}`}>
                                            {isInstalled ? 'Uninstall' : 'Install'}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="glass-panel p-4 rounded-lg">
                        <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                           <SparklesIcon className="h-6 w-6 text-[var(--sol-accent-pink)]" /> AI Synergy Protocol
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-semibold text-[var(--sol-text-secondary)]">1. Define Agent Mandate</label>
                                <textarea value={mandate} onChange={e => setMandate(e.target.value)} placeholder="e.g., Draft a Q3 marketing plan..." className="w-full mt-1 p-2 bg-[var(--sol-bg-end)] rounded-lg border border-[var(--sol-panel-border)] focus:outline-none focus:ring-2 focus:ring-[var(--sol-accent-pink)]" rows={2} />
                            </div>
                             <div>
                                <label className="text-sm font-semibold text-[var(--sol-text-secondary)]">2. Select Plugins for this Task</label>
                                {installedPlugins.length > 0 ? (
                                    <div className="space-y-2 mt-1">
                                        {installedPlugins.map(plugin => {
                                            const isSelected = selectedPlugins.some(p => p.id === plugin.id);
                                            return (
                                                <button key={plugin.id} onClick={() => toggleSelectedPlugin(plugin)} className={`w-full text-left p-2 rounded-lg border flex items-center gap-3 transition-colors ${isSelected ? 'bg-[var(--sol-accent-cyan)]/20 border-[var(--sol-accent-cyan)]/50' : 'bg-[var(--sol-bg-end)] border-[var(--sol-panel-border)] hover:bg-white/10'}`}>
                                                    <div className={`w-5 h-5 rounded-md border-2 ${isSelected ? 'bg-[var(--sol-accent-cyan)] border-[var(--sol-accent-cyan)]' : 'border-[var(--sol-text-secondary)]'} flex items-center justify-center`}>
                                                        {isSelected && <CheckIcon className="h-4 w-4 text-black" />}
                                                    </div>
                                                    <span className="font-semibold text-white">{plugin.name}</span>
                                                </button>
                                            )
                                        })}
                                    </div>
                                ) : <p className="text-xs text-[var(--sol-text-secondary)] text-center mt-2 bg-[var(--sol-bg-end)] py-3 rounded-lg border border-dashed border-[var(--sol-panel-border)]">Install plugins to make them available here.</p>}
                            </div>
                             <button onClick={handleGenerateProtocol} disabled={isLoading} className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[var(--sol-accent-cyan)] to-[var(--sol-accent-pink)] hover:opacity-90 text-white font-bold py-2.5 px-4 rounded-lg shadow-md disabled:opacity-50">
                                {isLoading ? 'Generating Protocol...' : 'Execute Synergy'}
                            </button>
                        </div>
                    </div>
                </div>

                {installedPlugins.some(p => p.id === 'api') && (
                     <div className="glass-panel p-4 rounded-lg">
                        <h3 className="text-xl font-bold text-white mb-3">API Key Management</h3>
                        <div className="bg-[var(--sol-bg-end)] p-3 rounded-lg border border-[var(--sol-panel-border)] space-y-3">
                           <p className="text-sm font-semibold text-[var(--sol-text-secondary)]">Generic REST API Credentials</p>
                           {apiKeys['api']?.apiKey ? (
                               <div className="flex items-center justify-between">
                                   <p className="text-green-300">API Key is saved and configured.</p>
                                   <button onClick={() => handleClearApiKey('api')} className="text-xs bg-red-500/20 text-red-300 hover:bg-red-500/40 border border-red-500/30 font-semibold py-1 px-2 rounded-md">Clear</button>
                               </div>
                           ) : (
                               <div className="space-y-2">
                                   <input type="password" value={tempApiKey} onChange={e => setTempApiKey(e.target.value)} placeholder="API Key" className="w-full p-2 bg-[var(--sol-bg-start)] rounded-lg border border-[var(--sol-panel-border)] focus:outline-none focus:ring-1 focus:ring-[var(--sol-accent-pink)]" />
                                   <input type="text" value={tempBaseUrl} onChange={e => setTempBaseUrl(e.target.value)} placeholder="Base URL (Optional)" className="w-full p-2 bg-[var(--sol-bg-start)] rounded-lg border border-[var(--sol-panel-border)] focus:outline-none focus:ring-1 focus:ring-[var(--sol-accent-pink)]" />
                                   <button onClick={() => handleSaveApiKey('api')} className="text-sm bg-green-500/20 text-green-300 hover:bg-green-500/40 border border-green-500/30 font-semibold py-1 px-3 rounded-md">Save</button>
                               </div>
                           )}
                        </div>
                    </div>
                )}
                
                {error && <p className="text-red-300 bg-red-900/30 p-2 rounded-md text-sm text-center">{error}</p>}
                {isLoading && <SynergyProtocolSkeleton />}
                {synergyProtocol && (
                    <div className="glass-panel p-4 rounded-lg animate-fade-in">
                        <h3 className="text-xl font-bold text-white mb-2">{synergyProtocol.protocolTitle}</h3>
                        <p className="text-sm italic text-[var(--sol-text-secondary)] mb-4">"{synergyProtocol.objectiveAnalysis}"</p>
                        <div className="space-y-3">
                            {synergyProtocol.actions.map(action => (
                                <div key={action.step} className="bg-[var(--sol-bg-end)] p-3 rounded-lg border border-[var(--sol-panel-border)]">
                                    <p className="font-bold text-[var(--sol-text-primary)]"><span className="text-[var(--sol-accent-cyan)]">Step {action.step}:</span> Use <span className="text-white">{action.plugin}</span></p>
                                    <p className="mt-1"><span className="font-semibold text-white">Action:</span> {action.action}</p>
                                    <p className="text-xs text-[var(--sol-text-secondary)] mt-1"><span className="font-semibold">Rationale:</span> {action.rationale}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NexusBrowser;