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
    });
});
