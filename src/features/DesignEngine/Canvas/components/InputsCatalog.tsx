import React from 'react';
import { INPUT_PRESETS } from '../../../../core/Design/presets/components/inputs';
import { CATALOG_GRID_3COL } from '../panelResponsive.presets';
import { InputPresetPreview } from './InputPresetPreview';
import type { PeekHandler } from './peek';

import { SarakDesignState } from '../../../../core/Provider/types';

interface InputsCatalogProps {
    onApplyPreset: (presetDesign: Partial<SarakDesignState>, isPartial?: boolean) => void;
    currentMode: string;
    draft?: Partial<SarakDesignState>;
    onPeek?: PeekHandler;
}

export const InputsCatalog: React.FC<InputsCatalogProps> = ({ onApplyPreset, currentMode, draft, onPeek }) => {
    return (
        // Container query (plan-35): reage ao `@container` de `PresetsCatalog.tsx`.
        <div className={`grid ${CATALOG_GRID_3COL} gap-6`}>
            {INPUT_PRESETS.map((preset) => (
                <InputPresetPreview
                    key={preset.id}
                    preset={preset}
                    currentMode={currentMode}
                    draft={draft}
                    onPeek={onPeek}
                    onApply={() => onApplyPreset(preset.design, true)}
                />
            ))}
        </div>
    );
};
