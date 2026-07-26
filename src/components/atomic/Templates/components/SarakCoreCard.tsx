import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { SarakIcon } from '../../Icon/SarakIcon';
import { useSarakUI } from '../../../../core/Provider/SarakUIProvider';
import { SarakTitleCard } from '../../Cards/SarakTitleCard';
import { SarakActionCard } from '../../Cards/SarakActionCard';
import { SarakSearchCard } from '../../Cards/SarakSearchCard';
import { SarakButton, SarakIconButton } from '../../Buttons';
import { useStructuralStyles } from '../../hooks/useStructuralStyles';

/** Um par rótulo/valor genérico do painel de detalhes (Spec 42 §2.2 — dirigido por `mapping.details`). */
interface SarakCoreCardDetail {
    label: string;
    value: unknown;
}

/** Rótulo literal declarado no `mapping` (não é caminho para campo do item). */
const literal = (mapping: Record<string, string> | undefined, key: string): string | undefined => mapping?.[key];

/**
 * Fileira de chips genérica (usada pelos campos `input_caps`/`output_caps` do `mapping`).
 * O cabeçalho só aparece quando o consumidor declara o rótulo — nenhum texto fixo.
 */
const renderChips = (values: string[], label?: string) => {
    if (!Array.isArray(values) || values.length === 0) return null;
    return (
        <div className="flex flex-wrap" style={{ gap: 'var(--sarak-layout-gap-sm,8px)' }}>
            {!!label && (
                <span className="text-3xs font-black text-white/20 uppercase w-full" style={{ marginBottom: 'calc(var(--sarak-layout-gap-md,16px)*0.25)' }}>{label}</span>
            )}
            {values.map((value: string) => (
                <div key={value} className="flex items-center bg-[var(--sarak-primary-color-bg,rgba(59,130,246,0.1))] text-[var(--sarak-primary-color,#3b82f6)] border border-[var(--border-color,#334155)] text-2xs font-black uppercase" style={{ gap: 'calc(var(--sarak-layout-gap-md,16px)*0.25)', padding: 'calc(var(--sarak-layout-gap-md,16px) / 4) calc(var(--sarak-layout-gap-md,16px) / 1.5)', borderRadius: 'var(--sarak-card-radius,12px)' }}>
                    <SarakIcon name="Zap" size={10} /> {value}
                </div>
            ))}
        </div>
    );
};

