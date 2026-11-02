import React from 'react';
import { ComponentPreset } from '../../../../core/Design/presets/components/cards';
import type { SarakDesignState } from '../../../../core/Provider/types';
import { OptionTile } from './OptionTile';
import { SampleButtonStates } from './SampleParts';
import { SampleScope } from './SampleScope';
import type { PeekHandler } from './peek';

interface ButtonPresetPreviewProps {
    preset: ComponentPreset;
    onApply: () => void;
    currentMode: string;
    draft?: Partial<SarakDesignState>;
    onPeek?: PeekHandler;
}

/** Uma opção de botão: o botão real nos quatro estados, com os tokens do preset por cima do rascunho. */
export const ButtonPresetPreview: React.FC<ButtonPresetPreviewProps> = ({ preset, onApply, currentMode, draft, onPeek }) => (
    <OptionTile
        name={preset.name}
        description={preset.description}
        onApply={onApply}
        peekTokens={() => preset.design}
        onPeek={onPeek}
    >
        <SampleScope draft={draft} tokens={preset.design} mode={currentMode === 'light' ? 'light' : 'dark'} className="flex items-center justify-center">
            <SampleButtonStates />
        </SampleScope>
    </OptionTile>
);
