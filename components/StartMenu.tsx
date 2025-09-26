

import React from 'react';
import { WindowInstance, User } from '../types';
import { BrainIcon, ArchiveIcon, LockIcon, LogOffIcon, UserAccountsIcon, EnterpriseCommandIcon, FileExplorerIcon, SearchIcon, BrowserIcon } from './icons';

interface StartMenuProps {
    isOpen: boolean;
    currentUser: User;
    onClose: () => void;
    onOpenWindow: (type: WindowInstance['componentType'], props?: any) => void;
    onLock: () => void;
    onLogout: () => void;
}

const StartMenu: React.FC<StartMenuProps> = ({ isOpen, currentUser, onClose, onOpenWindow, onLock, onLogout }) => {
    if (!isOpen || !currentUser) return null;

    const MenuItem: React.FC<{ icon: React.ReactNode; label: string; onClick: () => void; }> = 
    ({ icon, label, onClick }) => (
        <button
            onClick={onClick}
            className="flex flex-col items-center justify-center gap-2 w-full h-24 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
        >
            <div className="h-8 w-8 text-[var(--sol-accent-cyan)]">{icon}</div>
            <span className="text-xs font-semibold">{label}</span>
        </button>
    );

    return (
        <div
            className="fixed inset-0 z-40"
            onClick={onClose}
        >
            <div
                className="absolute bottom-16 left-1/2 -translate-x-1/2 w-full max-w-lg flex flex-col glass-panel rounded-xl shadow-2xl z-50 text-white animate-fade-in"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-4">
                    <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--sol-text-secondary)]"/>
                        <input 
                            type="text" 
                            placeholder="Type here to search"
                            className="w-full bg-[var(--sol-bg-start)] border border-[var(--sol-panel-border)] rounded-full py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-[var(--sol-accent-pink)]"
                        />
                    </div>
                </div>

                <main className="p-4 border-t border-[var(--sol-panel-border)]">
                    <h2 className="text-sm font-semibold text-[var(--sol-text-secondary)] mb-3 px-1">Applications</h2>
                    <div className="grid grid-cols-4 gap-3">
                         <MenuItem 
                            icon={<EnterpriseCommandIcon />} 
                            label="Command" 
                            onClick={() => onOpenWindow('EnterpriseWorkspace')} 
                        />
                         <MenuItem 
                            icon={<BrainIcon />} 
                            label="Intel"
                            onClick={() => onOpenWindow('SystemAnatomy')} 
                        />
                        <MenuItem 
                            icon={<FileExplorerIcon />} 
                            label="Directives" 
                            onClick={() => onOpenWindow('FileExplorer')} 
                        />
                        <MenuItem 
                            icon={<BrowserIcon />}
                            label="Browser"
                            onClick={() => onOpenWindow('NexusBrowser')}
                        />
                         <MenuItem 
                            icon={<UserAccountsIcon />} 
                            label="Accounts" 
                            onClick={() => onOpenWindow('UserAccounts')} 
                        />
                    </div>
                </main>

                 <footer className="glass-panel p-3 flex justify-between items-center rounded-b-xl border-t border-[var(--sol-panel-border)]">
                     <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center font-bold">
                            {currentUser.username.charAt(0)}
                        </div>
                        <span className="font-semibold">{currentUser.username}</span>
                     </div>
                     <div className="flex items-center gap-2">
                        <button onClick={onLock} title="Lock Session" className="p-2 rounded-full hover:bg-white/10 transition-colors">
                            <LockIcon className="h-5 w-5 text-[var(--sol-text-secondary)]"/>
                        </button>
                        <button onClick={onLogout} title="Log Off" className="p-2 rounded-full hover:bg-white/10 transition-colors">
                            <LogOffIcon className="h-5 w-5 text-[var(--sol-text-secondary)]"/>
                        </button>
                     </div>
                </footer>
            </div>
        </div>
    );
};

export default StartMenu;
