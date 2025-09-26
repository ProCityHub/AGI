import React, { useState } from 'react';
import { User, SystemIQReport } from '../types';
import { analyzeSystemIQ } from '../services/geminiService';
import { UserIcon, SparklesIcon, CubeIcon } from './icons';
import SkeletonLoader from './SkeletonLoader';

interface UserAccountsProps {
    currentUser: User;
    userCount: number;
}

const IQReportSkeleton = () => (
    <div className="mt-4 border-t border-[var(--sol-panel-border)] pt-4 space-y-4">
        <SkeletonLoader className="h-8 w-3/4" />
        <div className="space-y-1">
            <SkeletonLoader className="h-4 w-full" />
            <SkeletonLoader className="h-4 w-5/6" />
        </div>
        <div>
            <SkeletonLoader className="h-5 w-1/3 mb-2" />
            <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="bg-[var(--sol-bg-end)] p-3 rounded-md border border-[var(--sol-panel-border)]">
                        <div className="flex justify-between items-baseline">
                            <SkeletonLoader className="h-5 w-1/4" />
                            <SkeletonLoader className="h-6 w-1/5" />
                        </div>
                        <SkeletonLoader className="h-3 w-full mt-2" />
                    </div>
                ))}
            </div>
        </div>
        <div>
            <SkeletonLoader className="h-5 w-1/3 mb-2" />
            <SkeletonLoader className="h-4 w-full" />
        </div>
    </div>
);


const UserAccounts: React.FC<UserAccountsProps> = ({ currentUser, userCount }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [iqReport, setIqReport] = useState<SystemIQReport | null>(null);

    const handleAnalyzeIQ = async () => {
        setIsLoading(true);
        setError(null);
        setIqReport(null);
        try {
            const report = await analyzeSystemIQ(userCount);
            setIqReport(report);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to generate report.");
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="w-full h-full p-4 sm:p-6 bg-transparent text-[var(--sol-text-primary)] overflow-y-auto">
            <div className="glass-panel p-4 sm:p-6 rounded-lg mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">Current User Profile</h3>
                <div className="bg-[var(--sol-bg-end)] p-4 rounded-lg border border-[var(--sol-panel-border)] flex items-center gap-4">
                    <div className="h-16 w-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center border-2 border-white/20">
                        <UserIcon className="h-10 w-10 text-white" />
                    </div>
                    <div>
                        <p className="text-xl font-bold text-white">{currentUser.username}</p>
                        <p className="text-[var(--sol-text-secondary)]">{currentUser.email}</p>
                    </div>
                </div>
            </div>

            <div className="glass-panel p-4 sm:p-6 rounded-lg">
                 <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                    <CubeIcon className="h-5 w-5" />
                    System Intelligence Network
                </h3>
                <p className="text-sm text-[var(--sol-text-secondary)] mb-4">
                    Each user acts as a node, contributing to the system's collective intelligence. Analyze the network's current state.
                </p>

                <div className="bg-[var(--sol-bg-end)] p-4 rounded-lg border border-[var(--sol-panel-border)] mb-4">
                    <p className="text-sm font-semibold text-[var(--sol-text-secondary)]">Active User Nodes</p>
                    <p className="text-3xl font-bold text-white">{userCount.toLocaleString()}</p>
                </div>
                
                <button 
                    onClick={handleAnalyzeIQ}
                    disabled={isLoading}
                    className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[var(--sol-accent-cyan)] to-[var(--sol-accent-pink)] hover:opacity-90 text-white font-bold py-2.5 px-4 rounded-lg disabled:opacity-50"
                >
                    <SparklesIcon className="h-5 w-5" />
                    {isLoading ? 'Analyzing...' : 'Query System IQ Agent'}
                </button>

                {isLoading && <IQReportSkeleton />}
                {error && <p className="text-red-300 text-sm mt-2 text-center">{error}</p>}
                
                {iqReport && (
                    <div className="mt-4 border-t border-[var(--sol-panel-border)] pt-4 animate-fade-in space-y-4">
                        <h4 className="text-xl font-bold text-white">{iqReport.reportTitle}</h4>
                        <p className="text-[var(--sol-text-primary)] italic">"{iqReport.analysis}"</p>
                        <div>
                            <h5 className="font-semibold text-white mb-2">Key Metrics</h5>
                            <div className="space-y-2">
                                {iqReport.keyMetrics.map((metric, i) => (
                                    <div key={i} className="bg-[var(--sol-bg-end)] p-3 rounded-md border border-[var(--sol-panel-border)]">
                                        <div className="flex justify-between items-baseline">
                                            <p className="font-bold text-[var(--sol-text-primary)]">{metric.metric}</p>
                                            <p className="font-mono text-lg text-[var(--sol-accent-cyan)]">{metric.value}</p>
                                        </div>
                                        <p className="text-xs text-[var(--sol-text-secondary)] mt-1">{metric.explanation}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                         <div>
                            <h5 className="font-semibold text-white">Future Outlook</h5>
                            <p className="text-[var(--sol-text-secondary)] text-sm mt-1">{iqReport.futureOutlook}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserAccounts;