import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { PresetsCatalog } from '../PresetsCatalog';

vi.mock('../../../../../core/Design/hooks/useDesignVariables', () => ({
    useDesignVariables: vi.fn(() => ({ variables: {}, attributes: {} }))
}));

vi.mock('framer-motion', async () => {
    const actual = await vi.importActual('framer-motion');
    return { ...actual as any, motion: { button: ({ children, className, ...props }: any) => <button className={className} {...props}>{children}</button> } };
});

describe('PresetsCatalog', () => {
    it('renderiza a aba Globais por padrão, independente de qualquer Pilar, e faz snapshot', () => {
        const { container } = render(<PresetsCatalog onApplyPreset={vi.fn()} currentMode="dark" />);
        expect(screen.getByText('Categoria: Globais')).toBeInTheDocument();
        expect(container).toMatchSnapshot();
    });

    it('troca para o catálogo de Typography ao clicar na própria aba', () => {
        render(<PresetsCatalog onApplyPreset={vi.fn()} currentMode="dark" />);
        fireEvent.click(screen.getByRole('button', { name: 'Typography' }));
        expect(screen.getByText('Categoria: Typography')).toBeInTheDocument();
        expect(screen.getAllByText('The quick brown fox jumps over the lazy dog')[0]).toBeInTheDocument();
    });

    it('expõe as 6 abas fixas (Globais + 5 categorias de Schema), sem depender de Pilar', () => {
        render(<PresetsCatalog onApplyPreset={vi.fn()} currentMode="dark" />);
        ['Globais', 'Cards', 'Typography', 'Atmosphere', 'Buttons', 'Inputs'].forEach(label => {
            expect(screen.getByRole('button', { name: label })).toBeInTheDocument();
        });
    }, 15000); // 5000 (default) não bastava sob `vitest --coverage` (instrumentação V8 + contenção de workers, mesma causa do PreviewCanvas.test.tsx, plan-12/R8.1)

    it('carrega UMA fronteira @container que serve a aba Globais E os 4 sub-catálogos aninhados (plan-35, fecha 06-painel-de-customizacao-e-preview.md §6.2)', () => {
        const { container } = render(<PresetsCatalog onApplyPreset={vi.fn()} currentMode="dark" />);

        const containerBoundary = Array.from(container.querySelectorAll('div'))
            .find((el) => el.className.split(' ').includes('@container'));
        expect(containerBoundary).toBeTruthy();

        const globalsGrid = container.querySelector('.grid') as HTMLElement;
        expect(globalsGrid.className).not.toMatch(/\bmd:grid-cols-2\b/);
        expect(globalsGrid.className).toMatch(/@min-\[768px\]:grid-cols-2/);
        // A grade global mora DENTRO da fronteira de container — é dela que ela mede.
        expect(containerBoundary?.contains(globalsGrid)).toBe(true);
    });
});
