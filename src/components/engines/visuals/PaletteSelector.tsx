import React from 'react';
import { useSarakUI } from '../../../core/Provider/SarakUIProvider';
import { COLOR_PALETTES } from '../../../constants/design-tokens';

/**
 * PaletteSelector - Componente Industrial para Seleção de Paletas Hierárquicas
 * Permite alternar entre presets de cores que definem primary, secondary, accent e surface.
 */
export const PaletteSelector: React.FC = () => {
    const { colorPalette, applyConfig } = useSarakUI();

    const handleSelect = (id: string) => {
        applyConfig({ colorPalette: id });
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-theme-title opacity-70">
                    Paletas Industriais
                </span>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-theme-primary/10 text-theme-primary border border-theme-primary/20">
                    v9.0 Multi-Preset
                </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
                {COLOR_PALETTES.map((palette) => (
                    <button
                        key={palette.id}
                        onClick={() => handleSelect(palette.id)}
                        className={`
                            relative flex flex-col items-start p-3 rounded-xl transition-all duration-300
                            group overflow-hidden border
                            ${colorPalette === palette.id 
                                ? 'bg-theme-primary/5 border-theme-primary ring-1 ring-theme-primary/30' 
                                : 'bg-theme-card border-theme-border hover:border-theme-primary/50'}
                        `}
                    >
                        {/* Indicador de Seleção Ativa */}
                        {colorPalette === palette.id && (
                            <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-theme-primary animate-pulse" />
                        )}

                        <span className={`text-xs font-bold transition-colors mb-2 ${colorPalette === palette.id ? 'text-theme-primary' : 'text-theme-title'}`}>
                            {palette.name}
                        </span>

                        {/* Amostras de Cores */}
                        <div className="flex -space-x-1.5">
                            <div 
                                className="w-5 h-5 rounded-full border border-theme-border shadow-sm z-30" 
                                style={{ backgroundColor: palette.colors.primary }}
                                title="Primary"
                            />
                            <div 
                                className="w-5 h-5 rounded-full border border-theme-border shadow-sm z-20" 
                                style={{ backgroundColor: palette.colors.secondary }}
                                title="Secondary"
                            />
                            <div 
                                className="w-5 h-5 rounded-full border border-theme-border shadow-sm z-10" 
                                style={{ backgroundColor: palette.colors.accent }}
                                title="Accent"
                            />
                            <div 
                                className="w-5 h-5 rounded-full border border-theme-border shadow-sm z-0" 
                                style={{ backgroundColor: palette.colors.surface }}
                                title="Surface"
                            />
                        </div>

                        {/* Efeito Hover */}
                        <div className="absolute inset-0 bg-theme-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                ))}
            </div>
            
            <p className="text-[10px] text-theme-muted italic">
                * As cores são injetadas dinamicamente em variáveis hierárquicas no root.
            </p>
        </div>
    );
};
