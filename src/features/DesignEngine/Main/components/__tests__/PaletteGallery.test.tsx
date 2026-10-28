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
