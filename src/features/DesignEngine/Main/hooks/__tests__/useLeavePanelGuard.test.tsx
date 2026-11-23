import React from 'react';
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useLeavePanelGuard, type SarakPanelLeaveControl } from '../useLeavePanelGuard';

const setup = (isDirty: boolean) => {
    const onApply = vi.fn();
    const onDiscard = vi.fn();
    let control: SarakPanelLeaveControl | undefined;
    const hook = renderHook(
        ({ dirty }) => useLeavePanelGuard({ isDirty: dirty, onApply, onDiscard, onControl: (next) => { control = next; } }),
        { initialProps: { dirty: isDirty } },
    );
    return { ...hook, onApply, onDiscard, leave: () => control!.confirmLeave() };
};

const fireUnload = (): BeforeUnloadEvent => {
    const event = new Event('beforeunload', { cancelable: true }) as BeforeUnloadEvent;
    window.dispatchEvent(event);
    return event;
};

describe('useLeavePanelGuard', () => {
    it('sem rascunho sujo, sair não pergunta nada e o navegador não é avisado', async () => {
        const { result, leave } = setup(false);

        await expect(leave()).resolves.toBe(true);
        expect(result.current.isAsking).toBe(false);
        expect(fireUnload().defaultPrevented).toBe(false);
    });

    it('com rascunho sujo, fechar a aba aciona o aviso do navegador; limpo de novo, deixa de acionar', () => {
        const { rerender } = setup(true);

        expect(fireUnload().defaultPrevented).toBe(true);
        rerender({ dirty: false });
        expect(fireUnload().defaultPrevented).toBe(false);
    });

    it('com rascunho sujo, sair pergunta e fica esperando a resposta', async () => {
        const { result, leave } = setup(true);
        let answer: boolean | undefined;

        await act(async () => { void leave().then((value) => { answer = value; }); });

        expect(result.current.isAsking).toBe(true);
        expect(answer).toBeUndefined();
    });

    it.each([
        ['stay', false, 0, 0],
        ['apply', true, 1, 0],
        ['discard', true, 0, 1],
    ] as const)('a escolha "%s" resolve %s, aplica %i vez e descarta %i vez', async (choice, canLeave, applied, discarded) => {
        const { result, leave, onApply, onDiscard } = setup(true);
        let answer: boolean | undefined;
        await act(async () => { void leave().then((value) => { answer = value; }); });

        await act(async () => { result.current.choose(choice); });

        expect(answer).toBe(canLeave);
        expect(onApply).toHaveBeenCalledTimes(applied);
        expect(onDiscard).toHaveBeenCalledTimes(discarded);
        expect(result.current.isAsking).toBe(false);
    });

    it('desmontar com a pergunta aberta responde "ficar"', async () => {
        const { leave, unmount } = setup(true);
        let answer: boolean | undefined;
        await act(async () => { void leave().then((value) => { answer = value; }); });

        unmount();
        await act(async () => { await Promise.resolve(); });

        expect(answer).toBe(false);
    });
});
