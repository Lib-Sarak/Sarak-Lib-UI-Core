import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

import { PremiumSwitch } from './PremiumSwitch';
import { PremiumCheckbox } from './PremiumCheckbox';
import { resolveConfig } from './resolveConfig';
import type { MatrixTreeNode, RecursiveMatrixNodeProps } from './matrixTree';

export type { MatrixTreeNode, RecursiveMatrixNodeProps } from './matrixTree';

/** Spinner padrão (sem dependência nova) quando o consumidor não fornece um ícone. */
const DefaultLazyIcon: React.FC = () => (
    <span role="status" aria-live="polite" className="text-2xs uppercase tracking-widest text-[var(--sx-color-text-muted)] animate-pulse">Carregando…</span>
);

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
    const config = resolveConfig(item as unknown as Record<string, unknown>, level, manifest);
    const [isExpanded, setIsExpanded] = useState(config.defaultExpanded);

    const isActive = activeMapping(parentId, item.id);
    const hasChildren = !!item.children && item.children.length > 0;

    // Força expansão de caminhos correspondentes à busca ativa.
    const showChildren = !!searchTerm || isExpanded;
    const IconComponent = config.icon;

    const toggleExpand = () => {
        const next = !isExpanded;
        setIsExpanded(next);
        onExpandChange?.(item, next);
    };

    // Detecta se os filhos devem se agrupar de forma compacta (inline/flex).
    const areChildrenCompact = useMemo(() => {
        if (!hasChildren) return false;
        return item.children!.every((c) => {
            const childConfig = resolveConfig(c as unknown as Record<string, unknown>, level + 1, manifest);
            return childConfig.variant === 'badge' || childConfig.variant === 'switch';
        });
    }, [item.children, level, manifest, hasChildren]);

    // Conteúdo expandido: ou o indicador de carregamento, ou os filhos recursivos.
    const expandedContent = item.loading
        ? <div data-sarak-tree-loading="true" className="py-2 pl-2">{lazyLoadingIcon ?? <DefaultLazyIcon />}</div>
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

    if (config.renderCustom) {
        return (
            <>
                {config.renderCustom(
                    item,
                    level,
                    isActive,
                    !!isExpanded,
                    () => onToggle(parentId, item.id),
                    toggleExpand,
                )}
            </>
        );
    }

    if (config.variant === 'badge') {
        return (
            <div
                onClick={() => onToggle(parentId, item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-bold uppercase transition-all cursor-pointer select-none ${
                    isActive
                    ? 'bg-[var(--sx-color-primary-surface)] text-[var(--sx-color-primary-base)] border-[var(--sx-color-border-base)] shadow-[0_0_8px_rgba(var(--sx-color-primary-base),0.15)]'
                    : 'bg-[var(--sx-color-text-muted)]/5 text-[var(--sx-color-text-muted)] border-[var(--sx-color-border-base)] hover:bg-[var(--sx-color-text-muted)]/10 hover:text-[var(--sx-color-text-title)]'
                }`}
            >
                {IconComponent && <IconComponent size={10} />}
                <span>{item.name || item.id}</span>
            </div>
        );
    }

    if (config.variant === 'switch') {
        return (
            <div
                onClick={() => onToggle(parentId, item.id)}
                className={`flex items-center justify-between px-3 py-2 rounded-lg border border-[var(--sx-color-border-base)] bg-[var(--sx-color-surface-base)]/40 hover:bg-[var(--sx-color-text-muted)]/5 transition-all cursor-pointer select-none min-w-[140px] flex-grow ${
                    isActive ? 'border-[var(--sx-color-border-base)] bg-[var(--sx-color-primary-surface)]/5' : ''
                }`}
            >
                <div className="flex flex-col gap-0.5 pr-4">
                    <span className={`text-[10px] font-bold uppercase tracking-tight ${isActive ? 'text-[var(--sx-color-primary-base)]' : 'text-[var(--sx-color-text-title)]'}`}>
                        {item.name || item.id}
                    </span>
                    {item.description && (
                        <span className="text-[9px] text-[var(--sx-color-text-muted)] line-clamp-1">{item.description}</span>
                    )}
                </div>
                <PremiumSwitch checked={isActive} onChange={() => onToggle(parentId, item.id)} />
            </div>
        );
    }

    if (config.variant === 'card') {
        return (
            <div
                className={`flex flex-col w-full p-4 rounded-xl border transition-all ${
                    isActive
                    ? 'bg-[var(--sx-color-primary-surface)]/5 border-[var(--sx-color-border-base)] shadow-[0_4px_20px_rgba(0,0,0,0.2)]'
                    : 'bg-[var(--sx-color-surface-base)]/40 border-[var(--sx-color-border-base)] hover:border-[var(--sx-color-text-muted)]/30'
                }`}
            >
                <div className="flex items-center justify-between">
                    <div
                        onClick={() => config.hasExpand && toggleExpand()}
                        className={`flex items-center gap-3 select-none flex-grow ${config.hasExpand ? 'cursor-pointer' : ''}`}
                    >
                        {config.hasExpand && (
                            <motion.div
                                animate={{ rotate: showChildren ? 180 : 0 }}
                                className="text-[var(--sx-color-text-muted)]"
                            >
                                <ChevronDown size={14} />
                            </motion.div>
                        )}
                        {IconComponent && (
                            <div className="w-7 h-7 rounded-lg bg-[var(--sx-color-text-muted)]/10 flex items-center justify-center text-[var(--sx-color-text-muted)]">
                                <IconComponent size={14} />
                            </div>
                        )}
                        <div className="flex flex-col">
                            <span className="text-xs font-bold uppercase tracking-wider text-[var(--sx-color-text-title)]">
                                {item.name || item.id}
                            </span>
                            {item.description && (
                                <span className="text-2xs text-[var(--sx-color-text-muted)]">{item.description}</span>
                            )}
                        </div>
                    </div>
                    {config.hasToggle && (
                        <PremiumCheckbox checked={isActive} onChange={() => onToggle(parentId, item.id)} />
                    )}
                </div>

                {canExpandContent && (
                    <div className={areChildrenCompact ? "flex flex-wrap gap-2 p-3 bg-[var(--sx-color-surface-base)]/50 rounded-lg mt-3 border border-[var(--sx-color-border-base)]" : "flex flex-col border-l border-[var(--sx-color-border-base)] ml-3 pl-2 mt-3 gap-2"}>
                        {expandedContent}
                    </div>
                )}
            </div>
        );
    }

    if (config.variant === 'row') {
        return (
            <div className="flex flex-col w-full border-b border-[var(--sx-color-border-base)] last:border-0 py-2">
                <div className="flex items-center justify-between px-2">
                    <div
                        onClick={() => config.hasExpand && toggleExpand()}
                        className={`flex items-center gap-2 select-none flex-grow py-1 ${config.hasExpand ? 'cursor-pointer' : ''}`}
                    >
                        {config.hasExpand && (
                            <motion.div
                                animate={{ rotate: showChildren ? 180 : 0 }}
                                className="text-[var(--sx-color-text-muted)]"
                            >
                                <ChevronDown size={12} />
                            </motion.div>
                        )}
                        <span className={`text-[11px] font-bold uppercase tracking-tight ${isActive ? 'text-[var(--sx-color-primary-base)]' : 'text-[var(--sx-color-text-title)]'}`}>
                            {item.name || item.id}
                        </span>
                        {item.description && (
                            <span className="text-[10px] text-[var(--sx-color-text-muted)] hidden sm:inline">- {item.description}</span>
                        )}
                    </div>
                    {config.hasToggle && (
                        <PremiumCheckbox checked={isActive} onChange={() => onToggle(parentId, item.id)} isSmall />
                    )}
                </div>

                {canExpandContent && (
                    <div className={areChildrenCompact ? "flex flex-wrap gap-2 p-3 bg-[var(--sx-color-surface-base)]/50 rounded-lg mt-2 ml-6 border border-[var(--sx-color-border-base)]" : "flex flex-col border-l border-[var(--sx-color-border-base)] ml-6 pl-2 mt-2 gap-2"}>
                        {expandedContent}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="flex flex-col w-full py-1">
            <div className="flex items-center justify-between">
                <span className="text-2xs text-[var(--sx-color-text-title)]">{item.name || item.id}</span>
                {config.hasToggle && (
                    <PremiumCheckbox checked={isActive} onChange={() => onToggle(parentId, item.id)} isSmall />
                )}
            </div>
            {canExpandContent && (
                <div className="flex flex-col border-l border-[var(--sx-color-border-base)] ml-3 pl-2">
                    {expandedContent}
                </div>
            )}
        </div>
    );
};
