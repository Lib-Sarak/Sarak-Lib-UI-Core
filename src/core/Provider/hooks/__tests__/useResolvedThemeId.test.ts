import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useResolvedThemeId } from '../useResolvedThemeId';

describe('useResolvedThemeId', () => {
    it('nasce com o resultado de resolveSeedThemeId (a semente)', () => {
        const resolveSeedThemeId = vi.fn(() => 'terracota-solar');
        const { result } = renderHook(() => useResolvedThemeId(undefined, resolveSeedThemeId));
        const [resolvedThemeId] = result.current;
        expect(resolvedThemeId).toBe('terracota-solar');
    });

    it('acompanha `activeThemeId` quando a prop CONTROLADA muda de fato', () => {
        const resolveSeedThemeId = vi.fn(() => 'grafite-puro');
        const { result, rerender } = renderHook(
            ({ activeThemeId }: { activeThemeId: string | undefined }) => useResolvedThemeId(activeThemeId, resolveSeedThemeId),
            { initialProps: { activeThemeId: undefined as string | undefined } },
        );
        expect(result.current[0]).toBe('grafite-puro');

        rerender({ activeThemeId: 'forja-ultravioleta' });
        expect(result.current[0]).toBe('forja-ultravioleta');
    });

    it('não muda quando `activeThemeId` continua undefined (ex.: consumidor usa `initialTheme`)', () => {
        const resolveSeedThemeId = vi.fn(() => 'musgo-do-vale');
        const { result, rerender } = renderHook(
            ({ activeThemeId }: { activeThemeId: string | undefined }) => useResolvedThemeId(activeThemeId, resolveSeedThemeId),
            { initialProps: { activeThemeId: undefined as string | undefined } },
        );
        rerender({ activeThemeId: undefined });
        expect(result.current[0]).toBe('musgo-do-vale');
    });

    it('expõe um setter manual — quem aplica um preset novo pode anunciar o id (caminho do PresetsCatalog)', () => {
        const resolveSeedThemeId = vi.fn(() => undefined);
        const { result } = renderHook(() => useResolvedThemeId(undefined, resolveSeedThemeId));
        expect(result.current[0]).toBeUndefined();

        act(() => {
            result.current[1]('ardosia-ao-entardecer');
        });

        expect(result.current[0]).toBe('ardosia-ao-entardecer');
    });
});
