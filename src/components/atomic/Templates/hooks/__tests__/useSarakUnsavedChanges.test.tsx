import React from 'react';
import { act, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SarakOverlayProvider } from '../../../Modals/SarakOverlayProvider';
import { useSarakUnsavedChanges } from '../useSarakUnsavedChanges';

const fireBeforeUnload = (): Event => {
    const event = new Event('beforeunload', { cancelable: true });
    window.dispatchEvent(event);
    return event;
};

const wrapper = ({ children }: { children: React.ReactNode }): React.ReactElement => (
    <SarakOverlayProvider>{children}</SarakOverlayProvider>
);

describe('useSarakUnsavedChanges', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('sem alteração, fechar a aba não é barrado', () => {
        renderHook(() => useSarakUnsavedChanges({ isDirty: false }));

        expect(fireBeforeUnload().defaultPrevented).toBe(false);
    });

    it('com alteração, fechar a aba é barrado e avisa onBlock', () => {
        const onBlock = vi.fn();
        renderHook(() => useSarakUnsavedChanges({ isDirty: true, onBlock }));

        expect(fireBeforeUnload().defaultPrevented).toBe(true);
        expect(onBlock).toHaveBeenCalledWith('unload');
    });

    it('salvar, ou desmontar, solta o bloqueio', () => {
        const { rerender, unmount } = renderHook(({ isDirty }) => useSarakUnsavedChanges({ isDirty }), {
            initialProps: { isDirty: true },
        });
        rerender({ isDirty: false });
        expect(fireBeforeUnload().defaultPrevented).toBe(false);

        rerender({ isDirty: true });
        unmount();
        expect(fireBeforeUnload().defaultPrevented).toBe(false);
    });

    it('confirmLeave sem alteração libera sem abrir o diálogo', async () => {
        const { result } = renderHook(() => useSarakUnsavedChanges({ isDirty: false }), { wrapper });

        await expect(result.current.confirmLeave()).resolves.toBe(true);
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    /** Devolve a promessa dentro de um objeto: um `await` direto esperaria a resposta do diálogo. */
    const openConfirmation = async (onBlock: () => void): Promise<{ leaving: Promise<boolean> }> => {
        const { result } = renderHook(() => useSarakUnsavedChanges({ isDirty: true, onBlock }), { wrapper });
        let leaving: Promise<boolean> = Promise.resolve(false);
        act(() => {
            leaving = result.current.confirmLeave();
        });
        await waitFor(() => expect(screen.getByText('Sair sem salvar?')).toBeInTheDocument());
        return { leaving };
    };

    it('escolher sair resolve true', async () => {
        const onBlock = vi.fn();
        const { leaving } = await openConfirmation(onBlock);

        fireEvent.click(screen.getByRole('button', { name: 'Sair sem salvar' }));

        await expect(leaving).resolves.toBe(true);
        expect(onBlock).not.toHaveBeenCalled();
    });

    it('continuar editando resolve false e avisa onBlock', async () => {
        const onBlock = vi.fn();
        const { leaving } = await openConfirmation(onBlock);

        fireEvent.click(screen.getByRole('button', { name: 'Continuar editando' }));

        await expect(leaving).resolves.toBe(false);
        expect(onBlock).toHaveBeenCalledWith('navigation');
    });

    it('confirmLeave lê o estado mais recente, mesmo guardado pelo roteador', async () => {
        const { result, rerender } = renderHook(({ isDirty }) => useSarakUnsavedChanges({ isDirty }), {
            initialProps: { isDirty: true },
            wrapper,
        });
        const stored = result.current.confirmLeave;

        rerender({ isDirty: false });

        await expect(stored()).resolves.toBe(true);
    });

    it('fora do Provider, confirmLeave com alteração não libera: perder dado é o pior caso', async () => {
        const { result } = renderHook(() => useSarakUnsavedChanges({ isDirty: true }));

        await expect(result.current.confirmLeave()).resolves.toBe(false);
    });

    it('funciona em componente comum', () => {
        const Screen = (): React.ReactElement => {
            useSarakUnsavedChanges({ isDirty: true });
            return <p>tela</p>;
        };
        render(<Screen />);

        expect(fireBeforeUnload().defaultPrevented).toBe(true);
    });
});
