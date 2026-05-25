import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, Check, X, Shield, Info } from 'lucide-react';

export interface MatrixNodeConfig {
    /** Variante visual de renderização do nó */
    variant?: 'card' | 'row' | 'badge' | 'switch' | 'clean';
    /** Se exibe checkbox/toggle para ativar/desativar */
    hasToggle?: boolean;
    /** Se o nó é expansível/colapsável */
    hasExpand?: boolean;
    /** Se o nó deve iniciar expandido */
    defaultExpanded?: boolean;
    /** Ícone customizado (Lucide ou elemento) */
    icon?: React.ComponentType<any>;
    /** Renderizador totalmente customizado para controle total */
    renderCustom?: (
        node: any,
        level: number,
        isActive: boolean,
        isExpanded: boolean,
        onToggle: () => void,
        onToggleExpand: () => void
    ) => React.ReactNode;
}

export interface SarakMatrixManifest {
    /** Mapeamento por nível de profundidade (0 para raiz, 1 para filhos, 2 para netos, etc.) */
    levels?: Record<number, MatrixNodeConfig>;
    /** Mapeamento dinâmico pelo atributo `node.type` */
    types?: Record<string, MatrixNodeConfig>;
    /** Configurações fallback padrão */
    default?: MatrixNodeConfig;
}

export interface SarakExpandableMatrixProps {
    /** Itens principais (ex: Roles/Papéis) */
    data: any[];
    /** Todos os sub-itens possíveis (ex: Todas as Permissões) */
    subItems: any[];
    /** Função para checar se um sub-item está ativo em um item pai */
    activeMapping: (parentId: string, subItemId: string) => boolean;
    /** Callback disparado ao clicar no toggle */
    onToggle: (parentId: string, subItemId: string) => void;
    /** Renderizador customizado para o cabeçalho de cada item pai */
    renderItemHeader?: (item: any) => React.ReactNode;
    /** Manifesto opcional de mapeamento recursivo para layout IAM/RBAC avançado */
    manifest?: SarakMatrixManifest;
}

export interface ResolvedNodeConfig {
    variant: 'card' | 'row' | 'badge' | 'switch' | 'clean';
    hasToggle: boolean;
    hasExpand: boolean;
    defaultExpanded: boolean;
    icon?: React.ComponentType<any>;
    renderCustom?: MatrixNodeConfig['renderCustom'];
}

const resolveConfig = (node: any, level: number, manifest?: SarakMatrixManifest): ResolvedNodeConfig => {
    const fallback: ResolvedNodeConfig = {
        variant: level === 0 ? 'card' : 'row',
        hasToggle: true,
        hasExpand: !!(node.children && node.children.length > 0),
        defaultExpanded: false
    };

    if (!manifest) return fallback;

    const typeConfig = node.type ? manifest.types?.[node.type] : undefined;
    const levelConfig = manifest.levels?.[level];
    const defaultConfig = manifest.default;

    return {
        variant: typeConfig?.variant ?? levelConfig?.variant ?? defaultConfig?.variant ?? fallback.variant,
        hasToggle: typeConfig?.hasToggle ?? levelConfig?.hasToggle ?? defaultConfig?.hasToggle ?? fallback.hasToggle,
        hasExpand: typeConfig?.hasExpand ?? levelConfig?.hasExpand ?? defaultConfig?.hasExpand ?? fallback.hasExpand,
        defaultExpanded: typeConfig?.defaultExpanded ?? levelConfig?.defaultExpanded ?? defaultConfig?.defaultExpanded ?? fallback.defaultExpanded,
        icon: typeConfig?.icon ?? levelConfig?.icon ?? defaultConfig?.icon,
        renderCustom: typeConfig?.renderCustom ?? levelConfig?.renderCustom ?? defaultConfig?.renderCustom
    };
};

