import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useThemeCollection } from '../useThemeCollection';
import { GLOBAL_THEMES } from '../../../Design/presets/themes/index';
import type { SarakUIOptions } from '../../types';

describe('useThemeCollection (ADR-011 — uma porta de escrita, sem porta de leitura/apagar)', () => {
    it('allThemes começa como GLOBAL_THEMES + customThemes, sem nenhum tema salvo', () => {
        const customTheme = { id: 'meu-custom', name: 'Meu Custom', design: {} };
        const { result } = renderHook(() => useThemeCollection([customTheme], {} as SarakUIOptions));

        expect(result.current.allThemes).toHaveLength(GLOBAL_THEMES.length + 1);
        expect(result.current.allThemes[result.current.allThemes.length - 1]).toEqual(customTheme);
    });

    it('saveTheme funde o tema validado em allThemes, DEPOIS de customThemes', async () => {
        const customTheme = { id: 'meu-custom', name: 'Meu Custom', design: {} };
        const { result } = renderHook(() => useThemeCollection([customTheme], {} as SarakUIOptions));

        await act(async () => {
            await result.current.saveTheme({ id: 'meu-tema', name: 'Meu Tema', design: { primaryColor: '#123456' } });
        });

        const ids = result.current.allThemes.map((t) => t.id);
        expect(ids).toEqual([...GLOBAL_THEMES.map((t) => t.id), 'meu-custom', 'meu-tema']);
    });

    it('salvar o mesmo id duas vezes SUBSTITUI, nunca duplica', async () => {
        const { result } = renderHook(() => useThemeCollection([], {} as SarakUIOptions));

        await act(async () => {
            await result.current.saveTheme({ id: 'meu-tema', name: 'V1', design: { primaryColor: '#111111' } });
        });
        await act(async () => {
            await result.current.saveTheme({ id: 'meu-tema', name: 'V2', design: { primaryColor: '#222222' } });
        });

        const savedEntries = result.current.allThemes.filter((t) => t.id === 'meu-tema');
        expect(savedEntries).toHaveLength(1);
        expect(savedEntries[0].name).toBe('V2');
    });

    it('chama options.theme.onSave com o ThemeEntry já validado', async () => {
        const onSave = vi.fn().mockResolvedValue(undefined);
        const options = { theme: { onSave } } as unknown as SarakUIOptions;
        const { result } = renderHook(() => useThemeCollection([], options));

        await act(async () => {
            await result.current.saveTheme({ id: 'meu-tema', name: 'Meu Tema', design: { primaryColor: '#123456' } });
        });

        expect(onSave).toHaveBeenCalledWith(expect.objectContaining({
            id: 'meu-tema',
            name: 'Meu Tema',
            design: expect.objectContaining({ primaryColor: '#123456' })
        }));
    });

    it('sem options.theme.onSave configurado, saveTheme não lança e ainda funde o tema', async () => {
        const { result } = renderHook(() => useThemeCollection([], {} as SarakUIOptions));

        await act(async () => {
            await expect(result.current.saveTheme({ id: 'meu-tema', name: 'Meu Tema', design: {} })).resolves.toBeUndefined();
        });

        expect(result.current.allThemes.some((t) => t.id === 'meu-tema')).toBe(true);
    });

    it('onSave que rejeita propaga o erro, mas o tema PERMANECE em allThemes', async () => {
        const onSave = vi.fn().mockRejectedValue(new Error('backend do consumidor fora do ar'));
        const options = { theme: { onSave } } as unknown as SarakUIOptions;
        const { result } = renderHook(() => useThemeCollection([], options));

        await act(async () => {
            await expect(
                result.current.saveTheme({ id: 'meu-tema', name: 'Meu Tema', design: {} })
            ).rejects.toThrow('backend do consumidor fora do ar');
        });

        expect(result.current.allThemes.some((t) => t.id === 'meu-tema')).toBe(true);
    });

    it('descarta chave fora do contrato do design com warn (validateDesign na fronteira — 10-seguranca §2.1)', async () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const { result } = renderHook(() => useThemeCollection([], {} as SarakUIOptions));

        await act(async () => {
            await result.current.saveTheme({ id: 'tema-hostil', name: 'Tema Hostil', design: { chaveInventada: 'x' } });
        });

        const saved = result.current.allThemes.find((t) => t.id === 'tema-hostil');
        expect((saved?.design as Record<string, unknown> | undefined)?.chaveInventada).toBeUndefined();
        expect(warn).toHaveBeenCalled();
        warn.mockRestore();
    });
});
