/**
 * Contratos do nó recursivo (RBAC/IAM e TreeView genérico).
 *
 * Extraídos de `RecursiveMatrixNode.tsx` na Onda 9 para manter o componente sob o
 * limite de 250 linhas (Clean Code). Tipado — Zero Any.
 */

import React from 'react';
import { SarakMatrixManifest } from '../SarakExpandableMatrix';

export interface SarakMatrixTreeNode {
    id: string;
    name?: string;
    description?: string;
    /** Discriminador opcional para o mapeamento `manifest.types`. */
    type?: string;
    children?: SarakMatrixTreeNode[];
    /** Carregamento assíncrono em andamento — renderiza o `lazyLoadingIcon`. */
    loading?: boolean;
}

export interface RecursiveMatrixNodeProps {
    item: SarakMatrixTreeNode;
    parentId: string;
    level: number;
    activeMapping: (parentId: string, subItemId: string) => boolean;
    onToggle: (parentId: string, subItemId: string) => void;
    manifest?: SarakMatrixManifest;
    searchTerm?: string;
    /** Indicador exibido sob um nó com `loading: true` (default: spinner tokenizado). */
    lazyLoadingIcon?: React.ReactNode;
    /** Notifica expansão/colapso do nó — habilita carregamento sob demanda. */
    onExpandChange?: (node: SarakMatrixTreeNode, expanded: boolean) => void;
}
