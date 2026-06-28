import React from 'react';
import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import { Box } from 'lucide-react';
import { useSarakUI } from '../../../core/Provider/SarakUIProvider';
import { useCardLayoutStyles } from './hooks/useCardLayoutStyles';

import { SarakThemePayload } from '../../../core/Provider/types';

interface SarakTitleCardProps<TItem extends Record<string, unknown>> {
    item: TItem;
    mapping?: Record<string, string>;
    className?: string;
    design?: SarakThemePayload;
    label?: string;
}

export const SarakTitleCard = <TItem extends Record<string, unknown>>({ item, mapping, className = '', design: localDesign, label }: SarakTitleCardProps<TItem>) => {
    const globalUI = useSarakUI();
    const design = localDesign || globalUI.design;
    const layout = useCardLayoutStyles(design);

    const getVal = (obj: Record<string, unknown>, path: string | undefined): unknown => {
        if (!path) return undefined;
        try {
            return path.split('.').reduce((acc: unknown, part: string) => (acc as Record<string, unknown>)?.[part], obj);
        } catch (e) { return undefined; }
    };

    const subtitle = getVal(item, mapping?.subtitle) || 'Modelo';
    const title = getVal(item, mapping?.title);
    const context = getVal(item, mapping?.context);
    const inputCaps = getVal(item, mapping?.input_caps) || [];

    const getCapIcon = (cap: string) => {
        switch (cap.toLowerCase()) {
            case 'vision': return <LucideIcons.Eye size={10} />;
            case 'web': return <LucideIcons.Globe size={10} />;
            case 'chat': return <LucideIcons.MessageSquare size={10} />;
            default: return <LucideIcons.Zap size={10} />;
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4, scale: 1.01 }}
            className={`${layout.containerClass} sarak-card bg-[var(--sx-color-surface-base)] border-[var(--sx-color-border-base)] group transition-all relative overflow-hidden ${className}`}
            style={{ 
                transitionDuration: 'var(--animation-speed, 0.4s)',
                padding: 'var(--sarak-card-padding-md, 24px)'
            }}
            data-sx-card-texture-type={String(design.cardTextureType ?? 'none')}
            data-spotlight={Number(design.cardSpotlightOpacity) > 0 ? '1' : '0'}
            data-border-beam={design.borderBeamEnabled ? '1' : '0'}
            data-geometric={Number(design.cardGeometricCut) > 0 ? '1' : '0'}
        >
            {/* Ambient Spotlight */}
            <div className="absolute inset-0 z-0 spotlight-effect pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="border-beam-effect" />

            {/* DRAFT BADGE (v6.3) */}
            {globalUI?.isDrafting && (
                <div className="absolute top-2 left-4 z-40 pointer-events-none flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/60 border border-[var(--sx-color-primary-base)]/20 text-[7px] font-black uppercase tracking-[0.2em] text-[var(--sx-color-primary-base)] shadow-[0_0_10px_rgba(0,242,255,0.05)]">
                    <span className="w-1 h-1 rounded-full bg-[var(--sx-color-primary-base)] animate-pulse" />
                    {label || "Card de Título"}
                </div>
            )}

            <div className={layout.contentClass}>
                {/* Header Layout */}
                <div className={layout.headerClass}>
                    <div className="flex flex-col flex-1 min-w-0 pr-2">
                        <span className="text-[9px] font-black text-[var(--sx-color-primary-base)] uppercase tracking-[0.2em] mb-1">
                            {String(subtitle)}
                        </span>
                        <h4 
                            className="text-[var(--sx-color-text-title)] tracking-tight group-hover:text-[var(--sx-color-primary-base)] transition-colors truncate"
                            style={{ 
                                fontSize: 'var(--sarak-card-title-font-size, 20px)',
                                fontWeight: 'var(--sarak-card-title-font-weight, 900)' as React.CSSProperties['fontWeight'],
                                letterSpacing: 'var(--sarak-card-title-letter-spacing, 0px)',
                                color: 'var(--sarak-card-title-color, var(--theme-title, #ffffff))'
                            }}
                        >
                            {String(title ?? '')}
                        </h4>
                    </div>

                    {/* Glowing Icon Container */}
                    <div 
                        className="bg-[var(--sx-color-surface-base)] border-[var(--sx-color-border-base)] flex items-center justify-center p-3 relative shrink-0 transition-all group-hover:border-[var(--sx-color-primary-base)]"
                        style={{ 
                            borderRadius: 'var(--sarak-grid-radius, 8px)',
                            boxShadow: '0 0 15px var(--sarak-card-title-icon-glow, rgba(0, 242, 255, 0.2))'
                        }}
                    >
                        {mapping?.icon && LucideIcons[mapping.icon as keyof typeof LucideIcons] ? (
                            React.createElement(LucideIcons[mapping.icon as keyof typeof LucideIcons] as React.ElementType, { 
                                size: 18, 
                                className: "text-[var(--sx-color-primary-base)] group-hover:scale-110 transition-transform" 
                            })
                        ) : <Box size={18} className="text-[var(--sx-color-text-muted)]" />}
                    </div>
                </div>

                {/* Minimalist Specs */}
                <div className={layout.footerClass}>
                    <div className="flex flex-col gap-3 w-full">
                        {!!context && (
                        <div className="flex items-center justify-between text-3xs font-black uppercase text-white/40 tracking-wider">
                            <span>Contexto</span>
                            <span className="text-2xs font-mono text-[var(--sx-color-text-muted)]">
                                {Number(context) >= 1000 ? `${(Number(context) / 1000)}k` : String(context)} tokens
                            </span>
                        </div>
                    )}
                    
                    {(inputCaps as string[]).length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[var(--sx-color-border-base)]/30">
                            {(inputCaps as string[]).slice(0, 3).map((cap: string) => (
                                <div 
                                    key={cap} 
                                    className="flex items-center gap-1 bg-[var(--sx-color-primary-surface)] text-[var(--sx-color-primary-base)] border border-[var(--sx-color-border-base)] text-3xs font-black uppercase px-2 py-0.5" 
                                    style={{ borderRadius: 'var(--sarak-border-width, 4px)' }}
                                >
                                    {getCapIcon(cap)}
                                    <span>{cap}</span>
                                </div>
                            ))}
                        </div>
                    )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
