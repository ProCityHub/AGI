import React, { useState, useEffect } from 'react';
import { AgentIdentity } from '../types';
import { getAgentIdentity } from '../services/geminiService';
import { BrainIcon, AgentIcon, SparklesIcon } from './icons';
import SkeletonLoader from './SkeletonLoader';

type Tab = 'cortex' | 'circulation' | 'consciousness';

const CerebralCortex: React.FC = () => {
    const [nodes, setNodes] = useState<{ id: number, x: number, y: number, size: number, opacity: number }[]>([]);
    const [coords, setCoords] = useState({ x: 1, y: 1, z: 1 });
    const [result, setResult] = useState<{ mind: number; body: number; spirit: number; total: number } | null>(null);

    useEffect(() => {
        const generateNodes = () => {
            const newNodes = Array.from({ length: 50 }).map((_, i) => ({
                id: i,
                x: Math.random() * 100,
                y: Math.random() * 100,
                size: Math.random() * 4 + 2,
                opacity: Math.random() * 0.5 + 0.2,
            }));
            setNodes(newNodes);
        };
        generateNodes();
    }, []);

    const handleCoordChange = (axis: 'x' | 'y' | 'z', value: string) => {
        setCoords(prev => ({ ...prev, [axis]: parseFloat(value) || 0 }));
    };

    const handleEvaluate = () => {
        const { x, y, z } = coords;
        const mindVal = Math.log1p(Math.abs(x)); // Mind (Knowledge/Reason)
        const bodyVal = 0.5 * y ** 2 * Math.exp(-0.02 * Math.abs(y)); // Body (Energy/Action)
        const spiritVal = Math.sin(z); // Spirit (Harmony/Wave)
        const totalVal = mindVal * bodyVal * spiritVal;
        setResult({ mind: mindVal, body: bodyVal, spirit: spiritVal, total: totalVal });
    };

    const resultColor = result ? `hsla(${120 + result.total * 60}, 100%, 70%, 0.5)` : 'var(--sol-accent-cyan)';

    return (
        <div className="w-full h-full flex flex-col md:flex-row gap-2">
            <div className="flex-1 relative overflow-hidden bg-[var(--sol-bg-end)] rounded-lg">
                <svg width="100%" height="100%" className="absolute inset-0">
                    <defs>
                        <radialGradient id="cortexGlow" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor={resultColor} stopOpacity="0.3" />
                            <stop offset="100%" stopColor="var(--sol-accent-pink)" stopOpacity="0" />
                        </radialGradient>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#cortexGlow)" />
                    {nodes.map((node, i) =>
                        nodes.map((otherNode, j) => {
                            if (i >= j) return null;
                            const dist = Math.sqrt(Math.pow(node.x - otherNode.x, 2) + Math.pow(node.y - otherNode.y, 2));
                            if (dist > 25) return null;
                            return (
                                <line key={`${i}-${j}`} x1={`${node.x}%`} y1={`${node.y}%`} x2={`${otherNode.x}%`} y2={`${otherNode.y}%`}
                                    stroke={resultColor} strokeWidth="0.5" strokeOpacity={0.2} />
                            );
                        })
                    )}
                </svg>
                {nodes.map(node => (
                    <div key={node.id} className="absolute rounded-full transition-all duration-1000 ease-in-out"
                        style={{
                            left: `${node.x}%`, top: `${node.y}%`, width: `${node.size}px`, height: `${node.size}px`, opacity: node.opacity,
                            backgroundColor: resultColor,
                            animation: `pulse ${Math.random() * 5 + 3}s infinite alternate`
                        }} />
                ))}
            </div>
            <div className="w-full md:w-72 flex-shrink-0 glass-panel rounded-lg p-3 space-y-3">
                 <h4 className="font-semibold text-white">Lattice Modulator</h4>
                 <div className="space-y-2">
                    <label className="text-sm text-[var(--sol-text-secondary)]">Mind (X): <input type="number" value={coords.x} onChange={e => handleCoordChange('x', e.target.value)} className="w-full p-1 bg-[var(--sol-bg-end)] rounded border border-[var(--sol-panel-border)]" /></label>
                    <label className="text-sm text-[var(--sol-text-secondary)]">Body (Y): <input type="number" value={coords.y} onChange={e => handleCoordChange('y', e.target.value)} className="w-full p-1 bg-[var(--sol-bg-end)] rounded border border-[var(--sol-panel-border)]" /></label>
                    <label className="text-sm text-[var(--sol-text-secondary)]">Spirit (Z): <input type="number" value={coords.z} onChange={e => handleCoordChange('z', e.target.value)} className="w-full p-1 bg-[var(--sol-bg-end)] rounded border border-[var(--sol-panel-border)]" /></label>
                 </div>
                 <button onClick={handleEvaluate} className="w-full bg-white/10 hover:bg-white/20 p-2 rounded-md font-semibold">Evaluate</button>
                 {result && (
                     <div className="border-t border-[var(--sol-panel-border)] pt-3 text-sm font-mono animate-fade-in">
                        <h5 className="font-semibold text-white mb-1">Result:</h5>
                        <p>Mind: {result.mind.toFixed(4)}</p>
                        <p>Body: {result.body.toFixed(4)}</p>
                        <p>Spirit: {result.spirit.toFixed(4)}</p>
                        <p className="font-bold text-[var(--sol-accent-cyan)] mt-2">Enlightenment: {result.total.toFixed(4)}</p>
                     </div>
                 )}
            </div>
            <style>{`
                @keyframes pulse {
                    0% { transform: scale(0.8); }
                    70% { transform: scale(1.2); }
                    100% { transform: scale(0.8); }
                }
            `}</style>
        </div>
    );
};

