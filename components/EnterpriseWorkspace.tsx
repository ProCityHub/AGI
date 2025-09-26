
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { formTypes, FormTypeNode } from './formTypes';
import { generateOrgChart, createAgentProfile, performSystemAudit, generateCommunicationsFeed, performCommunicationsAudit, generateOpportunityDossier, generateSystemProposals, generateDesignConcept, performWebsiteAudit, generateCompatibilityReport, generateSystemEvolutionPlan } from '../services/geminiService';
import { getAgentArchetypes, saveAgentArchetype, deleteAgentArchetype } from '../services/storageService';
import { OrgChart, AgentProfile, SystemAuditReport, Department, Role, FeedItem, CommunicationPost, SecurityUpdate, OrgChartSkeleton, DepartmentSkeleton, RoleSkeleton, AgentArchetype, CommunicationsAuditReport, OpportunityDossier, SystemProposal, DesignConcept, WebsiteAuditReport, CompatibilityReport, LatticeNode, SystemEvolutionPlan, AuditProposal, AgentWidget } from '../types';
import { BuildingIcon, SitemapIcon, PlusCircleIcon, ShieldCheckIcon, DocumentIcon, MessageSquareIcon, ThumbsUpIcon, MessageCircleIcon, AlertTriangleIcon, AlertCircleIcon, AgentIcon, TrashIcon, PlusIcon, UserIcon, SparklesIcon, DollarSignIcon, PaletteIcon, ChipIcon, WindowsIcon, AppleIcon, LinuxIcon, BoltIcon, CubeIcon, LayersIcon, MusicIcon, VideoIcon, FilmIcon, WifiIcon, BluetoothIcon, PrinterIcon, CloseIcon, GlobeAltIcon, TableCellsIcon, DocumentTextIcon, CodeBracketIcon, ChatBubbleLeftRightIcon, CodeBracketSquareIcon, InformationCircleIcon, LockIcon } from './icons';
import SkeletonLoader from './SkeletonLoader';
import FinanceWorkspace from './FinanceWorkspace';
import NexusForge from './NexusForge';

interface EnterpriseWorkspaceProps {
    onNavigateToForm: (path: string[]) => void;
}

type Tab = 'structure' | 'foundry' | 'evolution' | 'documents' | 'communications' | 'finance' | 'design' | 'nexus_forge' | 'systems';
type EvolutionTab = 'health' | 'comms' | 'website';


const OrgChartDisplay: React.FC<{ chart: OrgChart }> = ({ chart }) => {
    const renderDepartment = (dept: Department, level: number) => (
        <div key={dept.name} className={`ml-${level * 4} mt-4`}>
            <h4 className={`text-lg font-semibold ${level === 0 ? 'text-[var(--sol-accent-cyan)]' : 'text-white'}`}>{dept.name}</h4>
            <div className="pl-4 border-l border-[var(--sol-panel-border)]">
                {dept.roles.map((role: Role) => (
                    <div key={role.title} className="mt-2">
                        <p className="font-bold text-[var(--sol-text-primary)] flex items-center gap-2">
                           {role.type === 'ai_agent' 
                               ? <AgentIcon className="h-5 w-5 text-[var(--sol-accent-cyan)] flex-shrink-0" />
                               : <UserIcon className="h-5 w-5 text-[var(--sol-text-secondary)] flex-shrink-0" />
                           }
                           <span>
                               {role.title}
                               {role.type === 'ai_agent' && role.agentName && 
                                   <span className="text-xs font-normal text-[var(--sol-accent-cyan)]/80 ml-2">({role.agentName})</span>
                               }
                           </span>
                        </p>
                        <ul className="list-disc list-inside text-sm text-[var(--sol-text-secondary)] pl-4">
                            {role.responsibilities.map((resp, i) => <li key={i}>{resp}</li>)}
                        </ul>
                    </div>
                ))}
                {dept.subDepartments?.map(subDept => renderDepartment(subDept, level + 1))}
            </div>
        </div>
    );

    return (
        <div className="glass-panel p-4 rounded-lg mt-4">
            <h3 className="text-2xl font-bold text-center mb-4 text-white">{chart.companyName} - Organizational Structure</h3>
            {chart.departments.map(dept => renderDepartment(dept, 0))}
        </div>
    );
};

