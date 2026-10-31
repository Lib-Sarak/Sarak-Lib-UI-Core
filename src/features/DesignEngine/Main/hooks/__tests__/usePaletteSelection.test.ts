import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { usePaletteSelection } from '../usePaletteSelection';
import { sarakResolvePalette } from '../../../../../core/Design/palette/resolve';
import { LIBRARY_TEXT_CATALOG } from '../../../../../core/i18n/catalog';

const confirmOverlay = vi.fn();
vi.mock('../../../../../components/atomic/Modals/SarakOverlayProvider', () => ({
    useOverlay: () => ({ open: vi.fn(), close: vi.fn(), confirm: confirmOverlay }),
}));

const VALUE = 'custom:triadic:#2563eb';

const select = async (draft: Record<string, unknown>, applied: Record<string, unknown> | undefined = {}) => {
    const updateDraft = vi.fn();
    const { result } = renderHook(() => usePaletteSelection({ draft, appliedDesign: applied, updateDraft }));
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
});
