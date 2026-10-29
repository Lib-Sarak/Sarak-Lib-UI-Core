import type React from 'react';
import { getOptionalTanstackUseVirtualizer } from '../optional-tanstack-virtualizer';
import { useSarakDevice } from '../../../../core/Provider/DeviceProvider';
import { SarakOptionalPeerFallback } from '../../Feedback/SarakOptionalPeerFallback';
import type { SarakColumn, SarakTableSort } from './columnModel';
import type { SarakTableGroupBy } from './tableDisplayRows';
import { useSarakDataTableViewModel } from './useSarakDataTableViewModel';
import { SarakDataTableView } from './SarakDataTableView';

export type SarakDataTableRowHeight<T> = number | ((row: T) => number) | 'auto';

export interface SarakDataTableProps<T = Record<string, unknown>> {
    /** Definição declarativa das colunas (ordem inicial = ordem do array). */
    columns: Array<SarakColumn<T>>;
    /** Linhas de dados; a fonte real (fetch) vive fora — aqui só virtualizamos. */
    rows: T[];
    rowHeight?: SarakDataTableRowHeight<T>;
    headerHeight?: number;
    height?: number | string;
    overscan?: number;
    /** Chave estável da linha para seleção; por padrão, usa row.id ou o índice original. */
    getRowKey?: (row: T, index: number) => React.Key;
    /** Omitido, ordena localmente; passe null para controlar o estado sem ordenação. */
    sort?: SarakTableSort | null;
    /** Recebe o próximo estado de ordenação; com sort, o consumidor controla a ordem das linhas. */
    onSortChange?: (sort: SarakTableSort | null) => void;
    /** Habilita a seleção de linhas e a caixa das linhas visíveis. */
    selectable?: boolean;
    /** Chaves selecionadas controladas; omitido, a tabela gerencia a seleção. */
    selectedKeys?: React.Key[];
    /** Recebe as chaves selecionadas atualizadas. */
    onSelectionChange?: (selectedKeys: React.Key[]) => void;
    onColumnResize?: (columnId: string, width: number) => void;
    onColumnReorder?: (fromId: string, toId: string) => void;
    /** L2 (Spec 40.2): no smartphone colapsa para cards empilhados. Default `true`. */
    responsive?: boolean;
    /** Exibe os estados de carregamento, erro e vazio recebidos pelo host. */
    loading?: boolean;
    error?: string | null;
    emptyMessage?: string;
    onRetry?: () => void;
    /** Disparado ao ativar uma linha. */
    onRowClick?: (row: T) => void;
    className?: string;
    /** Agrupa as linhas, com cabeçalho de grupo expansível e subtotal. */
    groupBy?: SarakTableGroupBy<T>;
    /** Conteúdo da linha expandida; com ele, cada linha ganha o botão de expandir. */
    renderExpanded?: (row: T) => React.ReactNode;
    /** Chaves das linhas expandidas (controlado); omitido, a tabela gerencia. */
    expandedKeys?: React.Key[];
    onExpandedChange?: (keys: React.Key[]) => void;
    /** Filtra as linhas pelo texto exibido (ou `searchValue`); omitido, sem filtro. A DataTable não tem campo de busca. */
    searchQuery?: string;
    onSearchQueryChange?: (query: string) => void;
    /** Total no servidor; maior que as linhas visíveis, oferece "Selecionar todos os N". */
    totalCount?: number;
    /** Com `true`, `selectedKeys` passa a ser a lista de EXCEÇÕES. */
    selectAll?: boolean;
    onSelectAllChange?: (all: boolean) => void;
    /** Filhos da linha: transforma a tabela em tree-table (plano de contas, DRE). */
    getChildren?: (row: T) => T[] | undefined;
    /** Profundidade aberta de início na árvore; padrão `0` (tudo recolhido). */
    defaultExpandedDepth?: number;
    /** Cabeçalhos arrastáveis para reordenar; padrão `true`. */
    reorderable?: boolean;
    /** Linhas do esqueleto com `loading` e sem linhas; padrão `8`. */
    skeletonRows?: number;
}

const OPTIONAL_PEER = '@tanstack/react-virtual';

function SarakDataTableContent<T>(props: SarakDataTableProps<T>): React.ReactElement {
    const device = useSarakDevice();
    const model = useSarakDataTableViewModel(props, device);
    return <SarakDataTableView model={model} />;
}

function SarakDataTableImpl<T>(props: SarakDataTableProps<T>): React.ReactElement {
    if (!getOptionalTanstackUseVirtualizer()) {
        return <SarakOptionalPeerFallback component="SarakDataTable" packages={[OPTIONAL_PEER]} />;
    }
    return <SarakDataTableContent {...props} />;
}

export default SarakDataTableImpl;
