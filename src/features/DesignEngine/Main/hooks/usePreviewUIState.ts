import { useCallback, useState } from 'react';
import { getDecision, type DecisionId } from '../../utils/decisions';

/** O que a coluna mostra: a lista das decisões, uma decisão aberta ou o atalho "Usar minha marca". */
export type PanelView =
    | { kind: 'home'; /** A linha que recebe o foco ao voltar. */ focusId?: string }
    | { kind: 'brand' }
    | { kind: 'decision'; id: DecisionId; /** O token que a busca quer à vista. */ focusTokenId?: string };

const HOME: PanelView = { kind: 'home' };

type PreviewDevice = 'desktop' | 'tablet' | 'smartphone';
type ViewMode = 'preview' | 'catalog' | 'templates' | 'command-center';

/** Abrir uma decisão leva a prévia à tela canônica dela, salvo se a tela atual já lhe pertence. */
const screenForDecision = (decisionId: DecisionId, currentApp: string): string => {
    const decision = getDecision(decisionId);
    if (!decision) return currentApp;
    return decision.screens.includes(currentApp) ? currentApp : decision.screen;
};

export function usePreviewUIState() {
    const [state, setState] = useState({
        activePreviewApp: 'dashboard',
        previewDevice: 'desktop' as PreviewDevice,
        panelView: HOME as PanelView,
        viewMode: 'preview' as ViewMode,
        searchQuery: '',
    });

    const updateState = useCallback((updates: Partial<typeof state>) => {
        setState((previousState) => ({ ...previousState, ...updates }));
    }, []);

    /** Escolher a tela de amostra só muda a prévia: a coluna não segue (um gesto, sem laço). */
    const selectPreviewApp = useCallback((appId: string) => updateState({ activePreviewApp: appId }), [updateState]);

    const openDecision = useCallback((decisionId: DecisionId, focusTokenId?: string) => {
        setState((previousState) => ({
            ...previousState,
            panelView: { kind: 'decision', id: decisionId, focusTokenId },
            viewMode: 'preview',
            activePreviewApp: screenForDecision(decisionId, previousState.activePreviewApp),
        }));
    }, []);

    const openBrand = useCallback(() => updateState({ panelView: { kind: 'brand' }, viewMode: 'preview' }), [updateState]);
    const goHome = useCallback(() => {
        setState((previousState) => {
            const { panelView } = previousState;
            const focusId = panelView.kind === 'decision' ? panelView.id : panelView.kind === 'brand' ? 'brand' : undefined;
            return { ...previousState, panelView: { kind: 'home', focusId } };
        });
    }, []);

    return {
        activePreviewApp: state.activePreviewApp,
        selectPreviewApp,
        previewDevice: state.previewDevice,
        setPreviewDevice: useCallback((value: PreviewDevice) => updateState({ previewDevice: value }), [updateState]),
        panelView: state.panelView,
        openDecision,
        openBrand,
        goHome,
        viewMode: state.viewMode,
        setViewMode: useCallback((value: ViewMode) => updateState({ viewMode: value }), [updateState]),
        searchQuery: state.searchQuery,
        setSearchQuery: useCallback((value: string) => updateState({ searchQuery: value }), [updateState]),
    };
}
