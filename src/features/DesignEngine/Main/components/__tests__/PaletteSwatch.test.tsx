import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import { PaletteSwatch } from '../PaletteSwatch';
import { resolvePalette } from '../../../../../core/Design/palette/resolve';
import type { PaletteInput } from '../../../../../core/Design/palette/types';

const INPUT: PaletteInput = { type: 'analogous', base: '#2563eb' };

describe('PaletteSwatch', () => {
    it('mostra os dois modos com o fundo calculado de cada um', () => {
        render(<PaletteSwatch input={INPUT} />);
        const light = screen.getByTestId('palette-swatch-light');
        const dark = screen.getByTestId('palette-swatch-dark');
        expect(light).toHaveTextContent('Claro');
        expect(dark).toHaveTextContent('Escuro');
        expect(light).toHaveStyle({ background: resolvePalette(INPUT, 'light').colorBgBody });
        expect(dark).toHaveStyle({ background: resolvePalette(INPUT, 'dark').colorBgBody });
    });

    it('desenha uma faixa por semente (primária, secundária e acento) em cada modo', () => {
        render(<PaletteSwatch input={INPUT} />);
        expect(screen.getByTestId('palette-swatch-light').querySelectorAll('.h-3')).toHaveLength(3);
        expect(screen.getByTestId('palette-swatch-dark').querySelectorAll('.h-3')).toHaveLength(3);
    });

    it('é decorativa: fica fora da árvore de acessibilidade', () => {
        const { container } = render(<PaletteSwatch input={INPUT} />);
        expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true');
    });
});
