

import React, { useState, useMemo } from 'react';
import type { SavedDirective } from '../types';
import { TrashIcon, DocumentIcon, FolderIcon, SearchIcon, AlertTriangleIcon, SparklesIcon } from './icons';

interface FileExplorerProps {
    savedDirectives: SavedDirective[];
    onSelectDirective: (directive: SavedDirective) => void;
    onDeleteDirective: (id: string) => void;
}

const FileExplorer: React.FC<FileExplorerProps> = ({ savedDirectives, onSelectDirective, onDeleteDirective }) => {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [directiveToDelete, setDirectiveToDelete] = useState<SavedDirective | null>(null);

    const filteredDirectives = useMemo(() => {
        if (!searchQuery) return savedDirectives;
        return savedDirectives.filter(d =>
            d.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
            d.directive.projectIntake.projectName.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery, savedDirectives]);

    const selectedDirective = useMemo(() => {
        if (!selectedId) return null;
        return savedDirectives.find(d => d.id === selectedId);
    }, [selectedId, savedDirectives]);

    const confirmDelete = () => {
        if (directiveToDelete) {
            onDeleteDirective(directiveToDelete.id);
            if (selectedId === directiveToDelete.id) {
                setSelectedId(null);
            }
            setDirectiveToDelete(null);
        }
    };

    return (
        <div className="w-full h-full flex bg-transparent text-[var(--sol-text-primary)] overflow-hidden">
            {/* Left Pane: Directive List */}
            <div className="w-2/5 flex flex-col border-r border-[var(--sol-panel-border)]">
                <header className="flex-shrink-0 p-2 border-b border-[var(--sol-panel-border)]">
                    <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--sol-text-secondary)]" />
                        <input
                            type="text"
                            placeholder="Search directives..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[var(--sol-bg-end)] text-sm rounded-md py-1.5 pl-9 pr-3 focus:outline-none focus:ring-1 focus:ring-[var(--sol-accent-pink)]"
                        />
                    </div>
                </header>
                <div className="flex-1 overflow-y-auto p-1">
                    {filteredDirectives.length > 0 ? (
                        <ul className="space-y-1">
                            {filteredDirectives.map((saved) => (
                                <li
                                    key={saved.id}
                                    onClick={() => setSelectedId(saved.id)}
                                    onDoubleClick={() => onSelectDirective(saved)}
                                    className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors group ${
                                        selectedId === saved.id ? 'bg-[var(--sol-accent-cyan)]/20' : 'hover:bg-white/5'
                                    }`}
                                    tabIndex={0}
                                >
                                    <DocumentIcon className="h-6 w-6 text-[var(--sol-accent-cyan)] flex-shrink-0" />
                                    <div className="flex-1 overflow-hidden">
                                        <p className="font-semibold text-sm truncate text-white">
                                            {saved.directive.projectIntake.projectName}
                                        </p>
                                        <p className="text-xs truncate text-[var(--sol-text-secondary)]">
                                            Saved: {new Date(saved.savedAt).toLocaleString()}
                                        </p>
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setDirectiveToDelete(saved); }}
                                        className="ml-2 p-1.5 rounded-full text-[var(--sol-text-secondary)] hover:bg-red-500/20 hover:text-red-300 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                                        aria-label="Delete directive"
                                    >
                                        <TrashIcon className="h-4 w-4" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-center h-full flex flex-col justify-center items-center text-[var(--sol-text-secondary)] p-4">
                            <FolderIcon className="h-12 w-12 mb-2 opacity-50" />
                            <h3 className="font-semibold text-white">No Directives Found</h3>
                            <p className="text-xs">Your search returned no results, or no directives are saved.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Pane: Preview */}
            <div className="w-3/5 overflow-y-auto p-4">
                {selectedDirective ? (
                    <div className="animate-fade-in space-y-4">
                        <h3 className="text-xl font-bold text-white">{selectedDirective.directive.projectIntake.projectName}</h3>
                        <p className="text-sm text-[var(--sol-text-secondary)] bg-[var(--sol-bg-end)] inline-block px-2 py-1 rounded-md border border-[var(--sol-panel-border)]">
                            {selectedDirective.directive.projectIntake.projectType}
                        </p>
                        
                        <div>
                            <h4 className="font-semibold text-[var(--sol-accent-cyan)] mb-2">Agent Cohort</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {selectedDirective.directive.agentCohort.map(agent => (
                                    <div key={agent.role} className="bg-[var(--sol-bg-end)] p-2 rounded-md border border-[var(--sol-panel-border)]">
                                        <p className="text-sm font-bold text-white">{agent.role}</p>
                                        <p className="text-xs text-[var(--sol-text-secondary)] italic">"{agent.perspective}"</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h4 className="font-semibold text-[var(--sol-accent-cyan)] mb-2">Scope Summary</h4>
                            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                                {selectedDirective.directive.scopeOfWork.map((section, index) => (
                                    <div key={index} className="bg-[var(--sol-bg-end)] p-2 rounded-md border border-[var(--sol-panel-border)] text-xs">
                                        <p className="font-bold text-white truncate">{section.title}</p>
                                        <p className="text-[var(--sol-text-secondary)] mt-1 line-clamp-2" dangerouslySetInnerHTML={{ __html: section.summary }} />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h4 className="font-semibold text-[var(--sol-accent-cyan)] mb-2 flex items-center gap-2">
                                <SparklesIcon className="h-5 w-5 text-[var(--sol-accent-pink)]"/>
                                Final Note from Agent Prime
                            </h4>
                            <blockquote className="text-[var(--sol-text-primary)] italic bg-[var(--sol-bg-end)] p-3 rounded-lg border-l-4 border-[var(--sol-accent-pink)]">
                                "{selectedDirective.directive.finalNote}"
                            </blockquote>
                        </div>

                         <button
                            onClick={() => onSelectDirective(selectedDirective)}
                            className="w-full mt-4 bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-4 rounded-lg transition-colors border border-[var(--sol-panel-border)]"
                        >
                            Open Full Dashboard
                        </button>
                    </div>
                ) : (
                    <div className="h-full flex flex-col justify-center items-center text-center text-[var(--sol-text-secondary)]">
                        <DocumentIcon className="h-16 w-16 mb-4 opacity-50" />
                        <h3 className="text-lg font-semibold text-white">Select a Directive</h3>
                        <p className="text-sm">Choose a directive from the list to see its details here.</p>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {directiveToDelete && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10 flex items-center justify-center animate-fade-in">
                    <div className="glass-panel w-full max-w-sm rounded-lg border border-[var(--sol-panel-border-active)] p-6 text-center shadow-2xl">
                        <AlertTriangleIcon className="h-12 w-12 text-red-400 mx-auto mb-4"/>
                        <h3 className="text-lg font-bold text-white">Delete Directive?</h3>
                        <p className="text-[var(--sol-text-secondary)] my-2 text-sm">
                            Are you sure you want to delete "{directiveToDelete.topic}"? This action cannot be undone.
                        </p>
                        <div className="flex gap-4 mt-6">
                            <button
                                onClick={() => setDirectiveToDelete(null)}
                                className="w-full bg-white/10 hover:bg-white/20 font-semibold py-2 px-4 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FileExplorer;