import React, { useState } from 'react';
import { SparklesIcon } from './icons';

interface TopicInputProps {
    onGenerate: (topic: string) => void;
    error: string | null;
}

const TopicInput: React.FC<TopicInputProps> = ({ onGenerate, error }) => {
    const [topic, setTopic] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onGenerate(topic);
    };

    return (
        <div className="w-full h-full p-6 flex flex-col justify-center items-center bg-transparent">
            <p className="text-[var(--sol-text-secondary)] mb-4 text-center">
                Provide a core objective for Agent Prime to begin.
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
                <textarea
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., Develop a market entry strategy for a new SaaS product in Europe"
                    className="w-full p-3 bg-[var(--sol-bg-end)] text-[var(--sol-text-primary)] rounded-lg border border-[var(--sol-panel-border)] focus:outline-none focus:ring-2 focus:ring-[var(--sol-accent-pink)] min-h-[100px] resize-y"
                    rows={4}
                />
                {error && <p className="text-red-300 bg-red-900/30 p-2 rounded-md text-sm border border-red-500/50">{error}</p>}
                <button
                    type="submit"
                    className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[var(--sol-accent-cyan)] to-[var(--sol-accent-pink)] hover:opacity-90 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-all duration-200 ease-in-out transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                    disabled={!topic.trim()}
                >
                    <SparklesIcon className="h-5 w-5" />
                    Generate Directive
                </button>
            </form>
        </div>
    );
};

export default TopicInput;