import { describe, it, expect } from 'vitest';
import { DECISIONS, ESSENTIAL_IMPORTANCE, buildTokenIndex, decisionLayers, decisionTokenIds, getDecision, peekScreenOf, type DecisionContext, type DecisionDef } from '../decisions';
import { buildDecisionContext } from '../decisionContext';

const ctx = buildDecisionContext();

const flatIds = (sections: { tokens: { id: string }[] }[]): string[] => sections.flatMap((section) => section.tokens.map((token) => token.id));

/** O que o modo Completo mostrava: todo token dos pilares, mais o bloco global e a barra de preferências. */
const tokensTheCompleteModeShowed = (context: DecisionContext): Set<string> => {
    const ids = new Set<string>();
    Object.values(context.grouped).forEach((sections) => flatIds(Object.values(sections).map((tokens) => ({ tokens }))).forEach((id) => ids.add(id)));
    [...context.globalTokens, ...context.preferenceTokens].forEach((token) => ids.add(token.id));
    return ids;
};

const reachableIn = (context: DecisionContext, decisions: readonly DecisionDef[]): Set<string> => {
    const ids = new Set<string>();
    decisions.forEach((decision) => {
        const layers = decisionLayers(decision, context);
        [...flatIds(layers.barSections), ...flatIds(layers.essential), ...flatIds(layers.rest), ...layers.mainTokens.map((token) => token.id), ...layers.questionTokenIds]
            .forEach((id) => ids.add(id));
        if (decision.includeGlobal) [...context.globalTokens, ...context.preferenceTokens].forEach((token) => ids.add(token.id));
    });
    return ids;
};

describe('cobertura das decisões: nenhum token se perde', () => {
    const before = tokensTheCompleteModeShowed(ctx);

    it('todo token que o modo Completo mostrava é alcançável numa decisão ou no Avançado', () => {
        const reachable = reachableIn(ctx, DECISIONS);
        expect(before.size).toBeGreaterThan(400);
        expect([...before].filter((id) => !reachable.has(id))).toEqual([]);
    });

    it('a coluna sozinha deixa de fora só tokens do pilar Avançado', () => {
        const column = reachableIn(ctx, DECISIONS.filter((decision) => !decision.menuOnly));
        const advancedPillar = new Set(flatIds(Object.values(ctx.grouped.advanced).map((tokens) => ({ tokens }))));
        const missingFromColumn = [...before].filter((id) => !column.has(id));
        expect(missingFromColumn.length).toBeGreaterThan(0);
        missingFromColumn.forEach((id) => expect(advancedPillar.has(id)).toBe(true));
    });

    it('esconder um pilar do mapa de decisões faz a verificação acusar a perda', () => {
        const hidden = DECISIONS.map((decision) => (decision.id === 'fonts' ? { ...decision, pillars: [] } : decision));
        const reachable = reachableIn(ctx, hidden);
        expect([...before].filter((id) => !reachable.has(id)).length).toBeGreaterThan(0);
    });

    it('todo pilar do catálogo pertence a alguma decisão', () => {
        Object.keys(ctx.grouped).forEach((pillarId) => {
            expect(DECISIONS.some((decision) => decision.pillars.includes(pillarId))).toBe(true);
        });
    });
});

