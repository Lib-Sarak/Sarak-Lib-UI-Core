import React from 'react';
import { UIContext, useSarakUI } from '../../../core/Provider/SarakUIProvider';
import { PresetsCatalog } from './components/PresetsCatalog';
import { DesignAgentChatCard } from './components/DesignAgentChatCard';
import { LiveDraftPreviewFrame } from './components/LiveDraftPreviewFrame';

import { DesignScope } from '../../../core/Design/components/DesignScope';
import { useResizable } from '../hooks/useResizable';
import { useMockModules } from './hooks/useMockModules';
import { usePreviewApps } from './hooks/usePreviewApps';
import { useInspector } from './hooks/useInspector';
import { useDeviceStyles } from './hooks/useDeviceStyles';
import { usePreviewContextValue, useApplyPreset } from './hooks/useDesignOperations';
import { useAgentGeneratedPresets } from './hooks/useAgentGeneratedPresets';
import { PreviewSystemRenderer } from './components/PreviewSystemRenderer';
import { SarakUIOptions, SarakUIContextType } from '../../../core/Provider/types';
import { SarakDesignState } from '../../../core/Provider/types';
import { SarakTokenValue } from '../../../core/Design/types';

interface PreviewCanvasProps {
    previewDevice: 'desktop' | 'tablet' | 'smartphone';
    previewLayoutId: string;
    activePreviewApp: string;
    setActivePreviewApp: (app: string) => void;
    previewAnimationStyle: string;
    previewEmojiSet: string;
    config: SarakUIOptions;
    previewPrimaryColor: string;
    mode: string;
    draftTokens: Partial<SarakDesignState>;
    activeSectionId?: string | null;
    onUpdateDraft: (key: string, value: SarakTokenValue) => void;
    isDualView?: boolean;
    isPreviewStacked?: boolean;
    customThemes?: Record<string, Partial<SarakDesignState>>[];
    sarak: SarakUIContextType;
    onInspectComponent?: (schemaId: string) => void;
    onApplyFullTheme?: (design: Partial<SarakDesignState>) => void;
}

