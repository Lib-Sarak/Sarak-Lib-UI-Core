import React, { useCallback, useMemo } from 'react';
import { PreviewCanvas } from '../Canvas/PreviewCanvas';
import { PreviewToolbar } from '../Canvas/components/PreviewToolbar';
import { useApplyPreset } from '../Canvas/hooks/useDesignOperations';
import { PANEL_COLUMN_WIDTH_VAR, PANEL_STACKED_COLUMN_HEIGHT, PANEL_STACKED_PREVIEW_MIN_HEIGHT, PANEL_SPLIT_COLUMN, PANEL_SPLIT_HANDLE, PANEL_SPLIT_PREVIEW, PANEL_SPLIT_ROW } from '../Canvas/panelResponsive.presets';
import type { SarakUIOptions } from '../../../core/Provider/types';
import { useSarakUI } from '../../../core/Provider/SarakUIProvider';
import { useLibraryText } from '../../../core/i18n/useLibraryText';
import { useDesignDraft } from '../hooks/useDesignDraft';
import { useResizable } from '../hooks/useResizable';
import { ThemeActionBar } from './components/ThemeActionBar';
import { ThemeSidebarHeader } from './components/ThemeSidebarHeader';
import { ThemeDecisionHeader } from './components/ThemeDecisionHeader';
import { ThemeSidebarContent } from './components/ThemeSidebarContent';
import { ThemeFeedbackToast } from './components/ThemeFeedbackToast';
import { useThemeCustomizationData } from './hooks/useThemeCustomizationData';
import { useThemeEngineState } from './hooks/useThemeEngineState';
import { useThemeCustomizationActions } from './hooks/useThemeCustomizationActions';
import { usePeekPreview } from './hooks/usePeekPreview';
import { usePendingBranding } from './hooks/usePendingBranding';
import { SaveThemeModal } from './components/SaveThemeModal';
import { dirtyDecisionSet, getDecision, type DecisionId } from '../utils/decisions';

/** O que cada clique do inspetor da prévia abre na coluna. */
const INSPECTED_DECISION: Record<string, DecisionId> = {
    controls: 'components',
    cards: 'shape',
    typography: 'fonts',
    shell: 'layout',
};

/** Esc volta da decisão à lista — a menos que algo aberto por cima (menu, diálogo) já o tenha tomado para si. */
const isEscapeForColumn = (event: React.KeyboardEvent): boolean =>
    event.key === 'Escape' && !event.defaultPrevented && !(event.target as HTMLElement).closest('[role="dialog"], [role="menu"], [role="listbox"]');

