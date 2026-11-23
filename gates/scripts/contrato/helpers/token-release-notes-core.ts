// Núcleo puro do gate `token-release-notes:check`: fotografa os tokens de um schema, compara duas fotografias,
// recorta a entrada de uma versão em `docs/migracoes.md` e escreve a seção de tokens. Sem I/O — o gate faz o resto.

/** Tipo mínimo de token que o núcleo lê; o `SarakDesignToken` do schema o satisfaz. */
export interface TokenLike {
    id: string;
    type: string;
    unit?: string;
    min?: number;
    max?: number;
    options?: { value?: string; id?: string }[];
    constraints?: { min?: number; max?: number; options?: { value?: string; id?: string }[] };
}

/** A gramática de valor que o gate enxerga: opções de um select, ou faixa e unidade de um slider/número. */
export interface TokenGrammar {
    options?: string[];
    min?: number;
    max?: number;
    unit?: string;
}

export interface TokenFacts {
    type: string;
    grammar: TokenGrammar;
}

export type TokenSnapshot = Record<string, TokenFacts>;

export interface TokenChange {
    id: string;
    before: TokenFacts;
    after: TokenFacts;
}

export interface TokenDiff {
    added: string[];
    removed: string[];
    changed: TokenChange[];
}

const optionValue = (option: { value?: string; id?: string }): string => String(option.value ?? option.id ?? '');

function readGrammar(token: TokenLike): TokenGrammar {
    const rawOptions = token.options ?? token.constraints?.options;
    const grammar: TokenGrammar = {};
    if (rawOptions && rawOptions.length > 0) grammar.options = rawOptions.map(optionValue).sort();
    const min = token.min ?? token.constraints?.min;
    const max = token.max ?? token.constraints?.max;
    if (min !== undefined) grammar.min = min;
    if (max !== undefined) grammar.max = max;
    if (token.unit) grammar.unit = token.unit;
    return grammar;
}

/** Fotografa os tokens: id → tipo e gramática de valor. */
export function snapshotTokens(tokens: TokenLike[]): TokenSnapshot {
    const snapshot: TokenSnapshot = {};
    for (const token of tokens) snapshot[token.id] = { type: token.type, grammar: readGrammar(token) };
    return snapshot;
}

const sameFacts = (a: TokenFacts, b: TokenFacts): boolean => JSON.stringify(a) === JSON.stringify(b);

/** Acrescentados, removidos e com tipo ou gramática novos entre duas fotografias. */
export function diffSnapshots(before: TokenSnapshot, after: TokenSnapshot): TokenDiff {
    const added = Object.keys(after).filter((id) => !(id in before)).sort();
    const removed = Object.keys(before).filter((id) => !(id in after)).sort();
    const changed = Object.keys(after)
        .filter((id) => id in before && !sameFacts(before[id], after[id]))
        .sort()
        .map((id) => ({ id, before: before[id], after: after[id] }));
    return { added, removed, changed };
}

/** Todo nome que a entrada da versão precisa citar. */
export const namesOf = (diff: TokenDiff): string[] =>
    [...diff.added, ...diff.removed, ...diff.changed.map((change) => change.id)].sort();

/** Versão sem sufixo de prévia: `8.1.0-rc.1` → `8.1.0`. */
export const coreVersion = (version: string): string => version.split('-')[0];

