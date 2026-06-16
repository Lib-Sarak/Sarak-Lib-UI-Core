import React from 'react';
import { motion } from 'framer-motion';
import { CARD_PRESETS, ComponentPreset } from '../../../../core/Design/presets/components/cards';
import { useDesignVariables } from '../../../../core/Design/hooks/useDesignVariables';
import { Layout, Check, Sparkles } from 'lucide-react';

interface CardsCatalogProps {
    onApplyPreset: (presetDesign: Record<string, any>, isPartial?: boolean) => void;
    currentMode: string;
}

export const CardsCatalog: React.FC<CardsCatalogProps> = ({ onApplyPreset }) => {
    return (
        <div className="w-full h-full flex flex-col relative bg-theme-bg">
            <div className="px-8 py-5 border-b border-theme-border flex items-center justify-between bg-theme-sidebar backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-theme-primary/10 rounded-xl border border-theme-primary/20">
                        <Layout size={18} className="text-theme-primary" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-black uppercase text-theme-text tracking-[0.3em]">Design Intelligence Catalog</span>
                        <span className="text-[9px] font-bold text-theme-primary uppercase tracking-widest mt-0.5">
                            Pilar: Cards & Surfaces
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {CARD_PRESETS.map((preset, i) => (
                        <CardPresetPreview key={preset.id} preset={preset} index={i} onApply={() => onApplyPreset(preset.design, true)} />
                    ))}
                </div>
            </div>
        </div>
    );
};

const CardPresetPreview = ({ preset, index, onApply }: { preset: ComponentPreset, index: number, onApply: () => void }) => {
    // We use a blank dark mode to preview the card shapes neutrally
    const { variables, attributes } = useDesignVariables({ mode: 'dark', ...preset.design });

    const cardStyle = {
        backgroundColor: variables['--sarak-card-background-color'] || 'rgba(255,255,255,0.05)',
        borderTopWidth: variables['--sarak-card-border-top'] || variables['--sarak-card-border-width'] || '1px',
        borderRightWidth: variables['--sarak-card-border-right'] || variables['--sarak-card-border-width'] || '1px',
        borderBottomWidth: variables['--sarak-card-border-bottom'] || variables['--sarak-card-border-width'] || '1px',
        borderLeftWidth: variables['--sarak-card-border-left'] || variables['--sarak-card-border-width'] || '1px',
        borderColor: variables['--sarak-card-border-color'] || 'rgba(255,255,255,0.1)',
        borderStyle: variables['--sarak-border-style'] || 'solid',
        borderTopLeftRadius: variables['--sarak-card-radius-t-l'] || variables['--sarak-card-border-radius'] || '12px',
        borderTopRightRadius: variables['--sarak-card-radius-t-r'] || variables['--sarak-card-border-radius'] || '12px',
        borderBottomRightRadius: variables['--sarak-card-radius-b-r'] || variables['--sarak-card-border-radius'] || '12px',
        borderBottomLeftRadius: variables['--sarak-card-radius-b-l'] || variables['--sarak-card-border-radius'] || '12px',
        backdropFilter: `blur(${variables['--sarak-card-backdrop-blur'] || '12px'})`,
        boxShadow: preset.design.cardShadow && preset.design.cardShadow !== 'none' 
            ? preset.design.cardShadow 
            : preset.design.cardShadowSpread 
                ? `0 4px ${preset.design.cardShadowSpread}px -2px ${preset.design.cardGlowColor || 'rgba(0,0,0,0.5)'}`
                : '0 4px 10px -2px rgba(0,0,0,0.5)',
        clipPath: variables['--sarak-card-clip-path']
    };

    const textureLayer = preset.design.cardTextureType && preset.design.cardTextureType !== 'none' ? (
        <div 
            className="absolute inset-0 pointer-events-none opacity-50"
            style={{
                backgroundImage: preset.design.cardTextureType === 'grid' 
                    ? 'linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)'
                    : preset.design.cardTextureType === 'noise' 
                        ? 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")'
                        : 'none',
                backgroundSize: preset.design.cardTextureType === 'grid' ? '8px 8px' : 'auto'
            }}
        />
    ) : null;

    return (
        <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={onApply}
            className="group flex flex-col text-left rounded-2xl border border-theme-border overflow-hidden bg-theme-card hover:border-theme-primary hover:shadow-[0_10px_40px_-10px_rgba(var(--theme-primary-rgb),0.1)] transition-all duration-300"
        >
            <div className="h-48 w-full relative flex items-center justify-center p-6 bg-[#0a0a0b] overflow-hidden" {...attributes as any}>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.05)_0%,transparent_70%)]" />
                
                {/* O Card Gigante de Preview */}
                <div className="relative w-full max-w-[280px] h-32 flex flex-col p-4 shadow-2xl transition-transform group-hover:scale-105 duration-500 z-10" style={cardStyle as any}>
                    {textureLayer}
                    
                    <div className="flex items-center gap-3 relative z-10">
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                            <Sparkles size={16} className="text-white/50" />
                        </div>
                        <div className="flex flex-col gap-1.5 flex-1">
                            <div className="h-2 w-3/4 bg-white/40 rounded-full" />
                            <div className="h-1.5 w-1/2 bg-white/20 rounded-full" />
                        </div>
                    </div>
                    
                    <div className="mt-auto relative z-10 flex flex-col gap-2">
                        <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full w-2/3 bg-white/40 rounded-full" />
                        </div>
                        <div className="flex justify-between items-center">
                            <div className="h-1.5 w-1/4 bg-white/20 rounded-full" />
                            <div className="h-1.5 w-1/4 bg-white/20 rounded-full" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-4 bg-theme-sidebar">
                <h3 className="text-sm font-bold text-theme-text uppercase tracking-wider">{preset.name}</h3>
                <p className="text-xs text-theme-muted mt-1">{preset.description}</p>
            </div>
        </motion.button>
    );
};
