// Núcleo puro da trava de completude dos temas embarcados: recebe os tokens do schema, os temas e a lista de
// exceção e devolve os achados. Separado do script para o teste de mutação plantar uma lacuna num tema sintético,
// sem depender dos 14 temas reais.

export const KIND_AESTHETIC = 'aesthetic';
export const KIND_FUNCTIONAL = 'functional';

/** O eixo da contraparte: declarado nela de propósito, embora não "carregue modo" (é o modo oposto em si). */
export const MODE_AXIS_TOKEN = 'mode';

export interface CompletenessTokenLike {
    id: string;
    kind?: string;
    modeDependent?: boolean;
}

export interface CompletenessThemeLike {
    id: string;
    design: Record<string, unknown>;
    contraparte?: Record<string, unknown>;
}

export type CompletenessReason =
    | 'missing-aesthetic'
    | 'missing-mode-aesthetic'
    | 'contraparte-missing'
    | 'declares-functional'
    | 'contraparte-declares-functional'
    | 'contraparte-declares-fixed-aesthetic';

export interface CompletenessGap {
    themeId: string;
    reason: CompletenessReason;
    tokenId: string;
}

export interface CompletenessReport {
    /** Lacunas de tema que NÃO está na lista de exceção. */
    gaps: CompletenessGap[];
    /** Temas na lista de exceção que já estão completos (ou nem existem): a entrada tem de sair. */
    staleExceptions: string[];
    /** Quantos temas estão completos e quantos estão em exceção (a lista esvazia a cada lote). */
    complete: number;
    excepted: number;
    total: number;
}

const isDeclared = (block: Record<string, unknown> | undefined, id: string): boolean => block !== undefined && block[id] !== undefined;

/** As lacunas de UM tema. Só chaves que são token do schema contam; chave de payload (`enabledLanguages`) fica de fora. */
export function gapsOfTheme(theme: CompletenessThemeLike, tokens: CompletenessTokenLike[]): CompletenessGap[] {
    const gaps: CompletenessGap[] = [];
    const add = (reason: CompletenessReason, tokenId: string): void => {
        gaps.push({ themeId: theme.id, reason, tokenId });
    };
    const aesthetic = tokens.filter((token) => token.kind === KIND_AESTHETIC);
    const functionalIds = new Set(tokens.filter((token) => token.kind === KIND_FUNCTIONAL).map((token) => token.id));
    const modeDependentIds = new Set(aesthetic.filter((token) => token.modeDependent === true).map((token) => token.id));
    const aestheticIds = new Set(aesthetic.map((token) => token.id));

    for (const token of aesthetic) {
        if (!isDeclared(theme.design, token.id)) add('missing-aesthetic', token.id);
    }
    for (const id of Object.keys(theme.design)) {
        if (functionalIds.has(id)) add('declares-functional', id);
    }

    if (theme.contraparte === undefined) {
        add('contraparte-missing', '(contraparte)');
        return gaps;
    }
    for (const id of modeDependentIds) {
        if (!isDeclared(theme.contraparte, id)) add('missing-mode-aesthetic', id);
    }
    for (const id of Object.keys(theme.contraparte)) {
        if (functionalIds.has(id)) add('contraparte-declares-functional', id);
        else if (aestheticIds.has(id) && !modeDependentIds.has(id) && id !== MODE_AXIS_TOKEN) add('contraparte-declares-fixed-aesthetic', id);
    }
    return gaps;
}

/**
 * Todo tema ou está completo, ou está na lista de exceção. A lista esvazia sozinha: tema completo que continua
 * nela (ou id que não existe mais) é achado — o gate bloqueia até removê-lo. Tema novo não entra na lista.
 */
export function buildCompletenessReport(
    themes: CompletenessThemeLike[],
    tokens: CompletenessTokenLike[],
    exceptions: Record<string, unknown>,
): CompletenessReport {
    const gaps: CompletenessGap[] = [];
    const staleExceptions: string[] = [];
    let complete = 0;
    let excepted = 0;
    for (const theme of themes) {
        const themeGaps = gapsOfTheme(theme, tokens);
        const isException = Object.prototype.hasOwnProperty.call(exceptions, theme.id);
        if (isException) {
            excepted += 1;
            if (themeGaps.length === 0) staleExceptions.push(theme.id);
            continue;
        }
        if (themeGaps.length === 0) complete += 1;
        gaps.push(...themeGaps);
    }
    const knownIds = new Set(themes.map((theme) => theme.id));
    for (const id of Object.keys(exceptions)) {
        if (!knownIds.has(id)) staleExceptions.push(id);
    }
    return { gaps, staleExceptions, complete, excepted, total: themes.length };
}
