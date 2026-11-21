import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { MockCharts } from '../ChartsMock';

const engine = vi.hoisted(() => ({ calls: [] as Array<{ type: string; data: unknown[] }> }));

// O motor (echarts) não roda no jsdom: a tela é o que pede a ele, um gráfico por tipo.
vi.mock('../../../../../components/engines/charts', () => ({
    SarakChartEngine: (props: { type: string; data: unknown[] }) => { engine.calls.push(props); return <div data-chart-engine={props.type} />; },
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

const TYPES_OF_CHART_TYPE = ['line', 'area', 'bar', 'pie', 'radar', 'scatter', 'heatmap', 'gauge'];

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

    it('mostra os oito tipos do chartType, cada um pelo motor real', () => {
        engine.calls.length = 0;
        const { container } = render(<MockCharts {...defaultProps} />);

        expect(Array.from(container.querySelectorAll('[data-chart-specimen]')).map((node) => node.getAttribute('data-chart-specimen'))).toEqual(TYPES_OF_CHART_TYPE);
        expect(Array.from(container.querySelectorAll('[data-chart-engine]')).map((node) => node.getAttribute('data-chart-engine'))).toEqual(TYPES_OF_CHART_TYPE);
        expect(engine.calls.every((call) => call.data.length > 0)).toBe(true);
    });

    it('rotula cada espécime pelo nome do tipo', () => {
        render(<MockCharts {...defaultProps} />);

        expect(screen.getByText(/Gráfico de Linha/i)).toBeInTheDocument();
        expect(screen.getByText(/Gráfico de Barras/i)).toBeInTheDocument();
        expect(screen.getByText(/Mapa de Calor/i)).toBeInTheDocument();
        expect(screen.getByText(/Medidor/i)).toBeInTheDocument();
    });
});
