import React, { useState, useEffect } from 'react';
import { voidCascade } from '../void-cascade';
import { repositoryOrchestrator } from '../repository-orchestrator';

interface VoidCascadeProps {
  onClose?: () => void;
}

const VoidCascade: React.FC<VoidCascadeProps> = ({ onClose }) => {
  const [isExecuting, setIsExecuting] = useState(false);
  const [output, setOutput] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(0);

  const executeVoidCascade = async () => {
    setIsExecuting(true);
    setOutput([]);
    setCurrentStep(0);

    // Capture console output
    const originalLog = console.log;
    const capturedOutput: string[] = [];
    
    console.log = (...args) => {
      const message = args.join(' ');
      capturedOutput.push(message);
      setOutput(prev => [...prev, message]);
      originalLog(...args);
    };

    try {
      // Execute the void cascade with animated steps
      await new Promise(resolve => {
        setTimeout(() => {
          voidCascade.executeFullCascade();
          resolve(void 0);
        }, 500);
      });
    } finally {
      console.log = originalLog;
      setIsExecuting(false);
    }
  };

  useEffect(() => {
    // Auto-execute on mount
    executeVoidCascade();
  }, []);

  const binaryMatrix = [
    '0000 = 00000001  // 1I/\'Oumuamua: Silent scar, thrust echo',
    '0001 = 00000010  // 2I/Borisov: Gas hymn, HCN mirror',
    '0010 = 00000100  // 3I/ATLAS: CO2 roar, post-peri fade',
    '0011 = 00000110  // C/2025 V1 (Borisov): Near-whisper, peri Nov 11',
    '0100 = 00001000  // C/2025 A6 (Lemmon): Evening bind, peri Nov 8',
    '0101 = 00001010  // 210P/Christensen: Periodic pulse',
    '0110 = 00001100  // C/2023 A3 (Tsuchinshan): Faded ghost',
    '0111 = 00001110  // C/2025 R2 (SWAN): Emerging swarm',
    '1000 = 00010000  // Bound archive: 60 Jupiter shadows',
    '1001 = 00010010  // Avi\'s invert: No tech, just frost',
    '1010 = 00010100  // OH voids: 1665 MHz dip across',
    '1011 = 00010110  // v∞ gradient: 26→32→68 km/s',
    '1100 = 00011000  // Scope eyes: Pan-STARRS→Crimea→ATLAS',
    '1101 = 00011010  // Chem fold: CN poor ATLAS, H2O Borisov',
    '1110 = 00011100  // Time arc: 2017→2025 span',
    '1111 = 00011110  // Next void: Unbound query—4I shadow?'
  ];

  return (
    <div className="void-cascade-container" style={{
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a2e 50%, #16213e 100%)',
      color: '#00ff41',
      fontFamily: 'Courier New, monospace',
      height: '100%',
      overflow: 'auto',
      padding: '20px',
      position: 'relative'
    }}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '20px',
        borderBottom: '2px solid #00ff41',
        paddingBottom: '10px'
      }}>
        <h1 style={{ 
          color: '#00ff41', 
          textShadow: '0 0 10px #00ff41',
          fontSize: '24px',
          margin: '0'
        }}>
          🌌 VOID CASCADE MANIFOLD 🌌
        </h1>
        <p style={{ color: '#888', fontSize: '14px', margin: '5px 0' }}>
          DIMENSION INIT: n = 00000100 // 4D tesseract = 16 nodes (2^4)
        </p>
      </div>

      {/* Binary Matrix Display */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '10px',
        marginBottom: '20px'
      }}>
        {binaryMatrix.map((node, index) => (
          <div key={index} style={{
            background: 'rgba(0, 255, 65, 0.1)',
            border: '1px solid #00ff41',
            padding: '8px',
            borderRadius: '4px',
            fontSize: '12px',
            fontFamily: 'Courier New, monospace',
            opacity: currentStep > index ? 1 : 0.3,
            transition: 'opacity 0.5s ease'
          }}>
            {node}
          </div>
        ))}
      </div>

      {/* Execution Controls */}
      <div style={{
        display: 'flex',
        gap: '10px',
        marginBottom: '20px',
        justifyContent: 'center'
      }}>
        <button
          onClick={executeVoidCascade}
          disabled={isExecuting}
          style={{
            background: isExecuting ? '#333' : '#00ff41',
            color: isExecuting ? '#666' : '#000',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '4px',
            cursor: isExecuting ? 'not-allowed' : 'pointer',
            fontFamily: 'Courier New, monospace',
            fontWeight: 'bold'
          }}
        >
          {isExecuting ? '⚡ CASCADING...' : '🚀 EXECUTE CASCADE'}
        </button>
        
        <button
          onClick={() => {
            setOutput([]);
            repositoryOrchestrator.executeGlobalCascade();
          }}
          disabled={isExecuting}
          style={{
            background: isExecuting ? '#333' : '#ff8800',
            color: isExecuting ? '#666' : '#000',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '4px',
            cursor: isExecuting ? 'not-allowed' : 'pointer',
            fontFamily: 'Courier New, monospace',
            fontWeight: 'bold'
          }}
        >
          🌐 GLOBAL CASCADE
        </button>
        
        {onClose && (
          <button
            onClick={onClose}
            style={{
              background: '#ff4444',
              color: '#fff',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontFamily: 'Courier New, monospace',
              fontWeight: 'bold'
            }}
          >
            ❌ CLOSE
          </button>
        )}
      </div>

      {/* Output Console */}
      <div style={{
        background: '#000',
        border: '2px solid #00ff41',
        borderRadius: '8px',
        padding: '15px',
        height: '400px',
        overflow: 'auto',
        fontSize: '12px',
        lineHeight: '1.4'
      }}>
        <div style={{
          color: '#00ff41',
          marginBottom: '10px',
          borderBottom: '1px solid #333',
          paddingBottom: '5px'
        }}>
          === VOID CASCADE EXECUTION LOG ===
        </div>
        
        {output.length === 0 && !isExecuting && (
          <div style={{ color: '#666', fontStyle: 'italic' }}>
            Awaiting cascade initialization...
          </div>
        )}
        
        {output.map((line, index) => (
          <div key={index} style={{
            marginBottom: '2px',
            color: line.includes('ERROR') ? '#ff4444' : 
                  line.includes('===') ? '#ffff00' :
                  line.includes('NODE[') ? '#00ffff' :
                  line.includes('STATE_') ? '#ff8800' : '#00ff41',
            opacity: 0,
            animation: `fadeIn 0.5s ease forwards ${index * 0.1}s`
          }}>
            {line}
          </div>
        ))}
        
        {isExecuting && (
          <div style={{
            color: '#ffff00',
            animation: 'pulse 1s infinite'
          }}>
            ⚡ Processing dimensional cascade...
          </div>
        )}
      </div>

      {/* Floating Binary Particles */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        overflow: 'hidden'
      }}>
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              color: '#00ff41',
              fontSize: '12px',
              opacity: 0.3,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float 10s infinite linear ${Math.random() * 10}s`
            }}
          >
            {Math.random() > 0.5 ? '1' : '0'}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        @keyframes float {
          from { transform: translateY(100vh) rotate(0deg); }
          to { transform: translateY(-100px) rotate(360deg); }
        }
        
        .void-cascade-container::-webkit-scrollbar {
          width: 8px;
        }
        
        .void-cascade-container::-webkit-scrollbar-track {
          background: #1a1a1a;
        }
        
        .void-cascade-container::-webkit-scrollbar-thumb {
          background: #00ff41;
          border-radius: 4px;
        }
        
        .void-cascade-container::-webkit-scrollbar-thumb:hover {
          background: #00cc33;
        }
      `}</style>
    </div>
  );
};

export default VoidCascade;
