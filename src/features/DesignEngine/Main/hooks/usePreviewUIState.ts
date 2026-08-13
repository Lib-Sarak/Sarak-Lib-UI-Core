import { useState, useMemo, useEffect } from 'react';

export function usePreviewUIState() {
    const [state, setState] = useState({
        activePreviewApp: 'dashboard',
        previewDevice: 'desktop' as 'desktop' | 'tablet' | 'smartphone',
        activePillarId: 'brand' as string | null,
        activeSectionId: null as string | null,
        viewMode: 'preview' as 'preview' | 'catalog' | 'templates' | 'command-center',
        searchQuery: '',
        isEssentialMode: true,
        isPreviewStacked: false
    });

    const updateState = (updates: Partial<typeof state>) => {
        setState(prev => ({ ...prev, ...updates }));
    };

    // Pillar sync logic
    const appToPillarMap: Record<string, string> = useMemo(() => ({
        'dashboard': 'surfaces',
        'components': 'surfaces',
        'tabela': 'surfaces',
        'caixas-texto': 'interaction',
        'typography': 'typography',
        'chat': 'advanced',
        'graficos': 'advanced',
        'matrix': 'advanced',
        'auth': 'brand',
        'settings': 'systems',
        'logs': 'systems'
    }), []);

    useEffect(() => {
        const pillarId = appToPillarMap[state.activePreviewApp];
        if (pillarId) {
            updateState({ activePillarId: pillarId });
        }
    }, [state.activePreviewApp, appToPillarMap]);

    return {
        activePreviewApp: state.activePreviewApp,
        setActivePreviewApp: (v: string) => updateState({ activePreviewApp: v }),
        previewDevice: state.previewDevice,
        setPreviewDevice: (v: 'desktop' | 'tablet' | 'smartphone') => updateState({ previewDevice: v }),
        activePillarId: state.activePillarId,
        setActivePillarId: (v: string | null) => updateState({ activePillarId: v }),
        activeSectionId: state.activeSectionId,
        setActiveSectionId: (v: string | null) => updateState({ activeSectionId: v }),
        viewMode: state.viewMode,
        setViewMode: (v: 'preview' | 'catalog' | 'templates' | 'command-center') => updateState({ viewMode: v }),
        searchQuery: state.searchQuery,
        setSearchQuery: (v: string) => updateState({ searchQuery: v }),
        isEssentialMode: state.isEssentialMode,
        setIsEssentialMode: (v: boolean) => updateState({ isEssentialMode: v }),
        isPreviewStacked: state.isPreviewStacked,
        setIsPreviewStacked: (v: boolean) => updateState({ isPreviewStacked: v })
    };
}
