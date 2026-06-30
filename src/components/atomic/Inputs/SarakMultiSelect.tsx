import React, { useId, useMemo, useRef, useState } from 'react';
import { SarakFormGroup } from '../Layouts/SarakFormGroup';

export interface MultiSelectOption {
    value: string;
    label: string;
}

export interface SarakMultiSelectProps {
    label?: string;
    options: MultiSelectOption[];
    /** Controlado: lista de values selecionados. */
    value?: string[];
    /** Não-controlado: seleção inicial. */
    defaultValue?: string[];
    placeholder?: string;
    disabled?: boolean;
    error?: string;
    className?: string;
    style?: React.CSSProperties;
    /** Emite a nova lista de values (Spec 32: `onChange(value)`). */
    onChange?: (value: string[]) => void;
}

const FIELD =
    'flex flex-wrap items-center gap-1 w-full rounded-input py-2 px-3 bg-[var(--sarak-input-bg,var(var(--color-theme-card,#1e293b)))] border border-[var(--sarak-input-border-color,var(var(--border-color,#334155)))] focus-within:border-[var(--sarak-input-focus-border-color,var(var(--sarak-primary-color,#3b82f6)))] transition-colors';

/**
 * Componente Atômico: SarakMultiSelect (Spec 11, Regra 2)
 * Combobox com autocomplete: busca digitada, seleção múltipla e chips deletáveis.
 * O input de busca e os chips coexistem no mesmo campo — digitar NÃO desmonta os
 * chips nem perde o foco (Plano de Testes §4).
 */
export const SarakMultiSelect: React.FC<SarakMultiSelectProps> = ({
    label,
    options,
    value,
    defaultValue,
    placeholder = 'Buscar...',
    disabled,
    error,
    className = '',
    style,
    onChange,
}) => {
    const reactId = useId();
    const listId = `${reactId}-list`;
    const errorId = `${reactId}-error`;
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [query, setQuery] = useState('');
    const [open, setOpen] = useState(false);
    const [internal, setInternal] = useState<string[]>(defaultValue ?? []);
    const selected = value ?? internal;

    const selectedSet = useMemo(() => new Set(selected), [selected]);
    const filtered = useMemo(() => {
        const term = query.trim().toLowerCase();
        return options.filter(
            (opt) => !selectedSet.has(opt.value) && opt.label.toLowerCase().includes(term),
        );
    }, [options, query, selectedSet]);

    const labelOf = (val: string): string =>
        options.find((opt) => opt.value === val)?.label ?? val;

    const commit = (next: string[]): void => {
        if (value === undefined) setInternal(next);
        onChange?.(next);
    };

    const add = (val: string): void => {
        commit([...selected, val]);
        setQuery('');
        inputRef.current?.focus();
    };

    const remove = (val: string): void => {
        commit(selected.filter((item) => item !== val));
        inputRef.current?.focus();
    };

    // Backspace com busca vazia remove o último chip (atalho de teclado usual).
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
        if (e.key === 'Backspace' && query === '' && selected.length > 0) {
            remove(selected[selected.length - 1]);
        }
    };

    const disabledClass = disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : '';

    return (
        <SarakFormGroup className={`${disabledClass} ${className}`.trim()} style={style}>
            {label && (
                <span className="text-sm font-medium text-[var(--text-muted,#94a3b8)]">{label}</span>
            )}

            <div className="relative w-full">
                <div className={FIELD}>
                    {selected.map((val) => (
                        <Chip key={val} label={labelOf(val)} onRemove={() => remove(val)} disabled={disabled} />
                    ))}

                    <input
                        ref={inputRef}
                        type="text"
                        role="combobox"
                        aria-expanded={open}
                        aria-controls={listId}
                        aria-invalid={error ? true : undefined}
                        aria-describedby={error ? errorId : undefined}
                        disabled={disabled}
                        placeholder={selected.length === 0 ? placeholder : ''}
                        value={query}
                        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
                        onFocus={() => setOpen(true)}
                        onBlur={() => setTimeout(() => setOpen(false), 120)}
                        onKeyDown={handleKeyDown}
                        className="flex-1 min-w-[6rem] bg-transparent outline-none text-[var(--sarak-input-text-color,var(var(--text-muted,#94a3b8)))]"
                    />
                </div>

                {open && filtered.length > 0 && (
                    <ul
                        id={listId}
                        role="listbox"
                        className="absolute z-20 mt-1 w-full max-h-56 overflow-auto rounded-input py-1 bg-[var(--color-theme-card,#1e293b)] border border-[var(--border-color,#334155)] shadow-lg"
                    >
                        {filtered.map((opt) => (
                            <li
                                key={opt.value}
                                role="option"
                                aria-selected={false}
                                // onMouseDown (não onClick) para selecionar antes do blur do input.
                                onMouseDown={(e) => { e.preventDefault(); add(opt.value); }}
                                className="px-3 py-2 cursor-pointer text-sm text-[var(--text-muted,#94a3b8)] hover:bg-[var(--sarak-primary-color,#3b82f6)]/10"
                            >
                                {opt.label}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {error && (
                <p id={errorId} className="mt-1 text-sm text-[var(--sarak-input-error-color,#ff4d4f)]">
                    {error}
                </p>
            )}
        </SarakFormGroup>
    );
};

interface ChipProps {
    label: string;
    disabled?: boolean;
    onRemove: () => void;
}

const Chip: React.FC<ChipProps> = ({ label, disabled, onRemove }) => (
    <span className="inline-flex items-center gap-1 rounded-full py-0.5 pl-2 pr-1 text-xs font-medium bg-[var(--sarak-primary-color,#3b82f6)]/15 text-[var(--sarak-primary-color,#3b82f6)]">
        {label}
        <button
            type="button"
            aria-label={`Remover ${label}`}
            disabled={disabled}
            onMouseDown={(e) => { e.preventDefault(); onRemove(); }}
            className="flex items-center justify-center w-4 h-4 rounded-full hover:bg-[var(--sarak-primary-color,#3b82f6)]/30"
        >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
    </span>
);