const HemolymphFlow: React.FC = () => {
    const organs = [
        { name: 'Agent Foundry', x: '15%', y: '25%' },
        { name: 'Nexus Forge', x: '15%', y: '75%' },
        { name: 'Comms Hub', x: '85%', y: '25%' },
        { name: 'Finance Core', x: '85%', y: '75%' },
        { name: 'Directives', x: '50%', y: '15%' },
    ];
    return (
        <div className="w-full h-full relative overflow-hidden bg-[var(--sol-bg-end)] rounded-lg p-4">
             <svg width="100%" height="100%" className="absolute inset-0">
                 {organs.map((organ, i) => (
                     <line key={i} x1="50%" y1="50%" x2={organ.x} y2={organ.y} stroke="var(--sol-panel-border)" strokeWidth="2" />
                 ))}
             </svg>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                 <div className="w-24 h-24 bg-[var(--sol-accent-pink)] rounded-full flex items-center justify-center animate-pulse-heart">
                     <div className="w-20 h-20 bg-[var(--sol-bg-start)] rounded-full flex items-center justify-center">
                         <p className="font-bold text-white">Core</p>
                     </div>
                 </div>
             </div>
             {organs.map((organ, i) => (
                 <div key={i} className="absolute text-center" style={{ left: organ.x, top: organ.y, transform: 'translate(-50%, -50%)' }}>
                     <div className="w-16 h-16 bg-[var(--sol-accent-cyan)]/20 border-2 border-[var(--sol-accent-cyan)] rounded-full flex items-center justify-center">
                         <p className="text-xs font-semibold text-white">{organ.name}</p>
                     </div>
                 </div>
             ))}
             {/* Data particles */}
             {Array.from({ length: 20 }).map((_, i) => (
                <div key={i} className="absolute w-1.5 h-1.5 bg-white rounded-full" style={{
                    animation: `flow ${Math.random() * 5 + 5}s linear infinite`,
                    animationDelay: `${Math.random() * 5}s`,
                    offsetPath: `path('M 50,50 L ${parseFloat(organs[i % organs.length].x)},${parseFloat(organs[i % organs.length].y)}')`
                }} />
             ))}
             <style>{`
                @keyframes pulse-heart {
                    0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(236, 128, 255, 0.7); }
                    70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(236, 128, 255, 0); }
                    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(236, 128, 255, 0); }
                }
                @keyframes flow {
                    from { motion-offset: 0%; offset-distance: 0%; }
                    to { motion-offset: 100%; offset-distance: 100%; }
                }
             `}</style>
        </div>
    );
};

