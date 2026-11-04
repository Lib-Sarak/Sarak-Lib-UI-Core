import { describe, it, expect } from 'vitest';
import { groupByDecision, findOptionEntries, type LocatedResult } from '../searchGroups';
import type { DecisionId, TokenLocation } from '../decisions';

const result = (id: string, decisionId: DecisionId): LocatedResult => ({
    token: { id, label: id, type: 'text', defaultValue: '' },
    location: { decisionId, layer: 'main', section: '' },
});

const labels: Record<string, string> = { shape: 'Forma', layout: 'Layout', fonts: 'Fontes' };
const label = (id: DecisionId): string => labels[id] ?? id;

describe('searchGroups', () => {
    it('agrupa por decisão e põe primeiro a decisão do melhor resultado, sem reordenar dentro do grupo', () => {
        const groups = groupByDecision([result('a', 'layout'), result('b', 'shape'), result('c', 'layout')]);
        expect(groups.map((group) => group.decisionId)).toEqual(['layout', 'shape']);
        expect(groups[0].items.map((item) => item.token.id)).toEqual(['a', 'c']);
    });

    it('sem resultado, sem grupo', () => {
        expect(groupByDecision([])).toEqual([]);
    });

    describe('findOptionEntries', () => {
        const index = new Map<string, TokenLocation>([
            ['a', { decisionId: 'shape', layer: 'rest', section: 'Cantos' }],
            ['b', { decisionId: 'shape', layer: 'rest', section: 'Cantos' }],
            ['c', { decisionId: 'layout', layer: 'bar', section: 'Barra lateral' }],
            ['d', { decisionId: 'fonts', layer: 'main', section: '' }],
        ]);

        it('acha a seção pelo nome e a lista uma vez só', () => {
            expect(findOptionEntries('cantos', index, label)).toEqual([{ decisionId: 'shape', section: 'Cantos' }]);
            expect(findOptionEntries('barra lateral', index, label)).toEqual([{ decisionId: 'layout', section: 'Barra lateral' }]);
        });

        it('acha a decisão inteira quando o token mora na raiz dela', () => {
            expect(findOptionEntries('fontes', index, label)).toEqual([{ decisionId: 'fonts', section: '' }]);
        });

        it('consulta que não casa com nenhum nome não traz opção', () => {
            expect(findOptionEntries('xyzq', index, label)).toEqual([]);
        });
    });
});
