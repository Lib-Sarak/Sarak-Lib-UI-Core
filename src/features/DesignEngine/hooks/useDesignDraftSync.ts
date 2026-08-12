import { useEffect, useRef } from 'react';
import { SarakUIContextType, SarakDesignState } from '../../../core/Provider/types';

export const useDesignDraftSync = (
    draftState: SarakDesignState | null,
    setDraftState: (draft: SarakDesignState | null) => void,
    sarak: SarakUIContextType,
    isSyncingRef: React.MutableRefObject<boolean>
) => {
    // 6. Ponte de Live Preview (Sincronização Atômica v12.8)
    //
    // plan-36: era `JSON.stringify(draftState) !== JSON.stringify(sarak.draftDesign)` —
    // serializar um objeto de ~500+ chaves EM TODO RENDER do rascunho, só para comparar.
    // `sarak.setDraftDesign` é o `useState` setter cru de `useSarakDrafting.ts` (não
    // clona), então depois de `setDraftDesign(draftState)` o próximo `sarak.draftDesign`
    // É `draftState`, mesma referência — comparação por `===` é equivalente em regime
    // permanente, e mais estrita (não mais laxa) no caso raro de referência nova com
    // conteúdo idêntico (`resetToken`/`resetComponent` sempre espalham um objeto novo,
    // mesmo sem mudança de valor) — errar para o lado de sincronizar demais nunca
    // reintroduz o loop, só o guard abaixo protege contra isso.
    useEffect(() => {
        if (!sarak.setDraftDesign) return;

        // Se estamos no meio de uma sincronização vinda do provedor, ignoramos para evitar ecos
        if (isSyncingRef.current) return;

        if (draftState !== sarak.draftDesign) {
            sarak.setDraftDesign(draftState);
        }
    }, [draftState, sarak.setDraftDesign, sarak.draftDesign, isSyncingRef]);

    const lastProviderDraftRef = useRef(sarak.draftDesign);

    // 7. Sincronização Inversa (External Changes -> Local Draft)
    // MESMO guard de antes ([[02-design-engine]] §3.1 — loop real por referência
    // instável): `lastProviderDraftRef` continua existindo para não reprocessar um
    // `sarak.draftDesign` que este efeito já reagiu — só a comparação de IGUALDADE
    // trocou de `JSON.stringify` para `===`.
    useEffect(() => {
        if (sarak.draftDesign === draftState) {
            lastProviderDraftRef.current = sarak.draftDesign;
            return;
        }

        if (sarak.draftDesign !== lastProviderDraftRef.current) {
            isSyncingRef.current = true;
            setDraftState(sarak.draftDesign);
            lastProviderDraftRef.current = sarak.draftDesign;

            // Resetamos a flag no próximo tick
            setTimeout(() => {
                isSyncingRef.current = false;
            }, 0);
        }
    }, [sarak.draftDesign, draftState, setDraftState, isSyncingRef]);

    // 8. Limpeza Final
    useEffect(() => {
        const setDraft = sarak.setDraftDesign;
        return () => {
            if (setDraft) setDraft(null);
        };
    }, [sarak.setDraftDesign]); 
};
