import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SarakUIProvider } from '../../../../../core/Provider/SarakUIProvider';
import { useSavedPalettes } from '../useSavedPalettes';

const confirmOverlay = vi.fn();
vi.mock('../../../../../components/atomic/Modals/SarakOverlayProvider', async (importOriginal) => ({
    ...(await importOriginal<typeof import('../../../../../components/atomic/Modals/SarakOverlayProvider')>()),
    useOverlay: () => ({ open: vi.fn(), close: vi.fn(), confirm: confirmOverlay }),
}));

const BLUE = 'custom:analogous:#2563eb';
const WARM = 'custom:complementary:#aa3366';
const wrapper = ({ children }: { children: React.ReactNode }) => React.createElement(SarakUIProvider, null, children);

const setup = (savedPalettes?: string) => {
    const updateDraft = vi.fn();
    const view = renderHook(() => useSavedPalettes({ draft: savedPalettes === undefined ? {} : { savedPalettes }, updateDraft }), { wrapper });
    return { updateDraft, ...view };
};

describe('useSavedPalettes', () => {
    beforeEach(() => { confirmOverlay.mockReset(); });

    it('lê a lista do rascunho: sem a chave, vazia; com ela, decodificada', () => {
        expect(setup().result.current.saved).toEqual([]);
        expect(setup(`sp-1|Marca|${BLUE}`).result.current.saved).toEqual([{ id: 'sp-1', name: 'Marca', value: BLUE }]);
    });

    it('salvar nome novo grava o texto da lista no rascunho, sem perguntar', async () => {
        const { result, updateDraft } = setup();
        let outcome = '';
        await act(async () => { outcome = await result.current.save('Marca azul', BLUE); });
        expect(outcome).toBe('saved');
        expect(confirmOverlay).not.toHaveBeenCalled();
        expect(updateDraft).toHaveBeenCalledWith('savedPalettes', `sp-1|Marca azul|${BLUE}`);
    });

    it('nome vazio, valor que não é paleta custom e lista cheia são recusados sem gravar', async () => {
        const { result, updateDraft } = setup();
        await act(async () => {
            expect(await result.current.save('  ', BLUE)).toBe('name');
            expect(await result.current.save('X', 'oceano')).toBe('value');
        });
        const full = Array.from({ length: 24 }, (_, index) => `sp-${index + 1}|P${index + 1}|${BLUE}`).join('~');
        const filled = setup(full);
        await act(async () => { expect(await filled.result.current.save('Nova', WARM)).toBe('full'); });
        expect(updateDraft).not.toHaveBeenCalled();
        expect(filled.updateDraft).not.toHaveBeenCalled();
    });

    it('nome repetido pergunta: "Manter a atual" não grava; "Substituir" troca o valor e mantém o id', async () => {
        const { result, updateDraft } = setup(`sp-1|Marca azul|${BLUE}`);
        confirmOverlay.mockResolvedValueOnce(false);
        await act(async () => { expect(await result.current.save(' marca AZUL ', WARM)).toBe('kept'); });
        expect(updateDraft).not.toHaveBeenCalled();
        expect(confirmOverlay.mock.calls[0][0]).toMatchObject({ confirmLabel: 'Substituir', cancelLabel: 'Manter a atual' });

        confirmOverlay.mockResolvedValueOnce(true);
        await act(async () => { expect(await result.current.save(' marca AZUL ', WARM)).toBe('saved'); });
        expect(updateDraft).toHaveBeenCalledWith('savedPalettes', `sp-1|Marca azul|${WARM}`);
    });

    it('apagar pede confirmação (tom de perigo) e só então tira a entrada; apagar a última esvazia o texto', async () => {
        const { result, updateDraft } = setup(`sp-1|Marca azul|${BLUE}~sp-2|Quente|${WARM}`);
        confirmOverlay.mockResolvedValueOnce(false);
        await act(async () => { await result.current.remove(result.current.saved[0]); });
        expect(updateDraft).not.toHaveBeenCalled();
        expect(confirmOverlay.mock.calls[0][0]).toMatchObject({ tone: 'danger', confirmLabel: 'Apagar' });

        confirmOverlay.mockResolvedValueOnce(true);
        await act(async () => { await result.current.remove(result.current.saved[0]); });
        expect(updateDraft).toHaveBeenLastCalledWith('savedPalettes', `sp-2|Quente|${WARM}`);

        const last = setup(`sp-1|Marca azul|${BLUE}`);
        confirmOverlay.mockResolvedValueOnce(true);
        await act(async () => { await last.result.current.remove(last.result.current.saved[0]); });
        expect(last.updateDraft).toHaveBeenCalledWith('savedPalettes', '');
    });
});
