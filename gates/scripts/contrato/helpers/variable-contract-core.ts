// Núcleo (sem E/S de saída) do gate `variable-contract:check`: o que o motor EMITE, o que o código LÊ e o
// que cada reserva `var(--x, F)` promete. O script `check-variable-contract.ts` só imprime e decide o exit.
import fs from 'node:fs';
import path from 'node:path';
import { sarakGetAllDesignTokens } from '../../../../src/core/Design/master-map';
import { parseToRgba } from '../../../../src/core/Provider/utils/color-engine';

export interface TokenLike {
    id: string;
    type?: string;
    unit?: string;
    defaultValue?: unknown;
    cssVars?: string[];
    generateVariants?: boolean;
    exceptionOf?: string;
}

export interface Occurrence {
    file: string;
    line: number;
}

export interface FallbackFinding extends Occurrence {
    name: string;
    fallback: string;
    expected: string;
}

/** Sufixos que o `useDesignVariables` gera para cada `cssVars` / só para a variável automática. */
export const CSS_VAR_VARIANTS = ['rgb', 'bg', 'border', '10', '20', '30', '40', '50', 'hover', 'active', 'light'];
export const AUTO_VAR_VARIANTS = ['rgb', 'bg', 'border', '10', '20', '30', '40', '50', 'hover'];

/** Variantes cujo valor não depende do modo (as de hover/ativo/claro dependem da âncora do modo). */
const MODE_FREE_VARIANTS = ['rgb', 'bg', 'border', '10', '20', '30', '40', '50'];

export const toKebab = (id: string): string => id.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);

export interface EmittedName {
    name: string;
    tokenId: string;
    /** `base` quando é o nome do token; `variant` quando é gerado de uma cor. */
    kind: 'base' | 'variant';
    base?: string;
    suffix?: string;
}

/** Todo nome que o laço de tokens do `useDesignVariables` escreve, com o dono. */
export function emittedNames(tokens: TokenLike[]): EmittedName[] {
    const out: EmittedName[] = [];
    for (const token of tokens) {
        const auto = `--sarak-${toKebab(token.id)}`;
        const cssVars = token.cssVars ?? [];
        for (const name of new Set([auto, ...cssVars])) out.push({ name, tokenId: token.id, kind: 'base' });
        if (token.generateVariants && token.type === 'color') {
            for (const base of new Set(cssVars)) {
                for (const suffix of CSS_VAR_VARIANTS) out.push({ name: `${base}-${suffix}`, tokenId: token.id, kind: 'variant', base, suffix });
            }
            for (const suffix of AUTO_VAR_VARIANTS) out.push({ name: `${auto}-${suffix}`, tokenId: token.id, kind: 'variant', base: auto, suffix });
        }
    }
    return out;
}

export interface OwnerConflict {
    name: string;
    owners: string[];
}

/** Variável com mais de um dono, salvo o par mestre + exceção declarado (`exceptionOf`). */
export function ownerConflicts(tokens: TokenLike[]): OwnerConflict[] {
    const byId = new Map(tokens.map((token) => [token.id, token]));
    const owners = new Map<string, Set<string>>();
    for (const item of emittedNames(tokens)) {
        owners.set(item.name, (owners.get(item.name) ?? new Set()).add(item.tokenId));
    }
    const conflicts: OwnerConflict[] = [];
    for (const [name, ids] of owners) {
        if (ids.size < 2) continue;
        const list = [...ids];
        const masters = list.filter((id) => !byId.get(id)?.exceptionOf);
        const exceptionsOfMaster = list.every((id) => {
            const exceptionOf = byId.get(id)?.exceptionOf;
            return !exceptionOf || (masters.length === 1 && exceptionOf === masters[0]);
        });
        if (masters.length === 1 && exceptionsOfMaster) continue;
        conflicts.push({ name, owners: list.sort() });
    }
    return conflicts.sort((a, b) => a.name.localeCompare(b.name));
}

