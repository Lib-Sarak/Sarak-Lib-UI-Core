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
            className={`${layout.containerClass} sarak-card bg-[var(--color-theme-card,#1e293b)] border-[var(--border-color,#334155)] group transition-all relative overflow-hidden ${className}`}
            style={{ 
                transitionDuration: 'var(--duration-normal, 0.3s)',
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
                <div
                    className="absolute top-2 left-4 z-40 pointer-events-none flex items-center rounded bg-black/60 border border-[var(--sarak-primary-color,#3b82f6)]/20 font-black uppercase text-[var(--sarak-primary-color,#3b82f6)] shadow-[0_0_10px_rgba(0,242,255,0.05)]"
                    style={{
                        gap: 'calc(var(--sarak-layout-gap-md, 16px) * 0.375)',
                        paddingInline: 'var(--sarak-layout-gap-sm, 8px)',
                        paddingBlock: 'calc(var(--sarak-layout-gap-md, 16px) * 0.125)',
                        fontSize: 'var(--sarak-type-scale-micro, 7px)',
                        letterSpacing: 'var(--sarak-tracking-tight, 0.2em)'
                    }}
                >
                    <span className="w-1 h-1 rounded-full bg-[var(--sarak-primary-color,#3b82f6)] animate-pulse" />
                    {label || "Card de Título"}
                </div>
            )}

            <div className={layout.contentClass}>
                {/* Header Layout */}
                <div className={layout.headerClass}>
                    <div className="flex flex-1 min-w-0" style={{ flexDirection: 'column', paddingRight: 'var(--sarak-layout-gap-sm, 8px)' }}>
                        <span className="font-black text-[var(--sarak-primary-color,#3b82f6)] uppercase" style={{ marginBottom: 'calc(var(--sarak-layout-gap-md, 16px) * 0.25)', fontSize: 'var(--sarak-type-scale3xs, 9px)', letterSpacing: 'var(--sarak-tracking-tight, 0.2em)' }}>
                            {String(subtitle)}
                        </span>
                        <h4 
                            className="text-[var(--color-theme-title,#ffffff)] tracking-tight group-hover:text-[var(--sarak-primary-color,#3b82f6)] transition-colors truncate"
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
                        className="bg-[var(--color-theme-card,#1e293b)] border-[var(--border-color,#334155)] flex items-center justify-center relative shrink-0 transition-all group-hover:border-[var(--sarak-primary-color,#3b82f6)]"
                        style={{
                            padding: 'calc(var(--sarak-layout-gap-md, 16px) * 0.75)',
                            borderRadius: 'var(--sarak-card-radius,12px)',
                            boxShadow: '0 0 var(--sarak-card-title-icon-glow-blur, 15px) var(--sarak-card-title-icon-glow, rgba(0, 242, 255, 0.2))'
                        }}
                    >
                        {mapping?.icon && LucideIcons[mapping.icon as keyof typeof LucideIcons] ? (
                            React.createElement(LucideIcons[mapping.icon as keyof typeof LucideIcons] as React.ElementType, { 
                                size: 18, 
                                className: "text-[var(--sarak-primary-color,#3b82f6)] group-hover:scale-110 transition-transform" 
                            })
                        ) : <Box size={18} className="text-[var(--text-muted,#94a3b8)]" />}
                    </div>
                </div>

                {/* Minimalist Specs */}
                <div className={layout.footerClass}>
                    <div className="flex w-full" style={{ flexDirection: 'column', gap: 'calc(var(--sarak-layout-gap-md, 16px) * 0.75)' }}>
                        {!!context && (
                        <div className="flex items-center justify-between text-3xs font-black uppercase text-white/40 tracking-wider">
                            <span>Contexto</span>
                            <span className="text-2xs font-mono text-[var(--text-muted,#94a3b8)]">
                                {Number(context) >= 1000 ? `${(Number(context) / 1000)}k` : String(context)} tokens
                            </span>
                        </div>
                    )}

                    {(inputCaps as string[]).length > 0 && (
                        <div
                            className="flex flex-wrap border-t border-[var(--border-color,#334155)]/30"
                            style={{ gap: 'calc(var(--sarak-layout-gap-md, 16px) * 0.375)', paddingTop: 'var(--sarak-layout-gap-sm, 8px)' }}
                        >
                            {(inputCaps as string[]).slice(0, 3).map((cap: string) => (
                                <div
                                    key={cap}
                                    className="flex items-center bg-[var(--sarak-primary-color-bg,rgba(59,130,246,0.1))] text-[var(--sarak-primary-color,#3b82f6)] border border-[var(--border-color,#334155)] text-3xs font-black uppercase"
                                    style={{
                                        gap: 'calc(var(--sarak-layout-gap-md, 16px) * 0.25)',
                                        paddingInline: 'var(--sarak-layout-gap-sm, 8px)',
                                        paddingBlock: 'calc(var(--sarak-layout-gap-md, 16px) * 0.125)',
                                        borderRadius: 'var(--sarak-border-width, 4px)'
                                    }}
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
