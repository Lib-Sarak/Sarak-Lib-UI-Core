import React, { useId } from 'react';
import { mergeSarakClasses } from '../hooks/mergeSarakClasses';
import { SarakButton } from '../Buttons/SarakButton';
import { SarakLink } from '../Navigation/SarakLink';
import { sarakTabElementId, sarakTabPanelElementId } from './tabIds';
import {
    TabLeading,
    TabTrailing,
    tabItemClassName,
    tabItemStyle,
    tabsListClassName,
    tabsListStyle,
    type SarakTabsVariant,
} from './tabsStyling';

export interface SarakTabItem {
    id: string;
    label: React.ReactNode;
    icon?: React.ReactNode;
    disabled?: boolean;
    /** Destino da aba-rota. Com `href` em alguma aba, a lista vira um `<nav>` de links com `aria-current="page"` (aba que troca de rota é navegação, não `role="tab"`). */
    href?: string;
    /** Contador lido junto do rótulo pelo leitor de tela. Omitido, a aba não mostra contador. */
    count?: number;
    /** `id` do painel que a aba controla. Omitido, `${idPrefix}-panel-${id}`. */
    panelId?: string;
}

export interface SarakTabsProps {
    tabs: SarakTabItem[];
    activeTab: string;
    /** Chamado ao escolher uma aba. Opcional: aba-rota pode usar só `onNavigate`. */
    onChange?: (tabId: string) => void;
    /** Com `href` na aba, o clique simples não recarrega a página e chama isto. Omitido, o navegador segue o link. */
    onNavigate?: (href: string, tab: SarakTabItem) => void;
    /** Prefixo dos `id` da aba e do painel (`SarakTabPanel idPrefix`). Omitido, gerado. */
    idPrefix?: string;
    /** Estilo de exibição das abas */
    variant?: SarakTabsVariant;
    /** Preencher a largura toda? */
    fullWidth?: boolean;
    className?: string;
    listClassName?: string;
}

export const SarakTabs: React.FC<SarakTabsProps> = ({
    tabs,
    activeTab,
    onChange,
    onNavigate,
    idPrefix,
    variant = 'underlined',
    fullWidth = false,
    className,
    listClassName,
}) => {
    const generatedPrefix = useId();
    const prefix = idPrefix ?? generatedPrefix;
    const isNavigation = tabs.some((tab) => tab.href !== undefined);
    // Só aponta para um painel que o consumidor pode ter: com `panelId` ou com `idPrefix` (o par do `SarakTabPanel`).
    const panelControlId = (tab: SarakTabItem): string | undefined =>
        tab.panelId ?? (idPrefix === undefined ? undefined : sarakTabPanelElementId(idPrefix, tab.id));

    // Navegação por teclado (Spec 41, Regra 3 — WAI-ARIA tabs): setas movem para a aba
    // habilitada anterior/próxima; Home/End vão para a primeira/última. Pula desabilitadas.
    const moveTo = (start: number, step: number): void => {
        const total = tabs.length;
        let idx = start;
        for (let i = 0; i < total; i++) {
            idx = (idx + step + total) % total;
            if (tabs[idx] && !tabs[idx].disabled) {
                onChange?.(tabs[idx].id);
                return;
            }
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, index: number): void => {
        if (e.key === 'ArrowRight') { e.preventDefault(); moveTo(index, 1); return; }
        if (e.key === 'ArrowLeft') { e.preventDefault(); moveTo(index, -1); return; }
        if (e.key === 'Home') { e.preventDefault(); moveTo(-1, 1); return; }
        if (e.key === 'End') { e.preventDefault(); moveTo(tabs.length, -1); }
    };

    // O contador entra DENTRO do nome acessível ("Propostas 3"); o espaço separa as palavras para o
    // leitor de tela e some no layout flex.
    const renderLabel = (tab: SarakTabItem): React.ReactNode => (
        <>
            {tab.label}
            {tab.count !== undefined && (
                <>
                    {' '}
                    <span className="text-xs opacity-80 tabular-nums">{tab.count}</span>
                </>
            )}
        </>
    );

    const renderItem = (tab: SarakTabItem, index: number): React.ReactElement => {
        const isActive = activeTab === tab.id;
        const isDisabled = Boolean(tab.disabled);
        const itemClassName = tabItemClassName(variant, isActive, isDisabled, fullWidth);
        const leading = <TabLeading variant={variant} isActive={isActive} icon={tab.icon} />;
        const trailing = <TabTrailing variant={variant} isActive={isActive} />;

        if (isNavigation && tab.href !== undefined && !isDisabled) {
            const href = tab.href;
            return (
                <SarakLink
                    key={tab.id}
                    href={href}
                    aria-current={isActive ? 'page' : undefined}
                    className={`${itemClassName} no-underline hover:no-underline`}
                    style={tabItemStyle(variant)}
                    onClick={() => onChange?.(tab.id)}
                    onNavigate={onNavigate ? () => onNavigate(href, tab) : undefined}
                >
                    {leading}
                    {renderLabel(tab)}
                    {trailing}
                </SarakLink>
            );
        }

        // Composição atômica (R10): `SarakButton` tolera montar sem Provider. Os indicadores
        // (`motion.div`, absolutos) viajam em `leftIcon`/`rightIcon`; o rótulo vai em `children`.
        return (
            <SarakButton
                key={tab.id}
                {...(isNavigation ? {} : {
                    role: 'tab',
                    id: sarakTabElementId(prefix, tab.id),
                    'aria-selected': isActive,
                    'aria-controls': panelControlId(tab),
                    tabIndex: isActive ? 0 : -1,
                    onKeyDown: (e: React.KeyboardEvent<HTMLButtonElement>) => handleKeyDown(e, index),
                })}
                aria-current={isNavigation && isActive ? 'page' : undefined}
                aria-disabled={isDisabled}
                disabled={isDisabled}
                variant="ghost"
                onClick={() => !isDisabled && onChange?.(tab.id)}
                style={tabItemStyle(variant)}
                className={itemClassName}
                leftIcon={leading}
                rightIcon={trailing}
            >
                {renderLabel(tab)}
            </SarakButton>
        );
    };

    const list = (
        <div
            className={tabsListClassName(variant, listClassName)}
            style={tabsListStyle(variant)}
            role={isNavigation ? undefined : 'tablist'}
        >
            {tabs.map(renderItem)}
        </div>
    );

    return (
        <div className={mergeSarakClasses("w-full flex", className)} style={{ flexDirection: 'column' }}>
            {isNavigation ? <nav>{list}</nav> : list}
        </div>
    );
};