const AgentProfileDisplay: React.FC<{ profile: AgentProfile }> = ({ profile }) => (
    <div className="glass-panel p-4 rounded-lg mt-4 space-y-4 animate-fade-in">
        <h3 className="text-2xl font-bold text-[var(--sol-accent-cyan)]">{profile.agentName}</h3>
        <p className="italic text-[var(--sol-text-primary)]">"{profile.personaDescription}"</p>
        <div>
            <h4 className="font-semibold text-white">Primary Directives:</h4>
            <ul className="list-disc list-inside text-[var(--sol-text-secondary)]">
                {profile.primaryDirectives.map((d, i) => <li key={i}>{d}</li>)}
            </ul>
        </div>
        <div>
            <h4 className="font-semibold text-white">Specialized Skills:</h4>
            <ul className="list-disc list-inside text-[var(--sol-text-secondary)]">
                {profile.specializedSkills.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
        </div>
    </div>
);

const SystemAuditDisplay: React.FC<{ report: SystemAuditReport }> = ({ report }) => (
     <div className="glass-panel p-4 rounded-lg mt-4 space-y-4">
        <h3 className="text-2xl font-bold text-white">System Health Diagnostic</h3>
        <p><strong>Timestamp:</strong> {new Date(report.auditTimestamp).toLocaleString()}</p>
        <p><strong>Status:</strong> <span className={`font-bold ${report.systemStatus === 'Optimal' ? 'text-green-400' : 'text-yellow-400'}`}>{report.systemStatus}</span></p>
        <div>
            <h4 className="font-semibold text-white">Identified Issues:</h4>
            <ul className="list-disc list-inside text-[var(--sol-text-secondary)]">
                {report.identifiedIssues.map((issue, i) => <li key={i}>{issue}</li>)}
            </ul>
        </div>
        <div>
            <h4 className="font-semibold text-white">Proposed Healing Protocols:</h4>
            {report.healingProtocols.map((protocol, i) => (
                <div key={i} className="mt-2 p-3 bg-[var(--sol-bg-end)] rounded-md border border-[var(--sol-panel-border)]">
                    <p className="font-bold text-[var(--sol-accent-cyan)]">{protocol.protocolName}</p>
                    <p className="text-sm italic text-[var(--sol-text-secondary)] my-1">{protocol.description}</p>
                    <ul className="list-decimal list-inside text-sm text-[var(--sol-text-secondary)] pl-2">
                        {protocol.actionSteps.map((step, j) => <li key={j}>{step}</li>)}
                    </ul>
                </div>
            ))}
        </div>
    </div>
);

const CommunicationsFeed: React.FC<{ feed: FeedItem[] }> = ({ feed }) => {
    const getSeverityClasses = (severity: SecurityUpdate['severity']) => {
        switch (severity) {
            case 'Critical': return 'border-red-500 bg-red-900/20 text-red-200';
            case 'High': return 'border-orange-500 bg-orange-900/20 text-orange-200';
            case 'Medium': return 'border-yellow-500 bg-yellow-900/20 text-yellow-200';
            case 'Low': return 'border-cyan-500 bg-cyan-900/20 text-cyan-200';
            default: return 'border-[var(--sol-panel-border)]';
        }
    };
    
    const getSeverityIcon = (severity: SecurityUpdate['severity']) => {
        switch (severity) {
            case 'Critical':
            case 'High':
                return <AlertTriangleIcon className="h-6 w-6 mr-2" />;
            case 'Medium':
            case 'Low':
                return <AlertCircleIcon className="h-6 w-6 mr-2" />;
        }
    }

    const renderFeedItem = (item: FeedItem) => {
        if (item.type === 'security_update') {
            return (
                <div key={item.id} className={`glass-panel p-4 rounded-lg border-l-4 ${getSeverityClasses(item.severity)}`}>
                    <div className="flex items-center font-bold text-lg text-white">
                        {getSeverityIcon(item.severity)}
                        {item.title}
                    </div>
                    <p className="text-sm text-[var(--sol-text-secondary)] mt-1 mb-2">
                        {new Date(item.timestamp).toLocaleString()} | Severity: {item.severity}
                    </p>
                    <p className="text-[var(--sol-text-primary)] my-2">{item.summary}</p>
                     <div>
                        <h5 className="font-semibold text-white">Recommended Actions:</h5>
                        <ul className="list-disc list-inside text-[var(--sol-text-secondary)] text-sm mt-1">
                            {item.recommendedActions.map((action, i) => <li key={i}>{action}</li>)}
                        </ul>
                    </div>
                </div>
            );
        } else { // 'post'
             return (
                <div key={item.id} className="glass-panel p-4 rounded-lg">
                    <div className="flex items-start gap-3">
                        <div className="bg-gradient-to-br from-pink-500 to-purple-600 rounded-full h-10 w-10 flex-shrink-0 flex items-center justify-center font-bold text-white">
                            {item.author.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                            <p className="font-bold text-white">{item.author}</p>
                            <p className="text-xs text-[var(--sol-text-secondary)]">{item.role} · {new Date(item.timestamp).toLocaleString()}</p>
                        </div>
                    </div>
                    <p className="my-3 text-[var(--sol-text-primary)]">{item.content}</p>
                    <div className="flex items-center gap-4 text-[var(--sol-text-secondary)] border-t border-[var(--sol-panel-border)] pt-2">
                        <div className="flex items-center gap-1.5">
                            <ThumbsUpIcon className="h-4 w-4" /> <span className="text-xs">{item.likes}</span>
                        </div>
                         <div className="flex items-center gap-1.5">
                            <MessageCircleIcon className="h-4 w-4" /> <span className="text-xs">{item.comments.length}</span>
                        </div>
                    </div>
                    {item.comments.length > 0 && (
                        <div className="mt-3 space-y-2 pl-4 border-l border-[var(--sol-panel-border)]">
                            {item.comments.map((comment, i) => (
                                <div key={i}>
                                    <p className="text-sm">
                                        <span className="font-semibold text-white">{comment.author}</span>
                                        <span className="text-xs text-[var(--sol-text-secondary)] ml-1">({comment.role})</span>: {comment.content}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            );
        }
    };

    return <div className="space-y-4">{feed.map(renderFeedItem)}</div>;
};

const CommunicationsAuditDisplay: React.FC<{ report: CommunicationsAuditReport }> = ({ report }) => (
    <div className="glass-panel p-4 rounded-lg mt-4 space-y-4">
        <h3 className="text-2xl font-bold text-white">Communications Audit Report</h3>
        <p><strong>Timestamp:</strong> {new Date(report.auditTimestamp).toLocaleString()}</p>
        <div>
            <h4 className="font-semibold text-white">Overall Assessment:</h4>
            <p className="text-[var(--sol-text-primary)] italic">"{report.overallAssessment}"</p>
        </div>
        <div>
            <h4 className="font-semibold text-white">Positive Findings:</h4>
            <ul className="list-disc list-inside text-green-300">
                {report.positiveFindings.map((finding, i) => <li key={i}>{finding}</li>)}
            </ul>
        </div>
        <div>
            <h4 className="font-semibold text-white">Identified Issues & Recommendations:</h4>
            {report.identifiedIssues.map((item, i) => (
                <div key={i} className="mt-2 p-3 bg-yellow-900/20 rounded-md border border-yellow-500/50">
                    <p className="font-bold text-yellow-200">{item.issue}</p>
                    <p className="text-sm text-[var(--sol-text-primary)] my-1">
                        <strong>Recommendation:</strong> {item.recommendation}
                    </p>
                    {item.examplePostId && <p className="text-xs text-[var(--sol-text-secondary)]">Related Post ID: {item.examplePostId}</p>}
                </div>
            ))}
        </div>
    </div>
);


const DepartmentEditor: React.FC<{
    department: DepartmentSkeleton;
    path: number[];
    onUpdate: (path: number[], updatedDept: DepartmentSkeleton) => void;
    onRemove: (path: number[]) => void;
    createdAgents: AgentProfile[];
}> = ({ department, path, onUpdate, onRemove, createdAgents }) => {

    const updateField = (field: keyof DepartmentSkeleton, value: any) => {
        onUpdate(path, { ...department, [field]: value });
    };

    const addRole = () => {
        const newRoles = [...department.roles, { id: Date.now().toString(), title: '', type: 'human' }];
        updateField('roles', newRoles);
    };

    const updateRole = (roleIndex: number, field: keyof RoleSkeleton, value: any) => {
        const newRoles = [...department.roles];
        const updatedRole = { ...newRoles[roleIndex], [field]: value };
        if (field === 'type' && value === 'human') {
            delete updatedRole.agentName;
        }
        newRoles[roleIndex] = updatedRole;
        updateField('roles', newRoles);
    };

    const removeRole = (roleIndex: number) => {
        const newRoles = department.roles.filter((_, i) => i !== roleIndex);
        updateField('roles', newRoles);
    };

    const addSubDepartment = () => {
        const newSubDepts = [...department.subDepartments, { id: Date.now().toString(), name: '', roles: [], subDepartments: [] }];
        updateField('subDepartments', newSubDepts);
    };

    const updateSubDepartment = (subDeptPath: number[], updatedSubDept: DepartmentSkeleton) => {
        const newSubDepts = [...department.subDepartments];
        const subDeptIndex = subDeptPath[subDeptPath.length - 1];
        newSubDepts[subDeptIndex] = updatedSubDept;
        updateField('subDepartments', newSubDepts);
    };

    const removeSubDepartment = (subDeptPath: number[]) => {
        const indexToRemove = subDeptPath[subDeptPath.length - 1];
        const newSubDepts = department.subDepartments.filter((_, i) => i !== indexToRemove);
        updateField('subDepartments', newSubDepts);
    };

    const baseInputClass = "p-1.5 bg-[var(--sol-bg-start)] text-[var(--sol-text-primary)] border border-[var(--sol-panel-border)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--sol-accent-pink)] text-sm";

    return (
        <div className="bg-[var(--sol-panel-bg)] p-3 rounded-lg border border-[var(--sol-panel-border)] space-y-3">
            <div className="flex items-center gap-2">
                <input
                    type="text"
                    value={department.name}
                    onChange={e => updateField('name', e.target.value)}
                    placeholder="Department Name"
                    className={`${baseInputClass} flex-grow font-semibold`}
                />
                <button onClick={() => onRemove(path)} className="p-2 text-[var(--sol-text-secondary)] hover:text-red-400"><TrashIcon className="h-5 w-5"/></button>
            </div>

            <div className="pl-4 space-y-2">
                {department.roles.map((role, i) => (
                    <div key={role.id} className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
                        <input
                            type="text"
                            value={role.title}
                            onChange={e => updateRole(i, 'title', e.target.value)}
                            placeholder="Role Title (e.g., Lead Engineer)"
                            className={baseInputClass}
                        />
                         <div className="flex items-center gap-2">
                             <select value={role.type} onChange={e => updateRole(i, 'type', e.target.value as 'human' | 'ai_agent')} className={`${baseInputClass} w-full`}>
                                <option value="human">Human</option>
                                <option value="ai_agent">AI Agent</option>
                            </select>
                            {role.type === 'ai_agent' && (
                                <select value={role.agentName || ''} onChange={e => updateRole(i, 'agentName', e.target.value)} className={`${baseInputClass} w-full`}>
                                    <option value="">Select Agent...</option>
                                    {createdAgents.map(agent => (
                                        <option key={agent.agentName} value={agent.agentName}>{agent.agentName}</option>
                                    ))}
                                </select>
                            )}
                        </div>
                        <button onClick={() => removeRole(i)} className="p-1 text-[var(--sol-text-secondary)] hover:text-red-400 justify-self-end"><TrashIcon className="h-4 w-4"/></button>
                    </div>
                ))}
                <button onClick={addRole} className="text-xs inline-flex items-center gap-1 text-[var(--sol-accent-cyan)] hover:text-white"><PlusIcon className="h-3 w-3"/> Add Role</button>
            </div>

            <div className="pl-4 space-y-2">
                {department.subDepartments.map((subDept, i) => (
                    <DepartmentEditor
                        key={subDept.id}
                        department={subDept}
                        path={[...path, i]}
                        onUpdate={updateSubDepartment}
                        onRemove={removeSubDepartment}
                        createdAgents={createdAgents}
                    />
                ))}
                 <button onClick={addSubDepartment} className="text-xs inline-flex items-center gap-1 text-[var(--sol-accent-cyan)] hover:text-white"><PlusIcon className="h-3 w-3"/> Add Sub-Department</button>
            </div>
        </div>
    );
};

const WebsiteEvolutionDisplay: React.FC<{ report: WebsiteAuditReport }> = ({ report }) => {
    const proposalsByCat = report.proposals.reduce((acc, p) => {
        (acc[p.category] = acc[p.category] || []).push(p);
        return acc;
    }, {} as Record<string, AuditProposal[]>);

    return (
        <div className="glass-panel p-4 rounded-lg mt-4 space-y-4">
            <h3 className="text-2xl font-bold text-white">Website Evolution Blueprint</h3>
            <p><strong>Timestamp:</strong> {new Date(report.auditTimestamp).toLocaleString()}</p>
            <div>
                <h4 className="font-semibold text-white">Overall Assessment:</h4>
                <p className="text-[var(--sol-text-primary)] italic">"{report.overallAssessment}"</p>
            </div>
            <div className="space-y-4">
                {Object.entries(proposalsByCat).map(([category, proposals]) => (
                    <div key={category}>
                        <h5 className="text-lg font-bold text-[var(--sol-accent-cyan)]">{category} (Lattice)</h5>
                        <div className="space-y-2 mt-1">
                        {proposals.map((p, i) => (
                            <div key={i} className="p-3 bg-[var(--sol-bg-end)] rounded-md border border-[var(--sol-panel-border)]">
                                <p className="font-semibold text-white">{p.proposal}</p>
                                <p className="text-sm text-[var(--sol-text-secondary)]"><strong>Rationale:</strong> {p.rationale}</p>
                            </div>
                        ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Start of EnterpriseWorkspace component definition
const FormTypeTree: React.FC<{ node: FormTypeNode | string[], path: string[], onSelect: (path: string[]) => void }> = ({ node, path, onSelect }) => {
    if (Array.isArray(node)) {
        return (
            <ul className="pl-4">
                {node.map(formName => (
                    <li key={formName} onClick={() => onSelect([...path, formName])} className="cursor-pointer hover:bg-white/10 p-1 rounded-md flex items-center gap-2 text-sm">
                         <DocumentTextIcon className="h-4 w-4 flex-shrink-0" /> {formName}
                    </li>
                ))}
            </ul>
        );
    }
    return (
        <ul className="pl-4">
            {Object.entries(node).map(([key, value]) => (
                <li key={key}>
                    <p className="font-semibold text-[var(--sol-accent-cyan)] mt-2">{key}</p>
                    <FormTypeTree node={value} path={[...path, key]} onSelect={onSelect} />
                </li>
            ))}
        </ul>
    );
};

const EnterpriseWorkspace: React.FC<EnterpriseWorkspaceProps> = ({ onNavigateToForm }) => {
    const [activeTab, setActiveTab] = useState<Tab>('foundry');
    const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
    const [error, setError] = useState<string | null>(null);
    const [activeEvolutionTab, setActiveEvolutionTab] = useState<EvolutionTab>('health');
    const [createdAgents, setCreatedAgents] = useState<AgentProfile[]>([]);

    const [archetypes, setArchetypes] = useState<AgentArchetype[]>([]);
    const [selectedArchetypeId, setSelectedArchetypeId] = useState<string | null>(null);
    const [currentArchetype, setCurrentArchetype] = useState<AgentArchetype | null>(null);
    const [editingWidgetIndex, setEditingWidgetIndex] = useState<number | null>(null);
    
    useEffect(() => {
        const loadedArchetypes = getAgentArchetypes();
        setArchetypes(loadedArchetypes);
        if (loadedArchetypes.length > 0) {
            setSelectedArchetypeId(loadedArchetypes[0].id);
        }
    }, []);

    useEffect(() => {
        if (selectedArchetypeId) {
            const found = archetypes.find(a => a.id === selectedArchetypeId);
            setCurrentArchetype(found ? JSON.parse(JSON.stringify(found)) : null);
        } else {
            setCurrentArchetype(null);
        }
    }, [selectedArchetypeId, archetypes]);

    const handleNewArchetype = () => {
        const newArch: AgentArchetype = {
            id: Date.now().toString(),
            name: 'New Agent Archetype',
            roleDescription: '',
            creativity: 50,
            memory: 'Contextual',
            widgets: []
        };
        const updatedArchetypes = [...archetypes, newArch];
        setArchetypes(updatedArchetypes);
        setSelectedArchetypeId(newArch.id);
        saveAgentArchetype(newArch);
    };

    const handleSaveCurrentArchetype = () => {
        if (currentArchetype) {
            saveAgentArchetype(currentArchetype);
            setArchetypes(getAgentArchetypes());
        }
    };

    const handleDeleteArchetype = (id: string) => {
        deleteAgentArchetype(id);
        const updatedArchetypes = archetypes.filter(a => a.id !== id);
        setArchetypes(updatedArchetypes);
        if (selectedArchetypeId === id) {
            setSelectedArchetypeId(updatedArchetypes.length > 0 ? updatedArchetypes[0].id : null);
        }
    };
    
    const handleArchetypeFieldChange = (field: keyof AgentArchetype, value: any) => {
        if (currentArchetype) {
            const updatedArchetype = { ...currentArchetype, [field]: value };
            setCurrentArchetype(updatedArchetype);
        }
    };
    
    const handleAddWidget = (widgetName: string) => {
        if (currentArchetype && !currentArchetype.widgets.some(w => w.name === widgetName)) {
            const newWidget: AgentWidget = { name: widgetName, customName: widgetName };
            handleArchetypeFieldChange('widgets', [...currentArchetype.widgets, newWidget]);
        }
    };

    const handleRemoveWidget = (index: number) => {
        if (currentArchetype) {
            const newWidgets = currentArchetype.widgets.filter((_, i) => i !== index);
            handleArchetypeFieldChange('widgets', newWidgets);
        }
    };

    const handleWidgetNameChange = (index: number, newCustomName: string) => {
        if (currentArchetype) {
            const newWidgets = [...currentArchetype.widgets];
            newWidgets[index].customName = newCustomName;
            handleArchetypeFieldChange('widgets', newWidgets);
        }
    };

    const handleForgeAgent = useCallback(async () => {
        if (!currentArchetype) {
            setError('Please select or create an archetype to forge.'); return;
        }
        setIsLoading(prev => ({ ...prev, agentProfile: true })); 
        setError(null);
        try {
            const profile = await createAgentProfile(currentArchetype);
            setCreatedAgents(prev => [...prev, profile]);
        } catch (err) { setError(err instanceof Error ? err.message : 'Failed to create agent profile.'); }
        finally { setIsLoading(prev => ({ ...prev, agentProfile: false })); }
    }, [currentArchetype]);


    const widgetLibrary = useMemo(() => [
        { name: 'Web Search', icon: <GlobeAltIcon className="h-5 w-5" /> },
        { name: 'Data Analysis', icon: <TableCellsIcon className="h-5 w-5" /> },
        { name: 'Document Q&A', icon: <DocumentTextIcon className="h-5 w-5" /> },
        { name: 'API Integration', icon: <CodeBracketIcon className="h-5 w-5" /> },
        { name: 'Internal Comms', icon: <ChatBubbleLeftRightIcon className="h-5 w-5" /> }
    ], []);

    // Other state and handlers...
    const [orgChart, setOrgChart] = useState<OrgChart | null>(null);
    const [orgChartSkeleton, setOrgChartSkeleton] = useState<OrgChartSkeleton>(() => ({
        companyName: 'GARVIS AI Systems',
        departments: [{ id: Date.now().toString(), name: 'Core Operations', roles: [], subDepartments: [] }]
    }));
    
    const [systemAudit, setSystemAudit] = useState<SystemAuditReport | null>(null);
    const [commFeed, setCommFeed] = useState<FeedItem[] | null>(null);
    const [commAudit, setCommAudit] = useState<CommunicationsAuditReport | null>(null);
    const [websiteAudit, setWebsiteAudit] = useState<WebsiteAuditReport | null>(null);
    

    const setLoading = (key: string, value: boolean) => setIsLoading(prev => ({ ...prev, [key]: value }));

    const handleGenerateOrgChart = useCallback(async () => {
        setLoading('orgChart', true); setError(null);
        try {
            const chart = await generateOrgChart(orgChartSkeleton); setOrgChart(chart);
        } catch (err) { setError(err instanceof Error ? err.message : 'Failed to generate Org Chart.'); }
        finally { setLoading('orgChart', false); }
    }, [orgChartSkeleton]);

    const handlePerformSystemAudit = useCallback(async () => {
        setLoading('systemAudit', true); setError(null);
        try {
            const report = await performSystemAudit(); setSystemAudit(report);
        } catch (err) { setError(err instanceof Error ? err.message : 'Failed to perform audit.'); }
        finally { setLoading('systemAudit', false); }
    }, []);

    const handleGenerateCommFeed = useCallback(async () => {
        setLoading('commFeed', true); setError(null);
        try {
            const feed = await generateCommunicationsFeed(); setCommFeed(feed);
        } catch (err) { setError(err instanceof Error ? err.message : 'Failed to generate feed.'); }
        finally { setLoading('commFeed', false); }
    }, []);
    
    const handlePerformCommAudit = useCallback(async () => {
        if (!commFeed) return;
        setLoading('commAudit', true); setError(null);
        try {
            const audit = await performCommunicationsAudit(commFeed); setCommAudit(audit);
        } catch (err) { setError(err instanceof Error ? err.message : 'Failed to perform audit.'); }
        finally { setLoading('commAudit', false); }
    }, [commFeed]);

    const handlePerformWebsiteAudit = useCallback(async () => {
        setLoading('websiteAudit', true); setError(null);
        try {
            const report = await performWebsiteAudit(); setWebsiteAudit(report);
        } catch (err) { setError(err instanceof Error ? err.message : 'Failed to perform audit.'); }
        finally { setLoading('websiteAudit', false); }
    }, []);

    const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
        { id: 'structure', label: 'Structure', icon: <SitemapIcon className="h-5 w-5" /> },
        { id: 'foundry', label: 'Foundry', icon: <AgentIcon className="h-5 w-5" /> },
        { id: 'evolution', label: 'Evolution', icon: <ShieldCheckIcon className="h-5 w-5" /> },
        { id: 'documents', label: 'Documents', icon: <DocumentIcon className="h-5 w-5" /> },
        { id: 'communications', label: 'Comms', icon: <MessageSquareIcon className="h-5 w-5" /> },
        { id: 'finance', label: 'Finance', icon: <DollarSignIcon className="h-5 w-5" /> },
        { id: 'design', label: 'Design', icon: <PaletteIcon className="h-5 w-5" /> },
        { id: 'nexus_forge', label: 'Nexus Forge', icon: <CodeBracketSquareIcon className="h-5 w-5" /> },
        { id: 'systems', label: 'Systems', icon: <ChipIcon className="h-5 w-5" /> },
    ];
    
    const renderContent = () => {
        switch(activeTab) {
            case 'structure':
                return <div>Structure content</div>
            case 'foundry':
                return (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
                        {/* Left Panel: Archetypes */}
                        <div className="lg:col-span-1 glass-panel p-3 rounded-lg flex flex-col">
                            <h3 className="text-lg font-semibold text-white mb-2 px-1">Agent Archetypes</h3>
                            <button onClick={handleNewArchetype} className="w-full text-sm flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 p-2 rounded-md mb-2"><PlusIcon className="h-4 w-4" /> Create New</button>
                            <div className="flex-1 overflow-y-auto space-y-1 pr-1">
                                {archetypes.map(arch => {
                                    const isAngel = arch.id === 'sovereign-angel-001';
                                    return (
                                        <div key={arch.id} onClick={() => setSelectedArchetypeId(arch.id)} 
                                            className={`p-2 rounded-md cursor-pointer flex justify-between items-center group ${selectedArchetypeId === arch.id ? 'bg-[var(--sol-accent-cyan)]/20' : 'hover:bg-white/5'}`}>
                                            <span className="font-semibold truncate">{arch.name}</span>
                                            <button onClick={(e) => { e.stopPropagation(); handleDeleteArchetype(arch.id); }} disabled={isAngel} className={`p-1 opacity-0 group-hover:opacity-100 flex-shrink-0 ${isAngel ? 'cursor-not-allowed text-gray-600' : 'hover:text-red-400'}`}>
                                                {isAngel ? <LockIcon className="h-4 w-4" /> : <TrashIcon className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Right Panel: Configuration & Forging */}
                        <div className="lg:col-span-2 glass-panel p-3 rounded-lg overflow-y-auto flex flex-col">
                           {currentArchetype ? (
                               <div className="space-y-4 flex-1 flex flex-col">
                                   <h3 className="text-lg font-semibold text-white">Configure & Forge</h3>
                                   
                                   {/* Configuration Panel */}
                                   <div className="bg-[var(--sol-bg-end)] p-3 rounded-lg border border-[var(--sol-panel-border)] space-y-3">
                                        <input type="text" value={currentArchetype.name} onChange={e => handleArchetypeFieldChange('name', e.target.value)} placeholder="Archetype Name" disabled={currentArchetype.id === 'sovereign-angel-001'} className="w-full p-2 bg-[var(--sol-bg-start)] border border-[var(--sol-panel-border)] rounded-md font-semibold disabled:opacity-70"/>
                                        <textarea value={currentArchetype.roleDescription} onChange={e => handleArchetypeFieldChange('roleDescription', e.target.value)} placeholder="Core Role / Persona Description..." disabled={currentArchetype.id === 'sovereign-angel-001'} className="w-full p-2 bg-[var(--sol-bg-start)] border border-[var(--sol-panel-border)] rounded-md disabled:opacity-70" rows={2}/>
                                        
                                        {/* Cognitive Tuning */}
                                        <div className="relative group">
                                            <div className="flex justify-between items-center mb-1">
                                                <label className="text-sm text-[var(--sol-text-secondary)] flex items-center gap-1">Creativity <InformationCircleIcon className="h-4 w-4" /></label>
                                                <span className="text-sm font-semibold text-white">{(['Precise', 'Analytical', 'Balanced', 'Creative', 'Experimental'] as const)[currentArchetype.creativity / 25]}</span>
                                            </div>
                                            <input type="range" min="0" max="100" step="25" value={currentArchetype.creativity} onChange={e => handleArchetypeFieldChange('creativity', parseInt(e.target.value))} disabled={currentArchetype.id === 'sovereign-angel-001'} className="w-full h-2 bg-[var(--sol-panel-border)] rounded-lg appearance-none cursor-pointer accent-[var(--sol-accent-pink)] disabled:opacity-70"/>
                                            <div className="absolute -top-16 -left-4 w-48 p-2 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 border border-[var(--sol-panel-border)]">
                                                Controls the agent's tendency for novel ideas vs. data-driven precision. Higher values are better for brainstorming; lower values are better for analytical tasks.
                                            </div>
                                        </div>

                                        <div className="relative group">
                                            <label className="text-sm text-[var(--sol-text-secondary)] mb-1 flex items-center gap-1">Memory Profile <InformationCircleIcon className="h-4 w-4" /></label>
                                            <select value={currentArchetype.memory} onChange={e => handleArchetypeFieldChange('memory', e.target.value as AgentArchetype['memory'])} disabled={currentArchetype.id === 'sovereign-angel-001'} className="w-full p-2 bg-[var(--sol-bg-start)] border border-[var(--sol-panel-border)] rounded-md disabled:opacity-70">
                                                <option>Short-Term</option>
                                                <option>Contextual</option>
                                                <option>Long-Term Recall</option>
                                            </select>
                                            <div className="absolute top-full mt-2 w-64 p-2 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 border border-[var(--sol-panel-border)]">
                                                <strong className="text-white">Short-Term:</strong> Remembers only the last few interactions. <br />
                                                <strong className="text-white">Contextual:</strong> Remembers the current conversation or task. <br/>
                                                <strong className="text-white">Long-Term Recall:</strong> Can access and reference information from all previous interactions.
                                            </div>
                                        </div>

                                        {/* Tool Integration */}
                                        <div>
                                            <label className="text-sm text-[var(--sol-text-secondary)] mb-1 block">Tool Integration</label>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {/* Available Tools */}
                                                <div className="bg-[var(--sol-bg-start)] p-2 rounded-lg border border-[var(--sol-panel-border)]">
                                                    <h5 className="text-xs font-semibold text-[var(--sol-text-secondary)] mb-1 px-1">Available Tools</h5>
                                                    <div className="space-y-1">
                                                        {widgetLibrary.map(widget => (
                                                            <button 
                                                                key={widget.name} 
                                                                onClick={() => handleAddWidget(widget.name)}
                                                                disabled={currentArchetype.id === 'sovereign-angel-001' || currentArchetype.widgets.some(w => w.name === widget.name)}
                                                                className="w-full text-left flex items-center gap-2 p-1.5 rounded-md hover:bg-white/10 text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                                                            >
                                                                {widget.icon} {widget.name}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                {/* Integrated Tools */}
                                                <div className="bg-[var(--sol-bg-start)] p-2 rounded-lg border border-[var(--sol-panel-border)]">
                                                    <h5 className="text-xs font-semibold text-[var(--sol-text-secondary)] mb-1 px-1">Integrated Tools</h5>
                                                    <div className="space-y-1">
                                                        {currentArchetype.widgets.map((widget, index) => (
                                                            <div key={widget.name} className="flex items-center gap-1 group">
                                                                {editingWidgetIndex === index ? (
                                                                    <input
                                                                        type="text"
                                                                        value={widget.customName}
                                                                        onChange={(e) => handleWidgetNameChange(index, e.target.value)}
                                                                        onBlur={() => setEditingWidgetIndex(null)}
                                                                        onKeyDown={(e) => {if (e.key === 'Enter') setEditingWidgetIndex(null);}}
                                                                        autoFocus
                                                                        className="flex-grow bg-white/10 text-sm p-1 rounded-md focus:outline-none ring-1 ring-[var(--sol-accent-pink)]"
                                                                    />
                                                                ) : (
                                                                    <p onClick={() => currentArchetype.id !== 'sovereign-angel-001' && setEditingWidgetIndex(index)} className="flex-grow bg-transparent text-sm p-1 rounded-md truncate cursor-pointer hover:bg-white/5">
                                                                        {widget.customName}
                                                                    </p>
                                                                )}
                                                                <button
                                                                    onClick={() => handleRemoveWidget(index)}
                                                                    disabled={currentArchetype.id === 'sovereign-angel-001'}
                                                                    className="p-1 text-[var(--sol-text-secondary)] hover:text-red-400 opacity-0 group-hover:opacity-100 disabled:opacity-0"
                                                                >
                                                                    <CloseIcon className="h-4 w-4" />
                                                                </button>
                                                            </div>
                                                        ))}
                                                        {currentArchetype.widgets.length === 0 && <p className="text-xs text-center text-[var(--sol-text-secondary)] p-2">Add tools from the left.</p>}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                   </div>
                                   
                                   <div className="flex gap-2 mt-auto pt-4">
                                    <button onClick={handleSaveCurrentArchetype} disabled={currentArchetype.id === 'sovereign-angel-001'} className="flex-1 bg-white/10 hover:bg-white/20 p-2 rounded-md disabled:opacity-70 disabled:cursor-not-allowed">Save Archetype</button>
                                    <button onClick={handleForgeAgent} disabled={isLoading.agentProfile} className="flex-1 bg-gradient-to-r from-[var(--sol-accent-cyan)] to-[var(--sol-accent-pink)] text-white font-bold p-2 rounded-md disabled:opacity-50">
                                       {isLoading.agentProfile ? 'Forging...' : 'Forge Agent'}
                                    </button>
                                   </div>
                               </div>
                           ) : (
                               <div className="text-center text-[var(--sol-text-secondary)] flex-1 flex flex-col items-center justify-center">
                                    <AgentIcon className="h-12 w-12 opacity-30 mb-2"/>
                                    <p>Select an archetype or create a new one to begin configuration.</p>
                               </div>
                           )}
                           <div className="mt-6 border-t border-[var(--sol-panel-border)] pt-4">
                             <h3 className="text-lg font-semibold text-white">Forged Agents</h3>
                             {createdAgents.length > 0 ? (
                                 <div className="space-y-2 mt-2">
                                     {createdAgents.map((agent, i) => <AgentProfileDisplay key={i} profile={agent} />)}
                                 </div>
                             ) : <p className="text-sm text-[var(--sol-text-secondary)] text-center mt-4">No agents forged from this session yet.</p>}
                           </div>
                        </div>
                    </div>
                );
            case 'evolution':
                return <div>Evolution Content</div>
            case 'documents':
                 return (
                    <div className="glass-panel p-4 rounded-lg">
                        <h3 className="text-xl font-bold text-white mb-2">Document & Form Hub</h3>
                        <p className="text-sm text-[var(--sol-text-secondary)] mb-4">Select a form template to open it in the Form Processor.</p>
                        <FormTypeTree node={formTypes} path={[]} onSelect={(path) => onNavigateToForm(path)} />
                    </div>
                 );
            case 'communications':
                return (
                    <div className="space-y-4">
                        <button onClick={handleGenerateCommFeed} disabled={isLoading.commFeed}>Generate Feed</button>
                        {isLoading.commFeed && <SkeletonLoader className="w-full h-96" />}
                        {commFeed && <CommunicationsFeed feed={commFeed} />}
                        {commFeed && <button onClick={handlePerformCommAudit} disabled={isLoading.commAudit}>Audit Feed</button>}
                        {isLoading.commAudit && <SkeletonLoader className="w-full h-64 mt-4" />}
                        {commAudit && <CommunicationsAuditDisplay report={commAudit} />}
                    </div>
                );
            case 'finance':
                return <FinanceWorkspace />;
            case 'design':
                return <div>Design content</div>
            case 'nexus_forge':
                return <NexusForge />;
            case 'systems':
                return <div>Systems content</div>
            default: return null;
        }
    }

    return (
         <div className="w-full h-full flex flex-col bg-transparent text-[var(--sol-text-primary)]">
            <header className="flex-shrink-0 border-b border-[var(--sol-panel-border)] overflow-x-auto">
                <nav className="flex items-center gap-2 px-2">
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-3 py-2.5 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${activeTab === tab.id ? 'text-white border-[var(--sol-accent-cyan)]' : 'text-[var(--sol-text-secondary)] border-transparent hover:text-white'}`}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </nav>
            </header>
            <main className="flex-1 overflow-y-auto p-4">
                {error && <p className="text-red-300 bg-red-900/30 p-2 rounded-lg text-sm mb-4 border border-red-500/50">{error}</p>}
                {renderContent()}
            </main>
        </div>
    );
}

export default EnterpriseWorkspace;
