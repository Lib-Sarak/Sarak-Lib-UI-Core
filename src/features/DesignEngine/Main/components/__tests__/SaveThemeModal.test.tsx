import React from 'react';
import '@testing-library/jest-dom';
import { render, fireEvent, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SaveThemeModal } from '../SaveThemeModal';

// Mocks
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: any) => <div {...props}>{children}</div>
    },
    AnimatePresence: ({ children }: any) => <>{children}</>
}));

vi.mock('lucide-react', () => ({
    Save: () => <div data-testid="icon-save" />,
    Copy: () => <div data-testid="icon-copy" />,
    X: () => <div data-testid="icon-x" />,
    Database: () => <div data-testid="icon-database" />
}));

describe('SaveThemeModal', () => {
    const defaultProps = {
        isOpen: true,
        onClose: vi.fn(),
        onAction: vi.fn(),
    };

    it('não renderiza se isOpen for falso', () => {
        const { container } = render(<SaveThemeModal {...defaultProps} origin="script" isOpen={false} />);
        expect(container.firstChild).toBeNull();
    });

    it('renderiza corretamente quando origin é script', () => {
        render(<SaveThemeModal {...defaultProps} origin="script" />);
        expect(screen.getByText('Persistência de Tema')).toBeInTheDocument();
        expect(screen.getByText(/Você está modificando um tema padrão/)).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Ex: Sarak Sovereign Customizado')).toBeInTheDocument();
        expect(screen.getByText('Salvar Novo Tema')).toBeInTheDocument();
    });

    it('renderiza corretamente quando origin é database', () => {
        render(<SaveThemeModal {...defaultProps} origin="database" themeName="My Custom Theme" />);
        expect(screen.getByText(/Você modificou o tema/)).toBeInTheDocument();
        expect(screen.getByText('My Custom Theme')).toBeInTheDocument();
        expect(screen.getByText('Atualizar Tema Atual')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Nome para a cópia')).toBeInTheDocument();
        expect(screen.getByText('Salvar Cópia')).toBeInTheDocument();
    });

    it('atualiza o nome do tema e chama onAction(CREATE_NEW) (script)', () => {
        const onAction = vi.fn();
        render(<SaveThemeModal {...defaultProps} origin="script" onAction={onAction} />);
        
        const input = screen.getByPlaceholderText('Ex: Sarak Sovereign Customizado');
        fireEvent.change(input, { target: { value: 'New Theme' } });
        
        const btn = screen.getByText('Salvar Novo Tema');
        fireEvent.click(btn);
        
        expect(onAction).toHaveBeenCalledWith({ type: 'CREATE_NEW', name: 'New Theme' });
    });

    it('chama onAction(OVERWRITE_EXISTING) (database)', () => {
        const onAction = vi.fn();
        render(<SaveThemeModal {...defaultProps} origin="database" onAction={onAction} />);
        
        const btn = screen.getByText('Atualizar Tema Atual');
        fireEvent.click(btn);
        
        expect(onAction).toHaveBeenCalledWith({ type: 'OVERWRITE_EXISTING' });
    });

    it('chama onAction(CREATE_NEW) (database)', () => {
        const onAction = vi.fn();
        render(<SaveThemeModal {...defaultProps} origin="database" onAction={onAction} />);
        
        const input = screen.getByPlaceholderText('Nome para a cópia');
        fireEvent.change(input, { target: { value: 'Copy Theme' } });
        
        const btn = screen.getByText('Salvar Cópia');
        fireEvent.click(btn);
        
        expect(onAction).toHaveBeenCalledWith({ type: 'CREATE_NEW', name: 'Copy Theme' });
    });

    it('chama onAction(CANCEL) e onClose', () => {
        const onClose = vi.fn();
        const onAction = vi.fn();
        render(<SaveThemeModal {...defaultProps} origin="script" onClose={onClose} onAction={onAction} />);
        
        const btnCancel = screen.getByText('Cancelar');
        fireEvent.click(btnCancel);
        expect(onAction).toHaveBeenCalledWith({ type: 'CANCEL' });

        const btnClose = screen.getByTestId('icon-x').parentElement;
        fireEvent.click(btnClose!);
        expect(onClose).toHaveBeenCalled();
    });
});
