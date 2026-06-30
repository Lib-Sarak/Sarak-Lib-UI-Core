import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Box } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useSarakUI } from '../../../../core/Provider/SarakUIProvider';
import { SarakTitleCard } from '../../Cards/SarakTitleCard';
import { SarakActionCard } from '../../Cards/SarakActionCard';
import { SarakSearchCard } from '../../Cards/SarakSearchCard';
import { SarakButton, SarakIconButton } from '../../Buttons';
import { useStructuralStyles } from '../../hooks/useStructuralStyles';

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

    const priceIn = getVal(item, mapping?.price_in || mapping?.price);
    const priceOut = getVal(item, mapping?.price_out);
    const inputCaps = getVal(item, mapping?.input_caps) || [];
    const outputCaps = getVal(item, mapping?.output_caps) || [];
    const context = getVal(item, mapping?.context);
    const description = getVal(item, mapping?.description);
    const tokenizer = getVal(item, mapping?.tokenizer);

    const getCapIcon = (cap: string) => {
        switch (cap.toLowerCase()) {
            case 'vision': return <LucideIcons.Eye size={10} />;
            case 'web': return <LucideIcons.Globe size={10} />;
            case 'chat': return <LucideIcons.MessageSquare size={10} />;
            default: return <LucideIcons.Zap size={10} />;
        }
    };

    const rootFlex = getFlexStyles('column', 'flex-start', 'stretch', '0');

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${rootFlex.className} sarak-card bg-[var(--sx-color-surface-base)] border-[var(--sx-color-border-base)] group transition-all h-fit relative overflow-hidden`}
            style={{ 
                ...rootFlex.style,
                transitionDuration: 'var(--animation-speed, 0.5s)',
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

            
            <div className="p-theme relative z-10" style={{ padding: 'var(--sx-spacing-lg)' }}>

                <div className="flex justify-between items-start" style={{ marginBottom: 'calc(var(--sx-spacing-md) / 1.5)' }}>
                    <div className={getFlexStyles('column', 'flex-start', 'stretch', '0').className} style={getFlexStyles('column', 'flex-start', 'stretch', '0').style}>
                        <span className="text-2xs font-black text-[var(--sx-color-primary-base)] uppercase tracking-[0.2em]" style={{ marginBottom: 'var(--sx-spacing-xs)' }}>
                            {String(getVal(item, mapping?.subtitle) || 'Modelo')}
                        </span>
                        <h4 className="text-xl font-black text-[var(--sx-color-text-title)] tracking-tight group-hover:text-[var(--sx-color-primary-base)] transition-colors">
                            {String(getVal(item, mapping?.title) || '')}
                        </h4>
                    </div>
                    <div className="bg-[var(--sx-color-surface-base)] border-[var(--sx-color-border-base)]" style={{ padding: 'calc(var(--sx-spacing-md) / 2)', borderRadius: 'var(--sx-radius-md)' }}>
                        {mapping?.icon && LucideIcons[mapping.icon as keyof typeof LucideIcons] ? (
                            React.createElement(LucideIcons[mapping.icon as keyof typeof LucideIcons] as React.ElementType, { size: 20, className: "text-[var(--sx-color-text-muted)]" })
                        ) : <Box size={20} className="text-[var(--sx-color-text-muted)]" />}
                    </div>
                </div>

                <div className={`${getFlexStyles('column', 'flex-start', 'stretch', 'var(--sx-spacing-md)').className}`} style={{ ...getFlexStyles('column', 'flex-start', 'stretch', 'var(--sx-spacing-md)').style, marginBottom: 'var(--sx-spacing-lg)' }}>
                    <div className="flex flex-wrap" style={{ gap: 'var(--sx-spacing-sm)' }}>
                        <span className="text-3xs font-black text-white/20 uppercase w-full" style={{ marginBottom: 'var(--sx-spacing-xs)' }}>Input Capacities</span>
                        {(inputCaps as string[]).map((cap: string) => (
                            <div key={cap} className="flex items-center bg-[var(--sx-color-primary-surface)] text-[var(--sx-color-primary-base)] border border-[var(--sx-color-border-base)] text-2xs font-black uppercase" style={{ gap: 'var(--sx-spacing-xs)', padding: 'calc(var(--sx-spacing-md) / 4) calc(var(--sx-spacing-md) / 1.5)', borderRadius: 'var(--sx-radius-md)' }}>
                                {getCapIcon(cap)} {cap}
                            </div>
                        ))}
                    </div>

                    {(outputCaps as string[]).length > 0 && (
                        <div className="flex flex-wrap" style={{ gap: 'var(--sx-spacing-sm)' }}>
                            <span className="text-3xs font-black text-white/20 uppercase w-full" style={{ marginBottom: 'var(--sx-spacing-xs)' }}>Output Capacities</span>
                            {(outputCaps as string[]).map((cap: string) => (
                                <div key={cap} className="flex items-center bg-[var(--sx-color-primary-surface)] text-[var(--sx-color-primary-base)] border border-[var(--sx-color-border-base)] text-2xs font-black uppercase" style={{ gap: 'var(--sx-spacing-xs)', padding: 'calc(var(--sx-spacing-md) / 4) calc(var(--sx-spacing-md) / 1.5)', borderRadius: 'var(--sx-radius-md)' }}>
                                    {getCapIcon(cap)} {cap}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className={`${getGridStyles('repeat(2, minmax(0, 1fr))', undefined, 'var(--sx-spacing-md)').className} border-t border-[var(--sx-color-border-base)]`} style={{ ...getGridStyles('repeat(2, minmax(0, 1fr))', undefined, 'var(--sx-spacing-md)').style, marginBottom: 'var(--sx-spacing-md)', paddingTop: 'calc(var(--sx-spacing-md) * 1.5)' }}>
                    <div className={getFlexStyles('column', 'flex-start', 'stretch', '0').className} style={getFlexStyles('column', 'flex-start', 'stretch', '0').style}>
                        <span className="text-3xs font-black text-[var(--sx-color-text-muted)] opacity-50 uppercase tracking-widest" style={{ marginBottom: 'var(--sx-spacing-xs)' }}>Custo In (1M)</span>
                        <span className="text-sm font-mono text-[var(--sx-color-success-base)] font-bold">
                            {priceIn !== undefined ? `$${Number(priceIn).toFixed(4)}` : 'N/A'}
                        </span>
                    </div>
                    <div className={getFlexStyles('column', 'flex-start', 'stretch', '0').className} style={getFlexStyles('column', 'flex-start', 'stretch', '0').style}>
                        <span className="text-3xs font-black text-[var(--sx-color-text-muted)] opacity-50 uppercase tracking-widest" style={{ marginBottom: 'var(--sx-spacing-xs)' }}>Custo Out (1M)</span>
                        <span className="text-sm font-mono text-[var(--sx-color-danger-base)] font-bold">
                            {priceOut !== undefined ? `$${Number(priceOut).toFixed(4)}` : 'N/A'}
                        </span>
                    </div>
                    <div className={getFlexStyles('column', 'flex-start', 'stretch', '0').className} style={{ ...getFlexStyles('column', 'flex-start', 'stretch', '0').style, gridColumn: 'span 2 / span 2' }}>
                        <span className="text-3xs font-black text-[var(--sx-color-text-muted)] opacity-50 uppercase tracking-widest" style={{ marginBottom: 'var(--sx-spacing-xs)' }}>Janela de Contexto</span>
                        <span className="text-2xs font-black text-[var(--sx-color-text-muted)] uppercase">
                            {context ? `${(Number(context) / 1000)}k tokens` : 'Desconhecida'}
                        </span>
                    </div>
                </div>

                <div className="flex" style={{ gap: 'calc(var(--sx-spacing-md) / 2.5)' }}>
                    <SarakButton 
                        onClick={() => setIsExpanded(!isExpanded)}
                        variant="secondary"
                        className="flex-1"
                    >
                        <LucideIcons.ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        {isExpanded ? 'Fechar' : 'Ver Specs'}
                    </SarakButton>
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
                            <div className={getFlexStyles('column', 'flex-start', 'stretch', 'calc(var(--sx-spacing-md) / 1.5)').className} style={{ ...getFlexStyles('column', 'flex-start', 'stretch', 'calc(var(--sx-spacing-md) / 1.5)').style, paddingTop: 'var(--sx-spacing-md)' }}>
                                {!!description && (
                                    <div className="bg-[var(--sx-color-surface-base)] border-[var(--sx-color-border-base)] rounded-[var(--sx-radius-md)]" style={{ padding: 'calc(var(--sx-spacing-md) * 1.5)' }}>
                                        <span className="text-3xs font-black text-[var(--sx-color-primary-base)] uppercase block" style={{ marginBottom: 'var(--sx-spacing-sm)' }}>Descrição Técnica</span>
                                        <p className="text-xs text-[var(--sx-color-text-muted)] opacity-70 leading-relaxed font-medium">{String(description)}</p>
                                    </div>
                                )}
                                {!!tokenizer && (
                                    <div className="flex items-center justify-between bg-[var(--sx-color-surface-base)] border-[var(--sx-color-border-base)] rounded-[var(--sx-radius-md)]" style={{ padding: 'var(--sx-spacing-md) calc(var(--sx-spacing-md) * 1.5)' }}>
                                        <span className="text-3xs font-black text-white/30 uppercase">Tokenizer</span>
                                        <span className="text-2xs font-mono text-[var(--sx-color-primary-base)]">{String(tokenizer)}</span>
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
