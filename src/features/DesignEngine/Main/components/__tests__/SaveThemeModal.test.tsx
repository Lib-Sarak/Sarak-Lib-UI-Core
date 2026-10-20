import React from 'react';
import '@testing-library/jest-dom';
import { render, fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { SaveThemeModal } from '../SaveThemeModal';
import { SarakUIProvider } from '../../../../../core/Provider/SarakUIProvider';

const customRender = (ui: React.ReactElement) => render(<SarakUIProvider>{ui}</SarakUIProvider>);
const customRenderWithSavePort = (ui: React.ReactElement, onSave = vi.fn()) =>
    render(<SarakUIProvider options={{ theme: { onSave } }}>{ui}</SarakUIProvider>);

vi.mock('framer-motion', () => ({
    motion: { div: ({ children, ...props }: any) => <div {...props}>{children}</div> },
    AnimatePresence: ({ children }: any) => <>{children}</>,
    MotionConfig: ({ children }: any) => <>{children}</>,
}));

vi.mock('lucide-react', async (importOriginal) => {
    const actual = await importOriginal<any>();
    return { ...actual, FileJson: () => <div data-testid="icon-filejson" />, X: () => <div data-testid="icon-x" /> };
});

describe('SaveThemeModal', () => {
    const defaultProps = {
        isOpen: true,
        purpose: 'export' as const,
        onClose: vi.fn(),
        onExport: vi.fn(),
    };

    it('não renderiza quando isOpen é falso', () => {
        customRender(<SaveThemeModal {...defaultProps} isOpen={false} />);
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('exporta JSON como ação separada e usa o nome editado', () => {
        const onExport = vi.fn();
        customRender(<SaveThemeModal {...defaultProps} themeName="Meu Tema" onExport={onExport} />);

        expect(screen.getByRole('heading', { name: 'Exportar tema (JSON)' })).toBeInTheDocument();
        expect(screen.getByDisplayValue('Meu Tema')).toBeInTheDocument();
        fireEvent.change(screen.getByPlaceholderText('Ex: Sarak Sovereign Customizado'), { target: { value: 'Tema Corporativo' } });
        fireEvent.click(screen.getByRole('button', { name: 'Exportar JSON' }));

        expect(onExport).toHaveBeenCalledWith('Tema Corporativo');
        expect(screen.queryByRole('button', { name: 'Salvar' })).not.toBeInTheDocument();
    });

    it('chama onClose ao cancelar ou fechar', () => {
        const onClose = vi.fn();
        customRender(<SaveThemeModal {...defaultProps} onClose={onClose} />);

        fireEvent.click(screen.getByText('Cancelar'));
        fireEvent.click(screen.getByRole('button', { name: 'Fechar modal' }));

        expect(onClose).toHaveBeenCalledTimes(2);
    });

    it('esconde os gestos runtime sem options.theme.onSave', () => {
        customRender(<SaveThemeModal {...defaultProps} purpose="runtime" onSave={vi.fn()} />);
        expect(screen.queryByRole('group', { name: 'Ação de salvamento' })).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Salvar como novo' })).toBeDisabled();
    });

    it('substitui um tema importado com o mesmo nome e id do tema de origem', () => {
        const onSave = vi.fn();
        customRenderWithSavePort(<SaveThemeModal
            {...defaultProps}
            purpose="runtime"
            themeName="Tema Importado"
            canReplace
            initialAction="replace"
            onSave={onSave}
        />, vi.fn());

        expect(screen.getByDisplayValue('Tema Importado')).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: /^Salvar$/ }));

        expect(onSave).toHaveBeenCalledWith('Tema Importado', 'replace');
    });

    it('obriga novo nome ao salvar como novo e diferencia duplicação', () => {
        const onSave = vi.fn();
        customRenderWithSavePort(<SaveThemeModal
            {...defaultProps}
            purpose="runtime"
            themeName="Tema Atual"
            canReplace
            initialAction="replace"
            onSave={onSave}
        />, vi.fn());

        fireEvent.click(screen.getByRole('radio', { name: 'Salvar como novo' }));
        expect(screen.getByLabelText('Nome do tema')).toHaveValue('');
        fireEvent.change(screen.getByLabelText('Nome do tema'), { target: { value: 'Tema Novo' } });
        fireEvent.click(screen.getByRole('button', { name: 'Salvar como novo' }));
        expect(onSave).toHaveBeenCalledWith('Tema Novo', 'create');

        fireEvent.click(screen.getByRole('radio', { name: 'Duplicar' }));
        expect(screen.getByLabelText('Nome do tema')).toHaveValue('Tema Atual (cópia)');
    });

    it('permite navegar entre as ações de tema pelas setas do teclado', async () => {
        const user = userEvent.setup();
        customRenderWithSavePort(<SaveThemeModal
            {...defaultProps}
            purpose="runtime"
            themeName="Tema Atual"
            canReplace
            initialAction="replace"
            onSave={vi.fn()}
        />, vi.fn());

        const replaceAction = screen.getByRole('radio', { name: 'Salvar' });
        replaceAction.focus();
        await user.keyboard('{ArrowRight}');

        expect(screen.getByRole('radio', { name: 'Salvar como novo' })).toBeChecked();
    });
});
