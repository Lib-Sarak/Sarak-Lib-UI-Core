import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { MockChat } from '../ChatMock';

vi.mock('../../../../../core/Provider/SarakUIProvider', () => {
    const useSarakUI = vi.fn(() => ({ mode: 'dark', branding: {} }));
    return { useSarakUI, useSarakUIOptional: useSarakUI };
});

vi.mock('framer-motion', async () => {
    const actual = await vi.importActual('framer-motion');
    return {
        ...actual as any,
        motion: {
            div: ({ children, className, ...props }: any) => <div className={className} {...props}>{children}</div>
        }
    };
});

describe('MockChat', () => {
    const defaultProps = {
        tokens: {},
        config: {},
        animationVariants: {},
        animationStyle: 'default'
    };

    it('renderiza os blocos do chat e conversas', () => {
        render(<MockChat {...defaultProps} />);
        
        expect(screen.getByText('Workspace Chat')).toBeInTheDocument();
        expect(screen.getByText('Sarak Support')).toBeInTheDocument();
        expect(screen.getByText(/Bem-vindo ao canal do projeto Alpha/i)).toBeInTheDocument();
        expect(screen.getByText(/Thread In-Line/i)).toBeInTheDocument();
    });
});
