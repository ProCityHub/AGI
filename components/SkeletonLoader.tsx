import React from 'react';

interface SkeletonLoaderProps {
    className?: string;
    children?: React.ReactNode;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ className, children }) => {
    return (
        <div className={`bg-[var(--sol-panel-border)] rounded-md animate-shimmer ${className}`}>
            {children}
        </div>
    );
};

export default SkeletonLoader;
