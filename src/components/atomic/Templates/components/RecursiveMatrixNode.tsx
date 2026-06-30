import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

import { PremiumSwitch } from './PremiumSwitch';
import { PremiumCheckbox } from './PremiumCheckbox';
import { resolveConfig } from './resolveConfig';
import type { MatrixTreeNode, RecursiveMatrixNodeProps } from './matrixTree';
import { useStructuralStyles } from '../../hooks/useStructuralStyles';

export type { MatrixTreeNode, RecursiveMatrixNodeProps } from './matrixTree';

/** Spinner padrão (sem dependência nova) quando o consumidor não fornece um ícone. */
const DefaultLazyIcon: React.FC = () => <span role="status" aria-live="polite" className="text-2xs uppercase tracking-widest text-[var(--text-muted,#94a3b8)] animate-pulse">Carregando…</span>;

/**
 * Nó genérico de árvore recursiva (RBAC/IAM e TreeView genérico). Tipado (Zero Any —
 * limpeza oportunista §0.6 ao tocar este arquivo na Onda 9). `loading` ativa o
 * `lazyLoadingIcon` declarativamente via JSON (Spec 12, Regra 5).
 */
export const RecursiveMatrixNode: React.FC<RecursiveMatrixNodeProps> = ({
    item,
    parentId,
    level,
    activeMapping,
    onToggle,
    manifest,
    searchTerm,
    lazyLoadingIcon,
    onExpandChange,
}) => {
    const { getFlexStyles, getContainerStyles } = useStructuralStyles();
    const config = resolveConfig(item as unknown as Record<string, unknown>, level, manifest);
    const [isExpanded, setIsExpanded] = useState(config.defaultExpanded);

    const isActive = activeMapping(parentId, item.id);
    const hasChildren = !!item.children && item.children.length > 0;

    // Força expansão de caminhos correspondentes à busca ativa.
    const showChildren = !!searchTerm || isExpanded;
    const IconComponent = config.icon;

    const toggleExpand = () => { setIsExpanded(!isExpanded); onExpandChange?.(item, !isExpanded); };

    // Detecta se os filhos devem se agrupar de forma compacta (inline/flex).
    const areChildrenCompact = useMemo(() => {
        if (!hasChildren) return false;
        return item.children!.every((c) => {
            const childConfig = resolveConfig(c as unknown as Record<string, unknown>, level + 1, manifest);
            return childConfig.variant === 'badge' || childConfig.variant === 'switch';
        });
    }, [item.children, level, manifest, hasChildren]);

    // Conteúdo expandido: ou o indicador de carregamento, ou os filhos recursivos.
    const loadingFlex = getFlexStyles('row', 'flex-start', 'flex-start', '0');
    const expandedContent = item.loading
        ? <div data-sarak-tree-loading="true" className={loadingFlex.className} style={{ ...loadingFlex.style, padding: 'var(--sarak-layout-gap-sm,8px) 0 var(--sarak-layout-gap-sm,8px) var(--sarak-layout-gap-sm,8px)' }}>{lazyLoadingIcon ?? <DefaultLazyIcon />}</div>
        : hasChildren
            ? item.children!.map((child) => (
                <RecursiveMatrixNode
                    key={child.id}
                    item={child}
                    parentId={parentId}
                    level={level + 1}
                    activeMapping={activeMapping}
                    onToggle={onToggle}
                    manifest={manifest}
                    searchTerm={searchTerm}
                    lazyLoadingIcon={lazyLoadingIcon}
                    onExpandChange={onExpandChange}
                />
            ))
            : null;

    const canExpandContent = showChildren && (hasChildren || !!item.loading);

    if (config.renderCustom) return <>{config.renderCustom(item, level, isActive, !!isExpanded, () => onToggle(parentId, item.id), toggleExpand)}</>;

    if (config.variant === 'badge') {
        const badgeFlex = getFlexStyles('row', 'flex-start', 'center', 'calc(var(--sarak-layout-gap-md,16px)*0.25)');
        return (
            <div
                onClick={() => onToggle(parentId, item.id)}
                style={{ ...badgeFlex.style, padding: 'calc(var(--sarak-layout-gap-md,16px)*0.25) var(--sarak-layout-gap-sm,8px)' }}
                className={`${badgeFlex.className} rounded-full border text-2xs font-bold uppercase transition-all cursor-pointer select-none ${
                    isActive
                    ? 'bg-[var(--sarak-primary-color-bg,rgba(59,130,246,0.1))] text-[var(--sarak-primary-color,#3b82f6)] border-[var(--border-color,#334155)] shadow-[0_0_8px_rgba(var(--sarak-primary-color,#3b82f6),0.15)]'
                    : 'bg-[var(--text-muted,#94a3b8)]/5 text-[var(--text-muted,#94a3b8)] border-[var(--border-color,#334155)] hover:bg-[var(--text-muted,#94a3b8)]/10 hover:text-[var(--color-theme-title,#ffffff)]'
                }`}
            >
                {IconComponent && <IconComponent size={10} />}
                <span>{item.name || item.id}</span>
            </div>
        );
    }

    if (config.variant === 'switch') {
        const switchFlex = getFlexStyles('row', 'space-between', 'center', '0');
        const switchInnerFlex = getFlexStyles('column', 'flex-start', 'flex-start', 'calc(var(--sarak-layout-gap-sm, 8px) * 0.5)');
        return (
            <div
                onClick={() => onToggle(parentId, item.id)}
                style={{ ...switchFlex.style, padding: 'var(--sarak-layout-gap-sm,8px) var(--sarak-layout-gap-md,16px)' }}
                className={`${switchFlex.className} rounded-lg border border-[var(--border-color,#334155)] bg-[var(--color-theme-card,#1e293b)]/40 hover:bg-[var(--text-muted,#94a3b8)]/5 transition-all cursor-pointer select-none min-w-[140px] flex-grow ${
                    isActive ? 'border-[var(--border-color,#334155)] bg-[var(--sarak-primary-color-bg,rgba(59,130,246,0.1))]/5' : ''
                }`}
            >
                <div className={switchInnerFlex.className} style={{ ...switchInnerFlex.style, paddingRight: 'var(--sarak-layout-gap-md,16px)' }}>
                    <span className={`text-2xs font-bold uppercase tracking-tight ${isActive ? 'text-[var(--sarak-primary-color,#3b82f6)]' : 'text-[var(--color-theme-title,#ffffff)]'}`}>
                        {item.name || item.id}
                    </span>
                    {item.description && <span className="text-3xs text-[var(--text-muted,#94a3b8)] line-clamp-1">{item.description}</span>}
                </div>
                <PremiumSwitch checked={isActive} onChange={() => onToggle(parentId, item.id)} />
            </div>
        );
    }

    if (config.variant === 'card') {
        const cardFlex = getFlexStyles('column', 'flex-start', 'stretch', '0');
        const cardHeaderFlex = getFlexStyles('row', 'space-between', 'center', '0');
        const cardTitleFlex = getFlexStyles('row', 'flex-start', 'center', 'var(--sarak-layout-gap-md,16px)');
        const cardDescFlex = getFlexStyles('column', 'flex-start', 'flex-start', '0');
        
        return (
            <div
                style={{ ...cardFlex.style, padding: 'var(--sarak-layout-gap-md,16px)' }}
                className={`${cardFlex.className} rounded-xl border transition-all ${
                    isActive
                    ? 'bg-[var(--sarak-primary-color-bg,rgba(59,130,246,0.1))]/5 border-[var(--border-color,#334155)] shadow-[0_4px_20px_rgba(0,0,0,0.2)]'
                    : 'bg-[var(--color-theme-card,#1e293b)]/40 border-[var(--border-color,#334155)] hover:border-[var(--text-muted,#94a3b8)]/30'
                }`}
            >
                <div className={cardHeaderFlex.className} style={cardHeaderFlex.style}>
                    <div
                        onClick={() => config.hasExpand && toggleExpand()}
                        style={cardTitleFlex.style}
                        className={`${cardTitleFlex.className} select-none flex-grow ${config.hasExpand ? 'cursor-pointer' : ''}`}
                    >
                        {config.hasExpand && (
                            <motion.div
                                animate={{ rotate: showChildren ? 180 : 0 }}
                                className="text-[var(--text-muted,#94a3b8)]"
                            >
                                <ChevronDown size={14} />
                            </motion.div>
                        )}
                        {IconComponent && (
                            <div className="w-7 h-7 rounded-lg bg-[var(--text-muted,#94a3b8)]/10 flex items-center justify-center text-[var(--text-muted,#94a3b8)]">
                                <IconComponent size={14} />
                            </div>
                        )}
                        <div className={cardDescFlex.className} style={cardDescFlex.style}>
                            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-theme-title,#ffffff)]">
                                {item.name || item.id}
                            </span>
                            {item.description && (
                                <span className="text-2xs text-[var(--text-muted,#94a3b8)]">{item.description}</span>
                            )}
                        </div>
                    </div>
                    {config.hasToggle && (
                        <PremiumCheckbox checked={isActive} onChange={() => onToggle(parentId, item.id)} />
                    )}
                </div>

                {canExpandContent && (
                    <div 
                        className={areChildrenCompact ? "flex flex-wrap bg-[var(--color-theme-card,#1e293b)]/50 rounded-lg border border-[var(--border-color,#334155)]" : `${getContainerStyles().className} border-l border-[var(--border-color,#334155)]`}
                        style={areChildrenCompact ? { gap: 'var(--sarak-layout-gap-sm,8px)', padding: 'var(--sarak-layout-gap-md,16px)', marginTop: 'var(--sarak-layout-gap-md,16px)' } : { gap: 'var(--sarak-layout-gap-sm,8px)', marginLeft: 'var(--sarak-layout-gap-md,16px)', paddingLeft: 'var(--sarak-layout-gap-sm,8px)', marginTop: 'var(--sarak-layout-gap-md,16px)' }}
                    >
                        {expandedContent}
                    </div>
                )}
            </div>
        );
    }

    if (config.variant === 'row') {
        const rowFlex = getFlexStyles('column', 'flex-start', 'stretch', '0');
        const rowHeaderFlex = getFlexStyles('row', 'space-between', 'center', '0');
        const rowTitleFlex = getFlexStyles('row', 'flex-start', 'center', 'var(--sarak-layout-gap-sm,8px)');
        
        return (
            <div className={`${rowFlex.className} border-b border-[var(--border-color,#334155)] last:border-0`} style={{ ...rowFlex.style, padding: 'var(--sarak-layout-gap-sm,8px) 0' }}>
                <div className={rowHeaderFlex.className} style={{ ...rowHeaderFlex.style, padding: '0 var(--sarak-layout-gap-sm,8px)' }}>
                    <div
                        onClick={() => config.hasExpand && toggleExpand()}
                        className={`${rowTitleFlex.className} select-none flex-grow`}
                        style={{ ...rowTitleFlex.style, padding: 'calc(var(--sarak-layout-gap-md,16px)*0.25) 0', cursor: config.hasExpand ? 'pointer' : 'default' }}
                    >
                        {config.hasExpand && (
                            <motion.div
                                animate={{ rotate: showChildren ? 180 : 0 }}
                                className="text-[var(--text-muted,#94a3b8)]"
                            >
                                <ChevronDown size={12} />
                            </motion.div>
                        )}
                        <span className={`text-xs font-bold uppercase tracking-tight ${isActive ? 'text-[var(--sarak-primary-color,#3b82f6)]' : 'text-[var(--color-theme-title,#ffffff)]'}`}>
                            {item.name || item.id}
                        </span>
                        {item.description && <span className="text-2xs text-[var(--text-muted,#94a3b8)] hidden sm:inline">- {item.description}</span>}
                    </div>
                    {config.hasToggle && (
                        <PremiumCheckbox checked={isActive} onChange={() => onToggle(parentId, item.id)} isSmall />
                    )}
                </div>

                {canExpandContent && (
                    <div 
                        className={areChildrenCompact ? "flex flex-wrap bg-[var(--color-theme-card,#1e293b)]/50 rounded-lg border border-[var(--border-color,#334155)]" : `${getContainerStyles().className} border-l border-[var(--border-color,#334155)]`}
                        style={areChildrenCompact ? { gap: 'var(--sarak-layout-gap-sm,8px)', padding: 'var(--sarak-layout-gap-md,16px)', marginTop: 'var(--sarak-layout-gap-sm,8px)', marginLeft: 'calc(var(--sarak-layout-gap-md,16px)*2)' } : { gap: 'var(--sarak-layout-gap-sm,8px)', marginLeft: 'calc(var(--sarak-layout-gap-md,16px)*2)', paddingLeft: 'var(--sarak-layout-gap-sm,8px)', marginTop: 'var(--sarak-layout-gap-sm,8px)' }}
                    >
                        {expandedContent}
                    </div>
                )}
            </div>
        );
    }

    const defaultFlex = getFlexStyles('column', 'flex-start', 'stretch', '0');
    const defaultHeaderFlex = getFlexStyles('row', 'space-between', 'center', '0');
    
    return (
        <div className={defaultFlex.className} style={{ ...defaultFlex.style, padding: 'calc(var(--sarak-layout-gap-md,16px)*0.25) 0' }}>
            <div className={defaultHeaderFlex.className} style={defaultHeaderFlex.style}>
                <span className="text-2xs text-[var(--color-theme-title,#ffffff)]">{item.name || item.id}</span>
                {config.hasToggle && (
                    <PremiumCheckbox checked={isActive} onChange={() => onToggle(parentId, item.id)} isSmall />
                )}
            </div>
            {canExpandContent && (
                <div className={`${getContainerStyles().className} border-l border-[var(--border-color,#334155)]`} style={{ marginLeft: 'var(--sarak-layout-gap-md,16px)', paddingLeft: 'var(--sarak-layout-gap-sm,8px)' }}>
                    {expandedContent}
                </div>
            )}
        </div>
    );
};
