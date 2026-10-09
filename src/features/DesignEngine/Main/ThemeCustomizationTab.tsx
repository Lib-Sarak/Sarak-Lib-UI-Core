import React, { useCallback } from 'react';
import { PreviewCanvas } from '../Canvas/PreviewCanvas';
import { PreviewToolbar } from '../Canvas/components/PreviewToolbar';
import type { SarakDesignState, SarakUIOptions } from '../../../core/Provider/types';
import type { SarakDesignToken } from '../../../core/Design/types';
import { useDesignDraft } from '../hooks/useDesignDraft';
import { useResizable } from '../hooks/useResizable';
import { ThemeActionBar } from './components/ThemeActionBar';
import { ThemeSidebarHeader } from './components/ThemeSidebarHeader';
import { ThemeSidebarContent } from './components/ThemeSidebarContent';
import { ThemeFeedbackToast } from './components/ThemeFeedbackToast';
import { useThemeCustomizationData } from './hooks/useThemeCustomizationData';
import { useThemeEngineState } from './hooks/useThemeEngineState';
import { useThemePersistenceHandlers } from './hooks/useThemePersistenceHandlers';
import { SaveThemeModal } from './components/SaveThemeModal';

export const ThemeCustomizationTab: React.FC = () => {
    const {
        sarak,
        activePreviewApp, selectPreviewApp,
        previewDevice, setPreviewDevice,
        activePillarId, setActivePillarId, selectPillar,
        activeSectionId, setActiveSectionId,
        viewMode, setViewMode,
        searchQuery, setSearchQuery,
        editMode, setEditMode,
        isPreviewStacked, setIsPreviewStacked,
        isGalleryOpen, setIsGalleryOpen,
        currentThemeName, setCurrentThemeName,
        isSaveModalOpen, setIsSaveModalOpen,
        isSaving, setIsSaving
    } = useThemeEngineState();
    const {
        draft, updateDraft, handleApplyToSystem, isComponentDirty, resetComponent, resetToken,
        isDirty, dirtyTokenCount, discardDraft, toast, showToast, handleThemePreview,
        canUndoLastApply, undoLastApply
    } = useDesignDraft(sarak);
    const { handleExportTheme, handleSaveTheme, handleApplyGlobalChanges } = useThemePersistenceHandlers({
        draft,
        setCurrentThemeName,
        setIsSaveModalOpen,
        setIsSaving,
        showToast,
        handleApplyToSystem,
        saveTheme: sarak.saveTheme
    });
    const { size: sidebarWidth, startResizing: startSidebarResize, isResizing } = useResizable({
        initialSize: 320,
        minSize: 280,
        maxSize: 600,
        direction: 'horizontal'
    });
    const {
        pillars, globalComponent, groupedStructure, visualImpactTokens, isTokenVisible, catalogMap, filteredResults
    } = useThemeCustomizationData(searchQuery, editMode);

    const handleInspectComponent = useCallback((schemaId: string) => {
        const matchingPillar = Object.keys(groupedStructure).find((pillarId) =>
            Object.values(groupedStructure[pillarId]).some((tokens) =>
                (tokens as SarakDesignToken[]).some((token) => token.id === schemaId)
            )
        );
        if (matchingPillar) setActivePillarId(matchingPillar);
        setTimeout(() => setActiveSectionId(schemaId), 100);
    }, [groupedStructure, setActivePillarId, setActiveSectionId]);

    const handleApplyFullTheme = useCallback((design: Partial<SarakDesignState> & { systemName?: string }, themeId?: string) => {
        setCurrentThemeName(design.systemName || 'Novo Tema');
        handleThemePreview(design, undefined, themeId);
    }, [handleThemePreview, setCurrentThemeName]);

    const handleDiscardChanges = useCallback(() => {
        discardDraft();
        const activeTheme = sarak.allThemes?.find((theme) => theme.id === sarak.resolvedThemeId);
        setCurrentThemeName(activeTheme?.name || '');
    }, [discardDraft, sarak.allThemes, sarak.resolvedThemeId, setCurrentThemeName]);

    return (
        <div className="flex h-full min-h-0 flex-1 overflow-hidden bg-[var(--theme-bg)]">
            <div
                className={'relative z-10 flex h-full max-h-full min-w-[var(--sarak-design-engine-sidebar-min-w,280px)] max-w-[var(--sarak-design-engine-sidebar-max-w,600px)] shrink-0 flex-col overflow-hidden border-r border-[var(--theme-border)] bg-[var(--theme-card)] ' + (isResizing ? 'transition-none' : 'transition-all duration-300')}
                style={{ width: sidebarWidth }}
            >
                <div onMouseDown={startSidebarResize} className="absolute right-0 top-0 z-50 h-full w-1.5 cursor-col-resize transition-colors hover:bg-[var(--theme-primary)]/50 active:bg-[var(--theme-primary)]" />
                <ThemeSidebarHeader
                    viewMode={viewMode}
                    setViewMode={setViewMode}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    editMode={editMode}
                    setEditMode={setEditMode}
                />
                <ThemeSidebarContent
                    searchQuery={searchQuery}
                    filteredResults={filteredResults || []}
                    catalogMap={catalogMap}
                    draft={draft}
                    updateDraft={updateDraft}
                    previewDevice={previewDevice}
                    viewMode={viewMode}
                    activePillarId={activePillarId}
                    setActivePillarId={setActivePillarId}
                    activeSectionId={activeSectionId}
                    setActiveSectionId={setActiveSectionId}
                    isComponentDirty={isComponentDirty}
                    resetComponent={resetComponent}
                    resetToken={resetToken}
                    handleApplyToSystem={handleApplyToSystem}
                    toast={toast}
                    globalComponent={globalComponent}
                    sarak={sarak}
                    pillars={pillars}
                    groupedStructure={groupedStructure}
                    editMode={editMode}
                    visualImpactTokens={visualImpactTokens}
                    isTokenVisible={isTokenVisible}
                    selectPillar={selectPillar}
                    isGalleryOpen={isGalleryOpen}
                    setIsGalleryOpen={setIsGalleryOpen}
                    onApplyFullTheme={handleApplyFullTheme}
                />
                <ThemeActionBar
                    isDirty={isDirty}
                    dirtyTokenCount={dirtyTokenCount}
                    onApply={handleApplyGlobalChanges}
                    onDiscard={handleDiscardChanges}
                    onExport={() => setIsSaveModalOpen(true)}
                    canUndoLastApply={canUndoLastApply}
                    onUndoLastApply={undoLastApply}
                />
            </div>
            <div className="relative flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[var(--theme-bg)]">
                <PreviewToolbar
                    previewDevice={previewDevice}
                    setPreviewDevice={setPreviewDevice}
                    isPreviewStacked={isPreviewStacked}
                    setIsPreviewStacked={setIsPreviewStacked}
                    isGalleryOpen={viewMode === 'preview' && isGalleryOpen}
                />
                <div className="flex min-h-0 min-w-0 flex-1">
                <PreviewCanvas
                    previewDevice={previewDevice}
                    activePreviewApp={activePreviewApp}
                    config={draft as unknown as SarakUIOptions}
                    mode={draft.mode || sarak.mode || 'dark'}
                    onUpdateDraft={updateDraft}
                    sarak={sarak}
                    previewLayoutId={draft.layout || sarak.layout || 'glass'}
                    selectPreviewApp={selectPreviewApp}
                    previewAnimationStyle={draft.animationStyle || sarak.animationStyle || 'standard'}
                    previewPrimaryColor={draft.primaryColor || sarak.primaryColor || 'var(--color-theme-primary, #00f2ff)'}
                    draftTokens={draft}
                    activeSectionId={activeSectionId}
                    isDualView={viewMode === 'preview' && isGalleryOpen}
                    isPreviewStacked={isPreviewStacked}
                    customThemes={[]}
                    onInspectComponent={handleInspectComponent}
                    onApplyFullTheme={handleApplyFullTheme}
                    onCloseGallery={() => setIsGalleryOpen(false)}
                />
                </div>
                <ThemeFeedbackToast toast={toast} />
            </div>
            <SaveThemeModal
                isOpen={isSaveModalOpen}
                themeName={currentThemeName}
                onClose={() => setIsSaveModalOpen(false)}
                onExport={handleExportTheme}
                onSave={handleSaveTheme}
                isSaving={isSaving}
            />
        </div>
    );
};

export default ThemeCustomizationTab;
