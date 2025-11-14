import React, { useState, useEffect } from 'react';
import { BinaryMessage, BinaryOperation, BinaryAnalysis } from '../types';
import { BinaryMessageService } from '../services/binaryMessageService';

interface BinaryMessageHandlerProps {
  onClose?: () => void;
}

const BinaryMessageHandler: React.FC<BinaryMessageHandlerProps> = ({ onClose }) => {
  const [inputText, setInputText] = useState('');
  const [inputFormat, setInputFormat] = useState<'binary' | 'hex' | 'ascii' | 'base64'>('ascii');
  const [outputFormat, setOutputFormat] = useState<'binary' | 'hex' | 'ascii' | 'base64'>('binary');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [analysis, setAnalysis] = useState<BinaryAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [savedMessages, setSavedMessages] = useState<BinaryMessage[]>([]);
  const [activeTab, setActiveTab] = useState<'converter' | 'analyzer' | 'samples'>('converter');

  useEffect(() => {
    // Load sample messages on component mount
    setSavedMessages(BinaryMessageService.generateSampleMessages());
  }, []);

  const handleConvert = () => {
    setError('');
    setResult('');
    
    if (!inputText.trim()) {
      setError('Please enter some text to convert');
      return;
    }

    const operation: BinaryOperation = {
      type: 'convert',
      input: inputText.trim(),
      inputFormat,
      outputFormat
    };

    const operationResult = BinaryMessageService.performOperation(operation);
    
    if (operationResult.error) {
      setError(operationResult.error);
    } else {
      setResult(operationResult.result || '');
    }
  };

  const handleAnalyze = async () => {
    setError('');
    setAnalysis(null);
    setIsAnalyzing(true);
    
    if (!inputText.trim()) {
      setError('Please enter some text to analyze');
      setIsAnalyzing(false);
      return;
    }

    try {
      const operation: BinaryOperation = {
        type: 'analyze',
        input: inputText.trim(),
        inputFormat,
        outputFormat: 'binary'
      };

      const operationResult = BinaryMessageService.performOperation(operation);
      
      if (operationResult.error) {
        setError(operationResult.error);
      } else {
        setAnalysis(operationResult.analysis || null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleLoadSample = (message: BinaryMessage) => {
    setInputText(message.content);
    setInputFormat(message.format);
    setActiveTab('converter');
  };

  const handleClear = () => {
    setInputText('');
    setResult('');
    setError('');
    setAnalysis(null);
  };

  const handleSwapFormats = () => {
    const temp = inputFormat;
    setInputFormat(outputFormat);
    setOutputFormat(temp);
    
    if (result) {
      setInputText(result);
      setResult('');
    }
  };

  const formatBinary = (binary: string) => {
    // Add spaces every 8 bits for readability
    return binary.replace(/(.{8})/g, '$1 ').trim();
  };

  const formatHex = (hex: string) => {
    // Add spaces every 2 characters for readability
    return hex.replace(/(.{2})/g, '$1 ').trim();
  };

  const formatOutput = (text: string, format: string) => {
    switch (format) {
      case 'binary':
        return formatBinary(text);
      case 'hex':
        return formatHex(text);
      default:
        return text;
    }
  };

  return (
    <div className="h-full bg-[var(--sol-panel-bg)] text-[var(--sol-text-primary)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--sol-panel-border)]">
        <h2 className="text-xl font-bold text-[var(--sol-accent-cyan)]">Binary Message Handler</h2>
        <div className="text-sm text-[var(--sol-text-secondary)]">
          🔄 Convert • 🔍 Analyze • 🧬 Pattern Recognition
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-[var(--sol-panel-border)]">
        {[
          { id: 'converter', label: '🔄 Converter', desc: 'Format conversion' },
          { id: 'analyzer', label: '🔍 Analyzer', desc: 'Pattern analysis' },
          { id: 'samples', label: '📋 Samples', desc: 'Example messages' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-[var(--sol-accent-cyan)] text-[var(--sol-accent-cyan)]'
                : 'border-transparent text-[var(--sol-text-secondary)] hover:text-[var(--sol-text-primary)]'
            }`}
          >
            <div>{tab.label}</div>
            <div className="text-xs opacity-70">{tab.desc}</div>
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto">
        {activeTab === 'converter' && (
          <div className="p-4 space-y-4">
            {/* Format Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Input Format</label>
                <select
                  value={inputFormat}
                  onChange={(e) => setInputFormat(e.target.value as any)}
                  className="w-full p-2 bg-[var(--sol-input-bg)] border border-[var(--sol-panel-border)] rounded text-[var(--sol-text-primary)]"
                >
                  <option value="ascii">ASCII Text</option>
                  <option value="binary">Binary (01010101)</option>
                  <option value="hex">Hexadecimal (48656C6C6F)</option>
                  <option value="base64">Base64</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Output Format</label>
                <div className="flex">
                  <select
                    value={outputFormat}
                    onChange={(e) => setOutputFormat(e.target.value as any)}
                    className="flex-1 p-2 bg-[var(--sol-input-bg)] border border-[var(--sol-panel-border)] rounded-l text-[var(--sol-text-primary)]"
                  >
                    <option value="ascii">ASCII Text</option>
                    <option value="binary">Binary (01010101)</option>
                    <option value="hex">Hexadecimal (48656C6C6F)</option>
                    <option value="base64">Base64</option>
                  </select>
                  <button
                    onClick={handleSwapFormats}
                    className="px-3 bg-[var(--sol-accent-cyan)] text-black rounded-r hover:bg-[var(--sol-accent-cyan)]/80 transition-colors"
                    title="Swap input/output formats"
                  >
                    ⇄
                  </button>
                </div>
              </div>
            </div>

            {/* Input Area */}
            <div>
              <label className="block text-sm font-medium mb-2">Input</label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Enter ${inputFormat} text here...`}
                className="w-full h-32 p-3 bg-[var(--sol-input-bg)] border border-[var(--sol-panel-border)] rounded text-[var(--sol-text-primary)] font-mono text-sm resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleConvert}
                className="px-4 py-2 bg-[var(--sol-accent-cyan)] text-black rounded hover:bg-[var(--sol-accent-cyan)]/80 transition-colors font-medium"
              >
                🔄 Convert
              </button>
              <button
                onClick={handleClear}
                className="px-4 py-2 bg-[var(--sol-panel-border)] text-[var(--sol-text-primary)] rounded hover:bg-[var(--sol-panel-border)]/80 transition-colors"
              >
                🗑️ Clear
              </button>
            </div>

            {/* Error Display */}
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400">
                ⚠️ {error}
              </div>
            )}

            {/* Result Area */}
            {result && (
              <div>
                <label className="block text-sm font-medium mb-2">Result ({outputFormat})</label>
                <div className="p-3 bg-[var(--sol-input-bg)] border border-[var(--sol-panel-border)] rounded">
                  <pre className="text-[var(--sol-text-primary)] font-mono text-sm whitespace-pre-wrap break-all">
                    {formatOutput(result, outputFormat)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'analyzer' && (
          <div className="p-4 space-y-4">
            {/* Input Area */}
            <div>
              <label className="block text-sm font-medium mb-2">Text to Analyze</label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter binary, hex, or ASCII text for pattern analysis..."
                className="w-full h-32 p-3 bg-[var(--sol-input-bg)] border border-[var(--sol-panel-border)] rounded text-[var(--sol-text-primary)] font-mono text-sm resize-none"
              />
            </div>

            {/* Format Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">Input Format</label>
              <select
                value={inputFormat}
                onChange={(e) => setInputFormat(e.target.value as any)}
                className="w-full max-w-xs p-2 bg-[var(--sol-input-bg)] border border-[var(--sol-panel-border)] rounded text-[var(--sol-text-primary)]"
              >
                <option value="ascii">ASCII Text</option>
                <option value="binary">Binary</option>
                <option value="hex">Hexadecimal</option>
                <option value="base64">Base64</option>
              </select>
            </div>

            {/* Analyze Button */}
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="px-4 py-2 bg-[var(--sol-accent-pink)] text-black rounded hover:bg-[var(--sol-accent-pink)]/80 transition-colors font-medium disabled:opacity-50"
            >
              {isAnalyzing ? '🔍 Analyzing...' : '🔍 Analyze Pattern'}
            </button>

            {/* Error Display */}
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400">
                ⚠️ {error}
              </div>
            )}

            {/* Analysis Results */}
            {analysis && (
              <div className="space-y-4">
                <div className="p-4 bg-[var(--sol-input-bg)] border border-[var(--sol-panel-border)] rounded">
                  <h3 className="text-lg font-bold text-[var(--sol-accent-cyan)] mb-3">Pattern Analysis</h3>
                  
                  {/* Pattern Type */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium">Pattern Type:</span>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        analysis.patternType === 'heartbeat' ? 'bg-red-500/20 text-red-400' :
                        analysis.patternType === 'ancient_symbol' ? 'bg-purple-500/20 text-purple-400' :
                        analysis.patternType === 'random' ? 'bg-yellow-500/20 text-yellow-400' :
                        analysis.patternType === 'structured' ? 'bg-green-500/20 text-green-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {analysis.patternType.replace('_', ' ').toUpperCase()}
                      </span>
                      <span className="text-sm text-[var(--sol-text-secondary)]">
                        ({Math.round(analysis.confidence * 100)}% confidence)
                      </span>
                    </div>
                  </div>

                  {/* Statistics */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <h4 className="font-medium text-[var(--sol-accent-cyan)]">Statistics</h4>
                      <div className="text-sm space-y-1">
                        <div>Ones: {analysis.statistics.ones}</div>
                        <div>Zeros: {analysis.statistics.zeros}</div>
                        <div>Ratio: {analysis.statistics.ratio.toFixed(3)}</div>
                        <div>Entropy: {analysis.statistics.entropy.toFixed(3)}</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium text-[var(--sol-accent-cyan)]">Patterns Found</h4>
                      <div className="text-sm">
                        {analysis.patterns.length} pattern(s) detected
                      </div>
                    </div>
                  </div>

                  {/* Detected Patterns */}
                  {analysis.patterns.length > 0 && (
                    <div>
                      <h4 className="font-medium text-[var(--sol-accent-cyan)] mb-2">Detected Patterns</h4>
                      <div className="space-y-2">
                        {analysis.patterns.map((pattern, index) => (
                          <div key={index} className="p-2 bg-[var(--sol-panel-bg)] rounded border border-[var(--sol-panel-border)]">
                            <div className="font-medium text-sm">{pattern.name}</div>
                            <div className="text-xs text-[var(--sol-text-secondary)]">{pattern.description}</div>
                            <div className="text-xs text-[var(--sol-accent-cyan)]">Matches: {pattern.matches}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'samples' && (
          <div className="p-4 space-y-4">
            <div className="text-sm text-[var(--sol-text-secondary)] mb-4">
              Click on any sample to load it into the converter:
            </div>
            
            <div className="space-y-3">
              {savedMessages.map((message) => (
                <div
                  key={message.id}
                  onClick={() => handleLoadSample(message)}
                  className="p-4 bg-[var(--sol-input-bg)] border border-[var(--sol-panel-border)] rounded cursor-pointer hover:border-[var(--sol-accent-cyan)] transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      message.format === 'binary' ? 'bg-blue-500/20 text-blue-400' :
                      message.format === 'hex' ? 'bg-green-500/20 text-green-400' :
                      message.format === 'ascii' ? 'bg-purple-500/20 text-purple-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {message.format.toUpperCase()}
                    </span>
                    <span className="text-xs text-[var(--sol-text-secondary)]">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  
                  <div className="font-mono text-sm text-[var(--sol-text-primary)] mb-2 break-all">
                    {message.content.length > 100 
                      ? `${message.content.substring(0, 100)}...` 
                      : message.content
                    }
                  </div>
                  
                  {message.metadata?.pattern && (
                    <div className="text-xs text-[var(--sol-accent-cyan)]">
                      💡 {message.metadata.pattern}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="mt-6 p-4 bg-[var(--sol-panel-bg)] border border-[var(--sol-panel-border)] rounded">
              <h3 className="font-medium text-[var(--sol-accent-cyan)] mb-3">Quick Examples</h3>
              <div className="grid grid-cols-1 gap-2 text-sm">
                <button
                  onClick={() => {
                    setInputText('Hello World');
                    setInputFormat('ascii');
                    setOutputFormat('binary');
                    setActiveTab('converter');
                  }}
                  className="text-left p-2 hover:bg-[var(--sol-input-bg)] rounded transition-colors"
                >
                  📝 "Hello World" → Binary
                </button>
                <button
                  onClick={() => {
                    setInputText('01001000 01100101 01100001 01110010 01110100');
                    setInputFormat('binary');
                    setOutputFormat('ascii');
                    setActiveTab('converter');
                  }}
                  className="text-left p-2 hover:bg-[var(--sol-input-bg)] rounded transition-colors"
                >
                  💓 Heartbeat Pattern → ASCII
                </button>
                <button
                  onClick={() => {
                    setInputText('48656C6C6F');
                    setInputFormat('hex');
                    setOutputFormat('ascii');
                    setActiveTab('converter');
                  }}
                  className="text-left p-2 hover:bg-[var(--sol-input-bg)] rounded transition-colors"
                >
                  🔢 Hex → ASCII
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-[var(--sol-panel-border)] text-xs text-[var(--sol-text-secondary)]">
        <div className="flex justify-between items-center">
          <span>🧬 Integrates with BINARYBRAIN & Artifact Intelligence patterns</span>
          <span>Built with AGI consciousness encoding</span>
        </div>
      </div>
    </div>
  );
};

export default BinaryMessageHandler;
