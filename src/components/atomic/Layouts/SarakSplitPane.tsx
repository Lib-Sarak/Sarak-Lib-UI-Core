import React, { useState, useRef, useCallback } from 'react';
import { useSarakUI } from '../../../core/Provider/SarakUIProvider';
import { useSarakDevice } from '../../../core/Provider/DeviceProvider';

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
 *
 * Multidispositivo por padrão (Spec 40.3 — L2): no celular (`useSarakDevice`) os painéis
 * **empilham** em coluna full-width (sem a divisória de arraste, que não faz sentido no
 * touch estreito) — nenhum painel de largura fixa estoura a página. Em tablet/desktop
 * mantém o split redimensionável.
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
    const device = useSarakDevice();
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

    // Celular: empilha em coluna full-width (sem divisória de arraste) — zero overflow.
    if (device === 'smartphone') {
        return (
            <div className={className} style={{ display: 'flex', flexDirection: 'column', gap, width: '100%' }}>
                <div className="w-full overflow-auto">{leftPane}</div>
                <div className="w-full overflow-auto">{rightPane}</div>
            </div>
        );
    }

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
                    className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[length:var(--sarak-border-width,2px)] transition-colors"
                    style={{ backgroundColor: 'var(--border-color, rgba(255,255,255,0.1))' }}
                />
                <div 
                    className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[length:var(--sarak-border-width,2px)] opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ backgroundColor: accentColor }}
                />
            </div>
            
            <div className="flex-1 h-full overflow-auto min-w-[var(--sarak-split-pane-min-width,100px)]">
                {rightPane}
            </div>
        </div>
    );
};
