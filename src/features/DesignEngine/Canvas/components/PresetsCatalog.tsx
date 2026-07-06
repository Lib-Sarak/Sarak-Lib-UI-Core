import React, { useState } from 'react';
import { GLOBAL_THEMES } from '../../../../core/Design/presets/themes';
import type { SarakTokenValue } from '../../../../core/Design/types';
import { upgradeThemePayload } from '../../../../core/Design/master-map';
import { Sparkles, Layout, Type, Layers, MousePointer2, Keyboard } from 'lucide-react';
import { CardsCatalog } from './CardsCatalog';
import { AtmosphereCatalog } from './AtmosphereCatalog';
import { TypographyCatalog } from './TypographyCatalog';
import { ButtonsCatalog } from './ButtonsCatalog';
import { InputsCatalog } from './InputsCatalog';
import { PresetCard } from './PresetCard';

import { SarakDesignState } from '../../../../core/Provider/types';

interface PresetsCatalogProps {
    onApplyPreset: (presetDesign: Partial<SarakDesignState>, isPartial?: boolean) => void;
    onApplyFullTheme?: (design: Partial<SarakDesignState>) => void;
    currentMode: string;
}

type PresetTab = 'globals' | 'cards' | 'typography' | 'atmosphere' | 'buttons' | 'inputs';

const TABS: { id: PresetTab; label: string; icon: React.ElementType }[] = [
    { id: 'globals', label: 'Globais', icon: Sparkles },
    { id: 'cards', label: 'Cards', icon: Layout },
    { id: 'typography', label: 'Typography', icon: Type },
    { id: 'atmosphere', label: 'Atmosphere', icon: Layers },
    { id: 'buttons', label: 'Buttons', icon: MousePointer2 },
    { id: 'inputs', label: 'Inputs', icon: Keyboard },
];

export const PresetsCatalog: React.FC<PresetsCatalogProps> = ({ onApplyPreset, onApplyFullTheme, currentMode }) => {
    const [activeTab, setActiveTab] = useState<PresetTab>('globals');

    return (
        <div className="w-full h-full flex flex-col relative bg-theme-bg">
            {/* Header com navegação própria por Categoria de Preset (Schema), independente do Pilar do painel humano */}
            <div className="px-8 py-5 border-b border-theme-border flex items-center justify-between bg-theme-sidebar backdrop-blur-md sticky top-0 z-10 flex-wrap gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-theme-primary/10 rounded-xl border border-theme-primary/20 shadow-[0_0_20px_rgba(var(--theme-primary-rgb),0.2)]">
                        <Sparkles size={18} className="text-theme-primary" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-black uppercase text-theme-text tracking-[var(--sarak-tracking-wide,0.3em)]">Design Intelligence Catalog</span>
                        <span className="text-[var(--sarak-type-scale3xs,9px)] font-bold text-theme-primary uppercase tracking-widest mt-0.5">
                            Categoria: {TABS.find(tab => tab.id === activeTab)?.label}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2 p-1 bg-black/20 rounded-xl border border-theme-border flex-wrap">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 rounded-lg text-[var(--sarak-type-scale2xs,10px)] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-theme-primary text-white shadow-lg' : 'text-theme-muted hover:text-white hover:bg-white/5'}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Presets Body */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-[radial-gradient(ellipse_at_top_right,rgba(var(--theme-primary-rgb),0.03)_0%,transparent_50%)]">
                {activeTab === 'globals' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {GLOBAL_THEMES.map((theme, i) => (
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

                {activeTab === 'cards' && <CardsCatalog onApplyPreset={onApplyPreset} currentMode={currentMode} />}
                {activeTab === 'typography' && <TypographyCatalog onApplyPreset={onApplyPreset} currentMode={currentMode} />}
                {activeTab === 'atmosphere' && <AtmosphereCatalog onApplyPreset={onApplyPreset} currentMode={currentMode} />}
                {activeTab === 'buttons' && <ButtonsCatalog onApplyPreset={onApplyPreset} currentMode={currentMode} />}
                {activeTab === 'inputs' && <InputsCatalog onApplyPreset={onApplyPreset} currentMode={currentMode} />}
            </div>
        </div>
    );
};
