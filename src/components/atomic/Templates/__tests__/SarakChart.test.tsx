import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { SarakChart } from '../SarakChart';
import React from 'react';

vi.mock('../hooks/useChartData', () => ({
    useChartData: vi.fn(() => ({
        data: [
            { tokens: 100, value: 50, date: '2023-01-01' },
            { tokens: 200, value: 80, date: '2023-01-02' }
        ],
        loading: false,
        error: null
    }))
}));

vi.mock('../../hooks/useStructuralStyles', () => ({
    useStructuralStyles: vi.fn(() => ({
        getContainerStyles: () => ({ className: 'mocked-container', style: {} })
    }))
}));

// Mock resize observer para o framer-motion/React
global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
};

describe('SarakChart', () => {
    it('should be defined and export its contents without crashing', () => {
        expect(SarakChart).toBeDefined();
    });

    it('matches snapshot to ensure no layout regressions during type fixes', () => {
        const { asFragment } = render(
            <SarakChart endpoint="/api/test" label="Test Chart" />
        );
        expect(asFragment()).toMatchSnapshot();
    });
});
