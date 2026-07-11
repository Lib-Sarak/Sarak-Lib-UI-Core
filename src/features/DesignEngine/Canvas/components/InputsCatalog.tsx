import React from 'react';
import { INPUT_PRESETS } from '../../../../core/Design/presets/components/inputs';
import { InputPresetPreview } from './InputPresetPreview';

import { SarakDesignState } from '../../../../core/Provider/types';
import { ComponentPreset } from '../../../../core/Design/presets/components/cards';

interface InputsCatalogProps {
    onApplyPreset: (presetDesign: Partial<SarakDesignState>, isPartial?: boolean) => void;
    currentMode: string;
    /** Sugestões geradas pelo Design Agent nesta sessão (nunca persistidas). */
    sessionPresets?: ComponentPreset[];
}

export const InputsCatalog: React.FC<InputsCatalogProps> = ({ onApplyPreset, currentMode, sessionPresets = [] }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...sessionPresets, ...INPUT_PRESETS].map((preset, i) => (
                <InputPresetPreview
                    key={preset.id}
                    preset={preset}
                    index={i}
                    currentMode={currentMode}
                    onApply={() => onApplyPreset(preset.design, true)}
                />
            ))}
        </div>
    );
};
