import { SarakIcon } from "../Icon/SarakIcon";
import React, { useState } from 'react';
import { motion } from 'framer-motion';

import { useSarakUI } from '../../../core/Provider/SarakUIProvider';
import { SarakInput } from '../Inputs/SarakInput';
import { SarakSwitch } from '../Inputs/SarakSwitch';
import { useCardLayoutStyles } from './hooks/useCardLayoutStyles';
import { useSpotlightPointer } from './hooks/useSpotlightPointer';
import { usePauseBeamOffscreen } from './hooks/usePauseBeamOffscreen';

import { SarakThemePayload } from '../../../core/Provider/types';

export interface SarakSearchCardProps<TItem extends Record<string, unknown>> {
    /** Registro genérico exigido pela assinatura; a implementação atual não o consulta, então ele não altera o conteúdo visível. */
    item: TItem;
    /** Caminhos de campos previstos para o registro; a implementação atual não lê o mapa, então fornecê-lo não altera o cartão. */
    mapping?: Record<string, string>;
    /** Acrescenta classes à raiz do cartão; omitida, nenhuma classe adicional é aplicada. */
    className?: string;
    /** Recebe o texto a cada edição da busca; sem callback, a busca ainda muda localmente, mas nenhum valor é enviado ao consumidor. */
    onSearchChange?: (text: string) => void;
    /** Recebe a capacidade (`vision`, `web` ou `chat`) e seu novo estado; sem callback, os alternadores mudam apenas o estado local. */
    onToggleCapability?: (cap: string, active: boolean) => void;
    /** Substitui o tema do provider para este cartão; omitida, usa o tema global. */
    design?: SarakThemePayload;
    /** Texto do selo de rascunho; sem a prop, usa `Card de Interação`, e o selo só aparece durante a composição de rascunho. */
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
    const spotlight = useSpotlightPointer(design);
    const [searchText, setSearchText] = useState('');
    const [focused, setFocused] = useState(false);
    // O traço do campo de busca só desenha com o campo em foco; `borderBeamEnabled` o mantém aceso em qualquer cartão.
    const beamOn = design.borderBeamEnabled === true || (focused && design.cardSearchBorderBeamActive !== false);
    usePauseBeamOffscreen(spotlight.ref, beamOn);
    
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
            ref={spotlight.ref}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${layout.containerClass} sarak-card sarak-search-card relative overflow-hidden group transition-all h-fit ${className}`}
            style={{ 
                transitionDuration: 'var(--duration-normal, 0.3s)',
                padding: 'var(--sarak-card-padding-md, 24px)'
            }}
            data-sx-card-texture-type={String(design.cardTextureType ?? 'none')}
            data-spotlight={spotlight.dataSpotlight}
            data-border-beam={beamOn ? '1' : '0'}
        >
            {/* Ambient Atmosphere */}
            <div className="absolute inset-0 z-0 spotlight-effect pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-[var(--duration-slow,0.6s)]" />
            
            {/* Border Beam: a regra CSS só o desenha com `data-border-beam="1"` na raiz */}
            <div className="border-beam-effect" />

            {/* DRAFT BADGE (v6.3) */}
            {context?.isDrafting && (
                <div
                    className="absolute top-2 left-4 z-40 pointer-events-none flex items-center rounded bg-[var(--color-theme-card,#101622)] border border-[var(--sarak-primary-color,#19e3f0)]/20 font-black uppercase text-[var(--sarak-primary-color,#19e3f0)] shadow-[0_0_10px_var(--sarak-card-glow-color,rgba(25,227,240,0.18))]"
                    style={{
                        gap: 'calc(var(--sarak-layout-gap-md, 16px) * 0.375)',
                        paddingInline: 'var(--sarak-layout-gap-sm, 8px)',
                        paddingBlock: 'calc(var(--sarak-layout-gap-md, 16px) * 0.125)',
                        fontSize: 'var(--sarak-type-scale-micro, 7px)',
                        letterSpacing: 'var(--sarak-tracking-tight, 0.2em)'
                    }}
                >
                    <span className="w-1 h-1 rounded-full bg-[var(--sarak-primary-color,#19e3f0)] animate-pulse" />
                    {label || "Card de Interação"}
                </div>
            )}

            <div className={layout.contentClass}>
                {/* Section Header */}
                <div className={layout.headerClass}>
                    <div className="flex" style={{ flexDirection: 'column' }}>
                        <span className="font-black text-[var(--sarak-primary-color,#19e3f0)] uppercase" style={{ marginBottom: 'calc(var(--sarak-layout-gap-md, 16px) * 0.25)', fontSize: 'var(--sarak-type-scale3xs, 9px)', letterSpacing: 'var(--sarak-tracking-tight, 0.2em)' }}>
                        Painel de Filtros
                    </span>
                    <h4 className="text-sm font-black text-[var(--color-theme-title,#f2f6fb)] tracking-tight">
                        Busca de Capacidades
                    </h4>
                    </div>
                </div>

                {/* Highly tactile input search field */}
                <SarakInput 
                    leftIcon={<SarakIcon name="Search" className="w-3.5 h-3.5" />}
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
                        className="flex border-t border-[var(--border-color,rgba(255,255,255,0.09))]/20 w-full"
                        style={{ flexDirection: 'column', gap: 'var(--sarak-layout-gap-sm, 8px)', paddingTop: 'var(--sarak-layout-gap-sm, 8px)' }}
                    >
                        <span className="font-black text-theme-tint-strong uppercase tracking-widest" style={{ marginBottom: 'calc(var(--sarak-layout-gap-md, 16px) * 0.25)', fontSize: 'var(--sarak-type-scale-tiny, 8px)' }}>Filtro de Abilities</span>

                    {/* Vision Switch */}
                    <div
                        onClick={() => handleToggle('vision')}
                        className="flex items-center justify-between hover:bg-theme-tint border border-transparent hover:border-theme-tint transition-all cursor-pointer rounded-lg"
                        style={{ padding: 'var(--sarak-layout-gap-sm, 8px)' }}
                    >
                        <div className="flex items-center" style={{ gap: 'var(--sarak-layout-gap-sm, 8px)' }}>
                            <SarakIcon name="Eye" size={12} className="text-[var(--sarak-primary-color,#19e3f0)]" />
                            <span className="text-3xs font-black uppercase text-[var(--text-muted,rgba(242,246,251,0.55))]">Visão Computacional</span>
                        </div>
                        <SarakSwitch checked={caps.vision} onChange={() => handleToggle('vision')} />
                    </div>

                    {/* Web Switch */}
                    <div
                        onClick={() => handleToggle('web')}
                        className="flex items-center justify-between hover:bg-theme-tint border border-transparent hover:border-theme-tint transition-all cursor-pointer rounded-lg"
                        style={{ padding: 'var(--sarak-layout-gap-sm, 8px)' }}
                    >
                        <div className="flex items-center" style={{ gap: 'var(--sarak-layout-gap-sm, 8px)' }}>
                            <SarakIcon name="Globe" size={12} className="text-[var(--sarak-shadow-glow,rgba(25,227,240,0.18))]" />
                            <span className="text-3xs font-black uppercase text-[var(--text-muted,rgba(242,246,251,0.55))]">Navegação Web</span>
                        </div>
                        <SarakSwitch checked={caps.web} onChange={() => handleToggle('web')} />
                    </div>

                    {/* Chat Switch */}
                    <div
                        onClick={() => handleToggle('chat')}
                        className="flex items-center justify-between hover:bg-theme-tint border border-transparent hover:border-theme-tint transition-all cursor-pointer rounded-lg"
                        style={{ padding: 'var(--sarak-layout-gap-sm, 8px)' }}
                    >
                        <div className="flex items-center" style={{ gap: 'var(--sarak-layout-gap-sm, 8px)' }}>
                            <SarakIcon name="MessageSquare" size={12} className="text-[var(--sarak-primary-color,#19e3f0)]" />
                            <span className="text-3xs font-black uppercase text-[var(--text-muted,rgba(242,246,251,0.55))]">Modo Conversacional</span>
                        </div>
                            <SarakSwitch checked={caps.chat} onChange={() => handleToggle('chat')} />
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
