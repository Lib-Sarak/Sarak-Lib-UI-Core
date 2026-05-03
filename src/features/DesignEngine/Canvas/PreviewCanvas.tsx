import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Zap, Shield, BarChart3, MessageSquare, History, Box, Network, Type, Grid, Sparkles, Search, Bell
} from 'lucide-react';
import { THEME_EFFECTS } from '../../../constants/design-tokens';
import { UIContext } from '../../../core/Provider/SarakUIProvider';
import { MockDashboard, MockChat, MockLogs, MockSettings, MockComponents, MockTypography } from './MockApps';
import { KitchenSinkPreview } from './KitchenSinkPreview';
import { GalleryRouter } from './Galleries/GalleryRouter';
import { DesignScope } from '../../../core/Design/components/DesignScope';

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
    customThemes = []
}) => {

    const tokens = React.useMemo(() => {
        return { ...draftTokens };
    }, [draftTokens]);

    const apps: any = {
        dashboard: <MockDashboard tokens={tokens} config={config} animationVariants={THEME_EFFECTS.page} animationStyle={previewAnimationStyle} />,
        chat: <MockChat tokens={tokens} config={config} animationVariants={THEME_EFFECTS.page} animationStyle={previewAnimationStyle} />,
        logs: <MockLogs tokens={tokens} config={config} animationVariants={THEME_EFFECTS.page} animationStyle={previewAnimationStyle} />,
        settings: <MockSettings tokens={tokens} config={config} animationVariants={THEME_EFFECTS.page} animationStyle={previewAnimationStyle} />,
        components: <MockComponents tokens={tokens} />,
        typography: <MockTypography tokens={tokens} />,
        'kitchen-sink': <KitchenSinkPreview />
    };

    const appIds = ['dashboard', 'chat', 'logs', 'settings', 'components', 'typography', 'kitchen-sink'];
    const appIcons: any = {
        dashboard: <BarChart3 size={14} />,
        chat: <MessageSquare size={14} />,
        logs: <History size={14} />,
        settings: <Network size={14} />,
        components: <Box size={14} />,
        typography: <Type size={14} />,
        'kitchen-sink': <Grid size={14} />
    };

    const LogoComponent = () => {
        const logoSrc = tokens.mode === 'light' ? (tokens.logoUrl || tokens.logoDarkUrl) : (tokens.logoDarkUrl || tokens.logoUrl);
        const scale = tokens.logoScale || 1.0;
        const logoSize = 32 * scale;
        
        return (
            <div className={`flex items-center gap-3 ${tokens.logoPosition === 'center' ? 'flex-col text-center' : 'flex-row'}`}>
                {logoSrc ? (
                    <img src={logoSrc} alt="Logo" style={{ height: `${logoSize}px`, width: 'auto' }} className="object-contain transition-all duration-500" />
                ) : (
                    <div className="w-8 h-8 rounded-lg bg-[var(--theme-primary)] flex items-center justify-center text-white shadow-lg shrink-0">
                        <Zap size={16 * scale} />
                    </div>
                )}
                {!tokens.isNavHidden && (
                    <span className="font-bold text-[var(--theme-title)] text-2xs tracking-widest uppercase truncate max-w-[120px]">
                        {tokens.systemName || 'SARAK'}
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

    const renderSystemContent = () => (
        <DesignScope design={tokens} className="w-full h-full flex flex-col bg-[var(--theme-bg)] transition-all duration-500 overflow-hidden relative">
            {tokens.texture && tokens.texture !== 'none' && <div className={`absolute inset-0 pointer-events-none z-0 texture-${tokens.texture} opacity-[var(--theme-noise-opacity)]`} />}
            
            {/* Escala para simular tela cheia em miniatura */}
            <div className="absolute inset-0 origin-top-left overflow-hidden z-10" style={{ transform: 'scale(0.5)', width: '200%', height: '200%' }}>
                {tokens.navigationStyle === 'topbar' ? (
                    <div className="flex flex-col w-full h-full relative z-10">
                        <header className="h-28 border-b border-[var(--theme-border)] flex items-center justify-between px-12 bg-[var(--theme-card)]/40 backdrop-blur-md">
                            <div className="scale-150 origin-left"><LogoComponent /></div>
                            <nav className="flex gap-8">
                                {appIds.map(id => (
                                    <button key={id} onClick={() => setActivePreviewApp(id)} className={`p-4 rounded-xl transition-all scale-150 ${activePreviewApp === id ? 'text-[var(--theme-primary)]' : 'text-[var(--theme-muted)]'}`}>
                                        {appIcons[id]}
                                    </button>
                                ))}
                            </nav>
                            <div className="scale-150 origin-right"><UserWidget variant="horizontal" /></div>
                        </header>
                        <main className="flex-1 overflow-y-auto p-16">{apps[activePreviewApp]}</main>
                    </div>
                ) : (
                    <div className="flex w-full h-full relative z-10">
                        <aside className="w-[400px] border-r border-[var(--theme-border)] flex flex-col bg-[var(--theme-card)]/40 backdrop-blur-md">
                            <div className="p-12 scale-150 origin-top-left"><LogoComponent /></div>
                            <nav className="flex-1 p-8 space-y-4">
                                {appIds.map(id => (
                                    <button key={id} onClick={() => setActivePreviewApp(id)} className={`w-full flex items-center gap-6 px-8 py-6 rounded-2xl transition-all text-sm font-black uppercase scale-110 origin-left ${activePreviewApp === id ? 'bg-[var(--theme-primary)] text-white shadow-xl' : 'text-[var(--theme-muted)] hover:bg-white/5'}`}>
                                        <div className="scale-150">{appIcons[id]}</div> {id}
                                    </button>
                                ))}
                            </nav>
                            <div className="scale-150 origin-bottom-left"><UserWidget /></div>
                        </aside>
                        <main className="flex-1 overflow-y-auto p-16">{apps[activePreviewApp]}</main>
                    </div>
                )}
            </div>
        </DesignScope>
    );

    return (
        <div className="flex-grow flex flex-col relative overflow-hidden bg-[#050505] p-2 items-center justify-center">
            <UIContext.Provider value={{ design: tokens } as any}>
                <div className="w-full h-full flex flex-col lg:flex-row gap-8 p-6 overflow-auto justify-center items-center custom-scrollbar">
                    {isDualView ? (
                        <>
                            {/* System Mirror com Escala Original de Preview - Agora Responsivo */}
                            <div className="relative shrink-0 flex-1 w-full max-w-[960px] aspect-[16/10] rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden bg-black transition-all duration-500">
                                <div className="absolute top-4 left-6 z-50 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Gêmeo Digital (Real-Time)</span>
                                </div>
                                {renderSystemContent()}
                            </div>

                            {/* Catalog Preview - Agora Responsivo */}
                            <div className="relative shrink-0 flex-1 w-full max-w-[960px] aspect-[16/10] rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden bg-[#0c0c0d] transition-all duration-500">
                                <div className="w-full h-full flex flex-col">
                                    <div className="px-8 py-5 border-b border-white/5 flex items-center justify-between bg-black/40">
                                        <div className="flex items-center gap-3">
                                            <Sparkles size={14} className="text-[var(--theme-primary)]" />
                                            <span className="text-[11px] font-black uppercase text-white/60 tracking-[0.3em]">Catálogo Sarak v11.1</span>
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
                        <div className="relative w-full max-w-[1400px] aspect-video rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden bg-black transition-all duration-500">
                            {renderSystemContent()}
                        </div>
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
