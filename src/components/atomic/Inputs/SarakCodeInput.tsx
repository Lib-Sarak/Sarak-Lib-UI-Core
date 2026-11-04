import React, { useId, useRef } from 'react';
import { useLibraryText } from '../../../core/i18n/useLibraryText';
import { SarakFlex } from '../Layouts/SarakFlex';
import { SarakFieldError } from '../Feedback/SarakFieldError';
import { SarakInput } from './SarakInput';

export interface SarakCodeInputProps {
    /** Código digitado até agora (menor que `length` enquanto incompleto). */
    value: string;
    onChange: (value: string) => void;
    /** Chamado uma vez quando o código chega ao tamanho completo. */
    onComplete?: (value: string) => void;
    /** Quantos caracteres tem o código; omitido, 6. */
    length?: number;
    /** `numeric` aceita só dígitos e abre o teclado numérico; omitido, `numeric`. */
    charset?: 'numeric' | 'alphanumeric';
    /** Nome do grupo lido pelo leitor de tela; omitido, usa o catálogo no idioma ativo. */
    label?: string;
    error?: string;
    disabled?: boolean;
    /** Foca a primeira célula ao montar; omitido, `false`. */
    autoFocus?: boolean;
    className?: string;
}

const DEFAULT_LENGTH = 6;

const ACCEPTED: Record<NonNullable<SarakCodeInputProps['charset']>, RegExp> = {
    numeric: /[^0-9]/g,
    alphanumeric: /[^0-9a-zA-Z]/g,
};

/** Código de verificação (OTP): uma célula por caractere, com avanço, `Backspace`, setas e colagem do código inteiro. */
export const SarakCodeInput = ({
    value, onChange, onComplete, length = DEFAULT_LENGTH, charset = 'numeric', label, error, disabled, autoFocus, className,
}: SarakCodeInputProps): React.ReactElement => {
    const text = useLibraryText();
    const fieldId = useId();
    const groupRef = useRef<HTMLDivElement | null>(null);
    const clean = (raw: string): string => raw.replace(ACCEPTED[charset], '');

    const focusCell = (index: number): void => {
        const cells = groupRef.current?.querySelectorAll<HTMLInputElement>('input');
        cells?.[Math.max(0, Math.min(index, length - 1))]?.focus();
    };

    const publish = (next: string): void => {
        onChange(next);
        if (next.length === length) onComplete?.(next);
    };

    const write = (index: number, raw: string): void => {
        const typed = clean(raw);
        // Caractere recusado não mexe no valor: a célula volta ao que tinha e o foco fica onde está.
        if (typed === '' && raw !== '') return;
        // O valor é contínuo; célula depois de uma lacuna escreve na posição livre, e o foco acompanha.
        const at = Math.min(index, value.length);
        const next = (value.slice(0, at) + typed + value.slice(at + Math.max(typed.length, 1))).slice(0, length);
        if (next !== value) publish(next);
        focusCell(at + typed.length);
    };

    const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>): void => {
        if (event.key === 'ArrowLeft') focusCell(index - 1);
        if (event.key === 'ArrowRight') focusCell(index + 1);
        if (event.key !== 'Backspace' || value[index]) return;
        event.preventDefault();
        onChange(value.slice(0, Math.max(0, index - 1)) + value.slice(index));
        focusCell(index - 1);
    };

    return (
        <SarakFlex direction="column" gap="spacing-xs" className={className}>
            <div ref={groupRef} role="group" aria-label={label ?? text('codeInputGroup')} aria-describedby={error ? `${fieldId}-error` : undefined} style={{ display: 'flex', gap: 'var(--sarak-layout-gap-sm, 8px)' }}>
                {Array.from({ length }, (_, index) => (
                    <SarakInput
                        key={index}
                        id={`${fieldId}-${index}`}
                        aria-label={text('codeInputCell', { index: index + 1, total: length })}
                        value={value[index] ?? ''}
                        disabled={disabled}
                        autoFocus={autoFocus && index === 0}
                        autoComplete={index === 0 ? 'one-time-code' : 'off'}
                        inputMode={charset === 'numeric' ? 'numeric' : 'text'}
                        style={{ textAlign: 'center', inlineSize: 'calc(var(--sarak-layout-gap-md, 16px) * 3)' }}
                        onFocus={(event) => event.target.select()}
                        onChange={(event) => write(index, event.target.value)}
                        onKeyDown={(event) => handleKeyDown(index, event)}
                    />
                ))}
            </div>
            <SarakFieldError message={error} fieldId={fieldId} />
        </SarakFlex>
    );
};
