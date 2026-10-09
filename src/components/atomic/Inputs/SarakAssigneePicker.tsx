/**
 * SarakAssigneePicker — escolhe o responsável entre uma lista de pessoas: mostra o escolhido
 * (avatar + nome) e busca outro pelo nome, por mouse ou teclado (a navegação é a do
 * `SarakAutocomplete`). Controlado: quem chama guarda o `value`. Texto pelo catálogo;
 * ícone pela porta de ícones.
 */

import React, { useState } from 'react';
import { SarakAvatar } from '../Atoms/SarakAvatar';
import { SarakIconButton } from '../Buttons/SarakIconButton';
import { SarakIcon } from '../Icon/SarakIcon';
import { SarakAutocomplete } from './SarakAutocomplete';
import type { SarakAutocompleteOption } from './SarakAutocomplete';
import { useLibraryText } from '../../../core/i18n/useLibraryText';

export interface SarakAssigneePerson {
    id: string;
    name: string;
    avatarUrl?: string;
}

export interface SarakAssigneePickerProps {
    /** Pessoas que podem ser escolhidas. Vazio mostra o estado vazio traduzido, sem campo de busca. */
    people: SarakAssigneePerson[];
    /** Id da pessoa escolhida; `null`/omitido = sem responsável. Id que não está em `people` não mostra ninguém. */
    value?: string | null;
    /** Disparado com o id da pessoa escolhida, ou `null` ao remover o responsável. */
    onChange: (id: string | null) => void;
    /** Mostra o botão de remover o responsável escolhido. Omitido, só dá para trocar de pessoa. */
    clearable?: boolean;
    /** Rótulo do campo. Omitido, usa o texto traduzido "Responsável". */
    label?: string;
    /** Trava a busca (somente leitura, anunciada como desabilitada) e desabilita o botão de remover. */
    disabled?: boolean;
    className?: string;
}

const mutedText: React.CSSProperties = {
    color: 'var(--sarak-text-muted, inherit)',
    fontSize: 'var(--sarak-type-scale-caption, 12px)',
};

export function SarakAssigneePicker({ people, value, onChange, clearable, label, disabled, className }: SarakAssigneePickerProps) {
    const text = useLibraryText();
    const [query, setQuery] = useState('');
    const selected = people.find((person) => person.id === value);
    const options: SarakAutocompleteOption[] = people.map((person) => ({ value: person.id, label: person.name }));

    return (
        <div
            data-assignee-picker="true"
            className={className}
            style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sarak-layout-gap-sm, 8px)' }}
        >
            <span style={mutedText}>{label ?? text('assigneeLabel')}</span>
            {selected && (
                <div data-assignee-selected={selected.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--sarak-layout-gap-sm, 8px)' }}>
                    <SarakAvatar size="sm" name={selected.name} src={selected.avatarUrl} />
                    <span style={{ flex: '1 1 auto', color: 'var(--sarak-text-main, inherit)' }}>{selected.name}</span>
                    {clearable && (
                        <SarakIconButton
                            variant="ghost"
                            size="xs"
                            icon={<SarakIcon name="X" />}
                            disabled={disabled}
                            aria-label={text('assigneeClear', { name: selected.name })}
                            onClick={() => onChange(null)}
                        />
                    )}
                </div>
            )}
            {people.length === 0 ? (
                <span style={mutedText}>{text('assigneeEmpty')}</span>
            ) : (
                <SarakAutocomplete
                    aria-label={label ?? text('assigneeLabel')}
                    placeholder={text('assigneeSearch')}
                    options={options}
                    value={query}
                    disabled={disabled}
                    readOnly={disabled}
                    aria-disabled={disabled || undefined}
                    onChange={(event) => setQuery(event.target.value)}
                    onOptionSelect={(option) => { onChange(option.value); setQuery(''); }}
                />
            )}
        </div>
    );
}

export default SarakAssigneePicker;
