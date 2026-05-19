import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import { Search, Eye, Globe, MessageSquare, Zap } from 'lucide-react';
import { useSarakUI } from '../../../core/Provider/SarakUIProvider';

interface SarakSearchCardProps {
    item: any;
    mapping: any;
    className?: string;
    onSearchChange?: (text: string) => void;
    onToggleCapability?: (cap: string, active: boolean) => void;
}

export const SarakSearchCard: React.FC<SarakSearchCardProps> = ({ 
    item, 
    mapping, 
    className = '', 
    onSearchChange,
    onToggleCapability 
}) => {
    const { design } = useSarakUI();
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

    // Retrieve Toggler options from design variables
    const switchStyle = design.switchStyleType || 'tactile';
    const switchBlur = design.switchBackdropBlur !== undefined ? `${design.switchBackdropBlur}px` : '4px';
    const pulseColor = design.switchPulseColor || '#00f2ff';
    const borderBeamActive = design.cardSearchBorderBeamActive !== false;

    // Helper for rendering custom switch element based on switchStyle
    const renderSwitch = (active: boolean) => {
        const activeBg = 'var(--sarak-switch-active-bg, var(--theme-primary, #00f2ff))';
        const thumbBg = 'var(--sarak-switch-thumb, #ffffff)';

        switch (switchStyle) {
            case 'asymmetric':
                return (
                    <div 
                        className={`w-10 h-5 relative flex items-center transition-all duration-300 ${active ? 'pl-5' : 'pl-0.5'}`}
                        style={{
                            background: active ? activeBg : 'rgba(255, 255, 255, 0.05)',
                            borderRadius: '4px 12px 4px 12px',
                            border: '1px solid rgba(255, 255, 255, 0.1)'
                        }}
                    >
                        <div 
                            className="w-4 h-4 transition-all"
                            style={{ 
                                background: thumbBg, 
                                borderRadius: active ? '3px 8px 3px 8px' : '2px 6px 2px 6px' 
                            }} 
                        />
                    </div>
                );
            case 'pulsing':
                return (
                    <div className="flex items-center gap-2">
                        <div 
                            className="w-3 h-3 rounded-full relative"
                            style={{
                                background: active ? activeBg : 'rgba(255, 255, 255, 0.1)',
                                border: '1px solid rgba(255, 255, 255, 0.2)'
                            }}
                        >
                            {active && (
                                <span 
                                    className="absolute inset-0 rounded-full animate-ping opacity-75"
                                    style={{ background: pulseColor }}
                                />
                            )}
                        </div>
                    </div>
                );
            case 'glass':
                return (
                    <div 
                        className={`w-9 h-5 relative flex items-center p-0.5 transition-all duration-300 ${active ? 'justify-end' : 'justify-start'}`}
                        style={{
                            background: 'rgba(255, 255, 255, 0.03)',
                            backdropFilter: `blur(${switchBlur})`,
                            borderRadius: '20px',
                            border: `1px solid ${active ? activeBg : 'rgba(255, 255, 255, 0.1)'}`
                        }}
                    >
                        <div 
                            className="w-3.5 h-3.5 rounded-full transition-all"
                            style={{ background: active ? activeBg : 'rgba(255, 255, 255, 0.3)' }} 
                        />
                    </div>
                );
            case 'tactile':
            default:
                return (
                    <div 
                        className={`w-9 h-5 relative flex items-center p-0.5 transition-all duration-200 ${active ? 'bg-[var(--theme-primary)]' : 'bg-white/10'} rounded-full`}
                        style={{
                            background: active ? activeBg : undefined
                        }}
                    >
                        <motion.div 
                            layout
                            className="w-3.5 h-3.5 rounded-full shadow-md"
                            style={{ background: thumbBg }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            animate={{ x: active ? 16 : 0 }}
                        />
                    </div>
                );
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex flex-col sarak-card bg-theme-card border-theme relative overflow-hidden group transition-all h-fit ${className}`}
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
            {(borderBeamActive && (focused || borderBeamActive)) && (
                <div className="border-beam-effect" style={{ opacity: focused ? 1 : 0.4 }} />
            )}

            <div className="relative z-10 flex flex-col gap-4">
                {/* Section Header */}
                <div className="flex flex-col">
                    <span className="text-[9px] font-black text-[var(--theme-primary)] uppercase tracking-[0.2em] mb-1">
                        Painel de Filtros
                    </span>
                    <h4 className="text-sm font-black text-[var(--theme-title)] tracking-tight">
                        Busca de Capacidades
                    </h4>
                </div>

                {/* Highly tactile input search field */}
                <div 
                    className="relative flex items-center transition-all duration-300"
                    style={{
                        borderRadius: design.inputBorderRadius !== undefined ? `${design.inputBorderRadius}px` : '8px',
                        border: focused ? '1.5px solid var(--theme-primary, #00f2ff)' : '1px solid rgba(255, 255, 255, 0.1)',
                        background: focused 
                            ? 'var(--sarak-card-search-bg-focus, rgba(0, 242, 255, 0.08))' 
                            : 'rgba(255, 255, 255, 0.03)',
                        boxShadow: focused ? '0 0 10px rgba(0, 242, 255, 0.15)' : 'none'
                    }}
                >
                    <Search className="w-3.5 h-3.5 text-white/30 absolute left-3 pointer-events-none" />
                    <input 
                        type="text"
                        value={searchText}
                        onChange={handleSearch}
                        onFocus={() => setFocused(true)}
                        onBlur={() => setFocused(false)}
                        placeholder="Buscar modelo ou tech..."
                        className="w-full bg-transparent text-2xs text-[var(--theme-text)] font-semibold placeholder-white/20 pl-9 pr-4 py-2.5 outline-none border-none"
                    />
                </div>

                {/* Tactile toggles / Switch selector grid */}
                <div className="flex flex-col gap-2 pt-2 border-t border-theme/20">
                    <span className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Filtro de Abilities</span>
                    
                    {/* Vision Switch */}
                    <div 
                        onClick={() => handleToggle('vision')}
                        className="flex items-center justify-between p-2 hover:bg-white/5 border border-transparent hover:border-white/5 transition-all cursor-pointer rounded-lg"
                    >
                        <div className="flex items-center gap-2">
                            <Eye size={12} className="text-[var(--theme-primary)]" />
                            <span className="text-3xs font-black uppercase text-[var(--theme-text)]">Visão Computacional</span>
                        </div>
                        {renderSwitch(caps.vision)}
                    </div>

                    {/* Web Switch */}
                    <div 
                        onClick={() => handleToggle('web')}
                        className="flex items-center justify-between p-2 hover:bg-white/5 border border-transparent hover:border-white/5 transition-all cursor-pointer rounded-lg"
                    >
                        <div className="flex items-center gap-2">
                            <Globe size={12} className="text-[var(--theme-secondary)]" />
                            <span className="text-3xs font-black uppercase text-[var(--theme-text)]">Navegação Web</span>
                        </div>
                        {renderSwitch(caps.web)}
                    </div>

                    {/* Chat Switch */}
                    <div 
                        onClick={() => handleToggle('chat')}
                        className="flex items-center justify-between p-2 hover:bg-white/5 border border-transparent hover:border-white/5 transition-all cursor-pointer rounded-lg"
                    >
                        <div className="flex items-center gap-2">
                            <MessageSquare size={12} className="text-[var(--theme-accent)]" />
                            <span className="text-3xs font-black uppercase text-[var(--theme-text)]">Modo Conversacional</span>
                        </div>
                        {renderSwitch(caps.chat)}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
