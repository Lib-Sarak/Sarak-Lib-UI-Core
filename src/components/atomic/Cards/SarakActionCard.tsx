import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import { Box, ExternalLink, ChevronDown } from 'lucide-react';
import { useSarakUI } from '../../../core/Provider/SarakUIProvider';

interface SarakActionCardProps {
    item: any;
    mapping: any;
    className?: string;
    onAction?: (item: any) => void;
}

export const SarakActionCard: React.FC<SarakActionCardProps> = ({ item, mapping, className = '', onAction }) => {
    const { design } = useSarakUI();
    const [isExpanded, setIsExpanded] = useState(false);

    const getVal = (obj: any, path: string | undefined) => {
        if (!path) return undefined;
        try {
            return path.split('.').reduce((acc, part) => acc && acc[part], obj);
        } catch (e) { return undefined; }
    };

    const priceIn = getVal(item, mapping?.price_in || mapping?.price);
    const priceOut = getVal(item, mapping?.price_out);
    const context = getVal(item, mapping?.context);
    const description = getVal(item, mapping?.description);
    const tokenizer = getVal(item, mapping?.tokenizer);
    const subtitle = getVal(item, mapping?.subtitle) || 'Modelo';
    const title = getVal(item, mapping?.title);

    // Get Button Style Configurations based on design state
    const btnStyleType = design.btnStyleType || 'matte';
    const btnPulseSpeed = design.btnNeonPulseSpeed !== undefined ? `${design.btnNeonPulseSpeed}s` : '1.5s';
    const btnBlur = design.btnBackdropBlur !== undefined ? `${design.btnBackdropBlur}px` : '8px';

    const getButtonStyles = (): React.CSSProperties => {
        const baseBg = 'var(--sarak-card-action-btn-bg, var(--theme-primary, #00f2ff))';
        
        switch (btnStyleType) {
            case 'neon':
                return {
                    background: baseBg,
                    boxShadow: '0 0 15px var(--sarak-btn-neon-glow-color, rgba(0, 242, 255, 0.4))',
                    animation: `sarak-neon-pulse ${btnPulseSpeed} infinite alternate`,
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                };
            case 'frosted':
                return {
                    background: 'rgba(255, 255, 255, 0.08)',
                    backdropFilter: `blur(${btnBlur})`,
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)'
                };
            case 'borderline':
                return {
                    background: 'transparent',
                    border: `1.5px solid ${baseBg}`,
                    color: baseBg,
                    boxShadow: 'none'
                };
            case 'matte':
            default:
                return {
                    background: baseBg,
                    boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.15), 0 2px 4px rgba(0, 0, 0, 0.2)',
                    border: '1px solid rgba(0, 0, 0, 0.15)'
                };
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex flex-col sarak-card bg-theme-card border-theme group transition-all relative overflow-hidden h-fit ${className}`}
            style={{ 
                transitionDuration: 'var(--animation-speed, 0.4s)',
                padding: design.cardPadding ? `${design.cardPadding}px` : 'var(--sarak-card-padding-md, 24px)'
            }}
            data-sx-card-texture-type={design.cardTextureType || design.cardTexture || 'none'}
            data-spotlight={design.cardSpotlight > 0 ? '1' : '0'}
            data-border-beam={design.borderBeamEnabled ? '1' : '0'}
            data-geometric={(design.cardGeometricCut > 0 || design.isGeometricCut) ? '1' : '0'}
        >
            {/* Ambient Atmosphere */}
            <div className="absolute inset-0 z-0 spotlight-effect pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="border-beam-effect" />

            <div className="relative z-10 flex flex-col h-full justify-between">
                {/* Header Info */}
                <div className="flex justify-between items-start mb-4">
                    <div className="flex flex-col flex-1 min-w-0">
                        <span className="text-[9px] font-black text-[var(--theme-primary)] uppercase tracking-[0.2em] mb-1">
                            {subtitle}
                        </span>
                        <h4 className="text-lg font-black text-[var(--theme-title)] tracking-tight group-hover:text-[var(--theme-primary)] transition-colors truncate">
                            {title}
                        </h4>
                    </div>
                    <div className="bg-theme-card border-theme p-2 shrink-0 rounded-lg">
                        {mapping?.icon && LucideIcons[mapping.icon as keyof typeof LucideIcons] ? (
                            React.createElement(LucideIcons[mapping.icon as keyof typeof LucideIcons] as any, { 
                                size: 16, 
                                className: "text-[var(--theme-muted)]" 
                            })
                        ) : <Box size={16} className="text-[var(--theme-muted)]" />}
                    </div>
                </div>

                {/* Micro-Details */}
                {description && (
                    <p className="text-2xs text-[var(--theme-text)] opacity-60 leading-relaxed line-clamp-2 mb-4">
                        {description}
                    </p>
                )}

                {/* Primary Actions Grid */}
                <div className="flex gap-2" style={{ marginTop: 'auto' }}>
                    {/* Specialized Action Button */}
                    <motion.button 
                        whileHover={{ scale: design.btnHoverScale || 1.02 }}
                        whileTap={{ scale: 'var(--sarak-card-action-click-scale, 0.96)' as any }}
                        onClick={() => onAction && onAction(item)}
                        className="flex-1 py-3 text-white text-3xs font-black uppercase tracking-widest transition-all rounded-theme flex items-center justify-center gap-1.5 cursor-pointer"
                        style={{ 
                            ...getButtonStyles(),
                            transitionDuration: 'var(--animation-speed, 0.2s)',
                            borderRadius: design.btnBorderRadius !== undefined ? `${design.btnBorderRadius}px` : 'var(--sarak-grid-radius, 8px)'
                        }}
                    >
                        <span>Executar</span>
                        <ExternalLink size={10} className="stroke-[3]" />
                    </motion.button>

                    {/* Expander Trigger */}
                    <motion.button 
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-3 bg-theme-card border-theme text-[var(--theme-muted)] hover:text-[var(--theme-secondary)] hover:border-[var(--theme-secondary-border)] rounded-theme transition-all cursor-pointer flex items-center justify-center"
                        style={{ 
                            transitionDuration: 'var(--animation-speed, 0.3s)',
                            borderRadius: design.btnBorderRadius !== undefined ? `${design.btnBorderRadius}px` : 'var(--sarak-grid-radius, 8px)'
                        }}
                    >
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-[var(--theme-secondary)]' : ''}`} />
                    </motion.button>
                </div>

                {/* Expandable Technical Specifications */}
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden mt-3"
                        >
                            <div className="flex flex-col gap-3 pt-3 border-t border-theme/30">
                                <div className="grid grid-cols-2 gap-2 bg-theme-body/30 p-3 border border-theme/20" style={{ borderRadius: 'var(--sarak-grid-radius, 8px)' }}>
                                    <div className="flex flex-col">
                                        <span className="text-[8px] font-black text-[var(--theme-muted)] opacity-50 uppercase tracking-widest">Custo In (1M)</span>
                                        <span className="text-2xs font-mono text-[var(--theme-success)] font-bold">
                                            {priceIn !== undefined ? `$${Number(priceIn).toFixed(4)}` : 'N/A'}
                                        </span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[8px] font-black text-[var(--theme-muted)] opacity-50 uppercase tracking-widest">Custo Out (1M)</span>
                                        <span className="text-2xs font-mono text-[var(--theme-warning)] font-bold">
                                            {priceOut !== undefined ? `$${Number(priceOut).toFixed(4)}` : 'N/A'}
                                        </span>
                                    </div>
                                    <div className="flex flex-col col-span-2 pt-1.5 border-t border-theme/10">
                                        <span className="text-[8px] font-black text-[var(--theme-muted)] opacity-50 uppercase tracking-widest">Janela / Tokenizer</span>
                                        <span className="text-3xs font-black text-[var(--theme-text)] uppercase truncate">
                                            {context ? `${(Number(context) / 1000)}k tokens` : 'Default'}
                                            {tokenizer ? ` | ${tokenizer}` : ''}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            
            {/* Inline pulse keyframe styles if using neon button */}
            {btnStyleType === 'neon' && (
                <style dangerouslySetInnerHTML={{__html: `
                    @keyframes sarak-neon-pulse {
                        from {
                            box-shadow: 0 0 10px var(--sarak-btn-neon-glow-color, rgba(0, 242, 255, 0.4));
                            filter: brightness(1);
                        }
                        to {
                            box-shadow: 0 0 20px var(--sarak-btn-neon-glow-color, rgba(0, 242, 255, 0.6));
                            filter: brightness(1.15);
                        }
                    }
                `}} />
            )}
        </motion.div>
    );
};
