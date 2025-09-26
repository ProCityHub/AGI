import React, { useState, useEffect } from 'react';
import { FormProcessResult } from '../types';
import { processForm } from '../services/geminiService';
import { ResetIcon, SparklesIcon, AgentIcon, CopyIcon, CheckIcon, UploadIcon, DownloadIcon } from './icons';
import SkeletonLoader from './SkeletonLoader';
import InvoiceEditor from './InvoiceEditor';
import { formTypes, FormTypeNode } from './formTypes';

interface FormProcessorProps {
    onGoBack?: () => void;
    initialPath?: string[] | null;
}

const FormResultSkeleton = () => (
    <div className="glass-panel p-4 sm:p-6 rounded-lg space-y-6">
        <div>
            <SkeletonLoader className="h-7 w-1/2 mb-2" />
            <div className="bg-[var(--sol-bg-end)] p-3 rounded-lg border border-[var(--sol-panel-border)] flex items-center gap-4">
                <SkeletonLoader className="h-8 w-8 rounded-full flex-shrink-0" />
                <div className="w-full">
                    <SkeletonLoader className="h-4 w-1/4 mb-1" />
                    <SkeletonLoader className="h-6 w-1/2" />
                </div>
            </div>
        </div>
        <div>
            <SkeletonLoader className="h-6 w-1/3 mb-2" />
            <div className="bg-[var(--sol-bg-end)] p-4 rounded-lg border border-[var(--sol-panel-border)] space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-x-4 items-center">
                        <SkeletonLoader className="h-4 w-3/4 md:ml-auto" />
                        <div className="md:col-span-2">
                           <SkeletonLoader className="h-7 w-full" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
        <div>
            <SkeletonLoader className="h-6 w-1/4 mb-2" />
            <div className="bg-[var(--sol-bg-end)] p-4 rounded-lg border border-[var(--sol-panel-border)] space-y-2">
                <SkeletonLoader className="h-4 w-full" />
                <SkeletonLoader className="h-4 w-5/6" />
            </div>
        </div>
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <SkeletonLoader className="h-10 w-full" />
            <SkeletonLoader className="h-10 w-full" />
        </div>
    </div>
);


