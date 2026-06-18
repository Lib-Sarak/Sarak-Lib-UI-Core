import { useState, useCallback } from 'react';

export function usePersistenceState(uiBaseUrl: string, apiToken?: string) {
    const [state, setState] = useState({
        currentThemeId: null as string | null,
        currentThemeOrigin: 'script' as 'script' | 'database',
        currentThemeName: '',
        isSaveModalOpen: false,
        isSaving: false,
        pendingApply: false
    });

    const updateState = (updates: Partial<typeof state>) => {
        setState(prev => ({ ...prev, ...updates }));
    };

    const fetchActiveTheme = useCallback(async () => {
        try {
            const headers: any = { 'Content-Type': 'application/json' };
            if (apiToken) headers['Authorization'] = `Bearer ${apiToken}`;
            const res = await fetch(`${uiBaseUrl}/design`, { headers });
            if (!res.ok) return null;
            const payload = await res.json();
            return payload.data?.design || null;
        } catch (err) {
            console.error('ThemeEngine: fetchActiveTheme failed', err);
            return null;
        }
    }, [uiBaseUrl, apiToken]);

    return {
        currentThemeId: state.currentThemeId,
        setCurrentThemeId: (v: string | null) => updateState({ currentThemeId: v }),
        currentThemeOrigin: state.currentThemeOrigin,
        setCurrentThemeOrigin: (v: 'script' | 'database') => updateState({ currentThemeOrigin: v }),
        currentThemeName: state.currentThemeName,
        setCurrentThemeName: (v: string) => updateState({ currentThemeName: v }),
        isSaveModalOpen: state.isSaveModalOpen,
        setIsSaveModalOpen: (v: boolean) => updateState({ isSaveModalOpen: v }),
        isSaving: state.isSaving,
        setIsSaving: (v: boolean) => updateState({ isSaving: v }),
        pendingApply: state.pendingApply,
        setPendingApply: (v: boolean) => updateState({ pendingApply: v }),
        fetchActiveTheme
    };
}
