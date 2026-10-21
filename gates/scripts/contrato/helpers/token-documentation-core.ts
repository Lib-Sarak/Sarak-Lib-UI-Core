// Núcleo puro do gate de documentação de token: recebe os tokens do schema e a lista de exceção e devolve os
// achados. Separado do script para o teste de mutação plantar um token sem `usage`, sem `kind` ou com
// `interactsWith` para um id que não existe, sem depender do dicionário real.

export const KINDS = ['aesthetic', 'functional'] as const;

/** Faixa do `usage`: uma ou duas frases. Abaixo disso é rótulo repetido; acima, prosa que vira cópia da fonte. */
export const USAGE_MIN_LENGTH = 25;
export const USAGE_MAX_LENGTH = 420;

export interface DocumentedTokenLike {
    id: string;
    label?: string;
    kind?: string;
    modeDependent?: unknown;
    usage?: unknown;
    interactsWith?: unknown;
}

export type GapReason =
    | 'kind-missing'
    | 'kind-invalid'
    | 'mode-missing'
    | 'usage-missing'
    | 'usage-too-short'
    | 'usage-too-long'
    | 'usage-repeats-label'
    | 'interacts-invalid'
    | 'interacts-unknown';

export interface DocumentationGap {
    tokenId: string;
    reason: GapReason;
    detail: string;
}

export interface DocumentationReport {
    gaps: DocumentationGap[];
    /** Ids na lista de exceção que já estão documentados (ou nem existem): a entrada tem de sair. */
    staleExceptions: string[];
    documented: number;
    excepted: number;
    total: number;
}

const normalize = (text: string): string => text.trim().toLowerCase().replace(/\s+/g, ' ');

/** Os problemas de UM token documentado (a completude de campo e a forma do texto). */
export function gapsOf(token: DocumentedTokenLike, knownIds: Set<string>): DocumentationGap[] {
    const gaps: DocumentationGap[] = [];
    const add = (reason: GapReason, detail: string): void => {
        gaps.push({ tokenId: token.id, reason, detail });
    };
    if (token.kind === undefined) add('kind-missing', 'sem `kind`');
    else if (!(KINDS as readonly string[]).includes(token.kind)) add('kind-invalid', `kind "${token.kind}" fora de ${KINDS.join('|')}`);
    if (typeof token.modeDependent !== 'boolean') add('mode-missing', 'sem `modeDependent` booleano');
    if (typeof token.usage !== 'string' || token.usage.trim() === '') {
        add('usage-missing', 'sem `usage`');
    } else {
        const text = token.usage.trim();
        if (text.length < USAGE_MIN_LENGTH) add('usage-too-short', `usage com ${text.length} caracteres (mínimo ${USAGE_MIN_LENGTH})`);
        if (text.length > USAGE_MAX_LENGTH) add('usage-too-long', `usage com ${text.length} caracteres (máximo ${USAGE_MAX_LENGTH})`);
        if (token.label && normalize(text) === normalize(token.label)) add('usage-repeats-label', 'usage igual ao rótulo');
    }
    if (token.interactsWith !== undefined) {
        const list = token.interactsWith;
        if (!Array.isArray(list) || list.some((id) => typeof id !== 'string')) {
            add('interacts-invalid', '`interactsWith` precisa ser lista de ids');
        } else {
            for (const id of list as string[]) {
                if (!knownIds.has(id)) add('interacts-unknown', `\`interactsWith\` cita "${id}", que não é token do schema`);
                if (id === token.id) add('interacts-unknown', '`interactsWith` cita o próprio token');
            }
        }
    }
    return gaps;
}

/**
 * Todo token do schema ou está documentado, ou está na lista de exceção. A lista se esvazia sozinha: entrada de
 * token que já tem os três campos corretos (ou que não existe mais) é achado — o gate bloqueia até removê-la.
 */
export function buildDocumentationReport(tokens: DocumentedTokenLike[], exceptions: Record<string, unknown>): DocumentationReport {
    const knownIds = new Set(tokens.map((token) => token.id));
    const gaps: DocumentationGap[] = [];
    const staleExceptions: string[] = [];
    let documented = 0;
    let excepted = 0;
    for (const token of tokens) {
        const tokenGaps = gapsOf(token, knownIds);
        const isException = Object.prototype.hasOwnProperty.call(exceptions, token.id);
        if (isException) {
            excepted += 1;
            if (tokenGaps.length === 0) staleExceptions.push(token.id);
            continue;
        }
        if (tokenGaps.length === 0) documented += 1;
        gaps.push(...tokenGaps);
    }
    for (const id of Object.keys(exceptions)) {
        if (!knownIds.has(id)) staleExceptions.push(id);
    }
    return { gaps, staleExceptions, documented, excepted, total: tokens.length };
}
