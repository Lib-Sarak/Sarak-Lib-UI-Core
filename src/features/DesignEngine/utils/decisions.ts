import DecisionConfig from '../config/design-decisions.json';
import type { SarakDesignToken } from '../../../core/Design/types';
import type { LibraryTextKey } from '../../../core/i18n/catalog';

export type DecisionId = 'theme' | 'colors' | 'fonts' | 'shape' | 'components' | 'layout' | 'advanced';
/** Um grupo de opções da decisão: os da tabela de `ThemeDecisionOptions` ou qualquer id do registro de presets. */
export type OptionGroup = string;

/** Uma pergunta que o nível 2 responde ("Onde fica?", "Como é?"): os tokens dela, na ordem em que aparecem. */
export interface DecisionQuestionDef {
    id: string;
    textKey: LibraryTextKey;
    tokens: string[];
    /** Regex (id do token) dos ajustes finos que pertencem a esta pergunta: no nível 3 eles saem sob o título dela, não sob a categoria do catálogo. */
    fineMatch?: string;
}

export interface DecisionDef {
    id: DecisionId;
    textKey: LibraryTextKey;
    /** Pilares do catálogo cujos tokens moram nesta decisão (o dado vem de `design-pillars.json` via a folksonomia). */
    pillars: string[];
    groups: OptionGroup[];
    /** Seções dos pilares que sobem para o nível 2 (hoje: a composição da barra). */
    optionSections: string[];
    /** O bloco global (preferências, barra de preferências e identidade) mora aqui. */
    includeGlobal?: boolean;
    /** Perguntas do nível 2, cada uma com amostra real; um token citado aqui sai do ajuste fino e do bloco global. */
    questions?: DecisionQuestionDef[];
    /** Fica fora da coluna: só o menu Avançado abre. */
    menuOnly?: boolean;
    /** A tela de amostra que a decisão leva a prévia (spec 06 §6.6). */
    screen: string;
    /** As telas de amostra que já pertencem à decisão: abrir a decisão estando numa delas não troca a tela. */
    screens: string[];
}

export const DECISIONS = DecisionConfig as DecisionDef[];
export const COLUMN_DECISIONS = DECISIONS.filter((decision) => !decision.menuOnly);

export const getDecision = (id: string): DecisionDef | undefined => DECISIONS.find((decision) => decision.id === id);

/** A importância a partir da qual um token entra no ajuste fino antes do "Mostrar todos". */
export const ESSENTIAL_IMPORTANCE = 80;

const VISUAL_IMPACT_GROUPS: readonly string[] = ['fontes', 'cores', 'fundo', 'cards', 'forma'];

export type GroupedStructure = Record<string, Record<string, SarakDesignToken[]>>;

export interface TokenMeta {
    importance?: number;
    visualImpact?: string;
}

export interface DecisionContext {
    grouped: GroupedStructure;
    meta: ReadonlyMap<string, TokenMeta>;
    /** Tokens do componente `global`: moram no bloco global da decisão Layout. */
    globalTokens: readonly SarakDesignToken[];
    /** Tokens da barra de preferências do usuário, também do bloco global. */
    preferenceTokens: readonly SarakDesignToken[];
}

export interface DecisionSection {
    title: string;
    /** Título traduzido (a pergunta a que a seção pertence); sem ele vale `title`. */
    titleKey?: LibraryTextKey;
    tokens: SarakDesignToken[];
}

export interface DecisionQuestion {
    id: string;
    textKey: LibraryTextKey;
    tokens: SarakDesignToken[];
}

export interface DecisionLayers {
    /** Nível 2: as perguntas da decisão, na ordem do config. */
    questions: DecisionQuestion[];
    /** Os ids que as perguntas mostram: o bloco global não os repete. */
    questionTokenIds: ReadonlySet<string>;
    /** Nível 2: tokens com efeito visual provado (`visualImpact`). */
    mainTokens: SarakDesignToken[];
    /** Nível 2: seções inteiras que a decisão sobe (a composição da barra). */
    barSections: DecisionSection[];
    /** Nível 3, primeiro bloco: `importance >= 80`. */
    essential: DecisionSection[];
    /** Nível 3, depois do "Mostrar todos". */
    rest: DecisionSection[];
    /** Quantos controles o nível 3 tem no total. */
    fineTotal: number;
}

export type TokenLayer = 'main' | 'bar' | 'question' | 'essential' | 'rest' | 'global';

