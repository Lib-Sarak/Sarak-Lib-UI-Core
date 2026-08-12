import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useDesignDraftSync } from '../useDesignDraftSync';
import { SarakDesignState, SarakUIContextType } from '../../../../core/Provider/types';

describe('useDesignDraftSync', () => {
    it('should sync current local draft to sarak provider if different', () => {
        const draftState = { background: '#000' } as unknown as SarakDesignState;
        const setDraftState = vi.fn();
        const setDraftDesign = vi.fn();
        const sarak = {
            draftDesign: { background: '#fff' } as unknown as SarakDesignState,
            setDraftDesign
        } as unknown as SarakUIContextType;
        const isSyncingRef = { current: false };

        renderHook(() => useDesignDraftSync(draftState, setDraftState, sarak, isSyncingRef));

        expect(setDraftDesign).toHaveBeenCalledWith(draftState);
    });

    it('should not sync if isSyncingRef is true', () => {
        const draftState = { background: '#000' } as unknown as SarakDesignState;
        const setDraftState = vi.fn();
        const setDraftDesign = vi.fn();
        const sarak = {
            draftDesign: { background: '#fff' } as unknown as SarakDesignState,
            setDraftDesign
        } as unknown as SarakUIContextType;
        const isSyncingRef = { current: true };

        renderHook(() => useDesignDraftSync(draftState, setDraftState, sarak, isSyncingRef));

        expect(setDraftDesign).not.toHaveBeenCalled();
    });

    it('should clear draft on unmount', () => {
        const draftState = { background: '#000' } as unknown as SarakDesignState;
        const setDraftState = vi.fn();
        const setDraftDesign = vi.fn();
        const sarak = {
            draftDesign: draftState,
            setDraftDesign
        } as unknown as SarakUIContextType;
        const isSyncingRef = { current: false };

        const { unmount } = renderHook(() => useDesignDraftSync(draftState, setDraftState, sarak, isSyncingRef));

        unmount();

        expect(setDraftDesign).toHaveBeenCalledWith(null);
    });
});

describe('useDesignDraftSync — comparação por referência (plan-36, era JSON.stringify a cada render)', () => {
    it('MESMA referência (já sincronizado) não chama setDraftDesign de novo — nem 1 serialização precisa rodar para chegar nessa conclusão', () => {
        const draftState = { background: '#000' } as unknown as SarakDesignState;
        const setDraftState = vi.fn();
        const setDraftDesign = vi.fn();
        // `sarak.draftDesign` já é a MESMA referência de `draftState` — o cenário de
        // "regime permanente" depois de uma sincronização bem-sucedida.
        const sarak = { draftDesign: draftState, setDraftDesign } as unknown as SarakUIContextType;
        const isSyncingRef = { current: false };

        renderHook(() => useDesignDraftSync(draftState, setDraftState, sarak, isSyncingRef));

        expect(setDraftDesign).not.toHaveBeenCalled();
    });

    it('referência NOVA com o MESMO conteúdo ainda propaga (mais estrito que JSON.stringify, nunca mais frouxo — não reintroduz o loop, ver guard de lastProviderDraftRef)', () => {
        const setDraftState = vi.fn();
        const setDraftDesign = vi.fn();
        // Conteúdo idêntico, objetos DIFERENTES — o caso de `resetToken`/`resetComponent`,
        // que sempre espalham um objeto novo mesmo sem mudança de valor.
        const draftState = { background: '#000' } as unknown as SarakDesignState;
        const providerDraft = { background: '#000' } as unknown as SarakDesignState;
        const sarak = { draftDesign: providerDraft, setDraftDesign } as unknown as SarakUIContextType;
        const isSyncingRef = { current: false };

        renderHook(() => useDesignDraftSync(draftState, setDraftState, sarak, isSyncingRef));

        expect(setDraftDesign).toHaveBeenCalledWith(draftState);
    });

    it('sincronização inversa: `sarak.draftDesign` mudando de referência DEPOIS do mount aplica no estado local via setDraftState (mesmo `===`, não `JSON.stringify`)', () => {
        const draftState = { background: '#000' } as unknown as SarakDesignState;
        const setDraftState = vi.fn();
        const isSyncingRef = { current: false };

        const { rerender } = renderHook(
            ({ sarak }) => useDesignDraftSync(draftState, setDraftState, sarak, isSyncingRef),
            { initialProps: { sarak: { draftDesign: draftState, setDraftDesign: vi.fn() } as unknown as SarakUIContextType } },
        );
        expect(setDraftState).not.toHaveBeenCalled();

        // O Provider recebeu um draft NOVO por fora (ex.: outra aba/instância) —
        // referência diferente da que este hook já conhecia.
        const providerDraft = { background: '#fff' } as unknown as SarakDesignState;
        rerender({ sarak: { draftDesign: providerDraft, setDraftDesign: vi.fn() } as unknown as SarakUIContextType });

        expect(setDraftState).toHaveBeenCalledWith(providerDraft);
        expect(isSyncingRef.current).toBe(true); // guard ligado durante a propagação
    });

    it('não reprocessa o MESMO sarak.draftDesign duas vezes seguidas (guard de lastProviderDraftRef sobrevive à troca de comparação)', () => {
        const setDraftState = vi.fn();
        const isSyncingRef = { current: false };
        const initialDraft = { background: '#000' } as unknown as SarakDesignState;
        const providerDraft = { background: '#fff' } as unknown as SarakDesignState;

        const { rerender } = renderHook(
            ({ draftState, sarak }) => useDesignDraftSync(draftState, setDraftState, sarak, isSyncingRef),
            {
                initialProps: {
                    draftState: initialDraft,
                    sarak: { draftDesign: initialDraft, setDraftDesign: vi.fn() } as unknown as SarakUIContextType,
                },
            },
        );

        // O provider muda uma vez — reage uma vez.
        rerender({ draftState: initialDraft, sarak: { draftDesign: providerDraft, setDraftDesign: vi.fn() } as unknown as SarakUIContextType });
        expect(setDraftState).toHaveBeenCalledTimes(1);

        // `draftState` muda de referência entre renders (simula outro efeito do
        // componente disparando), mas `sarak.draftDesign` continua o MESMO objeto —
        // é exatamente o padrão que causou o loop real documentado em
        // [[02-design-engine]] §3.1. Não deve reprocessar.
        rerender({ draftState: { background: '#000' } as unknown as SarakDesignState, sarak: { draftDesign: providerDraft, setDraftDesign: vi.fn() } as unknown as SarakUIContextType });
        rerender({ draftState: { background: '#000' } as unknown as SarakDesignState, sarak: { draftDesign: providerDraft, setDraftDesign: vi.fn() } as unknown as SarakUIContextType });

        expect(setDraftState).toHaveBeenCalledTimes(1);
    });
});
