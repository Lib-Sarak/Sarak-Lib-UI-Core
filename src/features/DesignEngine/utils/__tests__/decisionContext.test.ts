import { describe, it, expect } from 'vitest';
import { MASTER_DESIGN_MAP } from '../../../../core/Design/master-map';
import { PreferencesSchema } from '../../../../core/Design/schema/preferences';
import { buildDecisionContext } from '../decisionContext';

describe('buildDecisionContext', () => {
    const context = buildDecisionContext();

    it('lê os sete pilares da folksonomia e o catálogo de metadados do motor', () => {
        expect(Object.keys(context.grouped).sort()).toEqual(['advanced', 'brand', 'interaction', 'navigation', 'surfaces', 'systems', 'typography']);
        expect(context.meta.get('primaryColor')?.visualImpact).toBe('cores');
        expect(context.meta.size).toBeGreaterThan(400);
    });

    it('o bloco global traz o componente `global` e a barra de preferências, ambos do schema', () => {
        const globalIds = MASTER_DESIGN_MAP.components.find((component) => component.id === 'global')?.tokens.map((token) => token.id);
        expect(context.globalTokens.map((token) => token.id)).toEqual(globalIds);
        expect(context.preferenceTokens).toBe(PreferencesSchema.tokens);
    });
});
