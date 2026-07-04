import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, Check, X, Shield, Info } from 'lucide-react';
import { SarakInput } from '../Inputs';
import { useStructuralStyles } from '../hooks/useStructuralStyles';
import { RecursiveMatrixNode } from './components/RecursiveMatrixNode';

import type { MatrixTreeNode } from './components/matrixTree';

export interface MatrixNodeConfig<TNode = MatrixTreeNode> {
    /** Variante visual de renderização do nó */
    variant?: 'card' | 'row' | 'badge' | 'switch' | 'clean';
    /** Se exibe checkbox/toggle para ativar/desativar */
    hasToggle?: boolean;
    /** Se o nó é expansível/colapsável */
    hasExpand?: boolean;
    /** Se o nó deve iniciar expandido */
    defaultExpanded?: boolean;
    /** Ícone customizado (Lucide ou elemento) */
    icon?: React.ComponentType<Record<string, unknown>>;
    /** Renderizador totalmente customizado para controle total */
    renderCustom?: (
        node: TNode,
        level: number,
        isActive: boolean,
        isExpanded: boolean,
        onToggle: () => void,
        onToggleExpand: () => void
    ) => React.ReactNode;
}

export interface SarakMatrixManifest {
    /** Mapeamento por nível de profundidade (0 para raiz, 1 para filhos, 2 para netos, etc.) */
    levels?: Record<number, MatrixNodeConfig<MatrixTreeNode>>;
    /** Mapeamento dinâmico pelo atributo `node.type` */
    types?: Record<string, MatrixNodeConfig<MatrixTreeNode>>;
    /** Configurações fallback padrão */
    default?: MatrixNodeConfig<MatrixTreeNode>;
}

export interface MatrixParentData {
    id: string;
    name?: string;
    description?: string;
    [key: string]: unknown;
}

export interface SarakExpandableMatrixProps<TData extends MatrixParentData> {
    /** Itens principais (ex: Roles/Papéis) */
    data: TData[];
    /** Todos os sub-itens possíveis (ex: Todas as Permissões) */
    subItems: MatrixTreeNode[];
    /** Função para checar se um sub-item está ativo em um item pai */
    activeMapping: (parentId: string, subItemId: string) => boolean;
    /** Callback disparado ao clicar no toggle */
    onToggle: (parentId: string, subItemId: string) => void;
    /** Renderizador customizado para o cabeçalho de cada item pai */
    renderItemHeader?: (item: TData) => React.ReactNode;
    /** Manifesto opcional de mapeamento recursivo para layout IAM/RBAC avançado */
    manifest?: SarakMatrixManifest;
}



