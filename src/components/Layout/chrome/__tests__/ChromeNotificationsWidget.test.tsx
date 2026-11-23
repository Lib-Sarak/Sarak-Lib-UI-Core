import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, expect, it, vi } from 'vitest';
import SarakUIProvider from '../../../../core/Provider/SarakUIProvider';
import { ChromeNotificationsWidget } from '../ChromeNotificationsWidget';

const renderWidget = (widget: React.ReactElement): ReturnType<typeof render> =>
    render(<SarakUIProvider>{widget}</SarakUIProvider>);

describe('ChromeNotificationsWidget', () => {
    it('sem itens ou handler, renderiza um controle desabilitado e traduzido', () => {
        renderWidget(<ChromeNotificationsWidget notifications={[{ id: 'n1', label: 'Atualizar' }]} variant="vertical" />);

        const unavailableWidget = screen.getByRole('button', { name: 'Notificações indisponíveis' });
        expect(unavailableWidget).toHaveAttribute('aria-disabled', 'true');
        fireEvent.click(unavailableWidget);
        expect(screen.queryByRole('menu')).toBeNull();
    });

    it('sem itens, continua desabilitado mesmo com handler', () => {
        renderWidget(<ChromeNotificationsWidget notifications={[]} onSelect={vi.fn()} variant="horizontal" />);
        expect(screen.getByRole('button', { name: 'Notificações indisponíveis' })).toHaveAttribute('aria-disabled', 'true');
    });

    it('com itens e handler, abre a lista e trata a seleção', () => {
        const onSelect = vi.fn();
        renderWidget(
            <ChromeNotificationsWidget
                notifications={[{ id: 'n1', label: 'Atualizar', description: 'Há novidades' }]}
                onSelect={onSelect}
                variant="horizontal"
            />,
        );

        fireEvent.click(screen.getByRole('button', { name: 'Notificações' }));
        fireEvent.click(screen.getByText('Atualizar'));

        expect(onSelect).toHaveBeenCalledWith({ id: 'n1', label: 'Atualizar', description: 'Há novidades' });
        expect(screen.queryByRole('menu')).toBeNull();
    });

    it('na lateral é uma linha de menu com o contador à direita, e a lista abre para cima', () => {
        const onSelect = vi.fn();
        const { container } = renderWidget(
            <ChromeNotificationsWidget notifications={[{ id: 'n1', label: 'Atualizar' }]} onSelect={onSelect} variant="vertical" />,
        );
        const row = screen.getByRole('button', { name: /Notificações/ });
        expect(row.className).toContain('px-3');
        expect(container.querySelector('[data-sarak-row-indicator]')).toHaveTextContent('1');
        fireEvent.click(row);
        expect(screen.getByRole('menu').className).toContain('bottom-full');
    });

    it('recolhida, é só o ícone e o aviso é um ponto fora do fluxo, que não desloca o ícone', () => {
        const { container } = renderWidget(
            <ChromeNotificationsWidget notifications={[{ id: 'n1', label: 'Atualizar' }]} onSelect={vi.fn()} variant="mini" />,
        );
        const row = screen.getByRole('button', { name: 'Notificações' });
        expect(row.className).toContain('justify-center');
        expect(row.querySelector('[data-sarak-row-indicator]')).toBeNull();
        expect(container.querySelector('[data-sarak-row-indicator]')!.className).toContain('absolute');
        const dot = container.querySelector<HTMLElement>('[data-sarak-row-indicator]')!;
        // Ancorado no canto de cima à direita do ícone, e não no canto da linha (onde cobria metade do sino).
        expect(dot.style.left).toContain('50%');
        expect(dot.style.top).toContain('50%');
        expect(dot.style.right).toBe('');
    });
});