const PremiumSwitch: React.FC<{ checked: boolean; onChange: () => void }> = ({ checked, onChange }) => (
    <div 
        onClick={(e) => { e.stopPropagation(); onChange(); }}
        className={`w-9 h-5 rounded-full p-0.5 transition-all cursor-pointer flex items-center ${
            checked ? 'bg-[var(--theme-primary)] shadow-[0_0_10px_rgba(var(--theme-primary-rgb),0.3)]' : 'bg-[var(--theme-muted)]/10'
        }`}
    >
        <motion.div 
            layout
            className="w-4 h-4 rounded-full bg-white shadow-md"
            animate={{ x: checked ? 16 : 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
    </div>
);

const PremiumCheckbox: React.FC<{ checked: boolean; onChange: () => void; isSmall?: boolean }> = ({ checked, onChange, isSmall }) => (
    <div 
        onClick={(e) => { e.stopPropagation(); onChange(); }}
        className={`rounded flex items-center justify-center transition-all cursor-pointer flex-shrink-0 ${
            isSmall ? 'w-4 h-4' : 'w-5 h-5'
        } ${
            checked 
            ? 'bg-[var(--theme-primary)] text-[var(--theme-on-primary)] shadow-[0_0_10px_rgba(var(--theme-primary-rgb),0.5)]' 
            : 'bg-[var(--theme-muted)]/10 text-[var(--theme-muted)]/50 hover:bg-[var(--theme-muted)]/20 hover:text-[var(--theme-muted)]'
        }`}
    >
        {checked ? <Check size={isSmall ? 10 : 12} strokeWidth={3} /> : <X size={isSmall ? 8 : 10} />}
    </div>
);

const RecursiveMatrixNode: React.FC<{
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
                    ? 'bg-[var(--theme-primary-10)] text-[var(--theme-primary)] border-[var(--theme-primary-30)] shadow-[0_0_8px_rgba(var(--theme-primary-rgb),0.15)]'
                    : 'bg-[var(--theme-muted)]/5 text-[var(--theme-muted)] border-[var(--theme-border)] hover:bg-[var(--theme-muted)]/10 hover:text-[var(--theme-title)]'
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
                className={`flex items-center justify-between px-3 py-2 rounded-lg border border-[var(--theme-border)] bg-[var(--theme-card)]/40 hover:bg-[var(--theme-muted)]/5 transition-all cursor-pointer select-none min-w-[140px] flex-grow ${
                    isActive ? 'border-[var(--theme-primary-20)] bg-[var(--theme-primary-10)]/5' : ''
                }`}
            >
                <div className="flex flex-col gap-0.5 pr-4">
                    <span className={`text-[10px] font-bold uppercase tracking-tight ${isActive ? 'text-[var(--theme-primary)]' : 'text-[var(--theme-title)]'}`}>
                        {item.name || item.id}
                    </span>
                    {item.description && (
                        <span className="text-[9px] text-[var(--theme-muted)] line-clamp-1">{item.description}</span>
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
                    ? 'bg-[var(--theme-primary-10)]/5 border-[var(--theme-primary-30)] shadow-[0_4px_20px_rgba(0,0,0,0.2)]'
                    : 'bg-[var(--theme-card)]/40 border-[var(--theme-border)] hover:border-[var(--theme-muted)]/30'
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
                                className="text-[var(--theme-muted)]"
                            >
                                <ChevronDown size={14} />
                            </motion.div>
                        )}
                        {IconComponent && (
                            <div className="w-7 h-7 rounded-lg bg-[var(--theme-muted)]/10 flex items-center justify-center text-[var(--theme-muted)]">
                                <IconComponent size={14} />
                            </div>
                        )}
                        <div className="flex flex-col">
                            <span className="text-xs font-bold uppercase tracking-wider text-[var(--theme-title)]">
                                {item.name || item.id}
                            </span>
                            {item.description && (
                                <span className="text-2xs text-[var(--theme-muted)]">{item.description}</span>
                            )}
                        </div>
                    </div>
                    {config.hasToggle && (
                        <PremiumCheckbox checked={isActive} onChange={() => onToggle(parentId, item.id)} />
                    )}
                </div>

                {hasChildren && showChildren && (
                    <div className={areChildrenCompact ? "flex flex-wrap gap-2 p-3 bg-[var(--theme-card)]/50 rounded-lg mt-3 border border-[var(--theme-border)]" : "flex flex-col border-l border-[var(--theme-border)] ml-3 pl-2 mt-3 gap-2"}>
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
            <div className="flex flex-col w-full border-b border-[var(--theme-border)] last:border-0 py-2">
                <div className="flex items-center justify-between px-2">
                    <div 
                        onClick={() => config.hasExpand && setIsExpanded(!isExpanded)}
                        className={`flex items-center gap-2 select-none flex-grow py-1 ${config.hasExpand ? 'cursor-pointer' : ''}`}
                    >
                        {config.hasExpand && (
                            <motion.div
                                animate={{ rotate: showChildren ? 180 : 0 }}
                                className="text-[var(--theme-muted)]"
                            >
                                <ChevronDown size={12} />
                            </motion.div>
                        )}
                        <span className={`text-[11px] font-bold uppercase tracking-tight ${isActive ? 'text-[var(--theme-primary)]' : 'text-[var(--theme-title)]'}`}>
                            {item.name || item.id}
                        </span>
                        {item.description && (
                            <span className="text-[10px] text-[var(--theme-muted)] hidden sm:inline">- {item.description}</span>
                        )}
                    </div>
                    {config.hasToggle && (
                        <PremiumCheckbox checked={isActive} onChange={() => onToggle(parentId, item.id)} isSmall />
                    )}
                </div>

                {hasChildren && showChildren && (
                    <div className={areChildrenCompact ? "flex flex-wrap gap-2 p-3 bg-[var(--theme-card)]/50 rounded-lg mt-2 ml-6 border border-[var(--theme-border)]" : "flex flex-col border-l border-[var(--theme-border)] ml-6 pl-2 mt-2 gap-2"}>
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
                <span className="text-2xs text-[var(--theme-title)]">{item.name || item.id}</span>
                {config.hasToggle && (
                    <PremiumCheckbox checked={isActive} onChange={() => onToggle(parentId, item.id)} isSmall />
                )}
            </div>
            {hasChildren && showChildren && (
                <div className="flex flex-col border-l border-[var(--theme-border)] ml-3 pl-2">
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

export const SarakExpandableMatrix: React.FC<SarakExpandableMatrixProps> = ({
    data,
    subItems,
    activeMapping,
    onToggle,
    renderItemHeader,
    manifest
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const filteredSubItems = useMemo(() => {
        if (!searchTerm) return subItems;

        const term = searchTerm.toLowerCase();

        const filterTree = (nodes: any[]): any[] => {
            return nodes.reduce((acc, node) => {
                const matchesNode = 
                    node.name?.toLowerCase().includes(term) ||
                    node.description?.toLowerCase().includes(term) ||
                    node.id?.toLowerCase().includes(term);

                let filteredChildren: any[] = [];
                if (node.children && node.children.length > 0) {
                    filteredChildren = filterTree(node.children);
                }

                if (matchesNode) {
                    acc.push(node);
                } else if (filteredChildren.length > 0) {
                    acc.push({ ...node, children: filteredChildren });
                }

                return acc;
            }, [] as any[]);
        };

        return filterTree(subItems);
    }, [subItems, searchTerm]);

    const toggleExpand = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
    };

    return (
        <div 
            className="w-full flex flex-col gap-4"
            style={{ 
                '--matrix-gap': 'var(--sarak-matrix-gap, 12px)',
                gap: 'var(--matrix-gap)'
            } as any}
        >
            <div className="relative w-full group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--theme-muted)] group-focus-within:text-[var(--theme-primary)] transition-colors" />
                <input
                    type="text"
                    placeholder="Filtrar matriz de permissões..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-[var(--theme-card)]/40 border border-[var(--theme-border)] rounded-xl pl-11 pr-4 py-3 text-sm text-[var(--theme-title)] placeholder:text-[var(--theme-muted)] focus:outline-none focus:border-[var(--theme-primary)] focus:ring-1 focus:ring-[var(--theme-primary)]/20 transition-all"
                    style={{
                        backgroundColor: 'var(--sarak-matrix-search-bg, rgba(255,255,255,0.05))',
                        borderRadius: 'var(--sarak-matrix-radius, 12px)'
                    }}
                />
            </div>

            <div className="flex flex-col gap-2">
                {data.map((item) => (
                    <div 
                        key={item.id}
                        className="sarak-card relative overflow-hidden border border-[var(--theme-border)] transition-all"
                        style={{
                            backgroundColor: 'var(--sarak-matrix-item-bg, rgba(255,255,255,0.02))',
                            borderRadius: 'var(--sarak-matrix-radius, 12px)',
                            borderColor: expandedId === item.id ? 'var(--theme-primary-40)' : 'var(--sarak-matrix-border-color, rgba(255,255,255,0.05))',
                            backdropFilter: 'blur(var(--sarak-matrix-blur, 10px))'
                        }}
                    >
                        <div 
                            onClick={() => toggleExpand(item.id)}
                            className="flex items-center justify-between p-4 cursor-pointer hover:bg-[var(--theme-muted)]/5 transition-colors select-none"
                        >
                            <div className="flex items-center gap-4">
                                {renderItemHeader ? (
                                    renderItemHeader(item)
                                ) : (
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-[var(--theme-primary-10)] flex items-center justify-center text-[var(--theme-primary)] border border-[var(--theme-primary-20)]">
                                            <Shield size={20} />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-[var(--theme-title)] uppercase tracking-tight">{item.name || item.id}</h4>
                                            <p className="text-2xs text-[var(--theme-muted)]">{item.description || 'Configurações de acesso'}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-4">
                                <motion.div
                                    animate={{ rotate: expandedId === item.id ? 180 : 0 }}
                                    className="w-8 h-8 rounded-full flex items-center justify-center bg-[var(--theme-muted)]/10 text-[var(--theme-muted)]"
                                >
                                    <ChevronDown size={16} />
                                </motion.div>
                            </div>
                        </div>

                        <AnimatePresence>
                            {expandedId === item.id && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3, ease: 'circOut' }}
                                    className="overflow-hidden"
                                >
                                    <div className="p-4 pt-0 border-t border-[var(--theme-border)] bg-[var(--theme-card)]/50">
                                        <div className="flex flex-col mt-4 gap-3">
                                            {filteredSubItems.map((subItem) => (
                                                <RecursiveMatrixNode 
                                                    key={subItem.id}
                                                    item={subItem}
                                                    parentId={item.id}
                                                    level={0}
                                                    activeMapping={activeMapping}
                                                    onToggle={onToggle}
                                                    manifest={manifest}
                                                    searchTerm={searchTerm}
                                                />
                                            ))}
                                        </div>
                                        {filteredSubItems.length === 0 && (
                                            <div className="py-8 flex flex-col items-center justify-center text-[var(--theme-muted)] italic">
                                                <Info size={24} className="mb-2 opacity-50" />
                                                <span className="text-xs">Nenhum item encontrado para o filtro aplicado.</span>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SarakExpandableMatrix;
