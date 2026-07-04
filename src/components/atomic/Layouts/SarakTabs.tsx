import React, { useState } from 'react';
import { useSarakUI } from '../../../core/Provider/SarakUIProvider';
import { useStructuralStyles } from '../hooks/useStructuralStyles';

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
    const { getFlexStyles } = useStructuralStyles();
    const [activeId, setActiveId] = useState(defaultActiveId || items[0]?.id);

    const activeColor = design?.primaryColor || 'var(--sarak-primary-color,#3b82f6)';
    const borderColor = 'var(--border-color,#334155))';
    const animFast = design?.animFast;
    const animDuration = typeof animFast === 'number' ? `${animFast}ms` : '200ms';

    const isHorizontal = alignment === 'horizontal';
    const outerFlex = getFlexStyles(isHorizontal ? 'column' : 'row', undefined, undefined, '0');
    // Nota: não reaproveita `getFlexStyles` aqui — ele sempre devolve `w-full`, e o tablist
    // vertical precisa manter largura intrínseca (é uma coluna lado a lado com o painel).
    const tablistDirection: React.CSSProperties['flexDirection'] = isHorizontal ? 'row' : 'column';

    return (
        <div className={`${outerFlex.className} h-full ${className}`} style={outerFlex.style}>
            <div
                className={`flex ${isHorizontal ? 'border-b' : 'border-r'}`}
                style={{ flexDirection: tablistDirection, borderColor }}
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
                            className={`text-sm font-medium transition-colors focus:outline-none focus:bg-white/5 hover:bg-white/5 ${
                                isHorizontal ? 'border-b-2 -mb-[1px]' : 'border-r-2 -mr-[1px] text-left'
                            }`}
                            style={{
                                borderColor: isActive ? activeColor : 'transparent',
                                color: isActive ? activeColor : 'inherit',
                                transitionDuration: animDuration,
                                paddingInline: 'var(--sarak-layout-gap-md, 16px)',
                                paddingBlock: 'calc(var(--sarak-layout-gap-md, 16px) * 0.75)'
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
            <div className={`flex-1 ${isHorizontal ? 'overflow-y-auto' : 'overflow-auto'}`} style={{ padding: 'var(--sarak-layout-gap-md, 16px)' }}>
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
