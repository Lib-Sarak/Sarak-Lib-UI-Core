import type { SarakDesignToken } from '../../../core/Design/types';
import ConceptGroups from '../config/token-search-concepts.json';

export interface SearchableToken extends SarakDesignToken {
    componentLabel?: string;
}

export interface CatalogSearchEntry {
    name?: string;
    description?: string;
    tags?: string[];
    categories?: string[];
}

export type GroupedStructure = Record<string, Record<string, SarakDesignToken[]>>;

interface TokenIndex {
    title: Set<string>;
    other: Set<string>;
}

const STOP_WORDS = new Set('de do da dos das o a os as e em no na para com um uma'.split(' '));

const SCORE_TITLE_WORD = 3;
const SCORE_TITLE_CONCEPT = 2;
const SCORE_OTHER = 1;
const SCORE_PREFIX_TITLE = 0.5;
const SCORE_PREFIX_OTHER = 0.25;
const STRONG_CONCEPT_HITS = 3;
const DENSITY_BONUS = 0.1;
const MAX_DENSITY_HITS = 9;
const MIN_PREFIX_LENGTH = 2;
const PATH_SEPARATOR = ' › ';

export const normalizeText = (text: string): string =>
    text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export const tokenizeText = (text: string): string[] =>
    normalizeText(text)
        .split(/[^a-z0-9]+/)
        .filter((word) => word.length > 1 && !STOP_WORDS.has(word));

const synonymsByTerm = new Map<string, Set<string>>();
Object.values(ConceptGroups).forEach((group) => {
    group.forEach((term) => synonymsByTerm.set(term, new Set([...(synonymsByTerm.get(term) ?? []), ...group])));
});

export const buildCatalogMap = (entries: readonly (CatalogSearchEntry & { tokenId: string })[]): Map<string, CatalogSearchEntry> => {
    const map = new Map<string, CatalogSearchEntry>();
    entries.forEach((entry) => map.set(entry.tokenId, entry));
    return map;
};

const buildIndex = (token: SearchableToken, entry: CatalogSearchEntry | undefined): TokenIndex => {
    const idWords = token.id.replace(/([a-z0-9])([A-Z])/g, '$1 $2');
    const otherTexts = [
        idWords, ...(entry?.tags ?? []), ...(entry?.categories ?? []),
        entry?.description ?? '', token.description ?? '', token.componentLabel ?? ''
    ];
    return {
        title: new Set([...tokenizeText(token.label), ...tokenizeText(entry?.name ?? '')]),
        other: new Set([normalizeText(token.id), ...otherTexts.flatMap(tokenizeText)])
    };
};

const hasAny = (words: Set<string>, candidates: Set<string>): boolean => [...candidates].some((word) => words.has(word));

const countConceptHits = (index: TokenIndex, synonyms: Set<string>): number =>
    [...synonyms].filter((word) => index.title.has(word) || index.other.has(word)).length;

const prefixScore = (index: TokenIndex, term: string): number | null => {
    if ([...index.title].some((word) => word.startsWith(term))) return SCORE_PREFIX_TITLE;
    return [...index.other].some((word) => word.startsWith(term)) ? SCORE_PREFIX_OTHER : null;
};

const baseScore = (term: string, isLast: boolean, index: TokenIndex, synonyms: Set<string>): number | null => {
    if (index.title.has(term)) return SCORE_TITLE_WORD;
    if (hasAny(index.title, synonyms)) return SCORE_TITLE_CONCEPT;
    if (index.other.has(term) || hasAny(index.other, synonyms)) return SCORE_OTHER;
    return isLast && term.length >= MIN_PREFIX_LENGTH ? prefixScore(index, term) : null;
};

const scoreTerm = (term: string, isLast: boolean, index: TokenIndex): number | null => {
    const synonyms = synonymsByTerm.get(term) ?? new Set<string>();
    const base = baseScore(term, isLast, index, synonyms);
    if (base === null) return null;
    const hits = countConceptHits(index, synonyms);
    const strong = base === SCORE_TITLE_CONCEPT && hits >= STRONG_CONCEPT_HITS;
    return (strong ? SCORE_TITLE_WORD : base) + Math.min(hits, MAX_DENSITY_HITS) * DENSITY_BONUS;
};

const scoreTokenIndex = (terms: string[], index: TokenIndex): number | null => {
    let total = 0;
    for (let i = 0; i < terms.length; i += 1) {
        const score = scoreTerm(terms[i], i === terms.length - 1, index);
        if (score === null) return null;
        total += score;
    }
    return total;
};

/** Devolve os tokens que casam com TODOS os termos da consulta, do mais ao menos relevante (empate: ordem recebida). */
export const searchTokens = <T extends SearchableToken>(
    query: string,
    tokens: readonly T[],
    catalogMap: ReadonlyMap<string, CatalogSearchEntry>,
): T[] => {
    const terms = tokenizeText(query);
    if (terms.length === 0) return [];
    const scored: { token: T; score: number; order: number }[] = [];
    tokens.forEach((token, order) => {
        const score = scoreTokenIndex(terms, buildIndex(token, catalogMap.get(token.id)));
        if (score !== null) scored.push({ token, score, order });
    });
    return scored.sort((a, b) => b.score - a.score || a.order - b.order).map((item) => item.token);
};

/** Verdadeiro se todos os termos da consulta casam com o texto (palavra inteira, conceito ou prefixo no último termo). */
export const matchesText = (query: string, text: string): boolean => {
    const terms = tokenizeText(query);
    if (terms.length === 0) return false;
    const words = new Set(tokenizeText(text));
    return scoreTokenIndex(terms, { title: words, other: new Set() }) !== null;
};

/** `Pilar › Seção` onde o token mora no modo Completo; `null` se nenhum grupo o contém. */
export const locateToken = (
    tokenId: string,
    groupedStructure: GroupedStructure,
    pillars: readonly { id: string; title: string }[],
): string | null => {
    for (const pillar of pillars) {
        const sections = groupedStructure[pillar.id] ?? {};
        const section = Object.keys(sections).find((name) => sections[name].some((t) => t.id === tokenId));
        if (section) return `${pillar.title.replace(/^\d+\.\s*/, '')}${PATH_SEPARATOR}${section}`;
    }
    return null;
};
