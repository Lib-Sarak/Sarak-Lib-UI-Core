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

// A tabela real é preguiçosa e virtualizada (o jsdom não mede altura): o stub desenha toda linha com o render da coluna,
// e o que a tabela real faz com densidade e listras é coberto pelos testes dela.
vi.mock('../../../../../components/atomic/DataDisplay/SarakDataTable', () => ({
    SarakDataTable: ({ columns, rows }: { columns: Array<{ id: string; header: React.ReactNode; render?: (row: unknown, index: number) => React.ReactNode }>; rows: Array<Record<string, unknown>> }) => (
        <div data-testid="datatable">
            {columns.map((column) => <span key={column.id}>{column.header}</span>)}
            {rows.map((row, index) => <div key={String(row.id)}>{columns.map((column) => <span key={column.id}>{column.render ? column.render(row, index) : String(row[column.id])}</span>)}</div>)}
        </div>
    ),
}));

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
        expect(screen.getByText('Hospedagem')).toBeInTheDocument();
        expect(screen.getByText('+$8,450.00')).toBeInTheDocument();
    });

    it('as duas tabelas são a tabela real da lib, não um <table> à mão', () => {
        const { container } = render(<MockTable {...defaultProps} />);
        expect(screen.getAllByTestId('datatable')).toHaveLength(2);
        expect(container.querySelector('table')).toBeNull();
    });

    it('o status de cada módulo é o selo real, com a forma que acompanha a cor', () => {
        const { container } = render(<MockTable {...defaultProps} />);
        expect(screen.getByText('Warning')).toBeInTheDocument();
        expect(container.querySelector('[data-status-shape]')).not.toBeNull();
    });

    it('os pontos dos usuários não mudam a cada render: a prévia não pisca sozinha', () => {
        const { unmount } = render(<MockTable {...defaultProps} />);
        const first = screen.getAllByText(/ pts$/).map((node) => node.textContent);
        unmount();
        render(<MockTable {...defaultProps} />);
        expect(screen.getAllByText(/ pts$/).map((node) => node.textContent)).toEqual(first);
    });

    it('renderiza os usuários da mini tabela', () => {
        render(<MockTable {...defaultProps} />);
        
        // Temos 5 usuários no mock [1,2,3,4,5]
        expect(screen.getByText('User_Alpha_19')).toBeInTheDocument();
        expect(screen.getByText('User_Alpha_59')).toBeInTheDocument();
    });
});
