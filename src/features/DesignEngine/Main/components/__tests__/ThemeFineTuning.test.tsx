import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import SarakUIProvider from '../../../../../core/Provider/SarakUIProvider';
import { ThemeFineTuning } from '../ThemeFineTuning';

const token = (id: string) => ({ id, label: `Rótulo ${id}`, type: 'text' as const, defaultValue: '' });
const layers = {
    essential: [{ title: 'Principais', tokens: [token('a'), token('b')] }],
    rest: [{ title: 'Demais', tokens: [token('c')] }],
    fineTotal: 3,
};

const renderFine = (props: Partial<React.ComponentProps<typeof ThemeFineTuning>> = {}) => render(
    <SarakUIProvider>
        <ThemeFineTuning layers={layers} catalogMap={new Map()} draft={{} as never} updateDraft={vi.fn()} previewDevice="desktop" {...props} />
    </SarakUIProvider>,
);

const rows = () => Array.from(document.querySelectorAll('[data-token-row]')).map((row) => row.getAttribute('data-token-row'));

describe('ThemeFineTuning', () => {
    it('nasce recolhido, com a contagem real no botão', () => {
        renderFine();

        const toggle = screen.getByRole('button', { name: /Ajuste fino/ });
        expect(toggle).toHaveAttribute('aria-expanded', 'false');
        expect(toggle).toHaveTextContent('3 ajustes');
        expect(rows()).toEqual([]);
    });

    it('aberto, mostra primeiro só os principais; "Mostrar todos" traz os demais e volta', () => {
        renderFine();

        fireEvent.click(screen.getByRole('button', { name: /Ajuste fino/ }));
        expect(rows()).toEqual(['a', 'b']);

        fireEvent.click(screen.getByRole('button', { name: 'Mostrar todos os 3 ajustes' }));
        expect(rows()).toEqual(['a', 'b', 'c']);

        fireEvent.click(screen.getByRole('button', { name: 'Mostrar só os principais' }));
        expect(rows()).toEqual(['a', 'b']);
    });

    it('a busca pode abrir já com tudo à vista', () => {
        renderFine({ initialOpen: true, initialShowAll: true });

        expect(screen.getByRole('button', { name: /Ajuste fino/ })).toHaveAttribute('aria-expanded', 'true');
        expect(rows()).toEqual(['a', 'b', 'c']);
    });

    it('sem nada a ajustar, a decisão não ganha a seção', () => {
        renderFine({ layers: { essential: [], rest: [], fineTotal: 0 } });

        expect(screen.queryByRole('button', { name: /Ajuste fino/ })).toBeNull();
    });
});
