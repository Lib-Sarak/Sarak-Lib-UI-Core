import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { SarakUIProvider } from '../../../../core/Provider/SarakUIProvider';
import { SarakAlert, type SarakAlertProps } from '../SarakAlert';

const VARIANTS = [
    { variant: 'info', role: 'status', statusCssVariable: '--sarak-status-info-color' },
    { variant: 'success', role: 'status', statusCssVariable: '--sarak-status-success-color' },
    { variant: 'warning', role: 'status', statusCssVariable: '--sarak-status-warning-color' },
    { variant: 'error', role: 'alert', statusCssVariable: '--sarak-status-error-color' },
] as const;

function renderSarakAlert(props: SarakAlertProps): ReturnType<typeof render> {
    return render(
        <SarakUIProvider>
            <SarakAlert {...props} />
        </SarakUIProvider>,
    );
}

it.each(VARIANTS)('renderiza a intenção $variant com seu token e papel ARIA', ({ variant, role, statusCssVariable }) => {
    renderSarakAlert({ variant, title: 'Aviso persistente', message: 'Mensagem importante.' });

    const alert = screen.getByRole(role);

    expect(alert).toHaveAttribute('data-variant', variant);
    expect(alert).toHaveAccessibleName('Aviso persistente');
    expect(alert).toHaveAccessibleDescription('Mensagem importante.');
    expect(alert.getAttribute('style')).toContain(statusCssVariable);
    expect(alert.querySelector('[aria-hidden="true"] svg')).toBeInTheDocument();
});

it('executa a ação opcional sem fechar o aviso automaticamente', () => {
    const onAction = vi.fn();
    renderSarakAlert({
        variant: 'info',
        title: 'Atenção',
        message: 'Revise os dados.',
        action: { label: 'Revisar', onClick: onAction },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Revisar' }));

    expect(onAction).toHaveBeenCalledOnce();
    expect(screen.getByRole('status')).toBeInTheDocument();
});

it('usa SarakIconButton para fechar quando há callback e o delega ao consumidor', () => {
    const onClose = vi.fn();
    renderSarakAlert({ title: 'Concluído', message: 'Alterações salvas.', onClose });

    const closeButton = screen.getByRole('button', { name: 'Fechar aviso' });

    expect(closeButton).toHaveAttribute('type', 'button');
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalledOnce();
    expect(screen.getByRole('status')).toBeInTheDocument();
});

it('usa info por padrão e não renderiza controles opcionais quando omitidos', () => {
    renderSarakAlert({ title: 'Informação', message: 'A operação está em andamento.' });

    expect(screen.getByRole('status')).toHaveAttribute('data-variant', 'info');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
});
