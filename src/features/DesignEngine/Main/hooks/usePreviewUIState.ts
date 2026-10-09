import { useCallback, useState } from 'react';
import { MORE_PREVIEW_SCREEN_ID } from '../../Canvas/previewScreens';

export type ThemeEditMode = 'impact' | 'essential' | 'complete';

const PILLAR_CANONICAL_APP: Record<string, string> = {
    brand: 'auth',
    typography: 'typography',
    surfaces: 'dashboard',
    interaction: 'caixas-texto',
    navigation: 'dashboard',
    systems: 'settings',
    advanced: 'matrix',
};

const PILLAR_PREVIEW_APPS: Record<string, readonly string[]> = {
    brand: ['auth'],
    typography: ['typography'],
    surfaces: ['dashboard', 'components', 'tabela'],
    interaction: ['caixas-texto', 'forms'],
    navigation: ['dashboard'],
    systems: ['settings', 'logs', 'documentos'],
    advanced: [MORE_PREVIEW_SCREEN_ID, 'chat', 'graficos', 'matrix', 'kitchen-sink'],
};

const APP_TO_PILLAR: Record<string, string> = {
    dashboard: 'surfaces',
    components: 'surfaces',
    tabela: 'surfaces',
    'caixas-texto': 'interaction',
    forms: 'interaction',
    typography: 'typography',
    chat: 'advanced',
    graficos: 'advanced',
    matrix: 'advanced',
    'kitchen-sink': 'advanced',
    [MORE_PREVIEW_SCREEN_ID]: 'advanced',
    auth: 'brand',
    settings: 'systems',
    logs: 'systems',
    documentos: 'systems',
};

export function usePreviewUIState() {
    const [state, setState] = useState({
        activePreviewApp: 'dashboard',
        previewDevice: 'desktop' as 'desktop' | 'tablet' | 'smartphone',
        activePillarId: 'surfaces' as string | null,
        activeSectionId: null as string | null,
        viewMode: 'preview' as 'preview' | 'catalog' | 'templates' | 'command-center',
        searchQuery: '',
        editMode: 'essential' as ThemeEditMode,
        isPreviewStacked: false,
        isGalleryOpen: false,
    });

    const updateState = useCallback((updates: Partial<typeof state>) => {
        setState((previousState) => ({ ...previousState, ...updates }));
    }, []);

    const selectPreviewApp = useCallback((appId: string) => {
        setState((previousState) => ({
            ...previousState,
            activePreviewApp: appId,
            activePillarId: APP_TO_PILLAR[appId] ?? previousState.activePillarId,
        }));
    }, []);

    const selectPillar = useCallback((pillarId: string | null) => {
        setState((previousState) => {
            if (pillarId === null) return { ...previousState, activePillarId: null };

            const canonicalApp = PILLAR_CANONICAL_APP[pillarId];
            if (!canonicalApp) return { ...previousState, activePillarId: pillarId };

            const currentAppBelongsToPillar = PILLAR_PREVIEW_APPS[pillarId]?.includes(previousState.activePreviewApp);

            return {
                ...previousState,
                activePillarId: pillarId,
                activePreviewApp: currentAppBelongsToPillar ? previousState.activePreviewApp : canonicalApp,
            };
        });
    }, []);

    return {
        activePreviewApp: state.activePreviewApp,
        selectPreviewApp,
        previewDevice: state.previewDevice,
        setPreviewDevice: useCallback((v: 'desktop' | 'tablet' | 'smartphone') => updateState({ previewDevice: v }), [updateState]),
        activePillarId: state.activePillarId,
        setActivePillarId: useCallback((v: string | null) => updateState({ activePillarId: v }), [updateState]),
        selectPillar,
        activeSectionId: state.activeSectionId,
        setActiveSectionId: useCallback((v: string | null) => updateState({ activeSectionId: v }), [updateState]),
        viewMode: state.viewMode,
        setViewMode: useCallback((v: 'preview' | 'catalog' | 'templates' | 'command-center') => updateState({ viewMode: v }), [updateState]),
        searchQuery: state.searchQuery,
        setSearchQuery: useCallback((v: string) => updateState({ searchQuery: v }), [updateState]),
        editMode: state.editMode,
        setEditMode: useCallback((v: ThemeEditMode) => updateState({ editMode: v }), [updateState]),
        isPreviewStacked: state.isPreviewStacked,
        setIsPreviewStacked: useCallback((v: boolean) => updateState({ isPreviewStacked: v }), [updateState]),
        isGalleryOpen: state.isGalleryOpen,
        setIsGalleryOpen: useCallback((v: boolean) => updateState({ isGalleryOpen: v }), [updateState]),
    };
}
