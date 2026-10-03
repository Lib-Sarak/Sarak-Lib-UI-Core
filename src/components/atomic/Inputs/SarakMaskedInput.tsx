import React, { useState } from 'react';
import { SarakInput, type SarakInputProps } from './SarakInput';
import { formatMaskedValue } from './internal/mask';
import { useInputCaret } from './internal/useInputCaret';

export interface SarakMaskedInputProps
    extends Omit<SarakInputProps, 'defaultValue' | 'label' | 'onChange' | 'type' | 'value'> {
    /**
     * Padrão com `0` nas posições numéricas ou preset `cpf`, `cnpj` e `phone`.
     * É obrigatório; `phone` alterna entre telefone fixo e celular pelo total de dígitos.
     * Um padrão sem `0` deixa o campo somente com os dígitos, sem pontuação.
     */
    mask: string;
    /** Valor limpo controlado. Omitido, usa `defaultValue`; ao fornecê-lo, o pai deve atualizá-lo após `onChange`. */
    value?: string;
    /** Valor inicial sem pontuação. Omitido, o campo começa vazio; ignorado após a montagem ou quando `value` é informado. */
    defaultValue?: string;
    /** Rótulo visível encaminhado ao `SarakInput`. Omitido, não há rótulo; forneça um nome acessível. */
    label?: string;
    /** Emite somente os dígitos aceitos pelo padrão. Omitido, mudanças não são notificadas por callback. */
    onChange?: (cleanValue: string) => void;
    /** Teclado sugerido ao dispositivo. Omitido, solicita teclado numérico; isso não valida a entrada. */
    inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
}

export const SarakMaskedInput = ({
    mask,
    value,
    defaultValue,
    label,
    onChange,
    inputMode = 'numeric',
    ...inputProps
}: SarakMaskedInputProps): React.ReactElement => {
    const [internalValue, setInternalValue] = useState(defaultValue ?? '');
    const cleanValue = value ?? internalValue;
    const formattedValue = formatMaskedValue(cleanValue, mask).value;
    const { inputContainerRef, captureCaret } = useInputCaret(formattedValue);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        const inputValue = event.currentTarget.value;
        const nextValue = formatMaskedValue(inputValue, mask);
        captureCaret(inputValue, event.currentTarget.selectionStart);
        if (value === undefined) setInternalValue(nextValue.cleanValue);
        onChange?.(nextValue.cleanValue);
    };

    return (
        <div ref={inputContainerRef}>
            <SarakInput
                {...inputProps}
                type="text"
                inputMode={inputMode}
                label={label}
                value={formattedValue}
                onChange={handleChange}
            />
        </div>
    );
};
