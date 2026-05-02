import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Zap, Shield, BarChart3, MessageSquare, History, Box, Network, Type, Grid, Sparkles, Search, Bell
} from 'lucide-react';
import { THEME_EFFECTS } from '../../../constants/design-tokens';
import { DESIGN_MANIFEST, UIContext, computeColorVariants } from '../../../core/Provider/SarakUIProvider';
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

        // --- Industrial Parity Overrides (Calculated after loop to ensure precision) ---
        const densityMap: any = { compact: 0.8, comfortable: 1, spacious: 1.25 };
        const densityFactor = densityMap[tokens.layoutDensity || 'comfortable'] || 1;
        
        vars['--ui-density'] = densityFactor;
        vars['--theme-gap'] = `${(tokens.layoutGap || 20) * densityFactor}px`;
        vars['--theme-tab-gap'] = `${(tokens.tabGap || 12) * densityFactor}px`;
        vars['--safe-area-padding'] = `${tokens.tabSectionMargin || 0}px`;
        vars['--max-content-width'] = tokens.maxContentWidth === 'none' ? '100%' : tokens.maxContentWidth;
        vars['--sarak-scrollbar-width'] = `${tokens.scrollbarStyle || 6}px`;
        
        // Haptic Logic Parity (v8.5)
        vars['--haptic-bounce'] = 1 - ((tokens.hapticIntensity || 0.02) * 2);

        // Glass & Card Parity (Ensures CSS variables win over JS calculations)
        vars['--glass-opacity'] = tokens.glassOpacity ?? 0.1;
        vars['--texture-opacity'] = tokens.textureOpacity ?? 0.08;
        vars['--surface-intensity'] = tokens.surfaceIntensity ?? 0.05;
        vars['--theme-noise-opacity'] = tokens.atmosphereNoiseOpacity ?? 0.05;
        vars['--sarak-glass-saturation'] = `${tokens.glassSaturation ?? 180}%`;
        vars['--contrast-curve'] = tokens.contrastCurve ?? 1.0;
        vars['--spotlight-opacity'] = tokens.cardSpotlight ?? 0;

        const isLight = tokens.mode === 'light';
        vars['--theme-bg'] = isLight ? '#f1f5f9' : '#020617';
        
        if (!vars['--theme-shadow']) {
            vars['--theme-shadow'] = tokens.layeredShadows 
                ? vars['--sarak-layered-shadows'] 
                : getShadowStyle(tokens.shadowOrientation || 'top-down', tokens.shadowIntensity ?? 0.5, tokens.primaryColor);
        }

        if (!vars['--radius-theme']) vars['--radius-theme'] = '12px';

        // --- DYNAMIC COLOR ROUTER (Multi-Tone Engine v10.0 Parity) ---
        const depth = parseInt(tokens.colorDepth) || 1;
        const variation = parseInt(tokens.colorVariation) || 1;

        const p = computeColorVariants(tokens.primaryColor || '#3b82f6', '#3b82f6');
        const sc = computeColorVariants(tokens.secondaryColor || '#6366f1', '#6366f1');
        const t = computeColorVariants(tokens.tertiaryColor || '#10b981', '#10b981');
        const neutral = computeColorVariants('#1e293b', '#1e293b');

        const injectPreviewLayer = (slot: string, color: any) => {
            const prefix = `--theme-${slot}`;
            vars[prefix] = color.main;
            vars[`${prefix}-rgb`] = color.rgb;
            vars[`${prefix}-bg`] = color.bg;
            vars[`${prefix}-border`] = color.border;
            vars[`${prefix}-hover`] = color.hover;
            vars[`${prefix}-active`] = color.active;
            vars[`${prefix}-focus`] = color.focus;
            vars[`${prefix}-light`] = color.light;
            
            if (slot === 'button') {
                vars['--theme-primary'] = color.main;
                vars['--theme-primary-rgb'] = color.rgb;
            }
        };

        if (depth === 1) {
            if (variation === 2) {
                injectPreviewLayer('primary', p);
                injectPreviewLayer('card', neutral);
                injectPreviewLayer('sidebar', p);
                injectPreviewLayer('button', p);
                injectPreviewLayer('border', p);
            } else if (variation === 3) {
                injectPreviewLayer('primary', p);
                injectPreviewLayer('card', { ...p, main: `rgba(${p.rgb}, 0.1)` });
                injectPreviewLayer('sidebar', p);
                injectPreviewLayer('button', p);
                injectPreviewLayer('border', p);
            } else {
                injectPreviewLayer('primary', p);
                injectPreviewLayer('card', p);
                injectPreviewLayer('sidebar', p);
                injectPreviewLayer('button', p);
                injectPreviewLayer('border', p);
            }
        } else if (depth === 2) {
            if (variation === 2) {
                injectPreviewLayer('primary', p);
                injectPreviewLayer('sidebar', p);
                injectPreviewLayer('texture', p);
                injectPreviewLayer('card', sc);
                injectPreviewLayer('border', sc);
                injectPreviewLayer('button', p);
            } else if (variation === 3) {
                injectPreviewLayer('primary', p);
                injectPreviewLayer('sidebar', p);
                injectPreviewLayer('card', sc);
                injectPreviewLayer('button', sc);
                injectPreviewLayer('border', sc);
            } else {
                injectPreviewLayer('primary', p);
                injectPreviewLayer('sidebar', p);
                injectPreviewLayer('button', p);
                injectPreviewLayer('card', sc);
                injectPreviewLayer('border', sc);
            }
        } else if (depth === 3) {
            if (variation === 2) {
                injectPreviewLayer('primary', p);
                injectPreviewLayer('sidebar', p);
                injectPreviewLayer('card', sc);
                injectPreviewLayer('border', sc);
                injectPreviewLayer('button', t);
            } else if (variation === 3) {
                injectPreviewLayer('primary', p);
                injectPreviewLayer('sidebar', p);
                injectPreviewLayer('card', sc);
                injectPreviewLayer('button', t);
                injectPreviewLayer('border', t);
            } else {
                injectPreviewLayer('primary', p);
                injectPreviewLayer('sidebar', p);
                injectPreviewLayer('header', p);
                injectPreviewLayer('card', sc);
                injectPreviewLayer('border', t);
                injectPreviewLayer('button', p);
            }
        }

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
        const logoSize = 32 * scale;
        
        return (
            <div className={`flex items-center gap-3 ${tokens.logoPosition === 'center' ? 'flex-col text-center' : 'flex-row'}`}>
                {logoSrc ? (
                    <div style={{ 
                        height: `${Math.max(32, logoSize)}px`, 
                        minWidth: `${Math.max(32, logoSize)}px`, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        transition: 'all 0.5s ease'
                    }}>
                        <img 
                            src={logoSrc} 
                            alt="Logo" 
                            style={{ height: `${logoSize}px`, width: 'auto' }} 
                            className="object-contain" 
                        />
                    </div>
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
        <div 
            className="flex flex-col w-full h-full relative z-10 bg-[var(--theme-bg)] transition-all duration-500 overflow-hidden" 
            style={{ 
                ...cssVariables, 
                padding: 'var(--safe-area-padding)',
            }} 
            {...dataAttributes}
        >
            <style>{`
                .sarak-preview-btn { transition: transform 0.1s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
                .sarak-preview-btn:active { transform: scale(var(--haptic-bounce, 0.95)); }
                
                /* Preview Scrollbar Parity */
                .SarakPreviewCanvas *::-webkit-scrollbar {
                    width: var(--sarak-scrollbar-width) !important;
                    height: var(--sarak-scrollbar-width) !important;
                }
                .SarakPreviewCanvas *::-webkit-scrollbar-track {
                    background: transparent;
                }
                .SarakPreviewCanvas *::-webkit-scrollbar-thumb {
                    background: var(--theme-border);
                    border-radius: 10px;
                }
                .SarakPreviewCanvas *::-webkit-scrollbar-thumb:hover {
                    background: var(--theme-primary);
                }
            `}</style>

            {tokens.texture && tokens.texture !== 'none' && <div className={`absolute inset-0 pointer-events-none z-0 texture-${tokens.texture} SarakAtmosphereLayer`} />}
            
            {tokens.navigationStyle === 'topbar' ? (
                <div className="flex flex-col w-full h-full relative z-10 overflow-hidden">
                    <AnimatePresence>
                        {!tokens.isNavHidden && (
                            <motion.header 
                                initial={{ y: -100, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: -100, opacity: 0 }}
                                className="sarak-shell-header h-14 border border-[var(--theme-border)] flex items-center justify-between px-6 bg-[var(--theme-card)] backdrop-blur-md relative z-20" 
                                style={{ margin: 'var(--safe-area-padding)', borderRadius: 'calc(var(--radius-theme) * 0.8)', boxShadow: 'var(--theme-shadow)' }}
                            >
                                <LogoComponent />
                                <nav 
                                    className="flex h-full items-center overflow-x-auto custom-scrollbar-hide px-4" 
                                    style={{ 
                                        gap: 'var(--theme-tab-gap)', 
                                        justifyContent: appIds.length > 5 ? 'flex-start' : 'center',
                                        maskImage: 'linear-gradient(to right, transparent, black 20px, black calc(100% - 20px), transparent)',
                                        WebkitMaskImage: 'linear-gradient(to right, transparent, black 20px, black calc(100% - 20px), transparent)'
                                    }}
                                >
                                    {appIds.map((id) => (
                                        <button key={id} onClick={() => setActivePreviewApp(id)} className={`sarak-preview-btn px-4 flex items-center gap-2 h-8 rounded-lg transition-all text-2xs font-black uppercase tracking-widest shrink-0 ${activePreviewApp === id ? 'bg-[var(--theme-primary)] text-white shadow-lg' : 'text-[var(--theme-muted)] hover:text-[var(--theme-title)]'}`}>
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
                            </motion.header>
                        )}
                    </AnimatePresence>
                    <main 
                        className="flex-1 overflow-y-auto p-8 custom-scrollbar" 
                        style={{ 
                            padding: `calc(32px * var(--ui-density))`,
                            maxWidth: 'var(--max-content-width)',
                            margin: '0 auto',
                            width: '100%'
                        }}
                    >
                        {apps[activePreviewApp]}
                    </main>
                </div>
            ) : (
                <div className="flex w-full h-full relative z-10">
                    <aside 
                        className="sarak-shell-sidebar border border-[var(--theme-border)] flex flex-col bg-[var(--theme-card)] backdrop-blur-md relative z-20 transition-all duration-500 overflow-hidden" 
                        style={{ 
                            width: tokens.isNavHidden ? '74px' : `${(tokens.sidebarWidth || 240) * (tokens.layoutDensity === 'compact' ? 0.9 : 1)}px`, 
                            margin: 'var(--safe-area-padding)', 
                            borderRadius: 'calc(var(--radius-theme) * 0.8)', 
                            boxShadow: 'var(--theme-shadow)' 
                        }}
                    >
                        <div className={`p-6 border-b border-[var(--theme-border)] flex items-center ${tokens.isNavHidden ? 'justify-center' : 'justify-between'}`}>
                            <LogoComponent />
                        </div>
                        <nav className="flex-1 p-4 overflow-x-hidden" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--theme-tab-gap)' }}>
                            {!tokens.isNavHidden && (
                                <div className="mb-4 px-2 py-2 bg-white/5 border border-white/10 rounded-lg flex items-center gap-3">
                                    <Search size={14} className="text-white/20" />
                                    <span className="text-[10px] text-white/20 font-bold uppercase tracking-wider">Search</span>
                                </div>
                            )}
                            {appIds.map((id) => (
                                <button key={id} onClick={() => setActivePreviewApp(id)} className={`sarak-preview-btn w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-2xs font-black uppercase tracking-widest ${tokens.isNavHidden ? 'justify-center' : ''} ${activePreviewApp === id ? 'bg-[var(--theme-primary)] text-white shadow-lg' : 'text-[var(--theme-muted)] hover:bg-white/5 hover:text-[var(--theme-title)]'}`}>
                                    <div className="shrink-0">{appIcons[id]}</div>
                                    {!tokens.isNavHidden && id}
                                </button>
                            ))}
                        </nav>
                        <div className="p-2 space-y-1">
                            <LanguageSelector variant={tokens.isNavHidden ? 'horizontal' : 'vertical'} />
                            <div className={`flex items-center gap-3 px-4 py-2 rounded-lg text-white/20 ${tokens.isNavHidden ? 'justify-center' : ''}`}>
                                <Bell size={14} />
                                {!tokens.isNavHidden && <span className="text-[10px] font-bold uppercase tracking-wider">Alerts</span>}
                            </div>
                        </div>
                        <UserWidget variant={tokens.isNavHidden ? 'horizontal' : 'vertical'} />
                    </aside>

                    {/* SECONDARY MODULE (Split View) */}
                    <AnimatePresence>
                        {tokens.isSplitViewEnabled && (
                            <motion.aside 
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -20, opacity: 0 }}
                                className="w-48 border-r border-[var(--theme-border)] bg-[var(--theme-card)]/30 backdrop-blur-sm flex flex-col p-4 relative z-10"
                                style={{ margin: 'var(--theme-tab-section-margin) 0' }}
                            >
                                <div className="text-[10px] font-black text-[var(--theme-primary)] uppercase tracking-widest mb-4 px-2 flex items-center gap-2">
                                    <Grid size={10} />
                                    Sub-Module
                                </div>
                                <div className="space-y-2">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className={`p-2 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${i === 1 ? 'bg-white/10 text-white' : 'text-white/20 hover:bg-white/5'}`}>
                                            Section {i}
                                        </div>
                                    ))}
                                </div>
                            </motion.aside>
                        )}
                    </AnimatePresence>

                    <main className="flex-1 overflow-y-auto p-8 custom-scrollbar relative z-10 transition-all duration-500 ease-in-out" style={{ padding: `calc(32px * var(--ui-density))` }}>{apps[activePreviewApp]}</main>
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
            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar {
                    width: var(--scrollbar-width, 6px);
                    height: var(--scrollbar-width, 6px);
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: var(--theme-primary);
                    border-radius: 10px;
                    opacity: 0.5;
                }
                .sarak-preview-btn:active {
                    transform: scale(var(--haptic-bounce, 0.98)) !important;
                    transition: transform 0.1s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }
            `}} />
        </div>
    );
};
