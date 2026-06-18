import { useMemo } from 'react';
import { useSarakUI } from '../../../../core/Provider/SarakUIProvider';
import { usePreviewUIState } from './usePreviewUIState';
import { usePersistenceState } from './usePersistenceState';

export function useThemeEngineState() {
    const sarakContext = useSarakUI();
    const { systemDesign, design, branding, updateBranding, ...rest } = sarakContext;

    // Deep Reference Stability
    const sarak = useMemo(() => ({ 
        systemDesign, 
        design, 
        ...rest 
    }), [systemDesign, design, JSON.stringify(rest)]);

    const uiBaseUrl = sarak.options?.endpoints?.baseUrl || '/api/ui';
    const apiToken = sarak.token;

    const uiState = usePreviewUIState();
    const persistenceState = usePersistenceState(uiBaseUrl, apiToken);

    return {
        sarak,
        uiBaseUrl,
        apiToken,
        ...uiState,
        ...persistenceState
    };
}