export interface TokenLocation {
    decisionId: DecisionId;
    layer: TokenLayer;
    section?: string;
}

const hasImpact = (ctx: DecisionContext, tokenId: string): boolean =>
    VISUAL_IMPACT_GROUPS.includes(ctx.meta.get(tokenId)?.visualImpact ?? '');

const isEssential = (ctx: DecisionContext, tokenId: string): boolean =>
    (ctx.meta.get(tokenId)?.importance ?? 0) >= ESSENTIAL_IMPORTANCE;

/** As seções dos pilares da decisão, na ordem do catálogo; seção de mesmo nome em dois pilares vira uma só. */
const pillarSections = (def: DecisionDef, ctx: DecisionContext): DecisionSection[] => {
    const byTitle = new Map<string, SarakDesignToken[]>();
    def.pillars.forEach((pillarId) => {
        Object.entries(ctx.grouped[pillarId] ?? {}).forEach(([title, tokens]) => {
            byTitle.set(title, [...(byTitle.get(title) ?? []), ...tokens]);
        });
    });
    return [...byTitle].map(([title, tokens]) => ({ title, tokens }));
};

const globalIds = (def: DecisionDef, ctx: DecisionContext): Set<string> =>
    new Set(def.includeGlobal ? [...ctx.globalTokens, ...ctx.preferenceTokens].map((token) => token.id) : []);

/** Cada token aparece uma vez só (a folksonomia o repete em toda subcategoria dele) e nunca onde `taken` já o mostra. */
const takeUnseen = (sections: DecisionSection[], taken: ReadonlySet<string>): DecisionSection[] => {
    const seen = new Set(taken);
    return sections.flatMap((section) => {
        const tokens = section.tokens.filter((token) => !seen.has(token.id) && seen.add(token.id));
        return tokens.length > 0 ? [{ title: section.title, tokens }] : [];
    });
};

const idsOf = (sections: DecisionSection[]): string[] => sections.flatMap((section) => section.tokens.map((token) => token.id));

/** Os ajustes finos que uma pergunta reclama (`fineMatch`) saem sob o título dela, na ordem das perguntas; o resto fica na categoria de origem. */
const regroupByQuestion = (sections: DecisionSection[], def: DecisionDef): DecisionSection[] => {
    const matchers = (def.questions ?? []).filter((question) => question.fineMatch).map((question) => ({ question, pattern: new RegExp(question.fineMatch as string) }));
    if (matchers.length === 0) return sections;
    const claimed = new Map<string, SarakDesignToken[]>();
    const rest = sections.flatMap((section) => {
        const kept = section.tokens.filter((token) => {
            const owner = matchers.find(({ pattern }) => pattern.test(token.id));
            if (!owner) return true;
            claimed.set(owner.question.id, [...(claimed.get(owner.question.id) ?? []), token]);
            return false;
        });
        return kept.length > 0 ? [{ ...section, tokens: kept }] : [];
    });
    const byQuestion = matchers.flatMap(({ question }) => (claimed.has(question.id)
        ? [{ title: question.id, titleKey: question.textKey, tokens: claimed.get(question.id) as SarakDesignToken[] }]
        : []));
    return [...byQuestion, ...rest];
};

const splitByImportance = (sections: DecisionSection[], ctx: DecisionContext): Pick<DecisionLayers, 'essential' | 'rest'> => {
    const pick = (wanted: boolean): DecisionSection[] => sections.flatMap((section) => {
        const tokens = section.tokens.filter((token) => isEssential(ctx, token.id) === wanted);
        return tokens.length > 0 ? [{ ...section, tokens }] : [];
    });
    return { essential: pick(true), rest: pick(false) };
};

/** Os tokens de cada pergunta, achados no que a decisão alcança (seções dos pilares e bloco global); id que não existe não entra. */
const resolveQuestions = (def: DecisionDef, sections: DecisionSection[], ctx: DecisionContext): DecisionQuestion[] => {
    const pool = new Map<string, SarakDesignToken>();
    const reachable = [...sections.flatMap((section) => section.tokens), ...(def.includeGlobal ? [...ctx.globalTokens, ...ctx.preferenceTokens] : [])];
    reachable.forEach((token) => { if (!pool.has(token.id)) pool.set(token.id, token); });
    const shown = new Set<string>();
    return (def.questions ?? []).flatMap((question) => {
        const tokens = question.tokens.flatMap((id) => {
            const token = pool.get(id);
            if (!token || shown.has(id)) return [];
            shown.add(id);
            return [token];
        });
        return tokens.length > 0 ? [{ id: question.id, textKey: question.textKey, tokens }] : [];
    });
};

