import React from 'react';
import { 
    ColorControl, 
    SliderControl, 
    SelectControl, 
    SwitchControl,
    InputControl,
    MediaUploaderControl
} from '../../components/DesignControls';
import { ExceptionRelation } from '../../components/ExceptionRelation';
import { FontSelectControl } from '../../components/controls/FontSelectControl';
import { getTokenBounds } from '../../../../core/Design/utils/tokenBounds';
import type { SarakDesignToken, SarakTokenValue } from '../../../../core/Design/types';

interface WidgetProps {
    token: SarakDesignToken;
    value: SarakTokenValue;
    onChange: (val: SarakTokenValue) => void;
}

/** Token `number`: o mesmo slider com faixa, passo e unidade do `slider` — nunca um campo solto que grava `NaN`. */
const NumberControl: React.FC<WidgetProps> = ({ token, value, onChange }) => {
    const bounds = getTokenBounds(token);
    return (
        <SliderControl
            label={token.label}
            description={token.description}
            value={value as number}
            min={bounds.min}
            max={bounds.max}
            step={bounds.step}
            unit={token.unit}
            onChange={(val) => onChange(val)}
        />
    );
};

export const ControlRegistry: Record<string, React.FC<WidgetProps>> = {
    color: (props) => <ColorControl label={props.token.label} description={props.token.description} {...props} value={props.value as string} onChange={(val) => props.onChange(val)} />,
    slider: (props) => (
        <SliderControl 
            label={props.token.label} 
            description={props.token.description}
            value={props.value as number} 
            min={getTokenBounds(props.token).min} 
            max={getTokenBounds(props.token).max} 
            step={getTokenBounds(props.token).step} 
            unit={props.token.unit}
            onChange={(val) => props.onChange(val)} 
        />
    ),
    select: (props) => <SelectControl label={props.token.label} description={props.token.description} options={props.token.constraints?.options || props.token.options || []} {...props} value={props.value as string} onChange={(val) => props.onChange(val)} />,
    font: (props) => <FontSelectControl label={props.token.label} description={props.token.description} options={props.token.constraints?.options || props.token.options || []} value={props.value as string} onChange={(val) => props.onChange(val)} />,
    switch: (props) => <SwitchControl label={props.token.label} description={props.token.description} {...props} value={props.value as boolean} onChange={(val) => props.onChange(val)} />,
    boolean: (props) => <SwitchControl label={props.token.label} description={props.token.description} {...props} value={props.value as boolean} onChange={(val) => props.onChange(val)} />,
    input: (props) => <InputControl label={props.token.label} description={props.token.description} placeholder={props.token.defaultValue as string} {...props} value={props.value as string} onChange={(val) => props.onChange(val)} />,
    text: (props) => <InputControl label={props.token.label} description={props.token.description} type="text" placeholder={props.token.defaultValue as string} {...props} value={props.value as string} onChange={(val) => props.onChange(String(val))} />,
    string: (props) => <InputControl label={props.token.label} description={props.token.description} type="text" placeholder={props.token.defaultValue as string} {...props} value={props.value as string} onChange={(val) => props.onChange(String(val))} />,
    number: (props) => <NumberControl {...props} />,
    image: (props) => <MediaUploaderControl label={props.token.label} description={props.token.description} {...props} value={props.value as string} onChange={(val) => props.onChange(val || '')} />,
    file: (props) => <MediaUploaderControl label={props.token.label} description={props.token.description} {...props} value={props.value as string} onChange={(val) => props.onChange(val || '')} />
};

const DEVICE_BADGES = {
    mob: { badge: 'Só no Mobile', device: 'Mobile' },
    tab: { badge: 'Só no Tablet', device: 'Tablet' },
    desk: { badge: 'Desktop', device: 'Desktop' }
} as const;

const deviceBadgeTitle = (device: string) =>
    `Este valor vale só para ${device}. Troque o dispositivo na barra do preview para editar os outros.`;

const DeviceBadge: React.FC<{ deviceKey: keyof typeof DEVICE_BADGES }> = ({ deviceKey }) => (
    <span
        data-testid="token-device-badge"
        title={deviceBadgeTitle(DEVICE_BADGES[deviceKey].device)}
        className="mb-1 inline-block rounded-md border border-[var(--theme-border)] px-1.5 text-[var(--sarak-type-scale-caption,12px)] font-medium normal-case tracking-normal text-[var(--theme-primary)]"
    >
        {DEVICE_BADGES[deviceKey].badge}
    </span>
);

interface TokenControlProps {
    token: SarakDesignToken;
    value: SarakTokenValue;
    onChange: (val: SarakTokenValue) => void;
    previewDevice?: string;
    /** Rascunho inteiro e o gravador: só com eles o controle mostra a relação mestre × canto (raios). */
    draft?: Record<string, SarakTokenValue | undefined>;
    updateDraft?: (id: string, value: SarakTokenValue) => void;
}

export const TokenControl = ({ token, value, onChange, previewDevice = 'desktop', draft, updateDraft }: TokenControlProps) => {
    const Widget = ControlRegistry[token.type];
    if (!Widget) return null;

    const isResponsiveObj = typeof value === 'object' && value !== null && 'mob' in value;
    const deviceKey = previewDevice === 'smartphone' ? 'mob' : previewDevice === 'tablet' ? 'tab' : 'desk';
    
    // Fallback: Se for responsivo mas não tiver o objeto (migração de presets antigos)
    const displayValue = isResponsiveObj ? (value as Record<string, string | number | boolean | null>)[deviceKey] : value;

    const handleChange = (val: SarakTokenValue) => {
        if (token.isResponsive) {
            // Garante que o valor salvo preserve os outros breakpoints
            const currentObj: Record<string, unknown> = isResponsiveObj ? { ...(value as Record<string, unknown>) } : { mob: value, tab: value, desk: value };
            currentObj[deviceKey] = val;
            onChange(currentObj as SarakTokenValue);
        } else {
            onChange(val);
        }
    };

    const widget = <Widget token={token} value={displayValue as SarakTokenValue} onChange={handleChange} />;
    const relation = draft && updateDraft ? <ExceptionRelation token={token} draft={draft} updateDraft={updateDraft} /> : null;
    if (!token.isResponsive) return relation ? <div>{widget}{relation}</div> : widget;

    return (
        <div>
            <DeviceBadge deviceKey={deviceKey} />
            {widget}
            {relation}
        </div>
    );
};
