import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useThemeReadiness } from '../useThemeReadiness';
import { getLoadedThemePreset, sarakPreloadThemes } from '../../../Design/presets/themes/registry';
import { SARAK_THEME_LOADERS } from '../../../Design/presets/themes/loaders';
import { DEFAULT_STORAGE_KEY } from '../../constants';

afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
});

const readiness = (requestedThemeId: string | undefined, controlled = false) =>
    renderHook(() => useThemeReadiness({ requestedThemeId, controlled, persistence: undefined }));

describe('useThemeReadiness — a porta de espera do tema sob demanda', () => {
    it('sem pedido, ou com o tema padrão, a porta já nasce aberta', () => {
        expect(readiness(undefined).result.current).toBe(true);
        expect(readiness('sarak-sovereign').result.current).toBe(true);
    });

    it('id inexistente não espera: é decidido sem rede', () => {
        expect(readiness('classic').result.current).toBe(true);
    });

    it('tema embarcado fora de memória FECHA a porta e abre quando ele chega', async () => {
        expect(getLoadedThemePreset('data-terminal')).toBeUndefined();
        const { result } = readiness('data-terminal');

        expect(result.current).toBe(false);
        await waitFor(() => expect(result.current).toBe(true));
        expect(getLoadedThemePreset('data-terminal')).toBeDefined();
    });

    it('tema já pré-carregado: porta aberta no primeiro render', async () => {
        await sarakPreloadThemes(['neumorphic-mobile']);
        expect(readiness('neumorphic-mobile').result.current).toBe(true);
    });

    it('com `design` salvo e tema NÃO controlado, o salvo pinta sozinho: porta aberta, e o id carrega depois', async () => {
        localStorage.setItem(DEFAULT_STORAGE_KEY, '{}');
        const { result } = readiness('industrial-terminal');

        expect(result.current).toBe(true);
        await waitFor(() => expect(getLoadedThemePreset('industrial-terminal')).toBeDefined());
    });

    it('tema CONTROLADO (activeThemeId) espera mesmo com design salvo — o controlado é a verdade', async () => {
        localStorage.setItem(DEFAULT_STORAGE_KEY, '{}');
        expect(getLoadedThemePreset('cyber-retro-wave')).toBeUndefined();
        const { result } = readiness('cyber-retro-wave', true);

        expect(result.current).toBe(false);
        await waitFor(() => expect(result.current).toBe(true));
    });

    it('a porta fecha UMA vez: depois de aberta, um novo pedido fora de memória não a fecha de novo', async () => {
        const { result, rerender } = renderHook(
            ({ id }: { id: string | undefined }) => useThemeReadiness({ requestedThemeId: id, controlled: true, persistence: undefined }),
            { initialProps: { id: 'sarak-sovereign' as string | undefined } },
        );
        expect(result.current).toBe(true);

        rerender({ id: 'blueprint-protocol' });
        expect(result.current).toBe(true);
        await waitFor(() => expect(getLoadedThemePreset('blueprint-protocol')).toBeDefined());
    });

    it('falha do import() libera a porta e registra o erro nomeando o tema', async () => {
        const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        vi.spyOn(SARAK_THEME_LOADERS, 'aurora-veil').mockRejectedValue(new Error('rede'));
        const { result } = readiness('aurora-veil');

        await waitFor(() => expect(result.current).toBe(true));
        expect(error.mock.calls.some((call) => String(call[0]).includes('"aurora-veil"'))).toBe(true);
    });
});
