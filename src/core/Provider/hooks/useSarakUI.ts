import { useContext, useMemo } from 'react';
import type { SarakThemePayload, SarakUIContextType } from '../types';
import { DesignOverrideContext, UIContext } from '../context';
import { mergeUIContextValue } from '../mergeUIContextValue';

/** Porta pública de contexto; lança se o consumidor esquecer o Provider. */
export const useSarakUI = (): SarakUIContextType & SarakThemePayload => {
    const context = useContext(UIContext);
    const overrideDesign = useContext(DesignOverrideContext);

    if (!context) throw new Error('useSarakUI must be used within a SarakUIProvider');
    return mergeUIContextValue(context, overrideDesign);
};

/** Porta interna de contexto; átomos podem usar seus próprios padrões fora do Provider. */
export const useSarakUIOptional = (): (SarakUIContextType & SarakThemePayload) | null => {
    const context = useContext(UIContext);
    const overrideDesign = useContext(DesignOverrideContext);

    useMemo(() => {
        if (!context) console.warn('[Sarak:UI] useSarakUIOptional() sem SarakUIProvider; átomo usa o próprio default.');
    }, [context]);

    return context ? mergeUIContextValue(context, overrideDesign) : null;
};