const FormProcessor: React.FC<FormProcessorProps> = ({ onGoBack, initialPath }) => {
    const [formText, setFormText] = useState('');
    const [selectedPath, setSelectedPath] = useState<string[]>([]);
    
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<FormProcessResult | null>(null);
    const [editableResult, setEditableResult] = useState<FormProcessResult | null>(null);
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);

     useEffect(() => {
        if (initialPath && initialPath.length > 0) {
            let path = [...initialPath];
            let node: any = formTypes;
             for(const key of path) {
                if(node[key]) node = node[key];
            }
             while(typeof node === 'object' && !Array.isArray(node)) {
                const firstChildKey = Object.keys(node)[0];
                path.push(firstChildKey);
                node = node[firstChildKey];
            }
             if(Array.isArray(node)) {
                path.push(node[0]);
            }
            setSelectedPath(path);
        } else {
            let path: string[] = [];
            let node: FormTypeNode | string[] = formTypes;
            while(typeof node === 'object' && !Array.isArray(node)) {
                const key = Object.keys(node)[0];
                path.push(key);
                node = node[key];
            }
            path.push((node as string[])[0]);
            setSelectedPath(path);
        }
    }, [initialPath]);

    const handleProcessForm = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formText.trim()) {
            setError("Please provide the form text to be processed.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setResult(null);
        setEditableResult(null);
        try {
            const fullFormType = selectedPath.join(' -> ');
            const processedResult = await processForm(formText, fullFormType);
            setResult(processedResult);
            setEditableResult(JSON.parse(JSON.stringify(processedResult)));
        } catch (err) {
            const message = err instanceof Error ? err.message : "An unknown error occurred.";
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        setFormText('');
        setError(null);
        setResult(null);
        setEditableResult(null);
        setIsLoading(false);
        setFileName(null);
    };
    
    const handleCopy = (text: string, fieldName: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(fieldName);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const handlePathChange = (level: number, value: string) => {
        const newPath = [...selectedPath.slice(0, level), value];
        let currentNode: any = formTypes;
        for(const key of newPath) {
            if (currentNode[key]) currentNode = currentNode[key];
            else { setSelectedPath([]); return; }
        }
        while(typeof currentNode === 'object' && !Array.isArray(currentNode)) {
            const firstChildKey = Object.keys(currentNode)[0];
            newPath.push(firstChildKey);
            currentNode = currentNode[firstChildKey];
        }
        if(Array.isArray(currentNode)) newPath.push(currentNode[0]);
        setSelectedPath(newPath);
    };

    const handleFieldChange = (index: number, value: string) => {
        if (editableResult) {
            const newFields = [...editableResult.formFields];
            newFields[index] = { ...newFields[index], fieldValue: value };
            setEditableResult({ ...editableResult, formFields: newFields });
        }
    };
    
     const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setFormText(e.target?.result as string);
                setFileName(file.name);
            };
            reader.readAsText(file);
        }
    };
    
    const handleDownloadTxt = () => {
        if (!editableResult) return;
        let content = `GARVIS Automated Form Processor Result\n=========================================\n\nAssigned Agent: ${editableResult.assignedAgent}\n-----------------------------------------\n\nForm Fields:\n`;
        editableResult.formFields.forEach(field => { content += `${field.fieldName}: ${field.fieldValue}\n`; });
        content += `\n-----------------------------------------\nSummary Notes:\n${editableResult.summaryNotes}\n=========================================\n`;
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const fileNameSafe = selectedPath.join('_').replace(/[^a-z0-9_]/gi, '_').toLowerCase();
        a.download = `${fileNameSafe}_processed.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const renderDropdowns = () => {
        const dropdowns: React.ReactNode[] = [];
        let currentNode: any = formTypes;
        const baseSelectClass = "w-full p-2 bg-[var(--sol-bg-end)] text-[var(--sol-text-primary)] rounded-lg border border-[var(--sol-panel-border)] focus:outline-none focus:ring-2 focus:ring-[var(--sol-accent-pink)]";

        for (let i = 0; i < selectedPath.length; i++) {
            if (typeof currentNode !== 'object' || Array.isArray(currentNode)) break;
            const levelKeys = Object.keys(currentNode);
            const currentSelection = selectedPath[i];
            if(!levelKeys.includes(currentSelection)) break;
            dropdowns.push(
                <div key={i}>
                    <select value={currentSelection} onChange={(e) => handlePathChange(i, e.target.value)} className={baseSelectClass}>
                        {levelKeys.map(key => <option key={key} value={key}>{key}</option>)}
                    </select>
                </div>
            );
            currentNode = currentNode[currentSelection];
            if (Array.isArray(currentNode)) {
                const finalSelection = selectedPath[i + 1];
                dropdowns.push(
                    <div key={i + 1}>
                        <select value={finalSelection} onChange={(e) => handlePathChange(i + 1, e.target.value)} className={baseSelectClass}>
                            {currentNode.map(formName => <option key={formName} value={formName}>{formName}</option>)}
                        </select>
                    </div>
                );
                break;
            }
        }
        return dropdowns;
    };

    const examplePlaceholder = `Paste any unstructured form text here, or upload a file.`;

    return (
        <div className="w-full h-full p-4 sm:p-6 bg-transparent text-[var(--sol-text-primary)] overflow-y-auto">
            {!result && !isLoading && (
                <div className="glass-panel p-4 sm:p-6 rounded-lg animate-fade-in">
                    <h2 className="text-xl font-bold text-white mb-2">Automated Form Processor</h2>
                    <p className="text-[var(--sol-text-secondary)] mb-4 text-sm">
                        Paste unstructured text or upload a file. A hyper-specialized agent will analyze, structure, and fill it out.
                    </p>
                    <form onSubmit={handleProcessForm} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           {renderDropdowns()}
                        </div>
                        <div>
                             <div className="flex justify-between items-center mb-1">
                                <label htmlFor="formText" className="block text-sm font-semibold text-[var(--sol-text-secondary)]">Unstructured Form Text</label>
                                 <label htmlFor="file-upload" className="cursor-pointer inline-flex items-center gap-1 text-sm text-[var(--sol-accent-cyan)] hover:text-white">
                                    <UploadIcon className="h-4 w-4" /> Upload File
                                </label>
                                <input id="file-upload" type="file" className="hidden" onChange={handleFileUpload} accept=".txt,.md,.csv" />
                            </div>
                            {fileName && <p className="text-xs text-[var(--sol-text-secondary)] mb-2">Loaded: {fileName}</p>}
                            <textarea id="formText" value={formText} onChange={(e) => setFormText(e.target.value)} placeholder={examplePlaceholder}
                                className="w-full p-2 bg-[var(--sol-bg-end)] rounded-lg border border-[var(--sol-panel-border)] focus:outline-none focus:ring-2 focus:ring-[var(--sol-accent-pink)] min-h-[200px] resize-y font-mono text-sm" rows={8}/>
                        </div>
                        {error && <p className="text-red-300 text-sm">{error}</p>}
                        <button type="submit"
                            className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[var(--sol-accent-cyan)] to-[var(--sol-accent-pink)] hover:opacity-90 text-white font-bold py-2.5 px-4 rounded-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
                            <SparklesIcon className="h-5 w-5" /> Process Form
                        </button>
                    </form>
                </div>
            )}
            
            {isLoading && <FormResultSkeleton />}
            
            {editableResult && (
                <div className="glass-panel p-4 sm:p-6 rounded-lg animate-fade-in space-y-6">
                    <div>
                        <h3 className="text-xl font-bold text-white mb-2">Processing Complete</h3>
                        <div className="bg-[var(--sol-bg-end)] p-3 rounded-lg border border-[var(--sol-panel-border)] flex items-center gap-4">
                             <AgentIcon className="h-8 w-8 text-[var(--sol-accent-cyan)] flex-shrink-0" />
                             <div>
                                <p className="font-semibold text-[var(--sol-text-secondary)]">Assigned Agent</p>
                                <p className="text-lg font-bold text-white">{editableResult.assignedAgent}</p>
                            </div>
                        </div>
                    </div>

                    {editableResult.invoiceData ? (
                        <InvoiceEditor initialData={editableResult.invoiceData} />
                    ) : (
                        <div>
                            <h4 className="text-lg font-semibold text-white mb-2">Completed & Editable Form</h4>
                            <div className="bg-[var(--sol-bg-end)] p-4 rounded-lg border border-[var(--sol-panel-border)] space-y-2">
                                {editableResult.formFields.map((field, index) => (
                                    <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-x-4 items-center group">
                                        <label htmlFor={`field-${index}`} className="font-semibold text-[var(--sol-text-secondary)] text-sm md:text-right md:mb-0 mb-1">{field.fieldName}:</label>
                                        <div className="md:col-span-2 flex items-center gap-2">
                                            <input id={`field-${index}`} type="text" value={field.fieldValue} onChange={(e) => handleFieldChange(index, e.target.value)}
                                                className="w-full p-1 bg-[var(--sol-bg-start)] border border-[var(--sol-panel-border)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--sol-accent-pink)]"/>
                                            <button onClick={() => handleCopy(field.fieldValue, field.fieldName)} className="p-2 text-[var(--sol-text-secondary)] rounded-md hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {copiedField === field.fieldName ? <CheckIcon className="h-5 w-5 text-green-400" /> : <CopyIcon className="h-5 w-5" />}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    <div>
                        <h4 className="text-lg font-semibold text-white mb-2">Summary Notes</h4>
                        <div className="prose prose-sm max-w-none text-[var(--sol-text-secondary)] bg-[var(--sol-bg-end)] p-4 rounded-lg border border-[var(--sol-panel-border)]">
                           <p><em>{editableResult.summaryNotes}</em></p>
                        </div>
                    </div>
                    
                    <div className="mt-6 flex flex-col sm:flex-row gap-4">
                        {!editableResult.invoiceData && (
                            <button onClick={handleDownloadTxt} className="w-full inline-flex items-center justify-center gap-2 bg-[var(--sol-accent-cyan)]/80 hover:bg-[var(--sol-accent-cyan)] text-black font-semibold py-2 px-4 rounded-lg transition-colors text-sm">
                                <DownloadIcon className="h-4 w-4" /> Download as .txt
                            </button>
                        )}
                        <button onClick={handleReset} className="w-full inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm border border-[var(--sol-panel-border)]">
                            <ResetIcon className="h-4 w-4" /> Process Another Form
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FormProcessor;