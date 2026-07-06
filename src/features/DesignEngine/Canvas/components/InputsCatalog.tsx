import React from 'react';
import { INPUT_PRESETS } from '../../../../core/Design/presets/components/inputs';
import { InputPresetPreview } from './InputPresetPreview';

import { SarakDesignState } from '../../../../core/Provider/types';

interface InputsCatalogProps {
    onApplyPreset: (presetDesign: Partial<SarakDesignState>, isPartial?: boolean) => void;
    currentMode: string;
}

export const InputsCatalog: React.FC<InputsCatalogProps> = ({ onApplyPreset, currentMode }) => {
    return (
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
    );
};
