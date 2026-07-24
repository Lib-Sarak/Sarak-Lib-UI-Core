import React from 'react';
import '@testing-library/jest-dom';
import { render, fireEvent, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SaveThemeModal } from '../SaveThemeModal';
import { SarakUIProvider } from '../../../../../core/Provider/SarakUIProvider';

const customRender = (ui: React.ReactElement) => {
    return render(<SarakUIProvider>{ui}</SarakUIProvider>);
};

vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: any) => <div {...props}>{children}</div>
    },
    AnimatePresence: ({ children }: any) => <>{children}</>
}));

vi.mock('lucide-react', async (importOriginal) => {
    const actual = await importOriginal<any>();
    return {
        ...actual,
        FileJson: () => <div data-testid="icon-filejson" />,
        X: () => <div data-testid="icon-x" />
    };
});

describe('SaveThemeModal (Spec 44 — exportar tema como JSON, sem backend)', () => {
    const defaultProps = {
        isOpen: true,
        onClose: vi.fn(),
        onExport: vi.fn(),
    };

    it('não renderiza se isOpen for falso', () => {
        customRender(<SaveThemeModal {...defaultProps} isOpen={false} />);
        expect(screen.queryByText('Exportar Tema (JSON)')).not.toBeInTheDocument();
    });

    it('renderiza o nome pré-preenchido e o aviso de que nada vai para um servidor', () => {
        customRender(<SaveThemeModal {...defaultProps} themeName="Meu Tema" />);
        expect(screen.getByText('Exportar Tema (JSON)')).toBeInTheDocument();
        expect(screen.getByText(/não tem backend próprio/)).toBeInTheDocument();
        expect(screen.getByDisplayValue('Meu Tema')).toBeInTheDocument();
    });

    it('chama onExport com o nome editado ao clicar em "Exportar JSON"', () => {
        const onExport = vi.fn();
        customRender(<SaveThemeModal {...defaultProps} onExport={onExport} />);

        const input = screen.getByPlaceholderText('Ex: Sarak Sovereign Customizado');
        fireEvent.change(input, { target: { value: 'Tema Corporativo' } });

        fireEvent.click(screen.getByText('Exportar JSON'));

        expect(onExport).toHaveBeenCalledWith('Tema Corporativo');
    });

    it('chama onClose ao cancelar ou fechar', () => {
        const onClose = vi.fn();
        customRender(<SaveThemeModal {...defaultProps} onClose={onClose} />);

        fireEvent.click(screen.getByText('Cancelar'));
        expect(onClose).toHaveBeenCalledTimes(1);

        fireEvent.click(screen.getByTestId('icon-x').parentElement!);
        expect(onClose).toHaveBeenCalledTimes(2);
    });

    it('desabilita "Exportar JSON" quando o nome está vazio', () => {
        customRender(<SaveThemeModal {...defaultProps} themeName="" />);
        const input = screen.getByPlaceholderText('Ex: Sarak Sovereign Customizado');
        fireEvent.change(input, { target: { value: '' } });
        expect(screen.getByText('Exportar JSON').closest('button')).toBeDisabled();
    });
});
