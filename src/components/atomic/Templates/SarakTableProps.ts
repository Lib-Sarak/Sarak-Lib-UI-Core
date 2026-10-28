import type { Key, ReactNode } from 'react';
import type { SarakTableSort } from '../DataDisplay/SarakDataTable/columnModel';
import type { SarakColumnValueOptions } from '../DataDisplay/SarakDataTable/columnValue';
import type { SarakTableGroupBy } from '../DataDisplay/SarakDataTable/tableDisplayRows';

export interface SarakTableColumn<TData> extends SarakColumnValueOptions<TData> {
    key: string;
    label: string;
    render?: (row: TData) => ReactNode;
    align?: 'left' | 'center' | 'right';
}

export interface SarakTableProps<TData extends Record<string, unknown> = Record<string, unknown>> {
    /** Dado já carregado pelo host; quando presente, tem prioridade sobre `load`. */
    data?: TData[];
    /** Carrega as linhas pelo mecanismo escolhido pelo host. */
    load?: () => Promise<TData[]>;
    label?: string;
    mapping?: Record<string, string>; // { key_in_json: "Label na Coluna" }
    /** Chave estável da linha para seleção; por padrão, usa row.id ou o índice original. */
    getRowKey?: (row: TData, index: number) => Key;
    /** Omitido, ordena localmente; passe null para controlar o estado sem ordenação. */
    sort?: SarakTableSort | null;
    /** Recebe o próximo estado de ordenação; com sort, o consumidor controla a ordem das linhas. */
    onSortChange?: (sort: SarakTableSort | null) => void;
    /** Habilita a seleção de linhas e a caixa das linhas visíveis. */
    selectable?: boolean;
    /** Chaves selecionadas controladas; omitido, a tabela gerencia a seleção. */
    selectedKeys?: Key[];
    /** Recebe as chaves selecionadas atualizadas. */
    onSelectionChange?: (selectedKeys: Key[]) => void;
    /** Colunas semânticas compartilhadas pela tabela desktop e pelos cartões mobile. */
    columns?: SarakTableColumn<TData>[];
    /** Recebe a linha acionada tanto na tabela quanto no cartão mobile. */
    onRowClick?: (row: TData) => void;
    role?: 'primary' | 'secondary' | 'neutral' | 'accent';
    density?: 'compact' | 'standard' | 'spacious';
    /**
     * No smartphone colapsa para cards empilhados. Default `true` — mesma prop, mesmo
     * default e mesmo efeito do irmão `SarakDataTable`, para que os dois componentes
     * públicos de tabela não tenham APIs divergentes.
     */
    responsive?: boolean;
    /** Exibe o campo de busca; omitido, fica visível. */
    showSearch?: boolean;
    /** Exibe o botão de atualização quando `load` existe; omitido, segue a presença de `load`. */
    showRefresh?: boolean;
    /** Agrupa as linhas, com cabeçalho de grupo expansível e subtotal. */
    groupBy?: SarakTableGroupBy<TData>;
    /** Conteúdo da linha expandida; com ele, cada linha ganha o botão de expandir. */
    renderExpanded?: (row: TData) => ReactNode;
    /** Chaves das linhas expandidas (controlado); omitido, a tabela gerencia. */
    expandedKeys?: Key[];
    onExpandedChange?: (keys: Key[]) => void;
    /** Texto da busca (controlado); omitido, a tabela guarda o texto do campo. */
    searchQuery?: string;
    onSearchQueryChange?: (query: string) => void;
    /** Total no servidor; maior que as linhas visíveis, oferece "Selecionar todos os N". */
    totalCount?: number;
    /** Com `true`, `selectedKeys` passa a ser a lista de EXCEÇÕES. */
    selectAll?: boolean;
    onSelectAllChange?: (all: boolean) => void;
    /** Mostra o botão de exportar CSV na barra; `{ filename }` troca o nome do arquivo. */
    exportable?: boolean | { filename?: string };
}
