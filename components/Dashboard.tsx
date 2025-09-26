import React from 'react';
import type { Directive, ScopeSection, Agent } from '../types';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DocumentIcon, ChartBarIcon, ChartLineIcon, UsersIcon, CubeIcon, AgentIcon, SparklesIcon, SaveIcon, ExportIcon } from './icons';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface DashboardProps {
    directive: Directive;
    topic: string;
    onSave: (directive: Directive, topic: string) => void;
    isSaved: boolean;
    currentDirectiveId?: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="glass-panel p-2 text-sm rounded-md text-[var(--sol-text-primary)]">
                <p className="label font-bold text-white">{`${label}`}</p>
                {payload.map((pld: any, index: number) => (
                    <p key={index} style={{ color: pld.color }}>
                        {`${pld.name}: ${pld.value.toLocaleString()}`}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

const SectionDisplay: React.FC<{ section: ScopeSection }> = ({ section }) => {
    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold text-[var(--sol-accent-cyan)] flex items-center gap-3">
                <DocumentIcon className="h-6 w-6" />
                {section.title}
            </h3>
            <div className="glass-panel p-3 rounded-lg space-y-3">
                 <div className="flex items-start gap-3 bg-[var(--sol-bg-end)] p-3 rounded-md">
                    <AgentIcon className="h-8 w-8 flex-shrink-0 mt-1 text-[var(--sol-accent-cyan)]" />
                    <div>
                        <p className='font-bold text-[var(--sol-text-primary)]'>{section.agentRole}</p>
                        <p className='text-[var(--sol-text-secondary)] mt-1 italic'>"{section.agentRoleDescription}"</p>
                    </div>
                </div>
            </div>
            <div className="prose prose-sm sm:prose-base max-w-none text-[var(--sol-text-secondary)] bg-[var(--sol-bg-end)]/50 p-4 rounded-lg">
                 <h4 className="text-[var(--sol-text-primary)]">Scope</h4>
                 <p dangerouslySetInnerHTML={{ __html: section.scope.replace(/\n/g, '<br />') }} />
                 <h4 className="text-[var(--sol-text-primary)]">Summary</h4>
                 <div dangerouslySetInnerHTML={{ __html: section.summary.replace(/\n/g, '<br />') }} />
            </div>
            {section.barChart && section.barChart.data.length > 0 &&
                <div>
                    <h4 className="text-lg font-semibold flex items-center gap-3 mb-2 text-[var(--sol-text-primary)]"><ChartBarIcon className="h-5 w-5"/> {section.barChart.title}</h4>
                    <div className="w-full h-80 glass-panel p-4 rounded-lg">
                        <ResponsiveContainer width="100%" height="100%"><BarChart data={section.barChart.data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" stroke="rgba(160, 160, 192, 0.2)" /><XAxis dataKey="name" stroke="var(--sol-text-secondary)" fontSize={12} /><YAxis stroke="var(--sol-text-secondary)" fontSize={12} /><Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(103, 232, 249, 0.1)'}}/><Legend wrapperStyle={{color: 'var(--sol-text-secondary)'}} /><Bar dataKey="value" fill="var(--sol-accent-cyan)" /></BarChart></ResponsiveContainer>
                    </div>
                </div>
            }
            {section.lineChart && section.lineChart.data.length > 0 &&
                 <div>
                    <h4 className="text-lg font-semibold flex items-center gap-3 mb-2 text-[var(--sol-text-primary)]"><ChartLineIcon className="h-5 w-5"/> {section.lineChart.title}</h4>
                    <div className="w-full h-80 glass-panel p-4 rounded-lg">
                        <ResponsiveContainer width="100%" height="100%"><LineChart data={section.lineChart.data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" stroke="rgba(160, 160, 192, 0.2)" /><XAxis dataKey="name" stroke="var(--sol-text-secondary)" fontSize={12} /><YAxis stroke="var(--sol-text-secondary)" fontSize={12} /><Tooltip content={<CustomTooltip />}/><Legend wrapperStyle={{color: 'var(--sol-text-secondary)'}} /><Line type="monotone" dataKey="value1" stroke="var(--sol-accent-cyan)" strokeWidth={2} name="Metric 1" dot={{ r: 4, fill: 'var(--sol-accent-cyan)' }} activeDot={{ r: 6 }} /><Line type="monotone" dataKey="value2" stroke="var(--sol-accent-pink)" strokeWidth={2} name="Metric 2" dot={{ r: 4, fill: 'var(--sol-accent-pink)' }} activeDot={{ r: 6 }} /></LineChart></ResponsiveContainer>
                    </div>
                </div>
            }
        </div>
    );
};

const Dashboard: React.FC<DashboardProps> = ({ directive, topic, onSave, isSaved }) => {
    const [isExporting, setIsExporting] = React.useState(false);
    
    const handleExportPdf = async () => {
        const content = document.getElementById('directive-to-export');
        if (!content) return;
        setIsExporting(true);
        try {
            const canvas = await html2canvas(content, { scale: 2, useCORS: true, backgroundColor: '#1e1a3e' });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            const ratio = canvasWidth / pdfWidth;
            const imgHeight = canvasHeight / ratio;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);
            pdf.save(`${directive.projectIntake.projectName.replace(/\s+/g, '_')}.pdf`);
        } catch (error) {
            console.error("Error generating PDF:", error);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="w-full h-full flex flex-col bg-transparent text-[var(--sol-text-primary)]">
            <header className="flex items-center p-1.5 border-b border-[var(--sol-panel-border)] bg-transparent gap-2 flex-shrink-0">
                <button onClick={() => onSave(directive, topic)} disabled={isSaved} className="inline-flex items-center gap-1.5 hover:bg-white/10 disabled:opacity-60 disabled:cursor-not-allowed px-2 py-1 rounded-md transition-colors text-sm">
                    <SaveIcon className="h-4 w-4" /> {isSaved ? 'Saved' : 'Save'}
                </button>
                <button onClick={handleExportPdf} disabled={isExporting} className="inline-flex items-center gap-1.5 hover:bg-white/10 disabled:opacity-60 disabled:cursor-not-allowed px-2 py-1 rounded-md transition-colors text-sm">
                    <ExportIcon className="h-4 w-4" /> {isExporting ? 'Exporting...' : 'Export PDF'}
                </button>
            </header>
            <main id="directive-to-export" className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-12 bg-transparent">
                <section>
                    <h2 className="text-2xl font-bold text-white mb-2">1.0 Project Intake & Analysis</h2>
                    <div className='glass-panel p-4 rounded-lg space-y-4 text-[var(--sol-text-secondary)]'>
                        <div>
                            <p><strong>Project Name:</strong> {directive.projectIntake.projectName}</p>
                            <p><strong>Project Type:</strong> {directive.projectIntake.projectType}</p>
                        </div>
                        <div className="border-t border-[var(--sol-panel-border)] pt-4">
                             <p className="font-semibold mb-2 text-[var(--sol-text-primary)]">Hypothetical sources for analysis:</p>
                             <ul className="list-disc list-inside space-y-1 text-sm">
                                {directive.documentationReview.sources.map((source, index) => <li key={index}>{source}</li>)}
                            </ul>
                        </div>
                    </div>
                </section>
                <section>
                    <h2 className="text-lg font-bold text-white mb-2">1.2 Scope Clarification</h2>
                     <p className='text-[var(--sol-text-secondary)]'>{directive.scopeClarification}</p>
                </section>
                <section>
                    <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3"><UsersIcon className="h-6 w-6" />2.0 Agent Cohort</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {directive.agentCohort.map((agent: Agent) => (
                            <div key={agent.role} className="glass-panel p-3 rounded-lg">
                                <p className="font-bold text-[var(--sol-accent-cyan)]">{agent.role}</p>
                                <p className="text-[var(--sol-text-secondary)] text-sm mt-1">{agent.perspective}</p>
                            </div>
                        ))}
                    </div>
                    <div className="mt-6">
                        <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-3"><SparklesIcon className="h-5 w-5 text-[var(--sol-accent-pink)]" />Collaboration Protocol</h3>
                        <div className="prose prose-sm sm:prose-base max-w-none text-[var(--sol-text-secondary)] bg-[var(--sol-bg-end)]/50 p-4 rounded-lg">
                           <p dangerouslySetInnerHTML={{ __html: directive.collaborationProtocol.replace(/\n/g, '<br />') }} />
                        </div>
                    </div>
                </section>
                <section>
                    <h2 className="text-2xl font-bold text-white mb-6">3.0 Scope of Work Analysis</h2>
                    <div className="space-y-12">
                        {directive.scopeOfWork.map((section: ScopeSection) => <SectionDisplay key={section.title} section={section} />)}
                    </div>
                </section>
                <section>
                    <h2 className="text-2xl font-bold text-white mb-2">4.0 Ancillary Considerations</h2>
                    <div className="glass-panel p-4 rounded-lg space-y-4">
                        {directive.ancillaryConsiderations.map(consideration => (
                            <div key={consideration.title}>
                                <h3 className="text-lg font-semibold text-[var(--sol-text-primary)] flex items-center gap-2"><SparklesIcon className="h-5 w-5 text-[var(--sol-accent-pink)]" />{consideration.title}</h3>
                                <ul className="list-disc list-inside text-[var(--sol-text-secondary)] space-y-1 pl-5 mt-2">
                                    {consideration.points.map((point, index) => <li key={index}>{point}</li>)}
                                </ul>
                            </div>
                        ))}
                    </div>
                </section>
                <section>
                    <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3"><CubeIcon className="h-6 w-6" />5.0 Synthesis Methodology</h2>
                    <p className="text-[var(--sol-text-secondary)] italic mb-4">{directive.synthesisMethodology}</p>
                </section>
                <section>
                    <h2 className="text-xl font-bold text-white mb-2">Final Note from Agent Prime</h2>
                    <p className='text-[var(--sol-text-primary)] italic bg-[var(--sol-bg-end)]/50 p-4 rounded-lg'>"{directive.finalNote}"</p>
                </section>
            </main>
        </div>
    );
};

export default Dashboard;