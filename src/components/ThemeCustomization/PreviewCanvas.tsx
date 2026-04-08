import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Zap, Shield, Database, BarChart3, MessageSquare, History, Users, Settings2
} from 'lucide-react';
import { EMOJI_SETS, THEME_EFFECTS, DENSITY, SCALES } from '@sarak/lib-shared';
import { MockDashboard, MockChat, MockLogs, MockSettings } from './MockApps';

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
    draftTokens: any; // Novos tokens do rascunho v5.6
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
    const previewStyles: any = {
        desktop: { width: '100%', height: '100%', maxWidth: '1320px', aspectRatio: '16/9.5' },
        tablet: { width: '922px', height: '100%', maxWidth: '922px', aspectRatio: '3/4' },
        smartphone: { width: '450px', height: '100%', maxWidth: '450px', aspectRatio: '9/19.5' }
    };

    const renderApp = (tokens: any) => {
        const props = { config, animationVariants: (THEME_EFFECTS as any).page, animationStyle: previewAnimationStyle, tokens };
        switch (activePreviewApp) {
            case 'dashboard': return <MockDashboard {...props} />;
            case 'chat': return <MockChat {...props} />;
            case 'logs': return <MockLogs {...props} />;
            case 'settings': return <MockSettings {...props} />;
            default: return <MockDashboard {...props} />;
        }
    };

    // Usamos os tokens do Draft ou fallbacks do sistema
    const tokens = draftTokens || {};
    const densityConfig = (DENSITY as any)[(tokens.layoutDensity || 'standard').toUpperCase()] || DENSITY.STANDARD;

    return (
        <div className="flex-grow flex flex-col relative overflow-hidden bg-black/20">
            {/* PREVIEW CANVAS CONTAINER */}
            <div className="flex-grow flex items-center justify-center p-8 relative z-10 overflow-auto custom-scrollbar">
                <motion.div
                    layout
                    initial={false}
                    animate={previewStyles[previewDevice]}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    style={{
                        '--primary-color': tokens.primaryColor || previewPrimaryColor,
                        '--font-main': tokens.bodyFont || "'Inter', sans-serif",
                        '--font-heading': tokens.headingFont || "'Inter', sans-serif",
                        '--font-subtitle': tokens.subtitleFont || tokens.headingFont || "'Inter', sans-serif",
                        '--heading-weight': tokens.headingWeight || '700',
                        '--heading-spacing': tokens.headingLetterSpacing === 'tight' ? '-0.05em' : tokens.headingLetterSpacing === 'wide' ? '0.05em' : tokens.headingLetterSpacing === 'widest' ? '0.1em' : 'normal',
                        '--radius-theme': `${tokens.borderRadius ?? 12}px`,
                        '--border-width': `${tokens.borderWidth ?? 1}px`,
                        '--border-style': tokens.borderStyle || 'solid',
                        '--glass-blur': `${tokens.glassBlur ?? 10}px`,
                        '--glass-opacity': (tokens.glassOpacity ?? 0.7).toString(),
                        '--shadow-intensity': (tokens.shadowIntensity ?? 0.5).toString(),
                        '--texture-opacity': (tokens.textureOpacity ?? 0.05).toString(),
                        '--animation-speed': `${tokens.animationSpeed ?? 0.4}s`,
                        '--theme-gap': `${tokens.layoutGap ?? (densityConfig.gap === '0.5rem' ? 8 : densityConfig.gap === '1.25rem' ? 20 : 32)}px`,
                        '--theme-pad': densityConfig.pad || '1.5rem',
                        '--font-tab': tokens.tabFont || tokens.headingFont || "'Inter', sans-serif",
                        '--theme-font-size-base': `calc(${densityConfig.fontSizeBase || '13px'} * ${(SCALES as any)[(tokens.fontScale || 'm').toUpperCase()]?.factor || '1.0'})`,
                        // Cores de fundo baseadas no modo (Essencial para texturas e CONTRASTE)
                        '--bg-body': tokens.mode === 'light' ? '#f1f5f9' : '#020617',
                        '--bg-card': tokens.mode === 'light' ? '#ffffff' : '#1e293b',
                        '--bg-sidebar': tokens.mode === 'light' ? '#e2e8f0' : '#0f172a',
                        '--text-main': tokens.mode === 'light' ? '#1e293b' : '#94a3b8',
                        '--text-title': tokens.mode === 'light' ? '#0f172a' : '#f8fafc',
                        '--border-color': tokens.mode === 'light' ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.1)',
                        // ALIASES PARA COMPATIBILIDADE (Sarak Legacy + Atomic)
                        '--theme-primary': tokens.primaryColor || previewPrimaryColor,
                        '--theme-body': tokens.mode === 'light' ? '#f1f5f9' : '#020617',
                        '--theme-card': tokens.mode === 'light' ? '#ffffff' : '#1e293b',
                        '--theme-border': tokens.mode === 'light' ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.1)',
                        '--theme-title': tokens.mode === 'light' ? '#0f172a' : '#f8fafc',
                        '--theme-muted': tokens.mode === 'light' ? '#475569' : '#64748b',
                        '--shadow-color': tokens.mode === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.4)',
                    } as React.CSSProperties}
                    className={`preview-container ${tokens.mode || mode} layout-${(tokens.layout || previewLayoutId).replace('custom-', '')} ${tokens.isGeometricCut ? 'is-geometric' : ''} bg-[var(--bg-body)] text-[var(--text-main)] rounded-[32px] shadow-[0_50px_100px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col relative transition-all duration-500 ${tokens.texture && tokens.texture !== 'none' ? `texture-${tokens.texture}` : ''}`}
                    data-surface={tokens.surfaceMaterial || 'glass'}
                    data-border={tokens.borderType || 'default'}
                >
                    {/* Mock Browser/App Header */}
                    <div className="h-10 bg-black/20 border-b border-white/5 px-6 flex items-center gap-2 shrink-0">
                        <div className="flex gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-rose-500/30"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/30"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/30"></div>
                        </div>
                        <div className="mx-auto bg-black/40 px-4 py-1 rounded-full border border-white/5 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary-color)] animate-pulse"></div>
                            <span className="text-[7px] font-black uppercase tracking-[0.3em] text-white/40">{tokens.systemName || "Sarak Matrix"}</span>
                        </div>
                    </div>

                    <div className={`flex flex-grow overflow-hidden ${tokens.navigationStyle === 'topbar' ? 'flex-col' : 'flex-row'}`} style={{ transitionDuration: 'var(--animation-speed)' }}>
                        {/* Mock Navigation Header (for Topbar) */}
                        {tokens.navigationStyle === 'topbar' && (
                            <div className="h-12 bg-black/10 border-b border-white/5 flex items-center px-6 gap-6 shrink-0 relative z-20">
                                <div className="w-8 h-8 rounded-lg bg-[var(--primary-color)] flex items-center justify-center text-white shadow-lg overflow-hidden">
                                    {tokens.logoUrl ? (
                                        <img src={tokens.mode === 'dark' && tokens.logoDarkUrl ? tokens.logoDarkUrl : tokens.logoUrl} className="w-full h-full object-contain" style={{ transform: `scale(${tokens.logoScale || 1})` }} />
                                    ) : (
                                        <Zap className="w-4 h-4 fill-current" />
                                    )}
                                </div>
                                <div className="flex gap-4">
                                    {[BarChart3, MessageSquare, History, Users].map((Icon, i) => (
                                        <div key={i} 
                                            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-2 ${activePreviewApp === ['dashboard', 'chat', 'logs', 'settings'][i] ? 'bg-[var(--primary-color)]/10 text-[var(--primary-color)]' : 'text-white/20'}`}
                                            style={{ fontFamily: 'var(--font-tab, var(--font-heading))' }}
                                        >
                                            <Icon className="w-3 h-3" />
                                            {['Dash', 'Chat', 'Logs', 'Users'][i]}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Mock Navigation Sidebar (only if not Topbar) */}
                        {tokens.navigationStyle !== 'topbar' && (
                            <div className="w-16 sm:w-20 bg-black/10 border-r border-white/5 shrink-0 flex flex-col items-center py-8 gap-6 relative z-20">
                                <div className="w-10 h-10 rounded-xl bg-[var(--primary-color)] flex items-center justify-center text-white shadow-lg shadow-[var(--primary-color)]/20 mb-4 cursor-pointer hover:scale-110 transition-transform overflow-hidden">
                                    {tokens.logoUrl ? (
                                        <img src={tokens.mode === 'dark' && tokens.logoDarkUrl ? tokens.logoDarkUrl : tokens.logoUrl} className="w-full h-full object-contain" style={{ transform: `scale(${tokens.logoScale || 1})` }} />
                                    ) : (
                                        <Zap className="w-5 h-5 fill-current" />
                                    )}
                                </div>
                                {[BarChart3, MessageSquare, History, Users, Shield, Database].map((Icon, i) => (
                                    <div key={i} className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${i === 0 ? 'bg-[var(--primary-color)]/10 text-[var(--primary-color)] shadow-sm' : 'text-white/20 hover:text-white hover:bg-white/5'}`}>
                                        <Icon className="w-4 h-4" />
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* App Content Area */}
                        <div className="flex-grow flex flex-col overflow-hidden relative z-10">
                            {tokens.navigationStyle !== 'topbar' && (
                                <div className="h-16 border-b border-white/5 bg-black/5 px-8 flex items-center justify-between shrink-0">
                                    <div className="flex gap-6">
                                        {[
                                            { id: 'dashboard', icon: <BarChart3 className="w-4 h-4" />, label: 'Dashboard' },
                                            { id: 'chat', icon: <MessageSquare className="w-4 h-4" />, label: 'Nexus Chat' },
                                            { id: 'logs', icon: <History className="w-4 h-4" />, label: 'Matrix Logs' },
                                            { id: 'settings', icon: <Settings2 className="w-4 h-4" />, label: 'Engine' }
                                        ].map(app => (
                                            <button
                                                key={app.id}
                                                onClick={() => setActivePreviewApp(app.id)}
                                                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest ${activePreviewApp === app.id ? 'bg-[var(--primary-color)] text-white shadow-lg shadow-[var(--theme-primary)]/20' : 'text-white/20 hover:text-white hover:bg-white/5'}`}
                                                style={{ 
                                                    transitionDuration: 'var(--animation-speed)',
                                                    fontFamily: 'var(--font-tab, var(--font-heading))'
                                                }}
                                            >
                                                <span className="shrink-0">{app.icon}</span>
                                                <span className="hidden lg:inline">{app.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex-grow overflow-auto relative p-8 custom-scrollbar">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={activePreviewApp}
                                        initial={{ opacity: 0, scale: 0.98, x: -10 }}
                                        animate={{ opacity: 1, scale: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.98, x: 10 }}
                                        transition={{ 
                                            duration: parseFloat(tokens.animationSpeed || '0.4'),
                                            ease: [0.16, 1, 0.3, 1]
                                        }}
                                        className={`h-full ${tokens.isSplitViewEnabled ? 'grid grid-cols-2 gap-[var(--theme-gap)]' : 'flex flex-col'}`}
                                    >
                                        <div className="flex flex-col min-h-full">
                                            {renderApp(tokens)}
                                        </div>
                                        {tokens.isSplitViewEnabled && (
                                            <div className="flex flex-col min-h-full">
                                                <MockLogs config={config} animationVariants={(THEME_EFFECTS as any).page} animationStyle={previewAnimationStyle} tokens={tokens} />
                                            </div>
                                        )}
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            <div className="flex justify-between items-center px-8 pb-6 relative z-10 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/30">Live Engine Connection: Stable</span>
                </div>
                <div className="flex items-center gap-6 text-[9px] font-black uppercase tracking-[0.2em] text-white/20 italic">
                    <span>ARCHETYPE: {tokens.layout || previewLayoutId}</span>
                    <span>RESOLUTION: {previewDevice.toUpperCase()}</span>
                </div>
            </div>
        </div >
    );
};
