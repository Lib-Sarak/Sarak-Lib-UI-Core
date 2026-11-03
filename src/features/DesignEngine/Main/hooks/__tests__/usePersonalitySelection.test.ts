import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { usePersonalitySelection } from '../usePersonalitySelection';
import { getPersonality } from '../../../../../core/Design/presets/components/personalities';

const confirmOverlay = vi.fn();
vi.mock('../../../../../components/atomic/Modals/SarakOverlayProvider', () => ({
    useOverlay: () => ({ open: vi.fn(), close: vi.fn(), confirm: confirmOverlay }),
}));

const CORPORATE = getPersonality('personality-corporate')!;
const TECHNICAL = getPersonality('personality-technical')!;
const SYSTEM = { mode: 'dark', colorPalette: 'oceano', sidebarItemDensity: 'comfortable', btnBorderRadius: 12 };

const select = async (personality = CORPORATE, draft: Record<string, unknown> = SYSTEM, system: Record<string, unknown> = SYSTEM) => {
    const onApplyPreset = vi.fn();
    const { result } = renderHook(() => usePersonalitySelection({ draft: draft as never, sarak: { systemDesign: system, allThemes: [] } as never, onApplyPreset }));
    await result.current(personality);
    return onApplyPreset;
};

describe('usePersonalitySelection', () => {
    beforeEach(() => confirmOverlay.mockReset());

    it('sem ajuste manual, aplica a estrutura inteira como preset parcial e não pergunta', async () => {
        const onApplyPreset = await select();
        expect(confirmOverlay).not.toHaveBeenCalled();
        expect(onApplyPreset).toHaveBeenCalledWith(CORPORATE.design, true);
    });

    it('nunca escreve a paleta nem o modo: trocar de Personalidade deixa `colorPalette` como está', async () => {
        const onApplyPreset = await select();
        const written = onApplyPreset.mock.calls[0][0] as Record<string, unknown>;
        expect(written).not.toHaveProperty('colorPalette');
        expect(written).not.toHaveProperty('mode');
    });

    it('com ajuste manual, pergunta; "manter" (cancelar) deixa o token ajustado fora do que se grava', async () => {
        confirmOverlay.mockResolvedValue(false);
        const onApplyPreset = await select(CORPORATE, { ...SYSTEM, sidebarItemDensity: 'spacious' });
        expect(confirmOverlay).toHaveBeenCalledTimes(1);
        expect(confirmOverlay.mock.calls[0][0]).toMatchObject({ confirmLabel: 'Descartar ajustes', cancelLabel: 'Manter ajustes', tone: 'danger' });
        const written = onApplyPreset.mock.calls[0][0] as Record<string, unknown>;
        expect(written).not.toHaveProperty('sidebarItemDensity');
        expect(written.btnBorderRadius).toBe(CORPORATE.design.btnBorderRadius);
    });

    it('só o botão explícito "Descartar ajustes" perde o ajuste', async () => {
        confirmOverlay.mockResolvedValue(true);
        const onApplyPreset = await select(CORPORATE, { ...SYSTEM, sidebarItemDensity: 'spacious' });
        expect((onApplyPreset.mock.calls[0][0] as Record<string, unknown>).sidebarItemDensity).toBe(CORPORATE.design.sidebarItemDensity);
    });

    it('a Personalidade que já está no rascunho não conta como ajuste: trocar de uma para outra não pergunta', async () => {
        const onApplyPreset = await select(TECHNICAL, { ...SYSTEM, ...CORPORATE.design });
        expect(confirmOverlay).not.toHaveBeenCalled();
        expect(onApplyPreset).toHaveBeenCalledWith(TECHNICAL.design, true);
    });

    it('mexer à mão depois de escolher uma Personalidade conta como ajuste', async () => {
        confirmOverlay.mockResolvedValue(false);
        await select(TECHNICAL, { ...SYSTEM, ...CORPORATE.design, btnBorderRadius: 99 });
        expect(confirmOverlay).toHaveBeenCalledTimes(1);
    });

    it('o diálogo escreve "1 item" no singular e "2 itens" no plural', async () => {
        confirmOverlay.mockResolvedValue(false);
        await select(CORPORATE, { ...SYSTEM, sidebarItemDensity: 'spacious' });
        expect(confirmOverlay.mock.calls[0][0].message).toContain('1 item');
        confirmOverlay.mockClear();
        await select(CORPORATE, { ...SYSTEM, sidebarItemDensity: 'spacious', btnBorderRadius: 99 });
        expect(confirmOverlay.mock.calls[0][0].message).toContain('2 itens');
    });
});
