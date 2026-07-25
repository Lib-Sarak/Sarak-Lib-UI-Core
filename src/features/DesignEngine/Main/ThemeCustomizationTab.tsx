import React, { useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Zap, Check, Monitor, Tablet, Smartphone,
    Palette, Moon, Sun, Globe, AlertCircle, Sparkles, Command, RotateCcw,
    Shield, Layout, Menu, Box, MousePointer2, Type, Hash, BarChart, Layers,
    MessageSquare, Bell, Cpu, ExternalLink, Table, Settings, FileJson, ChevronDown, Search, Activity
} from 'lucide-react';

import { useSarakUI } from '../../../core/Provider/SarakUIProvider';
import { PreviewCanvas } from '../Canvas/PreviewCanvas';
import type { SarakUIOptions, SarakUIContextType, SarakDesignState } from '../../../core/Provider/types';
import type { DesignToken } from '../../../core/Design/types';

import { MASTER_DESIGN_MAP } from '../../../core/Design/master-map';
import { useThemeCustomizationData } from './hooks/useThemeCustomizationData';



// Modular Hooks & Components
import { useDesignDraft } from '../hooks/useDesignDraft';
import { useThemeEngineState } from './hooks/useThemeEngineState';
import { useThemePersistenceHandlers } from './hooks/useThemePersistenceHandlers';
import { useResizable } from '../hooks/useResizable';
import { TokenControl } from './components/TokenControl';
import {
    CategoryLabel,
    Section,
    ColorControl,
    SliderControl,
    SelectControl,
    SwitchControl,
    InputControl,
    MediaUploaderControl
} from '../components/DesignControls';
import { MasterControlPanel } from './MasterControlPanel';
import { TemplatesTab } from './TemplatesTab';
import { SaveThemeModal } from './components/SaveThemeModal';
import { SarakButton } from '../../../components/atomic/Buttons/SarakButton';
import { ThemeSidebarHeader } from './components/ThemeSidebarHeader';
import { ThemeSidebarContent } from './components/ThemeSidebarContent';
import { ThemeFeedbackToast } from './components/ThemeFeedbackToast';

/**
 * ThemeCustomizationTab (v14.0 - Sovereign 6-Pillar Architecture)
 * Refatorado para a nova taxonomia de 6 pilares de soberania.
 */
