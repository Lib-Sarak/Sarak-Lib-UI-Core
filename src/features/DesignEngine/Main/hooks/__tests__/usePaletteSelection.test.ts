import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import { usePaletteSelection } from '../usePaletteSelection';
import { resolvePalette, sarakResolvePalette } from '../../../../../core/Design/palette/resolve';
import { parsePaletteValue } from '../../../../../core/Design/palette/parser';
import { LIBRARY_TEXT_CATALOG } from '../../../../../core/i18n/catalog';
import { sarakLoadThemePreset } from '../../../../../core/Design/presets/themes/registry';
import { findThemeEntry, recomposeDesignChoices } from '../../../../../core/Provider/utils/designChoices';
import { validateDesign } from '../../../../../core/Provider/utils/validation';
import type { ModeResolvableTheme } from '../../../../../core/Design/presets/themes/color-engine';

const confirmOverlay = vi.fn();
vi.mock('../../../../../components/atomic/Modals/SarakOverlayProvider', () => ({
    useOverlay: () => ({ open: vi.fn(), close: vi.fn(), confirm: confirmOverlay }),
}));

const VALUE = 'custom:triadic:#2563eb';

const toned = (value: string): Record<string, string> => resolvePalette(parsePaletteValue(value)!, 'dark', { sidebarTone: 'primary', topbarTone: 'surface' });

const select = async (draft: Record<string, unknown>, applied: Record<string, unknown> | undefined = {}, theme?: ModeResolvableTheme) => {
    const updateDraft = vi.fn();
    const { result } = renderHook(() => usePaletteSelection({ draft, appliedDesign: applied, updateDraft, theme }));
    await result.current(VALUE);
    return updateDraft;
};

const written = (updateDraft: ReturnType<typeof vi.fn>): Record<string, unknown> =>
    Object.fromEntries(updateDraft.mock.calls as Array<[string, unknown]>);

