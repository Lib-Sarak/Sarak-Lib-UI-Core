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
});