describe('camadas de uma decisão', () => {
    it('cada token aparece uma vez só dentro da decisão, e o ajuste fino separa por importância', () => {
        DECISIONS.forEach((decision) => {
            const layers = decisionLayers(decision, ctx);
            const ids = [
                ...layers.mainTokens.map((token) => token.id),
                ...flatIds(layers.barSections),
                ...flatIds(layers.essential),
                ...flatIds(layers.rest),
                ...layers.questionTokenIds,
            ];
            expect(new Set(ids).size).toBe(ids.length);
            flatIds(layers.essential).forEach((id) => expect(ctx.meta.get(id)?.importance ?? 0).toBeGreaterThanOrEqual(ESSENTIAL_IMPORTANCE));
            flatIds(layers.rest).forEach((id) => expect(ctx.meta.get(id)?.importance ?? 0).toBeLessThan(ESSENTIAL_IMPORTANCE));
        });
    });

    it('a contagem do nível 3 é a soma real dos dois blocos', () => {
        const layers = decisionLayers(getDecision('shape')!, ctx);
        expect(layers.fineTotal).toBe(flatIds(layers.essential).length + flatIds(layers.rest).length);
        expect(layers.fineTotal).toBeGreaterThan(0);
    });

    it('o nível 2 traz os tokens de efeito visual provado e a composição da barra sobe nas Barras', () => {
        const colors = decisionLayers(getDecision('colors')!, ctx);
        expect(colors.mainTokens.map((token) => token.id)).toContain('primaryColor');
        const layout = decisionLayers(getDecision('bars')!, ctx);
        // A composição da barra agora sobe pela pergunta "O que aparece": a seção sozinha não sobra.
        expect(layout.barSections.map((section) => section.title)).not.toContain('Composição da Barra');
        expect(layout.questions.find((question) => question.id === 'what')?.tokens.map((token) => token.id)).toContain('chromeSearchPosition');
    });

    it('o índice leva cada token à decisão e ao nível onde ele mora', () => {
        const index = buildTokenIndex(ctx);
        expect(index.get('primaryColor')).toMatchObject({ decisionId: 'colors', layer: 'main' });
        expect(index.get('mode')).toMatchObject({ decisionId: 'layout', layer: 'global' });
        expect(index.get('sidebarTone')).toMatchObject({ decisionId: 'bars', layer: 'question', section: 'how' });
        expect(index.get('navigationStyle')).toMatchObject({ decisionId: 'bars', layer: 'question', section: 'where' });
        const advancedToken = Object.values(ctx.grouped.advanced).flat()[0];
        expect(index.has(advancedToken.id)).toBe(true);
    });
});

describe('a decisão Barras por pergunta (nível 2)', () => {
    const layout = getDecision('bars')!;
    const layers = decisionLayers(layout, ctx);
    const QUESTION_IDS = ['where', 'how', 'what', 'brand', 'behavior'];

    it('responde às cinco perguntas, na ordem, cada uma com ao menos um controle', () => {
        expect(layers.questions.map((question) => question.id)).toEqual(QUESTION_IDS);
        layers.questions.forEach((question) => expect(question.tokens.length, question.id).toBeGreaterThan(0));
    });

    it('todo token citado no config existe no que a decisão alcança: um id errado não passa em silêncio', () => {
        const configured = (layout.questions ?? []).flatMap((question) => question.tokens);
        const shown = new Set(layers.questionTokenIds);
        expect(configured.filter((id) => !shown.has(id))).toEqual([]);
    });

    it('um token aparece uma vez só: sai do ajuste fino, do nível 2 comum e do bloco global', () => {
        const elsewhere = new Set([...flatIds(layers.essential), ...flatIds(layers.rest), ...layers.mainTokens.map((token) => token.id), ...flatIds(layers.barSections)]);
        layers.questionTokenIds.forEach((id) => expect(elsewhere.has(id), id).toBe(false));
    });

    it('"O que aparece" traz os controles de composição (oito widgets, o ≡ do topo, o avatar do usuário e os dois degraus de P e G); "Marca" traz a posição do logo; "Comportamento" a largura ajustável', () => {
        const byQuestion = (id: string): string[] => layers.questions.find((question) => question.id === id)!.tokens.map((token) => token.id);
        expect(byQuestion('what')).toHaveLength(12);
        expect(byQuestion('what')).toEqual(expect.arrayContaining(['preferenceFontSizeReduction', 'preferenceFontSizeIncrease']));
        expect(byQuestion('brand')).toContain('sidebarLogoPlacement');
        expect(byQuestion('brand')).toContain('brandDisplay');
        expect(byQuestion('behavior')).toContain('sidebarResizable');
        expect(byQuestion('how')).toEqual(expect.arrayContaining(['sidebarTone', 'topbarTone']));
    });

    it('só a decisão Barras tem perguntas', () => {
        DECISIONS.filter((decision) => decision.id !== 'bars').forEach((decision) => {
            expect(decisionLayers(decision, ctx).questions, decision.id).toEqual([]);
        });
    });
});

