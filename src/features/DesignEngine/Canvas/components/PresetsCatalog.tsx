import React from 'react';
import { motion } from 'framer-motion';
import { GLOBAL_THEMES, ThemePreset } from '../../../../core/Design/presets/themes';
import { syncThemeWithMode } from '../../../../core/Design/presets/themes/color-engine';
import { useDesignVariables } from '../../../../core/Design/hooks/useDesignVariables';
import { Sparkles, ArrowRight, Layout, Moon, Sun } from 'lucide-react';

interface PresetsCatalogProps {
    onApplyPreset: (presetDesign: Record<string, any>) => void;
    activeCategory: string | null;
    currentMode: string;
}

export const PresetsCatalog: React.FC<PresetsCatalogProps> = ({ onApplyPreset, activeCategory, currentMode }) => {
    
    // Filtro futuro: Se o activeCategory for de um módulo específico, poderemos filtrar temas granulares.
    // Por enquanto, mostraremos os temas globais.
    const themes = GLOBAL_THEMES;

    return (
        <div className="w-full h-full flex flex-col relative bg-[#0c0c0d]">
            {/* Header */}
            <div className="px-8 py-5 border-b border-white/5 flex items-center justify-between bg-black/40 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-[var(--theme-primary)]/10 rounded-xl border border-[var(--theme-primary)]/20 shadow-[0_0_20px_rgba(var(--theme-primary-rgb),0.2)]">
                        <Sparkles size={18} className="text-[var(--theme-primary)]" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-black uppercase text-white tracking-[0.3em]">Design Intelligence Catalog</span>
                        <span className="text-[9px] font-bold text-[var(--theme-primary)] uppercase tracking-widest mt-0.5">
                            {activeCategory ? `Pillar: ${activeCategory}` : 'Temas Globais'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Presets Grid */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-[radial-gradient(ellipse_at_top_right,rgba(var(--theme-primary-rgb),0.03)_0%,transparent_50%)]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {themes.map((theme, i) => (
                        <PresetCard key={theme.id} theme={theme} currentMode={currentMode} onApply={() => onApplyPreset(syncThemeWithMode(theme.design, currentMode as 'light' | 'dark'))} index={i} />
                    ))}
                </div>
            </div>
        </div>
    );
};

const PresetCard = ({ theme, currentMode, onApply, index }: { theme: ThemePreset, currentMode: string, onApply: () => void, index: number }) => {
    // Calcula o design final na hora baseando-se no modo atual do sistema
    const design = syncThemeWithMode(theme.design, currentMode as 'light' | 'dark');
    const { variables, attributes } = useDesignVariables(design);
    
    const primary = design.colorPrimary || '#3b82f6';
    const secondary = design.colorSecondary || '#8b5cf6';
    const bgBase = design.colorSurface || '#000000';
    const isLight = design.mode === 'light';

    return (
        <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={onApply}
            className="group relative flex flex-col text-left rounded-2xl border border-white/10 overflow-hidden bg-black/20 hover:bg-black/40 transition-all duration-300 hover:border-white/20 hover:shadow-[0_10px_40px_-10px_rgba(var(--theme-primary-rgb),0.1)] focus:outline-none"
        >
            {/* Top Showcase Area */}
            <div 
                className="h-28 w-full relative flex flex-col justify-end p-4 transition-colors overflow-hidden"
                style={{ backgroundColor: bgBase, ...variables as any }}
                {...attributes as any}
            >
                {/* Floating Elements / Micro-preview */}
                <div className="absolute top-4 right-4 flex gap-1">
                    <div className="w-5 h-5 shadow-lg" style={{ backgroundColor: primary, borderRadius: design.buttonRadius || '999px' }} />
                    <div className="w-5 h-5 shadow-lg -ml-2" style={{ backgroundColor: secondary, borderRadius: design.buttonRadius || '999px' }} />
                </div>
                
                <div className="absolute top-4 left-4 flex gap-2">
                    {isLight ? (
                        <Sun size={12} className="text-black/50" />
                    ) : (
                        <Moon size={12} className="text-white/50" />
                    )}
                </div>

                <div className="w-full flex justify-center">
                    <div 
                        className="w-4/5 h-14 flex items-center justify-center relative overflow-hidden shadow-2xl transition-all"
                        style={{ 
                            backgroundColor: variables['--sarak-card-background-color'] || (isLight ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.05)'),
                            borderTopWidth: variables['--sarak-card-border-top'] || variables['--sarak-card-border-width'] || '1px',
                            borderRightWidth: variables['--sarak-card-border-right'] || variables['--sarak-card-border-width'] || '1px',
                            borderBottomWidth: variables['--sarak-card-border-bottom'] || variables['--sarak-card-border-width'] || '1px',
                            borderLeftWidth: variables['--sarak-card-border-left'] || variables['--sarak-card-border-width'] || '1px',
                            borderColor: variables['--sarak-card-border-color'] || (isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'),
                            borderStyle: variables['--sarak-border-style'] || 'solid',
                            borderTopLeftRadius: variables['--sarak-card-radius-t-l'] || variables['--sarak-card-border-radius'] || '12px',
                            borderTopRightRadius: variables['--sarak-card-radius-t-r'] || variables['--sarak-card-border-radius'] || '12px',
                            borderBottomRightRadius: variables['--sarak-card-radius-b-r'] || variables['--sarak-card-border-radius'] || '12px',
                            borderBottomLeftRadius: variables['--sarak-card-radius-b-l'] || variables['--sarak-card-border-radius'] || '12px',
                            backdropFilter: `blur(${variables['--sarak-card-backdrop-blur'] || '12px'})`,
                            boxShadow: design.cardShadow && design.cardShadow !== 'none' 
                                ? design.cardShadow 
                                : design.cardShadowSpread 
                                    ? `0 10px ${design.cardShadowSpread}px -5px ${design.cardGlowColor || 'rgba(0,0,0,0.5)'}`
                                    : '0 10px 30px -10px rgba(0,0,0,0.5)',
                            clipPath: variables['--sarak-card-clip-path']
                        }}
                    >
                        {/* Fake Texture Layer if applied */}
                        {design.cardTextureType && design.cardTextureType !== 'none' && (
                            <div 
                                className="absolute inset-0 pointer-events-none opacity-50"
                                style={{
                                    backgroundImage: design.cardTextureType === 'grid' 
                                        ? 'linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)'
                                        : design.cardTextureType === 'noise' 
                                            ? 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")'
                                            : 'none',
                                    backgroundSize: design.cardTextureType === 'grid' ? '8px 8px' : 'auto'
                                }}
                            />
                        )}
                        <span 
                            className="text-[11px] font-bold z-10"
                            style={{ 
                                color: isLight ? '#000' : '#fff',
                                fontFamily: design.fontHeading
                            }}
                        >
                            {design.fontHeading ? design.fontHeading.split(',')[0].replace(/'/g, '') : 'Preview'}
                        </span>
                        <div className="absolute bottom-0 left-0 w-full h-1" style={{ background: `linear-gradient(90deg, ${primary}, ${secondary})` }} />
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="p-4 flex-1 flex flex-col justify-between border-t border-white/5 bg-white/[0.01] group-hover:bg-white/[0.02] transition-colors">
                <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-white mb-1 group-hover:text-[var(--theme-primary)] transition-colors">
                        {theme.name}
                    </h3>
                    <p className="text-[10px] text-white/40 leading-relaxed mb-4 line-clamp-2">
                        {theme.description}
                    </p>
                </div>
                
                <div className="flex items-center gap-2 mt-auto">
                    <div className="px-2 py-1 bg-white/5 rounded text-[8px] font-bold uppercase tracking-widest text-white/30 flex items-center gap-1">
                        <Layout size={8} /> {design.navigationStyle || 'sidebar'}
                    </div>
                    <div className="flex-1" />
                    <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-[var(--theme-primary)] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                        Aplicar <ArrowRight size={10} />
                    </div>
                </div>
            </div>
        </motion.button>
    );
};
