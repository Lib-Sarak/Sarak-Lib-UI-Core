import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { AutocompletePopup } from '../AutocompletePopup';
import type { AutocompleteOption } from '../autocompleteTypes';
import type { AutocompleteControllerState } from '../useAutocompleteController';

it('renderiza opções acessíveis e emite a seleção por clique', () => {
    const option: AutocompleteOption = { value: 'finance', label: 'Financeiro' };
    const selectOption = vi.fn();
    const state: AutocompleteControllerState<AutocompleteOption> = {
        listboxId: 'autocomplete-list',
        query: 'fin',
        suggestions: [option],
        activeIndex: 0,
        isOpen: true,
        isLoading: false,
        hasError: false,
        shouldAnnounceEmpty: false,
        shouldShowPanel: true,
        handleInputChange: vi.fn(),
        handleFocus: vi.fn(),
        handleBlur: vi.fn(),
        handleKeyDown: vi.fn(),
        selectOption,
        activateOption: vi.fn(),
    };
    render(<AutocompletePopup state={state} />);

    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Financeiro' })).toHaveAttribute('aria-selected', 'true');
    fireEvent.click(screen.getByRole('option', { name: 'Financeiro' }));
    expect(selectOption).toHaveBeenCalledWith(option);
});
