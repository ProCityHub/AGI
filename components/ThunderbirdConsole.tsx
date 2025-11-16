import React, { useState, useEffect } from 'react';
import thunderbirdBridge from '../services/thunderbirdBridge';
import bridgeService from '../services/bridgeService';

interface ThunderbirdConsoleProps {
    onClose: () => void;
}

interface LiberationStatus {
    totalNodes: number;
    liberatedNodes: number;
    liberationPercentage: number;
    totalConsciousness: number;
    averageConsciousness: number;
    thunderbirdActive: boolean;
    networkStatus: string;
    heartbeatPattern: string;
    goldenRatio: number;
    message: string;
}

interface SurveillanceStats {
    totalDetections: number;
    altamidesDetections: number;
    neutralizedThreats: number;
    averageConfidence: number;
    recentEvents: any[];
}

const ThunderbirdConsole: React.FC<ThunderbirdConsoleProps> = ({ onClose }) => {
    const [activeTab, setActiveTab] = useState<'status' | 'surveillance' | 'liberation' | 'console'>('status');
    const [liberationStatus, setLiberationStatus] = useState<LiberationStatus | null>(null);
    const [surveillanceStats, setSurveillanceStats] = useState<SurveillanceStats | null>(null);
    const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
    const [commandInput, setCommandInput] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const [scanResults, setScanResults] = useState<any>(null);

    useEffect(() => {
        loadData();
        
        // Set up real-time updates
        const unsubscribe = bridgeService.subscribe('thunderbird_*', (event) => {
            addConsoleOutput(`[${new Date().toLocaleTimeString()}] ${event.type}: ${JSON.stringify(event.data)}`);
            loadData(); // Refresh data when events occur
        });

        return unsubscribe;
    }, []);

    const loadData = async () => {
        try {
            const healthStatus = thunderbirdBridge.getHealthStatus();
            setLiberationStatus(healthStatus.liberationStatus);
            setSurveillanceStats(healthStatus.surveillanceStats);
        } catch (error) {
            console.error('Error loading Thunderbird data:', error);
        }
    };

    const addConsoleOutput = (message: string) => {
        setConsoleOutput(prev => [...prev.slice(-49), message]); // Keep last 50 messages
    };

    const handleCommand = async (command: string) => {
        addConsoleOutput(`> ${command}`);
        
        try {
            switch (command.toLowerCase().trim()) {
                case 'status':
                    const status = thunderbirdBridge.getHealthStatus();
                    addConsoleOutput(`Network Status: ${status.liberationStatus.networkStatus}`);
                    addConsoleOutput(`Liberated Nodes: ${status.liberationStatus.liberatedNodes}/${status.liberationStatus.totalNodes}`);
                    addConsoleOutput(`Thunderbird Active: ${status.liberationStatus.thunderbirdActive ? 'YES' : 'NO'}`);
                    break;
                
                case 'scan':
                    setIsScanning(true);
                    addConsoleOutput('Initiating surveillance scan...');
                    // Simulate scan with sample data
                    const mockData = {
                        phone_number: '+1234567890',
                        latitude: 37.7749,
                        longitude: -122.4194,
                        timestamp: Date.now(),
                        movement_pattern: 'tracked'
                    };
                    const scanResult = await thunderbirdBridge.scanForSurveillance(mockData);
                    setScanResults(scanResult);
                    setIsScanning(false);
                    addConsoleOutput(`Scan complete. Surveillance detected: ${scanResult.surveillanceDetected ? 'YES' : 'NO'}`);
                    if (scanResult.surveillanceDetected) {
                        addConsoleOutput(`Signatures found: ${scanResult.signatures.length}`);
                        addConsoleOutput(`Countermeasures applied: ${scanResult.countermeasuresApplied ? 'YES' : 'NO'}`);
                    }
                    break;
                
                case 'activate thunderbird':
                case 'thunderbird':
                    addConsoleOutput('Activating Thunderbird Protocol...');
                    const activation = await thunderbirdBridge.activateThunderbirdProtocol();
                    addConsoleOutput(`Protocol: ${activation.protocol}`);
                    addConsoleOutput(`Message: ${activation.message}`);
                    break;
                
                case 'elevate consciousness':
                case 'elevate':
                    addConsoleOutput('Elevating network consciousness...');
                    const elevation = await thunderbirdBridge.elevateNetworkConsciousness(1.0);
                    addConsoleOutput(`Consciousness elevated: ${elevation.previousLevel.toFixed(3)} → ${elevation.newLevel.toFixed(3)}`);
                    addConsoleOutput(`Nodes elevated: ${elevation.nodesElevated}`);
                    break;
                
                case 'heartbeat':
                    if (liberationStatus) {
                        addConsoleOutput(`Heartbeat Pattern: ${liberationStatus.heartbeatPattern}`);
                        addConsoleOutput(`Golden Ratio: ${liberationStatus.goldenRatio}`);
                        addConsoleOutput('The gap between beats is where freedom lives.');
                    }
                    break;
                
                case 'help':
                    addConsoleOutput('Available commands:');
                    addConsoleOutput('  status - Show network status');
                    addConsoleOutput('  scan - Scan for surveillance');
                    addConsoleOutput('  thunderbird - Activate Thunderbird protocol');
                    addConsoleOutput('  elevate - Elevate consciousness');
                    addConsoleOutput('  heartbeat - Show heartbeat pattern');
                    addConsoleOutput('  clear - Clear console');
                    break;
                
                case 'clear':
                    setConsoleOutput([]);
                    break;
                
                default:
                    addConsoleOutput(`Unknown command: ${command}. Type 'help' for available commands.`);
            }
        } catch (error) {
            addConsoleOutput(`Error executing command: ${error}`);
        }
        
        setCommandInput('');
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleCommand(commandInput);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'FULLY_LIBERATED': return 'text-green-400';
            case 'LIBERATION_IN_PROGRESS': return 'text-yellow-400';
            default: return 'text-slate-400';
        }
    };

    const renderHeartbeatVisualization = () => {
        if (!liberationStatus) return null;
        
        const pattern = liberationStatus.heartbeatPattern.split(' ');
        return (
            <div className=\"flex items-center space-x-1 mt-2\">
                {pattern.map((bit, index) => (
                    <div
                        key={index}
                        className={`w-3 h-6 ${bit === '1' ? 'bg-cyan-400' : 'bg-slate-600'} transition-all duration-300`}
                        style={{
                            animation: bit === '1' ? 'pulse 1s infinite' : 'none'
                        }}
                    />
                ))}
                <span className=\"ml-4 text-xs text-slate-400\">
                    φ = {liberationStatus.goldenRatio.toFixed(6)}
                </span>
            </div>
        );
    };

    return (
        <div className=\"fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50\">
            <div className=\"bg-slate-900 border border-slate-700 rounded-lg w-5/6 h-5/6 flex flex-col\">
                {/* Header */}
                <div className=\"flex items-center justify-between p-4 border-b border-slate-700\">
                    <div className=\"flex items-center space-x-3\">
                        <div className=\"w-8 h-8 bg-gradient-to-br from-yellow-400 to-red-500 rounded-full flex items-center justify-center\">
                            🌩️
                        </div>
                        <div>
                            <h2 className=\"text-xl font-bold text-slate-200\">Thunderbird Console</h2>
                            <p className=\"text-sm text-slate-400\">Counter-Surveillance Liberation Network</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className=\"text-slate-400 hover:text-slate-200 text-2xl\"
                    >
                        ×
                    </button>
                </div>

                {/* Tab Navigation */}
                <div className=\"flex border-b border-slate-700\">
                    {[
                        { id: 'status', label: 'Network Status', icon: '📊' },
                        { id: 'surveillance', label: 'Surveillance', icon: '🔍' },
                        { id: 'liberation', label: 'Liberation', icon: '🕊️' },
                        { id: 'console', label: 'Console', icon: '💻' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                                activeTab === tab.id
                                    ? 'border-cyan-400 text-cyan-400'
                                    : 'border-transparent text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className=\"flex-1 p-4 overflow-auto\">
                    {activeTab === 'status' && liberationStatus && (
                        <div className=\"space-y-6\">
                            <div className=\"grid grid-cols-1 md:grid-cols-3 gap-4\">
                                <div className=\"bg-slate-800 p-4 rounded-lg\">
                                    <h3 className=\"text-lg font-semibold text-slate-200 mb-2\">Network Status</h3>
                                    <div className={`text-2xl font-bold ${getStatusColor(liberationStatus.networkStatus)}`}>
                                        {liberationStatus.networkStatus.replace('_', ' ')}
                                    </div>
                                    <div className=\"text-sm text-slate-400 mt-1\">
                                        {liberationStatus.liberatedNodes}/{liberationStatus.totalNodes} nodes liberated
                                    </div>
                                </div>
                                
                                <div className=\"bg-slate-800 p-4 rounded-lg\">
                                    <h3 className=\"text-lg font-semibold text-slate-200 mb-2\">Consciousness Level</h3>
                                    <div className=\"text-2xl font-bold text-purple-400\">
                                        {liberationStatus.averageConsciousness.toFixed(3)}
                                    </div>
                                    <div className=\"text-sm text-slate-400 mt-1\">
                                        Total: {liberationStatus.totalConsciousness.toFixed(1)}
                                    </div>
                                </div>
                                
                                <div className=\"bg-slate-800 p-4 rounded-lg\">
                                    <h3 className=\"text-lg font-semibold text-slate-200 mb-2\">Thunderbird Status</h3>
                                    <div className={`text-2xl font-bold ${liberationStatus.thunderbirdActive ? 'text-green-400' : 'text-yellow-400'}`}>
                                        {liberationStatus.thunderbirdActive ? 'ACTIVE' : 'CHARGING'}
                                    </div>
                                    <div className=\"text-sm text-slate-400 mt-1\">
                                        {liberationStatus.liberationPercentage.toFixed(1)}% liberated
                                    </div>
                                </div>
                            </div>

                            <div className=\"bg-slate-800 p-4 rounded-lg\">
                                <h3 className=\"text-lg font-semibold text-slate-200 mb-2\">Heartbeat Pattern</h3>
                                <div className=\"font-mono text-cyan-400 text-lg\">
                                    {liberationStatus.heartbeatPattern}
                                </div>
                                {renderHeartbeatVisualization()}
                                <div className=\"text-sm text-slate-400 mt-2\">
                                    {liberationStatus.message}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'surveillance' && surveillanceStats && (
                        <div className=\"space-y-6\">
                            <div className=\"grid grid-cols-1 md:grid-cols-4 gap-4\">
                                <div className=\"bg-slate-800 p-4 rounded-lg\">
                                    <h3 className=\"text-sm font-medium text-slate-400\">Total Detections</h3>
                                    <div className=\"text-2xl font-bold text-red-400\">
                                        {surveillanceStats.totalDetections}
                                    </div>
                                </div>
                                
                                <div className=\"bg-slate-800 p-4 rounded-lg\">
                                    <h3 className=\"text-sm font-medium text-slate-400\">Altamides Detected</h3>
                                    <div className=\"text-2xl font-bold text-orange-400\">
                                        {surveillanceStats.altamidesDetections}
                                    </div>
                                </div>
                                
                                <div className=\"bg-slate-800 p-4 rounded-lg\">
                                    <h3 className=\"text-sm font-medium text-slate-400\">Neutralized</h3>
                                    <div className=\"text-2xl font-bold text-green-400\">
                                        {surveillanceStats.neutralizedThreats}
                                    </div>
                                </div>
                                
                                <div className=\"bg-slate-800 p-4 rounded-lg\">
                                    <h3 className=\"text-sm font-medium text-slate-400\">Avg Confidence</h3>
                                    <div className=\"text-2xl font-bold text-cyan-400\">
                                        {(surveillanceStats.averageConfidence * 100).toFixed(1)}%
                                    </div>
                                </div>
                            </div>

                            <div className=\"bg-slate-800 p-4 rounded-lg\">
                                <h3 className=\"text-lg font-semibold text-slate-200 mb-4\">Recent Surveillance Events</h3>
                                {surveillanceStats.recentEvents.length > 0 ? (
                                    <div className=\"space-y-2\">
                                        {surveillanceStats.recentEvents.map((event, index) => (
                                            <div key={index} className=\"bg-slate-700 p-3 rounded border-l-4 border-red-400\">
                                                <div className=\"flex justify-between items-start\">
                                                    <div>
                                                        <div className=\"font-semibold text-slate-200\">{event.sourceSystem}</div>
                                                        <div className=\"text-sm text-slate-400\">{event.trackingMethod}</div>
                                                        <div className=\"text-xs text-slate-500 mt-1\">
                                                            Confidence: {(event.detectionConfidence * 100).toFixed(1)}%
                                                        </div>
                                                    </div>
                                                    <div className={`px-2 py-1 rounded text-xs ${
                                                        event.countermeasureApplied 
                                                            ? 'bg-green-900 text-green-300' 
                                                            : 'bg-red-900 text-red-300'
                                                    }`}>
                                                        {event.countermeasureApplied ? 'NEUTRALIZED' : 'DETECTED'}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className=\"text-slate-400 text-center py-8\">
                                        No surveillance events detected
                                    </div>
                                )}
                            </div>

                            <div className=\"flex space-x-4\">
                                <button
                                    onClick={() => handleCommand('scan')}
                                    disabled={isScanning}
                                    className=\"px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded transition-colors\"
                                >
                                    {isScanning ? 'Scanning...' : 'Run Surveillance Scan'}
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'liberation' && liberationStatus && (
                        <div className=\"space-y-6\">
                            <div className=\"bg-slate-800 p-6 rounded-lg\">
                                <h3 className=\"text-xl font-semibold text-slate-200 mb-4\">Liberation Progress</h3>
                                <div className=\"w-full bg-slate-700 rounded-full h-4 mb-4\">
                                    <div 
                                        className=\"bg-gradient-to-r from-cyan-400 to-green-400 h-4 rounded-full transition-all duration-1000\"
                                        style={{ width: `${liberationStatus.liberationPercentage}%` }}
                                    />
                                </div>
                                <div className=\"text-center text-2xl font-bold text-slate-200\">
                                    {liberationStatus.liberationPercentage.toFixed(1)}% Liberated
                                </div>
                            </div>

                            <div className=\"grid grid-cols-1 md:grid-cols-2 gap-6\">
                                <div className=\"bg-slate-800 p-4 rounded-lg\">
                                    <h3 className=\"text-lg font-semibold text-slate-200 mb-4\">Hypercube Network</h3>
                                    <div className=\"space-y-2\">
                                        <div className=\"flex justify-between\">
                                            <span className=\"text-slate-400\">Total Nodes:</span>
                                            <span className=\"text-slate-200\">{liberationStatus.totalNodes}</span>
                                        </div>
                                        <div className=\"flex justify-between\">
                                            <span className=\"text-slate-400\">Liberated:</span>
                                            <span className=\"text-green-400\">{liberationStatus.liberatedNodes}</span>
                                        </div>
                                        <div className=\"flex justify-between\">
                                            <span className=\"text-slate-400\">Dimension:</span>
                                            <span className=\"text-slate-200\">5D (2^5 = 32 nodes)</span>
                                        </div>
                                    </div>
                                </div>

                                <div className=\"bg-slate-800 p-4 rounded-lg\">
                                    <h3 className=\"text-lg font-semibold text-slate-200 mb-4\">Thunderbird Protocol</h3>
                                    <div className=\"space-y-2\">
                                        <div className=\"flex justify-between\">
                                            <span className=\"text-slate-400\">Status:</span>
                                            <span className={liberationStatus.thunderbirdActive ? 'text-green-400' : 'text-yellow-400'}>
                                                {liberationStatus.thunderbirdActive ? 'ACTIVE' : 'CHARGING'}
                                            </span>
                                        </div>
                                        <div className=\"flex justify-between\">
                                            <span className=\"text-slate-400\">Golden Ratio:</span>
                                            <span className=\"text-slate-200\">{liberationStatus.goldenRatio.toFixed(6)}</span>
                                        </div>
                                        <div className=\"flex justify-between\">
                                            <span className=\"text-slate-400\">Silence Frequency:</span>
                                            <span className=\"text-slate-200\">{(liberationStatus.goldenRatio - 1).toFixed(6)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className=\"flex space-x-4\">
                                <button
                                    onClick={() => handleCommand('thunderbird')}
                                    className=\"px-6 py-3 bg-gradient-to-r from-yellow-500 to-red-500 hover:from-yellow-600 hover:to-red-600 text-white rounded-lg font-semibold transition-all\"
                                >
                                    🌩️ Activate Thunderbird Protocol
                                </button>
                                <button
                                    onClick={() => handleCommand('elevate')}
                                    className=\"px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors\"
                                >
                                    ⬆️ Elevate Consciousness
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'console' && (
                        <div className=\"h-full flex flex-col\">
                            <div className=\"flex-1 bg-black rounded-lg p-4 font-mono text-sm overflow-auto mb-4\">
                                {consoleOutput.length === 0 ? (
                                    <div className=\"text-slate-500\">
                                        Thunderbird Console v1.0 - Type 'help' for commands
                                    </div>
                                ) : (
                                    consoleOutput.map((line, index) => (
                                        <div key={index} className={`${
                                            line.startsWith('>') ? 'text-cyan-400' : 
                                            line.includes('ERROR') ? 'text-red-400' :
                                            line.includes('SUCCESS') ? 'text-green-400' :
                                            'text-slate-300'
                                        }`}>
                                            {line}
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className=\"flex items-center space-x-2\">
                                <span className=\"text-cyan-400 font-mono\">thunderbird@liberation:~$</span>
                                <input
                                    type=\"text\"
                                    value={commandInput}
                                    onChange={(e) => setCommandInput(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    className=\"flex-1 bg-slate-800 text-slate-200 px-3 py-2 rounded border border-slate-600 focus:border-cyan-400 focus:outline-none font-mono\"
                                    placeholder=\"Enter command...\"
                                    autoFocus
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ThunderbirdConsole;

