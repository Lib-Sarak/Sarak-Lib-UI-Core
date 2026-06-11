import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { MockForms } from '../MockForms';

vi.mock('../../../../../core/Provider/SarakUIProvider', () => ({
    useSarakUI: vi.fn(() => ({ mode: 'dark', branding: {} }))
}));

vi.mock('framer-motion', async () => {
    const actual = await vi.importActual('framer-motion');
    return {
        ...actual as any,
        motion: {
            div: ({ children, className, ...props }: any) => <div className={className} {...props}>{children}</div>
        }
    };
});

describe('MockForms', () => {
    const defaultProps = {
        tokens: {},
        config: {},
        animationVariants: {},
        animationStyle: 'default'
    };

    it('renderiza os textos estruturais do formulário', () => {
        render(<MockForms {...defaultProps} />);
        
        expect(screen.getByText('Componentes de Formulário')).toBeInTheDocument();
        expect(screen.getByText(/Registro Completo/i)).toBeInTheDocument();
        expect(screen.getByText(/Datas e Marcos/i)).toBeInTheDocument();
    });

    it('renderiza os inputs e controles', () => {
        render(<MockForms {...defaultProps} />);
        
        expect(screen.getByPlaceholderText('Sarak Enterprise')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('00.000.000/0001-00')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /SALVAR E CONTINUAR/i })).toBeInTheDocument();
    });
});
