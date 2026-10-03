import React, { useState } from 'react';
import { useSarakUIOptional } from '../../../core/Provider/SarakUIProvider';
import { SarakInput, type SarakInputProps } from './SarakInput';
import { formatCurrencyEditValue, formatCurrencyValue, parseCurrencyValue } from './internal/currency';
import { useInputCaret } from './internal/useInputCaret';

const DEFAULT_CURRENCY = 'BRL';
const DEFAULT_LOCALE = 'pt-BR';

export interface SarakCurrencyInputProps
    extends Omit<SarakInputProps, 'defaultValue' | 'label' | 'onChange' | 'type' | 'value'> {
    /** Valor numérico controlado; `null` representa campo vazio. Omitido, usa `defaultValue`; o pai deve atualizar após `onChange`. */
    value?: number | null;
    /** Valor numérico inicial. Omitido, o campo começa vazio; ignorado após a montagem ou quando `value` é informado. */
    defaultValue?: number | null;
    /** Moeda ISO 4217 de `Intl.NumberFormat`. Omitida, usa BRL; o estilo monetário aparece ao sair do campo; código inválido gera `RangeError`. */
    currency?: string;
    /** Locale dos separadores durante a edição e da formatação ao sair do campo. Omitida, acompanha o idioma do Provider; sem Provider, usa `pt-BR`. Textos colados devem segui-la. */
    locale?: string;
    /** Rótulo visível encaminhado ao `SarakInput`. Omitido, não há rótulo; forneça um nome acessível. */
    label?: string;
    /** Emite número ou `null` para o campo vazio, nunca o texto formatado. Omitido, mudanças não são notificadas. */
    onChange?: (cleanValue: number | null) => void;
    /** Teclado sugerido ao dispositivo. Omitido, solicita teclado decimal na locale atual. */
    inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
}

interface CurrencyInputContext {
    currency: string;
    locale: string;
    value: number | null;
    isControlled: boolean;
    setInternalValue: React.Dispatch<React.SetStateAction<number | null>>;
    setEditingValue: React.Dispatch<React.SetStateAction<string | null>>;
    captureCaret: (value: string, cursorPosition: number | null) => void;
    onChange?: (cleanValue: number | null) => void;
    onFocus?: React.FocusEventHandler<HTMLInputElement>;
    onBlur?: React.FocusEventHandler<HTMLInputElement>;
}

const createChangeHandler = (context: CurrencyInputContext): React.ChangeEventHandler<HTMLInputElement> => (event) => {
    const inputValue = event.currentTarget.value;
    const parsedValue = parseCurrencyValue(inputValue, context.locale);
    context.captureCaret(inputValue, event.currentTarget.selectionStart);
    context.setEditingValue(inputValue);
    if (!context.isControlled) context.setInternalValue(parsedValue.value);
    context.onChange?.(parsedValue.value);
};

const createFocusHandler = (context: CurrencyInputContext): React.FocusEventHandler<HTMLInputElement> => (event) => {
    context.captureCaret(event.currentTarget.value, event.currentTarget.selectionStart);
    context.setEditingValue(formatCurrencyEditValue(context.value, context.locale, context.currency));
    context.onFocus?.(event);
};

const createBlurHandler = (context: CurrencyInputContext): React.FocusEventHandler<HTMLInputElement> => (event) => {
    const parsedValue = parseCurrencyValue(event.currentTarget.value, context.locale);
    context.captureCaret(event.currentTarget.value, event.currentTarget.selectionStart);
    if (!context.isControlled) context.setInternalValue(parsedValue.value);
    context.setEditingValue(null);
    context.onBlur?.(event);
};

export const SarakCurrencyInput = ({
    value,
    defaultValue,
    currency = DEFAULT_CURRENCY,
    locale,
    label,
    onChange,
    inputMode = 'decimal',
    ...inputProps
}: SarakCurrencyInputProps): React.ReactElement => {
    const sarak = useSarakUIOptional();
    const effectiveLocale = locale ?? sarak?.language ?? DEFAULT_LOCALE;
    const [internalValue, setInternalValue] = useState<number | null>(defaultValue ?? null);
    const [editingValue, setEditingValue] = useState<string | null>(null);
    const effectiveValue = value === undefined ? internalValue : value;
    const formattedValue = editingValue ?? formatCurrencyValue(effectiveValue, effectiveLocale, currency);
    const { inputContainerRef, captureCaret } = useInputCaret(formattedValue);
    const context: CurrencyInputContext = {
        currency, locale: effectiveLocale, value: effectiveValue, isControlled: value !== undefined,
        setInternalValue, setEditingValue, captureCaret, onChange,
        onFocus: inputProps.onFocus, onBlur: inputProps.onBlur,
    };

    return (
        <div ref={inputContainerRef}>
            <SarakInput
                {...inputProps}
                type="text"
                inputMode={inputMode}
                label={label}
                value={formattedValue}
                onChange={createChangeHandler(context)}
                onFocus={createFocusHandler(context)}
                onBlur={createBlurHandler(context)}
            />
        </div>
    );
};
