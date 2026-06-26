/**
 * SarakTreeView — árvore hierárquica genérica (Spec 12, Regra 5 · Onda 9)
 *
 * Wrapper fino que **reusa** o motor de recursão `RecursiveMatrixNode` (o mesmo que
 * serve a matriz RBAC) — sem duplicar a recursão. Suporta profundidade infinita e o
 * estado `lazyLoadingIcon` ativável via JSON (nó com `loading: true`), além de seleção
 * opcional por nó e callback de expansão para carregamento sob demanda. Zero dependência
 * nova; Zero Hardcode (estilos herdados dos átomos via tokens `var(--sx-*)`).
 */

import React, { useMemo } from 'react';
import { RecursiveMatrixNode, type MatrixTreeNode } from '../Templates/components/RecursiveMatrixNode';
import type { SarakMatrixManifest } from '../Templates/SarakExpandableMatrix';

export type { MatrixTreeNode } from '../Templates/components/RecursiveMatrixNode';

/** Pai sintético dos nós-raiz (a matriz usa `parentId` para o mapa de seleção). */
const ROOT_ID = '__sarak_tree_root__';

export interface SarakTreeViewProps {
    /** Floresta de nós; cada nó pode ter `children` (N níveis) e `loading`. */
    data: MatrixTreeNode[];
    /** Manifesto de layout por nível/tipo (default: variante limpa por profundidade). */
    manifest?: SarakMatrixManifest;
    /** Indicador exibido sob nós com `loading: true` (default: spinner tokenizado). */
    lazyLoadingIcon?: React.ReactNode;
    /** Disparado ao expandir/colapsar um nó — ponto de gancho para fetch assíncrono. */
    onExpand?: (node: MatrixTreeNode, expanded: boolean) => void;
    /** IDs selecionados (habilita o toggle por nó quando combinado com `onSelect`). */
    selectedIds?: string[];
    /** Disparado ao alternar a seleção de um nó. */
    onSelect?: (nodeId: string) => void;
    className?: string;
}

export const SarakTreeView: React.FC<SarakTreeViewProps> = ({
    data,
    manifest,
    lazyLoadingIcon,
    onExpand,
    selectedIds,
    onSelect,
    className,
}) => {
    const selected = useMemo(() => new Set(selectedIds ?? []), [selectedIds]);

    // Sem manifesto explícito: layout de árvore limpo; toggles só se houver `onSelect`.
    const effectiveManifest = manifest ?? { default: { hasToggle: !!onSelect } };

    const activeMapping = (_parentId: string, nodeId: string) => selected.has(nodeId);
    const handleToggle = (_parentId: string, nodeId: string) => onSelect?.(nodeId);

    return (
        <div data-sarak-treeview="true" role="tree" className={className} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sx-spacing-xs)' }}>
            {data.map((node) => (
                <div role="treeitem" key={node.id}>
                    <RecursiveMatrixNode
                        item={node}
                        parentId={ROOT_ID}
                        level={0}
                        activeMapping={activeMapping}
                        onToggle={handleToggle}
                        manifest={effectiveManifest}
                        lazyLoadingIcon={lazyLoadingIcon}
                        onExpandChange={onExpand}
                    />
                </div>
            ))}
        </div>
    );
};

export default SarakTreeView;
