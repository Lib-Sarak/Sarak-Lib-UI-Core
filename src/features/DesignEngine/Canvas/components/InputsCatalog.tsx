import React from 'react';
import { INPUT_PRESETS } from '../../../../core/Design/presets/components/inputs';
import { InputPresetPreview } from './InputPresetPreview';
import { CATALOG_GRID_3COL } from '../panelResponsive.presets';

import { SarakDesignState } from '../../../../core/Provider/types';

interface InputsCatalogProps {
    onApplyPreset: (presetDesign: Partial<SarakDesignState>, isPartial?: boolean) => void;
    currentMode: string;
}

export const InputsCatalog: React.FC<InputsCatalogProps> = ({ onApplyPreset, currentMode }) => {
    return (
        // Container query (plan-35): reage ao `@container` de `PresetsCatalog.tsx`.
        <div className={`grid ${CATALOG_GRID_3COL} gap-6`}>
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
