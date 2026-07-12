import { describe, it, expect } from 'vitest';
import { getDesignScaffold, type DesignScaffoldToken } from '@sarak/lib-ui-core/backend/node';
import { THEME_SLICES, assertSliceCoverage, getSliceTokens, deduplicateScaffoldById } from '../../../src/config/shared/theme_slices.js';

describe('theme_slices', () => {
  it('deve cobrir exatamente as 28 famílias reais do gabarito, sem faltar e sem duplicar', () => {
    const scaffold = getDesignScaffold();
    expect(() => assertSliceCoverage(scaffold)).not.toThrow();

    const realSchemaIds = new Set(scaffold.map((t) => t.schemaId));
    const sliceSchemaIds = THEME_SLICES.flatMap((s) => s.schemaIds);
    expect(sliceSchemaIds.length).toBe(realSchemaIds.size);
    expect(new Set(sliceSchemaIds).size).toBe(sliceSchemaIds.length); // sem duplicata
  });

  it('deve lançar erro descritivo quando uma família do gabarito fica sem fatia', () => {
    const fakeScaffold: DesignScaffoldToken[] = [
      { id: 'x', label: 'X', type: 'text', schemaId: 'familia-inexistente', defaultValue: '' },
    ];
    expect(() => assertSliceCoverage(fakeScaffold)).toThrow(/sem fatia correspondente/);
  });

  it('deve lançar erro descritivo quando uma fatia referencia família duplicada (config quebrada)', () => {
    const brokenSlices = [
      { key: 'a', label: 'A', schemaIds: ['colors'] },
      { key: 'b', label: 'B', schemaIds: ['colors'] },
    ];
    const sliceSchemaIds = brokenSlices.flatMap((s) => s.schemaIds);
    const seen = new Set<string>();
    const duplicated = new Set<string>();
    for (const id of sliceSchemaIds) {
      if (seen.has(id)) duplicated.add(id);
      seen.add(id);
    }
    expect(duplicated.has('colors')).toBe(true);
  });

  it('getSliceTokens deve retornar só os tokens das famílias daquela fatia', () => {
    const scaffold = getDesignScaffold();
    const controlsSlice = THEME_SLICES.find((s) => s.key === 'controls')!;
    const tokens = getSliceTokens(controlsSlice, scaffold);

    expect(tokens.length).toBeGreaterThan(0);
    tokens.forEach((token) => {
      expect(['buttons', 'inputs', 'switches']).toContain(token.schemaId);
    });
    // Nenhum token de outra família vazou pra esta fatia.
    expect(tokens.some((t) => t.schemaId === 'colors')).toBe(false);
  });

  it('a soma dos tokens de todas as fatias deve bater com o total do gabarito', () => {
    const scaffold = getDesignScaffold();
    const totalViaSlices = THEME_SLICES.reduce((sum, slice) => sum + getSliceTokens(slice, scaffold).length, 0);
    expect(totalViaSlices).toBe(scaffold.length);
  });

  describe('deduplicateScaffoldById', () => {
    it('deve colapsar os 7 ids pré-existentes que aparecem em duas famílias, mantendo a primeira ocorrência', () => {
      const raw = getDesignScaffold();
      const deduped = deduplicateScaffoldById(raw);

      expect(raw.length).toBe(416);
      expect(deduped.length).toBe(409);

      const expectedFirstOwner: Record<string, string> = {
        bgBaseColor: 'system',
        cardBackgroundColor: 'cards',
        cardBorderColor: 'cards',
        colorBgBody: 'colors',
        colorBgLayer1: 'colors',
        colorBgLayer2: 'colors',
        zIndexModal: 'engineering',
      };
      Object.entries(expectedFirstOwner).forEach(([id, expectedSchemaId]) => {
        const occurrences = deduped.filter((t) => t.id === id);
        expect(occurrences).toHaveLength(1);
        expect(occurrences[0].schemaId).toBe(expectedSchemaId);
      });
    });

    it('não deve alterar tokens que já são únicos', () => {
      const deduped = deduplicateScaffoldById(getDesignScaffold());
      const btnStyleType = deduped.find((t) => t.id === 'btnStyleType');
      expect(btnStyleType).toBeDefined();
      expect(btnStyleType!.schemaId).toBe('buttons');
    });

    it('cobertura das fatias continua completa (28 famílias) mesmo após deduplicar por id', () => {
      const deduped = deduplicateScaffoldById(getDesignScaffold());
      expect(() => assertSliceCoverage(deduped)).not.toThrow();
    });
  });
});
