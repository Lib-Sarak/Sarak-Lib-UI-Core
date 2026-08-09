import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { MockTable } from '../TableMock';

vi.mock('../../../../../core/Provider/SarakUIProvider', () => {
    const useSarakUI = vi.fn(() => ({ mode: 'dark', branding: {} }));
    return { useSarakUI, useSarakUIOptional: useSarakUI };
});

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

describe('MockTable', () => {
    const defaultProps = {
        tokens: {},
        animationVariants: {}
    };

    it('renderiza os containers das três tabelas', () => {
        render(<MockTable {...defaultProps} />);
        
        expect(screen.getByText('Painel Operacional')).toBeInTheDocument();
        expect(screen.getByText('Top Usuários')).toBeInTheDocument();
        expect(screen.getByText('Financial_Ledger_Q2.xlsx')).toBeInTheDocument();
    });

    it('renderiza os dados da tabela interativa corretamente', () => {
        render(<MockTable {...defaultProps} />);
        
        expect(screen.getByText('SRK-091')).toBeInTheDocument();
        expect(screen.getByText('Scraper_V2_Core')).toBeInTheDocument();
        
        expect(screen.getByText('SRK-094')).toBeInTheDocument();
        expect(screen.getByText('Webhook_API')).toBeInTheDocument();
    });

    it('renderiza os dados da tabela densa (Excel) corretamente', () => {
        render(<MockTable {...defaultProps} />);
        
        expect(screen.getByText('TRX-901')).toBeInTheDocument();
        expect(screen.getByText('AWS Hosting')).toBeInTheDocument();
        expect(screen.getByText('+$8,450.00')).toBeInTheDocument();
    });

    it('renderiza os usuários da mini tabela', () => {
        render(<MockTable {...defaultProps} />);
        
        // Temos 5 usuários no mock [1,2,3,4,5]
        expect(screen.getByText('User_Alpha_19')).toBeInTheDocument();
        expect(screen.getByText('User_Alpha_59')).toBeInTheDocument();
    });
});
