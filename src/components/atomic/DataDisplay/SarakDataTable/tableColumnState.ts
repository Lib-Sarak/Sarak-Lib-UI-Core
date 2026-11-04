/** Estado de colunas que o usuário configura: lógica pura, sem React nem DOM. Quem persiste é o consumidor. */

export interface SarakColumnState {
    /** Ids das colunas escondidas. */
    hidden?: string[];
    /** Ordem das colunas; as que faltam na lista entram no fim, na ordem declarada. */
    order?: string[];
    /** Largura em px por id de coluna. */
    widths?: Record<string, number>;
}

/** Quanto cada seta muda a largura da coluna na alça de redimensionar. */
export const COLUMN_RESIZE_STEP = 16;

/** A ordem efetiva: ignora id que não existe mais e acrescenta coluna nova ao fim. */
export const resolveColumnOrder = (columnIds: string[], order: string[] | undefined): string[] => {
    const known = new Set(columnIds);
    const kept = (order ?? []).filter((id) => known.has(id));
    const placed = new Set(kept);
    return [...kept, ...columnIds.filter((id) => !placed.has(id))];
};

export const toggleColumnHidden = (state: SarakColumnState, columnId: string): SarakColumnState => {
    const hidden = state.hidden ?? [];
    return { ...state, hidden: hidden.includes(columnId) ? hidden.filter((id) => id !== columnId) : [...hidden, columnId] };
};

/** A coluna `delta` posições adiante na ordem; `null` quando ela já está na ponta. */
export const columnNeighbor = (order: string[], columnId: string, delta: number): string | null =>
    order[order.indexOf(columnId) + delta] ?? null;

export const moveColumnTo = (state: SarakColumnState, order: string[], columnId: string, delta: number): SarakColumnState => {
    const index = order.indexOf(columnId);
    const target = index + delta;
    if (index < 0 || target < 0 || target >= order.length) return state;
    const next = [...order];
    next.splice(index, 1);
    next.splice(target, 0, columnId);
    return { ...state, order: next };
};

export const withColumnWidth = (state: SarakColumnState, columnId: string, width: number): SarakColumnState => ({
    ...state,
    widths: { ...state.widths, [columnId]: width },
});