export const SarakCoreCard = <TItem extends Record<string, unknown>>({ item, mapping, variant }: { item: TItem; mapping?: Record<string, string>; variant?: 'classic' | 'title' | 'action' | 'search' }) => {
    const { design } = useSarakUI();
    const { getFlexStyles, getGridStyles } = useStructuralStyles();
    const [isExpanded, setIsExpanded] = useState(false);

    if (variant === 'title') {
        return <SarakTitleCard item={item} mapping={mapping} />;
    }
    if (variant === 'action') {
        return <SarakActionCard item={item} mapping={mapping} />;
    }
    if (variant === 'search') {
        return <SarakSearchCard item={item} mapping={mapping} />;
    }

    const getVal = (obj: TItem, path: string | undefined): unknown => {
        if (!path) return undefined;
        try {
            return path.split('.').reduce((acc: unknown, part) => {
                if (acc && typeof acc === 'object') return (acc as Record<string, unknown>)[part];
                return undefined;
            }, obj as unknown);
        } catch (e) { return undefined; }
    };

    const inputCaps = getVal(item, mapping?.input_caps) || [];
    const outputCaps = getVal(item, mapping?.output_caps) || [];
    const description = getVal(item, mapping?.description);

    // Painel de detalhes 100% dirigido por dado: `mapping.details` aponta para um campo
    // do item com um array de pares { label, value } JÁ FORMATADOS pelo consumidor — a
    // Sarak não faz aritmética nem formatação de domínio (Spec 42 §2.2, igual à 30 §2.5).
    const rawDetails = getVal(item, mapping?.details);
    const details: SarakCoreCardDetail[] = Array.isArray(rawDetails)
        ? rawDetails.filter(
              (entry): entry is SarakCoreCardDetail =>
                  !!entry && typeof entry === 'object' && 'label' in entry && 'value' in entry,
          )
        : [];

    const inputCapsLabel = literal(mapping, 'input_caps_label');
    const outputCapsLabel = literal(mapping, 'output_caps_label');
    const descriptionLabel = literal(mapping, 'description_label');
    const expandLabel = literal(mapping, 'expand_label') || 'Ver mais';
    const collapseLabel = literal(mapping, 'collapse_label') || 'Fechar';

    const rootFlex = getFlexStyles('column', 'flex-start', 'stretch', '0');

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${rootFlex.className} sarak-card bg-[var(--color-theme-card,#1e293b)] border-[var(--border-color,#334155)] group transition-all h-fit relative overflow-hidden`}
            style={{ 
                ...rootFlex.style,
                transitionDuration: 'var(--duration-normal, 0.3s)',
                padding: 'var(--sarak-card-padding-md)'
            }}
            data-sx-card-texture-type={(design.cardTextureType as string) || 'none'}
            data-spotlight={Number(design.cardSpotlightOpacity) > 0 ? '1' : '0'}
            data-border-beam={design.borderBeamEnabled ? '1' : '0'}
            data-geometric={Number(design.cardGeometricCut) > 0 ? '1' : '0'}
        >
            {/* Atmosphere Layers (Sovereignty v8.5) */}
            <div className="absolute inset-0 z-0 spotlight-effect pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="border-beam-effect" />

            
            <div className="p-theme relative z-10" style={{ padding: 'var(--sarak-layout-gap-lg,24px)' }}>

                <div className="flex justify-between items-start" style={{ marginBottom: 'calc(var(--sarak-layout-gap-md,16px) / 1.5)' }}>
                    <div className={getFlexStyles('column', 'flex-start', 'stretch', '0').className} style={getFlexStyles('column', 'flex-start', 'stretch', '0').style}>
                        <span className="text-2xs font-black text-[var(--sarak-primary-color,#3b82f6)] uppercase" style={{ marginBottom: 'calc(var(--sarak-layout-gap-md,16px)*0.25)', letterSpacing: 'var(--sarak-tracking-tight, 0.2em)' }}>
                            {String(getVal(item, mapping?.subtitle) ?? '')}
                        </span>
                        <h4 className="text-xl font-black text-[var(--color-theme-title,#ffffff)] tracking-tight group-hover:text-[var(--sarak-primary-color,#3b82f6)] transition-colors">
                            {String(getVal(item, mapping?.title) || '')}
                        </h4>
                    </div>
                    <div className="bg-[var(--color-theme-card,#1e293b)] border-[var(--border-color,#334155)]" style={{ padding: 'calc(var(--sarak-layout-gap-md,16px) / 2)', borderRadius: 'var(--sarak-card-radius,12px)' }}>
                        <SarakIcon name={mapping?.icon || 'Box'} size={20} className="text-[var(--text-muted,#94a3b8)]" />
                    </div>
                </div>

                <div className={`${getFlexStyles('column', 'flex-start', 'stretch', 'var(--sarak-layout-gap-md,16px)').className}`} style={{ ...getFlexStyles('column', 'flex-start', 'stretch', 'var(--sarak-layout-gap-md,16px)').style, marginBottom: 'var(--sarak-layout-gap-lg,24px)' }}>
                    {renderChips(inputCaps as string[], inputCapsLabel)}
                    {renderChips(outputCaps as string[], outputCapsLabel)}
                </div>

                {details.length > 0 && (
                    <div className={`${getGridStyles('repeat(2, minmax(0, 1fr))', undefined, 'var(--sarak-layout-gap-md,16px)').className} border-t border-[var(--border-color,#334155)]`} style={{ ...getGridStyles('repeat(2, minmax(0, 1fr))', undefined, 'var(--sarak-layout-gap-md,16px)').style, marginBottom: 'var(--sarak-layout-gap-md,16px)', paddingTop: 'calc(var(--sarak-layout-gap-md,16px) * 1.5)' }}>
                        {details.map((detail, index) => {
                            const isLastOdd = details.length % 2 === 1 && index === details.length - 1;
                            return (
                                <div
                                    key={`${detail.label}-${index}`}
                                    className={getFlexStyles('column', 'flex-start', 'stretch', '0').className}
                                    style={{ ...getFlexStyles('column', 'flex-start', 'stretch', '0').style, gridColumn: isLastOdd ? 'span 2 / span 2' : undefined }}
                                >
                                    <span className="text-3xs font-black text-[var(--text-muted,#94a3b8)] opacity-50 uppercase tracking-widest" style={{ marginBottom: 'calc(var(--sarak-layout-gap-md,16px)*0.25)' }}>{detail.label}</span>
                                    <span className="text-sm font-mono text-[var(--text-muted,#94a3b8)] font-bold">
                                        {String(detail.value)}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}

                <div className="flex" style={{ gap: 'calc(var(--sarak-layout-gap-md,16px) / 2.5)' }}>
                    {/* O expansor só existe quando há conteúdo expansível (`mapping.description`) —
                        um botão que abre um painel vazio seria resíduo do card de domínio antigo. */}
                    {!!description && (
                        <SarakButton
                            onClick={() => setIsExpanded(!isExpanded)}
                            variant="secondary"
                            className="flex-1"
                        >
                            <SarakIcon name="ChevronDown" size={12} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                            {isExpanded ? collapseLabel : expandLabel}
                        </SarakButton>
                    )}
                    <SarakIconButton 
                        icon={<ExternalLink size={18} />}
                        variant="primary"
                        className="shadow-lg"
                    />
                </div>

                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className={getFlexStyles('column', 'flex-start', 'stretch', 'calc(var(--sarak-layout-gap-md,16px) / 1.5)').className} style={{ ...getFlexStyles('column', 'flex-start', 'stretch', 'calc(var(--sarak-layout-gap-md,16px) / 1.5)').style, paddingTop: 'var(--sarak-layout-gap-md,16px)' }}>
                                {!!description && (
                                    <div className="bg-[var(--color-theme-card,#1e293b)] border-[var(--border-color,#334155)] rounded-[var(--sarak-card-radius,12px)]" style={{ padding: 'calc(var(--sarak-layout-gap-md,16px) * 1.5)' }}>
                                        {!!descriptionLabel && (
                                            <span className="text-3xs font-black text-[var(--sarak-primary-color,#3b82f6)] uppercase block" style={{ marginBottom: 'var(--sarak-layout-gap-sm,8px)' }}>{descriptionLabel}</span>
                                        )}
                                        <p className="text-xs text-[var(--text-muted,#94a3b8)] opacity-70 leading-relaxed font-medium">{String(description)}</p>
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
