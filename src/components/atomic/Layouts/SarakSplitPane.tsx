import React, { useState, useRef, useCallback } from 'react';
import { useSarakUI } from '../../../core/Provider/SarakUIProvider';

export interface SarakSplitPaneProps {
    leftPane: React.ReactNode;
    rightPane: React.ReactNode;
    minLeftWidth?: number;
    maxLeftWidth?: number;
    defaultLeftWidth?: number;
    className?: string;
}

/**
 * Componente de Painel Redimensionável (Split Pane).
 * Permite arraste fluido entre dois painéis respeitando os limites configurados.
 */
export const SarakSplitPane: React.FC<SarakSplitPaneProps> = ({
    leftPane,
    rightPane,
    minLeftWidth = 200,
    maxLeftWidth = 800,
    defaultLeftWidth = 300,
    className = ''
}) => {
    const { design } = useSarakUI();
    const [leftWidth, setLeftWidth] = useState(defaultLeftWidth);
    const isDragging = useRef(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const gap = (design?.layoutGapSm as string | number) || 'var(--sarak-layout-gap-sm,8px)';
    const accentColor = design?.primaryColor || 'var(--sarak-primary-color,#3b82f6)';

    const handleMouseDown = useCallback(() => {
        isDragging.current = true;
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
    }, []);

    const handleMouseUp = useCallback(() => {
        isDragging.current = false;
        document.body.style.cursor = 'default';
        document.body.style.userSelect = 'auto';
    }, []);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging.current || !containerRef.current) return;
        
        const containerRect = containerRef.current.getBoundingClientRect();
        let newWidth = e.clientX - containerRect.left;

        if (newWidth < minLeftWidth) newWidth = minLeftWidth;
        if (newWidth > maxLeftWidth) newWidth = maxLeftWidth;
        if (newWidth > containerRect.width - 100) newWidth = containerRect.width - 100;

        setLeftWidth(newWidth);
    }, [minLeftWidth, maxLeftWidth]);

    React.useEffect(() => {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [handleMouseMove, handleMouseUp]);

    return (
        <div ref={containerRef} className={`flex h-full w-full ${className}`} style={{ gap }}>
            <div style={{ width: leftWidth, flexShrink: 0 }} className="h-full overflow-auto">
                {leftPane}
            </div>
            
            <div 
                className="w-2 cursor-col-resize flex-shrink-0 relative group transition-colors"
                onMouseDown={handleMouseDown}
            >
                <div 
                    className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[2px] transition-colors"
                    style={{ backgroundColor: 'var(--border-color, rgba(255,255,255,0.1))' }}
                />
                <div 
                    className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[2px] opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ backgroundColor: accentColor }}
                />
            </div>
            
            <div className="flex-1 h-full overflow-auto min-w-[var(--sarak-split-pane-min-width,100px)]">
                {rightPane}
            </div>
        </div>
    );
};