export const ThemeCustomizationTab: React.FC = () => {
    const {
        sarak,
        activePreviewApp, selectPreviewApp,
        previewDevice, setPreviewDevice,
        panelView, openDecision, openBrand, goHome,
        viewMode, setViewMode,
        searchQuery, setSearchQuery,
        currentThemeName, setCurrentThemeName,
        isSaveModalOpen, setIsSaveModalOpen,
        isSaving, setIsSaving
    } = useThemeEngineState();
    const text = useLibraryText();
    const { branding, updateBranding } = useSarakUI();
    const {
        draft, previewDraft, updateDraft, handleApplyToSystem, resetComponent, resetToken,
        isDirty, dirtyTokenCount, dirtyTokens, discardDraft, toast, showToast, handleThemePreview,
        setDraftThemeId, draftThemeId,
        canUndoLastApply, undoLastApply
    } = useDesignDraft(sarak);
    const { peekTokens, onPeek, isPeeking } = usePeekPreview();
    const pendingBranding = usePendingBranding({ branding, updateBranding, dirtyLabel: text('brandDirtyLabel') });
    const themeActions = useThemeCustomizationActions({
        sarak, draft, handleApplyToSystem, handleThemePreview, discardDraft, setDraftThemeId,
        showToast, setCurrentThemeName, setIsSaveModalOpen, setIsSaving,
    });
    const onApplyPreset = useApplyPreset(updateDraft, themeActions.handleApplyFullTheme);
    const { size: sidebarWidth, startResizing: startSidebarResize, isResizing } = useResizable({
        initialSize: 320,
        minSize: 280,
        maxSize: 600,
        direction: 'horizontal'
    });
    const { globalComponent, decisionContext, tokenIndex, decisionIds, catalogMap, filteredResults } = useThemeCustomizationData(searchQuery);

    const dirtyIds = useMemo(() => new Set(dirtyTokens.map((token) => token.id)), [dirtyTokens]);
    const isThemeDirty = draftThemeId !== undefined && draftThemeId !== sarak.resolvedThemeId;
    const dirtyDecisions = useMemo(() => dirtyDecisionSet(dirtyIds, decisionIds, isThemeDirty), [dirtyIds, decisionIds, isThemeDirty]);

    // A marca do atalho aparece na prévia antes do "Aplicar", mas só o "Aplicar" a entrega ao Provider.
    const previewWithBrand = useMemo(() => {
        const pending = pendingBranding.pending;
        if (!pending) return previewDraft;
        return { ...previewDraft, systemName: pending.companyName ?? previewDraft.systemName, logoUrl: pending.logoBase64 ?? previewDraft.logoUrl };
    }, [previewDraft, pendingBranding.pending]);

    const handleInspectComponent = useCallback((schemaId: string) => {
        openDecision(INSPECTED_DECISION[schemaId] ?? 'layout');
    }, [openDecision]);

    const handleApply = useCallback(() => {
        themeActions.handleApplyGlobalChanges();
        pendingBranding.commit();
    }, [themeActions, pendingBranding]);
    const handleDiscard = useCallback(() => {
        themeActions.handleDiscardChanges();
        pendingBranding.clear();
    }, [themeActions, pendingBranding]);
    const discardDecision = useCallback((decisionId: DecisionId) => {
        decisionIds.get(decisionId)?.forEach((tokenId) => { if (dirtyIds.has(tokenId)) resetToken(tokenId); });
    }, [decisionIds, dirtyIds, resetToken]);
    // Abrir um resultado da busca sai dela: a coluna mostra a decisão com o token, não a lista de resultados.
    const openFromColumn = useCallback((decisionId: DecisionId, tokenId?: string) => {
        if (tokenId) setSearchQuery('');
        openDecision(decisionId, tokenId);
    }, [openDecision, setSearchQuery]);
    const handleBrandGenerated = useCallback(() => {
        goHome();
        showToast('success', text('brandGenerated'));
    }, [goHome, showToast, text]);

    const draftMode = draft.mode === 'light' ? 'light' : 'dark';
    const previewMode = previewDraft.mode === 'light' ? 'light' : 'dark';
    const openView = viewMode === 'preview' && !searchQuery && panelView.kind !== 'home' ? panelView : null;
    const openDecisionDef = openView?.kind === 'decision' ? getDecision(openView.id) : undefined;

    return (
        <div className="@container h-full min-h-0 w-full flex-1">
        <div
            className={'flex h-full min-h-0 flex-col overflow-y-auto bg-[var(--theme-bg)] ' + PANEL_SPLIT_ROW}
            onKeyDown={(event) => { if (openView && isEscapeForColumn(event)) goHome(); }}
        >
            <div
                className={'sarak-panel-column relative z-10 flex ' + PANEL_STACKED_COLUMN_HEIGHT + ' w-full shrink-0 flex-col overflow-hidden border-[var(--theme-border)] bg-[var(--theme-card)] ' + PANEL_SPLIT_COLUMN + ' ' + (isResizing ? 'transition-none' : 'transition-all duration-[var(--sarak-motion-dur-normal,0.3s)]')}
                style={{ [PANEL_COLUMN_WIDTH_VAR]: sidebarWidth + 'px' } as React.CSSProperties}
            >
                <div onMouseDown={startSidebarResize} className={'absolute right-0 top-0 z-50 h-full w-1.5 cursor-col-resize transition-colors hover:bg-[var(--theme-primary)]/50 active:bg-[var(--theme-primary)] ' + PANEL_SPLIT_HANDLE} />
                {openView ? (
                    <ThemeDecisionHeader
                        title={openDecisionDef ? text(openDecisionDef.textKey) : text('brandShortcutTitle')}
                        onBack={goHome}
                        isDirty={openView.kind === 'decision' && dirtyDecisions.has(openView.id)}
                        onDiscard={openView.kind === 'decision' ? () => discardDecision(openView.id) : undefined}
                    />
                ) : (
                    <ThemeSidebarHeader
                        viewMode={viewMode}
                        setViewMode={setViewMode}
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        onOpenAdvancedTokens={() => openDecision('advanced')}
                    />
                )}
                <ThemeSidebarContent
                    searchQuery={searchQuery}
                    filteredResults={filteredResults || []}
                    viewMode={viewMode}
                    panelView={panelView}
                    options={{
                        sarak, globalComponent, catalogMap, draft, updateDraft, previewDevice,
                        onApplyPreset, onApplyFullTheme: themeActions.handleApplyFullTheme, onPeek, sampleDraft: previewDraft,
                        currentMode: previewMode, draftMode,
                    }}
                    decisionContext={decisionContext}
                    tokenIndex={tokenIndex}
                    themeName={currentThemeName}
                    dirtyDecisions={dirtyDecisions}
                    onOpenDecision={openFromColumn}
                    onOpenBrand={openBrand}
                    setPendingBranding={pendingBranding.setPending}
                    onBrandGenerated={handleBrandGenerated}
                    brandInitialName={branding?.companyName}
                    resetComponent={resetComponent}
                    resetToken={resetToken}
                    handleApplyToSystem={handleApplyToSystem}
                    toast={toast}
                    onApplyFullTheme={themeActions.handleApplyFullTheme}
                />
                <ThemeActionBar
                    isDirty={isDirty || pendingBranding.isDirty}
                    dirtyTokenCount={dirtyTokenCount + (pendingBranding.dirtyToken ? 1 : 0)}
                    dirtyTokens={pendingBranding.dirtyToken ? [...dirtyTokens, pendingBranding.dirtyToken] : dirtyTokens}
                    onApply={handleApply}
                    onDiscard={handleDiscard}
                    canSaveToRuntime={themeActions.canSaveToRuntime}
                    canDeleteTheme={themeActions.isImporterTheme}
                    onSave={themeActions.handleOpenRuntimeSave}
                    onExport={themeActions.handleOpenExport}
                    onCreateTheme={themeActions.handleCreateTheme}
                    onDeleteTheme={themeActions.handleDeleteTheme}
                    canUndoLastApply={canUndoLastApply}
                    onUndoLastApply={undoLastApply}
                />
            </div>
            <div className={'relative flex ' + PANEL_STACKED_PREVIEW_MIN_HEIGHT + ' min-w-0 flex-col overflow-hidden bg-[var(--theme-bg)] ' + PANEL_SPLIT_PREVIEW}>
                <PreviewToolbar
                    previewDevice={previewDevice}
                    setPreviewDevice={setPreviewDevice}
                    mode={previewMode}
                    onModeChange={(mode) => updateDraft('mode', mode)}
                    activePreviewApp={activePreviewApp}
                    selectPreviewApp={selectPreviewApp}
                    isPeeking={isPeeking}
                />
                <div className="flex min-h-0 min-w-0 flex-1">
                <PreviewCanvas
                    previewDevice={previewDevice}
                    activePreviewApp={activePreviewApp}
                    config={previewWithBrand as unknown as SarakUIOptions}
                    onUpdateDraft={updateDraft}
                    sarak={sarak}
                    previewLayoutId={previewWithBrand.layout || sarak.layout || 'glass'}
                    selectPreviewApp={selectPreviewApp}
                    previewAnimationStyle={previewWithBrand.animationStyle || sarak.animationStyle || 'standard'}
                    previewPrimaryColor={previewWithBrand.primaryColor || sarak.primaryColor || 'var(--color-theme-primary, #19e3f0)'}
                    draftTokens={previewWithBrand}
                    onInspectComponent={handleInspectComponent}
                    onApplyFullTheme={themeActions.handleApplyFullTheme}
                    peekTokens={peekTokens}
                />
                </div>
                <ThemeFeedbackToast toast={toast} />
            </div>
            <SaveThemeModal
                isOpen={isSaveModalOpen}
                purpose={themeActions.modalPurpose}
                themeName={currentThemeName}
                canReplace={themeActions.isImporterTheme}
                initialAction={themeActions.initialSaveAction}
                onClose={() => setIsSaveModalOpen(false)}
                onExport={themeActions.handleExportTheme}
                onSave={themeActions.handleSaveTheme}
                isSaving={isSaving}
            />
        </div>
        </div>
    );
};

export default ThemeCustomizationTab;
