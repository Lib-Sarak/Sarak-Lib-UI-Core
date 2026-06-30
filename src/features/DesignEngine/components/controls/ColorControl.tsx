import React from 'react';
import { HelpTooltip } from './HelpTooltip';

interface ColorControlProps {
    label: string;
    description?: string;
    value: string | undefined | null;
    onChange: (value: string) => void;
}

export const ColorControl: React.FC<ColorControlProps> = ({ label, description, value, onChange }) => {
    const [localColor, setLocalColor] = React.useState(value || 'var(--sarak-text-main,#ffffff)');

    // Sincroniza localmente para evitar engasgos no draft
    const sanitizeColor = (color: unknown) => {
        if (typeof color !== 'string') return 'var(--sarak-text-main,#ffffff)';
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
        if (color === 'transparent') return 'var(--sarak-text-main,#ffffff)';
        return 'var(--sarak-text-main,#ffffff)';
    };

    React.useEffect(() => {
        setLocalColor(value || 'var(--sarak-text-main,#ffffff)');
    }, [value]);

    return (
        <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-theme-card,#1e293b)] border border-[var(--theme-border)] group transition-all hover:bg-[var(--theme-border)]">
            <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--theme-muted)] flex items-center gap-1.5">
                    {label}
                    <HelpTooltip label={label} description={description} />
                </span>
                <span className="text-[9px] font-mono text-[var(--theme-muted)] uppercase">{localColor}</span>
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
