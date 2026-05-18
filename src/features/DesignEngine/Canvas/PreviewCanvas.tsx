import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Zap, Shield, BarChart3, MessageSquare, History, Box, Network, Type, Grid, Sparkles, Search, Bell, Lock,
    Monitor, Layout, Layers, Terminal
} from 'lucide-react';
import { THEME_EFFECTS } from '../../../core/Design/presets/animations';
import { UIContext, useSarakUI } from '../../../core/Provider/SarakUIProvider';
import { MockDashboard, MockChat, MockLogs, MockSettings, MockComponents, MockTypography, MockAuth, MockMatrix } from './MockApps';
import { KitchenSinkPreview } from './KitchenSinkPreview';
import { GalleryRouter } from './Galleries/GalleryRouter';
import { DesignScope } from '../../../core/Design/components/DesignScope';
import { useResizable } from '../hooks/useResizable';
import { SidebarNav } from '../../../core/Shell/Components/SidebarNav';
import { TopbarNav } from '../../../core/Shell/Components/TopbarNav';
import { DockNav } from '../../../core/Shell/Components/DockNav';
import { DiscoveredModule } from '../../../core/Discovery/types';

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
    customThemes?: any[];
    sarak: any;
}

export const PreviewCanvas: React.FC<PreviewCanvasProps> = ({
    previewDevice,
    activePreviewApp,
    setActivePreviewApp,
    previewAnimationStyle,
    config,
    draftTokens,
    activeCategory,
    activeSectionId,
    onUpdateDraft,
    isDualView,
    customThemes = [],
    sarak
}) => {

    const parentContext = useSarakUI();
    const tokens = React.useMemo(() => ({ ...draftTokens }), [draftTokens]);
    
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

    const previewContextValue = React.useMemo(() => ({
        ...parentContext,
        design: tokens,
        isDrafting: true,
        applyConfig: (partial: any) => {
            Object.entries(partial).forEach(([key, value]) => {
                onUpdateDraft(key, value);
            });
        },
        applyFullConfig: (config: any) => {
            Object.entries(config).forEach(([key, value]) => {
                onUpdateDraft(key, value);
            });
        }
    }), [parentContext, tokens, onUpdateDraft]);

    const apps: any = React.useMemo(() => ({
        dashboard: <MockDashboard tokens={tokens} config={config} animationVariants={THEME_EFFECTS.page} animationStyle={previewAnimationStyle} />,
        chat: <MockChat tokens={tokens} config={config} animationVariants={THEME_EFFECTS.page} animationStyle={previewAnimationStyle} />,
        logs: <MockLogs tokens={tokens} config={config} animationVariants={THEME_EFFECTS.page} animationStyle={previewAnimationStyle} />,
        settings: <MockSettings tokens={tokens} config={config} animationVariants={THEME_EFFECTS.page} animationStyle={previewAnimationStyle} />,
        components: <MockComponents tokens={tokens} />,
        typography: <MockTypography tokens={tokens} />,
        auth: <MockAuth tokens={tokens} />,
        matrix: <MockMatrix tokens={tokens} config={config} animationVariants={THEME_EFFECTS.page} animationStyle={previewAnimationStyle} />,
        'kitchen-sink': <KitchenSinkPreview />
    }), [tokens, config, previewAnimationStyle]);

    const appIds = ['dashboard', 'chat', 'logs', 'settings', 'components', 'typography', 'auth', 'matrix', 'kitchen-sink'];

    const [previewNavVisible, setPreviewNavVisible] = React.useState(true);

    const mockDiscoveredModules = React.useMemo<DiscoveredModule[]>(() => {
        return appIds.map((id, index) => ({
            id,
            label: id.charAt(0).toUpperCase() + id.slice(1),
            icon: id === 'dashboard' ? 'BarChart3' 
                : id === 'chat' ? 'MessageSquare' 
                : id === 'logs' ? 'History' 
                : id === 'settings' ? 'Network' 
                : id === 'components' ? 'Box' 
                : id === 'typography' ? 'Type' 
                : id === 'auth' ? 'Lock' 
                : id === 'matrix' ? 'Layers' 
                : 'Grid',
            category: id === 'kitchen-sink' ? 'Experimental' : 'System Modules',
            status: 'online',
            priority: index,
        }));
    }, []);

    const mockGroupedModules = React.useMemo(() => {
        return mockDiscoveredModules.reduce((acc: Record<string, DiscoveredModule[]>, mod) => {
            const cat = mod.category || 'System Modules';
            if (!acc[cat]) acc[cat] = [];
            acc[cat].push(mod);
            return acc;
        }, {});
    }, [mockDiscoveredModules]);


    const renderSystemContent = (useSystemDesign = false) => {
        const activeDesign = useSystemDesign ? (sarak?.design || {}) : tokens;
        const navStyle = activeDesign.navigationStyle || 'sidebar';
        const hasTexture = activeDesign.texture && activeDesign.texture !== 'none';

        const isTopbar = navStyle === 'topbar';
        const isDock = navStyle === 'dock';
        const isSidebar = navStyle === 'sidebar' || (!isTopbar && !isDock);

        return (
            <DesignScope 
                design={activeDesign} 
                className={`w-full h-full flex flex-col transition-all duration-500 overflow-hidden relative isolate ${hasTexture ? 'texture-active' : ''}`}
                data-sx-texture={activeDesign.texture}
            >
                {/* 1. Base Background Layer (Pilar de Cor) */}
                <div 
                    className="absolute inset-0 z-0 bg-[var(--sarak-bg-base)]" 
                    style={{ backgroundColor: 'var(--sarak-bg-base)' }}
                />

                {/* 2. Content Layer (Pilar de Layout) - Scaled for 1:1 High Fidelity */}
                <div 
                    className={`absolute inset-0 origin-top-left overflow-hidden z-10 flex w-[200%] h-[200%] bg-[var(--theme-body)] text-[var(--theme-text)] font-sans selection:bg-[var(--theme-primary)] selection:text-white layout-${navStyle}`}
                    style={{ transform: 'scale(0.5)' }}
                >
                    {/* HOVER SENSORS (v6.2) */}
                    {activeDesign.isAutoHideEnabled && !previewNavVisible && (
                        <>
                            {isSidebar && (
                                <div 
                                    onMouseEnter={() => setPreviewNavVisible(true)}
                                    className="absolute left-0 top-0 w-4 h-full z-[1000] cursor-pointer"
                                />
                            )}
                            {isDock && (
                                <div 
                                    onMouseEnter={() => setPreviewNavVisible(true)}
                                    className="absolute bottom-0 left-0 w-full h-8 z-[1000] cursor-pointer"
                                />
                            )}
                        </>
                    )}

                    {/* SIDEBAR NAVIGATION */}
                    {isSidebar && (
                        <SidebarNav 
                            design={activeDesign}
                            brand={{ name: activeDesign.systemName || "Sarak Preview" }}
                            user={parentContext?.options?.user || { displayName: 'Sarak User', primaryEmail: 'preview@sarak.io' }}
                            logout={() => {}}
                            toggleNav={() => onUpdateDraft('isNavHidden', !activeDesign.isNavHidden)}
                            activeModuleId={activePreviewApp}
                            setActiveModuleId={setActivePreviewApp}
                            groupedModules={mockGroupedModules}
                            setIsNavVisible={setPreviewNavVisible}
                            setIsSearchOpen={() => {}}
                            startResizing={startResizingSidebar as any}
                        />
                    )}

                    {/* DOCK NAVIGATION */}
                    {isDock && (
                        <DockNav 
                            design={activeDesign}
                            discoveredModules={mockDiscoveredModules}
                            activeModuleId={activePreviewApp}
                            setActiveModuleId={setActivePreviewApp}
                            setIsSearchOpen={() => {}}
                            isNavVisible={previewNavVisible}
                            setIsNavVisible={setPreviewNavVisible}
                        />
                    )}

                    {/* CONTENT AREA */}
                    <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-[var(--theme-body)]">
                        {/* SHELL HEADER (TOPBAR ONLY) */}
                        {isTopbar && (
                            <TopbarNav 
                                design={activeDesign}
                                brand={{ name: activeDesign.systemName || "Sarak Preview" }}
                                toggleNav={() => onUpdateDraft('isNavHidden', !activeDesign.isNavHidden)}
                                setIsSearchOpen={() => {}}
                                activeModuleId={activePreviewApp}
                                setActiveModuleId={setActivePreviewApp}
                                discoveredModules={mockDiscoveredModules}
                                user={parentContext?.options?.user || { displayName: 'Sarak User', primaryEmail: 'preview@sarak.io' }}
                                logout={() => {}}
                                startResizing={startResizingTopbar as any}
                            />
                        )}

                        {/* MAIN CONTENT CANVAS */}
                        <main 
                            className={`flex-1 overflow-y-auto p-12 relative z-10 bg-transparent custom-scrollbar isolate ${hasTexture ? 'texture-active' : ''}`}
                            data-sx-texture={activeDesign.texture}
                        >
                            <div className="relative z-10">
                                {apps[activePreviewApp]}
                            </div>
                        </main>
                    </div>
                </div>
            </DesignScope>
        );
    };;

    return (
        <DesignScope design={tokens} className="w-full h-full flex flex-col relative overflow-hidden bg-[#050505] p-0 items-center justify-center">
            <UIContext.Provider value={previewContextValue as any}>
                <div className="w-full h-full flex flex-col xl:flex-row gap-6 p-6 items-stretch overflow-hidden">
                    {isDualView ? (
                        <>
                            {/* Live Draft Preview (Gêmeo Digital) */}
                            <div className="relative flex-1 rounded-[2rem] border border-white/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] overflow-hidden bg-black transition-all duration-500 flex flex-col">
                                
                                <div className="flex-1 relative">
                                    {/* Watermark */}
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.02]">
                                        <span className="text-[10rem] font-black text-white uppercase tracking-[0.2em] -rotate-12 select-none">SARAK TWIN</span>
                                    </div>
                                    {renderSystemContent(false)} 
                                </div>
                            </div>


                            {/* Catalog Preview (Engine Controls) */}
                            <div className="relative flex-1 rounded-[2rem] border border-white/10 shadow-2xl overflow-hidden bg-[#0c0c0d] transition-all duration-500 flex flex-col h-full">
                                <div className="w-full h-full flex flex-col">
                                    <div className="px-8 py-4 border-b border-white/5 flex items-center justify-between bg-black/40">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 bg-[var(--theme-primary)]/10 rounded-xl">
                                                <Sparkles size={16} className="text-[var(--theme-primary)]" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[11px] font-black uppercase text-white tracking-[0.3em]">Design Intelligence Catalog</span>
                                                <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Pillar Control: {activeCategory || 'Global'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex-1 overflow-y-auto custom-scrollbar bg-black/20">
                                         <GalleryRouter 
                                             activeCategory={activeCategory || ''} 
                                             activeSectionId={activeSectionId}
                                             tokens={tokens} 
                                             onUpdateDraft={onUpdateDraft} 
                                             activePreviewApp={activePreviewApp}
                                             customThemes={customThemes}
                                         />
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="relative w-full h-full rounded-2xl border border-white/10 shadow-2xl overflow-hidden bg-black transition-all duration-500">
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
            
            <style dangerouslySetInnerHTML={{ __html: `
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
