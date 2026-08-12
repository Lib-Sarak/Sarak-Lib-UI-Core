import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { ButtonsCatalog } from '../ButtonsCatalog';

vi.mock('framer-motion', async () => {
    const actual = await vi.importActual('framer-motion');
    return { ...actual as any, motion: { button: ({ children, className, ...props }: any) => <button className={className} {...props}>{children}</button> } };
});

describe('ButtonsCatalog', () => {
    it('renderiza a aba Curados por padrão', () => {
        render(<ButtonsCatalog onApplyPreset={vi.fn()} currentMode="dark" />);
        expect(screen.getAllByText('Industrial Matte')[0]).toBeInTheDocument();
    });

    it('troca para a camada automática Por Estilo e cobre o gap do borderline', () => {
        render(<ButtonsCatalog onApplyPreset={vi.fn()} currentMode="dark" />);
        fireEvent.click(screen.getByRole('button', { name: /Por Estilo/i }));
        expect(screen.getAllByText('Minimalist Borderline')[0]).toBeInTheDocument();
    });

    it('a grade reage a CONTAINER QUERY (@min-[768px]:/@min-[1024px]:), não mais a `md:`/`lg:` de viewport (plan-35)', () => {
        const { container } = render(<ButtonsCatalog onApplyPreset={vi.fn()} currentMode="dark" />);
        const grid = container.querySelector('.grid') as HTMLElement;
        expect(grid.className).not.toMatch(/\bmd:grid-cols-2\b/);
        expect(grid.className).not.toMatch(/\blg:grid-cols-3\b/);
        expect(grid.className).toMatch(/@min-\[768px\]:grid-cols-2/);
        expect(grid.className).toMatch(/@min-\[1024px\]:grid-cols-3/);
    });
});
