import React from 'react';
import { 
    ColorControl, 
    SliderControl, 
    SelectControl, 
    SwitchControl,
    InputControl,
    MediaUploaderControl
} from '../../components/DesignControls';
import type { DesignToken, SarakTokenValue } from '../../../../core/Design/types';

interface WidgetProps {
    token: DesignToken;
    value: SarakTokenValue;
    onChange: (val: SarakTokenValue) => void;
}

export const ControlRegistry: Record<string, React.FC<WidgetProps>> = {
    color: (props) => <ColorControl label={props.token.label} {...props} value={props.value as string} onChange={(val) => props.onChange(val)} />,
    slider: (props) => (
        <SliderControl 
            label={props.token.label} 
            value={props.value as number} 
            min={props.token.constraints?.min} 
            max={props.token.constraints?.max} 
            step={props.token.constraints?.step} 
            unit={props.token.unit}
            onChange={(val) => props.onChange(val)} 
        />
    ),
    select: (props) => <SelectControl label={props.token.label} options={props.token.constraints?.options || props.token.options || []} {...props} value={props.value as string} onChange={(val) => props.onChange(val)} />,
    font: (props) => <SelectControl label={props.token.label} options={props.token.constraints?.options || props.token.options || []} isFont={true} {...props} value={props.value as string} onChange={(val) => props.onChange(val)} />,
    switch: (props) => <SwitchControl label={props.token.label} description={props.token.description} {...props} value={props.value as boolean} onChange={(val) => props.onChange(val)} />,
    boolean: (props) => <SwitchControl label={props.token.label} description={props.token.description} {...props} value={props.value as boolean} onChange={(val) => props.onChange(val)} />,
    input: (props) => <InputControl label={props.token.label} placeholder={props.token.defaultValue as string} {...props} value={props.value as string} onChange={(val) => props.onChange(val)} />,
    text: (props) => <InputControl label={props.token.label} type="text" placeholder={props.token.defaultValue as string} {...props} value={props.value as string} onChange={(val) => props.onChange(val)} />,
    number: (props) => <InputControl label={props.token.label} type="number" placeholder={props.token.defaultValue as string} {...props} value={props.value as string} onChange={(val) => props.onChange(val)} />,
    image: (props) => <MediaUploaderControl label={props.token.label} {...props} value={props.value as string} onChange={(val) => props.onChange(val || '')} />
};

export const TokenControl = ({ token, value, onChange, previewDevice = 'desktop' }: { token: DesignToken, value: SarakTokenValue, onChange: (val: SarakTokenValue) => void, previewDevice?: string }) => {
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

    return <Widget token={token} value={displayValue as SarakTokenValue} onChange={handleChange} />;
};
