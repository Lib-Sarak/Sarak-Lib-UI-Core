import { describe, expect, it, vi } from 'vitest';
import {
    getLoadedThemePreset,
    getLoadedThemePresets,
    getThemeCacheVersion,
    isSarakThemePresetId,
    sarakLoadAllThemePresets,
    sarakLoadThemePreset,
    sarakPreloadThemes,
    subscribeThemeCache,
} from '../registry';
import { SARAK_ALL_THEMES } from '../all';
import { SARAK_DEFAULT_THEME_ID, SARAK_THEME_PRESET_IDS } from '../index';

// O cache é de módulo: a ordem dos testes importa — o primeiro vê o cache só com o padrão.
describe('registry — o cache síncrono e o carregador sob demanda', () => {
    it('nasce só com o tema padrão em memória', () => {
        expect(getLoadedThemePresets().map((theme) => theme.id)).toEqual([SARAK_DEFAULT_THEME_ID]);
        expect(getLoadedThemePreset('cyberpunk-neon')).toBeUndefined();
    });

    it('reconhece id embarcado, carregado ou não, e recusa o que não existe', () => {
        expect(isSarakThemePresetId('cyberpunk-neon')).toBe(true);
        expect(isSarakThemePresetId('classic')).toBe(false);
    });

    it('carrega UM tema, devolve o mesmo objeto de all.ts, avisa quem assina e sobe a versão', async () => {
        const listener = vi.fn();
        const unsubscribe = subscribeThemeCache(listener);
        const before = getThemeCacheVersion();

        const theme = await sarakLoadThemePreset('cyberpunk-neon');

        expect(theme).toBe(SARAK_ALL_THEMES.find((candidate) => candidate.id === 'cyberpunk-neon'));
        expect(getLoadedThemePreset('cyberpunk-neon')).toBe(theme);
        expect(getThemeCacheVersion()).toBe(before + 1);
        expect(listener).toHaveBeenCalledTimes(1);
        unsubscribe();
    });

    it('pedidos simultâneos do mesmo id compartilham UMA carga', async () => {
        const before = getThemeCacheVersion();
        const [a, b] = await Promise.all([sarakLoadThemePreset('golden-hour'), sarakLoadThemePreset('golden-hour')]);
        expect(a).toBe(b);
        expect(getThemeCacheVersion()).toBe(before + 1);
    });

    it('carregar o que já está em memória não sobe a versão', async () => {
        const before = getThemeCacheVersion();
        await sarakLoadThemePreset(SARAK_DEFAULT_THEME_ID);
        expect(getThemeCacheVersion()).toBe(before);
    });

    it('id desconhecido REJEITA — nunca devolve undefined mudo', async () => {
        await expect(sarakLoadThemePreset('classic')).rejects.toThrow(/desconhecido/);
    });

    it('sarakPreloadThemes popula o cache síncrono que o Provider lê', async () => {
        await sarakPreloadThemes(['aurora-veil', 'data-terminal']);
        expect(getLoadedThemePreset('aurora-veil')?.id).toBe('aurora-veil');
        expect(getLoadedThemePreset('data-terminal')?.id).toBe('data-terminal');
    });

    it('sarakLoadAllThemePresets traz todos, e a lista em memória segue a ordem do catálogo', async () => {
        const all = await sarakLoadAllThemePresets();
        expect(all).toHaveLength(SARAK_THEME_PRESET_IDS.length);
        expect(getLoadedThemePresets().map((theme) => theme.id)).toEqual([...SARAK_THEME_PRESET_IDS]);
    });
});
