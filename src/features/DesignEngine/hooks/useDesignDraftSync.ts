import { useEffect, useRef } from 'react';
import { SarakUIContextType, SarakDesignState } from '../../../core/Provider/types';

export const useDesignDraftSync = (
    draftState: SarakDesignState | null, 
    setDraftState: (draft: SarakDesignState | null) => void, 
    sarak: SarakUIContextType, 
    isSyncingRef: React.MutableRefObject<boolean>
) => {
    // 6. Ponte de Live Preview (Sincronização Atômica v12.8)
    useEffect(() => {
        if (!sarak.setDraftDesign) return;
        
        // Se estamos no meio de uma sincronização vinda do provedor, ignoramos para evitar ecos
        if (isSyncingRef.current) return;

        const currentDraftStr = JSON.stringify(draftState);
        const providerDraftStr = JSON.stringify(sarak.draftDesign);

        if (currentDraftStr !== providerDraftStr) {
            sarak.setDraftDesign(draftState);
        }
    }, [draftState, sarak.setDraftDesign, sarak.draftDesign, isSyncingRef]);

    const lastProviderDraftRef = useRef(JSON.stringify(sarak.draftDesign));

    // 7. Sincronização Inversa (External Changes -> Local Draft)
    useEffect(() => {
        const providerDraftStr = JSON.stringify(sarak.draftDesign);
        const currentDraftStr = JSON.stringify(draftState);

        if (providerDraftStr === currentDraftStr) {
            lastProviderDraftRef.current = providerDraftStr;
            return;
        }

        if (providerDraftStr !== lastProviderDraftRef.current) {
            isSyncingRef.current = true;
            setDraftState(sarak.draftDesign);
            lastProviderDraftRef.current = providerDraftStr;
            
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
