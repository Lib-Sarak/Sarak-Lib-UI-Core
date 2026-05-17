import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, Check, X, Shield, Info } from 'lucide-react';

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
}

const RecursiveMatrixNode: React.FC<{
    item: any; parentId: string; level: number;
    activeMapping: (parentId: string, subItemId: string) => boolean;
    onToggle: (parentId: string, subItemId: string) => void;
}> = ({ item, parentId, level, activeMapping, onToggle }) => {
    const isActive = activeMapping(parentId, item.id);
    const hasChildren = item.children && item.children.length > 0;
    
    // Nível 0 = Card Pai (Destaque) | Nível > 0 = Linhas Filhas (Leve)
    const isRoot = level === 0;
    
    return (
        <div className="flex flex-col w-full">
            <div 
                onClick={() => onToggle(parentId, item.id)}
                className={`group flex items-center justify-between transition-all cursor-pointer ${
                    isRoot 
                    ? `p-3 rounded-lg border mt-2 ${isActive ? 'bg-[var(--theme-primary-10)] border-[var(--theme-primary-30)]' : 'bg-white/5 border-white/5 hover:border-white/10'}`
                    : `py-2 px-3 border-b border-white/5 ${isActive ? 'bg-[var(--theme-primary)]/5' : 'hover:bg-white/[0.02]'}`
                }`}
                style={{ marginLeft: isRoot ? '0' : '16px' }}
            >
                <div className="flex flex-col gap-0.5">
                    <span className={`font-bold tracking-tight uppercase ${isRoot ? 'text-[11px]' : 'text-[10px]'} ${isActive ? 'text-[var(--theme-primary)]' : 'text-white/60'}`}>
                        {item.name || item.id}
                    </span>
                    {item.description && (
                        <span className="text-[9px] text-white/30 line-clamp-1">{item.description}</span>
                    )}
                </div>
                
                {/* Caixa de seleção reduzida para filhos */}
                <div className={`rounded flex items-center justify-center transition-all flex-shrink-0 ${
                    isRoot ? 'w-5 h-5' : 'w-4 h-4'
                } ${
                    isActive 
                    ? 'bg-[var(--theme-primary)] text-white shadow-[0_0_10px_rgba(var(--theme-primary-rgb),0.5)]' 
                    : 'bg-white/10 text-white/10 group-hover:bg-white/20'
                }`}>
                    {isActive ? <Check size={isRoot ? 12 : 10} strokeWidth={3} /> : <X size={isRoot ? 10 : 8} />}
                </div>
            </div>
            
            {/* Indentação vertical mais refinada */}
            {hasChildren && (
                <div className="flex flex-col border-l border-white/10 ml-3">
                    {item.children.map((child: any) => (
                        <RecursiveMatrixNode 
                            key={child.id} item={child} parentId={parentId}
                            level={level + 1} activeMapping={activeMapping} onToggle={onToggle}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

/**
 * SarakExpandableMatrix (v2.0)
 * 
 * Componente agnóstico para renderização de matrizes de associação complexas com recursividade (N-níveis).
 * Segue a arquitetura Data-Driven da Sarak.
 */
export const SarakExpandableMatrix: React.FC<SarakExpandableMatrixProps> = ({
    data,
    subItems,
    activeMapping,
    onToggle,
    renderItemHeader
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedId, setExpandedId] = useState<string | null>(null);

    // Filtra os sub-itens com base no termo de busca com suporte à árvore (N-níveis)
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
                    // se o nó atual bater na busca, preservamos ele e todos os filhos
                    acc.push(node);
                } else if (filteredChildren.length > 0) {
                    // se um nó filho bater, mantemos o pai (caminho) exibindo apenas os filhos filtrados
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
            {/* Barra de Busca Superior */}
            <div className="relative w-full group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[var(--theme-primary)] transition-colors" />
                <input
                    type="text"
                    placeholder="Filtrar matriz de permissões..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[var(--theme-primary)] focus:ring-1 focus:ring-[var(--theme-primary)]/20 transition-all"
                    style={{
                        backgroundColor: 'var(--sarak-matrix-search-bg, rgba(255,255,255,0.05))',
                        borderRadius: 'var(--sarak-matrix-radius, 12px)'
                    }}
                />
            </div>

            {/* Lista de Itens Principais (Matriz) */}
            <div className="flex flex-col gap-2">
                {data.map((item) => (
                    <div 
                        key={item.id}
                        className="sarak-card relative overflow-hidden border border-white/5 transition-all"
                        style={{
                            backgroundColor: 'var(--sarak-matrix-item-bg, rgba(255,255,255,0.02))',
                            borderRadius: 'var(--sarak-matrix-radius, 12px)',
                            borderColor: expandedId === item.id ? 'var(--theme-primary-40)' : 'var(--sarak-matrix-border-color, rgba(255,255,255,0.05))',
                            backdropFilter: 'blur(var(--sarak-matrix-blur, 10px))'
                        }}
                    >
                        {/* Header do Item */}
                        <div 
                            onClick={() => toggleExpand(item.id)}
                            className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors select-none"
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
                                            <h4 className="text-sm font-bold text-white uppercase tracking-tight">{item.name || item.id}</h4>
                                            <p className="text-2xs text-white/40">{item.description || 'Configurações de acesso'}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-4">
                                <motion.div
                                    animate={{ rotate: expandedId === item.id ? 180 : 0 }}
                                    className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 text-white/20"
                                >
                                    <ChevronDown size={16} />
                                </motion.div>
                            </div>
                        </div>

                        {/* Conteúdo Expansível (Sub-itens em Árvore) */}
                        <AnimatePresence>
                            {expandedId === item.id && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3, ease: 'circOut' }}
                                    className="overflow-hidden"
                                >
                                    <div className="p-4 pt-0 border-t border-white/5 bg-black/20">
                                        <div className="flex flex-col mt-4">
                                            {filteredSubItems.map((subItem) => (
                                                <RecursiveMatrixNode 
                                                    key={subItem.id}
                                                    item={subItem}
                                                    parentId={item.id}
                                                    level={0}
                                                    activeMapping={activeMapping}
                                                    onToggle={onToggle}
                                                />
                                            ))}
                                        </div>
                                        {filteredSubItems.length === 0 && (
                                            <div className="py-8 flex flex-col items-center justify-center text-white/20 italic">
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
