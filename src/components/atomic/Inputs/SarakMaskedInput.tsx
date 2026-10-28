import React, { useState } from 'react';
import { SarakInput, type SarakInputProps } from './SarakInput';
import { formatMaskedValue } from './internal/mask';
import { useInputCaret } from './internal/useInputCaret';
import { useLibraryText } from '../../../core/i18n/useLibraryText';
import { sarakIsValidCpf, sarakIsValidCnpj } from './internal/documents';

export interface SarakMaskedInputProps
    extends Omit<SarakInputProps, 'defaultValue' | 'label' | 'onChange' | 'type' | 'value'> {
    /**
     * Padrão com `0` nas posições numéricas ou preset `cpf`, `cnpj` e `phone`.
     * É obrigatório; `phone` alterna entre telefone fixo e celular pelo total de dígitos,
     * e `cnpj` aceita letras e números nas doze primeiras posições.
     */
    mask: string;
    /** Valor limpo controlado. Omitido, usa `defaultValue`; ao fornecê-lo, o pai deve atualizá-lo após `onChange`. */
    value?: string;
    /** Valor inicial sem pontuação. Omitido, o campo começa vazio; ignorado após a montagem ou quando `value` é informado. */
    defaultValue?: string;
    /** Rótulo visível encaminhado ao `SarakInput`. Omitido, não há rótulo; forneça um nome acessível. */
    label?: string;
    /** Emite os caracteres aceitos pelo padrão. Omitido, mudanças não são notificadas por callback. */
    onChange?: (cleanValue: string) => void;
    /** Confere CPF/CNPJ no blur e anuncia o dígito verificador inválido. Omitida, não valida. */
    validate?: boolean;
    /** Teclado sugerido ao dispositivo. CNPJ usa texto por padrão; os demais usam numérico. */
    inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
}

interface SarakMaskedInputViewProps {
    inputProps: Omit<SarakMaskedInputProps, 'mask' | 'value' | 'defaultValue' | 'onChange' | 'validate' | 'inputMode' | 'label' | 'error' | 'onBlur'>;
    label?: string;
    inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
    formattedValue: string;
    error?: string;
    onChange: React.ChangeEventHandler<HTMLInputElement>;
    onBlur: React.FocusEventHandler<HTMLInputElement>;
}

const SarakMaskedInputView = (props: SarakMaskedInputViewProps): React.ReactElement => (
    <SarakInput
        {...props.inputProps}
        type="text"
        inputMode={props.inputMode}
        label={props.label}
        value={props.formattedValue}
        onChange={props.onChange}
        onBlur={props.onBlur}
        error={props.error}
    />
);

interface SarakMaskedInputRuntime {
    cleanValue: string;
    formatted: ReturnType<typeof formatMaskedValue>;
    formattedValue: string;
    inputContainerRef: ReturnType<typeof useInputCaret>['inputContainerRef'];
    captureCaret: ReturnType<typeof useInputCaret>['captureCaret'];
    setInternalValue: React.Dispatch<React.SetStateAction<string>>;
    validationError?: string;
    setValidationError: React.Dispatch<React.SetStateAction<string | undefined>>;
}

const useSarakMaskedInputRuntime = (props: SarakMaskedInputProps): SarakMaskedInputRuntime => {
    const [internalValue, setInternalValue] = useState(props.defaultValue ?? '');
    const [validationError, setValidationError] = useState<string>();
    const cleanValue = props.value ?? internalValue;
    const formatted = formatMaskedValue(cleanValue, props.mask);
    const formattedValue = formatted.value;
    const { inputContainerRef, captureCaret } = useInputCaret(formattedValue, props.mask === 'cnpj');
    return {
        cleanValue, formatted, formattedValue, inputContainerRef, captureCaret,
        setInternalValue, validationError, setValidationError,
    };
};

interface SarakMaskedInputHandlers {
    onChange: React.ChangeEventHandler<HTMLInputElement>;
    onBlur: React.FocusEventHandler<HTMLInputElement>;
}

type InvalidDocumentMessageKey = 'invalidCpfMessage' | 'invalidCnpjMessage';

const resolveInvalidDocumentMessageKey = (mask: string, cleanValue: string): InvalidDocumentMessageKey | undefined => {
    if (mask === 'cpf' && !sarakIsValidCpf(cleanValue)) return 'invalidCpfMessage';
    if (mask === 'cnpj' && !sarakIsValidCnpj(cleanValue)) return 'invalidCnpjMessage';
    return undefined;
};

const useSarakMaskedInputHandlers = (
    props: SarakMaskedInputProps,
    runtime: SarakMaskedInputRuntime,
): SarakMaskedInputHandlers => {
    const text = useLibraryText();
    const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        const inputValue = event.currentTarget.value;
        const nextValue = formatMaskedValue(inputValue, props.mask);
        runtime.captureCaret(inputValue, event.currentTarget.selectionStart);
        if (props.value === undefined) runtime.setInternalValue(nextValue.cleanValue);
        if (props.validate) runtime.setValidationError(undefined);
        props.onChange?.(nextValue.cleanValue);
    };

    const onBlur = (event: React.FocusEvent<HTMLInputElement>): void => {
        if (props.validate && runtime.formatted.cleanValue) {
            const messageKey = resolveInvalidDocumentMessageKey(props.mask, runtime.formatted.cleanValue);
            runtime.setValidationError(messageKey ? text(messageKey) : undefined);
        }
        props.onBlur?.(event);
    };
    return { onChange, onBlur };
};

const MASKED_INPUT_CONTROL_PROP_NAMES = new Set([
    'mask', 'value', 'defaultValue', 'label', 'onChange', 'onBlur', 'error', 'validate', 'inputMode',
]);

const getMaskedInputNativeProps = (props: SarakMaskedInputProps): SarakMaskedInputViewProps['inputProps'] => {
    const inputProps = Object.fromEntries(
        Object.entries(props).filter(([name]) => !MASKED_INPUT_CONTROL_PROP_NAMES.has(name)),
    );
    return inputProps as SarakMaskedInputViewProps['inputProps'];
};

const resolveInputMode = (
    inputMode: SarakMaskedInputProps['inputMode'],
    mask: string,
): SarakMaskedInputProps['inputMode'] => inputMode ?? (mask === 'cnpj' ? 'text' : 'numeric');

export const SarakMaskedInput = (props: SarakMaskedInputProps): React.ReactElement => {
    const runtime = useSarakMaskedInputRuntime(props);
    const handlers = useSarakMaskedInputHandlers(props, runtime);
    return (
        <div ref={runtime.inputContainerRef}>
            <SarakMaskedInputView
                inputProps={getMaskedInputNativeProps(props)}
                inputMode={resolveInputMode(props.inputMode, props.mask)}
                label={props.label}
                formattedValue={runtime.formattedValue}
                onChange={handlers.onChange}
                onBlur={handlers.onBlur}
                error={runtime.validationError ?? props.error}
            />
        </div>
    );
};
