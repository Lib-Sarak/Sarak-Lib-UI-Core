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
                        <span className="text-2xs font-black text-[var(--sarak-primary-color,#3b82f6)] uppercase tracking-[0.2em]" style={{ marginBottom: 'calc(var(--sarak-layout-gap-md,16px)*0.25)' }}>
                            {String(getVal(item, mapping?.subtitle) || 'Modelo')}
                        </span>
                        <h4 className="text-xl font-black text-[var(--color-theme-title,#ffffff)] tracking-tight group-hover:text-[var(--sarak-primary-color,#3b82f6)] transition-colors">
                            {String(getVal(item, mapping?.title) || '')}
                        </h4>
                    </div>
                    <div className="bg-[var(--color-theme-card,#1e293b)] border-[var(--border-color,#334155)]" style={{ padding: 'calc(var(--sarak-layout-gap-md,16px) / 2)', borderRadius: 'var(--sarak-card-radius,12px)' }}>
                        {mapping?.icon && LucideIcons[mapping.icon as keyof typeof LucideIcons] ? (
                            React.createElement(LucideIcons[mapping.icon as keyof typeof LucideIcons] as React.ElementType, { size: 20, className: "text-[var(--text-muted,#94a3b8)]" })
                        ) : <Box size={20} className="text-[var(--text-muted,#94a3b8)]" />}
                    </div>
                </div>

                <div className={`${getFlexStyles('column', 'flex-start', 'stretch', 'var(--sarak-layout-gap-md,16px)').className}`} style={{ ...getFlexStyles('column', 'flex-start', 'stretch', 'var(--sarak-layout-gap-md,16px)').style, marginBottom: 'var(--sarak-layout-gap-lg,24px)' }}>
                    <div className="flex flex-wrap" style={{ gap: 'var(--sarak-layout-gap-sm,8px)' }}>
                        <span className="text-3xs font-black text-white/20 uppercase w-full" style={{ marginBottom: 'calc(var(--sarak-layout-gap-md,16px)*0.25)' }}>Input Capacities</span>
                        {(inputCaps as string[]).map((cap: string) => (
                            <div key={cap} className="flex items-center bg-[var(--sarak-primary-color-bg,rgba(59,130,246,0.1))] text-[var(--sarak-primary-color,#3b82f6)] border border-[var(--border-color,#334155)] text-2xs font-black uppercase" style={{ gap: 'calc(var(--sarak-layout-gap-md,16px)*0.25)', padding: 'calc(var(--sarak-layout-gap-md,16px) / 4) calc(var(--sarak-layout-gap-md,16px) / 1.5)', borderRadius: 'var(--sarak-card-radius,12px)' }}>
                                {getCapIcon(cap)} {cap}
                            </div>
                        ))}
                    </div>

                    {(outputCaps as string[]).length > 0 && (
                        <div className="flex flex-wrap" style={{ gap: 'var(--sarak-layout-gap-sm,8px)' }}>
                            <span className="text-3xs font-black text-white/20 uppercase w-full" style={{ marginBottom: 'calc(var(--sarak-layout-gap-md,16px)*0.25)' }}>Output Capacities</span>
                            {(outputCaps as string[]).map((cap: string) => (
                                <div key={cap} className="flex items-center bg-[var(--sarak-primary-color-bg,rgba(59,130,246,0.1))] text-[var(--sarak-primary-color,#3b82f6)] border border-[var(--border-color,#334155)] text-2xs font-black uppercase" style={{ gap: 'calc(var(--sarak-layout-gap-md,16px)*0.25)', padding: 'calc(var(--sarak-layout-gap-md,16px) / 4) calc(var(--sarak-layout-gap-md,16px) / 1.5)', borderRadius: 'var(--sarak-card-radius,12px)' }}>
                                    {getCapIcon(cap)} {cap}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className={`${getGridStyles('repeat(2, minmax(0, 1fr))', undefined, 'var(--sarak-layout-gap-md,16px)').className} border-t border-[var(--border-color,#334155)]`} style={{ ...getGridStyles('repeat(2, minmax(0, 1fr))', undefined, 'var(--sarak-layout-gap-md,16px)').style, marginBottom: 'var(--sarak-layout-gap-md,16px)', paddingTop: 'calc(var(--sarak-layout-gap-md,16px) * 1.5)' }}>
                    <div className={getFlexStyles('column', 'flex-start', 'stretch', '0').className} style={getFlexStyles('column', 'flex-start', 'stretch', '0').style}>
                        <span className="text-3xs font-black text-[var(--text-muted,#94a3b8)] opacity-50 uppercase tracking-widest" style={{ marginBottom: 'calc(var(--sarak-layout-gap-md,16px)*0.25)' }}>Custo In (1M)</span>
                        <span className="text-sm font-mono text-[var(--sarak-status-success-color,#22c55e)] font-bold">
                            {priceIn !== undefined ? `$${Number(priceIn).toFixed(4)}` : 'N/A'}
                        </span>
                    </div>
                    <div className={getFlexStyles('column', 'flex-start', 'stretch', '0').className} style={getFlexStyles('column', 'flex-start', 'stretch', '0').style}>
                        <span className="text-3xs font-black text-[var(--text-muted,#94a3b8)] opacity-50 uppercase tracking-widest" style={{ marginBottom: 'calc(var(--sarak-layout-gap-md,16px)*0.25)' }}>Custo Out (1M)</span>
                        <span className="text-sm font-mono text-[var(--sarak-status-error-color,#ef4444)] font-bold">
                            {priceOut !== undefined ? `$${Number(priceOut).toFixed(4)}` : 'N/A'}
                        </span>
                    </div>
                    <div className={getFlexStyles('column', 'flex-start', 'stretch', '0').className} style={{ ...getFlexStyles('column', 'flex-start', 'stretch', '0').style, gridColumn: 'span 2 / span 2' }}>
                        <span className="text-3xs font-black text-[var(--text-muted,#94a3b8)] opacity-50 uppercase tracking-widest" style={{ marginBottom: 'calc(var(--sarak-layout-gap-md,16px)*0.25)' }}>Janela de Contexto</span>
                        <span className="text-2xs font-black text-[var(--text-muted,#94a3b8)] uppercase">
                            {context ? `${(Number(context) / 1000)}k tokens` : 'Desconhecida'}
                        </span>
                    </div>
                </div>

                <div className="flex" style={{ gap: 'calc(var(--sarak-layout-gap-md,16px) / 2.5)' }}>
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
                            <div className={getFlexStyles('column', 'flex-start', 'stretch', 'calc(var(--sarak-layout-gap-md,16px) / 1.5)').className} style={{ ...getFlexStyles('column', 'flex-start', 'stretch', 'calc(var(--sarak-layout-gap-md,16px) / 1.5)').style, paddingTop: 'var(--sarak-layout-gap-md,16px)' }}>
                                {!!description && (
                                    <div className="bg-[var(--color-theme-card,#1e293b)] border-[var(--border-color,#334155)] rounded-[var(--sarak-card-radius,12px)]" style={{ padding: 'calc(var(--sarak-layout-gap-md,16px) * 1.5)' }}>
                                        <span className="text-3xs font-black text-[var(--sarak-primary-color,#3b82f6)] uppercase block" style={{ marginBottom: 'var(--sarak-layout-gap-sm,8px)' }}>Descrição Técnica</span>
                                        <p className="text-xs text-[var(--text-muted,#94a3b8)] opacity-70 leading-relaxed font-medium">{String(description)}</p>
                                    </div>
                                )}
                                {!!tokenizer && (
                                    <div className="flex items-center justify-between bg-[var(--color-theme-card,#1e293b)] border-[var(--border-color,#334155)] rounded-[var(--sarak-card-radius,12px)]" style={{ padding: 'var(--sarak-layout-gap-md,16px) calc(var(--sarak-layout-gap-md,16px) * 1.5)' }}>
                                        <span className="text-3xs font-black text-white/30 uppercase">Tokenizer</span>
                                        <span className="text-2xs font-mono text-[var(--sarak-primary-color,#3b82f6)]">{String(tokenizer)}</span>
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