/** Junta as seções `## ...` cujo título cita a versão por extenso (o texto que o gate lê). */
export function extractVersionNotes(migrationsText: string, version: string): string {
    const core = coreVersion(version).replace(/\./g, '\\.');
    const cited = new RegExp(`(^|[^\\d.])${core}(?![\\d.]*\\d)`);
    const sections = migrationsText.split(/^(?=## )/m);
    return sections.filter((section) => section.startsWith('## ') && cited.test(section.split('\n', 1)[0])).join('\n');
}

const escapeRegExp = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Nomes que a entrada não cita como palavra inteira. */
export function missingNames(names: string[], notes: string): string[] {
    return names.filter((name) => !new RegExp(`(?<![A-Za-z0-9_])${escapeRegExp(name)}(?![A-Za-z0-9_])`).test(notes));
}

function describeGrammar(grammar: TokenGrammar): string {
    const parts: string[] = [];
    if (grammar.options) parts.push(`opções: ${grammar.options.map((value) => `\`${value}\``).join(', ')}`);
    if (grammar.min !== undefined || grammar.max !== undefined) parts.push(describeRange(grammar));
    return parts.join('; ');
}

const OPTIONS_INLINE_LIMIT = 8;

function describeFacts(facts: TokenFacts): string {
    const options = facts.grammar.options;
    if (options && options.length > OPTIONS_INLINE_LIMIT) {
        return `${facts.type} (${options.length} opções)`;
    }
    const grammar = describeGrammar(facts.grammar);
    return grammar ? `${facts.type} (${grammar})` : facts.type;
}

function describeChange(change: TokenChange): string {
    const { before, after } = change;
    if (before.type !== after.type) return `\`${change.id}\` — tipo ${before.type} → ${after.type}`;
    const oldOptions = new Set(before.grammar.options ?? []);
    const newOptions = new Set(after.grammar.options ?? []);
    const gained = [...newOptions].filter((value) => !oldOptions.has(value));
    const lost = [...oldOptions].filter((value) => !newOptions.has(value));
    const notes: string[] = [];
    if (gained.length > 0) notes.push(`opções acrescentadas: ${listValues(gained)}`);
    if (lost.length > 0) notes.push(`opções removidas: ${listValues(lost)}`);
    if (notes.length === 0) notes.push(`${describeRange(after.grammar)} (era ${describeRange(before.grammar)})`);
    return `\`${change.id}\` — ${after.type}; ${notes.join('; ')}`;
}

/** Lista curta de valores; acima do limite, só a contagem (a lista inteira mora no schema, R17). */
function listValues(values: string[]): string {
    if (values.length > OPTIONS_INLINE_LIMIT) return `${values.length} valores`;
    return values.map((value) => `\`${value}\``).join(', ');
}

function describeRange(grammar: TokenGrammar): string {
    if (grammar.min === undefined && grammar.max === undefined) return 'sem faixa';
    const unit = grammar.unit ? ` ${grammar.unit}` : '';
    return `faixa ${grammar.min ?? '…'} a ${grammar.max ?? '…'}${unit}`;
}

/** Destino provisório da linha de um removido; o mesmo texto que o gerador do kit aceita como "sem par". */
const REMOVED_WITHOUT_DESTINATION = 'sem substituto';

/** As linhas de lista (markdown) que a seção da versão leva: acrescentados, removidos e com valor novo. */
export function renderTokenLists(diff: TokenDiff, before: TokenSnapshot, after: TokenSnapshot): string {
    const blocks: string[] = [];
    if (diff.added.length > 0) {
        const lines = diff.added.map((id) => `- \`${id}\` — ${describeFacts(after[id])}`);
        blocks.push(`**Acrescentados (${diff.added.length})**\n\n${lines.join('\n')}`);
    }
    if (diff.removed.length > 0) {
        // O gerador do kit lê o destino depois de `→` (`parseRemovedTokens`): sem ele a linha derruba o `guide`.
        // O núcleo não sabe quem herdou o papel, então escreve o texto honesto; quem edita troca por `nomeNovo`.
        const lines = diff.removed.map((id) => `- \`${id}\` — ${describeFacts(before[id])} → ${REMOVED_WITHOUT_DESTINATION}`);
        blocks.push(`**Removidos (${diff.removed.length})**\n\n${lines.join('\n')}`);
    }
    if (diff.changed.length > 0) {
        const lines = diff.changed.map((change) => `- ${describeChange(change)}`);
        blocks.push(`**Com tipo ou valor novo (${diff.changed.length})**\n\n${lines.join('\n')}`);
    }
    return blocks.join('\n\n');
}

/** Maior versão estável estritamente anterior à `version` (tags `vX.Y.Z` sem sufixo); `null` se não houver. */
export function baselineTag(tags: string[], version: string): string | null {
    const toParts = (text: string): number[] => text.replace(/^v/, '').split('.').map(Number);
    const compare = (a: number[], b: number[]): number => a[0] - b[0] || a[1] - b[1] || a[2] - b[2];
    const current = toParts(coreVersion(version));
    const lower = tags
        .filter((tag) => /^v\d+\.\d+\.\d+$/.test(tag))
        .filter((tag) => compare(toParts(tag), current) < 0)
        .sort((a, b) => compare(toParts(b), toParts(a)));
    return lower[0] ?? null;
}
