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
});
