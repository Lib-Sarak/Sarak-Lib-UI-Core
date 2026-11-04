import React, { useEffect, useId, useState } from 'react';
import { isValidColor } from '../../../core/Provider/utils/validation';
import { useLibraryText } from '../../../core/i18n/useLibraryText';
import { SarakFlex } from '../Layouts/SarakFlex';
import { SarakFormGroup } from '../Layouts/SarakFormGroup';
import { SarakInput } from './SarakInput';
import { contrastRatio, toPickerHex } from './internal/colorMath';

export interface SarakColorInputProps {
    /** Cor atual: hex, `rgb()`/`rgba()`, `var()` ou `color-mix()`, o que a validação do tema aceita. */
    value: string;
    /** Recebe a cor nova, já conferida; o texto que não é cor não chega aqui. */
    onChange: (value: string) => void;
    /** Rótulo do campo; omitido, o campo fica sem rótulo visível. */
    label?: string;
    /** Mensagem de erro do host; vence o aviso de cor inválida só quando o texto digitado é válido. */
    error?: string;
    disabled?: boolean;
    /** Marca o campo de texto como obrigatório para o navegador e o leitor de tela. */
    required?: boolean;
    id?: string;
    /** Cor contra a qual o contraste é medido (o fundo do texto, por exemplo); omitida, não há alerta. */
    contrastAgainst?: string;
    /** Razão mínima do alerta de contraste; omitida, 4,5. Só mede hex e `rgb()` literais. */
    minContrast?: number;
    className?: string;
}

const DEFAULT_MIN_CONTRAST = 4.5;
const RATIO_DIGITS = 2;

/**
 * Seletor de cor com o seletor nativo e o campo de texto. O texto é a verdade: só chega ao `onChange` o que a
 * validação do tema aceita; o seletor nativo edita o canal opaco.
 *
 * @sarak-encapsula input — o `<input type="color">` é o seletor do sistema, sem equivalente em átomo.
 */
export const SarakColorInput = ({
    value, onChange, label, error, disabled, required, id, contrastAgainst, minContrast = DEFAULT_MIN_CONTRAST, className,
}: SarakColorInputProps): React.ReactElement => {
    const text = useLibraryText();
    const generatedId = useId();
    const fieldId = id ?? generatedId;
    const [draft, setDraft] = useState(value);
    const [invalid, setInvalid] = useState(false);

    useEffect(() => {
        setDraft(value);
        setInvalid(false);
    }, [value]);

    const commitDraft = (): void => {
        const trimmed = draft.trim();
        if (trimmed === value) return;
        if (!isValidColor(trimmed)) {
            setInvalid(true);
            return;
        }
        setInvalid(false);
        onChange(trimmed);
    };

    const ratio = contrastAgainst === undefined ? null : contrastRatio(value, contrastAgainst);
    const lowContrast = ratio !== null && ratio < minContrast;
    const swatchLabel = label ? `${text('colorInputSwatch')}: ${label}` : text('colorInputSwatch');

    return (
        <SarakFormGroup className={className}>
            <SarakFlex align="flex-end" gap="spacing-sm" wrap={false}>
                <input
                    type="color"
                    value={toPickerHex(value)}
                    disabled={disabled}
                    aria-label={swatchLabel}
                    onChange={(event) => onChange(event.target.value)}
                    style={{
                        flexShrink: 0, padding: 0, cursor: disabled ? 'not-allowed' : 'pointer',
                        inlineSize: 'calc(var(--sarak-layout-gap-md, 16px) * 2.5)',
                        blockSize: 'calc(var(--sarak-layout-gap-md, 16px) * 2.5)',
                        background: 'transparent', border: 'var(--sarak-border-width, 1px) solid var(--theme-border)',
                        borderRadius: 'var(--sarak-card-radius, 10px)',
                    }}
                />
                <SarakInput
                    id={fieldId}
                    label={label}
                    value={draft}
                    disabled={disabled}
                    required={required}
                    spellCheck={false}
                    fullWidth
                    error={invalid ? text('colorInputInvalid') : error}
                    onChange={(event) => { setDraft(event.target.value); setInvalid(false); }}
                    onBlur={commitDraft}
                    onKeyDown={(event) => { if (event.key === 'Enter') commitDraft(); }}
                />
            </SarakFlex>
            {lowContrast && (
                <p role="status" className="text-sm" style={{ color: 'var(--sarak-status-warning-color, var(--theme-warning, #f59e0b))' }}>
                    {text('colorInputLowContrast', { ratio: ratio.toFixed(RATIO_DIGITS), min: minContrast })}
                </p>
            )}
        </SarakFormGroup>
    );
};
