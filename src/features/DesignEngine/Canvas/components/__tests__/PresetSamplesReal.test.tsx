import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, expect, it, vi } from 'vitest';
import SarakUIProvider from '../../../../../core/Provider/SarakUIProvider';
import { CHART_SAMPLE_FRAME, ChartSample, EmptySample, ProgressSample, TableSample } from '../PresetSamplesReal';

const chart = vi.hoisted(() => ({ props: [] as Array<Record<string, unknown>> }));

// O motor (echarts) e a tabela virtualizada não desenham no jsdom: o que se confere é o que a amostra pede a eles.
vi.mock('../../../../../components/engines/charts', () => ({
    SarakChartEngine: (props: Record<string, unknown>) => { chart.props.push(props); return <div data-chart-engine={String(props.type)} />; },
}));
vi.mock('../../../../../components/atomic/DataDisplay/SarakDataTable', () => ({
    SarakDataTable: ({ columns, rows }: { columns: unknown[]; rows: unknown[] }) => <div data-real-table={`${columns.length}x${rows.length}`} />,
}));

const inProvider = (node: React.ReactElement): ReturnType<typeof render> => render(<SarakUIProvider>{node}</SarakUIProvider>);

describe('PresetSamplesReal', () => {
    it('o gráfico é um só, do tipo fixo, sem animação e no quadro em que o motor lê', () => {
        chart.props.length = 0;
        const { container } = inProvider(<ChartSample />);
        expect(container.querySelectorAll('[data-chart-engine]')).toHaveLength(1);
        expect(chart.props[0]).toMatchObject({ type: 'area', height: CHART_SAMPLE_FRAME.height, config: { showAnimation: false } });
        expect((container.querySelector('[data-sample-chart]') as HTMLElement).style.width).toBe(`${CHART_SAMPLE_FRAME.width}px`);
    });

    it('a tabela monta o componente real com três colunas e quatro linhas', async () => {
        const { container } = inProvider(<TableSample />);
        await waitFor(() => expect(container.querySelector('[data-real-table="3x4"]')).not.toBeNull());
    });

    it('selo e progresso: três selos e duas barras de progresso reais', () => {
        inProvider(<ProgressSample />);
        expect(screen.getAllByRole('progressbar')).toHaveLength(2);
        expect(screen.getByText('OK')).toBeInTheDocument();
    });

    it('o estado vazio é o componente real, dentro de um quadro que corta o que passa dele', () => {
        const { container } = inProvider(<EmptySample />);
        expect(container.querySelector('.overflow-hidden h2')).not.toBeNull();
    });

    it('o guia do estado vazio desenha as quatro medidas do componente, lidas das mesmas variáveis', () => {
        const { container } = inProvider(<EmptySample />);
        const guide = container.querySelector('[data-sample-empty-guide]') as HTMLElement;
        const painted = Array.from(guide.querySelectorAll<HTMLElement>('div div div')).map((node) => node.getAttribute('style') ?? '');
        for (const variable of ['orb-outer', 'orb-inner', 'ring-radius', 'caption-max-width']) {
            expect(painted.some((style) => style.includes(`--sarak-empty-state-${variable}`))).toBe(true);
        }
        expect(guide).toHaveAttribute('aria-hidden', 'true');
    });
});
