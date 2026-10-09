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
    const createProps = (onClose = vi.fn()) => ({
        onApplyPreset: vi.fn(),
        currentMode: 'dark',
        onClose,
    });

    it('renderiza a aba Temas por padrão, independente de qualquer Pilar, e faz snapshot', () => {
        const { container } = render(<PresetsCatalog {...createProps()} />);
        expect(screen.getByRole('heading', { name: 'Galeria de estilos' })).toBeInTheDocument();
        expect(screen.getByText('Categoria: Temas')).toBeInTheDocument();
        expect(container).toMatchSnapshot();
    });

    it('troca para o catálogo de Tipografia ao clicar na própria aba', () => {
        render(<PresetsCatalog {...createProps()} />);
        fireEvent.click(screen.getByRole('button', { name: 'Tipografia' }));
        expect(screen.getByText('Categoria: Tipografia')).toBeInTheDocument();
        expect(screen.getAllByText('The quick brown fox jumps over the lazy dog')[0]).toBeInTheDocument();
    });

    it('expõe as seis abas com rótulos em português', () => {
        render(<PresetsCatalog {...createProps()} />);
        ['Temas', 'Cards', 'Tipografia', 'Atmosfera', 'Botões', 'Campos'].forEach(label => {
            expect(screen.getByRole('button', { name: label })).toBeInTheDocument();
        });
    }, 15000); // 5000 (default) não bastava sob `vitest --coverage` (instrumentação V8 + contenção de workers, mesma causa do PreviewCanvas.test.tsx, plan-12/R8.1)

    it('o botão do cabeçalho fecha a galeria', () => {
        const onClose = vi.fn();
        render(<PresetsCatalog {...createProps(onClose)} />);

        fireEvent.click(screen.getByRole('button', { name: 'Fechar galeria' }));

        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('carrega UMA fronteira @container que serve a aba Temas E os 4 sub-catálogos aninhados (fecha 06-painel-de-customizacao-e-preview.md §6.2)', () => {
        const { container } = render(<PresetsCatalog {...createProps()} />);

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
