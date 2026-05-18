import React from 'react';
import { DesignToken } from '../../../core/Design/types';
import { SliderControl, ColorControl, SwitchControl, SelectControl } from './DesignControls';

interface DynamicTokenControlProps {
    token: DesignToken;
    draft: any;
    updateDraft: (key: string, value: any) => void;
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
    const value = draft[token.id] !== undefined ? draft[token.id] : token.defaultValue;

    const handleChange = (newValue: any) => {
        updateDraft(token.id, newValue);
    };

    switch (token.type) {
        case 'slider':
        case 'number':
            return (
                <SliderControl
                    label={token.label}
                    value={value}
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
                    value={value}
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
                    value={value}
                    options={token.constraints?.options || token.options || []}
                    isFont={token.type === 'font'}
                    onChange={handleChange}
                />
            );

        default:
            return (
                <div className="p-2 border border-dashed border-white/10 rounded opacity-50">
                    <span className="text-[10px] text-white/40 uppercase">Tipo não suportado: {token.type}</span>
                </div>
            );
    }
};
