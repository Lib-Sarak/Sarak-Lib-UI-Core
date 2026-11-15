import React from 'react';
import { fireEvent, render as rtlRender, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import { MockComponents } from '../ComponentsMock';
import { SarakUIProvider } from '../../../../../core/Provider/SarakUIProvider';

const render = (ui: React.ReactElement) => rtlRender(<SarakUIProvider>{ui}</SarakUIProvider>);

describe('MockComponents — a tela que mostra os componentes que as decisões mudam', () => {
    it('o interruptor é o componente real: um input role=switch que liga e desliga', () => {
        render(<MockComponents />);
        const sync = screen.getByRole('switch', { name: 'Sincronizar agora' });
        expect(sync).not.toBeChecked();
        fireEvent.click(sync);
        expect(sync).toBeChecked();
        expect(screen.getByRole('switch', { name: 'Avisar por e-mail' })).toBeChecked();
    });

    it('os selos são o componente real, um por situação', () => {
        const { container } = render(<MockComponents />);
        ['Aprovado', 'Atrasado', 'Em análise', 'Arquivado'].forEach((label) => expect(screen.getByText(label)).toBeInTheDocument());
        expect(container.querySelector('[data-status-shape]')).not.toBeNull();
    });

    it('mostra o aviso real, o diálogo, a lista com rolagem e o estado vazio', () => {
        const { container } = render(<MockComponents />);
        expect(screen.getByText('Estoque baixo')).toBeInTheDocument();
        expect(screen.getByText('Excluir pedido')).toBeInTheDocument();
        expect(container.querySelector('.sarak-modal-panel')).not.toBeNull();
        expect(container.querySelector('.custom-scrollbar')).not.toBeNull();
        expect(screen.getByText('Copiar o código do pedido')).toBeInTheDocument();
    });

    it('nenhum interruptor ou selo é desenhado à mão com div ou span de formato fixo', () => {
        const { container } = render(<MockComponents />);
        expect(container.querySelectorAll('[role="switch"]')).toHaveLength(3);
        expect(container.querySelector('span.rounded-full.px-3')).toBeNull();
    });
});
