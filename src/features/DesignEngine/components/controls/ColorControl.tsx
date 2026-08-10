import React from 'react';
import { HelpTooltip } from './HelpTooltip';

interface ColorControlProps {
    label: string;
    description?: string;
    value: string | undefined | null;
    onChange: (value: string) => void;
}

export const ColorControl: React.FC<ColorControlProps> = ({ label, description, value, onChange }) => {
    const DISPLAY_DEFAULT = 'var(--sarak-text-main,#ffffff)';
    // Spec 40 §2.3: `<input type="color">` só aceita hex real — nunca `var(...)`. O
    // display (rótulo textual abaixo do swatch) pode mostrar a CSS var crua, mas o
    // valor entregue ao input nativo tem que SEMPRE resolver para hex.
    // sarak-allow-hardcode: fallback do <input type="color"> nativo — value só aceita hex.
    const HEX_FALLBACK = '#ffffff';
    const [localColor, setLocalColor] = React.useState(value || DISPLAY_DEFAULT);

    // Sincroniza localmente para evitar engasgos no draft
    const sanitizeColor = (color: unknown) => {
        if (typeof color !== 'string') return HEX_FALLBACK;
        if (color.startsWith('#')) return color;
        if (color.startsWith('rgba')) {
            const matches = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
            if (matches) {
                const r = parseInt(matches[1]).toString(16).padStart(2, '0');
                const g = parseInt(matches[2]).toString(16).padStart(2, '0');
                const b = parseInt(matches[3]).toString(16).padStart(2, '0');
                return `#${r}${g}${b}`;
            }
        }
        return HEX_FALLBACK;
    };

    React.useEffect(() => {
        setLocalColor(value || DISPLAY_DEFAULT);
    }, [value]);

    return (
        <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-theme-card,#1e293b)] border border-[var(--theme-border)] group transition-all hover:bg-[var(--theme-border)]">
            <div className="flex flex-col gap-0.5">
                <span className="text-[var(--sarak-type-scale2xs,10px)] font-black uppercase tracking-widest text-[var(--theme-muted)] flex items-center gap-1.5">
                    {label}
                    <HelpTooltip label={label} description={description} />
                </span>
                <span className="text-[var(--sarak-type-scale3xs,9px)] font-mono text-[var(--theme-muted)] uppercase">{localColor}</span>
            </div>
            <div className="flex items-center gap-3">
                <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-[var(--theme-border)] shadow-lg ring-1 ring-[var(--color-theme-card,#1e293b)]">
                    <input 
                        type="color" 
                        value={sanitizeColor(localColor)} 
                        onChange={(e) => {
                            setLocalColor(e.target.value);
                            onChange(e.target.value);
                        }}
                        className="absolute inset-0 w-[200%] h-[200%] -top-[50%] -left-[50%] cursor-pointer border-none bg-transparent"
                    />
                    <div className="absolute inset-0 pointer-events-none ring-inset ring-1 ring-[var(--theme-border)]" />
                </div>
            </div>
        </div>
    );
};
