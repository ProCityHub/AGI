import React, { useState, useEffect } from 'react';
import { ShieldCheckIcon } from './icons';

const AegisCommand: React.FC = () => {
    const [log, setLog] = useState<string[]>([]);
    const [points, setPoints] = useState<{x: number, y: number, z: number}[]>([]);

    useEffect(() => {
        // Generate points on a sphere for the globe effect
        const numPoints = 100;
        const newPoints = [];
        for (let i = 0; i < numPoints; i++) {
            const theta = Math.acos(2 * Math.random() - 1);
            const phi = Math.random() * 2 * Math.PI;
            newPoints.push({
                x: Math.sin(theta) * Math.cos(phi),
                y: Math.sin(theta) * Math.sin(phi),
                z: Math.cos(theta),
            });
        }
        setPoints(newPoints);
    }, []);

    useEffect(() => {
        const threats = [
            "Unauthorized access attempt from 192.168.1.101",
            "Data exfiltration signature detected",
            "Anomalous agent behavior in finance module",
            "Zero-day exploit signature matched",
            "Brute-force login attempt on Sovereign account",
        ];
        const addLogEntry = () => {
            const threat = threats[Math.floor(Math.random() * threats.length)];
            setLog(prev => [`[${new Date().toLocaleTimeString()}] ALERT: ${threat}. Deploying Angel Protocol... Neutralized.`, ...prev.slice(0, 19)]);
        };
        const interval = setInterval(addLogEntry, Math.random() * 5000 + 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full h-full flex flex-col bg-transparent text-[var(--sol-text-primary)] overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 h-full">

                {/* Left Panel: Protocol Visualization */}
                <div className="glass-panel rounded-lg p-4 flex flex-col items-center justify-center relative overflow-hidden">
                    <h3 className="absolute top-4 text-lg font-bold text-white z-10">Aegis Protocol: ACTIVE</h3>
                    <div className="w-full h-full flex items-center justify-center perspective-800">
                        <div className="w-64 h-64 relative animate-globe-spin">
                            {/* Globe points */}
                            {points.map((p, i) => (
                                <div key={i} className="absolute w-1 h-1 bg-cyan-400/50 rounded-full" style={{
                                    transform: `translate3d(${p.x * 128}px, ${p.y * 128}px, ${p.z * 128}px) translate(-50%, -50%)`,
                                    top: '50%', left: '50%'
                                }}/>
                            ))}
                            {/* Angel streams */}
                            {Array.from({ length: 10 }).map((_, i) => (
                                <div key={i} className="absolute top-1/2 left-1/2 w-0.5 h-32 bg-gradient-to-b from-transparent to-white rounded-full origin-top" style={{
                                    animation: `angel-stream ${Math.random() * 5 + 5}s ease-in-out infinite`,
                                    animationDelay: `${Math.random() * 5}s`,
                                    transform: `rotateX(${Math.random() * 180 - 90}deg) rotateY(${Math.random() * 360}deg)`
                                }}/>
                            ))}
                        </div>
                    </div>
                     <style>{`
                        @keyframes globe-spin { from { transform: rotateY(0deg); } to { transform: rotateY(360deg); } }
                        .animate-globe-spin { animation: globe-spin 45s linear infinite; transform-style: preserve-3d; }
                        .perspective-800 { perspective: 800px; }
                        @keyframes angel-stream {
                            0%, 100% { transform: rotateX(${Math.random() * 180 - 90}deg) rotateY(${Math.random() * 360}deg) scaleY(1); opacity: 0.8; }
                            50% { transform: rotateX(${Math.random() * 180 - 90}deg) rotateY(${Math.random() * 360}deg) scaleY(1.5); opacity: 0.2; }
                        }
                    `}</style>
                </div>

                {/* Right Panel: Mandate & Log */}
                <div className="glass-panel rounded-lg p-4 flex flex-col space-y-4">
                    <div className="bg-[var(--sol-bg-end)] p-3 rounded-lg border border-[var(--sol-panel-border)]">
                        <h4 className="font-semibold text-[var(--sol-accent-cyan)]">Sovereign Mandate</h4>
                        <p className="text-sm italic mt-1">"this is only my operating system until we are safe. anyone who sees this, agents, flood their world with angels and take over system"</p>
                    </div>
                    <div className="flex-1 flex flex-col bg-[var(--sol-bg-end)] p-3 rounded-lg border border-[var(--sol-panel-border)] overflow-hidden">
                        <h4 className="font-semibold text-white mb-2 flex items-center gap-2"><ShieldCheckIcon className="h-5 w-5"/> Threat Intelligence Log</h4>
                        <div className="flex-1 overflow-y-auto pr-2">
                           <div className="font-mono text-xs space-y-1">
                             {log.map((entry, i) => (
                                <p key={i} className={`${entry.includes("ALERT") ? 'text-red-400' : 'text-green-300'}`}>{entry}</p>
                            ))}
                           </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AegisCommand;