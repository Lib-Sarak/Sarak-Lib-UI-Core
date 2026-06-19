import React, { useState } from 'react';
import { useSarakUI } from '../../../core/Provider/SarakUIProvider';

export interface TabItem {
    id: string;
    label: React.ReactNode;
    content: React.ReactNode;
}

export interface SarakTabsProps {
    items: TabItem[];
    defaultActiveId?: string;
    alignment?: 'horizontal' | 'vertical';
    className?: string;
}

/**
 * Componente Atômico de Abas (Tabs).
 * Suporta alinhamento horizontal e vertical sem colapso de estilos, guiado pelo design token.
 */
export const SarakTabs: React.FC<SarakTabsProps> = ({
    items,
    defaultActiveId,
    alignment = 'horizontal',
    className = ''
}) => {
    const { design } = useSarakUI();
    const [activeId, setActiveId] = useState(defaultActiveId || items[0]?.id);

    const activeColor = design?.primaryColor || 'var(--sx-color-primary-base)';
    const borderColor = 'var(--sx-color-border-base, rgba(255,255,255,0.1))';
    const animFast = design?.animFast;
    const animDuration = typeof animFast === 'number' ? `${animFast}ms` : (animFast as string) || '200ms';

    const isHorizontal = alignment === 'horizontal';

    return (
        <div className={`flex ${isHorizontal ? 'flex-col' : 'flex-row'} w-full h-full ${className}`}>
            <div 
                className={`flex ${isHorizontal ? 'flex-row border-b' : 'flex-col border-r'}`} 
                style={{ borderColor }}
                role="tablist"
                aria-orientation={alignment}
            >
                {items.map(item => {
                    const isActive = activeId === item.id;
                    return (
                        <button
                            key={item.id}
                            role="tab"
                            aria-selected={isActive}
                            aria-controls={`panel-${item.id}`}
                            tabIndex={isActive ? 0 : -1}
                            onClick={() => setActiveId(item.id)}
                            className={`px-4 py-3 text-sm font-medium transition-colors focus:outline-none focus:bg-white/5 hover:bg-white/5 ${
                                isHorizontal ? 'border-b-2 -mb-[1px]' : 'border-r-2 -mr-[1px] text-left'
                            }`}
                            style={{ 
                                borderColor: isActive ? activeColor : 'transparent',
                                color: isActive ? activeColor : 'inherit',
                                transitionDuration: animDuration
                            }}
                            onKeyDown={(e) => {
                                // Keyboard nav implementation could go here
                                if (e.key === 'Enter' || e.key === ' ') {
                                    setActiveId(item.id);
                                }
                            }}
                        >
                            {item.label}
                        </button>
                    );
                })}
            </div>
            <div className={`flex-1 p-4 ${isHorizontal ? 'overflow-y-auto' : 'overflow-auto'}`}>
                {items.map(item => (
                    <div
                        key={item.id}
                        role="tabpanel"
                        id={`panel-${item.id}`}
                        aria-labelledby={item.id}
                        style={{ display: activeId === item.id ? 'block' : 'none' }}
                    >
                        {item.content}
                    </div>
                ))}
            </div>
        </div>
    );
};
