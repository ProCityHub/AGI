import { BinaryMessage, BinaryOperation, BinaryAnalysis, HeartbeatPattern, AncientSymbolMapping } from '../types';

// Ancient symbol mappings from Artifact Intelligence
const ANCIENT_SYMBOLS: AncientSymbolMapping[] = [
  // Sumerian
  { symbol: '𒀭', name: 'Anu (Heaven)', binary: '11100011', hex: 'E3', meaning: 'Divine authority', category: 'sumerian' },
  { symbol: '𒆠', name: 'Earth', binary: '11100100', hex: 'E4', meaning: 'Material realm', category: 'sumerian' },
  { symbol: '𒑐', name: 'Sixty', binary: '11110011', hex: 'F3', meaning: 'Completion cycle', category: 'sumerian' },
  
  // Egyptian
  { symbol: '𓂀', name: 'Ankh (Life)', binary: '11101001', hex: 'E9', meaning: 'Eternal life', category: 'egyptian' },
  { symbol: '𓁩', name: 'Horus (Observer)', binary: '11101010', hex: 'EA', meaning: 'Divine sight', category: 'egyptian' },
  { symbol: '𓆣', name: 'Scarab (Transformation)', binary: '11101011', hex: 'EB', meaning: 'Metamorphosis', category: 'egyptian' },
  
  // Geometric
  { symbol: '●', name: 'Circle (Unity)', binary: '00000001', hex: '01', meaning: 'Wholeness', category: 'geometric' },
  { symbol: '▲', name: 'Triangle (Trinity)', binary: '00000011', hex: '03', meaning: 'Divine trinity', category: 'geometric' },
  { symbol: '□', name: 'Square (Manifestation)', binary: '00000100', hex: '04', meaning: 'Material form', category: 'geometric' },
  { symbol: '✡', name: 'Star (Balance)', binary: '00000101', hex: '05', meaning: 'Harmony', category: 'geometric' },
  
  // Elemental
  { symbol: '🜁', name: 'Air', binary: '0110', hex: '6', meaning: 'Communication', category: 'elemental' },
  { symbol: '🜂', name: 'Fire', binary: '1001', hex: '9', meaning: 'Transformation', category: 'elemental' },
  { symbol: '🜃', name: 'Water', binary: '0011', hex: '3', meaning: 'Flow/Emotion', category: 'elemental' },
  { symbol: '🜄', name: 'Earth', binary: '0000', hex: '0', meaning: 'Foundation', category: 'elemental' },
];

// Numerical constants from Artifact Intelligence
const SACRED_NUMBERS = {
  7: '00000111',
  11: '00001011',
  13: '00001101',
  17: '00010001',
  23: '00010111',
  60: '00111100',
  144: '10010000',
  432: '110110000'
};

export class BinaryMessageService {
  
  // Core conversion functions
  static binaryToHex(binary: string): string {
    if (!this.isValidBinary(binary)) {
      throw new Error('Invalid binary string');
    }
    
    // Pad to multiple of 4
    const paddedBinary = binary.padStart(Math.ceil(binary.length / 4) * 4, '0');
    let hex = '';
    
    for (let i = 0; i < paddedBinary.length; i += 4) {
      const chunk = paddedBinary.substr(i, 4);
      hex += parseInt(chunk, 2).toString(16).toUpperCase();
    }
    
    return hex;
  }
  
  static hexToBinary(hex: string): string {
    if (!this.isValidHex(hex)) {
      throw new Error('Invalid hex string');
    }
    
    return hex.split('').map(char => 
      parseInt(char, 16).toString(2).padStart(4, '0')
    ).join('');
  }
  
  static binaryToAscii(binary: string): string {
    if (!this.isValidBinary(binary)) {
      throw new Error('Invalid binary string');
    }
    
    // Pad to multiple of 8
    const paddedBinary = binary.padStart(Math.ceil(binary.length / 8) * 8, '0');
    let ascii = '';
    
    for (let i = 0; i < paddedBinary.length; i += 8) {
      const byte = paddedBinary.substr(i, 8);
      const charCode = parseInt(byte, 2);
      if (charCode >= 32 && charCode <= 126) { // Printable ASCII
        ascii += String.fromCharCode(charCode);
      } else {
        ascii += `[${charCode}]`; // Non-printable characters
      }
    }
    
    return ascii;
  }
  
  static asciiToBinary(ascii: string): string {
    return ascii.split('').map(char => 
      char.charCodeAt(0).toString(2).padStart(8, '0')
    ).join('');
  }
  