// --- Leitura do código ------------------------------------------------------------------------------

const SKIPPED_DIRS = new Set(['__tests__', 'generated', 'catalog', 'node_modules']);

export function sourceFiles(srcDir: string): string[] {
    const files: string[] = [];
    const walk = (dir: string): void => {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            const full = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                if (!SKIPPED_DIRS.has(entry.name)) walk(full);
            } else if (/\.(css|ts|tsx)$/.test(entry.name) && !/\.(test|spec)\./.test(entry.name) && !entry.name.endsWith('.d.ts')) {
                files.push(full);
            }
        }
    };
    walk(srcDir);
    return files.sort();
}

/** Troca comentário por espaços (preserva as linhas). Em `.ts` o `//` só vale no início da linha ou após espaço. */
export function stripComments(text: string, isCss: boolean): string {
    const blank = (match: string): string => match.replace(/[^\n]/g, ' ');
    const noBlock = text.replace(/\/\*[\s\S]*?\*\//g, blank);
    return isCss ? noBlock : noBlock.replace(/(^|[\s;,{(])\/\/.*$/gm, (match, lead: string) => lead + blank(match.slice(lead.length)));
}

/** Índice do `)` que fecha o `(` em `openIndex`, ou -1. */
function closingParen(text: string, openIndex: number): number {
    let depth = 0;
    for (let i = openIndex; i < text.length; i += 1) {
        if (text[i] === '(') depth += 1;
        else if (text[i] === ')') {
            depth -= 1;
            if (depth === 0) return i;
        }
    }
    return -1;
}

export interface VarRead extends Occurrence {
    name: string;
    /** Texto da reserva (depois da primeira vírgula de topo), ou `null` quando não há. */
    fallback: string | null;
}

const VAR_HEAD = /var\(\s*(--[A-Za-z][\w-]*)\s*([,)])/g;

export function readsIn(text: string, file: string): VarRead[] {
    const reads: VarRead[] = [];
    for (const match of text.matchAll(VAR_HEAD)) {
        const openIndex = match.index! + 'var'.length;
        const line = text.slice(0, match.index).split('\n').length;
        if (match[2] === ')') {
            reads.push({ file, line, name: match[1], fallback: null });
            continue;
        }
        const close = closingParen(text, openIndex);
        const afterComma = match.index! + match[0].length;
        const fallback = close === -1 ? '' : text.slice(afterComma, close).trim();
        reads.push({ file, line, name: match[1], fallback });
    }
    return reads;
}

/** Declarações de variável: `--x:` em CSS ou em string de TS, chave `'--x':` e `setProperty('--x'`. */
export function declaredIn(text: string): string[] {
    const names = new Set<string>();
    for (const m of text.matchAll(/(^|[\s;{'"`])(--[A-Za-z][\w-]*)\s*:/g)) names.add(m[2]);
    for (const m of text.matchAll(/['"`](--[A-Za-z][\w-]*)['"`]\s*:/g)) names.add(m[1]);
    for (const m of text.matchAll(/setProperty\(\s*['"`](--[A-Za-z][\w-]*)['"`]/g)) names.add(m[1]);
    return [...names];
}

/** Os nomes que o `useDesignVariables` escreve fora do laço de tokens (aliases e derivados). */
export function runtimeNames(runtimeSource: string): string[] {
    const names = new Set<string>();
    for (const m of runtimeSource.matchAll(/['"`](--[A-Za-z][\w-]*)['"`]/g)) names.add(m[1]);
    return [...names];
}

// --- Reserva × padrão -------------------------------------------------------------------------------

const KEYWORD = /^[a-z-]+$/i;

function normalizeText(value: string): string {
    return value
        .trim()
        .toLowerCase()
        .replace(/"/g, "'")
        .replace(/\s+/g, ' ')
        .replace(/\s*,\s*/g, ',')
        .replace(/\(\s+/g, '(')
        .replace(/\s+\)/g, ')')
        .replace(/(^|[^\d])0\.(\d)/g, '$1.$2');
}

function withUnit(value: unknown, unit: string | undefined): string {
    if (typeof value === 'number') return unit ? `${value}${unit}` : String(value);
    return String(value);
}

/** Só o arredondamento de escrita (`.05` × `0.05`); 0,02 e 0,03 são duas cores. */
const ALPHA_TOLERANCE = 0.001;

/** Palavra-chave que vale para qualquer propriedade: o resto (`thin`, `medium`) não é comprimento. */
const WIDE_KEYWORDS = ['inherit', 'initial', 'unset', 'revert', 'auto', 'none', 'normal', 'currentcolor', 'transparent'];

function sameColor(a: string, b: string): boolean {
    try {
        const left = parseToRgba(a);
        const right = parseToRgba(b);
        if (![left.r, left.g, left.b, right.r, right.g, right.b].every(Number.isFinite)) return false;
        return left.r === right.r && left.g === right.g && left.b === right.b && Math.abs((left.a ?? 1) - (right.a ?? 1)) < ALPHA_TOLERANCE;
    } catch {
        return false;
    }
}

const looksLikeColor = (value: string): boolean => /^(#[0-9a-f]{3,8}|rgba?\(|hsla?\()/i.test(value.trim());

/** Os valores que o padrão do token admite como reserva (responsivo: os três pontos; piso mobile-first incluso). */
export function acceptedDefaults(token: TokenLike): string[] {
    const value = token.defaultValue;
    if (value && typeof value === 'object' && 'mob' in (value as object)) {
        const responsive = value as Record<string, unknown>;
        return [responsive.mob, responsive.tab, responsive.desk].filter((item) => item !== undefined).map((item) => withUnit(item, token.unit));
    }
    return value === undefined || value === null ? [] : [withUnit(value, token.unit)];
}

/** `true` quando a reserva é o padrão do token, uma palavra-chave ou outra leitura. */
export function fallbackMatches(fallback: string, token: TokenLike): boolean {
    const text = fallback.trim();
    if (text === '' || /^var\(/i.test(text) || text.includes('${')) return true;
    // Variável com unidade carrega um comprimento: a palavra-chave que não vale para a propriedade (`thin`) é achado.
    if (KEYWORD.test(text)) return !token.unit || WIDE_KEYWORDS.includes(text.toLowerCase());
    const accepted = acceptedDefaults(token);
    if (accepted.length === 0) return true;
    const normalized = normalizeText(text);
    return accepted.some((candidate) => {
        if (normalizeText(candidate) === normalized) return true;
        if (token.type === 'color' && looksLikeColor(candidate) && looksLikeColor(text)) return sameColor(candidate, text);
        return false;
    });
}

export interface NameIndex {
    byName: Map<string, { token: TokenLike; item: EmittedName; derived?: boolean }>;
    /** Nomes derivados (alias de fachada, canal `-rgb`) entram com o dono do nome de origem: a reserva é julgada em CSS e em componente. */
}

/** Nome → token dono, só para nomes com UM dono (os conflitos são outro achado). */
export function indexByName(tokens: TokenLike[]): NameIndex {
    const byId = new Map(tokens.map((token) => [token.id, token]));
    const byName = new Map<string, { token: TokenLike; item: EmittedName }>();
    const seen = new Map<string, Set<string>>();
    for (const item of emittedNames(tokens)) {
        seen.set(item.name, (seen.get(item.name) ?? new Set()).add(item.tokenId));
        if (!byName.has(item.name)) byName.set(item.name, { token: byId.get(item.tokenId)!, item });
    }
    for (const [name, ids] of seen) {
        if (ids.size < 2) continue;
        // mestre + exceção: o mestre fala pelo nome
        const master = [...ids].map((id) => byId.get(id)!).find((token) => !token.exceptionOf);
        if (master) byName.set(name, { token: master, item: { name, tokenId: master.id, kind: 'base' } });
        else byName.delete(name);
    }
    return { byName };
}

/**
 * Nomes que o motor escreve FORA do laço de tokens mas que valem o valor de um token: o canal `r, g, b` do
 * fundo do corpo e da sidebar (`emitColorChannels`) e os aliases de fachada (`--accent-color`, `--text-main`…,
 * o `aliasPairs` do `useDesignVariables`). Entram no índice com o dono do nome de origem, para a reserva deles
 * ser julgada contra o padrão do mesmo token — antes só o nome do token tinha reserva conferida.
 */
export function addDerivedNames(index: NameIndex, runtimeSources: string[]): number {
    let added = 0;
    const text = runtimeSources.join('\n');
    const add = (name: string, source: string, kind: 'rgb' | 'alias'): void => {
        const owner = index.byName.get(source);
        if (!owner || index.byName.has(name)) return;
        const item: EmittedName = kind === 'rgb'
            ? { name, tokenId: owner.token.id, kind: 'variant', base: source, suffix: 'rgb' }
            : { name, tokenId: owner.token.id, kind: 'base' };
        index.byName.set(name, { token: owner.token, item, derived: true });
        added += 1;
    };
    for (const m of text.matchAll(/\[\s*'(--[\w-]+-rgb)'\s*,\s*'(--[\w-]+)'\s*\]/g)) add(m[1], m[2], 'rgb');
    for (const m of text.matchAll(/\[\s*'(--[\w-]+)'\s*,\s*variables\['(--[\w-]+)'\]/g)) add(m[1], m[2], 'alias');
    return added;
}

/**
 * As variáveis declaradas num CSS, SEM contar a regra cujo seletor nunca casa: toda alternativa do seletor
 * exige um atributo `[data-…]` que nenhum token emite nem código escreve. Declarar sob um seletor assim não
 * faz da variável "escrita" — era o caso de `--font-size-factor`, sob `[data-font-scale]`.
 */
export function liveDeclaredIn(cssText: string, attributeWriters: ReadonlySet<string>): string[] {
    const names = new Set<string>();
    for (const match of cssText.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
        const alternatives = match[1].split(',').map((item) => item.trim()).filter(Boolean);
        const attributesOf = (selector: string): string[] => [...selector.matchAll(/\[(data-[\w-]+)/g)].map((m) => m[1]);
        const isDead = (selector: string): boolean => attributesOf(selector).some((name) => !attributeWriters.has(name));
        if (alternatives.length > 0 && alternatives.every(isDead)) continue;
        for (const name of declaredIn(match[2])) names.add(name);
    }
    return [...names];
}

/** A reserva que o padrão do token promete para a variante (cor com `generateVariants`), ou `null` se depende do modo. */
function expectedVariantFallback(owner: { token: TokenLike; item: EmittedName }, computeVariant: (color: string, suffix: string) => string | null): string | null {
    const { item, token } = owner;
    if (item.kind !== 'variant' || !item.suffix || !MODE_FREE_VARIANTS.includes(item.suffix)) return null;
    const accepted = acceptedDefaults(token)[0];
    if (!accepted) return null;
    return computeVariant(accepted, item.suffix);
}

/**
 * A reserva de uma variante é a variante do padrão. `-rgb` é um CANAL (`0, 242, 255`), não uma cor: compara
 * como texto. Antes ele passava por `sameColor`, e `parseToRgba` devolve preto para o que não reconhece — os
 * dois lados viravam preto e QUALQUER canal (até "banana") passava. Nas outras variantes só vale cor com cor.
 */
export function variantFallbackMatches(fallback: string, expected: string, suffix: string | undefined): boolean {
    if (normalizeText(fallback) === normalizeText(expected)) return true;
    if (suffix === 'rgb') return false;
    return looksLikeColor(fallback) && looksLikeColor(expected) && sameColor(fallback, expected);
}

/**
 * O VALOR que cada nome DERIVADO declarado em CSS da lib carrega (`--radius-btn: var(--sarak-btn-border-radius, var(--radius-sarak))`
 * → o literal em que a cadeia termina: `12px`). Um nome que é variável de token ou alias já indexado fica de fora (o
 * dono é o token). Só entra o que a cadeia resolve a UM literal; `calc()`, lista e `color-mix()` ficam sem valor.
 */
export function declaredDefaults(cssTexts: string[], index: NameIndex): Map<string, string> {
    const raw = new Map<string, string>();
    for (const text of cssTexts) {
        for (const match of text.matchAll(/(?:^|[\s;{])(--[A-Za-z][\w-]*)\s*:\s*([^;{}]+?)\s*(?=;|})/g)) {
            if (!raw.has(match[1])) raw.set(match[1], match[2].trim());
        }
    }
    const resolve = (value: string, depth: number): string | null => {
        if (depth > 8) return null;
        const text = value.trim();
        const head = /^var\(\s*(--[\w-]+)\s*(?:,\s*([\s\S]*))?\)$/.exec(text);
        if (!head) return /(^|[^a-z0-9_-])(var|calc|color-mix)[(]/i.test(text) ? null : text;
        const [, name, fallback] = head;
        if (fallback !== undefined && fallback.trim() !== '') return resolve(fallback, depth + 1);
        const owner = index.byName.get(name);
        if (owner) return acceptedDefaults(owner.token)[0] ?? null;
        const declared = raw.get(name);
        return declared === undefined ? null : resolve(declared, depth + 1);
    };
    const out = new Map<string, string>();
    for (const [name, value] of raw) {
        if (index.byName.has(name)) continue;
        const resolved = resolve(value, 0);
        if (resolved !== null && resolved !== '') out.set(name, resolved);
    }
    return out;
}

/** Duas reservas escritas de formas diferentes dizem o mesmo valor: texto normalizado, ou a mesma cor com alfa estreito. */
export function sameLiteral(a: string, b: string): boolean {
    if (normalizeText(a) === normalizeText(b)) return true;
    return looksLikeColor(a) && looksLikeColor(b) && sameColor(a, b);
}

export interface FallbackScan {
    findings: FallbackFinding[];
    checked: number;
}

export function scanFallbacks(
    reads: VarRead[],
    index: NameIndex,
    computeVariant: (color: string, suffix: string) => string | null,
    declared: ReadonlyMap<string, string> = new Map(),
): FallbackScan {
    const findings: FallbackFinding[] = [];
    let checked = 0;
    for (const read of reads) {
        if (read.fallback === null) continue;
        const owner = index.byName.get(read.name);
        if (!owner) {
            const carried = declared.get(read.name);
            const text = read.fallback.trim();
            if (carried === undefined || text === '' || /^var\(/i.test(text) || KEYWORD.test(text) || text.includes('${')) continue;
            checked += 1;
            if (!sameLiteral(text, carried)) findings.push({ file: read.file, line: read.line, name: read.name, fallback: read.fallback, expected: carried });
            continue;
        }
        if (owner.item.kind === 'variant') {
            const expected = expectedVariantFallback(owner, computeVariant);
            if (expected === null || /^var\(/i.test(read.fallback) || read.fallback === '') continue;
            checked += 1;
            if (!variantFallbackMatches(read.fallback, expected, owner.item.suffix)) {
                findings.push({ file: read.file, line: read.line, name: read.name, fallback: read.fallback, expected });
            }
            continue;
        }
        checked += 1;
        if (fallbackMatches(read.fallback, owner.token)) continue;
        findings.push({ file: read.file, line: read.line, name: read.name, fallback: read.fallback, expected: acceptedDefaults(owner.token).join(' | ') });
    }
    return { findings, checked };
}

export function loadTokens(): TokenLike[] {
    return sarakGetAllDesignTokens() as unknown as TokenLike[];
}
