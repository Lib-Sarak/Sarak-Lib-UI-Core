import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import { Box, ExternalLink, ChevronDown } from 'lucide-react';
import { useSarakUI } from '../../../core/Provider/SarakUIProvider';
import { SarakButton } from '../Buttons/SarakButton';
import { useCardLayoutStyles } from './hooks/useCardLayoutStyles';

interface SarakActionCardProps {
    item: any;
    mapping: any;
    className?: string;
    onAction?: (item: any) => void;
    design?: any;
    label?: string;
}

export const SarakActionCard: React.FC<SarakActionCardProps> = ({ item, mapping, className = '', onAction, design: localDesign, label }) => {
    const globalUI = useSarakUI();
    const design = localDesign || globalUI.design;
    const layout = useCardLayoutStyles(design);
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

    // Get Configurations based on design state
    const clickScale = design.cardActionClickScale !== undefined ? Number(design.cardActionClickScale) : 0.96;

    return (
        <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${layout.containerClass} sarak-card bg-[var(--sx-color-surface-base)] border-[var(--sx-color-border-base)] group transition-all relative overflow-hidden h-fit ${className}`}
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

            {/* DRAFT BADGE (v6.3) */}
            {globalUI?.isDrafting && (
                <div className="absolute top-2 left-4 z-40 pointer-events-none flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/60 border border-[var(--sx-color-primary-base)]/20 text-[7px] font-black uppercase tracking-[0.2em] text-[var(--sx-color-primary-base)] shadow-[0_0_10px_rgba(0,242,255,0.05)]">
                    <span className="w-1 h-1 rounded-full bg-[var(--sx-color-primary-base)] animate-pulse" />
                    {label || "Card de Interação"}
                </div>
            )}

            <div className={layout.contentClass}>
                {/* Header Info */}
                <div className={layout.headerClass}>
                    <div className="flex flex-col flex-1 min-w-0">
                        <span className="text-[9px] font-black text-[var(--sx-color-primary-base)] uppercase tracking-[0.2em] mb-1">
                            {subtitle}
                        </span>
                        <h4 className="text-lg font-black text-[var(--sx-color-text-title)] tracking-tight group-hover:text-[var(--sx-color-primary-base)] transition-colors truncate">
                            {title}
                        </h4>
                    </div>
                    <div className="bg-[var(--sx-color-surface-base)] border-[var(--sx-color-border-base)] p-2 shrink-0 rounded-lg">
                        {mapping?.icon && LucideIcons[mapping.icon as keyof typeof LucideIcons] ? (
                            React.createElement(LucideIcons[mapping.icon as keyof typeof LucideIcons] as any, { 
                                size: 16, 
                                className: "text-[var(--sx-color-text-muted)]" 
                            })
                        ) : <Box size={16} className="text-[var(--sx-color-text-muted)]" />}
                    </div>
                </div>

                {/* Micro-Details */}
                {description && (
                    <p className="text-2xs text-[var(--sx-color-text-muted)] opacity-60 leading-relaxed line-clamp-2 mb-4">
                        {description}
                    </p>
                )}

                {/* Primary Actions Grid */}
                <div className={layout.footerClass}>
                    {/* Specialized Action Button */}
                    <SarakButton 
                        variant="primary"
                        onClick={() => onAction && onAction(item)}
                        rightIcon={<ExternalLink size={10} className="stroke-[3]" />}
                        className="flex-1 text-3xs font-black uppercase tracking-widest"
                    >
                        Executar
                    </SarakButton>

                    {/* Expander Trigger */}
                    <motion.button 
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-3 bg-[var(--sx-color-surface-base)] border-[var(--sx-color-border-base)] text-[var(--sx-color-text-muted)] hover:text-[var(--sx-color-primary-glow)] hover:border-[var(--theme-secondary-border)] rounded-[var(--sx-radius-md)] transition-all cursor-pointer flex items-center justify-center"
                        style={{ 
                            transitionDuration: 'var(--animation-speed, 0.3s)',
                            borderRadius: design.btnBorderRadius !== undefined ? `${design.btnBorderRadius}px` : 'var(--sarak-grid-radius, 8px)'
                        }}
                    >
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-[var(--sx-color-primary-glow)]' : ''}`} />
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
                            <div className="flex flex-col gap-3 pt-3 border-t border-[var(--sx-color-border-base)]/30">
                                <div className="grid grid-cols-2 gap-2 bg-theme-body/30 p-3 border border-[var(--sx-color-border-base)]/20" style={{ borderRadius: 'var(--sarak-grid-radius, 8px)' }}>
                                    <div className="flex flex-col">
                                        <span className="text-[8px] font-black text-[var(--sx-color-text-muted)] opacity-50 uppercase tracking-widest">Custo In (1M)</span>
                                        <span className="text-2xs font-mono text-[var(--sx-color-success-base)] font-bold">
                                            {priceIn !== undefined ? `$${Number(priceIn).toFixed(4)}` : 'N/A'}
                                        </span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[8px] font-black text-[var(--sx-color-text-muted)] opacity-50 uppercase tracking-widest">Custo Out (1M)</span>
                                        <span className="text-2xs font-mono text-[var(--sx-color-danger-base)] font-bold">
                                            {priceOut !== undefined ? `$${Number(priceOut).toFixed(4)}` : 'N/A'}
                                        </span>
                                    </div>
                                    <div className="flex flex-col col-span-2 pt-1.5 border-t border-[var(--sx-color-border-base)]/10">
                                        <span className="text-[8px] font-black text-[var(--sx-color-text-muted)] opacity-50 uppercase tracking-widest">Janela / Tokenizer</span>
                                        <span className="text-3xs font-black text-[var(--sx-color-text-muted)] uppercase truncate">
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
            
        </motion.div>
    );
};