  static binaryToBase64(binary: string): string {
    if (!this.isValidBinary(binary)) {
      throw new Error('Invalid binary string');
    }
    
    // Convert binary to bytes
    const paddedBinary = binary.padStart(Math.ceil(binary.length / 8) * 8, '0');
    const bytes = [];
    
    for (let i = 0; i < paddedBinary.length; i += 8) {
      bytes.push(parseInt(paddedBinary.substr(i, 8), 2));
    }
    
    // Convert to base64
    const uint8Array = new Uint8Array(bytes);
    return btoa(String.fromCharCode(...uint8Array));
  }
  
  static base64ToBinary(base64: string): string {
    try {
      const binaryString = atob(base64);
      return binaryString.split('').map(char => 
        char.charCodeAt(0).toString(2).padStart(8, '0')
      ).join('');
    } catch (error) {
      throw new Error('Invalid base64 string');
    }
  }
  
  // Validation functions
  static isValidBinary(binary: string): boolean {
    return /^[01]+$/.test(binary);
  }
  
  static isValidHex(hex: string): boolean {
    return /^[0-9A-Fa-f]+$/.test(hex);
  }
  
  // Pattern analysis functions
  static analyzeHeartbeatPattern(binary: string): HeartbeatPattern[] {
    const patterns: HeartbeatPattern[] = [];
    
    // Convert to ASCII to check for HEARTBEAT pattern
    try {
      const ascii = this.binaryToAscii(binary);
      const heartbeatChars = 'heartbeat';
      
      for (let i = 0; i < heartbeatChars.length; i++) {
        const char = heartbeatChars[i];
        const charBinary = this.asciiToBinary(char);
        
        // Analyze gaps between ones (from BINARYBRAIN analysis)
        const gaps = this.analyzeGaps(charBinary);
        
        patterns.push({
          character: char,
          binary: charBinary,
          rhythm: this.calculateRhythm(charBinary),
          gaps: gaps
        });
      }
    } catch (error) {
      // Not ASCII, analyze as raw binary
    }
    
    return patterns;
  }
  
  private static analyzeGaps(binary: string): number[] {
    const gaps: number[] = [];
    let currentGap = 0;
    let inGap = false;
    
    for (let i = 0; i < binary.length; i++) {
      if (binary[i] === '0') {
        if (!inGap) {
          inGap = true;
          currentGap = 1;
        } else {
          currentGap++;
        }
      } else {
        if (inGap) {
          gaps.push(currentGap);
          inGap = false;
          currentGap = 0;
        }
      }
    }
    
    if (inGap) {
      gaps.push(currentGap);
    }
    
    return gaps;
  }
  
  private static calculateRhythm(binary: string): number[] {
    const rhythm: number[] = [];
    let currentRun = 0;
    let currentBit = binary[0];
    
    for (let i = 0; i < binary.length; i++) {
      if (binary[i] === currentBit) {
        currentRun++;
      } else {
        rhythm.push(currentRun);
        currentBit = binary[i];
        currentRun = 1;
      }
    }
    
    rhythm.push(currentRun);
    return rhythm;
  }
  
  static analyzeAncientSymbols(binary: string): AncientSymbolMapping[] {
    const matches: AncientSymbolMapping[] = [];
    
    ANCIENT_SYMBOLS.forEach(symbol => {
      if (binary.includes(symbol.binary)) {
        matches.push(symbol);
      }
    });
    
    return matches;
  }
  
  static calculateEntropy(binary: string): number {
    if (!binary.length) return 0;
    
    const ones = (binary.match(/1/g) || []).length;
    const zeros = binary.length - ones;
    
    if (ones === 0 || zeros === 0) return 0;
    
    const p1 = ones / binary.length;
    const p0 = zeros / binary.length;
    
    return -(p1 * Math.log2(p1) + p0 * Math.log2(p0));
  }
  
