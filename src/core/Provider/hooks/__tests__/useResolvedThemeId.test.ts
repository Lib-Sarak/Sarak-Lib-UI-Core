import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useResolvedThemeId } from '../useResolvedThemeId';

describe('useResolvedThemeId', () => {
    it('nasce com o resultado de resolveSeedThemeId (a semente)', () => {
        const resolveSeedThemeId = vi.fn(() => 'minimalist-airy');
        const { result } = renderHook(() => useResolvedThemeId(undefined, resolveSeedThemeId));
        const [resolvedThemeId] = result.current;
        expect(resolvedThemeId).toBe('minimalist-airy');
    });

    it('acompanha `activeThemeId` quando a prop CONTROLADA muda de fato', () => {
        const resolveSeedThemeId = vi.fn(() => 'sarak-sovereign');
        const { result, rerender } = renderHook(
            ({ activeThemeId }: { activeThemeId: string | undefined }) => useResolvedThemeId(activeThemeId, resolveSeedThemeId),
            { initialProps: { activeThemeId: undefined as string | undefined } },
        );
        expect(result.current[0]).toBe('sarak-sovereign');

        rerender({ activeThemeId: 'kinetic-flow' });
        expect(result.current[0]).toBe('kinetic-flow');
    });

    it('não muda quando `activeThemeId` continua undefined (ex.: consumidor usa `initialTheme`)', () => {
        const resolveSeedThemeId = vi.fn(() => 'neo-brutalism');
        const { result, rerender } = renderHook(
            ({ activeThemeId }: { activeThemeId: string | undefined }) => useResolvedThemeId(activeThemeId, resolveSeedThemeId),
            { initialProps: { activeThemeId: undefined as string | undefined } },
        );
        rerender({ activeThemeId: undefined });
        expect(result.current[0]).toBe('neo-brutalism');
    });

    it('expõe um setter manual — quem aplica um preset novo pode anunciar o id (caminho do PresetsCatalog)', () => {
        const resolveSeedThemeId = vi.fn(() => undefined);
        const { result } = renderHook(() => useResolvedThemeId(undefined, resolveSeedThemeId));
        expect(result.current[0]).toBeUndefined();

        act(() => {
            result.current[1]('cyber-retro-wave');
        });

        expect(result.current[0]).toBe('cyber-retro-wave');
    });

    it('`activeThemeId` desconhecido resolve para o tema padrão e volta ao id quando o tema fica conhecido', () => {
        const resolveSeedThemeId = vi.fn(() => 'sarak-sovereign');
        const known = new Set<string>();
        const isUnknownTheme = (id: string | undefined) => Boolean(id) && !known.has(id as string);
        const { result, rerender } = renderHook(
            ({ activeThemeId, unknownCheck }: { activeThemeId: string | undefined; unknownCheck: typeof isUnknownTheme }) =>
                useResolvedThemeId(activeThemeId, resolveSeedThemeId, unknownCheck),
            { initialProps: { activeThemeId: 'meu-tema' as string | undefined, unknownCheck: isUnknownTheme } },
        );
        expect(result.current[0]).toBe('sarak-sovereign');

        // A lista de temas do consumidor chega: o mesmo id passa a ser conhecido (nova função, como `allThemes` novo).
        known.add('meu-tema');
        rerender({ activeThemeId: 'meu-tema', unknownCheck: (id) => Boolean(id) && !known.has(id as string) });
        expect(result.current[0]).toBe('meu-tema');

        // E o inverso: o tema some da lista e o padrão volta.
        known.delete('meu-tema');
        rerender({ activeThemeId: 'meu-tema', unknownCheck: (id) => Boolean(id) && !known.has(id as string) });
        expect(result.current[0]).toBe('sarak-sovereign');
    });

    it('reavaliar a função com o MESMO resultado não reaplica o id (o painel pode ter anunciado outro tema)', () => {
        const resolveSeedThemeId = vi.fn(() => 'sarak-sovereign');
        const { result, rerender } = renderHook(
            ({ unknownCheck }: { unknownCheck: (id: string | undefined) => boolean }) =>
                useResolvedThemeId('kinetic-flow', resolveSeedThemeId, unknownCheck),
            { initialProps: { unknownCheck: () => false } },
        );
        act(() => { result.current[1]('cyber-retro-wave'); });
        rerender({ unknownCheck: () => false });
        expect(result.current[0]).toBe('cyber-retro-wave');
    });
});
