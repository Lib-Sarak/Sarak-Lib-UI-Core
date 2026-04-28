import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Zap, Shield, BarChart3, MessageSquare, History, Box, Network, Type, Grid, Sparkles, Search, Bell
} from 'lucide-react';
import { THEME_EFFECTS } from '../../../constants/design-tokens';
import { DESIGN_MANIFEST, UIContext } from '../../../core/Provider/SarakUIProvider';
import { MockDashboard, MockChat, MockLogs, MockSettings, MockComponents, MockTypography } from './MockApps';
import { KitchenSinkPreview } from './KitchenSinkPreview';
import { GalleryRouter } from './Galleries/GalleryRouter';

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
    onUpdateDraft,
    isDualView,
    customThemes = []
}) => {

    const tokens = React.useMemo(() => draftTokens || {}, [draftTokens]);
    
    // --- HELPERS ---
    const getShadowStyle = React.useCallback((orientation: string, intensity: number, color: string): string => {
        const opacity = intensity * 0.3;
        switch (orientation) {
            case 'top-down':
                return `0 ${intensity * 20}px ${intensity * 40}px rgba(0,0,0,${opacity})`;
            case 'isometric':
                return `${intensity * 10}px ${intensity * 10}px ${intensity * 30}px rgba(0,0,0,${opacity})`;
            case 'inner':
                return `inset 0 2px 10px rgba(0,0,0,${opacity})`;
            default:
                return `0 4px 20px rgba(0,0,0,${opacity})`;
        }
    }, []);

    const { cssVariables, dataAttributes } = React.useMemo(() => {
        const vars: any = {};
        const attrs: any = {};
        
        Object.entries(tokens).forEach(([key, value]) => {
            const config = (DESIGN_MANIFEST as any)[key];
            if (config) {
                const transformedValue = config.transform ? config.transform(value) : value;
                const isObject = typeof transformedValue === 'object' && transformedValue !== null;
                
                if (config.vars) {
                    config.vars.forEach((varName: string) => {
                        if (isObject) {
                            Object.entries(transformedValue).forEach(([subKey, subVal]) => {
                                if (subKey === 'main') vars[varName] = subVal;
                                else if (subKey === 'factor') vars['--font-size-factor'] = subVal;
                                else if (subKey === 'rgb') vars['--theme-primary-rgb'] = subVal;
                                else if (subKey === 'hover') vars['--theme-primary-hover'] = subVal;
                                else if (subKey === 'active') vars['--theme-primary-active'] = subVal;
                                else if (subKey === 'focus') vars['--theme-primary-focus'] = subVal;
                                else if (subKey === 'gap') vars['--theme-gap-scaled'] = subVal;
                                else if (subKey === 'pad') vars['--theme-pad-scaled'] = subVal;
                                else if (subKey === 'margin') vars['--theme-margin-scaled'] = subVal;
                                else if (subKey === 'radius') vars['--theme-radius-scaled'] = subVal;
                                else if (subKey === 'base' && key === 'fluidScaling') vars['--theme-font-size-base'] = subVal;
                                else if (subKey === 'px' && key === 'fontScale') vars[varName] = subVal;
                                else vars[`${varName}-${subKey}`] = subVal;
                            });
                        } else {
                            vars[varName] = `${transformedValue}${config.unit || ''}`;
                        }
                    });
                }

                if (config.attr) {
                    let finalAttrValue = isObject 
                        ? (transformedValue.attr !== undefined ? transformedValue.attr : value) 
                        : transformedValue;
                    if (typeof value === 'boolean') finalAttrValue = value ? '1' : '0';
                    attrs[config.attr] = String(finalAttrValue);
                }
            }
        });

        const isLight = tokens.mode === 'light';
        vars['--theme-bg'] = isLight ? '#f1f5f9' : '#020617';
        vars['--theme-card'] = isLight 
            ? `color-mix(in srgb, #ffffff, transparent ${Math.round((1 - (tokens.glassOpacity ?? 0.7)) * 100)}%)` 
            : `color-mix(in srgb, #1e293b, transparent ${Math.round((1 - (tokens.glassOpacity ?? 0.7)) * 100)}%)`;
        vars['--theme-border'] = isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.08)';
        vars['--theme-title'] = isLight ? '#0f172a' : '#f8fafc';
        vars['--theme-main'] = isLight ? '#475569' : '#94a3b8';
        vars['--theme-muted'] = isLight ? '#94a3b8' : '#64748b';
        
        if (!vars['--theme-shadow']) {
            vars['--theme-shadow'] = tokens.layeredShadows 
                ? vars['--sarak-layered-shadows'] 
                : getShadowStyle(tokens.shadowOrientation || 'top-down', tokens.shadowIntensity ?? 0.5, tokens.primaryColor);
        }

        if (!vars['--radius-theme']) vars['--radius-theme'] = '12px';
        if (!vars['--theme-gap']) vars['--theme-gap'] = '20px';

        return { 
            cssVariables: vars as React.CSSProperties, 
            dataAttributes: attrs 
        };
    }, [tokens, getShadowStyle]);

    const containerStyles: React.CSSProperties = {
        width: '100%',
        maxWidth: '100%',
        height: '100%',
        display: 'flex',
        gap: '32px',
        padding: '32px',
        overflowX: isDualView ? 'hidden' : 'auto',
        overflowY: 'auto',
        alignItems: isDualView ? 'flex-start' : 'center',
        justifyContent: isDualView ? 'center' : 'center',
    };

    const deviceStyles: any = {
        desktop: { 
            width: '100%', 
            height: 'auto', 
            maxWidth: isDualView ? '100%' : '1800px', 
            maxHeight: 'none', 
            aspectRatio: isDualView ? 'auto' : '16/9' 
        },
        tablet: { width: '768px', height: '1024px', scale: 0.6 },
        smartphone: { width: '375px', height: '667px', scale: 0.8 }
    };

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
        return (
            <div className={`flex items-center gap-3 ${tokens.logoPosition === 'center' ? 'flex-col text-center' : 'flex-row'}`} style={{ transform: `scale(${scale})`, transformOrigin: tokens.logoPosition === 'center' ? 'center' : 'left center' }}>
                {logoSrc ? <img src={logoSrc} alt="Logo" className="w-8 h-8 object-contain" /> : <div className="w-8 h-8 rounded-lg bg-[var(--theme-primary)] flex items-center justify-center text-white shadow-lg"><Zap size={16} /></div>}
                <span className="font-bold text-[var(--theme-title)] text-2xs tracking-widest uppercase">{tokens.systemName || 'SARAK'}</span>
            </div>
        );
    };

    const UserWidget = ({ variant = 'vertical' }: { variant?: 'horizontal' | 'vertical' }) => {
        const isHorizontal = variant === 'horizontal';
        if (isHorizontal) {
            return (
                <div className="flex items-center gap-4 ml-auto border-l border-[var(--theme-border)] pl-6">
                    <div className="flex flex-col items-end"><span className="text-2xs font-black text-[var(--theme-title)] uppercase tracking-widest">Sarak User</span><span className="text-[7px] text-[var(--theme-primary)] font-bold uppercase tracking-widest">Admin</span></div>
                    <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center"><Zap size={14} className="text-[var(--theme-primary)]" /></div>
                </div>
            );
        }
        return (
            <div className="flex items-center gap-3 p-4 border-t border-[var(--theme-border)] mt-auto relative z-20">
                <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden relative">
                    <div className="w-full h-full bg-gradient-to-br from-[var(--theme-primary)] to-purple-600 opacity-20 absolute inset-0" />
                    <Zap size={14} className="text-[var(--theme-primary)] relative z-10" />
                </div>
                <div className="flex flex-col"><span className="text-2xs font-bold text-[var(--theme-title)] uppercase tracking-wider">Sarak User</span><span className="text-3xs text-[var(--theme-muted)] uppercase tracking-widest">Administrator</span></div>
                <div className="ml-auto opacity-40 hover:opacity-100 transition-opacity cursor-pointer"><Shield size={14} className="text-[var(--theme-muted)]" /></div>
            </div>
        );
    };

    const LanguageSelector = ({ variant = 'horizontal' }: { variant?: 'horizontal' | 'vertical' }) => (
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 ${variant === 'vertical' ? 'w-full mb-1' : ''}`}>
            <span className="text-[10px]">🇧🇷</span>
            <span className="text-[8px] font-black uppercase tracking-widest text-white/40">PT</span>
        </div>
    );

    const draftContextValue = React.useMemo(() => ({
        design: tokens,
        ...tokens,
        isHydrated: true,
        applyConfig: () => {},
        applyFullConfig: () => {},
        registeredModules: [],
        layouts: []
    }), [tokens]);

    const renderPreviewItem = (id: string, title: string, content: React.ReactNode) => {
        const itemWidth = isDualView ? 'calc(50% - 16px)' : (previewDevice === 'desktop' ? '100%' : previewDevice === 'tablet' ? '768px' : '375px');
        const itemAspectRatio = previewDevice === 'desktop' ? '16/10' : previewDevice === 'tablet' ? '3/4' : '9/19.5';
        
        return (
            <div key={id} className="relative shrink-0 transition-all duration-700" style={{ width: itemWidth, aspectRatio: itemAspectRatio }}>
                <div className="absolute -top-10 left-0 right-0 flex items-center justify-between px-6">
                    <div className="flex items-center gap-3">
                        <div className="flex gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-500/40 border border-red-500/20" />
                            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/40 border border-red-500/20" />
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/40 border border-emerald-500/20" />
                        </div>
                        <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{title}</span>
                    </div>
                </div>
                <div className="w-full h-full rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden bg-black relative" style={{ boxShadow: `0 30px 60px -12px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)` }}>
                    {content}
                </div>
            </div>
        );
    };

    const renderSystemContent = () => (
        <div className="flex flex-col w-full h-full relative z-10 bg-[var(--theme-bg)]" style={cssVariables} {...dataAttributes}>
            {tokens.texture && tokens.texture !== 'none' && <div className={`absolute inset-0 pointer-events-none z-0 texture-${tokens.texture} SarakAtmosphereLayer`} />}
            
            {tokens.navigationStyle === 'topbar' ? (
                <div className="flex flex-col w-full h-full relative z-10">
                    <header className="sarak-shell-header h-14 border border-[var(--theme-border)] flex items-center justify-between px-6 bg-[var(--theme-card)] backdrop-blur-md relative z-20" style={{ margin: 'var(--theme-tab-section-margin)', borderRadius: 'calc(var(--radius-theme) * 0.8)', boxShadow: 'var(--theme-shadow)' }}>
                        <LogoComponent />
                        <nav className="flex h-full items-center">
                            {appIds.map((id) => (
                                <button key={id} onClick={() => setActivePreviewApp(id)} className={`px-4 flex items-center gap-2 h-8 rounded-lg transition-all text-2xs font-black uppercase tracking-widest ${activePreviewApp === id ? 'bg-[var(--theme-primary)] text-white shadow-lg' : 'text-[var(--theme-muted)] hover:text-[var(--theme-title)]'}`}>
                                    {appIcons[id]}
                                </button>
                            ))}
                        </nav>
                        <div className="flex items-center gap-4">
                            <div className="hidden md:flex items-center w-32 h-8 bg-white/5 border border-white/10 rounded-lg px-3 gap-2">
                                <Search size={12} className="text-white/20" />
                                <span className="text-[10px] text-white/20 font-bold uppercase tracking-wider">Search...</span>
                            </div>
                            <LanguageSelector />
                            <Bell size={14} className="text-white/20" />
                            <UserWidget variant="horizontal" />
                        </div>
                    </header>
                    <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">{apps[activePreviewApp]}</main>
                </div>
            ) : (
                <div className="flex w-full h-full relative z-10">
                    <aside className="sarak-shell-sidebar border border-[var(--theme-border)] flex flex-col bg-[var(--theme-card)] backdrop-blur-md relative z-20" style={{ width: `${tokens.sidebarWidth || 180}px`, margin: 'var(--theme-tab-section-margin)', borderRadius: 'calc(var(--radius-theme) * 0.8)', boxShadow: 'var(--theme-shadow)' }}>
                        <div className="p-6 border-b border-[var(--theme-border)] flex items-center justify-center">
                            <LogoComponent />
                        </div>
                        <nav className="flex-1 p-4 space-y-1">
                            <div className="mb-4 px-2 py-2 bg-white/5 border border-white/10 rounded-lg flex items-center gap-3">
                                <Search size={14} className="text-white/20" />
                                <span className="text-[10px] text-white/20 font-bold uppercase tracking-wider">Search</span>
                            </div>
                            {appIds.map((id) => (
                                <button key={id} onClick={() => setActivePreviewApp(id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-2xs font-black uppercase tracking-widest ${activePreviewApp === id ? 'bg-[var(--theme-primary)] text-white shadow-lg' : 'text-[var(--theme-muted)] hover:bg-white/5 hover:text-[var(--theme-title)]'}`}>
                                    {appIcons[id]}{id}
                                </button>
                            ))}
                        </nav>
                        <div className="p-2 space-y-1">
                            <LanguageSelector variant="vertical" />
                            <div className="flex items-center gap-3 px-4 py-2 rounded-lg text-white/20">
                                <Bell size={14} />
                                <span className="text-[10px] font-bold uppercase tracking-wider">Alerts</span>
                            </div>
                        </div>
                        <UserWidget variant="vertical" />
                    </aside>
                    <main className="flex-1 overflow-y-auto p-8 custom-scrollbar relative z-10">{apps[activePreviewApp]}</main>
                </div>
            )}
        </div>
    );

    return (
        <div className="flex-grow flex flex-col relative overflow-hidden bg-[#050505] p-2 items-center justify-center">
            <UIContext.Provider value={draftContextValue as any}>
                <div style={containerStyles} className="custom-scrollbar">
                    {isDualView ? (
                        <>
                            {renderPreviewItem("active-system", "System Mirror (Reactive)", renderSystemContent())}
                            {activeCategory && renderPreviewItem("preview-catalog", `${activeCategory.toUpperCase()} Specimens`, (
                                <div className="w-full h-full bg-[#050505] flex flex-col">
                                    <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-black/40">
                                        <div className="flex items-center gap-2">
                                            <Sparkles size={12} className="text-[var(--theme-primary)]" />
                                            <span className="text-[10px] font-black uppercase text-white/60 tracking-[0.3em]">{activeCategory} Catalog v8.5</span>
                                        </div>
                                        <div className="flex gap-1">
                                            <div className="w-1 h-1 rounded-full bg-[var(--theme-primary)] animate-pulse" />
                                            <div className="w-1 h-1 rounded-full bg-[var(--theme-primary)] opacity-40" />
                                        </div>
                                    </div>
                                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                                        <GalleryRouter 
                                            activeCategory={activeCategory} 
                                            tokens={tokens} 
                                            onUpdateDraft={onUpdateDraft} 
                                            activePreviewApp={activePreviewApp}
                                            customThemes={customThemes}
                                        />

                                    </div>
                                </div>
                            ))}
                        </>
                    ) : (
                        <motion.div
                            layout
                            initial={false}
                            animate={deviceStyles[previewDevice]}
                            className={`preview-container rounded-theme border-theme shadow-theme overflow-hidden flex transition-all duration-500 relative z-10 ${tokens.texture !== 'none' ? 'texture-active' : 'bg-[var(--theme-bg)]'} ${tokens.mode === 'dark' ? 'dark' : 'light'} ${tokens.isGeometricCut ? 'is-geometric' : ''}`}
                            {...dataAttributes}
                            style={{
                                ...cssVariables,
                                borderWidth: 'var(--theme-border-width)',
                                borderStyle: 'var(--theme-border-style)',
                                borderColor: 'var(--theme-border)'
                            }}
                        >
                             {renderSystemContent()}
                        </motion.div>
                    )}
                </div>
            </UIContext.Provider>
        </div>
    );
};
