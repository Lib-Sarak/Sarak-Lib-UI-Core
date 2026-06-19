import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Box } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useSarakUI } from '../../../../core/Provider/SarakUIProvider';
import { SarakTitleCard } from '../../Cards/SarakTitleCard';
import { SarakActionCard } from '../../Cards/SarakActionCard';
import { SarakSearchCard } from '../../Cards/SarakSearchCard';
import { SarakButton, SarakIconButton } from '../../Buttons';

export const SarakCoreCard = ({ item, mapping, variant }: { item: any; mapping: any; variant?: 'classic' | 'title' | 'action' | 'search' }) => {
    const { design } = useSarakUI();
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

    const getVal = (obj: any, path: string | undefined) => {
        if (!path) return undefined;
        try {
            return path.split('.').reduce((acc, part) => acc && acc[part], obj);
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

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sarak-card bg-[var(--sx-color-surface-base)] border-[var(--sx-color-border-base)] group transition-all h-fit relative overflow-hidden"
            style={{ 
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

                <div className="flex justify-between items-start mb-6" style={{ marginBottom: 'calc(var(--sx-spacing-md) / 1.5)' }}>
                    <div className="flex flex-col">
                        <span className="text-2xs font-black text-[var(--sx-color-primary-base)] uppercase tracking-[0.2em] mb-1">
                            {getVal(item, mapping?.subtitle) || 'Modelo'}
                        </span>
                        <h4 className="text-xl font-black text-[var(--sx-color-text-title)] tracking-tight group-hover:text-[var(--sx-color-primary-base)] transition-colors">
                            {getVal(item, mapping?.title)}
                        </h4>
                    </div>
                    <div className="bg-[var(--sx-color-surface-base)] border-[var(--sx-color-border-base)]" style={{ padding: 'calc(var(--sx-spacing-md) / 2)', borderRadius: 'var(--sx-radius-md)' }}>
                        {mapping?.icon && LucideIcons[mapping.icon as keyof typeof LucideIcons] ? (
                            React.createElement(LucideIcons[mapping.icon as keyof typeof LucideIcons] as any, { size: 20, className: "text-[var(--sx-color-text-muted)]" })
                        ) : <Box size={20} className="text-[var(--sx-color-text-muted)]" />}
                    </div>
                </div>

                <div className="flex flex-col gap-4 mb-8">
                    <div className="flex flex-wrap gap-2">
                        <span className="text-3xs font-black text-white/20 uppercase w-full mb-1">Input Capacities</span>
                        {inputCaps.map((cap: string) => (
                            <div key={cap} className="flex items-center gap-1.5 bg-[var(--sx-color-primary-surface)] text-[var(--sx-color-primary-base)] border border-[var(--sx-color-border-base)] text-2xs font-black uppercase" style={{ padding: 'calc(var(--sx-spacing-md) / 4) calc(var(--sx-spacing-md) / 1.5)', borderRadius: 'var(--sx-radius-md)' }}>
                                {getCapIcon(cap)} {cap}
                            </div>
                        ))}
                    </div>
                    {outputCaps.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            <span className="text-3xs font-black text-white/20 uppercase w-full mb-1">Output Capacities</span>
                            {outputCaps.map((cap: string) => (
                                <div key={cap} className="flex items-center gap-1.5 bg-[var(--sx-color-primary-surface)] text-[var(--sx-color-primary-base)] border border-[var(--sx-color-border-base)] text-2xs font-black uppercase" style={{ padding: 'calc(var(--sx-spacing-md) / 4) calc(var(--sx-spacing-md) / 1.5)', borderRadius: 'var(--sx-radius-md)' }}>
                                    {getCapIcon(cap)} {cap}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 mb-8 pt-6 border-t border-[var(--sx-color-border-base)]" style={{ gap: 'var(--sx-spacing-md)', marginBottom: 'var(--sx-spacing-md)', marginTop: 'var(--sx-spacing-md)' }}>
                    <div className="flex flex-col">
                        <span className="text-3xs font-black text-[var(--sx-color-text-muted)] opacity-50 uppercase tracking-widest mb-1">Custo In (1M)</span>
                        <span className="text-sm font-mono text-[var(--sx-color-success-base)] font-bold">
                            {priceIn !== undefined ? `$${Number(priceIn).toFixed(4)}` : 'N/A'}
                        </span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-3xs font-black text-[var(--sx-color-text-muted)] opacity-50 uppercase tracking-widest mb-1">Custo Out (1M)</span>
                        <span className="text-sm font-mono text-[var(--sx-color-danger-base)] font-bold">
                            {priceOut !== undefined ? `$${Number(priceOut).toFixed(4)}` : 'N/A'}
                        </span>
                    </div>
                    <div className="flex flex-col col-span-2">
                        <span className="text-3xs font-black text-[var(--sx-color-text-muted)] opacity-50 uppercase tracking-widest mb-1">Janela de Contexto</span>
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
                            <div className="flex flex-col pt-8" style={{ gap: 'calc(var(--sx-spacing-md) / 1.5)', paddingTop: 'var(--sx-spacing-md)' }}>
                                {description && (
                                    <div className="p-6 bg-[var(--sx-color-surface-base)] border-[var(--sx-color-border-base)] rounded-[var(--sx-radius-md)]">
                                        <span className="text-3xs font-black text-[var(--sx-color-primary-base)] uppercase mb-2 block">Descrição Técnica</span>
                                        <p className="text-xs text-[var(--sx-color-text-muted)] opacity-70 leading-relaxed font-medium">{description}</p>
                                    </div>
                                )}
                                {tokenizer && (
                                    <div className="flex items-center justify-between px-6 py-4 bg-[var(--sx-color-surface-base)] border-[var(--sx-color-border-base)] rounded-[var(--sx-radius-md)]">
                                        <span className="text-3xs font-black text-white/30 uppercase">Tokenizer</span>
                                        <span className="text-2xs font-mono text-[var(--sx-color-primary-base)]">{tokenizer}</span>
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
