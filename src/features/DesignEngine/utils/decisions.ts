import DecisionConfig from '../config/design-decisions.json';
import type { SarakDesignToken } from '../../../core/Design/types';
import type { LibraryTextKey } from '../../../core/i18n/catalog';
import { inScope, isBarToken } from './barScope';
import { regroupByQuestion } from './regroupByQuestion';

export type DecisionId = 'theme' | 'colors' | 'fonts' | 'shape' | 'components' | 'bars' | 'layout' | 'advanced';
/** Um grupo de opções da decisão: os da tabela de `ThemeDecisionOptions` ou qualquer id do registro de presets. */
export type OptionGroup = string;

/** Uma pergunta que o nível 2 responde ("Onde fica?", "Como é?"): os tokens dela, na ordem em que aparecem. */
export interface DecisionQuestionDef {
    id: string;
    textKey: LibraryTextKey;
    tokens: string[];
    /** Regex (id do token) dos ajustes finos que pertencem a esta pergunta: no nível 3 eles saem sob o título dela, não sob a categoria do catálogo. */
    fineMatch?: string;
    /** Um controle próprio que abre a pergunta, além dos tokens (hoje: o interruptor da troca lateral/topo pelo usuário). */
    control?: 'navigationSwitch';
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
    /**
     * Quando dois decisões leem o mesmo pilar, qual parte dele é desta: `bars` fica só com o que as perguntas da decisão Barras
     * reclamam (citado ou por `fineMatch`), `notBars` com o resto. Cada token aparece numa só das duas.
     */
    tokenScope?: 'bars' | 'notBars';
    /** Perguntas do nível 2, cada uma com amostra real; um token citado aqui sai do ajuste fino e do bloco global. */
    questions?: DecisionQuestionDef[];
    /** Fica fora da coluna: só o menu Avançado abre. */
    menuOnly?: boolean;
    /** A tela de amostra que a decisão leva a prévia (spec 06 §6.6). */
    screen: string;
    /** As telas de amostra que já pertencem à decisão: abrir a decisão estando numa delas não troca a tela. */
    screens: string[];
    /** A tela em que cada grupo de opções aparece: espiar uma opção do grupo leva a prévia até ela enquanto dura (spec 06 §6.4). Grupo ausente = a tela em que a prévia já está. */
    groupScreens?: Record<string, string>;
}

export const DECISIONS = DecisionConfig as DecisionDef[];
export { isBarToken };
export const COLUMN_DECISIONS = DECISIONS.filter((decision) => !decision.menuOnly);

/** A tela de amostra em que as opções do grupo aparecem, ou `undefined` quando a prévia pode ficar onde está. */
export const peekScreenOf = (group: string): string | undefined =>
    DECISIONS.find((decision) => decision.groups.includes(group))?.groupScreens?.[group];

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
    control?: DecisionQuestionDef['control'];
}

export interface DecisionLayers {
    /** Nível 2: as perguntas da decisão, na ordem do config. */
    questions: DecisionQuestion[];
    /** Os ids que as perguntas e a seção de paletas mostram: nem o bloco global nem os ajustes os repetem. */
    questionTokenIds: ReadonlySet<string>;
    /** O que o bloco global NÃO repete: o que as perguntas mostram e, na decisão que divide o pilar, o que é das Barras. */
    omitFromGlobal: ReadonlySet<string>;
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
            byTitle.set(title, [...(byTitle.get(title) ?? []), ...tokens.filter((token) => inScope(def, token.id))]);
        });
    });
    const sections = [...byTitle].flatMap(([title, tokens]) => (tokens.length > 0 ? [{ title, tokens }] : []));
    // As barras também reclamam tokens do bloco global (orientação, recolher, preferências da barra): sobem como uma seção só.
    const owned = def.tokenScope === 'bars' ? [...ctx.globalTokens, ...ctx.preferenceTokens].filter((token) => isBarToken(token.id)) : [];
    return owned.length > 0 ? [...sections, { title: 'barGlobal', tokens: owned }] : sections;
};

