import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { MockSettings } from '../SettingsMock';

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

describe('MockSettings', () => {
    const defaultProps = {
        tokens: {},
        config: {},
        animationVariants: {},
        animationStyle: 'default'
    };

    it('renderiza os painéis de configurações simuladas', () => {
        render(<MockSettings {...defaultProps} />);
        
        expect(screen.getByText('Engine Visualization')).toBeInTheDocument();
        expect(screen.getByText('Flow Architecture')).toBeInTheDocument();
        expect(screen.getByText('Security Orchestrator')).toBeInTheDocument();
        expect(screen.getByText('Two-Factor Authentication')).toBeInTheDocument();
    });
});
