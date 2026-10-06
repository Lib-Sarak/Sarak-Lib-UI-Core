import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useThemeCustomizationData } from '../useThemeCustomizationData';

describe('useThemeCustomizationData', () => {
    it('should export the hook correctly', () => {
        expect(useThemeCustomizationData).toBeDefined();
    });

    // plan-37: components_base.json tinha 28 tokens sem `importance` — ficavam SEMPRE fora do
    // modo Essencial (`t.importance || 0` resolvia para 0). Preenchido o campo, o token entra
    // ou fica de fora pelo mesmo critério `>= 80` de qualquer outro token do catálogo.
    it('plan-37: lê o importance preenchido dos 28 tokens antes órfãos de components_base.json', () => {
        const { result } = renderHook(() => useThemeCustomizationData(''));

        // inputErrorColor recebeu importance 85 (>= 80) — passa a aparecer no modo Essencial.
        expect(result.current.dynamicEssentialTokens.has('inputErrorColor')).toBe(true);

        // multiSelectInputMinWidth recebeu importance 30 (< 80) — continua fora do Essencial,
        // agora por critério explícito, não por ausência de dado.
        expect(result.current.dynamicEssentialTokens.has('multiSelectInputMinWidth')).toBe(false);
    });

    it('plan-37: mantém a curadoria pré-existente de outras partições (cards_engine)', () => {
        const { result } = renderHook(() => useThemeCustomizationData(''));

        expect(result.current.dynamicEssentialTokens.has('cardPaddingMd')).toBe(true);
        expect(result.current.dynamicEssentialTokens.has('cardRadiusTL')).toBe(false);
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
