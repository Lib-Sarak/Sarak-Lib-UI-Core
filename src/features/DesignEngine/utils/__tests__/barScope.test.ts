import { describe, it, expect } from 'vitest';
import { inScope, isBarToken } from '../barScope';
import type { DecisionDef } from '../decisions';

const def = (tokenScope?: DecisionDef['tokenScope']): DecisionDef => ({ id: 'layout', textKey: 'decisionLayout', pillars: [], groups: [], optionSections: [], screen: 'dashboard', screens: [], tokenScope });

describe('barScope — de quem é cada token do pilar de navegação', () => {
    it.each(['navigationStyle', 'sidebarTone', 'topbarTone', 'preferenceNavigationStylePosition'])('%s (citado numa pergunta) é das Barras', (id) => {
        expect(isBarToken(id)).toBe(true);
    });

    it.each(['sidebarFooterBackground', 'topbarHeight', 'navItemRadius', 'searchDropdownWidth', 'zIndexSidebar'])('%s (reclamado pelo fineMatch) é das Barras', (id) => {
        expect(isBarToken(id)).toBe(true);
    });

    it.each(['maxContentWidth', 'mode', 'bodySize', 'layoutPadding', 'tableDensity'])('%s não é das Barras', (id) => {
        expect(isBarToken(id)).toBe(false);
    });

    it('`bars` lê só o que é de barra, `notBars` lê o resto, e sem escopo lê tudo', () => {
        expect([inScope(def('bars'), 'sidebarTone'), inScope(def('bars'), 'maxContentWidth')]).toEqual([true, false]);
        expect([inScope(def('notBars'), 'sidebarTone'), inScope(def('notBars'), 'maxContentWidth')]).toEqual([false, true]);
        expect([inScope(def(), 'sidebarTone'), inScope(def(), 'maxContentWidth')]).toEqual([true, true]);
    });
});
