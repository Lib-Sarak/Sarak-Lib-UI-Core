import { describe, it, expect } from 'vitest';
import { DECISIONS, buildTokenIndex, decisionLayers, decisionTokenIds, getDecision } from '../decisions';
import { buildDecisionContext } from '../decisionContext';

const ctx = buildDecisionContext();
const flatIds = (sections: { tokens: { id: string }[] }[]): string[] => sections.flatMap((section) => section.tokens.map((token) => token.id));

describe('a lista de paletas salvas na decisão Cores', () => {
    const colors = getDecision('colors')!;
    const layers = decisionLayers(colors, ctx);

    it('é da seção de paletas: nenhum campo de texto dela nos ajustes principais, no ajuste fino ou nas barras', () => {
        const shown = [...layers.mainTokens.map((token) => token.id), ...flatIds(layers.essential), ...flatIds(layers.rest), ...flatIds(layers.barSections)];
        expect(shown).not.toContain('savedPalettes');
    });

    it('continua contada na decisão (a decisão aparece como alterada quando só a lista muda) e fora da busca por token', () => {
        expect(layers.questionTokenIds.has('savedPalettes')).toBe(true);
        expect(decisionTokenIds(colors, ctx).has('savedPalettes')).toBe(true);
        expect(buildTokenIndex(ctx).has('savedPalettes')).toBe(false);
    });

    it('só a decisão que tem o grupo de paletas a toma para si', () => {
        const withPalettes = DECISIONS.filter((decision) => decision.groups.includes('palettes')).map((decision) => decision.id);
        expect(withPalettes).toEqual(['colors']);
        DECISIONS.filter((decision) => decision.id !== 'colors').forEach((decision) => {
            expect(decisionLayers(decision, ctx).questionTokenIds.has('savedPalettes')).toBe(false);
        });
    });
});
