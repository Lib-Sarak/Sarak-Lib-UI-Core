import React from 'react';
import { HelpTooltip } from './HelpTooltip';
import { composeColor, pickerHex, resolveColorParts } from './colorParts';
import { isValidColor } from '../../../../core/Provider/utils/validation';

interface ColorControlProps {
    label: string;
    description?: string;
    value: string | undefined | null;
    onChange: (value: string) => void;
}

const ALPHA_STEPS = 100;

/**
 * Controle de cor do painel. O texto é a verdade: aceita o que a validação do tema aceita (hex, `rgba()`,
 * `var()`, `color-mix()`) e só o grava depois de conferi-lo. O seletor nativo só entende hex, então ele edita o
 * canal opaco e **preserva o alfa** que a cor já tinha; o alfa tem controle próprio.
 */
export const ColorControl: React.FC<ColorControlProps> = ({ label, description, value, onChange }) => {
    const DISPLAY_DEFAULT = 'var(--sarak-text-main,#ffffff)';
    const [text, setText] = React.useState(value || DISPLAY_DEFAULT);
    const [invalid, setInvalid] = React.useState(false);

    React.useEffect(() => {
        setText(value || DISPLAY_DEFAULT);
        setInvalid(false);
    }, [value]);

    // A cor que o valor desenha — também a de `var()`, `color-mix()` e `hsl()`: o seletor e o alfa partem dela,
    // e não de um branco que o valor nunca teve.
    const parts = resolveColorParts(value || DISPLAY_DEFAULT);
    const alpha = parts ? parts.alpha : 1;

    const commit = (next: string) => {
        setText(next);
        setInvalid(false);
        onChange(next);
    };

    const commitText = () => {
        const trimmed = text.trim();
        if (trimmed === (value || '')) return;
        if (isValidColor(trimmed)) commit(trimmed);
        else setInvalid(true);
    };

    return (
        <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[var(--color-theme-card,rgba(15,23,42,0.6))] border border-[var(--theme-border)] group transition-all hover:bg-[var(--theme-border)]">
            <div className="flex flex-col gap-1 min-w-0 flex-1">
                <span className="text-[var(--sarak-type-scale-caption,12px)] font-semibold normal-case tracking-normal text-[var(--theme-muted)] flex items-center gap-1.5">
                    {label}
                    <HelpTooltip label={label} description={description} />
                </span>
                <input
                    type="text"
                    value={text}
                    spellCheck={false}
                    aria-label={`Cor de ${label}`}
                    aria-invalid={invalid}
                    onChange={(e) => setText(e.target.value)}
                    onBlur={commitText}
                    onKeyDown={(e) => { if (e.key === 'Enter') commitText(); }}
                    className={`w-full bg-transparent text-[var(--sarak-type-scale3xs,9px)] font-mono text-[var(--theme-muted)] outline-none border-b ${invalid ? 'border-[var(--sarak-status-error-color,#ef4444)]' : 'border-transparent focus:border-[var(--theme-border)]'}`}
                />
                {parts && (
                    <input
                        type="range"
                        min={0}
                        max={ALPHA_STEPS}
                        value={Math.round(alpha * ALPHA_STEPS)}
                        aria-label={`Opacidade de ${label}`}
                        onChange={(e) => commit(composeColor(parts.hex, Number(e.target.value) / ALPHA_STEPS))}
                        className="w-full"
                    />
                )}
            </div>
            <div className="relative w-8 h-8 shrink-0 rounded-lg overflow-hidden border border-[var(--theme-border)] shadow-lg ring-1 ring-[var(--color-theme-card,rgba(15,23,42,0.6))]">
                <input
                    type="color"
                    value={pickerHex(value || DISPLAY_DEFAULT)}
                    aria-label={`Seletor de ${label}`}
                    onChange={(e) => commit(composeColor(e.target.value, alpha))}
                    className="absolute inset-0 w-[200%] h-[200%] -top-[50%] -left-[50%] cursor-pointer border-none bg-transparent"
                />
                <div className="absolute inset-0 pointer-events-none ring-inset ring-1 ring-[var(--theme-border)]" />
            </div>
        </div>
    );
};
