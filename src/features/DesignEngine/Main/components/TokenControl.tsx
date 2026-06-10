import React from 'react';
import { 
    ColorControl, 
    SliderControl, 
    SelectControl, 
    SwitchControl,
    InputControl,
    MediaUploaderControl
} from '../../components/DesignControls';

export const ControlRegistry: Record<string, React.FC<any>> = {
    color: (props) => <ColorControl label={props.token.label} {...props} />,
    slider: (props) => (
        <SliderControl 
            label={props.token.label} 
            value={props.value} 
            min={props.token.constraints?.min} 
            max={props.token.constraints?.max} 
            step={props.token.constraints?.step} 
            unit={props.token.unit}
            onChange={props.onChange} 
        />
    ),
    select: (props) => <SelectControl label={props.token.label} options={props.token.constraints?.options || props.token.options} {...props} />,
    font: (props) => <SelectControl label={props.token.label} options={props.token.constraints?.options || props.token.options} isFont={true} {...props} />,
    switch: (props) => <SwitchControl label={props.token.label} description={props.token.description} {...props} />,
    boolean: (props) => <SwitchControl label={props.token.label} description={props.token.description} {...props} />,
    input: (props) => <InputControl label={props.token.label} placeholder={props.token.defaultValue} {...props} />,
    text: (props) => <InputControl label={props.token.label} type="text" placeholder={props.token.defaultValue} {...props} />,
    number: (props) => <InputControl label={props.token.label} type="number" placeholder={props.token.defaultValue} {...props} />,
    image: (props) => <MediaUploaderControl label={props.token.label} {...props} />
};

export const TokenControl = ({ token, value, onChange, previewDevice = 'desktop' }: { token: any, value: any, onChange: (val: any) => void, previewDevice?: string }) => {
    const Widget = ControlRegistry[token.type];
    if (!Widget) return null;

    const isResponsiveObj = typeof value === 'object' && value !== null && 'mob' in value;
    const deviceKey = previewDevice === 'smartphone' ? 'mob' : previewDevice === 'tablet' ? 'tab' : 'desk';
    
    // Fallback: Se for responsivo mas não tiver o objeto (migração de presets antigos)
    const displayValue = isResponsiveObj ? value[deviceKey] : value;

    const handleChange = (val: any) => {
        if (token.isResponsive) {
            // Garante que o valor salvo preserve os outros breakpoints
            const currentObj = isResponsiveObj ? { ...value } : { mob: value, tab: value, desk: value };
            currentObj[deviceKey] = val;
            onChange(currentObj);
        } else {
            onChange(val);
        }
    };

    return <Widget token={token} value={displayValue} onChange={handleChange} />;
};