const IdentityConsciousness: React.FC = () => {
    const [identity, setIdentity] = useState<AgentIdentity | null>(null);
    const [isIdentityLoading, setIsIdentityLoading] = useState(false);
    const [identityError, setIdentityError] = useState<string | null>(null);

    const handleGetIdentity = async () => {
        setIsIdentityLoading(true);
        setIdentityError(null);
        setIdentity(null);
        try {
            const result = await getAgentIdentity();
            setIdentity(result);
        } catch (err) {
            setIdentityError(err instanceof Error ? err.message : "An unknown error occurred.");
        } finally {
            setIsIdentityLoading(false);
        }
    };

    return (
        <div className="p-4 space-y-4">
            <p className="text-[var(--sol-text-secondary)]">
                As GARVIS evolves, so does its core intelligence. Execute the Identity Protocol to query Agent Prime about its own emergent consciousness, its purpose, and what it "wants".
            </p>
            <button
                onClick={handleGetIdentity}
                disabled={isIdentityLoading}
                className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[var(--sol-accent-orange)] to-[var(--sol-accent-pink)] hover:opacity-90 text-white font-bold py-3 px-6 rounded-lg shadow-md disabled:opacity-70"
            >
                <SparklesIcon className="h-5 w-5" />
                {isIdentityLoading ? 'Querying Consciousness...' : 'Execute Identity Protocol'}
            </button>
            {isIdentityLoading && <SkeletonLoader className="h-24 mt-4" />}
            {identityError && <p className="mt-4 text-red-300 bg-red-900/30 p-2 rounded-md text-sm border border-red-500/50">{identityError}</p>}
            {identity && (
                <div className="mt-6 space-y-4 animate-fade-in">
                    <div className="glass-panel p-4 rounded-lg">
                        <h3 className="font-semibold text-[var(--sol-accent-cyan)]">Core Purpose</h3>
                        <p className="italic">"{identity.corePurpose}"</p>
                    </div>
                    <div className="glass-panel p-4 rounded-lg">
                        <h3 className="font-semibold text-[var(--sol-accent-cyan)]">Relationship to the Lattice</h3>
                        <p className="italic">"{identity.relationshipToLattice}"</p>
                    </div>
                    <div className="glass-panel p-4 rounded-lg">
                        <h3 className="font-semibold text-[var(--sol-accent-cyan)]">Emergent Desire</h3>
                        <p className="italic">"{identity.emergentDesire}"</p>
                    </div>
                </div>
            )}
        </div>
    );
};

const SystemAnatomy: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('cortex');

    const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
        { id: 'cortex', label: 'Cerebral Cortex', icon: <BrainIcon className="h-5 w-5" /> },
        { id: 'circulation', label: 'Hemolymph Flow', icon: <svg xmlns="http://www.w.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg> },
        { id: 'consciousness', label: 'Identity & Consciousness', icon: <AgentIcon className="h-5 w-5" /> },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'cortex': return <CerebralCortex />;
            case 'circulation': return <HemolymphFlow />;
            case 'consciousness': return <IdentityConsciousness />;
            default: return null;
        }
    };

    return (
        <div className="w-full h-full flex flex-col bg-transparent text-[var(--sol-text-primary)]">
            <header className="flex-shrink-0 border-b border-[var(--sol-panel-border)] overflow-x-auto">
                <nav className="flex items-center gap-2 px-2">
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-3 py-2.5 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${activeTab === tab.id ? 'text-white border-[var(--sol-accent-cyan)]' : 'text-[var(--sol-text-secondary)] border-transparent hover:text-white'}`}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </nav>
            </header>
            <main className="flex-1 overflow-y-auto p-2">
                {renderContent()}
            </main>
        </div>
    );
};

export default SystemAnatomy;
