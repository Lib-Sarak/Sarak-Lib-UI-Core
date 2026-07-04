import React from 'react';
import { DesignToken } from '../../../core/Design/types';
import { SliderControl, ColorControl, SwitchControl, SelectControl } from './DesignControls';

import type { SarakDesignState } from '../../../core/Provider/types';
import type { SarakTokenValue } from '../../../core/Design/types';

interface DynamicTokenControlProps {
    token: DesignToken;
    draft: SarakDesignState;
    updateDraft: (key: string, value: SarakTokenValue) => void;
}

/**
 * DYNAMIC TOKEN CONTROL (v12.0)
 * 
 * Um despachante inteligente que renderiza o controle de UI correto baseado no schema do token.
 */
export const DynamicTokenControl: React.FC<DynamicTokenControlProps> = ({ 
    token, 
    draft, 
    updateDraft 
}) => {
    const value = (draft as Record<string, SarakTokenValue>)[token.id] !== undefined 
        ? (draft as Record<string, SarakTokenValue>)[token.id] 
        : token.defaultValue;

    const handleChange = (newValue: SarakTokenValue) => {
        updateDraft(token.id, newValue);
    };

    switch (token.type) {
        case 'slider':
        case 'number':
            return (
                <SliderControl
                    label={token.label}
                    value={value as number}
                    min={token.constraints?.min ?? 0}
                    max={token.constraints?.max ?? 100}
                    step={token.constraints?.step ?? 1}
                    unit={token.unit || 'px'}
                    onChange={handleChange}
                />
            );

        case 'color':
            return (
                <ColorControl
                    label={token.label}
                    value={value as string}
                    onChange={handleChange}
                />
            );

        case 'boolean':
            return (
                <SwitchControl
                    label={token.label}
                    description={token.description}
                    value={!!value}
                    onChange={handleChange}
                />
            );

        case 'select':
        case 'font':
            return (
                <SelectControl
                    label={token.label}
                    value={value as string}
                    options={token.constraints?.options || token.options || []}
                    isFont={token.type === 'font'}
                    onChange={handleChange}
                />
            );

        default:
            return (
                <div className="p-2 border border-dashed border-white/10 rounded opacity-50">
                    <span className="text-[var(--sarak-type-scale2xs,10px)] text-white/40 uppercase">Tipo não suportado: {token.type}</span>
                </div>
            );
    }
};