describe('usePaletteSelection', () => {
    beforeEach(() => confirmOverlay.mockReset());

    it('grava colorPalette e as cores do modo do rascunho, sem perguntar quando nada foi ajustado', async () => {
        const updateDraft = await select({ mode: 'light' });
        const patch = written(updateDraft);
        expect(patch.colorPalette).toBe(VALUE);
        expect(patch.topbarColor).toBe(sarakResolvePalette(VALUE, 'light').topbarColor);
        expect(confirmOverlay).not.toHaveBeenCalled();
    });

    it('escolher a paleta que já vale não grava nada', async () => {
        const updateDraft = await select({ mode: 'dark', colorPalette: VALUE });
        expect(updateDraft).not.toHaveBeenCalled();
    });

    it('com ajuste manual e resposta "manter" (cancelar), o token ajustado fica fora do patch', async () => {
        confirmOverlay.mockResolvedValue(false);
        const updateDraft = await select({ mode: 'dark', sidebarColor: '#123456' }, { sidebarColor: '#000000' });
        const patch = written(updateDraft);
        expect(confirmOverlay).toHaveBeenCalledTimes(1);
        expect(confirmOverlay.mock.calls[0][0]).toMatchObject({
            confirmLabel: 'Descartar ajustes',
            cancelLabel: 'Manter meus ajustes',
            tone: 'danger',
        });
        expect(patch).not.toHaveProperty('sidebarColor');
        expect(patch.colorPalette).toBe(VALUE);
    });

    it('com ajuste manual e "Descartar ajustes", o token ajustado recebe a cor calculada', async () => {
        confirmOverlay.mockResolvedValue(true);
        const updateDraft = await select({ mode: 'dark', sidebarColor: '#123456' }, { sidebarColor: '#000000' });
        expect(written(updateDraft).sidebarColor).toBe(sarakResolvePalette(VALUE, 'dark').sidebarColor);
    });

    it('fechar o diálogo (resolve false) mantém o ajuste: descartar exige o botão explícito', async () => {
        confirmOverlay.mockResolvedValue(false);
        const updateDraft = await select({ mode: 'dark', sidebarColor: '#123456' }, { sidebarColor: '#000000' });
        expect(written(updateDraft)).not.toHaveProperty('sidebarColor');
    });

    it('com paleta anterior, o ajuste é a diferença para ela, não para o design aplicado', async () => {
        const previous = sarakResolvePalette('oceano', 'dark');
        const updateDraft = await select({ mode: 'dark', ...previous, colorPalette: 'oceano' }, { sidebarColor: '#000000' });
        expect(confirmOverlay).not.toHaveBeenCalled();
        expect(written(updateDraft).colorPalette).toBe(VALUE);
    });

    it('com papel de cor nas barras, a cor delas calculada com o papel não é ajuste manual, e a troca de paleta mantém o papel', async () => {
        const previous = toned('oceano');
        const updateDraft = await select({ mode: 'dark', ...previous, colorPalette: 'oceano', sidebarTone: 'primary', topbarTone: 'surface' }, { sidebarColor: '#000000' });
        expect(confirmOverlay).not.toHaveBeenCalled();
        expect(written(updateDraft).sidebarColor).toBe(toned(VALUE).sidebarColor);
        expect(written(updateDraft).sidebarColor).not.toBe(sarakResolvePalette(VALUE, 'dark').sidebarColor);
    });
    it('o diálogo escreve "1 cor" no singular e "2 cores" no plural', async () => {
        confirmOverlay.mockResolvedValue(false);
        await select({ mode: 'dark', sidebarColor: '#123456' }, { sidebarColor: '#000000' });
        expect(confirmOverlay.mock.calls[0][0].message).toBe('Você ajustou 1 cor à mão. Manter esse ajuste sobre a nova paleta ou descartá-lo?');
        confirmOverlay.mockClear();
        await select({ mode: 'dark', sidebarColor: '#123456', topbarColor: '#654321' }, { sidebarColor: '#000000', topbarColor: '#000000' });
        expect(confirmOverlay.mock.calls[0][0].message).toBe('Você ajustou 2 cores à mão. Manter esses ajustes sobre a nova paleta ou descartá-los?');
    });

    it('as duas formas do aviso existem nos seis idiomas e nenhuma traz "(es)" ou "(s)"', () => {
        (['paletteKeepMessageOne', 'paletteKeepMessageMany'] as const).forEach((key) => {
            const entry = LIBRARY_TEXT_CATALOG[key] as Record<string, string>;
            expect(Object.keys(entry).sort()).toEqual(['de', 'en', 'es', 'fr', 'it', 'pt']);
            Object.values(entry).forEach((value) => expect(value).not.toMatch(/\((es|s|n)\)/));
        });
    });

    describe('o tema do rascunho declara cor por cima da paleta', () => {
        const THEMES = ['neo-brutalism', 'cyberpunk-neon', 'industrial-terminal'];
        beforeAll(async () => { await Promise.all(THEMES.map((id) => sarakLoadThemePreset(id))); });
        const composed = (id: string) => {
            const theme = findThemeEntry(undefined, id)!;
            return { theme, draft: validateDesign(recomposeDesignChoices({}, theme)) as unknown as Record<string, unknown> };
        };

        it.each(THEMES)('%s: sem ajuste manual, trocar de paleta não abre o diálogo', async (id) => {
            const { theme, draft } = composed(id);
            await select(draft, draft, theme);
            expect(confirmOverlay).not.toHaveBeenCalled();
        });

        it.each(THEMES)('%s: com 2 cores ajustadas à mão, o diálogo diz 2', async (id) => {
            confirmOverlay.mockResolvedValue(false);
            const { theme, draft } = composed(id);
            await select({ ...draft, titleColor: '#123456', bgBaseColor: '#654321' }, draft, theme);
            expect(confirmOverlay).toHaveBeenCalledTimes(1);
            expect(confirmOverlay.mock.calls[0][0].message).toContain('2 cores');
        });
    });
});
