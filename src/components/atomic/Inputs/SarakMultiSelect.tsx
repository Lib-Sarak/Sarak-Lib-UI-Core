import React, { useId, useMemo, useRef, useState } from 'react';
import { SarakFormGroup } from '../Layouts/SarakFormGroup';
import { SarakIconButton } from '../Buttons/SarakIconButton';

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
    'flex flex-wrap items-center gap-1 w-full rounded-input py-2 px-3 bg-[var(--sarak-input-bg,var(--color-theme-card,#1e293b))] border border-[var(--sarak-input-border-color,var(--border-color,#334155))] focus-within:border-[var(--sarak-input-focus-border-color,var(--sarak-primary-color,#3b82f6))] transition-colors';

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

                    {/* R10 declarado, não corrigido (plan-22, triagem 2026-08-10): é composição
                        (o campo de busca é uma peça do combobox, junto com chips e listbox —
                        não "dá forma" a um input sozinho), mas o conserto mecânico está
                        bloqueado. `SarakInput` não é `forwardRef`, e este `inputRef` é lido em
                        `add()`/`remove()` para devolver o foco ao campo após alterar a seleção
                        — trocar sem resolver o forwardRef quebraria esse retorno de foco.
                        Decisão de estender `SarakInput` para forwardRef está aberta com o dono
                        na plan-23 §2.4. Não contornar com document.activeElement (esconde a
                        dependência real). */}
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
                        className="flex-1 min-w-[var(--sarak-multi-select-input-min-width,6rem)] bg-transparent outline-none text-[var(--sarak-input-text-color,var(--text-muted,#94a3b8))]"
                    />
                </div>

                {open && filtered.length > 0 && (
                    <ul
                        id={listId}
                        role="listbox"
                        className="absolute z-20 w-full max-h-56 overflow-auto rounded-input bg-[var(--color-theme-card,#1e293b)] border border-[var(--border-color,#334155)] shadow-lg"
                        style={{ marginTop: 'calc(var(--sarak-layout-gap-md,16px) * 0.25)', paddingTop: 'calc(var(--sarak-layout-gap-md,16px) * 0.25)', paddingBottom: 'calc(var(--sarak-layout-gap-md,16px) * 0.25)' }}
                    >
                        {filtered.map((opt) => (
                            <li
                                key={opt.value}
                                role="option"
                                aria-selected={false}
                                // onMouseDown (não onClick) para selecionar antes do blur do input.
                                onMouseDown={(e) => { e.preventDefault(); add(opt.value); }}
                                className="cursor-pointer text-sm text-[var(--text-muted,#94a3b8)] hover:bg-[var(--sarak-primary-color,#3b82f6)]/10"
                                style={{ padding: 'var(--sarak-layout-gap-sm, 8px) calc(var(--sarak-layout-gap-md,16px) * 0.75)' }}
                            >
                                {opt.label}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {error && (
                <p id={errorId} className="text-sm text-[var(--sarak-input-error-color,#ff4d4f)]" style={{ marginTop: 'calc(var(--sarak-layout-gap-md,16px) * 0.25)' }}>
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
    <span
        className="inline-flex items-center rounded-full text-xs font-medium bg-[var(--sarak-primary-color,#3b82f6)]/15 text-[var(--sarak-primary-color,#3b82f6)]"
        style={{
            gap: 'calc(var(--sarak-layout-gap-md,16px) * 0.25)',
            paddingTop: 'calc(var(--sarak-layout-gap-md,16px) * 0.125)',
            paddingBottom: 'calc(var(--sarak-layout-gap-md,16px) * 0.125)',
            paddingLeft: 'var(--sarak-layout-gap-sm, 8px)',
            paddingRight: 'calc(var(--sarak-layout-gap-md,16px) * 0.25)'
        }}
    >
        {label}
        <SarakIconButton
            variant="ghost"
            size="xs"
            aria-label={`Remover ${label}`}
            disabled={disabled}
            onMouseDown={(e) => { e.preventDefault(); onRemove(); }}
            // O preset "xs" do átomo (24px) é maior que os 16px originais do botão de
            // remover cru — cresce o alvo de toque do chip. Aceito: forçar um tamanho
            // sem token válido (`1rem`) seria hardcode duro (R7), pior que o delta visual.
            icon={
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            }
        />
    </span>
);
