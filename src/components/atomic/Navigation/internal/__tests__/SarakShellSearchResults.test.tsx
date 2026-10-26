import React, { type Dispatch, type SetStateAction } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SarakUIProvider } from '../../../../../core/Provider/SarakUIProvider';
import type { SarakSearchItem } from '../../../Inputs/SarakSearch';
import {
    SarakShellSearchResults,
    type SearchBarState,
    type ShellSearchResultsState,
} from '../SarakShellSearchResults';

const items: SarakSearchItem[] = [
    { id: '/propostas', label: 'Propostas', category: 'Comercial' },
    { id: '/projetos', label: 'Projetos' },
];

const createState = (filteredItems: SarakSearchItem[] = items): ShellSearchResultsState => ({
    query: 'pro',
    isOpen: true,
    isInputFocused: true,
    listboxId: 'shell-search-results',
    getOptionId: (index) => 'shell-search-option-' + index,
    filteredItems,
    activeIndex: 0,
    setActiveIndex: vi.fn() as unknown as Dispatch<SetStateAction<number>>,
    setSearchState: vi.fn() as unknown as Dispatch<SetStateAction<SearchBarState>>,
    selectResult: vi.fn(),
});

const renderResults = (state: ShellSearchResultsState, onSelect?: (item: SarakSearchItem) => void) => render(
    <SarakUIProvider>
        <SarakShellSearchResults state={state} onSelect={onSelect} />
    </SarakUIProvider>,
);

describe('SarakShellSearchResults', () => {
    it('renderiza opções como links com a rota e o subtítulo informativo', () => {
        const state = createState();
        renderResults(state);

        const option = screen.getByRole('option', { name: /Propostas Comercial/ });
        expect(option.tagName).toBe('A');
        expect(option).toHaveAttribute('href', '/propostas');
        expect(option).toHaveAttribute('aria-selected', 'true');
        expect(screen.getByText('Propostas').className).toContain('text-[var(--theme-title)]/80');
        expect(screen.getByText('Comercial').className).toContain('--sarak-subtitle-color,var(--theme-subtitle');
        expect(screen.getByRole('heading', { level: 4 }).className).toContain('--theme-title');
        expect(screen.getByRole('listbox')).toHaveAttribute('id', state.listboxId);
    });

    it('informa quando a busca não encontra resultados', () => {
        renderResults(createState([]));

        expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('intercepta o link quando existe callback de seleção', () => {
        const state = createState();
        const onSelect = vi.fn();
        state.selectResult = vi.fn((item) => onSelect(item));
        renderResults(state, onSelect);

        const option = screen.getByRole('option', { name: /Propostas Comercial/ });
        const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 });
        option.dispatchEvent(clickEvent);

        expect(clickEvent.defaultPrevented).toBe(true);
        expect(state.selectResult).toHaveBeenCalledWith(items[0]);
        expect(onSelect).toHaveBeenCalledWith(items[0]);
    });
});
