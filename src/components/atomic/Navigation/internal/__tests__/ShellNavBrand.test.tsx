import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, expect, it } from 'vitest';
import { ShellNavBrand } from '../ShellNavBrand';

describe('ShellNavBrand — a marca no topo do menu', () => {
    it('mostra o nome e a imagem que o consumidor passou, cada um só quando vem', () => {
        const { rerender } = render(<ShellNavBrand brand={{ name: 'Earendel' }} horizontal={false} />);
        expect(screen.getByText('Earendel')).toBeInTheDocument();
        expect(screen.queryByRole('img')).toBeNull();
        rerender(<ShellNavBrand brand={{ logoUrl: '/logo.png' }} horizontal={false} />);
        expect(screen.getByRole('img')).toHaveAttribute('src', '/logo.png');
    });

    it('na topbar a marca ganha o vão do fim; na lateral, o de baixo', () => {
        const { container, rerender } = render(<ShellNavBrand brand={{ name: 'Earendel' }} horizontal />);
        const root = container.firstElementChild as HTMLElement;
        expect(root.style.marginInlineEnd).toBe('var(--sarak-layout-gap-md, 16px)');
        expect(root.style.marginBottom).toBe('');
        rerender(<ShellNavBrand brand={{ name: 'Earendel' }} horizontal={false} />);
        expect((container.firstElementChild as HTMLElement).style.marginBottom).toBe('var(--sarak-layout-gap-md, 16px)');
    });
});
