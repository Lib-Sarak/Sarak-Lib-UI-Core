import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { SarakActionCard } from '../SarakActionCard';

// Mock do contexto global
vi.mock('../../../../core/Provider/SarakUIProvider', () => ({
    useSarakUI: vi.fn(() => ({
        design: {},
        isDrafting: false
    }))
}));

// Mock do hook interno
vi.mock('../hooks/useCardLayoutStyles', () => ({
    useCardLayoutStyles: vi.fn(() => ({
        containerClass: 'mock-container',
        contentClass: 'mock-content',
        headerClass: 'mock-header',
        footerClass: 'mock-footer'
    }))
}));

// Mock do framer-motion
vi.mock('framer-motion', async () => {
    const actual = await vi.importActual('framer-motion');
    return {
        ...actual as any,
        motion: {
            div: ({ children, className, style, ...props }: any) => <div className={className} style={style} {...props} data-testid="motion-div">{children}</div>,
            button: ({ children, className, ...props }: any) => <button className={className} {...props}>{children}</button>
        },
        AnimatePresence: ({ children }: any) => <>{children}</>
    };
});

describe('SarakActionCard', () => {
    const mockItem = {
        name: 'Test Model',
        cost: 0.5,
        desc: 'Model description'
    };

    const mockMapping = {
        title: 'name',
        price_in: 'cost',
        description: 'desc'
    };

    it('renderiza o cartao corretamente com os mapeamentos', () => {
        render(<SarakActionCard item={mockItem} mapping={mockMapping} design={{}} />);
        
        expect(screen.getByText('Test Model')).toBeInTheDocument();
        expect(screen.getByText('Model description')).toBeInTheDocument();
    });

    it('chama onAction ao clicar no botao principal', () => {
        const onActionMock = vi.fn();
        render(<SarakActionCard item={mockItem} mapping={mockMapping} design={{}} onAction={onActionMock} />);
        
        const btn = screen.getByText('Executar');
        fireEvent.click(btn);
        
        expect(onActionMock).toHaveBeenCalledWith(mockItem);
        expect(onActionMock).toHaveBeenCalledTimes(1);
    });

    it('expande para mostrar as especificacoes tecnicas ao clicar no chevron', () => {
        render(<SarakActionCard item={mockItem} mapping={mockMapping} design={{}} />);
        
        // Verifica que os custos nao estao aparecendo ainda
        expect(screen.queryByText('$0.5000')).not.toBeInTheDocument();
        
        // Botao do chevron e o unico botao sem o texto 'Executar'
        const buttons = screen.getAllByRole('button');
        const expandBtn = buttons.find(b => !b.textContent?.includes('Executar'));
        
        if(expandBtn) {
            fireEvent.click(expandBtn);
        }
        
        expect(screen.getByText('$0.5000')).toBeInTheDocument();
        expect(screen.getByText('Custo In (1M)')).toBeInTheDocument();
    });
});
