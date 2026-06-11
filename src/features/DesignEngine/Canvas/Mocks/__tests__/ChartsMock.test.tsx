import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { MockCharts } from '../ChartsMock';

vi.mock('../../../../../core/Provider/SarakUIProvider', () => ({
    useSarakUI: vi.fn(() => ({ mode: 'dark', branding: {} }))
}));

// Ignorar animações do framer-motion no teste para simplificar e focar no DOM puro
vi.mock('framer-motion', async () => {
    const actual = await vi.importActual('framer-motion');
    return {
        ...actual as any,
        motion: {
            div: ({ children, className, ...props }: any) => <div className={className} {...props}>{children}</div>
        }
    };
});

describe('MockCharts', () => {
    const defaultProps = {
        tokens: {},
        config: {},
        animationVariants: {},
        animationStyle: 'default'
    };

    it('renderiza o cabeçalho principal', () => {
        render(<MockCharts {...defaultProps} />);
        
        expect(screen.getByText('Advanced Analytics & Charts')).toBeInTheDocument();
        expect(screen.getByText(/Galeria de Múltiplos Espécimes/i)).toBeInTheDocument();
    });

    it('renderiza as diferentes seções de gráficos', () => {
        render(<MockCharts {...defaultProps} />);
        
        expect(screen.getByText(/Gráfico de Linha/i)).toBeInTheDocument();
        expect(screen.getByText(/Gráfico de Área/i)).toBeInTheDocument();
        expect(screen.getByText(/Gráfico de Barras/i)).toBeInTheDocument();
        expect(screen.getByText(/Gráfico de Pizza/i)).toBeInTheDocument();
        expect(screen.getByText(/Gráfico de Dispersão/i)).toBeInTheDocument();
        expect(screen.getByText(/Teia de Performance/i)).toBeInTheDocument();
    });
});
