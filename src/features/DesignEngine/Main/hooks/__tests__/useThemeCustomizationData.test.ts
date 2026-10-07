import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useThemeCustomizationData } from '../useThemeCustomizationData';
import { TokenCatalog } from '../../../../../core/Design/catalog';
import type { ThemeEditMode } from '../usePreviewUIState';

const VISUAL_IMPACT_GROUPS = ['fontes', 'cores', 'fundo', 'cards', 'forma'];
const getMarkedCatalogEntries = () => TokenCatalog.flatMap((entry) => {
    if (!('visualImpact' in entry) || typeof entry.visualImpact !== 'string') return [];
    return [{ tokenId: entry.tokenId, visualImpact: entry.visualImpact }];
});

describe('useThemeCustomizationData', () => {
    it('should export the hook correctly', () => {
        expect(useThemeCustomizationData).toBeDefined();
    });

    it('mantém a visibilidade Essencial determinada por importance >= 80', () => {
        const { result } = renderHook(() => useThemeCustomizationData(''));

        expect(result.current.isTokenVisible('inputErrorColor')).toBe(true);
        expect(result.current.isTokenVisible('multiSelectInputMinWidth')).toBe(false);
    });

    it('mantém a curadoria Essencial pré-existente de outras partições', () => {
        const { result } = renderHook(() => useThemeCustomizationData(''));

        expect(result.current.isTokenVisible('cardPaddingMd')).toBe(true);
        expect(result.current.isTokenVisible('cardRadiusTL')).toBe(false);
    });

    it('marca entre 20 e 30 ids únicos, em grupos válidos e presentes no schema', () => {
        const markedEntries = getMarkedCatalogEntries();
        const markedIds = new Set(markedEntries.map((entry) => entry.tokenId));
        const { result } = renderHook(() => useThemeCustomizationData('', 'impact'));
        const schemaIds = new Set(result.current.visualImpactTokens.map(({ token }) => token.id));

        expect(markedIds.size).toBeGreaterThanOrEqual(20);
        expect(markedIds.size).toBeLessThanOrEqual(30);
        markedEntries.forEach((entry) => expect(VISUAL_IMPACT_GROUPS).toContain(entry.visualImpact));
        expect(schemaIds).toEqual(markedIds);
        expect(result.current.visualImpactTokens).toHaveLength(markedIds.size);
    });

    it('preserva âncoras e exclui candidatos sem efeito independente provado', () => {
        const markedEntries = getMarkedCatalogEntries();
        const groupFor = (tokenId: string) => markedEntries.find((entry) => entry.tokenId === tokenId)?.visualImpact;

        expect(groupFor('headingFont')).toBe('fontes');
        expect(groupFor('bodyFont')).toBe('fontes');
        expect(groupFor('primaryColor')).toBe('cores');
        expect(groupFor('texture')).toBe('fundo');
        expect(groupFor('cardVariant')).toBe('cards');
        expect(groupFor('bgBaseColor')).toBe('fundo');
        [
            'layoutDensity',
            'maxContentWidth',
            'isSplitViewEnabled',
            'colorBgBody',
            'accentColor',
            'colorPalette',
            'bgGradientMode'
        ].forEach((tokenId) => {
            expect(groupFor(tokenId)).toBeUndefined();
        });
    });

    it.each([
        ['cardBackgroundColor', 'cards'],
        ['bgBaseColor', 'fundo']
    ])('marca todas as entradas duplicadas de %s no mesmo grupo', (tokenId, group) => {
        const entries = getMarkedCatalogEntries().filter((entry) => entry.tokenId === tokenId);

        expect(entries).toHaveLength(2);
        expect(entries.map((entry) => entry.visualImpact)).toEqual([group, group]);
    });

    it('aplica os três modos de visibilidade e mantém Completo abrangente', () => {
        const { result, rerender } = renderHook(({ mode }) => useThemeCustomizationData('', mode), {
            initialProps: { mode: 'essential' as ThemeEditMode }
        });

        expect(result.current.isTokenVisible('inputErrorColor')).toBe(true);
        rerender({ mode: 'impact' });
        expect(result.current.isTokenVisible('primaryColor')).toBe(true);
        expect(result.current.isTokenVisible('multiSelectInputMinWidth')).toBe(false);
        rerender({ mode: 'complete' });
        expect(result.current.isTokenVisible('multiSelectInputMinWidth')).toBe(true);
    });
    it('filteredResults é nulo sem busca e usa a busca por sentido quando há consulta', () => {
        expect(renderHook(() => useThemeCustomizationData('')).result.current.filteredResults).toBeNull();

        const { result } = renderHook(() => useThemeCustomizationData('escrita'));
        const found = (result.current.filteredResults ?? []).map((token) => token.id);
        expect(found).toEqual(expect.arrayContaining(['headingFont', 'bodyFont', 'monoFont']));
    });

    it('filteredResults acha pelo `name` do catálogo e traz os tokens da composição da barra', () => {
        const byLogo = renderHook(() => useThemeCustomizationData('logo')).result.current.filteredResults ?? [];
        expect(byLogo.map((token) => token.id)).toContain('identityAlignment');

        ['chrome', 'barra'].forEach((query) => {
            const { result } = renderHook(() => useThemeCustomizationData(query));
            const chromeIds = (result.current.catalogMap.size ? [...result.current.catalogMap.values()] : [])
                .filter((entry) => (entry as { categories?: string[] }).categories?.includes('chrome-composition'))
                .map((entry) => (entry as unknown as { tokenId: string }).tokenId);
            const found = new Set((result.current.filteredResults ?? []).map((token) => token.id));
            expect(chromeIds).toHaveLength(8);
            chromeIds.forEach((id) => expect(found.has(id)).toBe(true));
        });
    });
});
