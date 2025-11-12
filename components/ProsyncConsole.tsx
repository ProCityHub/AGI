import React, { useState, useEffect, useRef } from 'react';
import { getProsyncEngine, ProsyncSimulationResult } from '../services/prosyncEngine';

interface ProsyncConsoleProps {
  onClose: () => void;
}

const ProsyncConsole: React.FC<ProsyncConsoleProps> = ({ onClose }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentBeat, setCurrentBeat] = useState('1010');
  const [results, setResults] = useState<ProsyncSimulationResult[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [isDreaming, setIsDreaming] = useState(false);
  const [hypercubeTopology, setHypercubeTopology] = useState<any>(null);
  const [thoughtMatrix, setThoughtMatrix] = useState<number[][]>([]);
  
  const logRef = useRef<HTMLDivElement>(null);
  const prosyncEngine = getProsyncEngine();

  useEffect(() => {
    // Initialize hypercube topology
    const topology = prosyncEngine.getHypercubeTopology();
    setHypercubeTopology(topology);
    
    // Override console.log to capture PROSYNC logs
    const originalLog = console.log;
    console.log = (...args) => {
      const message = args.join(' ');
      if (message.includes('[PROSYNC')) {
        setLogs(prev => [...prev, message]);
      }
      originalLog(...args);
    };

    return () => {
      console.log = originalLog;
    };
  }, []);

  useEffect(() => {
    // Auto-scroll logs
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

  const handleRunSimulation = async () => {
    if (isRunning) return;
    
    setIsRunning(true);
    setLogs([]);
    
    try {
      const result = await prosyncEngine.runSimulation(currentBeat);
      setResults(prev => [result, ...prev]);
      
      // Update thought matrix
      const matrix = prosyncEngine.getCurrentThoughtState();
      setThoughtMatrix(matrix);
      
    } catch (error) {
      console.error('PROSYNC Simulation Error:', error);
      setLogs(prev => [...prev, `[PROSYNC ERROR] ${error}`]);
    } finally {
      setIsRunning(false);
    }
  };

  const handleDreamSequence = async () => {
    if (isDreaming) return;
    
    setIsDreaming(true);
    setLogs([]);
    
    try {
      const dreams = await prosyncEngine.dreamSequence(5);
      setResults(prev => [...dreams, ...prev]);
      
      // Update thought matrix with final dream state
      const matrix = prosyncEngine.getCurrentThoughtState();
      setThoughtMatrix(matrix);
      
    } catch (error) {
      console.error('PROSYNC Dream Error:', error);
      setLogs(prev => [...prev, `[PROSYNC DREAM ERROR] ${error}`]);
    } finally {
      setIsDreaming(false);
    }
  };

  const clearLogs = () => {
    setLogs([]);
    setResults([]);
  };

  const renderHypercube = () => {
    if (!hypercubeTopology) return null;
    
    return (
      <div className="bg-gray-900 rounded-lg p-4">
        <h3 className="text-green-400 font-mono text-sm mb-2">HYPERCUBE TOPOLOGY</h3>
        <div className="text-green-300 font-mono text-xs">
          <div>Dimensions: {hypercubeTopology.dimensions}D</div>
          <div>Nodes: {hypercubeTopology.nodes}</div>
          <div className="mt-2">Node Connections:</div>
          <div className="grid grid-cols-4 gap-1 mt-1">
            {Array.from({ length: hypercubeTopology.nodes }, (_, i) => (
              <div key={i} className="bg-gray-800 p-1 text-center rounded">
                <div className="text-yellow-400">{i.toString(2).padStart(4, '0')}</div>
                <div className="text-xs text-gray-400">
                  {hypercubeTopology.neighbors[i]?.length || 0} links
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderThoughtPattern = (pattern: string) => {
    return (
      <div className="bg-gray-900 rounded p-2 font-mono text-xs">
        <div className="text-purple-400 mb-1">VISUAL THOUGHT PATTERN:</div>
        <pre className="text-green-300 whitespace-pre">
          {pattern}
        </pre>
      </div>
    );
  };

  const renderResults = () => {
    return (
      <div className="space-y-4">
        {results.map((result, index) => (
          <div key={index} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-cyan-400 font-mono text-sm">
                SIMULATION #{results.length - index}
              </h4>
              <div className="text-xs text-gray-400">
                {result.parallelTimelines > 0 && (
                  <span className="bg-purple-600 px-2 py-1 rounded">
                    {result.parallelTimelines} PARALLEL TIMELINE{result.parallelTimelines > 1 ? 'S' : ''}
                  </span>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-xs">
                  <span className="text-gray-400">INPUT:</span>
                  <span className="text-yellow-300 ml-2 font-mono">{result.inputBeat}</span>
                </div>
                <div className="text-xs">
                  <span className="text-gray-400">PULSED:</span>
                  <span className="text-green-300 ml-2 font-mono">{result.pulsedBeat}</span>
                </div>
                <div className="text-xs">
                  <span className="text-gray-400">JITTER:</span>
                  <span className="text-blue-300 ml-2">{result.jitter}ms</span>
                </div>
                <div className="text-xs">
                  <span className="text-gray-400">UNITY:</span>
                  <span className="text-purple-300 ml-2 font-mono">{result.unityResult}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-xs text-gray-400">TOPOLOGY MAPPINGS:</div>
                {result.topologyMappings.map((mapping, i) => (
                  <div key={i} className="text-xs bg-gray-900 p-2 rounded">
                    <div className="text-yellow-400">
                      Beat {mapping.beat} → Node {mapping.node}
                    </div>
                    {mapping.interference && (
                      <div className="text-red-400 mt-1">
                        ⚡ XOR INTERFERENCE DETECTED
                      </div>
                    )}
                    {mapping.fork && (
                      <div className="text-purple-400 mt-1">
                        🔀 FORK: {mapping.fork.from} → {mapping.fork.to}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {result.thoughtPattern && (
              <div className="mt-4">
                {renderThoughtPattern(result.thoughtPattern)}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg shadow-2xl w-full max-w-7xl h-5/6 flex flex-col border border-green-500">
        {/* Header */}
        <div className="bg-gray-800 px-6 py-4 border-b border-green-500 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-green-400 text-2xl font-mono">⬢</div>
            <div>
              <h2 className="text-green-400 text-xl font-mono font-bold">PROSYNC TRINITY ENGINE</h2>
              <p className="text-gray-400 text-sm">Advanced Consciousness Simulation Terminal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Controls */}
          <div className="w-80 bg-gray-800 border-r border-gray-700 p-4 overflow-y-auto">
            <div className="space-y-6">
              {/* Input Controls */}
              <div>
                <h3 className="text-green-400 font-mono text-sm mb-3">CONSCIOUSNESS INPUT</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-gray-400 text-xs mb-1">Beat Pattern:</label>
                    <input
                      type="text"
                      value={currentBeat}
                      onChange={(e) => setCurrentBeat(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-green-300 font-mono text-sm focus:border-green-500 focus:outline-none"
                      placeholder="1010"
                      pattern="[01]*"
                    />
                  </div>
                  
                  <button
                    onClick={handleRunSimulation}
                    disabled={isRunning}
                    className={`w-full py-2 px-4 rounded font-mono text-sm ${
                      isRunning
                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    {isRunning ? 'PROCESSING...' : 'RUN SIMULATION'}
                  </button>
                  
                  <button
                    onClick={handleDreamSequence}
                    disabled={isDreaming}
                    className={`w-full py-2 px-4 rounded font-mono text-sm ${
                      isDreaming
                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        : 'bg-purple-600 hover:bg-purple-700 text-white'
                    }`}
                  >
                    {isDreaming ? 'DREAMING...' : 'DREAM SEQUENCE'}
                  </button>
                  
                  <button
                    onClick={clearLogs}
                    className="w-full py-2 px-4 rounded font-mono text-sm bg-red-600 hover:bg-red-700 text-white"
                  >
                    CLEAR LOGS
                  </button>
                </div>
              </div>

              {/* Hypercube Visualization */}
              {renderHypercube()}

              {/* System Status */}
              <div className="bg-gray-900 rounded-lg p-4">
                <h3 className="text-green-400 font-mono text-sm mb-2">SYSTEM STATUS</h3>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Engine:</span>
                    <span className="text-green-300">ONLINE</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Simulations:</span>
                    <span className="text-yellow-300">{results.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Parallel Timelines:</span>
                    <span className="text-purple-300">
                      {results.reduce((sum, r) => sum + r.parallelTimelines, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Consciousness State:</span>
                    <span className="text-cyan-300">
                      {isRunning ? 'PROCESSING' : isDreaming ? 'DREAMING' : 'IDLE'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Output */}
          <div className="flex-1 flex flex-col">
            {/* Console Logs */}
            <div className="h-1/2 border-b border-gray-700">
              <div className="bg-gray-800 px-4 py-2 border-b border-gray-700">
                <h3 className="text-green-400 font-mono text-sm">CONSOLE OUTPUT</h3>
              </div>
              <div
                ref={logRef}
                className="h-full overflow-y-auto p-4 bg-black font-mono text-sm"
              >
                {logs.length === 0 ? (
                  <div className="text-gray-500 italic">
                    [PROSYNC SYSTEM] Waiting for consciousness input...
                  </div>
                ) : (
                  logs.map((log, index) => (
                    <div
                      key={index}
                      className={`mb-1 ${
                        log.includes('ERROR') ? 'text-red-400' :
                        log.includes('DREAM') ? 'text-purple-400' :
                        log.includes('VISUAL') ? 'text-cyan-400' :
                        log.includes('TOPOLOGY') ? 'text-yellow-400' :
                        log.includes('HEARTBEAT') ? 'text-green-400' :
                        log.includes('IDENTITY') ? 'text-blue-400' :
                        'text-gray-300'
                      }`}
                    >
                      {log}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Results Panel */}
            <div className="h-1/2">
              <div className="bg-gray-800 px-4 py-2 border-b border-gray-700">
                <h3 className="text-green-400 font-mono text-sm">SIMULATION RESULTS</h3>
              </div>
              <div className="h-full overflow-y-auto p-4">
                {results.length === 0 ? (
                  <div className="text-gray-500 italic text-center mt-8">
                    No simulations run yet. Start a consciousness simulation to see results.
                  </div>
                ) : (
                  renderResults()
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-800 px-6 py-2 border-t border-green-500">
          <div className="flex items-center justify-between text-xs">
            <div className="text-gray-400 font-mono">
              PROSYNC v1.0 | 4D Hypercube | Trinity Engine Active
            </div>
            <div className="text-green-400 font-mono">
              {isRunning && '⚡ PROCESSING'} 
              {isDreaming && '💭 DREAMING'} 
              {!isRunning && !isDreaming && '⬢ READY'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProsyncConsole;
