import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Zap, Shield, BarChart3, MessageSquare, History, Box, Network, Type, Grid, Sparkles, Search, Bell, Lock,
    Monitor, Layout, Layers, Terminal
} from 'lucide-react';
import { UIContext, useSarakUI } from '../../../core/Provider/SarakUIProvider';
import { MockDashboard, MockChat, MockLogs, MockSettings, MockComponents, MockTypography, MockAuth, MockMatrix, MockTable, MockText, MockCharts, MockForms, MockDocuments } from './MockApps';
import { KitchenSinkPreview } from './KitchenSinkPreview';
import { PresetsCatalog } from './components/PresetsCatalog';

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
    isPreviewStacked?: boolean;
    customThemes?: any[];
    sarak: any;
    onInspectComponent?: (schemaId: string) => void;
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
    onInspectComponent
}) => {
    const handleApplyPreset = (presetTokens: Record<string, any>) => {
        Object.entries(presetTokens).forEach(([key, value]) => {
            onUpdateDraft(key, value);
        });
    };

    const parentContext = useSarakUI();
    const tokens = React.useMemo(() => ({ ...draftTokens }), [draftTokens]);

    const [isInspecting, setIsInspecting] = React.useState(false);

    React.useEffect(() => {
        if (!isInspecting) return;

        const handleInspectClick = (e: MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();

            const target = e.target as HTMLElement;
            let schemaId = 'shell';

            if (target.closest('button')) schemaId = 'controls';
            else if (target.closest('input, select, textarea')) schemaId = 'controls';
            else if (target.closest('.card, [class*="card"], [class*="panel"]')) schemaId = 'cards';
            else if (target.closest('h1, h2, h3, h4, h5, h6, p, span, a')) schemaId = 'typography';

            setIsInspecting(false);
            if (onInspectComponent) {
                onInspectComponent(schemaId);
            }
        };

        document.addEventListener('click', handleInspectClick, true);
        return () => document.removeEventListener('click', handleInspectClick, true);
    }, [isInspecting, onInspectComponent]);

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

    const apps: any = React.useMemo(() => {
        const dummyAnimation = { initial: {}, animate: {}, exit: {} };
        return {
            dashboard: <MockDashboard tokens={tokens} config={config} animationVariants={dummyAnimation} animationStyle={previewAnimationStyle} />,
            forms: <MockForms tokens={tokens} config={config} animationVariants={dummyAnimation} animationStyle={previewAnimationStyle} />,
            chat: <MockChat tokens={tokens} config={config} animationVariants={dummyAnimation} animationStyle={previewAnimationStyle} />,
            logs: <MockLogs tokens={tokens} config={config} animationVariants={dummyAnimation} animationStyle={previewAnimationStyle} />,
            settings: <MockSettings tokens={tokens} config={config} animationVariants={dummyAnimation} animationStyle={previewAnimationStyle} />,
            components: <MockComponents tokens={tokens} />,
            typography: <MockTypography tokens={tokens} />,
            auth: <MockAuth tokens={tokens} />,
            matrix: <MockMatrix tokens={tokens} config={config} animationVariants={dummyAnimation} animationStyle={previewAnimationStyle} />,
            tabela: <MockTable tokens={tokens} config={config} animationVariants={dummyAnimation} animationStyle={previewAnimationStyle} />,
            'caixas-texto': <MockText tokens={tokens} config={config} animationVariants={dummyAnimation} animationStyle={previewAnimationStyle} />,
            graficos: <MockCharts tokens={tokens} config={config} animationVariants={dummyAnimation} animationStyle={previewAnimationStyle} />,
            documentos: <MockDocuments tokens={tokens} config={config} animationVariants={dummyAnimation} animationStyle={previewAnimationStyle} />,
            'kitchen-sink': <KitchenSinkPreview />
        }
    }, [tokens, config, previewAnimationStyle]);

    const appIds = ['dashboard', 'forms', 'documentos', 'chat', 'logs', 'settings', 'components', 'typography', 'auth', 'matrix', 'tabela', 'caixas-texto', 'graficos', 'kitchen-sink'];

    const [previewNavVisible, setPreviewNavVisible] = React.useState(true);

    const mockDiscoveredModules = React.useMemo<DiscoveredModule[]>(() => {
        return appIds.map((id, index) => ({
            id,
            label: id === 'dashboard' ? 'Dashboard'
                : id === 'forms' ? 'Formulários'
                    : id === 'documentos' ? 'Documentos'
                        : id === 'chat' ? 'Chat Ops'
                            : id === 'logs' ? 'System Logs'
                                : id === 'settings' ? 'Settings'
                                    : id === 'components' ? 'Gallery'
                                        : id === 'typography' ? 'Typography'
                                            : id === 'auth' ? 'Security Gate'
                                                : id === 'matrix' ? 'Matrix Network'
                                                    : id === 'tabela' ? 'Tabela Analítica'
                                                        : id === 'caixas-texto' ? 'Caixas de Texto'
                                                            : id === 'graficos' ? 'Gráficos Avançados'
                                                                : 'Kitchen Sink',
            icon: id === 'dashboard' ? 'BarChart3'
                : id === 'forms' ? 'Layout'
                    : id === 'documentos' ? 'FileText'
                        : id === 'chat' ? 'MessageSquare'
                            : id === 'logs' ? 'History'
                                : id === 'settings' ? 'Network'
                                    : id === 'components' ? 'Box'
                                        : id === 'typography' ? 'Type'
                                            : id === 'auth' ? 'Lock'
                                                : id === 'matrix' ? 'Layers'
                                                    : id === 'tabela' ? 'Grid'
                                                        : id === 'caixas-texto' ? 'AlignLeft'
                                                            : id === 'graficos' ? 'LineChart'
                                                                : 'Zap',
            category: id === 'kitchen-sink' ? 'Experimental' : 'System Modules',
            status: 'online',
            priority: index,
        }));
    }, [appIds]);

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
        const isSidebar = navStyle === 'sidebar';
        // Ajuste de proporções e dimensões da preview - Gêmeo Digital Elegante
        const scaleFactor = isDualView ? 0.75 : 0.95;
        const widthPercent = `${(100 / scaleFactor).toFixed(2)}%`;
        const heightPercent = `${(100 / scaleFactor).toFixed(2)}%`;

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

                {/* 2. Content Layer (Pilar de Layout) - Scaled dynamically to prevent micro-miniature rendering */}
                <div
                    className={`absolute inset-0 origin-top-left overflow-hidden z-10 flex bg-[var(--theme-body)] text-[var(--theme-text)] font-sans selection:bg-[var(--theme-primary)] selection:text-white layout-${navStyle}`}
                    style={{
                        width: widthPercent,
                        height: heightPercent,
                        transform: `scale(${scaleFactor})`
                    }}
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
                            logout={() => { }}
                            toggleNav={() => onUpdateDraft('isNavHidden', !activeDesign.isNavHidden)}
                            activeModuleId={activePreviewApp}
                            setActiveModuleId={setActivePreviewApp}
                            groupedModules={mockGroupedModules}
                            setIsNavVisible={setPreviewNavVisible}
                            setIsSearchOpen={() => { }}
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
                            setIsSearchOpen={() => { }}
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
                                setIsSearchOpen={() => { }}
                                activeModuleId={activePreviewApp}
                                setActiveModuleId={setActivePreviewApp}
                                discoveredModules={mockDiscoveredModules}
                                user={parentContext?.options?.user || { displayName: 'Sarak User', primaryEmail: 'preview@sarak.io' }}
                                logout={() => { }}
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
        <DesignScope design={tokens} className="w-full h-full flex flex-col relative overflow-auto bg-[#050505] p-0 custom-scrollbar">
            <UIContext.Provider value={previewContextValue as any}>
                <div className={`flex gap-6 p-6 items-stretch overflow-visible ${isPreviewStacked ? 'flex-col min-w-full min-h-full w-fit h-fit' : 'flex-col xl:flex-row min-w-full min-h-full w-fit h-fit'}`}>
                    {isDualView ? (
                        <>
                            {/* Live Draft Preview (Gêmeo Digital) */}
                            <div className={`relative flex-auto shrink-0 rounded-[2rem] border border-white/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] overflow-hidden bg-black transition-colors duration-500 flex flex-col group ${isPreviewStacked ? 'w-full h-[45vh]' : 'w-1/2 h-full'}`} style={{ resize: 'both', minHeight: '300px', minWidth: '250px' }}>
                                <button
                                    onClick={() => setIsInspecting(!isInspecting)}
                                    className={`absolute top-4 right-4 z-[9999] p-2 rounded-full backdrop-blur-md border shadow-2xl transition-all ${isInspecting ? 'bg-[var(--theme-primary)] text-white border-[var(--theme-primary)] animate-pulse scale-110' : 'bg-black/40 border-white/10 text-white/50 hover:text-white hover:bg-black/60 opacity-0 group-hover:opacity-100'}`}
                                    title="Modo de Inspeção (Selecionar elemento)"
                                >
                                    <Monitor size={16} />
                                </button>
                                {/* Overlay visually when inspecting */}
                                {isInspecting && (
                                    <div className="absolute inset-0 z-[9998] bg-[var(--theme-primary)]/5 cursor-crosshair pointer-events-none border-2 border-[var(--theme-primary)]/50 rounded-[2rem]">
                                        <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/80 backdrop-blur border border-[var(--theme-primary)]/50 rounded-full text-white text-xs font-bold flex items-center gap-2 shadow-[0_0_20px_rgba(var(--theme-primary-rgb),0.3)]">
                                            <div className="w-2 h-2 rounded-full bg-[var(--theme-primary)] animate-ping" />
                                            Clique em um componente para inspecionar
                                        </div>
                                    </div>
                                )}

                                <div className="flex-1 relative">
                                    {/* Watermark */}
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.02]">
                                        <span className="text-[10rem] font-black text-white uppercase tracking-[0.2em] -rotate-12 select-none">SARAK TWIN</span>
                                    </div>
                                    {renderSystemContent(false)}
                                </div>
                            </div>


                            {/* Catalog Preview (Engine Controls) */}
                            <div className={`relative flex-auto shrink-0 rounded-[2rem] border border-white/10 shadow-2xl overflow-hidden bg-[#0c0c0d] transition-colors duration-500 flex flex-col ${isPreviewStacked ? 'w-full h-[45vh]' : 'w-1/2 h-full'}`} style={{ resize: 'both', minHeight: '300px', minWidth: '250px' }}>
                                <PresetsCatalog
                                    onApplyPreset={handleApplyPreset}
                                    activeCategory={activeCategory}
                                    currentMode={mode}
                                />
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