export const PreviewCanvas: React.FC<PreviewCanvasProps> = ({
    previewDevice,
    previewLayoutId,
    activePreviewApp,
    setActivePreviewApp,
    previewAnimationStyle,
    previewEmojiSet,
    config,
    previewPrimaryColor,
    mode,
    draftTokens,
    activeSectionId,
    onUpdateDraft,
    isDualView,
    isPreviewStacked,
    customThemes,
    sarak,
    onInspectComponent,
    onApplyFullTheme
}) => {
    const handleApplyPreset = useApplyPreset(onUpdateDraft, onApplyFullTheme);
    const agentPresets = useAgentGeneratedPresets();

    const parentContext = useSarakUI();
    const tokens = React.useMemo(() => ({ ...draftTokens }), [draftTokens]);

    const { isInspecting, setIsInspecting } = useInspector(onInspectComponent);

    const handleSidebarResize = React.useCallback((newWidth: number) => {
        onUpdateDraft('sidebarWidth', Math.round(newWidth));
    }, [onUpdateDraft]);

    const handleTopbarResize = React.useCallback((newHeight: number) => {
        onUpdateDraft('topbarHeight', Math.round(newHeight));
    }, [onUpdateDraft]);

    const { startResizing: startResizingSidebar, isResizing: isResizingSidebar } = useResizable({
        initialSize: (tokens.sidebarWidth as number) || 240,
        minSize: 150,
        maxSize: 500,
        direction: 'horizontal',
        onResize: handleSidebarResize
    });

    const { startResizing: startResizingTopbar, isResizing: isResizingTopbar } = useResizable({
        initialSize: (tokens.topbarHeight as number) || 64,
        minSize: 40,
        maxSize: 200,
        direction: 'vertical',
        onResize: handleTopbarResize
    });

    const previewContextValue = usePreviewContextValue(parentContext, tokens, onUpdateDraft);

    const apps = usePreviewApps(tokens, config, previewAnimationStyle);
    const { mockDiscoveredModules, mockGroupedModules } = useMockModules();
    const [previewNavVisible, setPreviewNavVisible] = React.useState(true);
    const [previewMobileNavOpen, setPreviewMobileNavOpen] = React.useState(false);

    const renderSystemContent = (useSystemDesign = false) => {
        const activeDesign = useSystemDesign ? (sarak?.design || {}) : tokens;
        const navStyle = activeDesign.navigationStyle || 'sidebar';
        return (
            <PreviewSystemRenderer 
                useSystemDesign={useSystemDesign}
                sarak={sarak}
                tokens={tokens}
                isDualView={isDualView}
                previewDevice={previewDevice}
                previewNavVisible={previewNavVisible}
                setPreviewNavVisible={setPreviewNavVisible}
                previewMobileNavOpen={previewMobileNavOpen}
                setPreviewMobileNavOpen={setPreviewMobileNavOpen}
                isSidebar={navStyle === 'sidebar'}
                isDock={navStyle === 'dock'}
                isTopbar={navStyle === 'topbar'}
                parentContext={parentContext}
                activePreviewApp={activePreviewApp}
                setActivePreviewApp={setActivePreviewApp}
                onUpdateDraft={onUpdateDraft}
                mockGroupedModules={mockGroupedModules}
                mockDiscoveredModules={mockDiscoveredModules}
                startResizingSidebar={startResizingSidebar}
                startResizingTopbar={startResizingTopbar}
                apps={apps}
            />
        );
    };

    const { targetWidth, getDeviceFrameStyles, getDeviceHeightClass } = useDeviceStyles(previewDevice, isPreviewStacked);

    return (
        <DesignScope design={{ ...tokens, globalBackgroundImageUrl: undefined }} className="w-full h-full flex flex-col relative overflow-auto bg-[var(--color-theme-bg, #0a0a0c)] p-0 custom-scrollbar">
            <UIContext.Provider value={previewContextValue as SarakUIContextType}>
                <div className="flex-1 w-full h-full flex flex-col gap-6 p-6 overflow-visible">
                    
                    {/* Linha Superior: Previews Actuais (Restaurando flex-1 e min-h-0 para comportamento original) */}
                    <div className={`flex-1 w-full min-h-0 flex gap-6 items-stretch overflow-visible ${isPreviewStacked ? 'flex-col items-center' : 'flex-col xl:flex-row justify-center'}`}>
                        {isDualView ? (
                        <>
                            {/* Live Draft Preview (Gêmeo Digital / Preset 1) */}
                            <LiveDraftPreviewFrame
                                previewDevice={previewDevice}
                                isPreviewStacked={isPreviewStacked}
                                targetWidth={targetWidth}
                                getDeviceHeightClass={getDeviceHeightClass}
                                getDeviceFrameStyles={getDeviceFrameStyles}
                                isInspecting={isInspecting}
                                setIsInspecting={setIsInspecting}
                            >
                                {renderSystemContent(false)}
                            </LiveDraftPreviewFrame>


                            {/* Catalog Preview (Engine Controls) */}
                            <div className={`relative flex-auto shrink-0 rounded-[var(--sarak-device-frame-radius,2rem)] border border-theme-border shadow-theme overflow-hidden bg-theme-card transition-colors duration-500 flex flex-col min-h-[var(--sarak-engine-min-h-sm,300px)] min-w-[var(--sarak-device-desktop-min-width,250px)] resize ${isPreviewStacked ? 'w-full h-[45vh]' : 'w-1/2 h-full'}`}>
                                <PresetsCatalog
                                    onApplyPreset={handleApplyPreset}
                                    onApplyFullTheme={onApplyFullTheme}
                                    currentMode={mode}
                                    sarak={sarak}
                                    sessionThemes={agentPresets.themes}
                                    sessionPresetsByCategory={agentPresets.presetsByCategory}
                                />
                            </div>
                        </>
                    ) : (
                        <div
                            className="relative h-full rounded-2xl border border-[var(--theme-border)] shadow-theme overflow-hidden bg-[var(--theme-surface)] transition-all duration-500 mx-auto max-w-full"
                            style={{ width: targetWidth } as React.CSSProperties}
                        >
                            {renderSystemContent()}
                        </div>
                    )}

                    {isResizingSidebar && (
                        <div className="fixed inset-0 z-[9999] cursor-col-resize pointer-events-auto" />
                    )}
                    {isResizingTopbar && (
                        <div className="fixed inset-0 z-[9999] cursor-row-resize pointer-events-auto" />
                    )}
                    </div>

                    {/* Linha Inferior: Sarak Design Agent Chat (Visível no modo DualView/Preview) */}
                    {isDualView && (
                        <div className="w-full shrink-0 min-h-[var(--sarak-engine-min-h-sm,300px)] transition-all">
                            <DesignAgentChatCard
                                draftTokens={tokens}
                                onApplyFullTheme={onApplyFullTheme || (() => {})}
                                onAgentTheme={agentPresets.addTheme}
                                onAgentComponentPresets={agentPresets.addComponentPresets}
                            />
                        </div>
                    )}
                </div>
            </UIContext.Provider>

            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar {
                    width: var(--sarak-scroll-width, 6px);
                    height: var(--sarak-scroll-width, 6px);
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: var(--sarak-scroll-thumb-color, rgba(255,255,255,0.2));
                    border-radius: var(--sarak-scroll-radius, 10px);
                    border: var(--sarak-scroll-padding, 2px) solid transparent;
                    background-clip: padding-box;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: var(--theme-primary, #00f2ff);
                    background-clip: padding-box;
                    opacity: var(--sarak-scroll-thumb-hover-opacity, 0.8);
                }
            `}} />
        </DesignScope>
    );
};
