import type { SarakDesignToken } from '../../../core/Design/types';
import { correctTerms } from './token-typo';
import { indexOf, normalizeText, tokenizeText, type CatalogSearchEntry, type SearchableToken, type TokenIndex } from './token-index';

export { normalizeText, tokenizeText, type CatalogSearchEntry, type SearchableToken };
import ConceptGroups from '../config/token-search-concepts.json';

export type GroupedStructure = Record<string, Record<string, SarakDesignToken[]>>;

interface Ranked<T> {
    token: T;
    order: number;
    matched: number;
    minTier: number;
    sumTier: number;
    verbHits: number;
    exact: boolean;
    hasImpact: boolean;
    importance: number;
    idWords: number;
    density: number;
}

/** Verbos de ação: com outro termo na consulta, só sobem quem os tem; sozinhos, buscam como qualquer palavra. */
const ACTION_VERBS = new Set(
    'esconder ocultar mostrar exibir aumentar diminuir ativar desativar ligar desligar remover tirar sumir escurecer clarear'.split(' '),
);

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

const synonymsByTerm = new Map<string, Set<string>>();
Object.values(ConceptGroups).forEach((group) => {
    group.forEach((term) => synonymsByTerm.set(term, new Set([...(synonymsByTerm.get(term) ?? []), ...group])));
});

export const buildCatalogMap = (entries: readonly (CatalogSearchEntry & { tokenId: string })[]): Map<string, CatalogSearchEntry> => {
    const map = new Map<string, CatalogSearchEntry>();
    entries.forEach((entry) => map.set(entry.tokenId, entry));
    return map;
};

const hasAny = (words: Set<string>, candidates: Set<string>): boolean => [...candidates].some((word) => words.has(word));

const countConceptHits = (index: TokenIndex, synonyms: Set<string>): number =>
    [...synonyms].filter((word) => index.title.has(word) || index.other.has(word) || index.category.has(word)).length;

const prefixScore = (index: TokenIndex, term: string): number | null => {
    if ([...index.title].some((word) => word.startsWith(term))) return SCORE_PREFIX_TITLE;
    return [...index.other, ...index.category].some((word) => word.startsWith(term)) ? SCORE_PREFIX_OTHER : null;
};

const CATEGORY_STEM_LENGTH = 3;

/** A palavra, ou uma forma dela do mesmo grupo (plural, flexão), está nas categorias do catálogo. */
const inCategory = (index: TokenIndex, term: string, synonyms: Set<string>): boolean =>
    index.category.has(term)
    || [...index.category].some((word) => synonyms.has(word) && word.slice(0, CATEGORY_STEM_LENGTH) === term.slice(0, CATEGORY_STEM_LENGTH));

const baseScore = (term: string, isLast: boolean, index: TokenIndex, synonyms: Set<string>, byCategory: boolean): number | null => {
    if (index.title.has(term) || (byCategory && inCategory(index, term, synonyms))) return SCORE_TITLE_WORD;
    if (hasAny(index.title, synonyms)) return SCORE_TITLE_CONCEPT;
    if (index.other.has(term) || hasAny(index.other, synonyms) || hasAny(index.category, synonyms)) return SCORE_OTHER;
    return isLast && term.length >= MIN_PREFIX_LENGTH ? prefixScore(index, term) : null;
};

interface TermHit {
    tier: number;
    density: number;
}

const scoreTerm = (term: string, isLast: boolean, index: TokenIndex, byCategory = false): TermHit | null => {
    const synonyms = synonymsByTerm.get(term) ?? new Set<string>();
    const base = baseScore(term, isLast, index, synonyms, byCategory);
    if (base === null) return null;
    const hits = countConceptHits(index, synonyms);
    const strong = base === SCORE_TITLE_CONCEPT && hits >= STRONG_CONCEPT_HITS;
    return { tier: strong ? SCORE_TITLE_WORD : base, density: Math.min(hits, MAX_DENSITY_HITS) * DENSITY_BONUS };
};

interface QueryTerms {
    hard: string[];
    soft: string[];
}

/** Com algum termo que não é verbo, os verbos viram desempate; só verbos, e eles buscam como qualquer palavra. */
const splitTerms = (terms: string[]): QueryTerms => {
    const hard = terms.filter((term) => !ACTION_VERBS.has(term));
    return hard.length > 0 ? { hard, soft: terms.filter((term) => ACTION_VERBS.has(term)) } : { hard: terms, soft: [] };
};

interface TokenScore {
    matched: number;
    minTier: number;
    sumTier: number;
    verbHits: number;
    exact: boolean;
    density: number;
}

/** `partial`: o token que casa só com parte dos termos ainda entra (o de mais termos vem antes); sem nenhum, não entra. */
const scoreTokenIndex = (query: QueryTerms, index: TokenIndex, partial = false): TokenScore | null => {
    let matched = 0;
    let minTier = Infinity;
    let sumTier = 0;
    let density = 0;
    for (let i = 0; i < query.hard.length; i += 1) {
        const hit = scoreTerm(query.hard[i], i === query.hard.length - 1, index, query.hard.length > 1);
        if (hit === null) {
            if (partial) continue;
            return null;
        }
        matched += 1;
        minTier = Math.min(minTier, hit.tier);
        sumTier += hit.tier;
        density = Math.round((density + hit.density) * 10) / 10;
    }
    if (matched === 0) return null;
    const verbHits = query.soft.filter((verb) => (scoreTerm(verb, false, index)?.tier ?? 0) >= SCORE_TITLE_CONCEPT).length;
    const exact = index.names.some((name) => name.size === new Set(query.hard).size && query.hard.every((term) => name.has(term)));
    return { matched, minTier, sumTier, verbHits, exact, density };
};

const conceptVocabulary = (): Set<string> => new Set([...synonymsByTerm.keys()]);

const compareRanked = <T>(a: Ranked<T>, b: Ranked<T>): number =>
    b.matched - a.matched
    || b.verbHits - a.verbHits
    || Number(b.exact) - Number(a.exact)
    || b.minTier - a.minTier
    || b.sumTier - a.sumTier
    || b.importance - a.importance
    || Number(b.hasImpact) - Number(a.hasImpact)
    || a.idWords - b.idWords
    || b.density - a.density
    || a.order - b.order;

const rankTokens = <T extends SearchableToken>(
    terms: string[],
    tokens: readonly T[],
    catalogMap: ReadonlyMap<string, CatalogSearchEntry>,
    partial = false,
): Ranked<T>[] => {
    const query = splitTerms(terms);
    const ranked: Ranked<T>[] = [];
    tokens.forEach((token, order) => {
        const entry = catalogMap.get(token.id);
        const score = scoreTokenIndex(query, indexOf(token, entry), partial);
        if (score === null) return;
        ranked.push({
            token, order, ...score,
            hasImpact: Boolean(entry?.visualImpact),
            importance: entry?.importance ?? 0,
            idWords: token.id.split(/(?=[A-Z0-9])/).length,
        });
    });
    return ranked.sort(compareRanked);
};

const tokenVocabulary = <T extends SearchableToken>(tokens: readonly T[], catalogMap: ReadonlyMap<string, CatalogSearchEntry>): Set<string> => {
    const vocabulary = conceptVocabulary();
    tokens.forEach((token) => {
        const index = indexOf(token, catalogMap.get(token.id));
        index.title.forEach((word) => vocabulary.add(word));
        index.other.forEach((word) => vocabulary.add(word));
        index.category.forEach((word) => vocabulary.add(word));
    });
    return vocabulary;
};

/**
 * Devolve os tokens que casam com TODOS os termos da consulta (verbos de ação só desempatam). A ordem: nível de
 * verbo de ação, nome idêntico à consulta, nível de casamento, importância, efeito visual provado e, por fim, o geral antes do específico.
 * Sem nenhum resultado, tenta de novo com cada palavra trocada pela mais próxima do vocabulário (um erro de digitação)
 * e, ainda sem nenhum, cai para o melhor casamento parcial: a frase longa nunca zera por uma palavra sem par.
 */
export const searchTokens = <T extends SearchableToken>(
    query: string,
    tokens: readonly T[],
    catalogMap: ReadonlyMap<string, CatalogSearchEntry>,
): T[] => {
    const terms = tokenizeText(query);
    if (terms.length === 0) return [];
    const found = rankTokens(terms, tokens, catalogMap);
    if (found.length > 0) return found.map((item) => item.token);
    const corrected = correctTerms(terms, tokenVocabulary(tokens, catalogMap), 1);
    const retry = corrected ? rankTokens(corrected, tokens, catalogMap) : [];
    if (retry.length > 0) return retry.map((item) => item.token);
    return rankTokens(corrected ?? terms, tokens, catalogMap, true).map((item) => item.token);
};

/** A consulta com as palavras desconhecidas trocadas pelas mais próximas do catálogo (até dois erros); `null` se nada se aproxima. */
export const suggestQuery = (query: string, catalogMap: ReadonlyMap<string, CatalogSearchEntry>): string | null => {
    const terms = tokenizeText(query);
    const vocabulary = conceptVocabulary();
    catalogMap.forEach((entry) => [entry.name ?? '', ...(entry.tags ?? [])].flatMap(tokenizeText).forEach((word) => vocabulary.add(word)));
    return correctTerms(terms, vocabulary, 2)?.join(' ') ?? null;
};

/** Verdadeiro se todos os termos da consulta casam com o texto (palavra inteira, conceito ou prefixo no último termo). */
export const matchesText = (query: string, text: string): boolean => {
    const terms = tokenizeText(query);
    if (terms.length === 0) return false;
    const words = new Set(tokenizeText(text));
    return scoreTokenIndex(splitTerms(terms), { title: words, names: [words], category: new Set(), other: new Set() }) !== null;
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
