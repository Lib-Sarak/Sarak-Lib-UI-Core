import React, { useState } from 'react';
import { useLibraryText } from '../../../core/i18n/useLibraryText';
import { SarakIconButton } from '../Buttons/SarakIconButton';
import { SarakFlex } from '../Layouts/SarakFlex';
import { SarakInput } from './SarakInput';

export interface SarakTagInputProps {
    /** Etiquetas atuais, na ordem em que aparecem. */
    value: string[];
    onChange: (value: string[]) => void;
    label?: string;
    placeholder?: string;
    /** Caracteres que fecham uma etiqueta ao digitar ou colar; `Enter` sempre fecha. Omitido, só a vírgula. */
    separators?: string[];
    /** Máximo de etiquetas; omitido, sem limite. */
    max?: number;
    /** Aceita a mesma etiqueta duas vezes; omitido, `false`. */
    allowDuplicates?: boolean;
    /** Devolve a mensagem de erro de uma etiqueta recusada, ou `undefined` quando ela vale. */
    validate?: (tag: string) => string | undefined;
    /** Erro do host; o erro da última tentativa recusada, quando existe, aparece no lugar dele. */
    error?: string;
    disabled?: boolean;
    /** Marca o campo como obrigatório para o navegador e o leitor de tela. */
    required?: boolean;
    className?: string;
}

const DEFAULT_SEPARATORS = [','];

/** Chave estável também com repetidas: a etiqueta mais o número de vezes que ela já apareceu antes. */
const tagKey = (tags: string[], index: number): string =>
    `${tags[index]}#${tags.slice(0, index).filter((entry) => entry === tags[index]).length}`;

const splitTags = (raw: string, separators: string[]): string[] => {
    const pieces = separators.reduce<string[]>((parts, separator) => parts.flatMap((part) => part.split(separator)), [raw]);
    return pieces.map((piece) => piece.trim()).filter((piece) => piece !== '');
};

/** Entrada de etiquetas: cada uma vira um chip com botão de remover; `Backspace` no campo vazio tira a última. */
export const SarakTagInput = ({
    value, onChange, label, placeholder, separators = DEFAULT_SEPARATORS, max, allowDuplicates = false, validate, error, disabled, required, className,
}: SarakTagInputProps): React.ReactElement => {
    const text = useLibraryText();
    const [draft, setDraft] = useState('');
    const [refusal, setRefusal] = useState<string | undefined>();

    const commit = (raw: string): void => {
        const next = [...value];
        let problem: string | undefined;
        for (const tag of splitTags(raw, separators)) {
            problem = max !== undefined && next.length >= max ? text('tagInputLimit', { max })
                : !allowDuplicates && next.includes(tag) ? text('tagInputDuplicate')
                : validate?.(tag);
            if (problem) break;
            next.push(tag);
        }
        setRefusal(problem);
        if (next.length !== value.length) onChange(next);
        setDraft(problem ? raw : '');
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>): void => {
        if (event.key === 'Enter') {
            event.preventDefault();
            commit(draft);
            return;
        }
        if (event.key === 'Backspace' && draft === '' && value.length > 0) onChange(value.slice(0, -1));
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        const typed = event.target.value;
        if (separators.some((separator) => typed.includes(separator))) commit(typed);
        else setDraft(typed);
    };

    return (
        <SarakFlex direction="column" gap="spacing-xs" className={className}>
            <SarakInput
                label={label} placeholder={placeholder} value={draft} disabled={disabled} required={required} fullWidth error={refusal ?? error}
                onChange={handleChange} onKeyDown={handleKeyDown} onBlur={() => { if (draft.trim() !== '') commit(draft); }}
            />
            {value.length > 0 && (
                <ul aria-label={label} style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--sarak-layout-gap-sm, 8px)', listStyle: 'none', margin: 0, padding: 0 }}>
                    {value.map((tag, index) => (
                        <li key={tagKey(value, index)} className="text-sm" style={{
                            display: 'inline-flex', alignItems: 'center', paddingInlineStart: 'var(--sarak-layout-gap-sm, 8px)',
                            border: 'var(--sarak-border-width, 1px) solid var(--theme-border)', borderRadius: 'var(--sarak-card-radius, 10px)',
                        }}>
                            <span>{tag}</span>
                            <SarakIconButton variant="ghost" size="xs" icon="×" disabled={disabled} aria-label={text('tagInputRemove', { tag })} onClick={() => onChange(value.filter((_, position) => position !== index))} />
                        </li>
                    ))}
                </ul>
            )}
        </SarakFlex>
    );
};
