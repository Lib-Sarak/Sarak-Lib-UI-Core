import React from 'react';
import { motion } from 'framer-motion';
import { SarakThemePreset } from '../../../../core/Design/presets/themes';
import { resolveThemeForMode } from '../../../../core/Design/presets/themes/color-engine';
import type { SarakTokenValue } from '../../../../core/Design/types';
import { useDesignVariables } from '../../../../core/Design/hooks/useDesignVariables';
import { sarakGetDefaultDesignState } from '../../../../core/Design/master-map';
import { Layout, ArrowRight } from 'lucide-react';

const TOKEN_DEFAULTS = sarakGetDefaultDesignState();
const FALLBACK_RADIUS = 'var(--sarak-card-radius, 12px)';

/** Valor de token em CSS para a miniatura: o ponto `desk` de um token responsivo, e `px` num número. */
const toCssLength = (value: SarakTokenValue | undefined, fallback: string): string => {
    const raw = value !== null && typeof value === 'object' ? value.desk : value;
    if (typeof raw === 'number') return `${raw}px`;
    return raw === undefined || raw === '' ? fallback : String(raw);
};

const isDefaultCorner = (value: SarakTokenValue, defaultValue: SarakTokenValue): boolean => {
    if (typeof value === 'object' && typeof defaultValue === 'object') {
        return value.mob === defaultValue.mob && value.tab === defaultValue.tab && value.desk === defaultValue.desk;
    }
    return value === defaultValue;
};

/** O canto é exceção do raio mestre: só vale quando o tema o declara com valor diferente do padrão. */
const cornerRadius = (design: Record<string, SarakTokenValue>, cornerId: string): string => {
    const declared = design[cornerId] !== undefined && !isDefaultCorner(design[cornerId], TOKEN_DEFAULTS[cornerId]);
    return toCssLength(declared ? design[cornerId] : design.cardBorderRadius, FALLBACK_RADIUS);
};

