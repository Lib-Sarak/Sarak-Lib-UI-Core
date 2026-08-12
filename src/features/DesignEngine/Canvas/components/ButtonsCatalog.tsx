import React, { useState } from 'react';
import { BUTTON_PRESETS, BUTTON_STYLE_PRESETS } from '../../../../core/Design/presets/components/buttons';
import { ButtonPresetPreview } from './ButtonPresetPreview';
import { CATALOG_GRID_3COL } from '../panelResponsive.presets';
import { Sparkles, MousePointer2 } from 'lucide-react';

import { SarakDesignState } from '../../../../core/Provider/types';

interface ButtonsCatalogProps {
    onApplyPreset: (presetDesign: Partial<SarakDesignState>, isPartial?: boolean) => void;
    currentMode: string;
}

export const ButtonsCatalog: React.FC<ButtonsCatalogProps> = ({ onApplyPreset, currentMode }) => {
    const [activeTab, setActiveTab] = useState<'curated' | 'styles'>('curated');
    const presets = activeTab === 'curated' ? BUTTON_PRESETS : BUTTON_STYLE_PRESETS;

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2 p-1 bg-black/20 rounded-xl border border-theme-border w-fit">
                <button
                    onClick={() => setActiveTab('curated')}
                    className={`px-4 py-2 rounded-lg text-[var(--sarak-type-scale2xs,10px)] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'curated' ? 'bg-theme-primary text-white shadow-lg' : 'text-theme-muted hover:text-white hover:bg-white/5'}`}
                >
                    <Sparkles size={12} />
                    Curados
                </button>
                <button
                    onClick={() => setActiveTab('styles')}
                    className={`px-4 py-2 rounded-lg text-[var(--sarak-type-scale2xs,10px)] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'styles' ? 'bg-theme-primary text-white shadow-lg' : 'text-theme-muted hover:text-white hover:bg-white/5'}`}
                >
                    <MousePointer2 size={12} />
                    Por Estilo
                </button>
            </div>

            {/* Container query (plan-35): reage ao `@container` de `PresetsCatalog.tsx`. */}
            <div className={`grid ${CATALOG_GRID_3COL} gap-6`}>
                {presets.map((preset, i) => (
                    <ButtonPresetPreview
                        key={preset.id}
                        preset={preset}
                        index={i}
                        currentMode={currentMode}
                        onApply={() => onApplyPreset(preset.design, true)}
                    />
                ))}
            </div>
        </div>
    );
};
