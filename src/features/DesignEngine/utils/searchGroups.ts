import type { SarakDesignToken } from '../../../core/Design/types';
import type { DecisionId, TokenLocation } from './decisions';
import { matchesText } from './token-search';

export interface LocatedResult {
    token: SarakDesignToken;
    location: TokenLocation;
}

export interface ResultGroup {
    decisionId: DecisionId;
    items: LocatedResult[];
}

export interface OptionEntry {
    decisionId: DecisionId;
    /** Vazio quando a consulta aponta para a decisão inteira, não para uma seção dela. */
    section: string;
}

/** Quantos resultados cada grupo mostra antes do "Ver todos". */
export const MAX_PER_GROUP = 5;
/** Acima disto a busca abre primeiro as áreas, não a lista. */
export const AREAS_FIRST_THRESHOLD = 20;
const MAX_OPTION_ENTRIES = 5;

/** Agrupa por decisão, na ordem em que a primeira de cada uma aparece: a decisão do melhor resultado vem primeiro. */
export const groupByDecision = (located: readonly LocatedResult[]): ResultGroup[] => {
    const groups = new Map<DecisionId, LocatedResult[]>();
    located.forEach((item) => groups.set(item.location.decisionId, [...(groups.get(item.location.decisionId) ?? []), item]));
    return [...groups].map(([decisionId, items]) => ({ decisionId, items }));
};

/**
 * Além do token, a busca acha o lugar onde as opções moram: a decisão ou a seção cujo nome casa com a consulta
 * (`Forma › Cantos`). Vale para toda seção que o índice da coluna conhece, inclusive as que um preset novo trouxer.
 */
export const findOptionEntries = (
    query: string,
    tokenIndex: ReadonlyMap<string, TokenLocation>,
    decisionLabel: (id: DecisionId) => string,
): OptionEntry[] => {
    const seen = new Set<string>();
    const entries: OptionEntry[] = [];
    tokenIndex.forEach((location) => {
        const section = location.section ?? '';
        const matched = section ? matchesText(query, section) : matchesText(query, decisionLabel(location.decisionId));
        const key = `${location.decisionId}|${section}`;
        if (!matched || seen.has(key)) return;
        seen.add(key);
        entries.push({ decisionId: location.decisionId, section });
    });
    return entries.slice(0, MAX_OPTION_ENTRIES);
};
