import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { SarakChart } from '../SarakChart';
import { useChartData } from '../hooks/useChartData';
import React from 'react';

const DEFAULT_CHART_POINTS = vi.hoisted(() => [
    { tokens: 100, value: 50, date: '2023-01-01' },
    { tokens: 200, value: 80, date: '2023-01-02' },
]);
const SAMPLE_CHART_POINT = vi.hoisted(() => ({ value: 50, date: '2023-01-01' }));
const CACHED_CHART_POINT = vi.hoisted(() => ({ value: 50, date: 'Cached point' }));

vi.mock('../hooks/useChartData', () => ({
    useChartData: vi.fn(() => ({
        data: DEFAULT_CHART_POINTS,
        loading: false,
        error: null,
        updatedAt: null,
        loadData: vi.fn(),
    }))
}));

vi.mock('../../hooks/useStructuralStyles', () => ({
    useStructuralStyles: vi.fn(() => ({
        getContainerStyles: () => ({ className: 'mocked-container', style: {} }),
        getFlexStyles: (direction?: string, justify?: string, align?: string, gapOverride?: string) => ({
            className: 'flex w-full',
            style: { flexDirection: direction, justifyContent: justify, alignItems: align, gap: gapOverride }
        })
    }))
}));

// Mock resize observer para o framer-motion/React
global.ResizeObserver = class {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
};

describe('SarakChart', () => {
    it('should be defined and export its contents without crashing', () => {
        expect(SarakChart).toBeDefined();
    });

    it('matches snapshot to ensure no layout regressions during type fixes', () => {
        const { asFragment } = render(
            <SarakChart data={[SAMPLE_CHART_POINT]} label="Test Chart" />
        );
        expect(asFragment()).toMatchSnapshot();
    });

    it('usa a cor de destaque no fundo da dica de dados do gráfico', () => {
        const { container } = render(<SarakChart data={[SAMPLE_CHART_POINT]} label="Test Chart" />);
        const tooltip = container.querySelector('[class*="group-hover/item:opacity-100"]');
        expect(tooltip?.className).toContain('--sarak-emphasis-color');
        expect(tooltip?.className).not.toContain('--color-theme-title');
    });

    it('keeps the last points visible with a stale notice and retry action', () => {
        const loadData = vi.fn();
        vi.mocked(useChartData).mockReturnValue({
            data: [CACHED_CHART_POINT], loading: false, error: 'Unavailable',
            updatedAt: new Date('2026-10-10T22:12:00.000Z'), loadData,
        } as ReturnType<typeof useChartData>);
        render(<SarakChart />);

        expect(screen.getByText('Cached point')).toBeInTheDocument();
        expect(screen.getByText('Unavailable')).toBeInTheDocument();
        expect(screen.getByText('Desatualizado')).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
        expect(loadData).toHaveBeenCalledOnce();
    });
});
