import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SarakUIProvider } from '../../../../../core/Provider/SarakUIProvider';
import { SarakSearchDialog } from '../SarakSearchDialog';
import type { SearchPaletteState } from '../../SarakSearch';

const createState = (): SearchPaletteState => ({
    query: '',
    setQuery: vi.fn(),
    filteredItems: [{ id: '/pedidos', label: 'Pedidos', category: 'Comercial' }],
    listboxId: 'palette-results',
    getOptionId: () => 'palette-option-0',
    activeIndex: 0,
    setActiveIndex: vi.fn(),
    handleKeyDown: vi.fn(),
    selectItem: vi.fn(),
});

describe('SarakSearchDialog', () => {
    it('expõe o diálogo acessível, a opção como link e fecha ao clicar no fundo', () => {
        const onClose = vi.fn();
        const { container } = render(
            <SarakUIProvider>
                <SarakSearchDialog
                    onClose={onClose}
                    state={createState()}
                    panelStyle={{
                        maxWidth: 'var(--sarak-search-dropdown-width, 400px)',
                        marginTop: 'calc(10vh + var(--sarak-search-dropdown-gap, 0.5rem))',
                    }}
                />
            </SarakUIProvider>,
        );

        expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
        expect(screen.getByRole('combobox')).toHaveAttribute('aria-controls', 'palette-results');
        const option = screen.getByRole('option', { name: /Pedidos Comercial/ });
        expect(option.tagName).toBe('A');
        expect(option).toHaveAttribute('href', '/pedidos');
        expect(screen.getByText('Pedidos').className).toContain('--color-theme-title');
        expect(screen.getByText('Comercial').className).toContain('--sarak-subtitle-color');
        expect(screen.getByRole('heading', { level: 4 }).className).toContain('--theme-title');

        const backdrop = container.querySelector('.absolute.inset-0');
        expect(backdrop).not.toBeNull();
        fireEvent.click(backdrop!);
        expect(onClose).toHaveBeenCalledOnce();
    });
});
