import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GLOBAL_THEMES, ThemePreset } from '../../../../core/Design/presets/themes';
import { syncThemeWithMode } from '../../../../core/Design/presets/themes/color-engine';
import type { SarakTokenValue } from '../../../../core/Design/types';
import { useDesignVariables } from '../../../../core/Design/hooks/useDesignVariables';
import { upgradeThemePayload } from '../../../../core/Design/master-map';
import { Sparkles, ArrowRight, Layout, Moon, Sun } from 'lucide-react';
import { CardsCatalog } from './CardsCatalog';
import { AtmosphereCatalog } from './AtmosphereCatalog';
import { TypographyCatalog } from './TypographyCatalog';
import { BUTTON_PRESETS } from '../../../../core/Design/presets/components/buttons';
import { INPUT_PRESETS } from '../../../../core/Design/presets/components/inputs';
import { ButtonPresetPreview } from './ButtonPresetPreview';
import { InputPresetPreview } from './InputPresetPreview';
import { PresetCard } from './PresetCard';

import { SarakDesignState } from '../../../../core/Provider/types';

interface PresetsCatalogProps {
    onApplyPreset: (presetDesign: Partial<SarakDesignState>, isPartial?: boolean) => void;
    onApplyFullTheme?: (design: Partial<SarakDesignState>) => void;
    activeCategory: string | null;
    currentMode: string;
}

export const PresetsCatalog: React.FC<PresetsCatalogProps> = ({ onApplyPreset, onApplyFullTheme, activeCategory, currentMode }) => {
    const [activeTab, setActiveTab] = useState<'globals' | 'buttons' | 'inputs'>('globals');

    // Roteamento Modular de Presets
    if (activeCategory === 'navigation') {
        return <CardsCatalog onApplyPreset={onApplyPreset} currentMode={currentMode} />;
    }

    if (activeCategory === 'surfaces') {
        return <AtmosphereCatalog onApplyPreset={onApplyPreset} currentMode={currentMode} />;
    }

    if (activeCategory === 'typography') {
        return <TypographyCatalog onApplyPreset={onApplyPreset} currentMode={currentMode} />;
    }

    // Fallback: Temas Globais ou Componentes Individuais
    const themes = GLOBAL_THEMES;

    return (
        <div className="w-full h-full flex flex-col relative bg-theme-bg">
            {/* Header com Tabs */}
            <div className="px-8 py-5 border-b border-theme-border flex items-center justify-between bg-theme-sidebar backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-theme-primary/10 rounded-xl border border-theme-primary/20 shadow-[0_0_20px_rgba(var(--theme-primary-rgb),0.2)]">
                        <Sparkles size={18} className="text-theme-primary" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-black uppercase text-theme-text tracking-[0.3em]">Design Intelligence Catalog</span>
                        <span className="text-[9px] font-bold text-theme-primary uppercase tracking-widest mt-0.5">
                            Catálogo de Presets
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2 p-1 bg-black/20 rounded-xl border border-theme-border">
                    <button
                        onClick={() => setActiveTab('globals')}
                        className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'globals' ? 'bg-theme-primary text-white shadow-lg' : 'text-theme-muted hover:text-white hover:bg-white/5'}`}
                    >
                        Globais
                    </button>
                    <button
                        onClick={() => setActiveTab('buttons')}
                        className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'buttons' ? 'bg-theme-primary text-white shadow-lg' : 'text-theme-muted hover:text-white hover:bg-white/5'}`}
                    >
                        Botões
                    </button>
                    <button
                        onClick={() => setActiveTab('inputs')}
                        className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'inputs' ? 'bg-theme-primary text-white shadow-lg' : 'text-theme-muted hover:text-white hover:bg-white/5'}`}
                    >
                        Inputs
                    </button>
                </div>
            </div>

            {/* Presets Grid */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-[radial-gradient(ellipse_at_top_right,rgba(var(--theme-primary-rgb),0.03)_0%,transparent_50%)]">
                {activeTab === 'globals' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {themes.map((theme, i) => (
                            <PresetCard
                                key={theme.id}
                                theme={theme}
                                currentMode={currentMode}
                                onApply={() => {
                                    const payload = upgradeThemePayload({ ...theme.design as Record<string, SarakTokenValue>, mode: currentMode });
                                    if (onApplyFullTheme) {
                                        onApplyFullTheme(payload);
                                    } else {
                                        onApplyPreset(payload);
                                    }
                                }}
                                index={i}
                            />
                        ))}
                    </div>
                )}

                {activeTab === 'buttons' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {BUTTON_PRESETS.map((preset, i) => (
                            <ButtonPresetPreview 
                                key={preset.id} 
                                preset={preset} 
                                index={i} 
                                currentMode={currentMode} 
                                onApply={() => onApplyPreset(preset.design, true)} 
                            />
                        ))}
                    </div>
                )}

                {activeTab === 'inputs' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {INPUT_PRESETS.map((preset, i) => (
                            <InputPresetPreview 
                                key={preset.id} 
                                preset={preset} 
                                index={i} 
                                currentMode={currentMode} 
                                onApply={() => onApplyPreset(preset.design, true)} 
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};