export const decisionLayers = (def: DecisionDef, ctx: DecisionContext): DecisionLayers => {
    const sections = pillarSections(def, ctx);
    const isBar = (section: DecisionSection): boolean => def.optionSections.includes(section.title);
    const questions = resolveQuestions(def, sections, ctx);
    const questionTokenIds = new Set(questions.flatMap((question) => question.tokens.map((token) => token.id)));
    const globals = globalIds(def, ctx);
    const barSections = takeUnseen(sections.filter(isBar), new Set([...globals, ...questionTokenIds]));
    const afterBar = new Set([...globals, ...questionTokenIds, ...idsOf(barSections)]);
    const mainTokens = takeUnseen(sections.filter((section) => !isBar(section)), afterBar)
        .flatMap((section) => section.tokens.filter((token) => hasImpact(ctx, token.id)));
    const claimed = new Set([...afterBar, ...mainTokens.map((token) => token.id)]);
    const fine = takeUnseen(sections.filter((section) => !isBar(section)), claimed);
    const { essential, rest } = splitByImportance(regroupByQuestion(fine, def), ctx);
    return { questions, questionTokenIds, mainTokens, barSections, essential, rest, fineTotal: idsOf(fine).length };
};

const indexLayer = (index: Map<string, TokenLocation>, sections: DecisionSection[], decisionId: DecisionId, layer: TokenLayer): void => {
    sections.forEach((section) => section.tokens.forEach((token) => {
        if (!index.has(token.id)) index.set(token.id, { decisionId, layer, section: section.title });
    }));
};

/** Onde cada token mora na coluna: a primeira decisão que o alcança, e em que nível. */
export const buildTokenIndex = (ctx: DecisionContext): Map<string, TokenLocation> => {
    const index = new Map<string, TokenLocation>();
    DECISIONS.forEach((def) => {
        const layers = decisionLayers(def, ctx);
        const globals = def.includeGlobal ? [{ title: '', tokens: [...ctx.globalTokens, ...ctx.preferenceTokens] }] : [];
        // A pergunta vence o bloco global: o token que ela mostra não está mais lá.
        indexLayer(index, layers.questions.map((question) => ({ title: question.id, tokens: question.tokens })), def.id, 'question');
        indexLayer(index, globals, def.id, 'global');
        indexLayer(index, [{ title: '', tokens: layers.mainTokens }], def.id, 'main');
        indexLayer(index, layers.barSections, def.id, 'bar');
        indexLayer(index, layers.essential, def.id, 'essential');
        indexLayer(index, layers.rest, def.id, 'rest');
    });
    return index;
};

/** A decisão que a tela de amostra de um pilar sugere: o pilar do token do inspetor vira a decisão que o contém. */
export const decisionOfPillar = (pillarId: string): DecisionDef | undefined =>
    DECISIONS.find((decision) => decision.pillars.includes(pillarId));

/** Todo id de token que a decisão alcança (qualquer nível, mais o bloco global): é com ele que a lista marca "alterada". */
export const decisionTokenIds = (def: DecisionDef, ctx: DecisionContext): Set<string> => {
    const layers = decisionLayers(def, ctx);
    const ids = new Set<string>([...layers.mainTokens.map((token) => token.id), ...layers.questionTokenIds]);
    [...layers.barSections, ...layers.essential, ...layers.rest].forEach((section) => section.tokens.forEach((token) => ids.add(token.id)));
    if (def.includeGlobal) [...ctx.globalTokens, ...ctx.preferenceTokens].forEach((token) => ids.add(token.id));
    return ids;
};

/** As decisões da coluna com mudança de rascunho: a que tem algum token alterado, e o Tema quando o tema pendente não é o aplicado. */
export const dirtyDecisionSet = (
    dirtyIds: ReadonlySet<string>,
    decisionIds: ReadonlyMap<DecisionId, ReadonlySet<string>>,
    isThemeDirty: boolean,
): Set<DecisionId> => new Set(COLUMN_DECISIONS.filter((decision) => (
    decision.id === 'theme' ? isThemeDirty : [...(decisionIds.get(decision.id) ?? [])].some((id) => dirtyIds.has(id))
)).map((decision) => decision.id));
