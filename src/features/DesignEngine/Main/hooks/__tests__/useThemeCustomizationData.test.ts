import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useThemeCustomizationData } from '../useThemeCustomizationData';
import { TokenCatalog } from '../../../../../core/Design/catalog';

const VISUAL_IMPACT_GROUPS = ['fontes', 'cores', 'fundo', 'cards', 'forma'];
const getMarkedCatalogEntries = () => TokenCatalog.flatMap((entry) => {
    if (!('visualImpact' in entry) || typeof entry.visualImpact !== 'string') return [];
    return [{ tokenId: entry.tokenId, visualImpact: entry.visualImpact }];
});

describe('useThemeCustomizationData', () => {
    it('should export the hook correctly', () => {
        expect(useThemeCustomizationData).toBeDefined();
    });

    it('marca entre 20 e 30 ids únicos, em grupos válidos e presentes no schema', () => {
        const markedEntries = getMarkedCatalogEntries();
        const markedIds = new Set(markedEntries.map((entry) => entry.tokenId));
        const { result } = renderHook(() => useThemeCustomizationData(''));
        const { grouped, meta } = result.current.decisionContext;
        const schemaIds = new Set(Object.values(grouped).flatMap((sections) => Object.values(sections).flat())
            .map((token) => token.id).filter((id) => VISUAL_IMPACT_GROUPS.includes(meta.get(id)?.visualImpact ?? '')));

        expect(markedIds.size).toBeGreaterThanOrEqual(20);
        expect(markedIds.size).toBeLessThanOrEqual(30);
        markedEntries.forEach((entry) => expect(VISUAL_IMPACT_GROUPS).toContain(entry.visualImpact));
        schemaIds.forEach((id) => expect(markedIds.has(id)).toBe(true));
        expect(schemaIds.size).toBeGreaterThanOrEqual(20);
    });

    it('preserva âncoras e exclui candidatos sem efeito independente provado', () => {
        const markedEntries = getMarkedCatalogEntries();
        const groupFor = (tokenId: string) => markedEntries.find((entry) => entry.tokenId === tokenId)?.visualImpact;

        expect(groupFor('headingFont')).toBe('fontes');
        expect(groupFor('bodyFont')).toBe('fontes');
        expect(groupFor('primaryColor')).toBe('cores');
        expect(groupFor('texture')).toBe('fundo');
        expect(groupFor('bgBaseColor')).toBe('fundo');
        [
            'layoutDensity',
            'maxContentWidth',
            'isSplitViewEnabled',
            'colorBgBody',
            'accentColor',
            'bgGradientMode',
            // escolhe QUAL cartão o SarakCardGrid desenha, não um estilo
            'cardVariant'
        ].forEach((tokenId) => {
            expect(groupFor(tokenId)).toBeUndefined();
        });
    });

    it.each([
        ['cardBackgroundColor', 'cards'],
        ['bgBaseColor', 'fundo']
    ])('tem UMA entrada de %s, no grupo dela (o catálogo não repete token)', (tokenId, group) => {
        const entries = getMarkedCatalogEntries().filter((entry) => entry.tokenId === tokenId);

        expect(entries).toHaveLength(1);
        expect(entries.map((entry) => entry.visualImpact)).toEqual([group]);
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
