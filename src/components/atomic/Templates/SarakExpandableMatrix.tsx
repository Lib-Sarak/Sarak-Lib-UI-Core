import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, Check, X, Shield, Info } from 'lucide-react';
import { SarakInput } from '../Inputs';
import { useStructuralStyles } from '../hooks/useStructuralStyles';
import { RecursiveMatrixNode } from './components/RecursiveMatrixNode';

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



export const SarakExpandableMatrix: React.FC<SarakExpandableMatrixProps> = ({
    data,
    subItems,
    activeMapping,
    onToggle,
    renderItemHeader,
    manifest
}) => {
    const { getContainerStyles } = useStructuralStyles();
    const containerLayout = getContainerStyles();

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
                    return acc;
                }
                
                if (filteredChildren.length > 0) {
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
            className={`w-full ${containerLayout.className}`}
            style={{ 
                ...containerLayout.style,
                '--matrix-gap': 'var(--sarak-matrix-gap, 12px)',
                gap: 'var(--matrix-gap)'
            } as any}
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

            <div className={containerLayout.className} style={{ gap: 'var(--sx-spacing-xs)' }}>
                {data.map((item) => (
                    <div 
                        key={item.id}
                        className="sarak-card relative overflow-hidden border border-[var(--sx-color-border-base)] transition-all"
                        style={{
                            backgroundColor: 'var(--sarak-matrix-item-bg, rgba(255,255,255,0.02))',
                            borderRadius: 'var(--sarak-matrix-radius, 12px)',
                            borderColor: expandedId === item.id ? 'var(--sx-color-primary-base)' : 'var(--sarak-matrix-border-color, rgba(255,255,255,0.05))',
                            backdropFilter: 'blur(var(--sarak-matrix-blur, 10px))'
                        }}
                    >
                        <div 
                            onClick={() => toggleExpand(item.id)}
                            className="flex items-center justify-between p-4 cursor-pointer hover:bg-[var(--sx-color-text-muted)]/5 transition-colors select-none"
                        >
                            <div className="flex items-center gap-4">
                                {renderItemHeader ? (
                                    renderItemHeader(item)
                                ) : (
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-[var(--sx-color-primary-surface)] flex items-center justify-center text-[var(--sx-color-primary-base)] border border-[var(--sx-color-border-base)]">
                                            <Shield size={20} />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-[var(--sx-color-text-title)] uppercase tracking-tight">{item.name || item.id}</h4>
                                            <p className="text-2xs text-[var(--sx-color-text-muted)]">{item.description || 'Configurações de acesso'}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-4">
                                <motion.div
                                    animate={{ rotate: expandedId === item.id ? 180 : 0 }}
                                    className="w-8 h-8 rounded-full flex items-center justify-center bg-[var(--sx-color-text-muted)]/10 text-[var(--sx-color-text-muted)]"
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
                                    <div className="p-4 pt-0 border-t border-[var(--sx-color-border-base)] bg-[var(--sx-color-surface-base)]/50">
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
                                            <div className="py-8 flex flex-col items-center justify-center text-[var(--sx-color-text-muted)] italic">
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
