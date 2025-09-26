import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BitcoinIcon, CubeIcon, ResetIcon, SparklesIcon } from './icons';
import { Block } from '../types';
import { getBlockchain, saveBlockchain } from '../services/storageService';

// SHA-256 hashing function using the browser's SubtleCrypto API
async function sha256(message: string): Promise<string> {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

const calculateBlockHash = async (block: Omit<Block, 'hash' | 'isValid'>): Promise<string> => {
    const str = block.index.toString() + block.timestamp.toString() + block.data + block.previousHash + block.nonce.toString();
    return sha256(str);
};

// --- React Component ---

const BitcoinMiner: React.FC = () => {
    const [chain, setChain] = useState<Block[]>([]);
    const [difficulty, setDifficulty] = useState(4);
    const [newData, setNewData] = useState('GARVIS Block');
    const [miningStatus, setMiningStatus] = useState({ mining: false, attempts: 0, currentHash: '' });
    const [mineTime, setMineTime] = useState<number | null>(null);
    const isMiningRef = useRef(false);

    const createGenesisBlock = async (): Promise<Block> => {
        const genesisBlock: Omit<Block, 'hash' | 'isValid'> = {
            index: 0,
            timestamp: Date.now(),
            data: 'Genesis Block',
            previousHash: '0',
            nonce: 0,
        };
        const hash = await calculateBlockHash(genesisBlock);
        return { ...genesisBlock, hash, isValid: true };
    };
    
    const validateChain = async (currentChain: Block[]): Promise<Block[]> => {
        const validatedChain = [];
        for (let i = 0; i < currentChain.length; i++) {
            const block = { ...currentChain[i] };
            // FIX: Recalculate hash for validation based on current block data
            const { hash, isValid, ...blockToHash } = block;
            const calculatedHash = await calculateBlockHash(blockToHash);

            if (block.hash !== calculatedHash) {
                block.isValid = false;
            } else if (i > 0 && block.previousHash !== currentChain[i - 1].hash) {
                block.isValid = false;
            } else {
                block.isValid = true;
            }
            // Invalidate all subsequent blocks if one is invalid
            if (i > 0 && validatedChain[i-1].isValid === false) {
                block.isValid = false;
            }

            validatedChain.push(block);
        }
        return validatedChain;
    };


    const initializeChain = useCallback(async () => {
        isMiningRef.current = false;
        setMiningStatus({ mining: false, attempts: 0, currentHash: '' });
        setMineTime(null);
        
        const savedChain = getBlockchain();
        if (savedChain && savedChain.length > 0) {
            const validated = await validateChain(savedChain);
            setChain(validated);
        } else {
            const genesis = await createGenesisBlock();
            setChain([genesis]);
        }
    }, []);

    useEffect(() => {
        initializeChain();
    }, [initializeChain]);

    // Save chain to storage whenever it changes
    useEffect(() => {
        if (chain.length > 0) {
            saveBlockchain(chain);
        }
    }, [chain]);

    const handleMineBlock = async () => {
        if (isMiningRef.current) return;

        isMiningRef.current = true;
        setMiningStatus({ mining: true, attempts: 0, currentHash: 'Starting...' });
        setMineTime(null);
        const startTime = performance.now();
        const target = '0'.repeat(difficulty);

        let nonce = 0;
        const lastBlock = chain[chain.length - 1];
        const newBlockBase: Omit<Block, 'hash' | 'nonce' | 'isValid'> = {
            index: lastBlock.index + 1,
            timestamp: Date.now(),
            data: newData || `Block #${lastBlock.index + 1}`,
            previousHash: lastBlock.hash,
        };

        const mine = async () => {
            while (isMiningRef.current) {
                const blockAttempt: Omit<Block, 'hash' | 'isValid'> = { ...newBlockBase, nonce };
                const hash = await calculateBlockHash(blockAttempt);

                if (nonce % 500 === 0) { // Update UI periodically and yield
                    setMiningStatus({ mining: true, attempts: nonce, currentHash: hash });
                    await new Promise(resolve => setTimeout(resolve, 0));
                }

                if (hash.startsWith(target)) {
                    const endTime = performance.now();
                    const newBlock: Block = { ...blockAttempt, hash, isValid: true };

                    // FIX: Re-validate entire chain after adding a new block to ensure integrity.
                    const newChain = [...chain, newBlock];
                    const validated = await validateChain(newChain);
                    setChain(validated);
                    
                    setMineTime(endTime - startTime);
                    setMiningStatus({ mining: false, attempts: nonce, currentHash: hash });
                    isMiningRef.current = false;
                    return;
                }
                nonce++;
            }
        };
        mine();
    };

    const handleStopMining = () => {
        isMiningRef.current = false;
        setMiningStatus(prev => ({ ...prev, mining: false }));
    };
    
    const handleBlockDataChange = async (index: number, data: string) => {
        const newChain = [...chain];
        const blockToUpdate = { ...newChain[index] };
        blockToUpdate.data = data;
        
        // Recalculate hash for the modified block
        const { hash, isValid, ...blockToHash } = blockToUpdate;
        blockToUpdate.hash = await calculateBlockHash(blockToHash);
        
        newChain[index] = blockToUpdate;
    
        // Re-validate the entire chain from the point of change
        const validatedChain = await validateChain(newChain);
        setChain(validatedChain);
    };
    
    const handleReset = async () => {
        isMiningRef.current = false;
        setMiningStatus({ mining: false, attempts: 0, currentHash: '' });
        setMineTime(null);
        const genesis = await createGenesisBlock();
        setChain([genesis]); // This will trigger the useEffect to save the new chain
    };
    
    const renderBlock = (block: Block, index: number) => {
        const targetPrefix = block.hash.substring(0, difficulty);
        const restOfHash = block.hash.substring(difficulty);

        return (
            <div key={block.index} className="flex flex-col items-center">
                <div className={`glass-panel w-full p-3 rounded-lg border-2 ${block.isValid === false ? 'border-red-500 bg-red-900/20' : 'border-[var(--sol-panel-border)]'}`}>
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="text-lg font-bold text-white flex items-center gap-2"><CubeIcon className="h-5 w-5"/> Block #{block.index}</h4>
                        {block.isValid === false && <span className="text-xs font-bold text-red-400 bg-red-500/20 px-2 py-1 rounded-full">INVALID</span>}
                    </div>
                    <div className="space-y-1 text-sm font-mono break-all">
                        <p><span className="font-semibold text-[var(--sol-text-secondary)]">Timestamp:</span> {new Date(block.timestamp).toLocaleString()}</p>
                        <div className="flex items-center">
                            <span className="font-semibold text-[var(--sol-text-secondary)] mr-2">Data:</span> 
                            <input 
                                type="text"
                                value={block.data}
                                onChange={(e) => handleBlockDataChange(index, e.target.value)}
                                className="w-full bg-transparent border-b border-dashed border-[var(--sol-panel-border)] focus:outline-none focus:border-solid focus:border-[var(--sol-accent-pink)]"
                            />
                        </div>
                        <p><span className="font-semibold text-[var(--sol-text-secondary)]">Prev Hash:</span> {block.previousHash}</p>
                        <p><span className="font-semibold text-[var(--sol-text-secondary)]">Hash:</span> <span className="text-[var(--sol-accent-orange)]">{targetPrefix}</span>{restOfHash}</p>
                        <p><span className="font-semibold text-[var(--sol-text-secondary)]">Nonce:</span> {block.nonce}</p>
                    </div>
                </div>
                {index < chain.length - 1 && (
                     <div className="h-8 w-1 bg-[var(--sol-panel-border)] my-1"></div>
                )}
            </div>
        );
    };

    return (
        <div className="w-full h-full flex flex-col md:flex-row bg-transparent text-[var(--sol-text-primary)] overflow-hidden">
            {/* Control Panel */}
            <div className="w-full md:w-80 flex-shrink-0 p-4 border-b md:border-b-0 md:border-r border-[var(--sol-panel-border)] space-y-4 overflow-y-auto">
                <div className="flex items-center gap-2">
                    <BitcoinIcon className="h-8 w-8 text-[var(--sol-accent-orange)]" />
                    <h3 className="text-xl font-bold text-white">Mining Controls</h3>
                </div>

                <div className="glass-panel p-3 rounded-lg space-y-3">
                    <div>
                        <label htmlFor="difficulty" className="text-sm font-semibold text-[var(--sol-text-secondary)]">Difficulty (Leading Zeros)</label>
                        <input id="difficulty" type="number" value={difficulty} onChange={e => setDifficulty(Math.max(1, parseInt(e.target.value) || 1))} 
                        className="w-full mt-1 p-2 bg-[var(--sol-bg-end)] rounded-lg border border-[var(--sol-panel-border)] focus:outline-none focus:ring-1 focus:ring-[var(--sol-accent-pink)]" />
                    </div>
                    <div>
                        <label htmlFor="data" className="text-sm font-semibold text-[var(--sol-text-secondary)]">Block Data</label>
                        <textarea id="data" value={newData} onChange={e => setNewData(e.target.value)}
                        className="w-full mt-1 p-2 bg-[var(--sol-bg-end)] rounded-lg border border-[var(--sol-panel-border)] focus:outline-none focus:ring-1 focus:ring-[var(--sol-accent-pink)]" rows={2} />
                    </div>
                </div>

                {miningStatus.mining ? (
                    <button onClick={handleStopMining} className="w-full bg-red-600/80 hover:bg-red-600 text-white font-bold py-2.5 px-4 rounded-lg">Stop Mining</button>
                ) : (
                    <button onClick={handleMineBlock} disabled={miningStatus.mining} className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[var(--sol-accent-cyan)] to-[var(--sol-accent-pink)] hover:opacity-90 text-white font-bold py-2.5 px-4 rounded-lg disabled:opacity-50">
                        <SparklesIcon className="h-5 w-5"/> Mine Next Block
                    </button>
                )}
                
                <button onClick={handleReset} className="w-full inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-4 rounded-lg border border-[var(--sol-panel-border)]">
                    <ResetIcon className="h-4 w-4"/> Reset Blockchain
                </button>

                {/* Status Panel */}
                <div className="glass-panel p-3 rounded-lg space-y-2">
                    <h4 className="font-semibold text-white">Status</h4>
                    <div className="text-sm font-mono bg-[var(--sol-bg-end)] p-2 rounded-md border border-[var(--sol-panel-border)]">
                        {miningStatus.mining ? (
                            <>
                               <p className="text-yellow-300">MINING...</p>
                               <p>Attempts: {miningStatus.attempts.toLocaleString()}</p>
                               <p className="break-all">Hash: {miningStatus.currentHash}</p>
                            </>
                        ) : (
                            <>
                                <p className="text-green-300">IDLE</p>
                                {mineTime !== null && <p>Last Mine Time: {(mineTime / 1000).toFixed(2)}s</p>}
                                <p>Chain Length: {chain.length}</p>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Blockchain Display */}
            <div className="flex-1 p-4 overflow-y-auto">
                 <h3 className="text-xl font-bold text-white mb-4">Blockchain Explorer</h3>
                 <div className="space-y-1">
                    {chain.slice().reverse().map((block, i) => renderBlock(block, chain.length - 1 - i))}
                 </div>
            </div>
        </div>
    );
};

export default BitcoinMiner;
