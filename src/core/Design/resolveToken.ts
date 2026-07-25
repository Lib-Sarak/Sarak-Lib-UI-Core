/**
 * Resolutor oficial de tokens semânticos de espaçamento (Spec 16).
 *
 * Os átomos estruturais descrevem espaçamento com tokens semânticos
 * (`gap="spacing-md"`). Antes desta camada, eles jogavam a string CRUA no CSS
 * (`gap: spacing-md`) — inválida e descartada em silêncio pelo browser. Este módulo é
 * a fonte ÚNICA que traduz token → CSS Variable, deixa passar CSS já válido e AVISA
 * (com sugestão) quando o autor inventa um valor, degradando para o default do Design
 * Engine em vez de quebrar a tela.
 *
 * As `px` abaixo são apenas FALLBACKS dentro de `var(--x, N)` — o mesmo padrão
 * canônico já emitido por `src/core/Provider/manifest.ts`; a fonte real do valor
 * continua sendo a CSS Variable do tema.
 */

/**
 * Mapa oficial dos tokens de espaçamento → CSS Variable (com fallback).
 * FONTE ÚNICA. Manter os valores atrelados às vars `--sarak-layout-gap-*`.
 */
export const SPACING_TOKENS: Readonly<Record<string, string>> = {
    'spacing-xs': 'calc(var(--sarak-layout-gap-sm, 8px) * 0.5)',
    'spacing-sm': 'var(--sarak-layout-gap-sm, 8px)',
    'spacing-md': 'var(--sarak-layout-gap-md, 16px)',
    'spacing-lg': 'var(--sarak-layout-gap-lg, 24px)',
    'spacing-xl': 'calc(var(--sarak-layout-gap-lg, 24px) * 1.5)',
};

/** Nomes dos tokens de espaçamento válidos (ordem de declaração). */
export const SPACING_TOKEN_NAMES: readonly string[] = Object.keys(SPACING_TOKENS);

/** Funções CSS que produzem comprimentos válidos e passam direto (com fallback). */
const CSS_LENGTH_FUNCTIONS = /^(var|calc|clamp|min|max)\(/;

/** Comprimento CSS literal com unidade suportada, ou o zero adimensional. */
const CSS_LENGTH_LITERAL = /^-?\d*\.?\d+(px|rem|em|%|vh|vw|ch|vmin|vmax)$/;

/**
 * `true` quando o valor já é CSS válido de comprimento (function com fallback,
 * literal com unidade, ou o `0` adimensional) e deve passar sem tradução.
 */
export const isPassthroughCss = (value: string): boolean => {
    const raw = value.trim();
    if (raw === '0') return true;
    if (CSS_LENGTH_FUNCTIONS.test(raw)) return true;
    return CSS_LENGTH_LITERAL.test(raw);
};

/** `true` quando o valor é um token semântico conhecido OU CSS já resolvível. */
export const isResolvableSpacing = (value: unknown): boolean => {
    if (typeof value === 'number') return Number.isFinite(value);
    if (typeof value !== 'string') return false;
    const raw = value.trim();
    return raw in SPACING_TOKENS || isPassthroughCss(raw);
};

/** Distância de edição mínima (Levenshtein) — base da sugestão de token. */
const editDistance = (a: string, b: string): number => {
    const rows = Array.from({ length: a.length + 1 }, (_, i) => {
        const row = new Array<number>(b.length + 1).fill(0);
        row[0] = i;
        return row;
    });
    for (let j = 0; j <= b.length; j += 1) rows[0][j] = j;
    for (let i = 1; i <= a.length; i += 1) {
        for (let j = 1; j <= b.length; j += 1) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            rows[i][j] = Math.min(rows[i - 1][j] + 1, rows[i][j - 1] + 1, rows[i - 1][j - 1] + cost);
        }
    }
    return rows[a.length][b.length];
};

/** Token oficial mais próximo do valor inventado (para a mensagem de aviso). */
const suggestToken = (value: string): string =>
    [...SPACING_TOKEN_NAMES].sort((a, b) => editDistance(value, a) - editDistance(value, b))[0];

/** Cache de avisos já emitidos — evita spam sob re-render/loops. */
const warned = new Set<string>();

/** Reseta o cache de avisos (uso em testes). */
export const resetTokenWarnings = (): void => warned.clear();

/** Contexto opcional para enriquecer o aviso de valor inválido. */
export interface ResolveTokenOptions {
    /** Nome do átomo que recebeu o valor (ex.: `SarakFlex`). */
    atom?: string;
    /** Nome da prop (ex.: `gap`). */
    prop?: string;
    /** Valor CSS usado quando o token é inválido/ausente (default do Design Engine). */
    fallback?: string;
}

const warnUnknownToken = (value: string, options: ResolveTokenOptions): void => {
    const target = `${options.atom ?? 'átomo'}.${options.prop ?? 'medida'}`;
    const key = `${target}:${value}`;
    if (warned.has(key)) return;
    warned.add(key);
    console.warn(
        `[Sarak UI] Valor de espaçamento inválido "${value}" em ${target} — ignorado. ` +
            `Você quis dizer "${suggestToken(value)}"? ` +
            `Tokens válidos: ${SPACING_TOKEN_NAMES.join(', ')}; ` +
            `ou um comprimento CSS (16px, 1rem, var(--x, 16px)). ` +
            `Aplicando o padrão do Design Engine.`,
    );
};

/**
 * Traduz uma medida semântica para CSS aplicável.
 * Ordem: token semântico conhecido → CSS válido (passthrough) → aviso + fallback.
 * `undefined`/vazio devolve o `fallback` sem avisar (ausência é legítima).
 */
export const resolveToken = (
    value: string | number | undefined | null,
    options: ResolveTokenOptions = {},
): string | undefined => {
    if (value == null) return options.fallback;
    if (typeof value === 'number') return Number.isFinite(value) ? `${value}px` : options.fallback;
    const raw = value.trim();
    if (raw === '') return options.fallback;
    if (raw in SPACING_TOKENS) return SPACING_TOKENS[raw];
    if (isPassthroughCss(raw)) return raw;
    warnUnknownToken(raw, options);
    return options.fallback;
};
