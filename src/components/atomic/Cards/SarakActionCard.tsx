import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, ChevronDown } from 'lucide-react';
import { SarakIcon } from '../Icon/SarakIcon';
import { useSarakUI } from '../../../core/Provider/SarakUIProvider';
import { SarakButton } from '../Buttons/SarakButton';
import { useCardLayoutStyles } from './hooks/useCardLayoutStyles';
import { useStructuralStyles } from '../hooks/useStructuralStyles';

import { SarakThemePayload } from '../../../core/Provider/types';

/** Um par rótulo/valor genérico do painel expansível (Spec 40 §2.5 — dirigido por `mapping.details`). */
interface SarakActionCardDetail {
    label: string;
    value: unknown;
}

export interface SarakActionCardProps<TItem extends Record<string, unknown>> {
    item: TItem;
    mapping?: Record<string, string>;
    className?: string;
    onAction?: (item: TItem) => void;
    design?: SarakThemePayload;
    label?: string;
    /** Texto do botão de ação principal (default: "Executar"). */
    actionLabel?: string;
}

export const SarakActionCard = <TItem extends Record<string, unknown>>({ item, mapping, className = '', onAction, design: localDesign, label, actionLabel = 'Executar' }: SarakActionCardProps<TItem>) => {
    const globalUI = useSarakUI();
    const design = localDesign || globalUI.design;
    const layout = useCardLayoutStyles(design);
    const { getGridStyles, getFlexStyles } = useStructuralStyles();
    const [isExpanded, setIsExpanded] = useState(false);

    const getVal = (obj: Record<string, unknown>, path: string | undefined): unknown => {
        if (!path) return undefined;
        try {
            return path.split('.').reduce((acc: unknown, part: string) => (acc as Record<string, unknown>)?.[part], obj);
        } catch (e) { return undefined; }
    };

    const description = getVal(item, mapping?.description);
    const subtitle = getVal(item, mapping?.subtitle) ?? '';
    const title = getVal(item, mapping?.title);

    // Painel de detalhes 100% dirigido por dado: `mapping.details` aponta para um
    // campo do item contendo um array de pares { label, value } já formatados pelo
    // consumidor (a Sarak não faz aritmética/formatação de domínio — Spec 40 §2.5).
    const rawDetails = getVal(item, mapping?.details);
    const details: SarakActionCardDetail[] = Array.isArray(rawDetails)
        ? rawDetails.filter(
              (entry): entry is SarakActionCardDetail =>
                  !!entry && typeof entry === 'object' && 'label' in entry && 'value' in entry,
          )
        : [];

    // Get Configurations based on design state
    const clickScale = design.cardActionClickScale !== undefined ? Number(design.cardActionClickScale) : 0.96;

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            // plan-41: `@container` plantado aqui porque o painel de detalhes abaixo usa
            // `getGridStyles`/`getFlexStyles` com classe `@min-[…]` (container query) — sem
            // ancestral com `container-type`, ela nunca casava fora do `SarakShell`/painel
            // (achado real em consumidor, `plan-40`).
            className={`@container ${layout.containerClass} sarak-card bg-[var(--color-theme-card,#1e293b)] border-[var(--border-color,#334155)] group transition-all relative overflow-hidden h-fit ${className}`}
            style={{ 
                transitionDuration: 'var(--duration-normal, 0.3s)',
                padding: 'var(--sarak-card-padding-md, 24px)'
            }}
            data-sx-card-texture-type={String(design.cardTextureType ?? 'none')}
            data-spotlight={Number(design.cardSpotlightOpacity) > 0 ? '1' : '0'}
            data-border-beam={design.borderBeamEnabled ? '1' : '0'}
            data-geometric={Number(design.cardGeometricCut) > 0 ? '1' : '0'}
        >
            {/* Ambient Atmosphere */}
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
                    {label || "Card de Interação"}
                </div>
            )}

            <div className={layout.contentClass}>
                {/* Header Info */}
                <div className={layout.headerClass}>
                    <div className="flex flex-1 min-w-0" style={{ flexDirection: 'column' }}>
                        <span className="font-black text-[var(--sarak-primary-color,#3b82f6)] uppercase" style={{ marginBottom: 'calc(var(--sarak-layout-gap-md, 16px) * 0.25)', fontSize: 'var(--sarak-type-scale3xs, 9px)', letterSpacing: 'var(--sarak-tracking-tight, 0.2em)' }}>
                            {String(subtitle)}
                        </span>
                        <h4 className="text-lg font-black text-[var(--color-theme-title,#ffffff)] tracking-tight group-hover:text-[var(--sarak-primary-color,#3b82f6)] transition-colors truncate">
                            {String(title ?? '')}
                        </h4>
                    </div>
                    <div className="bg-[var(--color-theme-card,#1e293b)] border-[var(--border-color,#334155)] shrink-0 rounded-lg" style={{ padding: 'var(--sarak-layout-gap-sm, 8px)' }}>
                        <SarakIcon name={mapping?.icon || 'Box'} size={16} className="text-[var(--text-muted,#94a3b8)]" />
                    </div>
                </div>

                {/* Micro-Details */}
                {!!description && (
                    <p className="text-2xs text-[var(--text-muted,#94a3b8)] opacity-60 leading-relaxed line-clamp-2" style={{ marginBottom: 'var(--sarak-layout-gap-md, 16px)' }}>
                        {String(description)}
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
                        {actionLabel}
                    </SarakButton>

                    {/* Expander Trigger */}
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="bg-[var(--color-theme-card,#1e293b)] border-[var(--border-color,#334155)] text-[var(--text-muted,#94a3b8)] hover:text-[var(--sarak-shadow-glow,rgba(59,130,246,0.5))] hover:border-[var(--theme-secondary-border)] rounded-[var(--sarak-card-radius,12px)] transition-all cursor-pointer flex items-center justify-center"
                        style={{
                            padding: 'calc(var(--sarak-layout-gap-md, 16px) * 0.75)',
                            transitionDuration: 'var(--duration-normal, 0.3s)',
                            borderRadius: design.btnBorderRadius !== undefined ? `${design.btnBorderRadius}px` : 'var(--sarak-card-radius,12px)'
                        }}
                    >
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-[var(--sarak-shadow-glow,rgba(59,130,246,0.5))]' : ''}`} />
                    </motion.button>
                </div>

                {/* Expandable Technical Specifications */}
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                            style={{ marginTop: 'calc(var(--sarak-layout-gap-md, 16px) * 0.75)' }}
                        >
                            <div
                                className="flex border-t border-[var(--border-color,#334155)]/30"
                                style={{ flexDirection: 'column', gap: 'calc(var(--sarak-layout-gap-md, 16px) * 0.75)', paddingTop: 'calc(var(--sarak-layout-gap-md, 16px) * 0.75)' }}
                            >
                                {details.length > 0 && (
                                    <div
                                        className={`${getGridStyles('repeat(2, minmax(0, 1fr))', undefined, 'var(--sarak-layout-gap-sm, 8px)').className} bg-theme-body/30 border border-[var(--border-color,#334155)]/20`}
                                        style={{ ...getGridStyles('repeat(2, minmax(0, 1fr))', undefined, 'var(--sarak-layout-gap-sm, 8px)').style, padding: 'calc(var(--sarak-layout-gap-md, 16px) * 0.75)', borderRadius: 'var(--sarak-card-radius,12px)' }}
                                    >
                                        {details.map((detail, index) => {
                                            const isLastOdd = details.length % 2 === 1 && index === details.length - 1;
                                            return (
                                                <div
                                                    key={`${detail.label}-${index}`}
                                                    className={getFlexStyles('column', 'flex-start', 'stretch', '0').className}
                                                    style={{
                                                        ...getFlexStyles('column', 'flex-start', 'stretch', '0').style,
                                                        gridColumn: isLastOdd ? 'span 2 / span 2' : undefined,
                                                    }}
                                                >
                                                    <span className="font-black text-[var(--text-muted,#94a3b8)] opacity-50 uppercase tracking-widest" style={{ fontSize: 'var(--sarak-type-scale-tiny, 8px)' }}>{detail.label}</span>
                                                    <span className="text-2xs font-mono text-[var(--text-muted,#94a3b8)] font-bold truncate">
                                                        {String(detail.value)}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            
        </motion.div>
    );
};
