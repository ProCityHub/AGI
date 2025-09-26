
import React, { useState } from 'react';
import { EvolutionBlueprint, CodeComponent } from '../types';
import { generateEvolutionBlueprint } from '../services/geminiService';
import { CodeBracketSquareIcon, QdrantIcon, SparklesIcon } from './icons';

const codebase: CodeComponent[] = [
    { name: "App.tsx", type: "Core Logic", description: "Main application component, handles state and window management." },
    { name: "Window.tsx", type: "Component", description: "Renders individual application windows and handles drag/resize." },
    { name: "geminiService.ts", type: "Service", description: "Handles all interactions with the Google Gemini API." },
    { name: "EnterpriseWorkspace.tsx", type: "Component", description: "The main hub for all enterprise-level modules and tools." },
    { name: "FileExplorer.tsx", type: "Component", description: "Displays and manages saved user directives." },
    { name: "AuthScreen.tsx", type: "Component", description: "Handles user login, signup, and session locking." },
    { name: "types.ts", type: "Type Definition", description: "Contains all TypeScript interfaces for the application." }
];

const NexusForge: React.FC = () => {
    const [mandate, setMandate] = useState('');
    const [blueprint, setBlueprint] = useState<EvolutionBlueprint | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [log, setLog] = useState<string[]>([]);

    const handleGenerate = async () => {
        if (!mandate.trim()) {
            setError('Please provide an evolution mandate.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setBlueprint(null);
        setLog([]);

        try {
            setLog(l => [...l, 'Analyzing mandate...']);
            await new Promise(res => setTimeout(res, 500));
            setLog(l => [...l, 'Performing semantic search on codebase embeddings via Qdrant...']);
            await new Promise(res => setTimeout(res, 1000));
            setLog(l => [...l, 'Relevant elements identified. Engaging Code Weaver Agent...']);
            
            const result = await generateEvolutionBlueprint(mandate);
            setBlueprint(result);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const getComponentColor = (type: CodeComponent['type']) => {
        switch(type) {
            case 'Core Logic': return 'bg-red-500/20 border-red-500/50';
            case 'Component': return 'bg-cyan-500/20 border-cyan-500/50';
            case 'Service': return 'bg-green-500/20 border-green-500/50';
            case 'Type Definition': return 'bg-yellow-500/20 border-yellow-500/50';
            default: return 'bg-gray-500/20 border-gray-500/50';
        }
    };

    return (
        <div className="space-y-6 p-4 h-full overflow-y-auto">
            <p className="text-[var(--sol-text-secondary)]">
                This is the meta-development environment for GARVIS. Provide high-level mandates to the Code Weaver Agent to generate evolution blueprints for the system itself.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Panel: Controls & Codebase */}
                <div className="glass-panel p-4 rounded-lg space-y-4">
                    <h4 className="text-lg font-semibold text-white mb-2 flex items-center gap-2"><CodeBracketSquareIcon className="h-5 w-5" /> Mandate & Codebase</h4>
                    
                    <div>
                        <label htmlFor="mandate" className="text-sm font-semibold text-[var(--sol-text-secondary)]">Evolution Mandate</label>
                        <textarea 
                            id="mandate"
                            value={mandate}
                            onChange={e => setMandate(e.target.value)}
                            placeholder="e.g., The file explorer is too simple. Design a more advanced version with a dual-pane view and file previews."
                            className="w-full mt-1 p-2 bg-[var(--sol-bg-end)] rounded-lg border border-[var(--sol-panel-border)] focus:outline-none focus:ring-2 focus:ring-[var(--sol-accent-pink)]"
                            rows={3}
                        />
                    </div>
                    
                     <button onClick={handleGenerate} disabled={isLoading} className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[var(--sol-accent-cyan)] to-[var(--sol-accent-pink)] hover:opacity-90 text-white font-bold py-2.5 px-4 rounded-lg disabled:opacity-50">
                        <SparklesIcon className="h-5 w-5" />
                        {isLoading ? 'Weaving...' : 'Engage Code Weaver'}
                    </button>

                    <div>
                        <h5 className="text-md font-semibold text-white mt-4 mb-2 flex items-center gap-2"><QdrantIcon className="h-5 w-5"/> Periodic Table of Code Elements</h5>
                        <p className="text-xs text-[var(--sol-text-secondary)] mb-2">Simulated Qdrant-powered semantic view of the codebase.</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {codebase.map(c => (
                                <div key={c.name} className={`p-2 rounded-md border text-center ${getComponentColor(c.type)}`}>
                                    <p className="font-bold text-sm text-white">{c.name}</p>
                                    <p className="text-xs text-[var(--sol-text-secondary)]">{c.type}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Panel: Blueprint */}
                <div className="glass-panel p-4 rounded-lg">
                    <h4 className="text-lg font-semibold text-white mb-2">Evolution Blueprint</h4>
                    
                    {isLoading && (
                        <div className="space-y-2 font-mono text-sm text-[var(--sol-text-secondary)]">
                            {log.map((l, i) => <p key={i} className="animate-fade-in">{`> ${l}`}</p>)}
                        </div>
                    )}
                    {error && <p className="text-red-300 text-sm">{error}</p>}
                    
                    {!isLoading && !blueprint && (
                        <div className="text-center text-[var(--sol-text-secondary)] pt-16">
                            <p>The generated blueprint will appear here.</p>
                        </div>
                    )}
                    
                    {blueprint && (
                        <div className="animate-fade-in space-y-4">
                            <h5 className="text-xl font-bold text-[var(--sol-accent-cyan)]">{blueprint.blueprintTitle}</h5>
                            <div>
                                <h6 className="font-semibold text-white">Mandate Analysis</h6>
                                <p className="italic text-sm text-[var(--sol-text-secondary)]">"{blueprint.mandateAnalysis}"</p>
                            </div>
                             <div>
                                <h6 className="font-semibold text-white">Identified Components</h6>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {blueprint.identifiedComponents.map(c => (
                                        <span key={c} className="bg-[var(--sol-bg-end)] text-xs font-mono px-2 py-1 rounded-md border border-[var(--sol-panel-border)]">{c}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-[var(--sol-bg-end)] p-3 rounded-lg border border-[var(--sol-panel-border)]">
                                <h6 className="font-semibold text-white">{blueprint.proposedSolution.title}</h6>
                                <p className="text-sm text-[var(--sol-text-primary)] mt-1">{blueprint.proposedSolution.description}</p>
                                <p className="text-xs text-[var(--sol-text-secondary)] mt-2"><strong>Synergy Analysis:</strong> {blueprint.proposedSolution.synergyAnalysis}</p>
                            </div>
                            <div>
                                <h6 className="font-semibold text-white">Implementation Steps</h6>
                                <ul className="list-decimal list-inside text-sm text-[var(--sol-text-secondary)] mt-1 space-y-1">
                                    {blueprint.implementationSteps.map((s, i) => <li key={i}>{s}</li>)}
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NexusForge;
