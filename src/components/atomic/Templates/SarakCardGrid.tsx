import { useCardGridState } from './hooks/useCardGridState';
import { useLibraryText } from '../../../core/i18n/useLibraryText';
import { useSarakUI } from '../../../core/Provider/SarakUIProvider';
import { useStructuralStyles } from '../hooks/useStructuralStyles';
import { SarakDataErrorNotice } from './SarakDataErrorNotice';
import { SarakDataFreshness } from './SarakDataFreshness';
import type { ReactElement } from 'react';
import { CardGridHeader, CardGridResults, filterCardGridRecords } from './cardGridParts';

export interface SarakFilterConfig {
    id: string;
    label: string;
    type: 'TABS' | 'SELECT';
    field: string;
    options?: { label: string; value: string }[];
    dynamic?: boolean;
}

export interface SarakCardGridProps<TData extends Record<string, unknown> = Record<string, unknown>> {
    /** Dado já carregado pelo host; quando presente, tem prioridade sobre `load`. */
    data?: TData[];
    /** Carrega os registros pelo mecanismo escolhido pelo host. */
    load?: () => Promise<TData[]>;
    /** Horário do dado entregue diretamente pelo host. */
    updatedAt?: Date | string | number;
    /** Callback opcional para tentar novamente após uma falha. */
    onRetry?: () => void;
    label?: string;
    /**
     * Mapa de dados do card. Cada valor é o CAMINHO de um campo do item, exceto os
     * marcados como *literal* (texto/nome fixo escrito pelo próprio autor).
     *
     * Genérico por contrato (Spec 42): a Sarak não conhece domínio nenhum — nenhuma
     * aritmética, unidade ou moeda é calculada aqui. O consumidor entrega valores
     * prontos em `details`.
     */
    mapping?: {
        title: string;
        subtitle?: string;
        description?: string;
        badge?: string;
        tags?: string;
        /** *literal*: nome do ícone (contrato de nomes em `docs/component-catalog.md`). */
        icon?: string;
        color?: string;
        /** Caminho para `Array<{ label, value }>` JÁ FORMATADO pelo consumidor — painel de detalhes. */
        details?: string;
        /** Caminho para `string[]` — chips da fileira primária. */
        input_caps?: string;
        /** Caminho para `string[]` — chips da fileira secundária. */
        output_caps?: string;
        /** *literal*: cabeçalho da fileira `input_caps` (ausente = fileira sem cabeçalho). */
        input_caps_label?: string;
        /** *literal*: cabeçalho da fileira `output_caps` (ausente = fileira sem cabeçalho). */
        output_caps_label?: string;
        /** *literal*: cabeçalho do bloco de descrição no painel expansível. */
        description_label?: string;
        /** *literal*: texto do botão que abre o painel expansível (default `"Ver mais"`). */
        expand_label?: string;
        /** *literal*: texto do mesmo botão com o painel aberto (default `"Fechar"`). */
        collapse_label?: string;
    };
    filters?: SarakFilterConfig[]; // v6.4
    role?: 'primary' | 'secondary' | 'neutral' | 'accent';
    density?: 'compact' | 'standard' | 'spacious';
    importance?: 'hero' | 'base' | 'subtle';
    variant?: 'classic' | 'title' | 'action' | 'search'; // v7.0
}

/**
 * SarakCardGrid Core (v6.4)
 * 
 * Renderiza um grid de cartões de alta fidelidade com suporte a metadados
 * técnicos complexos e FILTROS DINÂMICOS declarados via manifesto.
 */
export const SarakCardGrid = <TData extends Record<string, unknown> = Record<string, unknown>>(
    { data, load, updatedAt, onRetry, label, mapping, filters = [], variant }: SarakCardGridProps<TData>,
): ReactElement => {
    const { design } = useSarakUI();
    const activeVariant = variant || design.cardVariant || 'classic';
    const { data: records, loading, error, updatedAt: lastReadAt, search, activeFilters, setSearch, setActiveFilters, loadData } = useCardGridState<TData>(data, load, updatedAt);
    const filteredData = filterCardGridRecords({ records, mapping, filters, search, activeFilters });
    const hasData = records.length > 0;
    const retry = onRetry ?? (() => void loadData());
    const outerStack = useStructuralStyles().getFlexStyles('column', undefined, undefined, 'calc(var(--sarak-layout-gap-md, 16px) * 1.25)');
    const mainFilter = filters.find((filter) => filter.type === 'TABS');
    const sideFilters = filters.filter((filter) => filter.type === 'SELECT');
    const text = useLibraryText();

    return <div className={`@container ${outerStack.className}`} style={outerStack.style}>
        {loading && hasData && <span className="sr-only" role="status" aria-live="polite">{text('spinnerLoading')}</span>}
        <CardGridHeader label={label} rowCount={filteredData.length} search={search} setSearch={setSearch} mainFilter={mainFilter} sideFilters={sideFilters} records={records} activeFilters={activeFilters} setActiveFilters={setActiveFilters} />
        {error && hasData && <SarakDataErrorNotice error={error} onRetry={retry} />}
        <SarakDataFreshness updatedAt={lastReadAt} stale={Boolean(error && hasData)} />
        <CardGridResults filteredData={filteredData} hasData={hasData} loading={loading} error={error} mapping={mapping} variant={activeVariant} />
    </div>;
};