export const SarakExpandableMatrix = <TData extends MatrixParentData>({
    data,
    subItems,
    activeMapping,
    onToggle,
    renderItemHeader,
    manifest
}: SarakExpandableMatrixProps<TData>) => {
    const { getContainerStyles, getFlexStyles } = useStructuralStyles();
    const containerLayout = getContainerStyles();
    const subItemsStack = getFlexStyles('column', undefined, undefined, 'calc(var(--sarak-layout-gap-md,16px) * 0.75)');
    const emptyStateStack = getFlexStyles('column', 'center', 'center', '0px');

    const [searchTerm, setSearchTerm] = useState('');
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const filteredSubItems = useMemo(() => {
        if (!searchTerm) return subItems;

        const term = searchTerm.toLowerCase();

        const filterTree = (nodes: MatrixTreeNode[]): MatrixTreeNode[] => {
            return nodes.reduce((acc, node) => {
                const matchesNode = 
                    node.name?.toLowerCase().includes(term) ||
                    node.description?.toLowerCase().includes(term) ||
                    node.id?.toLowerCase().includes(term);

                let filteredChildren: MatrixTreeNode[] = [];
                if (node.children && node.children.length > 0) {
                    filteredChildren = filterTree(node.children);
                }

                if (matchesNode) {
                    acc.push(node);
                    return acc;
                }
                
                if (filteredChildren.length > 0) {
                    acc.push({ ...node, children: filteredChildren });
                }

                return acc;
            }, [] as MatrixTreeNode[]);
        };

        return filterTree(subItems);
    }, [subItems, searchTerm]);

    const toggleExpand = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
    };

    return (
        <div 
            className={`w-full ${containerLayout.className}`}
            style={{ 
                ...containerLayout.style,
                '--matrix-gap': 'var(--sarak-matrix-gap, 12px)',
                gap: 'var(--sarak-layout-gap-md, 16px)'
            } as React.CSSProperties}
        >
            <div className="w-full">
                <SarakInput
                    type="text"
                    placeholder="Filtrar matriz de permissões..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    leftIcon={<Search size={18} />}
                />
            </div>

            <div className={containerLayout.className} style={{ gap: 'calc(var(--sarak-layout-gap-md,16px)*0.25)' }}>
                {data.map((item) => (
                    <div 
                        key={item.id}
                        className="sarak-card relative overflow-hidden border border-[var(--border-color,#334155)] transition-all"
                        style={{
                            backgroundColor: 'var(--sarak-matrix-item-bg, rgba(255,255,255,0.02))',
                            borderRadius: 'var(--sarak-matrix-radius, 12px)',
                            borderColor: expandedId === item.id ? 'var(--sarak-primary-color,#3b82f6)' : 'var(--sarak-matrix-border-color, rgba(255,255,255,0.05))',
                            backdropFilter: 'blur(var(--sarak-matrix-blur, 10px))'
                        }}
                    >
                        <div
                            onClick={() => toggleExpand(item.id)}
                            className="flex items-center justify-between cursor-pointer hover:bg-[var(--text-muted,#94a3b8)]/5 transition-colors select-none"
                            style={{ padding: 'var(--sarak-layout-gap-md,16px)' }}
                        >
                            <div className="flex items-center" style={{ gap: 'var(--sarak-layout-gap-md,16px)' }}>
                                {renderItemHeader ? (
                                    renderItemHeader(item)
                                ) : (
                                    <div className="flex items-center" style={{ gap: 'calc(var(--sarak-layout-gap-md,16px) * 0.75)' }}>
                                        <div className="w-10 h-10 rounded-lg bg-[var(--sarak-primary-color-bg,rgba(59,130,246,0.1))] flex items-center justify-center text-[var(--sarak-primary-color,#3b82f6)] border border-[var(--border-color,#334155)]">
                                            <Shield size={20} />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-[var(--color-theme-title,#ffffff)] uppercase tracking-tight">{item.name || item.id}</h4>
                                            <p className="text-2xs text-[var(--text-muted,#94a3b8)]">{item.description || 'Configurações de acesso'}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center" style={{ gap: 'var(--sarak-layout-gap-md,16px)' }}>
                                <motion.div
                                    animate={{ rotate: expandedId === item.id ? 180 : 0 }}
                                    className="w-8 h-8 rounded-full flex items-center justify-center bg-[var(--text-muted,#94a3b8)]/10 text-[var(--text-muted,#94a3b8)]"
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
                                    <div
                                        className="border-t border-[var(--border-color,#334155)] bg-[var(--color-theme-card,#1e293b)]/50"
                                        style={{ padding: '0 var(--sarak-layout-gap-md,16px) var(--sarak-layout-gap-md,16px) var(--sarak-layout-gap-md,16px)' }}
                                    >
                                        <div className={subItemsStack.className} style={{ ...subItemsStack.style, marginTop: 'var(--sarak-layout-gap-md,16px)' }}>
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
                                            <div className={`${emptyStateStack.className} text-[var(--text-muted,#94a3b8)] italic`} style={{ ...emptyStateStack.style, paddingTop: 'calc(var(--sarak-layout-gap-md,16px) * 2)', paddingBottom: 'calc(var(--sarak-layout-gap-md,16px) * 2)' }}>
                                                <Info size={24} className="opacity-50" style={{ marginBottom: 'var(--sarak-layout-gap-sm, 8px)' }} />
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
