import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Zap, Shield, Database, BarChart3, MessageSquare, History, Box, Network, Type, Grid, Maximize
} from 'lucide-react';
import { EMOJI_SETS, THEME_EFFECTS, DENSITY, SCALES } from '../../constants/design-tokens';
import { MockDashboard, MockChat, MockLogs, MockSettings, MockComponents, MockTypography } from './MockApps';

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
    draftTokens
}) => {
    const tokens = draftTokens || {};
    const densityConfig = (DENSITY as any)[(tokens.layoutDensity || 'standard').toUpperCase()] || DENSITY.STANDARD;

    // --- HELPERS ---
    const hexToRgb = (hex: string): string => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '59, 130, 246';
    };

    const getShadowStyle = (orientation: string, intensity: number, color: string): string => {
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
    };

    const cssVariables = {
        '--theme-primary': tokens.primaryColor || previewPrimaryColor,
        '--theme-primary-rgb': hexToRgb(tokens.primaryColor || previewPrimaryColor),
        '--radius-theme': `${tokens.borderRadius ?? 12}px`,
        '--theme-border-width': `${tokens.borderWidth ?? 1}px`,
        '--theme-border-style': tokens.borderStyle || 'solid',
        '--theme-gap': `${tokens.layoutGap ?? 20}px`,
        '--theme-pad': densityConfig.pad || '1.5rem',
        '--theme-card-pad': `${tokens.cardPadding ?? 24}px`,
        '--theme-tab-gap': `${tokens.tabGap ?? 12}px`,
        '--theme-tab-section-margin': `${tokens.tabSectionMargin ?? 0}px`,
        '--font-heading': tokens.headingFont || "'Inter', sans-serif",
        '--font-main': tokens.bodyFont || "'Inter', sans-serif",
        '--font-tab': tokens.tabFont || tokens.headingFont || "'Inter', sans-serif",
        '--heading-weight': tokens.headingWeight || '700',
        '--heading-spacing': tokens.headingLetterSpacing === 'tight' ? '-0.05em' : tokens.headingLetterSpacing === 'wide' ? '0.05em' : tokens.headingLetterSpacing === 'widest' ? '0.1em' : 'normal',
        '--theme-font-size-base': `calc(${densityConfig.fontSizeBase || '13px'} * ${(SCALES as any)[(tokens.fontScale || 'm').toUpperCase()]?.factor || '1.0'})`,
        '--animation-speed': `${tokens.animationSpeed ?? 0.4}s`,
        '--sarak-elasticity': (tokens.interfaceElasticity ?? 0.4).toString(),
        '--shadow-intensity': (tokens.shadowIntensity ?? 0.5).toString(),
        '--glass-blur': `${tokens.glassBlur ?? 10}px`,
        '--glass-opacity': (tokens.glassOpacity ?? 0.7).toString(),
        '--texture-opacity': (tokens.textureOpacity ?? 0.05).toString(),
        '--theme-bg': tokens.mode === 'light' ? '#f1f5f9' : '#020617',
        '--theme-card': tokens.mode === 'light' ? 'rgba(255,255,255,0.8)' : 'rgba(30,41,59,0.5)',
        '--theme-border': tokens.mode === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.08)',
        '--theme-title': tokens.mode === 'light' ? '#0f172a' : '#f8fafc',
        '--theme-main': tokens.mode === 'light' ? '#475569' : '#94a3b8',
        '--theme-muted': tokens.mode === 'light' ? '#94a3b8' : '#64748b',
        '--theme-shadow': getShadowStyle(tokens.shadowOrientation || 'top-down', tokens.shadowIntensity ?? 0.5, tokens.primaryColor || previewPrimaryColor),
        '--primary-color': tokens.primaryColor || previewPrimaryColor,
        '--border-color': tokens.mode === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.08)',
    } as React.CSSProperties;

    const deviceStyles: any = {
        desktop: { width: '100%', height: '100%', maxWidth: '1200px', aspectRatio: '16/9' },
        tablet: { width: '768px', height: '1024px', scale: 0.6 },
        smartphone: { width: '375px', height: '667px', scale: 0.8 }
    };

    const apps: any = {
        dashboard: <MockDashboard tokens={tokens} config={config} animationVariants={THEME_EFFECTS.page} animationStyle={previewAnimationStyle} />,
        chat: <MockChat tokens={tokens} config={config} animationVariants={THEME_EFFECTS.page} animationStyle={previewAnimationStyle} />,
        logs: <MockLogs tokens={tokens} config={config} animationVariants={THEME_EFFECTS.page} animationStyle={previewAnimationStyle} />,
        settings: <MockSettings tokens={tokens} config={config} animationVariants={THEME_EFFECTS.page} animationStyle={previewAnimationStyle} />,
        components: <MockComponents tokens={tokens} />,
        typography: <MockTypography tokens={tokens} />
    };

    const appIds = ['dashboard', 'chat', 'logs', 'settings', 'components', 'typography'];
    const appIcons: any = {
        dashboard: <BarChart3 size={14} />,
        chat: <MessageSquare size={14} />,
        logs: <History size={14} />,
        settings: <Network size={14} />,
        components: <Box size={14} />,
        typography: <Type size={14} />
    };

    const LogoComponent = () => {
        const logoSrc = tokens.mode === 'light' ? (tokens.logoUrl || tokens.logoDarkUrl) : (tokens.logoDarkUrl || tokens.logoUrl);
        const scale = tokens.logoScale || 1.0;
        
        return (
            <div className={`flex items-center gap-3 ${tokens.logoPosition === 'center' ? 'flex-col text-center' : 'flex-row'}`} style={{ transform: `scale(${scale})`, transformOrigin: tokens.logoPosition === 'center' ? 'center' : 'left center' }}>
                {logoSrc ? (
                    <img src={logoSrc} alt="Logo" className="w-8 h-8 object-contain" />
                ) : (
                    <div className="w-8 h-8 rounded-lg bg-[var(--theme-primary)] flex items-center justify-center text-white shadow-lg shadow-[var(--theme-primary)]/20">
                        <Zap size={16} />
                    </div>
                )}
                <span className="font-bold text-[var(--theme-title)] text-[10px] tracking-widest uppercase">{tokens.systemName || 'SARAK'}</span>
            </div>
        );
    };

    const UserProfileComponent = () => {
        return (
            <div className="flex items-center gap-3 p-4 border-t border-[var(--theme-border)] mt-auto relative z-20">
                <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden relative">
                    <div className="w-full h-full bg-gradient-to-br from-[var(--theme-primary)] to-purple-600 opacity-20 absolute inset-0" />
                    <span className="text-[10px] font-bold text-[var(--theme-title)] relative z-10">U</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-[var(--theme-title)] uppercase tracking-wider">Sarak User</span>
                    <span className="text-[8px] text-[var(--theme-muted)] uppercase tracking-widest">Administrator</span>
                </div>
                <div className="ml-auto opacity-40 hover:opacity-100 transition-opacity cursor-pointer">
                    <Shield size={14} className="text-[var(--theme-muted)]" />
                </div>
            </div>
        );
    };

    const TopbarUserProfile = () => {
        return (
            <div className="flex items-center gap-4 ml-auto border-l border-[var(--theme-border)] pl-6">
                <div className="flex flex-col items-end">
                    <span className="text-[9px] font-black text-[var(--theme-title)] uppercase tracking-widest">Sarak User</span>
                    <span className="text-[7px] text-[var(--theme-primary)] font-bold uppercase tracking-widest">Admin</span>
                </div>
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                    <Zap size={14} className="text-[var(--theme-primary)]" />
                </div>
            </div>
        );
    };

    return (
        <div className="flex-grow flex flex-col relative overflow-hidden bg-[#050505] p-8 items-center justify-center">
            <motion.div
                layout
                initial={false}
                animate={deviceStyles[previewDevice]}
                className={`rounded-[var(--radius-theme)] shadow-[var(--theme-shadow)] overflow-hidden flex transition-all duration-500 relative z-10 ${tokens.texture !== 'none' ? 'texture-active' : 'bg-[var(--theme-bg)]'}`}
                style={{
                    ...cssVariables,
                    borderWidth: 'var(--theme-border-width)',
                    borderStyle: 'var(--theme-border-style)',
                    borderColor: 'var(--theme-border)'
                }}
            >
                {/* TEXTURE OVERLAY INSIDE APP (Sovereignty v6.8.6) */}
                {tokens.texture && tokens.texture !== 'none' && (
                    <div className={`absolute inset-0 pointer-events-none z-0 texture-${tokens.texture} SarakAtmosphereLayer`} />
                )}

                {tokens.navigationStyle === 'topbar' ? (
                    <div className="flex flex-col w-full h-full relative z-10">
                        <header 
                            className="h-14 border border-[var(--theme-border)] flex items-center justify-between px-6 bg-[var(--theme-card)] backdrop-blur-md relative z-20 transition-all"
                            style={{ 
                                margin: 'var(--theme-tab-section-margin)',
                                borderRadius: 'calc(var(--radius-theme) * 0.8)',
                                boxShadow: 'var(--theme-shadow)'
                            }}
                        >
                            <LogoComponent />
                            <nav className="flex h-full items-center">
                                {appIds.map((id) => (
                                    <button
                                        key={id}
                                        onClick={() => setActivePreviewApp(id)}
                                        className={`px-4 flex items-center gap-2 h-8 rounded-lg transition-all text-[9px] font-black uppercase tracking-widest ${activePreviewApp === id ? 'bg-[var(--theme-primary)] text-white shadow-lg shadow-[var(--theme-primary)]/20' : 'text-[var(--theme-muted)] hover:text-[var(--theme-title)] hover:bg-white/5'}`}
                                        style={{ marginLeft: 'var(--theme-tab-gap)', marginRight: 'var(--theme-tab-gap)' }}
                                    >
                                        {appIcons[id]}
                                        <span className="hidden lg:inline">{id}</span>
                                    </button>
                                ))}
                            </nav>
                            <TopbarUserProfile />
                        </header>
                        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar relative">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activePreviewApp}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: parseFloat(tokens.animationSpeed ?? '0.4') }}
                                    className="h-full"
                                >
                                    {apps[activePreviewApp]}
                                </motion.div>
                            </AnimatePresence>
                        </main>
                    </div>
                ) : (
                    <>
                        <aside 
                            className="border border-[var(--theme-border)] flex flex-col bg-[var(--theme-card)] backdrop-blur-md relative z-20 transition-all" 
                            style={{ 
                                width: `${tokens.sidebarWidth || 260}px`,
                                margin: 'var(--theme-tab-section-margin)',
                                borderRadius: 'calc(var(--radius-theme) * 0.8)',
                                boxShadow: 'var(--theme-shadow)'
                            }}
                        >
                            <div className="p-6 border-b border-[var(--theme-border)] flex items-center justify-center">
                                <LogoComponent />
                            </div>
                            <nav className="flex-1 p-4 space-y-1">
                                {appIds.map((id) => (
                                    <button
                                        key={id}
                                        onClick={() => setActivePreviewApp(id)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-[9px] font-black uppercase tracking-widest ${activePreviewApp === id ? 'bg-[var(--theme-primary)] text-white shadow-lg shadow-[var(--theme-primary)]/20' : 'text-[var(--theme-muted)] hover:bg-white/5 hover:text-[var(--theme-title)]'}`}
                                        style={{ marginTop: 'var(--theme-tab-gap)', marginBottom: 'var(--theme-tab-gap)' }}
                                    >
                                        {appIcons[id]}
                                        {id}
                                    </button>
                                ))}
                            </nav>
                            <UserProfileComponent />
                        </aside>
                        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar relative z-10">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activePreviewApp}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: parseFloat(tokens.animationSpeed ?? '0.4') }}
                                    className="h-full"
                                >
                                    {apps[activePreviewApp]}
                                </motion.div>
                            </AnimatePresence>
                        </main>
                    </>
                )}
            </motion.div>
        </div>
    );
};
