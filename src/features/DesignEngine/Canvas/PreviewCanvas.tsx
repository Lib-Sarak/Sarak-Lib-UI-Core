import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Monitor } from 'lucide-react';
import { UIContext, useSarakUI } from '../../../core/Provider/SarakUIProvider';
import { PresetsCatalog } from './components/PresetsCatalog';

import { DesignScope } from '../../../core/Design/components/DesignScope';
import { useResizable } from '../hooks/useResizable';
import { useMockModules } from './hooks/useMockModules';
import { usePreviewApps } from './hooks/usePreviewApps';
import { useInspector } from './hooks/useInspector';
import { useDeviceStyles } from './hooks/useDeviceStyles';
import { usePreviewContextValue, useApplyPreset } from './hooks/useDesignOperations';
import { PreviewSystemRenderer } from './components/PreviewSystemRenderer';

interface PreviewCanvasProps {
    previewDevice: 'desktop' | 'tablet' | 'smartphone';
    previewLayoutId: string;
    activePreviewApp: string;
    setActivePreviewApp: (app: string) => void;
    previewAnimationStyle: string;
    previewEmojiSet: string;
    config: any;
    previewPrimaryColor: string;
    mode: string;
    draftTokens: any;
    activeCategory: string | null;
    activeSectionId?: string | null;
    onUpdateDraft: (key: string, value: any) => void;
    isDualView?: boolean;
    isPreviewStacked?: boolean;
    customThemes?: any[];
    sarak: any;
    onInspectComponent?: (schemaId: string) => void;
    onApplyFullTheme?: (design: any) => void;
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
    activeCategory,
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
        initialSize: tokens.sidebarWidth || 240,
        minSize: 150,
        maxSize: 500,
        direction: 'horizontal',
        onResize: handleSidebarResize
    });

    const { startResizing: startResizingTopbar, isResizing: isResizingTopbar } = useResizable({
        initialSize: tokens.topbarHeight || 64,
        minSize: 40,
        maxSize: 200,
        direction: 'vertical',
        onResize: handleTopbarResize
    });

    const previewContextValue = usePreviewContextValue(parentContext, tokens, onUpdateDraft);

    const apps = usePreviewApps(tokens, config, previewAnimationStyle);
    const { mockDiscoveredModules, mockGroupedModules } = useMockModules();
    const [previewNavVisible, setPreviewNavVisible] = React.useState(true);

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
        <DesignScope design={{ ...tokens, globalBackgroundImageUrl: undefined }} className="w-full h-full flex flex-col relative overflow-auto bg-[#050505] p-0 custom-scrollbar">
            <UIContext.Provider value={previewContextValue as any}>
                <div className={`flex gap-6 p-6 items-stretch overflow-visible ${isPreviewStacked ? 'flex-col min-w-full min-h-full w-fit h-fit items-center' : 'flex-col xl:flex-row min-w-full min-h-full w-fit h-fit justify-center'}`}>
                    {isDualView ? (
                        <>
                            {/* Live Draft Preview (Gêmeo Digital) */}
                            <div
                                className={`relative shrink-0 overflow-hidden bg-[var(--theme-surface)] transition-all duration-500 flex flex-col group min-h-[300px] w-[var(--device-width)] h-[var(--device-height)] max-w-full max-h-[var(--device-max-height)] ${getDeviceHeightClass()} ${getDeviceFrameStyles()} ${previewDevice === 'desktop' ? 'resize' : 'resize-none'}`}
                                style={{
                                    '--device-width': previewDevice === 'desktop' ? (isPreviewStacked ? '100%' : '50%') : targetWidth,
                                    '--device-height': previewDevice === 'smartphone' ? '812px' : previewDevice === 'tablet' ? '1024px' : 'auto',
                                    '--device-max-height': previewDevice !== 'desktop' ? '90vh' : 'none'
                                } as React.CSSProperties}
                            >
                                {/* Hardware Mockup Extras (Notch, Camera) */}
                                {previewDevice === 'smartphone' && (
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#1a1a1c] rounded-b-[1rem] z-[1000] flex items-center justify-center gap-2">
                                        <div className="w-12 h-1.5 rounded-full bg-black/50"></div>
                                        <div className="w-2 h-2 rounded-full bg-[#0a0a0c] shadow-inner border border-white/5"></div>
                                    </div>
                                )}
                                {previewDevice === 'tablet' && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-6 h-32 flex items-center justify-center z-[1000]">
                                        {/* Camera na borda esquerda simulando modo paisagem/retrato dependendo do frame */}
                                        <div className="absolute top-1/2 -translate-y-1/2 -left-3 w-2 h-2 rounded-full bg-[#0a0a0c] shadow-inner border border-white/5"></div>
                                    </div>
                                )}

                                <button
                                    onClick={() => setIsInspecting(!isInspecting)}
                                    className={`absolute top-4 right-4 z-[9999] p-2 rounded-full backdrop-blur-md border shadow-2xl transition-all ${isInspecting ? 'bg-[var(--theme-primary)] text-white border-[var(--theme-primary)] animate-pulse scale-110' : 'bg-black/40 border-white/10 text-white/50 hover:text-white hover:bg-black/60 opacity-0 group-hover:opacity-100'}`}
                                    style={isInspecting ? { backgroundColor: 'var(--theme-primary, #00f2ff)', borderColor: 'var(--theme-primary, #00f2ff)' } : {}}
                                    title="Modo de Inspeção (Selecionar elemento)"
                                >
                                    <Monitor size={16} />
                                </button>
                                {/* Overlay visually when inspecting */}
                                {isInspecting && (
                                    <div className="absolute inset-0 z-[9998] bg-[var(--theme-primary)]/5 cursor-crosshair pointer-events-none border-2 border-[var(--theme-primary)]/50 rounded-[2rem]">
                                        <div className="absolute top-8 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/80 backdrop-blur border border-[var(--theme-primary)]/50 rounded-full text-white text-xs font-bold flex items-center gap-2 shadow-[0_0_20px_rgba(var(--theme-primary-rgb),0.3)]">
                                            <div className="w-2 h-2 rounded-full bg-[var(--theme-primary)] animate-ping" />
                                            Clique em um componente para inspecionar
                                        </div>
                                    </div>
                                )}

                                <div className={`flex-1 relative sarak-device-${previewDevice} w-full h-full`}>
                                    {/* Watermark */}
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.02]">
                                        <span className="text-[10rem] font-black text-white uppercase tracking-[0.2em] -rotate-12 select-none">SARAK TWIN</span>
                                    </div>
                                    {renderSystemContent(false)}
                                </div>
                            </div>


                            {/* Catalog Preview (Engine Controls) */}
                            <div className={`relative flex-auto shrink-0 rounded-[2rem] border border-theme-border shadow-theme overflow-hidden bg-theme-card transition-colors duration-500 flex flex-col min-h-[300px] min-w-[250px] resize ${isPreviewStacked ? 'w-full h-[45vh]' : 'w-1/2 h-full'}`}>
                                <PresetsCatalog
                                    onApplyPreset={handleApplyPreset}
                                    onApplyFullTheme={onApplyFullTheme}
                                    activeCategory={activeCategory}
                                    currentMode={mode}
                                />
                            </div>
                        </>
                    ) : (
                        <div
                            className="relative h-full rounded-2xl border border-[var(--theme-border)] shadow-theme overflow-hidden bg-[var(--theme-surface)] transition-all duration-500 mx-auto w-[var(--target-width)] max-w-full"
                            style={{ '--target-width': targetWidth } as React.CSSProperties}
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
