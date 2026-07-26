import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Eye, Globe, MessageSquare, Zap } from 'lucide-react';
import { useSarakUI } from '../../../core/Provider/SarakUIProvider';
import { SarakInput } from '../Inputs/SarakInput';
import { SarakSwitch } from '../Inputs/SarakSwitch';
import { useCardLayoutStyles } from './hooks/useCardLayoutStyles';

import { SarakThemePayload } from '../../../core/Provider/types';

export interface SarakSearchCardProps<TItem extends Record<string, unknown>> {
    item: TItem;
    mapping?: Record<string, string>;
    className?: string;
    onSearchChange?: (text: string) => void;
    onToggleCapability?: (cap: string, active: boolean) => void;
    design?: SarakThemePayload;
    label?: string;
}

export const SarakSearchCard = <TItem extends Record<string, unknown>>({ 
    item, 
    mapping, 
    className = '', 
    onSearchChange,
    onToggleCapability,
    design: propDesign,
    label
}: SarakSearchCardProps<TItem>) => {
    const context = useSarakUI();
    const design = propDesign || context.design || {};
    const layout = useCardLayoutStyles(design);
    const [searchText, setSearchText] = useState('');
    const [focused, setFocused] = useState(false);
    
    // Capability toggling state
    const [caps, setCaps] = useState<Record<string, boolean>>({
        vision: true,
        web: false,
        chat: true
    });

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setSearchText(val);
        if (onSearchChange) onSearchChange(val);
    };

    const handleToggle = (capKey: string) => {
        const nextState = !caps[capKey];
        setCaps(prev => {
            const updated = { ...prev, [capKey]: nextState };
            if (onToggleCapability) onToggleCapability(capKey, nextState);
            return updated;
        });
    };


    return (
        <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${layout.containerClass} sarak-card bg-[var(--color-theme-card,#1e293b)] border-[var(--border-color,#334155)] relative overflow-hidden group transition-all h-fit ${className}`}
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
            
            {/* Border Beam - lights up on focus or hover */}
            {design.cardSearchBorderBeamActive !== false && (
                <div className="border-beam-effect" style={{ opacity: focused ? 1 : 0.4 }} />
            )}

            {/* DRAFT BADGE (v6.3) */}
            {context?.isDrafting && (
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
                {/* Section Header */}
                <div className={layout.headerClass}>
                    <div className="flex" style={{ flexDirection: 'column' }}>
                        <span className="font-black text-[var(--sarak-primary-color,#3b82f6)] uppercase" style={{ marginBottom: 'calc(var(--sarak-layout-gap-md, 16px) * 0.25)', fontSize: 'var(--sarak-type-scale3xs, 9px)', letterSpacing: 'var(--sarak-tracking-tight, 0.2em)' }}>
                        Painel de Filtros
                    </span>
                    <h4 className="text-sm font-black text-[var(--color-theme-title,#ffffff)] tracking-tight">
                        Busca de Capacidades
                    </h4>
                    </div>
                </div>

                {/* Highly tactile input search field */}
                <SarakInput 
                    leftIcon={<Search className="w-3.5 h-3.5" />}
                    value={searchText}
                    onChange={handleSearch}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    placeholder="Buscar modelo ou tech..."
                    className="text-2xs font-semibold"
                    fullWidth
                />

                {/* Tactile toggles / Switch selector grid */}
                <div className={layout.footerClass}>
                    <div
                        className="flex border-t border-[var(--border-color,#334155)]/20 w-full"
                        style={{ flexDirection: 'column', gap: 'var(--sarak-layout-gap-sm, 8px)', paddingTop: 'var(--sarak-layout-gap-sm, 8px)' }}
                    >
                        <span className="font-black text-white/20 uppercase tracking-widest" style={{ marginBottom: 'calc(var(--sarak-layout-gap-md, 16px) * 0.25)', fontSize: 'var(--sarak-type-scale-tiny, 8px)' }}>Filtro de Abilities</span>

                    {/* Vision Switch */}
                    <div
                        onClick={() => handleToggle('vision')}
                        className="flex items-center justify-between hover:bg-white/5 border border-transparent hover:border-white/5 transition-all cursor-pointer rounded-lg"
                        style={{ padding: 'var(--sarak-layout-gap-sm, 8px)' }}
                    >
                        <div className="flex items-center" style={{ gap: 'var(--sarak-layout-gap-sm, 8px)' }}>
                            <Eye size={12} className="text-[var(--sarak-primary-color,#3b82f6)]" />
                            <span className="text-3xs font-black uppercase text-[var(--text-muted,#94a3b8)]">Visão Computacional</span>
                        </div>
                        <SarakSwitch checked={caps.vision} onChange={() => handleToggle('vision')} />
                    </div>

                    {/* Web Switch */}
                    <div
                        onClick={() => handleToggle('web')}
                        className="flex items-center justify-between hover:bg-white/5 border border-transparent hover:border-white/5 transition-all cursor-pointer rounded-lg"
                        style={{ padding: 'var(--sarak-layout-gap-sm, 8px)' }}
                    >
                        <div className="flex items-center" style={{ gap: 'var(--sarak-layout-gap-sm, 8px)' }}>
                            <Globe size={12} className="text-[var(--sarak-shadow-glow,rgba(59,130,246,0.5))]" />
                            <span className="text-3xs font-black uppercase text-[var(--text-muted,#94a3b8)]">Navegação Web</span>
                        </div>
                        <SarakSwitch checked={caps.web} onChange={() => handleToggle('web')} />
                    </div>

                    {/* Chat Switch */}
                    <div
                        onClick={() => handleToggle('chat')}
                        className="flex items-center justify-between hover:bg-white/5 border border-transparent hover:border-white/5 transition-all cursor-pointer rounded-lg"
                        style={{ padding: 'var(--sarak-layout-gap-sm, 8px)' }}
                    >
                        <div className="flex items-center" style={{ gap: 'var(--sarak-layout-gap-sm, 8px)' }}>
                            <MessageSquare size={12} className="text-[var(--sarak-primary-color,#3b82f6)]" />
                            <span className="text-3xs font-black uppercase text-[var(--text-muted,#94a3b8)]">Modo Conversacional</span>
                        </div>
                            <SarakSwitch checked={caps.chat} onChange={() => handleToggle('chat')} />
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
