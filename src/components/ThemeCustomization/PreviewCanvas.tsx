import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Zap, Shield, Database, BarChart3, MessageSquare, History, Users, Settings2
} from 'lucide-react';
import { EMOJI_SETS, THEME_EFFECTS } from '@sarak/lib-shared';
import { MockDashboard, MockChat, MockLogs, MockSettings } from './MockApps';
import { useSarak } from '@sarak/lib-shared';

export const PreviewCanvas: React.FC<{
    previewDevice: 'desktop' | 'tablet' | 'smartphone';
    previewLayoutId: string;
    activePreviewApp: string;
    setActivePreviewApp: (app: string) => void;
    previewAnimationStyle: string;
    previewEmojiSet: string;
    config: any;
    previewPrimaryColor: string;
    mode: string;
}> = ({
    previewDevice,
    previewLayoutId,
    activePreviewApp,
    setActivePreviewApp,
    previewAnimationStyle,
    previewEmojiSet,
    config,
    previewPrimaryColor,
    mode
}) => {
    const previewStyles: any = {
        desktop: { width: '100%', height: '100%', maxWidth: '1320px', aspectRatio: '16/9.5' },
        tablet: { width: '922px', height: '100%', maxWidth: '922px', aspectRatio: '3/4' },
        smartphone: { width: '450px', height: '100%', maxWidth: '450px', aspectRatio: '9/19.5' }
    };

    const renderApp = () => {
        const props = { config, animationVariants: (THEME_EFFECTS as any).page, animationStyle: previewAnimationStyle };
        switch (activePreviewApp) {
            case 'dashboard': return <MockDashboard {...props} />;
            case 'chat': return <MockChat {...props} />;
            case 'logs': return <MockLogs {...props} />;
            case 'settings': return <MockSettings {...props} />;
            default: return <MockDashboard {...props} />;
        }
    };

    const { 
        layoutDensity, setLayoutDensity,
        borderRadius, borderWidth, borderStyle, glassOpacity, glassBlur, 
        shadowIntensity, textureOpacity, headingWeight, headingLetterSpacing,
        headingFont, subtitleFont, bodyFont, animationSpeed,
        isGeometricCut
    } = useSarak();

    return (
        <div className="flex-grow flex flex-col relative overflow-hidden bg-[var(--theme-body)]/20">
            {/* TOP FILTERS & TOOLS */}
            <div className="flex items-center justify-between shrink-0 relative z-30 p-4">
                {/* Center Presets */}
                <div className="flex-grow flex justify-center">
                    <div className="flex gap-4 items-center bg-black/40 p-1.5 rounded-full border border-white/10 backdrop-blur-md shadow-xl">
                        {[
                            { id: 'compact', label: 'Compact' },
                            { id: 'standard', label: 'Standard' },
                            { id: 'comfortable', label: 'Comfortable' }
                        ].map(preset => (
                            <button
                                key={preset.id}
                                onClick={() => setLayoutDensity(preset.id)}
                                className={`px-4 py-1.5 rounded-full text-[11px] font-bold transition-all ${layoutDensity === preset.id
                                    ? 'bg-[var(--theme-primary)] text-white shadow-lg shadow-[var(--theme-primary)]/30 scale-105'
                                    : 'text-white/40 hover:text-white'} `}
                            >
                                {preset.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* PREVIEW CANVAS CONTAINER */}
            <div className="flex-grow flex items-center justify-center p-4 relative z-10 overflow-auto custom-scrollbar">
                <motion.div
                    layout
                    initial={false}
                    animate={previewStyles[previewDevice]}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    style={{
                        '--primary-color': previewPrimaryColor,
                        '--font-main': bodyFont || config['--font-main'],
                        '--font-heading': headingFont || config['--font-heading'],
                        '--font-subtitle': subtitleFont || headingFont || config['--font-heading'],
                        '--heading-weight': headingWeight,
                        '--heading-spacing': headingLetterSpacing,
                        '--radius-theme': `${borderRadius}px`,
                        '--border-width': `${borderWidth}px`,
                        '--border-style': borderStyle,
                        '--glass-blur': `${glassBlur}px`,
                        '--glass-opacity': glassOpacity.toString(),
                        '--shadow-intensity': shadowIntensity.toString(),
                        '--texture-opacity': textureOpacity.toString(),
                        '--animation-speed': `${animationSpeed}s`,
                        '--theme-padding': config['--theme-padding'],
                        '--theme-gap': config['--theme-gap'],
                        ...(config['--theme-title'] && { '--theme-title': config['--theme-title'] }),
                        ...(config['--theme-muted'] && { '--theme-muted': config['--theme-muted'] }),
                        ...(config['--theme-card'] && { '--theme-card': config['--theme-card'] }),
                        ...(config['--theme-sidebar'] && { '--theme-sidebar': config['--theme-sidebar'] }),
                        ...(config['--theme-body'] && { '--theme-body': config['--theme-body'] })
                    } as React.CSSProperties}
                    className={`preview-container ${mode} layout-${previewLayoutId.replace('custom-', '')} ${isGeometricCut ? 'is-geometric' : ''} bg-[var(--theme-body)] text-[var(--theme-main)] rounded-[40px] shadow-[0_50px_100px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col relative transition-all duration-500 ${config['--bg-texture'] ? `texture-${config['--bg-texture']}` : ''}`}
                >
                    {/* Mock Browser/App Header */}
                    <div className="h-8 bg-[var(--theme-card)]/80 border-b border-[var(--theme-border)]/50 px-6 flex items-center gap-2 shrink-0">
                        <div className="flex gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-rose-500/50"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50"></div>
                        </div>
                        <div className="mx-auto bg-[var(--theme-body)]/50 px-4 py-0.5 rounded-full border border-[var(--theme-border)]/30 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-[var(--theme-primary)] animate-pulse"></div>
                            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-[var(--theme-muted)]/60">sarak.engine/preview</span>
                        </div>
                    </div>

                    {/* Mock Navigation Sidebar */}
                    <div className="flex flex-grow overflow-hidden">
                        <div className="w-16 sm:w-20 bg-[var(--theme-card)]/30 border-r border-[var(--theme-border)] shrink-0 flex flex-col items-center py-6 gap-6">
                            <div className="w-8 h-8 rounded-xl bg-[var(--theme-primary)] flex items-center justify-center text-white shadow-lg shadow-[var(--theme-primary)]/20 mb-4">
                                <Zap className="w-4 h-4" />
                            </div>
                            {[BarChart3, MessageSquare, History, Users, Shield, Database].map((Icon, i) => (
                                <div key={i} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${i === 0 ? 'bg-[var(--theme-primary)]/10 text-[var(--theme-primary)] shadow-sm' : 'text-[var(--theme-muted)] hover:text-[var(--theme-title)] hover:bg-[var(--theme-body)]/50'}`}>
                                    <Icon className="w-4 h-4" />
                                </div>
                            ))}
                        </div>

                        {/* App Content Area */}
                        <div className="flex-grow flex flex-col overflow-hidden">
                            <div className="h-14 border-b border-[var(--theme-border)] bg-[var(--theme-card)]/30 px-6 flex items-center justify-between shrink-0">
                                <div className="flex gap-4">
                                    {[
                                        { id: 'dashboard', icon: EMOJI_SETS[previewEmojiSet]?.dashboard || <BarChart3 className="w-3.5 h-3.5" />, label: 'Dash' },
                                        { id: 'chat', icon: EMOJI_SETS[previewEmojiSet]?.analises || <MessageSquare className="w-3.5 h-3.5" />, label: 'Chat' },
                                        { id: 'logs', icon: EMOJI_SETS[previewEmojiSet]?.audit || <History className="w-3.5 h-3.5" />, label: 'Logs' },
                                        { id: 'settings', icon: EMOJI_SETS[previewEmojiSet]?.settings || <Settings2 className="w-3.5 h-3.5" />, label: 'Config' }
                                    ].map(app => (
                                        <button
                                            key={app.id}
                                            onClick={() => setActivePreviewApp(app.id)}
                                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all text-[10px] font-bold ${activePreviewApp === app.id ? 'bg-[var(--theme-primary)]/10 text-[var(--theme-primary)] shadow-sm border border-[var(--theme-primary)]/20' : 'text-[var(--theme-muted)] hover:text-[var(--theme-title)]'}`}
                                        >
                                            <span className="shrink-0">{app.icon}</span>
                                            <span className="hidden sm:inline">{app.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div
                                className="flex-grow overflow-auto relative"
                                style={{ padding: "var(--theme-padding)" as any }}
                            >
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={activePreviewApp}
                                        initial={(THEME_EFFECTS as any).page[previewAnimationStyle]?.page?.initial || (THEME_EFFECTS as any).page.none.page.initial}
                                        animate={(THEME_EFFECTS as any).page[previewAnimationStyle]?.page?.animate || (THEME_EFFECTS as any).page.none.page.animate}
                                        exit={(THEME_EFFECTS as any).page[previewAnimationStyle]?.page?.exit || (THEME_EFFECTS as any).page.none.page.exit}
                                        transition={(THEME_EFFECTS as any).page[previewAnimationStyle]?.page?.transition || (THEME_EFFECTS as any).page.none.page.transition}
                                        className="flex flex-col h-full"
                                    >
                                        {renderApp()}
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            <div className="flex justify-end pr-4 opacity-40 relative z-10 pb-4">
                <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--theme-muted)]">
                    <span>MODO: {previewLayoutId.toUpperCase()}</span>
                    <span>APP: {activePreviewApp.toUpperCase()}</span>
                </div>
            </div>
        </div >
    );
};