describe('a decisão Barras: ajuste fino sob a pergunta certa', () => {
    const layers = decisionLayers(getDecision('bars')!, ctx);
    const fine = [...layers.essential, ...layers.rest];
    const idsUnder = (question: string): string[] => flatIds(fine.filter((section) => section.title === question));

    it('cada token de barra sem preset sai sob a pergunta que o reclama, não sob a categoria do catálogo', () => {
        expect(idsUnder('where')).toEqual(expect.arrayContaining(['sidebarMinWidth', 'sidebarMaxWidth', 'topbarHeight', 'sidebarCollapsedWidth']));
        expect(idsUnder('how')).toEqual(expect.arrayContaining(['sidebarBorderColor', 'sidebarIconColor', 'topbarShadow', 'navItemActiveColor', 'sidebarBlur']));
        expect(idsUnder('brand')).toEqual(expect.arrayContaining(['sidebarBrandColor', 'topbarBrandBackground', 'identityPadding']));
        expect(idsUnder('what')).toEqual(expect.arrayContaining(['searchDropdownWidth']));
    });

    it('a seção leva o título traduzido da pergunta, e um token nunca aparece em duas', () => {
        fine.filter((section) => ['where', 'how', 'what', 'brand', 'behavior'].includes(section.title)).forEach((section) => expect(section.titleKey).toBeDefined());
        const ids = flatIds(fine);
        expect(new Set(ids).size).toBe(ids.length);
    });

    it('token sem pergunta segue na categoria de origem e as outras decisões não mudam', () => {
        expect(flatIds(decisionLayers(getDecision('layout')!, ctx).rest)).toContain('layoutPadding');
        DECISIONS.filter((decision) => decision.id !== 'bars').forEach((decision) => {
            const other = decisionLayers(decision, ctx);
            [...other.essential, ...other.rest].forEach((section) => expect(section.titleKey, decision.id).toBeUndefined());
        });
    });
});

describe('peekScreenOf — a tela em que as opções de um grupo aparecem', () => {
    it.each([
        ['tables', 'tabela'], ['charts', 'graficos'], ['switch', 'components'], ['badge', 'components'],
        ['notice', 'components'], ['modal', 'components'], ['scroll', 'components'], ['emptyState', 'components'],
    ])('%s leva a prévia à tela %s', (group, screen) => {
        expect(peekScreenOf(group)).toBe(screen);
    });

    it('grupo sem tela própria deixa a prévia onde está', () => {
        expect(peekScreenOf('cards')).toBeUndefined();
        expect(peekScreenOf('nao-existe')).toBeUndefined();
    });

    it('toda tela declarada existe entre as telas de amostra', async () => {
        const { MAIN_PREVIEW_SCREENS, ADDITIONAL_PREVIEW_SCREENS } = await import('../../Canvas/previewScreens');
        const known = new Set<string>([...MAIN_PREVIEW_SCREENS, ...ADDITIONAL_PREVIEW_SCREENS].map(({ id }) => id));
        DECISIONS.flatMap((decision) => Object.entries(decision.groupScreens ?? {})).forEach(([group, screen]) => {
            expect(known.has(screen), group + ' -> ' + screen).toBe(true);
        });
    });

    it('todo grupo com tela pertence à decisão que o declara', () => {
        DECISIONS.forEach((decision) => Object.keys(decision.groupScreens ?? {}).forEach((group) => {
            expect(decision.groups, decision.id + '/' + group).toContain(group);
        }));
    });
});

describe('Barras e Layout dividem o pilar de navegação sem repetir token', () => {
    const reachable = (id: string): Set<string> => decisionTokenIds(getDecision(id)!, ctx);

    it('cada token aparece em exatamente uma das duas decisões', () => {
        const bars = reachable('bars');
        const layout = reachable('layout');
        expect([...bars].filter((id) => layout.has(id))).toEqual([]);
        expect(bars.size).toBeGreaterThan(60);
        expect(layout.size).toBeGreaterThan(40);
    });

    it('a largura do conteúdo e o bloco global ficam no Layout; o tom, a orientação e a troca do usuário, nas Barras', () => {
        const has = (id: string, wanted: string[]): string[] => wanted.filter((token) => !reachable(id).has(token));
        expect(has('layout', ['maxContentWidth', 'mode', 'bodySize'])).toEqual([]);
        expect(has('bars', ['sidebarTone', 'topbarTone', 'navigationStyle', 'preferenceNavigationStylePosition', 'sidebarFooterBackground', 'userAvatarStyle'])).toEqual([]);
        expect(getDecision('layout')!.groups).toEqual(['contentWidth', 'globalBlock']);
    });

    it('a pergunta da orientação traz o interruptor da troca pelo usuário', () => {
        const where = decisionLayers(getDecision('bars')!, ctx).questions.find((question) => question.id === 'where');
        expect(where?.control).toBe('navigationSwitch');
    });

    it('Barras vem entre Componentes e Layout na coluna', () => {
        const order = DECISIONS.map((decision) => decision.id);
        expect(order.indexOf('bars')).toBe(order.indexOf('components') + 1);
        expect(order.indexOf('layout')).toBe(order.indexOf('bars') + 1);
    });
});
