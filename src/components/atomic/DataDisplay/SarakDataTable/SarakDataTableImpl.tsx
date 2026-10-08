import type React from 'react';
import { useSarakDevice } from '../../../../core/Provider/DeviceProvider';
import type { SarakColumn, SarakTableSort } from './columnModel';
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
}

function SarakDataTableImpl<T>(props: SarakDataTableProps<T>): React.ReactElement {
    const device = useSarakDevice();
    const model = useSarakDataTableViewModel(props, device);
    return <SarakDataTableView model={model} />;
}

export default SarakDataTableImpl;
