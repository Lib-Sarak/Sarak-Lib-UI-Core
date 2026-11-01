import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import { PaletteGallery } from '../PaletteGallery';
import { SARAK_PALETTE_PRESETS } from '../../../../../core/Design/palette/presets';

const REAL_PALETTES = Object.keys(SARAK_PALETTE_PRESETS).length;

describe('PaletteGallery com o registro real', () => {
    it('as paletas prontas cabem em até 15 linhas, uma por paleta, sem Claro e Escuro', () => {
        render(<PaletteGallery selectedId="" onSelect={() => undefined} />);
        const rows = within(screen.getByRole('radiogroup', { name: 'Paletas prontas' })).getAllByRole('radio');
        expect(REAL_PALETTES).toBeGreaterThan(3);
        expect(rows).toHaveLength(REAL_PALETTES);
        expect(rows.length).toBeLessThanOrEqual(15);
        rows.forEach((row) => expect(row.querySelectorAll('[data-testid="palette-strip"]')).toHaveLength(1));
        expect(screen.queryByText('Claro')).toBeNull();
        expect(screen.queryByText('Escuro')).toBeNull();
    });

    it('cada filtro mostra só as paletas do tipo e as contagens somam o total', () => {
        render(<PaletteGallery selectedId="" onSelect={() => undefined} />);
        const filters = within(screen.getByRole('group', { name: 'Filtrar paletas por tipo' })).getAllByRole('button');
        const perType = filters.filter((button) => button.textContent !== 'Todas').map((button) => {
            fireEvent.click(button);
            return screen.getAllByRole('radio').length;
        });
        expect(perType.reduce((sum, count) => sum + count, 0)).toBe(REAL_PALETTES);
    });
});
