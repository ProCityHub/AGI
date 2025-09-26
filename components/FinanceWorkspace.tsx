import React, { useState } from 'react';
import { Expense, FinancialReport, InvoiceData } from '../types';
import { logExpense, generateFinancialReport } from '../services/geminiService';
import { ReceiptIcon, SparklesIcon, DocumentIcon } from './icons';
import SkeletonLoader from './SkeletonLoader';

const FinancialReportSkeleton = () => (
    <div className="mt-4 border-t border-[var(--sol-panel-border)] pt-4 space-y-3">
        <SkeletonLoader className="h-8 w-3/4" />
        <SkeletonLoader className="h-4 w-full" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <SkeletonLoader className="h-20" />
            <SkeletonLoader className="h-20" />
            <SkeletonLoader className="h-20" />
        </div>
        <div>
            <SkeletonLoader className="h-5 w-1/3 mb-2" />
            <div className="space-y-1">
                <SkeletonLoader className="h-4 w-full" />
                <SkeletonLoader className="h-4 w-5/6" />
                <SkeletonLoader className="h-4 w-full" />
            </div>
        </div>
    </div>
);


const FinanceWorkspace: React.FC = () => {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [invoices] = useState<InvoiceData[]>([]); 
    const [newExpenseText, setNewExpenseText] = useState('');
    const [financialReport, setFinancialReport] = useState<FinancialReport | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleLogExpense = async () => {
        if (!newExpenseText.trim()) {
            setError('Please enter an expense description.');
            return;
        }
        setIsLoading(true);
        setLoadingMessage('AI Bookkeeper is logging the expense...');
        setError(null);
        try {
            const newExpense = await logExpense(newExpenseText);
            setExpenses(prev => [...prev, newExpense].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
            setNewExpenseText('');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    };

    const handleGenerateReport = async () => {
        setIsLoading(true);
        setLoadingMessage('AI Financial Analyst is generating the report...');
        setError(null);
        setFinancialReport(null);
        try {
            const report = await generateFinancialReport(invoices, expenses);
            setFinancialReport(report);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    };

    return (
        <div className="space-y-6 p-4">
            <p className="text-[var(--sol-text-secondary)]">
                An AI-powered command center for managing your enterprise's finances. Log expenses using natural language and generate intelligent reports.
            </p>

            {error && <p className="text-red-300 text-sm text-center bg-red-900/20 p-2 rounded-lg border border-red-500/30">{error}</p>}
            
            <div className="glass-panel p-4 rounded-lg">
                <h4 className="text-lg font-semibold text-white mb-2 flex items-center gap-2"><ReceiptIcon className="h-5 w-5" /> Log a New Expense</h4>
                <div className="flex gap-2">
                    <input 
                        type="text"
                        value={newExpenseText}
                        onChange={e => setNewExpenseText(e.target.value)}
                        placeholder="e.g., Team lunch at The Cafe, $85.50 on 2024-08-15"
                        className="flex-grow p-2 bg-[var(--sol-bg-end)] rounded-lg border border-[var(--sol-panel-border)] focus:outline-none focus:ring-2 focus:ring-[var(--sol-accent-pink)]"
                    />
                    <button onClick={handleLogExpense} disabled={isLoading || !newExpenseText.trim()} className="inline-flex items-center gap-2 bg-gradient-to-r from-[var(--sol-accent-orange)] to-[var(--sol-accent-pink)] hover:opacity-90 text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-50">
                        {isLoading && loadingMessage.includes('Bookkeeper') ? 'Logging...' : 'Log'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-panel p-4 rounded-lg">
                    <h4 className="text-lg font-semibold text-white mb-2">Logged Expenses</h4>
                    {expenses.length > 0 ? (
                        <ul className="space-y-2 max-h-60 overflow-y-auto pr-2">
                            {expenses.map((exp, i) => (
                                <li key={i} className="flex justify-between items-center bg-[var(--sol-bg-end)] p-2 rounded-md text-sm border border-[var(--sol-panel-border)]">
                                    <div>
                                        <p className="font-semibold text-[var(--sol-text-primary)]">{exp.description}</p>
                                        <p className="text-xs text-[var(--sol-text-secondary)]">{exp.category} - {exp.date}</p>
                                    </div>
                                    <p className="font-mono text-white">${exp.amount.toFixed(2)}</p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-[var(--sol-text-secondary)] text-sm">No expenses logged yet.</p>
                    )}
                </div>
                 <div className="glass-panel p-4 rounded-lg">
                    <h4 className="text-lg font-semibold text-white mb-2">Invoices</h4>
                     <p className="text-[var(--sol-text-secondary)] text-sm">Invoice management is handled via the Document Hub. This area will show a summary of generated invoices in future versions.</p>
                </div>
            </div>
            
             <div className="glass-panel p-4 rounded-lg">
                <h4 className="text-lg font-semibold text-white mb-2 flex items-center gap-2"><DocumentIcon className="h-5 w-5" /> Financial Reports</h4>
                <button onClick={handleGenerateReport} disabled={isLoading || expenses.length === 0} className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[var(--sol-accent-cyan)] to-[var(--sol-accent-pink)] hover:opacity-90 text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-50">
                    <SparklesIcon className="h-5 w-5" />
                     {isLoading && loadingMessage.includes('Analyst') ? 'Generating...' : 'Generate P&L Report'}
                </button>
                
                {isLoading && loadingMessage.includes('Analyst') && <FinancialReportSkeleton />}

                {financialReport && !isLoading && (
                    <div className="mt-4 border-t border-[var(--sol-panel-border)] pt-4 animate-fade-in space-y-3">
                        <h5 className="text-xl font-bold text-white">{financialReport.reportType} - {financialReport.period}</h5>
                        <p className="italic text-[var(--sol-text-primary)]">"{financialReport.summary}"</p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                            <div className="bg-green-500/10 p-3 rounded-md border border-green-500/30">
                                <p className="text-sm text-green-300">Total Revenue</p>
                                <p className="text-2xl font-bold text-green-200">${financialReport.totalRevenue.toFixed(2)}</p>
                            </div>
                             <div className="bg-red-500/10 p-3 rounded-md border border-red-500/30">
                                <p className="text-sm text-red-300">Total Expenses</p>
                                <p className="text-2xl font-bold text-red-200">${financialReport.totalExpenses.toFixed(2)}</p>
                            </div>
                             <div className="bg-cyan-500/10 p-3 rounded-md border border-cyan-500/30">
                                <p className="text-sm text-cyan-300">Net Profit</p>
                                <p className="text-2xl font-bold text-cyan-200">${financialReport.netProfit.toFixed(2)}</p>
                            </div>
                        </div>
                         <div>
                            <h6 className="font-semibold text-white">Key Insights from the AI Analyst:</h6>
                            <ul className="list-disc list-inside text-[var(--sol-text-secondary)] text-sm mt-1">
                                {financialReport.keyInsights.map((insight, i) => <li key={i}>{insight}</li>)}
                            </ul>
                        </div>
                    </div>
                )}
             </div>
        </div>
    );
};

export default FinanceWorkspace;