import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { MockDashboard } from '../DashboardMock';
import { useDesignVariables } from '../../../../../core/Design/hooks/useDesignVariables';

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

    it('com as variáveis herdadas do escopo, os cartões não repetem as variáveis do design no estilo de cada um', () => {
        vi.mocked(useDesignVariables).mockReturnValue({ variables: { '--sarak-marcador': '1' }, attributes: {} } as never);
        const { container, unmount } = render(<MockDashboard {...defaultProps} />);
        expect(container.querySelector('[style*="--sarak-marcador"]')).not.toBeNull();
        unmount();

        const inherited = render(<MockDashboard {...defaultProps} inheritVariables />);
        expect(inherited.container.querySelector('[style*="--sarak-marcador"]')).toBeNull();
        vi.mocked(useDesignVariables).mockReturnValue({ variables: {} } as never);
    });
});