  static performAnalysis(binary: string): BinaryAnalysis {
    const ones = (binary.match(/1/g) || []).length;
    const zeros = binary.length - ones;
    const ratio = ones / (ones + zeros);
    const entropy = this.calculateEntropy(binary);
    
    // Detect patterns
    const heartbeatPatterns = this.analyzeHeartbeatPattern(binary);
    const ancientSymbols = this.analyzeAncientSymbols(binary);
    
    let patternType: BinaryAnalysis['patternType'] = 'unknown';
    let confidence = 0;
    
    if (heartbeatPatterns.length > 0) {
      patternType = 'heartbeat';
      confidence = 0.8;
    } else if (ancientSymbols.length > 0) {
      patternType = 'ancient_symbol';
      confidence = 0.9;
    } else if (entropy > 0.9) {
      patternType = 'random';
      confidence = 0.7;
    } else if (entropy < 0.3) {
      patternType = 'structured';
      confidence = 0.6;
    }
    
    const patterns = [
      ...heartbeatPatterns.map(p => ({
        name: `Heartbeat: ${p.character}`,
        description: `Rhythm pattern: ${p.rhythm.join('-')}`,
        matches: 1
      })),
      ...ancientSymbols.map(s => ({
        name: s.name,
        description: s.meaning,
        matches: (binary.match(new RegExp(s.binary, 'g')) || []).length
      }))
    ];
    
    return {
      patternType,
      confidence,
      patterns,
      statistics: {
        ones,
        zeros,
        ratio,
        entropy
      }
    };
  }
  
  // Main operation handler
  static performOperation(operation: BinaryOperation): BinaryOperation {
    const result: BinaryOperation = { ...operation };
    
    try {
      switch (operation.type) {
        case 'convert':
          result.result = this.convert(operation.input, operation.inputFormat, operation.outputFormat);
          break;
          
        case 'encode':
          if (operation.inputFormat === 'ascii' && operation.outputFormat === 'binary') {
            result.result = this.asciiToBinary(operation.input);
          } else if (operation.inputFormat === 'ascii' && operation.outputFormat === 'hex') {
            result.result = this.binaryToHex(this.asciiToBinary(operation.input));
          }
          break;
          
        case 'decode':
          if (operation.inputFormat === 'binary' && operation.outputFormat === 'ascii') {
            result.result = this.binaryToAscii(operation.input);
          } else if (operation.inputFormat === 'hex' && operation.outputFormat === 'ascii') {
            result.result = this.binaryToAscii(this.hexToBinary(operation.input));
          }
          break;
          
        case 'analyze':
          const binaryInput = operation.inputFormat === 'binary' ? operation.input : 
                             operation.inputFormat === 'hex' ? this.hexToBinary(operation.input) :
                             this.asciiToBinary(operation.input);
          result.analysis = this.performAnalysis(binaryInput);
          result.result = `Analysis complete: ${result.analysis.patternType} pattern detected`;
          break;
          
        case 'validate':
          const isValid = operation.inputFormat === 'binary' ? this.isValidBinary(operation.input) :
                         operation.inputFormat === 'hex' ? this.isValidHex(operation.input) : true;
          result.result = isValid ? 'Valid' : 'Invalid';
          break;
      }
    } catch (error) {
      result.error = error instanceof Error ? error.message : 'Unknown error';
    }
    
    return result;
  }
  
  private static convert(input: string, from: string, to: string): string {
    if (from === to) return input;
    
    // Convert to binary first
    let binary: string;
    switch (from) {
      case 'binary':
        binary = input;
        break;
      case 'hex':
        binary = this.hexToBinary(input);
        break;
      case 'ascii':
        binary = this.asciiToBinary(input);
        break;
      case 'base64':
        binary = this.base64ToBinary(input);
        break;
      default:
        throw new Error(`Unsupported input format: ${from}`);
    }
    
    // Convert from binary to target format
    switch (to) {
      case 'binary':
        return binary;
      case 'hex':
        return this.binaryToHex(binary);
      case 'ascii':
        return this.binaryToAscii(binary);
      case 'base64':
        return this.binaryToBase64(binary);
      default:
        throw new Error(`Unsupported output format: ${to}`);
    }
  }
  
  // Generate sample messages for testing
  static generateSampleMessages(): BinaryMessage[] {
    const samples: BinaryMessage[] = [
      {
        id: '1',
        content: '01001000 01100101 01101100 01101100 01101111',
        format: 'binary',
        timestamp: new Date().toISOString(),
        metadata: {
          pattern: 'ASCII text: Hello',
          encoding: 'UTF-8'
        }
      },
      {
        id: '2',
        content: '48656C6C6F20576F726C64',
        format: 'hex',
        timestamp: new Date().toISOString(),
        metadata: {
          pattern: 'ASCII text: Hello World',
          encoding: 'UTF-8'
        }
      },
      {
        id: '3',
        content: '01001000 01000101 01000001 01010010 01010100 01000010 01000101 01000001 01010100',
        format: 'binary',
        timestamp: new Date().toISOString(),
        metadata: {
          pattern: 'Heartbeat pattern from BINARYBRAIN',
          encoding: 'ASCII'
        }
      }
    ];
    
    return samples;
  }
}
