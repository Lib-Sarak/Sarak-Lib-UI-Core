import React from 'react';
import { SarakDesignToken } from '../../../core/Design/types';
import { getTokenBounds } from '../../../core/Design/utils/tokenBounds';
import {
    SliderControl, ResponsiveSliderControl, ColorControl, SwitchControl, SelectControl, InputControl, MediaUploaderControl
} from './DesignControls';
import { ExceptionRelation } from './ExceptionRelation';

import type { SarakDesignState } from '../../../core/Provider/types';
import type { SarakTokenValue } from '../../../core/Design/types';

interface DynamicTokenControlProps {
    token: SarakDesignToken;
    draft: SarakDesignState;
    updateDraft: (key: string, value: SarakTokenValue) => void;
}

/** O que o painel desenha quando o schema não declara faixa. */
const PANEL_MIN = 0;
const PANEL_MAX = 100;
const PANEL_STEP = 1;

/**
 * DYNAMIC TOKEN CONTROL (v12.0)
 *
 * Um despachante inteligente que renderiza o controle de UI correto baseado no schema do token.
 * Todo tipo de `SarakTokenValueType` tem ramo aqui (a trava `panel-contract:check` confere), e o valor gravado
 * é sempre do tipo que a validação do tema aceita.
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

    return (
        <>
            {renderControl(token, value, handleChange)}
            <ExceptionRelation token={token} draft={draft as Record<string, SarakTokenValue>} updateDraft={updateDraft} />
        </>
    );
};

function renderControl(token: SarakDesignToken, value: SarakTokenValue, onChange: (value: SarakTokenValue) => void): React.ReactNode {
    switch (token.type) {
        case 'slider':
        case 'number':
            return renderNumber(token, value, onChange);

        case 'color':
            return (
                <ColorControl
                    label={token.label}
                    value={value as string}
                    onChange={onChange}
                />
            );

        case 'boolean':
            return (
                <SwitchControl
                    label={token.label}
                    description={token.description}
                    value={!!value}
                    onChange={onChange}
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
                    onChange={onChange}
                />
            );

        case 'text':
        case 'string':
            return (
                <InputControl
                    label={token.label}
                    description={token.description}
                    value={value as string}
                    onChange={(next) => onChange(String(next))}
                />
            );

        case 'image':
        case 'file':
            return (
                <MediaUploaderControl
                    label={token.label}
                    description={token.description}
                    value={value as string}
                    onChange={(next) => onChange(next ?? '')}
                />
            );

        default:
            return (
                <div className="p-2 border border-dashed border-[var(--theme-border)] rounded opacity-50">
                    <span className="text-[var(--sarak-type-scale2xs,10px)] text-[var(--theme-muted)] uppercase">Tipo não suportado: {token.type}</span>
                </div>
            );
    }
}

function renderNumber(token: SarakDesignToken, value: SarakTokenValue, onChange: (value: SarakTokenValue) => void): React.ReactNode {
    const bounds = getTokenBounds(token);
    const common = {
        label: token.label,
        description: token.description,
        min: bounds.min ?? PANEL_MIN,
        max: bounds.max ?? PANEL_MAX,
        step: bounds.step ?? PANEL_STEP,
        unit: token.unit,
    };
    if (token.isResponsive) {
        return <ResponsiveSliderControl {...common} value={value} onChange={onChange} />;
    }
    return <SliderControl {...common} value={value as number} onChange={onChange} />;
}
