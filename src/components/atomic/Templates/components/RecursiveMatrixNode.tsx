import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Check, X } from 'lucide-react';
import { MatrixNodeConfig, SarakMatrixManifest } from '../SarakExpandableMatrix';

import { PremiumSwitch } from './PremiumSwitch';
import { PremiumCheckbox } from './PremiumCheckbox';
import { resolveConfig } from './resolveConfig';

export const RecursiveMatrixNode: React.FC<{
    item: any;
    parentId: string;
    level: number;
    activeMapping: (parentId: string, subItemId: string) => boolean;
    onToggle: (parentId: string, subItemId: string) => void;
    manifest?: SarakMatrixManifest;
    searchTerm?: string;
}> = ({ item, parentId, level, activeMapping, onToggle, manifest, searchTerm }) => {
    const config = resolveConfig(item, level, manifest);
    const [isExpanded, setIsExpanded] = useState(config.defaultExpanded);

    const isActive = activeMapping(parentId, item.id);
    const hasChildren = item.children && item.children.length > 0;
    
    // Força expansão de caminhos correspondentes a busca ativa
    const showChildren = !!searchTerm || isExpanded;
    const IconComponent = config.icon;

    // Detecta se os filhos devem se agrupar de forma compacta (inline/flex)
    const areChildrenCompact = useMemo(() => {
        if (!hasChildren) return false;
        return item.children.every((c: any) => {
            const childConfig = resolveConfig(c, level + 1, manifest);
            return childConfig.variant === 'badge' || childConfig.variant === 'switch';
        });
    }, [item.children, level, manifest, hasChildren]);

    if (config.renderCustom) {
        return (
            <>
                {config.renderCustom(
                    item,
                    level,
                    isActive,
                    !!isExpanded,
                    () => onToggle(parentId, item.id),
                    () => setIsExpanded(!isExpanded)
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
                        onClick={() => config.hasExpand && setIsExpanded(!isExpanded)}
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

                {hasChildren && showChildren && (
                    <div className={areChildrenCompact ? "flex flex-wrap gap-2 p-3 bg-[var(--sx-color-surface-base)]/50 rounded-lg mt-3 border border-[var(--sx-color-border-base)]" : "flex flex-col border-l border-[var(--sx-color-border-base)] ml-3 pl-2 mt-3 gap-2"}>
                        {item.children.map((child: any) => (
                            <RecursiveMatrixNode 
                                key={child.id}
                                item={child}
                                parentId={parentId}
                                level={level + 1}
                                activeMapping={activeMapping}
                                onToggle={onToggle}
                                manifest={manifest}
                                searchTerm={searchTerm}
                            />
                        ))}
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
                        onClick={() => config.hasExpand && setIsExpanded(!isExpanded)}
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

                {hasChildren && showChildren && (
                    <div className={areChildrenCompact ? "flex flex-wrap gap-2 p-3 bg-[var(--sx-color-surface-base)]/50 rounded-lg mt-2 ml-6 border border-[var(--sx-color-border-base)]" : "flex flex-col border-l border-[var(--sx-color-border-base)] ml-6 pl-2 mt-2 gap-2"}>
                        {item.children.map((child: any) => (
                            <RecursiveMatrixNode 
                                key={child.id}
                                item={child}
                                parentId={parentId}
                                level={level + 1}
                                activeMapping={activeMapping}
                                onToggle={onToggle}
                                manifest={manifest}
                                searchTerm={searchTerm}
                            />
                        ))}
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
            {hasChildren && showChildren && (
                <div className="flex flex-col border-l border-[var(--sx-color-border-base)] ml-3 pl-2">
                    {item.children.map((child: any) => (
                        <RecursiveMatrixNode 
                            key={child.id}
                            item={child}
                            parentId={parentId}
                            level={level + 1}
                            activeMapping={activeMapping}
                            onToggle={onToggle}
                            manifest={manifest}
                            searchTerm={searchTerm}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
