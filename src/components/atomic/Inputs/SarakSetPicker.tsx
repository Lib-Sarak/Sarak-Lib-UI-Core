import React, { useMemo, useState } from 'react';
import { useLibraryText } from '../../../core/i18n/useLibraryText';
import { SarakButton } from '../Buttons/SarakButton';
import { SarakIconButton } from '../Buttons/SarakIconButton';
import { SarakFlex } from '../Layouts/SarakFlex';
import { SarakInput } from './SarakInput';

export interface SarakSetPickerOption {
    value: string;
    label: string;
    /** Texto de apoio sob o rótulo; omitido, o item mostra só o rótulo. */
    description?: string;
}

export interface SarakSetPickerFilter {
    id: string;
    label: string;
    /** `true` para o item que o filtro deixa passar. */
    match: (option: SarakSetPickerOption) => boolean;
}

export interface SarakSetPickerProps {
    options: SarakSetPickerOption[];
    /** Valores escolhidos, na ordem em que aparecem na lista de escolhidos. */
    value: string[];
    onChange: (value: string[]) => void;
    /** Rótulo do conjunto, lido pelo leitor de tela como nome das duas listas. */
    label?: string;
    /** Mostra o campo de busca nas disponíveis; omitido, `true`. */
    searchable?: boolean;
    /** Filtros em chips sobre as disponíveis; vários ativos se somam (todos precisam casar). Omitido, não há filtro. */
    filters?: SarakSetPickerFilter[];
    className?: string;
}

const normalize = (text: string): string => text.toLocaleLowerCase();

const matchesQuery = (option: SarakSetPickerOption, query: string): boolean =>
    query === '' || normalize(`${option.label} ${option.description ?? ''}`).includes(normalize(query));

interface PickerListProps {
    title: string;
    emptyText: string;
    options: SarakSetPickerOption[];
    actionLabel: (option: SarakSetPickerOption) => string;
    actionIcon: string;
    onAction: (option: SarakSetPickerOption) => void;
    header?: React.ReactNode;
}

const PickerList = ({ title, emptyText, options, actionLabel, actionIcon, onAction, header }: PickerListProps): React.ReactElement => (
    <SarakFlex direction="column" gap="spacing-sm" style={{ flex: '1 1 0', minInlineSize: 'calc(var(--sarak-layout-gap-lg, 24px) * 8)' }}>
        <strong className="text-sm">{title} ({options.length})</strong>
        {header}
        <ul aria-label={title} style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {options.map((option) => (
                <li key={option.value} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--sarak-layout-gap-sm, 8px)' }}>
                    <span style={{ minInlineSize: 0 }}>
                        <span className="text-sm">{option.label}</span>
                        {option.description && <span className="text-xs block" style={{ color: 'var(--text-muted)' }}>{option.description}</span>}
                    </span>
                    <SarakIconButton variant="ghost" size="xs" icon={actionIcon} aria-label={actionLabel(option)} onClick={() => onAction(option)} />
                </li>
            ))}
        </ul>
        {options.length === 0 && <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{emptyText}</p>}
    </SarakFlex>
);

/**
 * Seletor de conjunto: disponíveis de um lado, escolhidos do outro, com busca e filtros nas disponíveis.
 * Cada item é um botão (teclado e leitor de tela); a lib não guarda a escolha, o host governa `value`.
 */
export const SarakSetPicker = ({
    options, value, onChange, label, searchable = true, filters = [], className,
}: SarakSetPickerProps): React.ReactElement => {
    const text = useLibraryText();
    const [query, setQuery] = useState('');
    const [activeFilters, setActiveFilters] = useState<string[]>([]);

    const chosen = useMemo(() => value.flatMap((entry) => options.filter((option) => option.value === entry)), [options, value]);
    const available = useMemo(() => {
        const active = filters.filter((filter) => activeFilters.includes(filter.id));
        return options.filter((option) => !value.includes(option.value) && matchesQuery(option, query) && active.every((filter) => filter.match(option)));
    }, [options, value, query, filters, activeFilters]);

    const toggleFilter = (id: string): void => setActiveFilters((current) => current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id]);

    const header = (
        <>
            {searchable && <SarakInput type="search" aria-label={text('setPickerSearch')} placeholder={text('setPickerSearch')} value={query} onChange={(event) => setQuery(event.target.value)} fullWidth />}
            {filters.length > 0 && (
                <SarakFlex role="group" aria-label={text('setPickerFilters')} gap="spacing-xs">
                    {filters.map((filter) => (
                        <SarakButton key={filter.id} type="button" size="xs" variant={activeFilters.includes(filter.id) ? 'primary' : 'outline'} aria-pressed={activeFilters.includes(filter.id)} onClick={() => toggleFilter(filter.id)}>
                            {filter.label}
                        </SarakButton>
                    ))}
                </SarakFlex>
            )}
            <SarakButton type="button" size="xs" variant="ghost" disabled={available.length === 0} onClick={() => onChange([...value, ...available.map((option) => option.value)])}>
                {text('setPickerAddAll')}
            </SarakButton>
        </>
    );

    return (
        <SarakFlex role="group" aria-label={label} gap="spacing-md" align="flex-start" className={className}>
            <PickerList
                title={text('setPickerAvailable')} emptyText={text('setPickerEmptyAvailable')} options={available} header={header}
                actionIcon="+" actionLabel={(option) => text('setPickerAdd', { item: option.label })}
                onAction={(option) => onChange([...value, option.value])}
            />
            <PickerList
                title={text('setPickerChosen')} emptyText={text('setPickerEmptyChosen')} options={chosen}
                header={<SarakButton type="button" size="xs" variant="ghost" disabled={chosen.length === 0} onClick={() => onChange([])}>{text('setPickerClear')}</SarakButton>}
                actionIcon="×" actionLabel={(option) => text('setPickerRemove', { item: option.label })}
                onAction={(option) => onChange(value.filter((entry) => entry !== option.value))}
            />
        </SarakFlex>
    );
};
