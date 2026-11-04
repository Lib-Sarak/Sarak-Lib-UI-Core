import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { PaletteGallery } from '../PaletteGallery';

vi.mock('../../../../../core/Design/palette/presets', () => ({
    SARAK_PALETTE_PRESETS: {
        oceano: { type: 'analogous', base: '#2563eb' },
        floresta: { type: 'analogous', base: '#16a34a' },
        brasa: { type: 'triadic', base: '#dc2626' },
    },
    SARAK_PALETTE_PRESET_TEXT_KEYS: {},
}));

describe('PaletteGallery', () => {
    it('lista os presets num radiogroup nomeado, com o tipo no nome de cada opção', () => {
        render(<PaletteGallery selectedId="" onSelect={() => undefined} />);
        const group = screen.getByRole('radiogroup', { name: 'Paletas prontas' });
        const names = within(group).getAllByRole('radio').map((radio) => radio.getAttribute('aria-label'));
        expect(names).toEqual(['Oceano — Análoga', 'Floresta — Análoga', 'Brasa — Triádica']);
    });

    it('cada paleta é uma linha: faixa contínua e nome, sem as palavras Claro e Escuro', () => {
        render(<PaletteGallery selectedId="" onSelect={() => undefined} />);
        const rows = within(screen.getByRole('radiogroup', { name: 'Paletas prontas' })).getAllByRole('radio');
        expect(rows).toHaveLength(3);
        rows.forEach((row) => expect(row.querySelectorAll('[data-testid="palette-strip"]')).toHaveLength(1));
        expect(screen.queryByText('Claro')).toBeNull();
        expect(screen.queryByText('Escuro')).toBeNull();
        expect(screen.queryByTestId('palette-swatch-light')).toBeNull();
    });

    it('os filtros por tipo mostram só as paletas do tipo e funcionam pelo teclado', () => {
        render(<PaletteGallery selectedId="" onSelect={() => undefined} />);
        const filters = screen.getByRole('group', { name: 'Filtrar paletas por tipo' });
        expect(within(filters).getByRole('button', { name: 'Todas' })).toHaveAttribute('aria-pressed', 'true');

        const triadic = within(filters).getByRole('button', { name: 'Triádica' });
        triadic.focus();
        fireEvent.keyDown(triadic, { key: 'Enter' });
        fireEvent.click(triadic);
        expect(triadic).toHaveAttribute('aria-pressed', 'true');
        expect(screen.getAllByRole('radio').map((radio) => radio.getAttribute('aria-label'))).toEqual(['Brasa — Triádica']);

        fireEvent.click(within(filters).getByRole('button', { name: 'Todas' }));
        expect(screen.getAllByRole('radio')).toHaveLength(3);
    });

    it('só oferece filtro de tipo que tem paleta', () => {
        render(<PaletteGallery selectedId="" onSelect={() => undefined} />);
        const names = within(screen.getByRole('group', { name: 'Filtrar paletas por tipo' })).getAllByRole('button').map((b) => b.textContent);
        expect(names).toEqual(['Todas', 'Análoga', 'Triádica']);
    });

    it('as setas circulam dentro da lista já filtrada', () => {
        const onSelect = vi.fn();
        render(<PaletteGallery selectedId="oceano" onSelect={onSelect} />);
        fireEvent.click(screen.getByRole('button', { name: 'Análoga' }));
        fireEvent.keyDown(screen.getByRole('radio', { name: /Floresta/ }), { key: 'ArrowDown' });
        expect(onSelect).toHaveBeenLastCalledWith('oceano');
    });

    it('marca só a paleta selecionada e dá o foco de tabulação a ela', () => {
        render(<PaletteGallery selectedId="brasa" onSelect={() => undefined} />);
        const brasa = screen.getByRole('radio', { name: /Brasa/ });
        expect(brasa).toHaveAttribute('aria-checked', 'true');
        expect(brasa).toHaveAttribute('tabindex', '0');
        expect(screen.getByRole('radio', { name: /Oceano/ })).toHaveAttribute('tabindex', '-1');
    });

    it('sem seleção, a primeira opção recebe o foco de tabulação', () => {
        render(<PaletteGallery selectedId="" onSelect={() => undefined} />);
        expect(screen.getByRole('radio', { name: /Oceano/ })).toHaveAttribute('tabindex', '0');
    });

    it('o clique e as setas escolhem a paleta e movem o foco, circulando nas pontas', () => {
        const onSelect = vi.fn();
        render(<PaletteGallery selectedId="oceano" onSelect={onSelect} />);
        fireEvent.click(screen.getByRole('radio', { name: /Floresta/ }));
        expect(onSelect).toHaveBeenLastCalledWith('floresta');
        fireEvent.keyDown(screen.getByRole('radio', { name: /Brasa/ }), { key: 'ArrowDown' });
        expect(onSelect).toHaveBeenLastCalledWith('oceano');
        fireEvent.keyDown(screen.getByRole('radio', { name: /Oceano/ }), { key: 'ArrowUp' });
        expect(onSelect).toHaveBeenLastCalledWith('brasa');
        expect(screen.getByRole('radio', { name: /Brasa/ })).toHaveFocus();
    });

    it('outras teclas não escolhem nada', () => {
        const onSelect = vi.fn();
        render(<PaletteGallery selectedId="oceano" onSelect={onSelect} />);
        fireEvent.keyDown(screen.getByRole('radio', { name: /Oceano/ }), { key: 'a' });
        expect(onSelect).not.toHaveBeenCalled();
    });
});
