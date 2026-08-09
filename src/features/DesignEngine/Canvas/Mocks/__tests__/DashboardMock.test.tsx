import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { MockDashboard } from '../DashboardMock';

vi.mock('../../../../../core/Provider/SarakUIProvider', () => {
    const useSarakUI = vi.fn(() => ({ mode: 'dark', branding: {} }));
    return { useSarakUI, useSarakUIOptional: useSarakUI };
});

// O DashboardMock usa useDesignVariables internamente
vi.mock('../../../../../core/Design/hooks/useDesignVariables', () => ({
    useDesignVariables: vi.fn(() => ({ variables: {} }))
}));

describe('MockDashboard', () => {
    const defaultProps = {
        tokens: {},
        config: {},
        animationVariants: {},
        animationStyle: 'default'
    };

    it('renderiza os blocos principais do dashboard (métricas)', () => {
        render(<MockDashboard {...defaultProps} />);
        
        expect(screen.getByText(/CPU Cluster/i)).toBeInTheDocument();
        expect(screen.getByText(/System Health/i)).toBeInTheDocument();
        expect(screen.getByText(/Anomaly Radar/i)).toBeInTheDocument();
    });
});