/** Os tokens do bloco global que esta decisão mostra: sem o que a decisão Barras reclama, quando a decisão é a outra metade. */
const globalTokensOf = (def: DecisionDef, ctx: DecisionContext): SarakDesignToken[] =>
    (def.includeGlobal ? [...ctx.globalTokens, ...ctx.preferenceTokens].filter((token) => inScope(def, token.id)) : []);

const globalIds = (def: DecisionDef, ctx: DecisionContext): Set<string> => new Set(globalTokensOf(def, ctx).map((token) => token.id));

/** Cada token aparece uma vez só (a folksonomia o repete em toda subcategoria dele) e nunca onde `taken` já o mostra. */
const takeUnseen = (sections: DecisionSection[], taken: ReadonlySet<string>): DecisionSection[] => {
    const seen = new Set(taken);
    return sections.flatMap((section) => {
        const tokens = section.tokens.filter((token) => !seen.has(token.id) && seen.add(token.id));
        return tokens.length > 0 ? [{ title: section.title, tokens }] : [];
    });
};

const idsOf = (sections: DecisionSection[]): string[] => sections.flatMap((section) => section.tokens.map((token) => token.id));

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
    const reachable = [...sections.flatMap((section) => section.tokens), ...globalTokensOf(def, ctx)];
    reachable.forEach((token) => { if (!pool.has(token.id)) pool.set(token.id, token); });
    const shown = new Set<string>();
    return (def.questions ?? []).flatMap((question) => {
        const tokens = question.tokens.flatMap((id) => {
            const token = pool.get(id);
            if (!token || shown.has(id)) return [];
            shown.add(id);
            return [token];
        });
        return tokens.length > 0 ? [{ id: question.id, textKey: question.textKey, tokens, control: question.control }] : [];
    });
};

/** O token que a seção de paletas lê e grava por conta própria: a lista salva não é campo de texto de ninguém. */
const SECTION_OWNED_TOKEN_IDS: readonly string[] = ['savedPalettes'];

export const decisionLayers = (def: DecisionDef, ctx: DecisionContext): DecisionLayers => {
    const sections = pillarSections(def, ctx);
    const isBar = (section: DecisionSection): boolean => def.optionSections.includes(section.title);
    const questions = resolveQuestions(def, sections, ctx);
    const owned = def.groups.includes('palettes') ? SECTION_OWNED_TOKEN_IDS : [];
    const questionTokenIds = new Set([...questions.flatMap((question) => question.tokens.map((token) => token.id)), ...owned]);
    const globals = globalIds(def, ctx);
    const barSections = takeUnseen(sections.filter(isBar), new Set([...globals, ...questionTokenIds]));
    const afterBar = new Set([...globals, ...questionTokenIds, ...idsOf(barSections)]);
    const mainTokens = takeUnseen(sections.filter((section) => !isBar(section)), afterBar)
        .flatMap((section) => section.tokens.filter((token) => hasImpact(ctx, token.id)));
    const claimed = new Set([...afterBar, ...mainTokens.map((token) => token.id)]);
    const fine = takeUnseen(sections.filter((section) => !isBar(section)), claimed);
    const { essential, rest } = splitByImportance(regroupByQuestion(fine, def), ctx);
    const barOwned = def.tokenScope === 'notBars' ? [...ctx.globalTokens, ...ctx.preferenceTokens].filter((token) => isBarToken(token.id)).map((token) => token.id) : [];
    const omitFromGlobal = new Set([...questionTokenIds, ...barOwned]);
    return { questions, questionTokenIds, omitFromGlobal, mainTokens, barSections, essential, rest, fineTotal: idsOf(fine).length };
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
        const globals = def.includeGlobal ? [{ title: '', tokens: globalTokensOf(def, ctx) }] : [];
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
    globalTokensOf(def, ctx).forEach((token) => ids.add(token.id));
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
