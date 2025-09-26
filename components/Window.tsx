import React, { useState, useEffect, useRef } from 'react';
import { CloseIcon, MaximizeIcon, RestoreIcon } from './icons';

interface WindowProps {
    id: string;
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    initialPosition: { x: number; y: number };
    initialSize: { width: number; height: number };
    zIndex: number;
    isMinimized: boolean;
    isMaximized?: boolean;
    isActive: boolean;
    onClose: () => void;
    onMinimize: () => void;
    onToggleMaximize: () => void;
    onFocus: () => void;
    onPositionChange: (pos: { x: number; y: number }) => void;
}

const Window: React.FC<WindowProps> = ({
    id,
    title,
    icon,
    children,
    initialPosition,
    initialSize,
    zIndex,
    isMinimized,
    isMaximized,
    isActive,
    onClose,
    onMinimize,
    onToggleMaximize,
    onPositionChange,
    onFocus,
}) => {
    const [position, setPosition] = useState(initialPosition);
    const [size, setSize] = useState(initialSize);
    const [isDragging, setIsDragging] = useState(false);
    const dragOffset = useRef({ x: 0, y: 0 });
    const windowRef = useRef<HTMLDivElement>(null);

     useEffect(() => {
        if (!isMaximized) {
            setPosition(initialPosition);
            setSize(initialSize);
        }
    }, [initialPosition, initialSize, isMaximized]);


    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging && windowRef.current && !isMaximized) {
                const newX = e.clientX - dragOffset.current.x;
                const newY = e.clientY - dragOffset.current.y;
                setPosition({ x: newX, y: newY });
            }
        };

        const handleMouseUp = () => {
            if (isDragging) {
                setIsDragging(false);
                if (!isMaximized) {
                    onPositionChange(position);
                }
            }
        };

        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, position, onPositionChange, isMaximized]);

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.button !== 0) return;
        // Don't drag if clicking on a button inside the header
        if ((e.target as HTMLElement).closest('button')) return;
        
        onFocus();
        if (!isMaximized) {
            setIsDragging(true);
            dragOffset.current = {
                x: e.clientX - position.x,
                y: e.clientY - position.y,
            };
        }
        e.preventDefault();
    };
    
    const windowStyle: React.CSSProperties = isMaximized ? {
        left: '0px',
        top: '0px',
        width: '100vw',
        height: 'calc(100vh - 64px)', // Account for taskbar
        zIndex,
    } : {
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        zIndex,
    };

    const windowClasses = [
        "absolute flex flex-col glass-panel transition-all duration-150",
        isMaximized ? 'rounded-none' : 'rounded-lg',
        isActive ? "shadow-[0_0_25px_var(--sol-accent-glow)]" : "shadow-lg",
        isMinimized ? "opacity-0 pointer-events-none transform scale-95" : "opacity-100 animate-open-window",
    ].join(' ');
    
    const MinimizeButton = () => (
      <svg width="10" height="10" viewBox="0 0 10 1" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 0.5H10" stroke="currentColor" strokeWidth="1"/>
      </svg>
    );

    return (
        <div
            ref={windowRef}
            className={windowClasses}
            style={{
                ...windowStyle,
                borderColor: isActive ? 'var(--sol-panel-border-active)' : 'var(--sol-panel-border)',
            }}
            onMouseDown={onFocus}
        >
            <div
                className="window-header"
                onMouseDown={handleMouseDown}
                onDoubleClick={onToggleMaximize}
            >
                <div className="window-title">
                    {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: 'h-4 w-4 text-[var(--sol-accent-cyan)]' })}
                    <span className="truncate">{title}</span>
                </div>
                <div className="window-controls">
                    <button onClick={onMinimize} title="Minimize"><MinimizeButton /></button>
                    <button onClick={onToggleMaximize} title={isMaximized ? "Restore" : "Maximize"}>
                        {isMaximized ? <RestoreIcon className="h-4 w-4" /> : <MaximizeIcon className="h-4 w-4" />}
                    </button>
                    <button onClick={onClose} className="close-btn" title="Close">
                        <CloseIcon className="h-5 w-5" />
                    </button>
                </div>
            </div>
            <div className="flex-1 rounded-b-lg overflow-hidden bg-transparent">
                {children}
            </div>
        </div>
    );
};

export default Window;