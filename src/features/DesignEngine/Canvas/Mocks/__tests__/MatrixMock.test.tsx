import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { MockMatrix } from '../MatrixMock';

vi.mock('../../../../../core/Provider/SarakUIProvider', () => ({
    useSarakUI: vi.fn(() => ({ mode: 'dark', branding: {} }))
}));

// Ignorar animações do framer-motion no teste
vi.mock('framer-motion', async () => {
    const actual = await vi.importActual('framer-motion');
    return {
        ...actual as any,
        motion: {
            div: ({ children, className, ...props }: any) => <div className={className} {...props}>{children}</div>
        }
    };
});

describe('MockMatrix', () => {
    const defaultProps = {
        tokens: {},
        config: {},
        animationVariants: {},
        animationStyle: 'standard'
    };

    it('renderiza o título e descrição', () => {
        render(<MockMatrix {...defaultProps} />);
        
        expect(screen.getByText('Advanced Matrix')).toBeInTheDocument();
        expect(screen.getByText('Real-time Data-Driven Control Preview')).toBeInTheDocument();
    });

    it('renderiza as roles (linhas principais)', () => {
        render(<MockMatrix {...defaultProps} />);
        
        expect(screen.getByText('Administrator')).toBeInTheDocument();
        expect(screen.getByText('Editor')).toBeInTheDocument();
        expect(screen.getByText('Viewer')).toBeInTheDocument();
    });
});