export const PresetCard = ({ theme, currentMode, onApply, index }: { theme: SarakThemePreset, currentMode: string, onApply: () => void, index: number }) => {
    // plan-26: a miniatura reflete o que `onApply` REALMENTE aplicaria — a
    // contraparte AUTORADA quando existe, e só cai no `syncThemeWithMode`
    // sintetizado para os temas legados sem contraparte.
    const design = resolveThemeForMode(
        { design: theme.design as Record<string, SarakTokenValue>, contraparte: theme.contraparte },
        currentMode as 'light' | 'dark',
    );
    const { variables } = useDesignVariables(design);

    const primary = String(design.primaryColor || 'var(--color-theme-primary, #00f2ff)');
    const secondary = String(design.secondaryColor || 'var(--color-theme-secondary, #7000ff)');
    const bgBase = String(design.surfaceColor || 'var(--color-theme-bg, #050505)');
    const isLight = design.mode === 'light';

    const borderWidth = toCssLength(design.cardBorderWidth, 'var(--sarak-border-width, 1px)');
    const cardStyle = {
        backgroundColor: String(design.cardBackgroundColor || (isLight ? 'color-mix(in srgb, var(--color-theme-text) 70%, transparent)' : 'color-mix(in srgb, var(--color-theme-text) 5%, transparent)')),
        borderTopWidth: variables['--sarak-card-border-top'] || borderWidth,
        borderRightWidth: variables['--sarak-card-border-right'] || borderWidth,
        borderBottomWidth: variables['--sarak-card-border-bottom'] || borderWidth,
        borderLeftWidth: variables['--sarak-card-border-left'] || borderWidth,
        borderColor: String(design.cardBorderColor || (isLight ? 'color-mix(in srgb, var(--color-theme-body) 10%, transparent)' : 'color-mix(in srgb, var(--color-theme-text) 10%, transparent)')),
        borderStyle: variables['--sarak-border-style'] || 'solid',
        borderTopLeftRadius: cornerRadius(design, 'cardRadiusTL'),
        borderTopRightRadius: cornerRadius(design, 'cardRadiusTR'),
        borderBottomRightRadius: cornerRadius(design, 'cardRadiusBR'),
        borderBottomLeftRadius: cornerRadius(design, 'cardRadiusBL'),
        backdropFilter: `blur(${variables['--sarak-card-backdrop-blur'] || 'var(--sarak-card-backdrop-blur, 12px)'})`,
        boxShadow: design.cardShadow && design.cardShadow !== 'none'
            ? design.cardShadow
            : design.cardShadowSpread
                // `cardShadowSpread` é a OPACIDADE da sombra em % (o schema e o `.sarak-card` leem assim), não um desfoque em px.
                ? `0 var(--sarak-preset-card-shadow-offset-y, 4px) var(--sarak-preset-card-shadow-blur, 10px) calc(var(--sarak-preset-card-shadow-spread, 2px) * -1) color-mix(in srgb, ${design.cardGlowColor || 'var(--color-theme-body)'} ${Math.min(100, Number(design.cardShadowSpread))}%, transparent)`
                : '0 var(--sarak-preset-card-shadow-offset-y, 4px) var(--sarak-preset-card-shadow-blur, 10px) calc(var(--sarak-preset-card-shadow-spread, 2px) * -1) color-mix(in srgb, var(--color-theme-body) 50%, transparent)',
        clipPath: variables['--sarak-card-clip-path']
    };

    const textureLayer = design.cardTextureType && design.cardTextureType !== 'none' ? (
        <div
            className="absolute inset-0 pointer-events-none opacity-50"
            style={{
                backgroundImage: design.cardTextureType === 'grid'
                    ? 'linear-gradient(to right, var(--border-color,rgba(255,255,255,0.1)) var(--sarak-border-width, 1px), transparent var(--sarak-border-width, 1px)), linear-gradient(to bottom, var(--border-color,rgba(255,255,255,0.1)) var(--sarak-border-width, 1px), transparent var(--sarak-border-width, 1px))'
                    : design.cardTextureType === 'noise'
                        ? 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")'
                        : 'none',
                backgroundSize: design.cardTextureType === 'grid' ? 'var(--sarak-preset-grid-texture-size, 8px) var(--sarak-preset-grid-texture-size, 8px)' : 'auto'
            }}
        />
    ) : null;

    return (
        <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={onApply}
            className="group relative flex flex-col text-left rounded-2xl border border-theme-border overflow-hidden sarak-card hover:bg-theme-sidebar transition-all duration-[var(--sarak-motion-dur-normal,0.3s)] hover:border-theme-primary/50 hover:shadow-[0_10px_40px_-10px_rgba(var(--theme-primary-rgb),0.1)] focus:outline-none"
        >
            {/* Top Showcase Area - Mini Dashboard */}
            <div
                className="h-48 w-full relative flex transition-colors overflow-hidden"
                style={{ backgroundColor: bgBase, ...(variables as React.CSSProperties) }}
            >
                {/* Mini Shell Navigation */}
                {design.navigationStyle === 'sidebar' ? (
                    <div className="h-full w-8 flex flex-col items-center py-3 gap-2 border-r z-10 shrink-0 shadow-xl" style={{ borderColor: cardStyle.borderColor as string, backgroundColor: cardStyle.backgroundColor as string }}>
                        <div className="w-4 h-4 rounded-sm mb-3 shadow-lg" style={{ backgroundColor: primary }} />
                        <div className="w-3 h-0.5 rounded-full bg-theme-text/20" />
                        <div className="w-3 h-0.5 rounded-full bg-theme-text/20" />
                        <div className="w-3 h-0.5 rounded-full bg-theme-text/20" />
                    </div>
                ) : (
                    <div className="absolute top-0 left-0 w-full h-6 flex items-center px-4 gap-3 border-b z-10 shadow-xl" style={{ borderColor: cardStyle.borderColor as string, backgroundColor: cardStyle.backgroundColor as string }}>
                        <div className="w-4 h-4 rounded-sm shadow-lg" style={{ backgroundColor: primary }} />
                        <div className="w-12 h-0.5 rounded-full bg-theme-text/20" />
                        <div className="flex-1" />
                        <div className="w-3 h-3 rounded-full bg-theme-text/20" />
                    </div>
                )}

                {/* Mini Content Area */}
                <div className={`flex-1 flex flex-col p-4 gap-3 relative z-0 ${design.navigationStyle === 'topbar' ? 'mt-6' : ''}`}>
                    {/* Header Title */}
                    <div className="flex flex-col gap-1 mb-1">
                        <div className="h-2 w-24 bg-theme-text/50 rounded-full" />
                        <div className="h-1.5 w-16 bg-theme-text/20 rounded-full" />
                    </div>

                    {/* Mini Grid Layout */}
                    <div className="flex-1 flex flex-col gap-3">
                        {/* Top Row: 3 cards */}
                        <div className="flex gap-3 h-[45%]">
                            {/* Card 1: Text */}
                            <div className="flex-1 relative overflow-hidden flex flex-col p-2 gap-1.5 shadow-xl transition-all" style={cardStyle as React.CSSProperties}>
                                {textureLayer}
                                <div className="h-1.5 w-10 bg-theme-text/20 rounded-full relative z-10" />
                                <div className="h-2.5 w-16 bg-theme-text/60 rounded-full mt-auto relative z-10" />
                            </div>

                            {/* Card 2: Filter/Toggles */}
                            <div className="flex-[1.2] relative overflow-hidden flex flex-col p-2 gap-1.5 shadow-xl transition-all" style={cardStyle as React.CSSProperties}>
                                {textureLayer}
                                <div className="h-1.5 w-12 bg-theme-text/20 rounded-full mb-1 relative z-10" />
                                <div className="flex items-center justify-between mt-auto relative z-10">
                                    <div className="h-1 w-10 bg-theme-text/20 rounded-full" />
                                    <div className="w-4 h-2 rounded-full" style={{ backgroundColor: primary }} />
                                </div>
                                <div className="flex items-center justify-between relative z-10 mt-1">
                                    <div className="h-1 w-8 bg-theme-text/20 rounded-full" />
                                    <div className="w-4 h-2 rounded-full bg-theme-text/10" />
                                </div>
                            </div>

                            {/* Card 3: Status */}
                            <div className="flex-1 relative overflow-hidden flex flex-col p-2 justify-center items-center shadow-xl transition-all" style={cardStyle as React.CSSProperties}>
                                {textureLayer}
                                <div className="w-6 h-6 rounded-full border-[length:var(--sarak-border-width,1px)] border-t-transparent relative z-10" style={{ borderColor: `${secondary} transparent ${secondary} ${secondary}` }} />
                            </div>
                        </div>

                        {/* Bottom Row: 2 cards */}
                        <div className="flex gap-3 h-[55%]">
                            {/* Card 4: Bar Chart */}
                            <div className="flex-[2] relative overflow-hidden flex flex-col p-2 shadow-xl transition-all" style={cardStyle as React.CSSProperties}>
                                {textureLayer}
                                <div className="h-1.5 w-16 bg-theme-text/20 rounded-full mb-auto relative z-10" />
                                <div className="flex items-end justify-between gap-1 h-8 px-1 relative z-10 mt-2">
                                    {[40, 70, 30, 90, 50, 80, 60, 45].map((h, i) => (
                                        <div key={i} className="w-full rounded-t-[var(--border-color,rgba(255,255,255,0.1))]" style={{ height: `${h}%`, backgroundColor: primary, opacity: 0.7 + (i * 0.03) }} />
                                    ))}
                                </div>
                            </div>

                            {/* Card 5: Logs */}
                            <div className="flex-1 relative overflow-hidden flex flex-col p-2 gap-1.5 shadow-xl transition-all" style={cardStyle as React.CSSProperties}>
                                {textureLayer}
                                <div className="h-1.5 w-12 bg-theme-text/20 rounded-full mb-1.5 relative z-10" />
                                <div className="h-0.5 w-full bg-theme-text/10 rounded-full relative z-10" />
                                <div className="h-0.5 w-4/5 bg-theme-text/10 rounded-full relative z-10" />
                                <div className="h-0.5 w-5/6 bg-theme-text/10 rounded-full relative z-10" />
                                <div className="h-0.5 w-3/4 bg-theme-text/10 rounded-full relative z-10" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Area - Minimalista */}
            <div className="px-4 py-3 flex items-center justify-between border-t border-theme-border bg-theme-sidebar backdrop-blur-md group-hover:bg-theme-topbar transition-colors shrink-0">
                <h3 className="text-xs font-black uppercase tracking-widest text-theme-text group-hover:text-theme-primary transition-colors">
                    {theme.name}
                </h3>

                <div className="flex items-center gap-2">
                    <div className="px-1.5 py-0.5 bg-theme-card rounded text-[var(--sarak-type-scale-tiny,8px)] font-bold uppercase tracking-widest text-theme-muted flex items-center gap-1">
                        <Layout size={8} /> {String(design.navigationStyle || 'sidebar')}
                    </div>
                    <div className="flex items-center gap-1 text-[var(--sarak-type-scale3xs,9px)] font-bold uppercase tracking-widest text-theme-primary opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-[var(--sarak-motion-dur-normal,0.3s)]">
                        <ArrowRight size={12} />
                    </div>
                </div>
            </div>
        </motion.button>
    );
};
