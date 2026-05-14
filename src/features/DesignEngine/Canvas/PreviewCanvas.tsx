import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Zap, Shield, BarChart3, MessageSquare, History, Box, Network, Type, Grid, Sparkles, Search, Bell, Lock
} from 'lucide-react';
import { THEME_EFFECTS } from '../../../core/Design/presets/animations';
import { UIContext, useSarakUI } from '../../../core/Provider/SarakUIProvider';
import { MockDashboard, MockChat, MockLogs, MockSettings, MockComponents, MockTypography, MockAuth } from './MockApps';
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
    
    // 0. Redimensionamento Dinâmico (Sincronizado com Tokens)
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
        // Sobrescrita total para garantir isolamento no preview
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

    const apps: any = {
        dashboard: <MockDashboard tokens={tokens} config={config} animationVariants={THEME_EFFECTS.page} animationStyle={previewAnimationStyle} />,
        chat: <MockChat tokens={tokens} config={config} animationVariants={THEME_EFFECTS.page} animationStyle={previewAnimationStyle} />,
        logs: <MockLogs tokens={tokens} config={config} animationVariants={THEME_EFFECTS.page} animationStyle={previewAnimationStyle} />,
        settings: <MockSettings tokens={tokens} config={config} animationVariants={THEME_EFFECTS.page} animationStyle={previewAnimationStyle} />,
        components: <MockComponents tokens={tokens} />,
        typography: <MockTypography tokens={tokens} />,
        auth: <MockAuth tokens={tokens} />,
        'kitchen-sink': <KitchenSinkPreview />

    };

    const appIds = ['dashboard', 'chat', 'logs', 'settings', 'components', 'typography', 'auth', 'kitchen-sink'];

    const appIcons: any = {
        dashboard: <BarChart3 size={14} />,
        chat: <MessageSquare size={14} />,
        logs: <History size={14} />,
        settings: <Network size={14} />,
        components: <Box size={14} />,
        typography: <Type size={14} />,
        auth: <Lock size={14} />,
        'kitchen-sink': <Grid size={14} />

    };

    const LogoComponent = ({ design }: { design: any }) => {
        const logoSrc = design.mode === 'light' ? (design.logoUrl || design.logoDarkUrl) : (design.logoDarkUrl || design.logoUrl);
        const scale = design.logoScale || 1.0;
        const opacity = design.logoOpacity ?? 1;
        const rotation = design.logoRotation ?? 0;
        const shadow = design.logoDropShadow || 'none';
        const animation = design.logoAnimationType || 'none';
        
        // Base size is 32px, scaled by logoScale
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
                    <span className="font-bold text-[var(--theme-title)] text-2xs tracking-widest uppercase truncate max-w-[120px]">
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

        return (
            <DesignScope design={activeDesign} className="w-full h-full flex flex-col bg-[var(--theme-bg)] transition-all duration-500 overflow-hidden relative">
                <div className="absolute inset-0 origin-top-left overflow-hidden z-10" style={{ transform: 'scale(0.5)', width: '200%', height: '200%' }}>
                    {activeDesign.layout === 'topbar' ? (
                        <div className="flex flex-col w-full h-full relative">
                            {activeDesign.texture && activeDesign.texture !== 'none' && (
                                <div className={`absolute inset-0 pointer-events-none z-0 texture-${activeDesign.texture} SarakAtmosphereLayer`} style={{ opacity: 'var(--theme-texture-opacity)' }} />
                            )}
                            <header 
                                className="border-b border-[var(--theme-border)] flex items-center justify-between px-10 bg-[var(--color-theme-topbar)] backdrop-blur-[var(--sarak-blur-master)] relative z-10"
                                style={{ height: 'var(--sarak-topbar-h, 64px)' }}
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
                                
                                {/* Resizer Vertical (Topbar) */}
                                <div 
                                    onMouseDown={startResizingTopbar}
                                    className="absolute bottom-0 left-0 w-full h-1.5 cursor-row-resize hover:bg-[var(--theme-primary)]/50 transition-colors active:bg-[var(--theme-primary)] z-50"
                                />
                            </header>
                            <main className="flex-1 overflow-y-auto p-12 relative z-10">{apps[activePreviewApp]}</main>
                        </div>
                    ) : (
                        <div className="flex w-full h-full relative">
                            {activeDesign.texture && activeDesign.texture !== 'none' && (
                                <div className={`absolute inset-0 pointer-events-none z-0 texture-${activeDesign.texture} SarakAtmosphereLayer`} style={{ opacity: 'var(--theme-texture-opacity)' }} />
                            )}
                            <aside 
                                className="border-r border-[var(--theme-border)] flex flex-col bg-[var(--color-theme-sidebar)] backdrop-blur-[var(--sarak-blur-master)] relative z-10"
                                style={{ width: 'var(--sarak-sidebar-w, 240px)' }}
                            >
                                <div className="p-10 origin-top-left scale-125"><LogoComponent design={activeDesign} /></div>
                                <nav className="flex-1 p-6 space-y-4">
                                    {appIds.map(id => (
                                        <button key={id} onClick={() => setActivePreviewApp(id)} className={`w-full flex items-center gap-4 px-6 py-4 rounded-sarak transition-all scale-125 origin-left ${activePreviewApp === id ? 'bg-[var(--theme-primary)] text-white' : 'text-[var(--theme-muted)]'}`}>
                                            {appIcons[id]} {id}
                                        </button>
                                    ))}
                                </nav>
                                <div className="scale-125 origin-bottom-left"><UserWidget /></div>

                                {/* Resizer Horizontal (Sidebar) */}
                                <div 
                                    onMouseDown={startResizingSidebar}
                                    className="absolute right-0 top-0 w-1.5 h-full cursor-col-resize hover:bg-[var(--theme-primary)]/50 transition-colors active:bg-[var(--theme-primary)] z-50"
                                />
                            </aside>
                            <main className="flex-1 overflow-y-auto p-12 relative z-10">{apps[activePreviewApp]}</main>
                        </div>
                    )}
                </div>
            </DesignScope>
        );
    };

    return (
        <div className="w-full h-full flex flex-col relative overflow-hidden bg-[#050505] p-0 items-center justify-center">
            <UIContext.Provider value={previewContextValue as any}>
                <div className="w-full h-full flex flex-col gap-8 p-8 overflow-y-auto custom-scrollbar items-center">
                    {isDualView ? (
                        <>
                            {/* Live Draft Preview */}
                            <div className="relative shrink-0 w-full max-w-[1200px] aspect-video rounded-3xl border border-white/10 shadow-2xl overflow-hidden bg-black transition-all duration-500 min-h-[400px]">
                                <div className="absolute top-3 left-4 z-50 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                    <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Gêmeo Digital (Preview Ativa)</span>
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
                                    <span className="text-4xl font-black text-white uppercase tracking-widest">Preview Mode</span>
                                </div>
                                {renderSystemContent(false)} 
                            </div>

                            {/* Catalog Preview */}
                            <div className="relative shrink-0 w-full max-w-[1200px] aspect-video rounded-3xl border border-white/10 shadow-2xl overflow-hidden bg-[#0c0c0d] transition-all duration-500 min-h-[400px]">
                                <div className="w-full h-full flex flex-col">
                                    <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between bg-black/40">
                                        <div className="flex items-center gap-3">
                                            <Sparkles size={12} className="text-[var(--theme-primary)]" />
                                            <span className="text-[10px] font-black uppercase text-white/60 tracking-widest">Catálogo Sarak</span>
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
                    {/* Overlay Global de Resizing (Shell) */}
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
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255,255,255,0.05);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255,255,255,0.1);
                }
            `}} />
        </div>
    );
};
