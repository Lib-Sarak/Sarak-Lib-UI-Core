import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import { Search, Eye, Globe, MessageSquare, Zap } from 'lucide-react';
import { useSarakUI } from '../../../core/Provider/SarakUIProvider';
import { SarakInput } from '../Inputs/SarakInput';
import { SarakSwitch } from '../Inputs/SarakSwitch';

interface SarakSearchCardProps {
    item: any;
    mapping: any;
    className?: string;
    onSearchChange?: (text: string) => void;
    onToggleCapability?: (cap: string, active: boolean) => void;
    design?: any;
    label?: string;
}

export const SarakSearchCard: React.FC<SarakSearchCardProps> = ({ 
    item, 
    mapping, 
    className = '', 
    onSearchChange,
    onToggleCapability,
    design: propDesign,
    label
}) => {
    const context = useSarakUI();
    const design = propDesign || context.design || {};
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
            className={`flex flex-col sarak-card bg-[var(--sx-color-surface-base)] border-[var(--sx-color-border-base)] relative overflow-hidden group transition-all h-fit ${className}`}
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
            
            {/* Border Beam - lights up on focus or hover */}
            {(design.cardSearchBorderBeamActive !== false && (focused || design.cardSearchBorderBeamActive !== false)) && (
                <div className="border-beam-effect" style={{ opacity: focused ? 1 : 0.4 }} />
            )}

            {/* DRAFT BADGE (v6.3) */}
            {context?.isDrafting && (
                <div className="absolute top-2 left-4 z-40 pointer-events-none flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/60 border border-[var(--sx-color-primary-base)]/20 text-[7px] font-black uppercase tracking-[0.2em] text-[var(--sx-color-primary-base)] shadow-[0_0_10px_rgba(0,242,255,0.05)]">
                    <span className="w-1 h-1 rounded-full bg-[var(--sx-color-primary-base)] animate-pulse" />
                    {label || "Card de Interação"}
                </div>
            )}



            <div className="relative z-10 flex flex-col gap-4">
                {/* Section Header */}
                <div className="flex flex-col">
                    <span className="text-[9px] font-black text-[var(--sx-color-primary-base)] uppercase tracking-[0.2em] mb-1">
                        Painel de Filtros
                    </span>
                    <h4 className="text-sm font-black text-[var(--sx-color-text-title)] tracking-tight">
                        Busca de Capacidades
                    </h4>
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
                <div className="flex flex-col gap-2 pt-2 border-t border-[var(--sx-color-border-base)]/20">
                    <span className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Filtro de Abilities</span>
                    
                    {/* Vision Switch */}
                    <div 
                        onClick={() => handleToggle('vision')}
                        className="flex items-center justify-between p-2 hover:bg-white/5 border border-transparent hover:border-white/5 transition-all cursor-pointer rounded-lg"
                    >
                        <div className="flex items-center gap-2">
                            <Eye size={12} className="text-[var(--sx-color-primary-base)]" />
                            <span className="text-3xs font-black uppercase text-[var(--sx-color-text-muted)]">Visão Computacional</span>
                        </div>
                        <SarakSwitch checked={caps.vision} onChange={() => handleToggle('vision')} />
                    </div>

                    {/* Web Switch */}
                    <div 
                        onClick={() => handleToggle('web')}
                        className="flex items-center justify-between p-2 hover:bg-white/5 border border-transparent hover:border-white/5 transition-all cursor-pointer rounded-lg"
                    >
                        <div className="flex items-center gap-2">
                            <Globe size={12} className="text-[var(--sx-color-primary-glow)]" />
                            <span className="text-3xs font-black uppercase text-[var(--sx-color-text-muted)]">Navegação Web</span>
                        </div>
                        <SarakSwitch checked={caps.web} onChange={() => handleToggle('web')} />
                    </div>

                    {/* Chat Switch */}
                    <div 
                        onClick={() => handleToggle('chat')}
                        className="flex items-center justify-between p-2 hover:bg-white/5 border border-transparent hover:border-white/5 transition-all cursor-pointer rounded-lg"
                    >
                        <div className="flex items-center gap-2">
                            <MessageSquare size={12} className="text-[var(--sx-color-primary-base)]" />
                            <span className="text-3xs font-black uppercase text-[var(--sx-color-text-muted)]">Modo Conversacional</span>
                        </div>
                        <SarakSwitch checked={caps.chat} onChange={() => handleToggle('chat')} />
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
