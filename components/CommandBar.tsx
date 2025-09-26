import React, { useState, useEffect, useRef } from 'react';
import { getCommandResponse } from '../services/geminiService';
import { AppContext } from '../types';
import { SparklesIcon, CommandIcon } from './icons';

interface CommandBarProps {
    onClose: () => void;
    context: AppContext;
}

const CommandBar: React.FC<CommandBarProps> = ({ onClose, context }) => {
    const [query, setQuery] = useState('');
    const [response, setResponse] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Auto-focus the input when the component mounts
        inputRef.current?.focus();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim() || isLoading) return;

        setIsLoading(true);
        setError(null);
        setResponse('');

        try {
            const result = await getCommandResponse(query, context);
            setResponse(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-24"
            onClick={onClose}
        >
            <div
                className="w-full max-w-2xl glass-panel rounded-xl shadow-2xl text-white animate-fade-in"
                onClick={(e) => e.stopPropagation()}
            >
                <form onSubmit={handleSubmit}>
                    <div className="relative">
                        <CommandIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--sol-text-secondary)]" />
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Ask GARVIS anything... (e.g., 'How do I use the Nexus Browser?')"
                            className="w-full bg-transparent text-lg pl-12 pr-4 py-4 focus:outline-none"
                            disabled={isLoading}
                        />
                         {isLoading && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            </div>
                        )}
                    </div>
                </form>

                {(response || error) && (
                    <div className="p-4 border-t border-[var(--sol-panel-border)] max-h-96 overflow-y-auto">
                        {error && <p className="text-red-300">{error}</p>}
                        {response && (
                             <div className="prose prose-invert prose-sm max-w-none text-[var(--sol-text-primary)]">
                                <p dangerouslySetInnerHTML={{ __html: response.replace(/\n/g, '<br />') }} />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommandBar;