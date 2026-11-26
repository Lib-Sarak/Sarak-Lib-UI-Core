import type { SarakDesignToken } from '../../../core/Design/types';

export interface SearchableToken extends SarakDesignToken {
    componentLabel?: string;
    /** O nome que o painel mostra no idioma em uso, quando difere do português do schema: a busca o acha pelo que a tela diz. */
    localizedLabel?: string;
    /** Os rótulos das opções no idioma em uso. */
    localizedOptions?: string[];
    /** O ajuste vale para o sistema todo (schema geral), não para um componente: numa frase vaga ele vem antes do específico. */
    general?: boolean;
}

/** Os schemas de alcance geral: o ajuste de um deles muda o sistema inteiro, e não um componente. */
const GENERAL_SCHEMA_IDS: ReadonlySet<string> = new Set(['global', 'system', 'colors', 'motion', 'typography']);

export const isGeneralSchema = (schemaId: string): boolean => GENERAL_SCHEMA_IDS.has(schemaId);

export interface CatalogSearchEntry {
    name?: string;
    description?: string;
    tags?: string[];
    categories?: string[];
    importance?: number;
    visualImpact?: string;
}

export interface TokenIndex {
    title: Set<string>;
    /** As palavras de cada nome do token (o do schema e o do catálogo), para saber se a consulta é o nome inteiro. */
    names: Set<string>[];
    /** Categorias do catálogo: classificação curada; numa consulta de vários termos, a palavra (ou seu plural) nela vale como no nome. */
    category: Set<string>;
    other: Set<string>;
}

/** Palavras de ligação e de pedido ("mudar a largura"): não dizem o que mudar, então nunca filtram. */
const STOP_WORDS = new Set(
    'de do da dos das o a os as e em no na nos nas para com um uma ao aos sem mudar trocar alterar deixar deixo como colocar ajustar quero mais menos muito pouco quando abrir fechar passa seletor'.split(' '),
);

export const normalizeText = (text: string): string =>
    text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export const tokenizeText = (text: string): string[] =>
    normalizeText(text)
        .split(/[^a-z0-9]+/)
        .filter((word) => word.length > 1 && !STOP_WORDS.has(word));

const buildIndex = (token: SearchableToken, entry: CatalogSearchEntry | undefined): TokenIndex => {
    const idWords = token.id.replace(/([a-z0-9])([A-Z])/g, '$1 $2');
    const optionLabels = (token.options ?? token.constraints?.options ?? []).map((option) => option.label ?? '');
    const otherTexts = [
        idWords, ...(entry?.tags ?? []), ...optionLabels, ...(token.localizedOptions ?? []),
        entry?.description ?? '', token.description ?? '', token.componentLabel ?? ''
    ];
    const names = [token.label, entry?.name ?? '', token.localizedLabel ?? ''].map((name) => new Set(tokenizeText(name)));
    return {
        title: new Set(names.flatMap((name) => [...name])),
        names,
        category: new Set((entry?.categories ?? []).flatMap(tokenizeText)),
        other: new Set([normalizeText(token.id), ...otherTexts.flatMap(tokenizeText)])
    };
};

interface CachedIndex {
    label: string;
    localized: string;
    entry: CatalogSearchEntry | undefined;
    index: TokenIndex;
}

/** A tela reconstrói os tokens a cada consulta; o índice só muda quando o rótulo ou a entrada do catálogo mudam. */
const indexCache = new Map<string, CachedIndex>();

export const indexOf = (token: SearchableToken, entry: CatalogSearchEntry | undefined): TokenIndex => {
    const cached = indexCache.get(token.id);
    const localized = `${token.localizedLabel ?? ''}|${(token.localizedOptions ?? []).join('|')}`;
    if (cached && cached.label === token.label && cached.localized === localized && cached.entry === entry) return cached.index;
    const index = buildIndex(token, entry);
    indexCache.set(token.id, { label: token.label, localized, entry, index });
    return index;
};