export const ThemeCustomizationTab: React.FC = () => {
    // 1) Puxamos o estado visual e métodos globais de persistência do Theme Engine
    const {
        sarak,
        activePreviewApp, setActivePreviewApp,
        previewDevice, setPreviewDevice,
        activePillarId, setActivePillarId,
        activeSectionId, setActiveSectionId,
        viewMode, setViewMode,
        searchQuery, setSearchQuery,
        isEssentialMode, setIsEssentialMode,
        isPreviewStacked, setIsPreviewStacked,
        currentThemeName, setCurrentThemeName,
        isSaveModalOpen, setIsSaveModalOpen,
        isSaving, setIsSaving
    } = useThemeEngineState();

    const {
        draft,
        updateDraft,
        handleApplyToSystem,
        handleApplyComponent,
        isComponentDirty,
        resetComponent,
        isDirty,
        toast,
        showToast,
        handleThemePreview
    } = useDesignDraft(sarak);

    const handleApplyToSystemWrapper = useCallback(() => {
        handleApplyToSystem();
    }, [handleApplyToSystem]);

    const { handleExportTheme, handleApplyGlobalChanges } = useThemePersistenceHandlers({
        draft,
        setCurrentThemeName,
        setIsSaveModalOpen, setIsSaving,
        showToast,
        handleApplyToSystem: handleApplyToSystemWrapper
    });

    const handleApplyFullTheme = useCallback((design: SarakDesignState & { systemName?: string }) => {
        setCurrentThemeName(design.systemName || 'Novo Tema');

        // Joga o design inteiro pro draft (Sandbox) para refletir no Preview.
        if (handleThemePreview) {
            handleThemePreview(design);
        }

        // L4 (Spec 40.1): aplicar um TEMA COMPLETO pelo catálogo (PresetsCatalog) deve
        // refletir no sistema IMEDIATAMENTE e PERSISTIR — igual ao TemplatesTab — não
        // ficar só no preview (era essa a divergência de wiring do v5: o catálogo previa,
        // mas nunca comitava, então "0 chaves no localStorage" e sem repintar ao vivo).
        // Usa o commit RAW porque o `/design` roda sob modo rascunho: o `applyFullConfig`
        // "smart" apenas atualizaria o draft. O RAW escreve no design do sistema →
        // DesignInjector repinta na hora; `persistDesign` grava no localStorage/onSave.
        sarak.applyFullConfigRaw?.(design);
        sarak.persistDesign?.(design);
    }, [handleThemePreview, setCurrentThemeName, sarak]);

    // 0. Redimensionamento da Barra Design Engine
    const { size: engineSidebarWidth, startResizing: startResizingEngine, isResizing: isResizingEngine } = useResizable({
        initialSize: 320,
        minSize: 280,
        maxSize: 600,
        direction: 'horizontal'
    });

    const {
        pillars,
        globalComponent,
        groupedStructure,
        dynamicEssentialTokens,
        catalogMap,
        filteredResults
    } = useThemeCustomizationData(searchQuery);

    const handleInspectComponent = useCallback((schemaId: string) => {
        const foundPillar = Object.keys(groupedStructure).find(p =>
            Object.values(groupedStructure[p]).some(comps =>
                (comps as DesignToken[]).some(c => c.id === schemaId)
            )
        );
        if (foundPillar) setActivePillarId(foundPillar);
        setTimeout(() => setActiveSectionId(schemaId), 100);
        toast && toast.message ? null : null; // Suppress unused var warning
    }, [groupedStructure, toast, setActivePillarId, setActiveSectionId]);

    return (
        <div className="flex flex-1 h-screen max-h-screen bg-[var(--theme-bg)] overflow-hidden">
            {/* Sidebar de Configuração */}
            <div
                className={`flex flex-col h-full max-h-full border-r border-[var(--theme-border)] bg-[var(--theme-card)] relative z-10 overflow-hidden shrink-0 min-w-[var(--sarak-design-engine-sidebar-min-w,280px)] max-w-[var(--sarak-design-engine-sidebar-max-w,600px)] ${isResizingEngine ? 'transition-none' : 'transition-all duration-300'}`}
                style={{ width: `${engineSidebarWidth}px` } as React.CSSProperties}
            >
                <div onMouseDown={startResizingEngine} className="absolute right-0 top-0 w-1.5 h-full cursor-col-resize hover:bg-[var(--theme-primary)]/50 transition-colors z-50 active:bg-[var(--theme-primary)]" />

                <ThemeSidebarHeader
                    viewMode={viewMode}
                    setViewMode={setViewMode}
                    isDirty={isDirty}
                    setIsSaveModalOpen={setIsSaveModalOpen}
                    previewDevice={previewDevice}
                    setPreviewDevice={setPreviewDevice}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    isEssentialMode={isEssentialMode}
                    setIsEssentialMode={setIsEssentialMode}
                    isPreviewStacked={isPreviewStacked}
                    setIsPreviewStacked={setIsPreviewStacked}
                    handleApplyGlobalChanges={handleApplyGlobalChanges}
                />

                {/* Área de Conteúdo (Scrollable) */}
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
                    handleApplyComponent={handleApplyComponent}
                    globalComponent={globalComponent}
                    sarak={sarak}
                    pillars={pillars}
                    groupedStructure={groupedStructure}
                    isEssentialMode={isEssentialMode}
                    dynamicEssentialTokens={dynamicEssentialTokens}
                    setActivePreviewApp={setActivePreviewApp}
                />
            </div>

            {/* Canvas de Preview */}
            <div className="flex-1 relative bg-[var(--theme-bg)] flex flex-col">
                <PreviewCanvas
                    previewDevice={previewDevice}
                    activePreviewApp={activePreviewApp}
                    config={draft as unknown as SarakUIOptions}
                    mode={draft.mode || sarak.mode || 'dark'}
                    onUpdateDraft={updateDraft}
                    sarak={sarak}
                    previewLayoutId={draft.layout || sarak.layout || 'glass'}
                    setActivePreviewApp={setActivePreviewApp}
                    previewAnimationStyle={draft.animationStyle || sarak.animationStyle || 'standard'}
                    previewEmojiSet={draft.emojiSet || sarak.emojiSet || 'none'}
                    previewPrimaryColor={draft.primaryColor || sarak.primaryColor || 'var(--color-theme-primary, #00f2ff)'}
                    draftTokens={draft}
                    activeSectionId={activeSectionId}
                    isDualView={viewMode === 'preview'}
                    isPreviewStacked={isPreviewStacked}
                    customThemes={[]}
                    onInspectComponent={handleInspectComponent}
                    onApplyFullTheme={handleApplyFullTheme}
                />

                {/* Toasts de Feedback */}
                <ThemeFeedbackToast toast={toast} />
            </div>

            <SaveThemeModal
                isOpen={isSaveModalOpen}
                themeName={currentThemeName}
                onClose={() => setIsSaveModalOpen(false)}
                onExport={handleExportTheme}
                isSaving={isSaving}
            />

        </div>
    );
};

export default ThemeCustomizationTab;
