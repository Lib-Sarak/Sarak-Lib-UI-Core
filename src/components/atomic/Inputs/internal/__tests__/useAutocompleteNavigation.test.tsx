import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { useAutocompleteNavigation } from '../useAutocompleteNavigation';
import type { AutocompleteOption } from '../autocompleteTypes';

const OPTIONS: AutocompleteOption[] = [
    { value: 'hr', label: 'Recursos Humanos' },
    { value: 'finance', label: 'Financeiro' },
];

interface NavigationHarnessProps {
    onSelect: (option: AutocompleteOption) => void;
}

const NavigationHarness = (props: NavigationHarnessProps): React.ReactElement => {
    const navigation = useAutocompleteNavigation(OPTIONS, undefined, props.onSelect);
    const activeOptionId = navigation.activeIndex >= 0 ? `option-${navigation.activeIndex}` : undefined;
    return (
        <input
            aria-label="Setor"
            aria-expanded={navigation.isOpen}
            aria-activedescendant={activeOptionId}
            onFocus={navigation.open}
            onBlur={navigation.close}
            onKeyDown={navigation.handleKeyDown}
        />
    );
};

it('navega com setas e confirma a opção ativa com Enter', () => {
    const onSelect = vi.fn();
    render(<NavigationHarness onSelect={onSelect} />);
    const input = screen.getByRole('textbox', { name: 'Setor' });
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'ArrowUp' });

    expect(input).toHaveAttribute('aria-activedescendant', 'option-0');
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onSelect).toHaveBeenCalledWith(OPTIONS[0]);
    expect(input).toHaveAttribute('aria-expanded', 'false');
});
