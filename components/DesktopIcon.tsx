import React, { useState, useRef, useEffect } from 'react';

interface DesktopIconProps {
    label: string;
    icon: React.ReactNode;
    initialPosition: { x: number; y: number };
    onDoubleClick: () => void;
}

const DesktopIcon: React.FC<DesktopIconProps> = ({ label, icon, initialPosition, onDoubleClick }) => {
    const [position, setPosition] = useState(initialPosition);
    const [isDragging, setIsDragging] = useState(false);
    const dragOffset = useRef({ x: 0, y: 0 });
    const iconRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging) {
                let newX = e.clientX - dragOffset.current.x;
                let newY = e.clientY - dragOffset.current.y;

                // Clamp to viewport
                const rect = iconRef.current?.parentElement?.getBoundingClientRect();
                if (rect) {
                    newX = Math.max(0, Math.min(newX, rect.width - (iconRef.current?.offsetWidth || 0)));
                    newY = Math.max(0, Math.min(newY, rect.height - (iconRef.current?.offsetHeight || 0)));
                }

                setPosition({ x: newX, y: newY });
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);

    const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (e.button !== 0) return;
        setIsDragging(true);
        dragOffset.current = {
            x: e.clientX - position.x,
            y: e.clientY - position.y,
        };
    };
    
    return (
        <button
            ref={iconRef}
            onMouseDown={handleMouseDown}
            onDoubleClick={onDoubleClick}
            className="desktop-icon absolute flex flex-col items-center justify-start w-28 h-28 p-2 rounded-lg cursor-pointer select-none"
            style={{ left: `${position.x}px`, top: `${position.y}px` }}
        >
            {icon}
            <span className="mt-1 text-sm text-white text-center px-1 rounded-sm">
                {label}
            </span>
        </button>
    );
};

export default DesktopIcon;
