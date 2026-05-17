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

    const appIcons: any = {
        dashboard: <BarChart3 size={14} />,
        chat: <MessageSquare size={14} />,
        logs: <History size={14} />,
        settings: <Network size={14} />,
        components: <Box size={14} />,
        typography: <Type size={14} />,
        auth: <Lock size={14} />,
        matrix: <Layers size={14} />,
        'kitchen-sink': <Grid size={14} />
    };

    const LogoComponent = ({ design }: { design: any }) => {
        const logoSrc = design.logoUrl;
        const scale = (design.logoScale || 100) / 100;
        const opacity = design.logoOpacity ?? 1;
        const rotation = design.logoRotation ?? 0;
        const shadow = design.logoDropShadow || 'none';
        const animation = design.logoAnimationType || 'none';
        
        const logoSize = 32 * scale;
        
        const animationClasses: Record<string, string> = {
            pulse: 'animate-pulse',
            float: 'animate-sarak-float',
            glow: 'animate-sarak-glow',
            none: ''
        };

        return (
            <div 
                className={`flex items-center gap-3 ${design.logoPosition === 'center' ? 'flex-col text-center' : 'flex-row'} transition-all duration-500`}
                style={{ 
                    opacity, 
                    transform: `rotate(${rotation}deg)`,
                    filter: shadow !== 'none' ? `drop-shadow(${shadow})` : undefined
                }}
            >
                {logoSrc ? (
                    <img 
                        src={logoSrc} 
                        alt="Logo" 
                        style={{ height: `${logoSize}px`, width: 'auto' }} 
                        className={`object-contain transition-all duration-500 ${animationClasses[animation] || ''}`} 
                    />
                ) : (
                    <div 
                        className={`rounded-lg bg-[var(--theme-primary)] flex items-center justify-center text-white shadow-lg shrink-0 ${animationClasses[animation] || ''}`}
                        style={{ width: `${logoSize}px`, height: `${logoSize}px` }}
                    >
                        <Zap size={logoSize * 0.5} />
                    </div>
                )}
                {!design.isNavHidden && (
                    <span 
                        className="font-bold text-[var(--theme-title)] tracking-widest uppercase truncate max-w-[120px]"
                        style={{ 
                            fontFamily: 'var(--sarak-identity-font, var(--font-heading))',
                            fontWeight: 'var(--sarak-identity-weight, 700)',
                            letterSpacing: 'var(--sarak-identity-tracking, 0.1em)',
                            fontSize: '0.65rem'
                        }}
                    >
                        {design.systemName || 'SARAK'}
                    </span>
                )}
            </div>
        );
    };

    const UserWidget = ({ variant = 'vertical' }: { variant?: 'horizontal' | 'vertical' }) => (
        <div className={`flex items-center gap-3 p-4 border-t border-[var(--theme-border)] ${variant === 'vertical' ? 'mt-auto' : 'ml-auto border-l border-t-0 pl-6'}`}>
            <div className="w-8 h-8 rounded-full bg-[var(--theme-primary)]/10 border border-[var(--theme-primary)]/20 flex items-center justify-center">
                <Zap size={14} className="text-[var(--theme-primary)]" />
            </div>
            {variant === 'vertical' && (
                <div className="flex flex-col">
                    <span className="text-2xs font-bold text-[var(--theme-title)] uppercase">Sarak User</span>
                    <span className="text-3xs text-[var(--theme-muted)] uppercase tracking-tighter">Administrator</span>
                </div>
            )}
        </div>
    );

    const renderSystemContent = (useSystemDesign = false) => {
        const activeDesign = useSystemDesign ? (sarak?.design || {}) : tokens;
        const navStyle = activeDesign.navigationStyle || 'sidebar';
        const hasTexture = activeDesign.texture && activeDesign.texture !== 'none';

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
                <div className="absolute inset-0 origin-top-left overflow-hidden z-10" style={{ transform: 'scale(0.5)', width: '200%', height: '200%' }}>
                    {navStyle === 'topbar' ? (
                        <div className="flex flex-col w-full h-full relative">
                            <header 
                                className="border-b border-[var(--theme-border)] flex items-center justify-between px-10 relative z-10"
                                style={{ 
                                    height: 'var(--sarak-topbar-height, 64px)',
                                    backgroundColor: 'var(--sarak-topbar-bg, rgba(10, 10, 12, 0.8))',
                                    backdropFilter: 'blur(var(--sarak-glass-blur, 16px))'
                                }}
                            >
                                <div className="scale-150 origin-left"><LogoComponent design={activeDesign} /></div>
                                <nav className="flex gap-6">
                                    {appIds.map(id => (
                                        <button key={id} onClick={() => setActivePreviewApp(id)} className={`p-3 transition-all scale-150 ${activePreviewApp === id ? 'text-[var(--theme-primary)]' : 'text-[var(--theme-muted)]'}`}>
                                            {appIcons[id]}
                                        </button>
                                    ))}
                                </nav>
                                <div className="scale-150 origin-right"><UserWidget variant="horizontal" /></div>
                                
                                <div 
                                    onMouseDown={startResizingTopbar}
                                    className="absolute bottom-0 left-0 w-full h-1.5 cursor-row-resize hover:bg-[var(--theme-primary)]/50 transition-colors active:bg-[var(--theme-primary)] z-50"
                                />
                            </header>
                            <main 
                                className={`flex-1 overflow-y-auto p-12 relative z-10 bg-transparent custom-scrollbar isolate ${hasTexture ? 'texture-active' : ''}`}
                                data-sx-texture={activeDesign.texture}
                            >
                                <div className="relative z-10">
                                    {apps[activePreviewApp]}
                                </div>
                            </main>
                        </div>
                    ) : (
                        <div className="flex w-full h-full relative">
                            <aside 
                                className="border-r border-[var(--theme-border)] flex flex-col relative z-10"
                                style={{ 
                                    width: 'var(--sarak-sidebar-width, 240px)',
                                    backgroundColor: 'var(--sarak-sidebar-bg, rgba(10, 10, 12, 0.8))',
                                    backdropFilter: 'blur(var(--sarak-sidebar-blur, 10px))',
                                    boxShadow: 'var(--sarak-sidebar-shadow)'
                                }}
                            >
                                <div className="p-10 origin-top-left scale-125"><LogoComponent design={activeDesign} /></div>
                                <nav className="flex-1 p-6 space-y-4">
                                    {appIds.map(id => (
                                        <button key={id} onClick={() => setActivePreviewApp(id)} className={`w-full flex items-center gap-4 px-6 py-4 rounded-sarak transition-all scale-125 origin-left ${activePreviewApp === id ? 'bg-[var(--theme-primary)] text-white shadow-lg shadow-primary-500/20' : 'text-[var(--theme-muted)] hover:bg-white/5'}`}>
                                            {appIcons[id]} {id}
                                        </button>
                                    ))}
                                </nav>
                                <div className="scale-125 origin-bottom-left"><UserWidget /></div>

                                <div 
                                    onMouseDown={startResizingSidebar}
                                    className="absolute right-0 top-0 w-1.5 h-full cursor-col-resize hover:bg-[var(--theme-primary)]/50 transition-colors active:bg-[var(--theme-primary)] z-50"
                                />
                            </aside>
                            <main 
                                className={`flex-1 overflow-y-auto p-12 relative z-10 bg-transparent custom-scrollbar isolate ${hasTexture ? 'texture-active' : ''}`}
                                data-sx-texture={activeDesign.texture}
                            >
                                <div className="relative z-10">
                                    {apps[activePreviewApp]}
                                </div>
                            </main>
                        </div>
                    )}
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
