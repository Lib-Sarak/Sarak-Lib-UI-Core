import React from 'react';
import { motion } from 'framer-motion';
import { ThemePreset } from '../../../../core/Design/presets/themes';
import { syncThemeWithMode } from '../../../../core/Design/presets/themes/color-engine';
import { useDesignVariables } from '../../../../core/Design/hooks/useDesignVariables';
import { Layout, ArrowRight } from 'lucide-react';

export const PresetCard = ({ theme, currentMode, onApply, index }: { theme: ThemePreset, currentMode: string, onApply: () => void, index: number }) => {
    // Calcula o design final na hora baseando-se no modo atual do sistema
    const design = syncThemeWithMode(theme.design, currentMode as 'light' | 'dark');
    const { variables, attributes } = useDesignVariables(design);

    const primary = design.colorPrimary || 'var(--sarak-accent, #3b82f6)';
    const secondary = design.colorSecondary || 'var(--sarak-accent-alt, #8b5cf6)';
    const bgBase = design.colorSurface || 'var(--sarak-surface-dark, #000000)';
    const isLight = design.mode === 'light';

    const cardStyle = {
        backgroundColor: variables['--sarak-card-background-color'] || (isLight ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.05)'),
        borderTopWidth: variables['--sarak-card-border-top'] || variables['--sarak-card-border-width'] || 'var(--sarak-border-base, 1px)',
        borderRightWidth: variables['--sarak-card-border-right'] || variables['--sarak-card-border-width'] || 'var(--sarak-border-base, 1px)',
        borderBottomWidth: variables['--sarak-card-border-bottom'] || variables['--sarak-card-border-width'] || 'var(--sarak-border-base, 1px)',
        borderLeftWidth: variables['--sarak-card-border-left'] || variables['--sarak-card-border-width'] || 'var(--sarak-border-base, 1px)',
        borderColor: variables['--sarak-card-border-color'] || (isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'),
        borderStyle: variables['--sarak-border-style'] || 'solid',
        borderTopLeftRadius: variables['--sarak-card-radius-t-l'] || variables['--sarak-card-border-radius'] || 'var(--sarak-spacing-md, 12px)',
        borderTopRightRadius: variables['--sarak-card-radius-t-r'] || variables['--sarak-card-border-radius'] || 'var(--sarak-spacing-md, 12px)',
        borderBottomRightRadius: variables['--sarak-card-radius-b-r'] || variables['--sarak-card-border-radius'] || 'var(--sarak-spacing-md, 12px)',
        borderBottomLeftRadius: variables['--sarak-card-radius-b-l'] || variables['--sarak-card-border-radius'] || 'var(--sarak-spacing-md, 12px)',
        backdropFilter: `blur(${variables['--sarak-card-backdrop-blur'] || 'var(--sarak-spacing-md, 12px)'})`,
        boxShadow: design.cardShadow && design.cardShadow !== 'none'
            ? design.cardShadow
            : design.cardShadowSpread
                ? `0 4px ${design.cardShadowSpread}px -2px ${design.cardGlowColor || 'rgba(0,0,0,0.5)'}`
                : '0 4px 10px -2px rgba(0,0,0,0.5)',
        clipPath: variables['--sarak-card-clip-path']
    };

    const textureLayer = design.cardTextureType && design.cardTextureType !== 'none' ? (
        <div
            className="absolute inset-0 pointer-events-none opacity-50"
            style={{
                backgroundImage: design.cardTextureType === 'grid'
                    ? 'linear-gradient(to right, rgba(255,255,255,0.05) var(--sarak-border-base, 1px), transparent var(--sarak-border-base, 1px)), linear-gradient(to bottom, rgba(255,255,255,0.05) var(--sarak-border-base, 1px), transparent var(--sarak-border-base, 1px))'
                    : design.cardTextureType === 'noise'
                        ? 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")'
                        : 'none',
                backgroundSize: design.cardTextureType === 'grid' ? '8px 8px' : 'auto'
            }}
        />
    ) : null;

    return (
        <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={onApply}
            className="group relative flex flex-col text-left rounded-2xl border border-theme-border overflow-hidden bg-theme-card hover:bg-theme-sidebar transition-all duration-300 hover:border-theme-primary/50 hover:shadow-[0_10px_40px_-10px_rgba(var(--theme-primary-rgb),0.1)] focus:outline-none"
        >
            {/* Top Showcase Area - Mini Dashboard */}
            <div
                className="h-48 w-full relative flex transition-colors overflow-hidden"
                style={{ backgroundColor: bgBase, ...variables as any }}
                {...attributes as any}
            >
                {/* Mini Shell Navigation */}
                {design.navigationStyle === 'sidebar' ? (
                    <div className="h-full w-8 flex flex-col items-center py-3 gap-2 border-r z-10 shrink-0 shadow-xl" style={{ borderColor: cardStyle.borderColor as string, backgroundColor: cardStyle.backgroundColor as string }}>
                        <div className="w-4 h-4 rounded-sm mb-3 shadow-lg" style={{ backgroundColor: primary }} />
                        <div className="w-3 h-0.5 rounded-full bg-white/20" />
                        <div className="w-3 h-0.5 rounded-full bg-white/20" />
                        <div className="w-3 h-0.5 rounded-full bg-white/20" />
                    </div>
                ) : (
                    <div className="absolute top-0 left-0 w-full h-6 flex items-center px-4 gap-3 border-b z-10 shadow-xl" style={{ borderColor: cardStyle.borderColor as string, backgroundColor: cardStyle.backgroundColor as string }}>
                        <div className="w-4 h-4 rounded-sm shadow-lg" style={{ backgroundColor: primary }} />
                        <div className="w-12 h-0.5 rounded-full bg-white/20" />
                        <div className="flex-1" />
                        <div className="w-3 h-3 rounded-full bg-white/20" />
                    </div>
                )}

                {/* Mini Content Area */}
                <div className={`flex-1 flex flex-col p-4 gap-3 relative z-0 ${design.navigationStyle === 'topbar' ? 'mt-6' : ''}`}>
                    {/* Header Title */}
                    <div className="flex flex-col gap-1 mb-1">
                        <div className="h-2 w-24 bg-white/50 rounded-full" />
                        <div className="h-1.5 w-16 bg-white/20 rounded-full" />
                    </div>

                    {/* Mini Grid Layout */}
                    <div className="flex-1 flex flex-col gap-3">
                        {/* Top Row: 3 cards */}
                        <div className="flex gap-3 h-[45%]">
                            {/* Card 1: Text */}
                            <div className="flex-1 relative overflow-hidden flex flex-col p-2 gap-1.5 shadow-xl transition-all" style={cardStyle as any}>
                                {textureLayer}
                                <div className="h-1.5 w-10 bg-white/20 rounded-full relative z-10" />
                                <div className="h-2.5 w-16 bg-white/60 rounded-full mt-auto relative z-10" />
                            </div>

                            {/* Card 2: Filter/Toggles */}
                            <div className="flex-[1.2] relative overflow-hidden flex flex-col p-2 gap-1.5 shadow-xl transition-all" style={cardStyle as any}>
                                {textureLayer}
                                <div className="h-1.5 w-12 bg-white/20 rounded-full mb-1 relative z-10" />
                                <div className="flex items-center justify-between mt-auto relative z-10">
                                    <div className="h-1 w-10 bg-white/20 rounded-full" />
                                    <div className="w-4 h-2 rounded-full" style={{ backgroundColor: primary }} />
                                </div>
                                <div className="flex items-center justify-between relative z-10 mt-1">
                                    <div className="h-1 w-8 bg-white/20 rounded-full" />
                                    <div className="w-4 h-2 rounded-full bg-white/10" />
                                </div>
                            </div>

                            {/* Card 3: Status */}
                            <div className="flex-1 relative overflow-hidden flex flex-col p-2 justify-center items-center shadow-xl transition-all" style={cardStyle as any}>
                                {textureLayer}
                                <div className="w-6 h-6 rounded-full border-[2px] border-t-transparent relative z-10" style={{ borderColor: `${secondary} transparent ${secondary} ${secondary}` }} />
                            </div>
                        </div>

                        {/* Bottom Row: 2 cards */}
                        <div className="flex gap-3 h-[55%]">
                            {/* Card 4: Bar Chart */}
                            <div className="flex-[2] relative overflow-hidden flex flex-col p-2 shadow-xl transition-all" style={cardStyle as any}>
                                {textureLayer}
                                <div className="h-1.5 w-16 bg-white/20 rounded-full mb-auto relative z-10" />
                                <div className="flex items-end justify-between gap-1 h-8 px-1 relative z-10 mt-2">
                                    {[40, 70, 30, 90, 50, 80, 60, 45].map((h, i) => (
                                        <div key={i} className="w-full rounded-t-[var(--sarak-border-base, 1px)]" style={{ height: `${h}%`, backgroundColor: primary, opacity: 0.7 + (i * 0.03) }} />
                                    ))}
                                </div>
                            </div>

                            {/* Card 5: Logs */}
                            <div className="flex-1 relative overflow-hidden flex flex-col p-2 gap-1.5 shadow-xl transition-all" style={cardStyle as any}>
                                {textureLayer}
                                <div className="h-1.5 w-12 bg-white/20 rounded-full mb-1.5 relative z-10" />
                                <div className="h-0.5 w-full bg-white/10 rounded-full relative z-10" />
                                <div className="h-0.5 w-4/5 bg-white/10 rounded-full relative z-10" />
                                <div className="h-0.5 w-5/6 bg-white/10 rounded-full relative z-10" />
                                <div className="h-0.5 w-3/4 bg-white/10 rounded-full relative z-10" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Area - Minimalista */}
            <div className="px-4 py-3 flex items-center justify-between border-t border-theme-border bg-theme-sidebar backdrop-blur-md group-hover:bg-theme-topbar transition-colors shrink-0">
                <h3 className="text-xs font-black uppercase tracking-widest text-theme-text group-hover:text-theme-primary transition-colors">
                    {theme.name}
                </h3>

                <div className="flex items-center gap-2">
                    <div className="px-1.5 py-0.5 bg-theme-card rounded text-[8px] font-bold uppercase tracking-widest text-theme-muted flex items-center gap-1">
                        <Layout size={8} /> {design.navigationStyle || 'sidebar'}
                    </div>
                    <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-theme-primary opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                        <ArrowRight size={12} />
                    </div>
                </div>
            </div>
        </motion.button>
    );
};
