import React, { useState, useEffect } from 'react';
import { WindowInstance } from '../types';
import { StartIcon, SystemHealthIcon, NetworkIcon, CommandIcon } from './icons';

interface TaskbarProps {
    windows: WindowInstance[];
    onToggleStartMenu: () => void;
    onCommandBarOpen: () => void;
    onWindowClick: (id: string) => void;
    activeWindowId: string | null;
}

const Taskbar: React.FC<TaskbarProps> = ({ windows, onToggleStartMenu, onCommandBarOpen, onWindowClick, activeWindowId }) => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 30000); // Update every 30s
        return () => clearInterval(timer);
    }, []);

    return (
        <footer className="absolute bottom-2 left-1/2 -translate-x-1/2 h-14 w-full max-w-lg flex items-center justify-center z-50">
           <div className="flex items-center gap-2 h-full rounded-xl glass-panel px-2">
             <button 
                onClick={onToggleStartMenu}
                className="h-10 w-10 flex items-center justify-center rounded-lg bg-transparent hover:bg-[var(--sol-accent-pink)]/50 transition-colors"
                title="Start Menu"
            >
                <StartIcon className="h-6 w-6 text-white" />
            </button>
            
            <button
                onClick={onCommandBarOpen}
                className="h-10 w-10 flex items-center justify-center rounded-lg bg-transparent hover:bg-[var(--sol-accent-cyan)]/50 transition-colors"
                title="Open Command Bar (Ctrl+K)"
            >
                <CommandIcon className="h-6 w-6 text-white" />
            </button>

            <div className="w-px h-8 bg-[var(--sol-panel-border)]"></div>

            <div className="flex items-center gap-2 h-full">
                {windows.map(win => {
                    const isActive = win.id === activeWindowId && !win.isMinimized;
                    const buttonClasses = [
                        "relative h-10 w-10 flex items-center justify-center rounded-lg transition-all duration-200",
                         isActive 
                            ? "bg-[var(--sol-accent-cyan)]/20" 
                            : "bg-transparent hover:bg-white/10"
                    ].join(' ');

                    return (
                        <button key={win.id} onClick={() => onWindowClick(win.id)} className={buttonClasses} title={win.title}>
                            {React.cloneElement(win.icon as React.ReactElement<{ className?: string }>, { className: 'h-6 w-6 text-[var(--sol-text-primary)]' })}
                            {!win.isMinimized && <div className="absolute bottom-1 h-1 w-4 rounded-full bg-[var(--sol-accent-cyan)]"></div>}
                        </button>
                    );
                })}
            </div>

            <div className="w-px h-8 bg-[var(--sol-panel-border)]"></div>
            
            <div className="h-full flex items-center text-[var(--sol-text-secondary)] text-xs font-semibold px-2 gap-3">
                 <div className="flex items-center gap-2">
                    <div className="relative group">
                        <SystemHealthIcon className="h-4 w-4" />
                        <div className="absolute bottom-full mb-2 w-max bg-[var(--sol-panel-bg)] text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none -translate-x-1/2 left-1/2">
                            System Health: Optimal
                            <svg className="absolute text-[var(--sol-panel-bg)] h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255"><polygon className="fill-current" points="0,0 127.5,127.5 255,0"/></svg>
                        </div>
                    </div>
                     <div className="relative group">
                        <NetworkIcon className="h-4 w-4" />
                        <div className="absolute bottom-full mb-2 w-max bg-[var(--sol-panel-bg)] text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none -translate-x-1/2 left-1/2">
                           Network: Connected
                           <svg className="absolute text-[var(--sol-panel-bg)] h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255"><polygon className="fill-current" points="0,0 127.5,127.5 255,0"/></svg>
                        </div>
                    </div>
                </div>
                {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
           </div>
        </footer>
    );
};

export default Taskbar;