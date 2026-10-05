import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SarakShellUserWidget, type SarakShellUser } from '../SarakShellUserWidget';
import { SarakUIProvider } from '../../../../core/Provider/SarakUIProvider';

const renderWidget = (
    user: SarakShellUser,
    variant: 'horizontal' | 'vertical' | 'mini' = 'vertical',
): ReturnType<typeof render> =>
    render(
        <SarakUIProvider config={{ language: 'en' }}>
            <SarakShellUserWidget user={user} variant={variant} />
        </SarakUIProvider>,
    );

describe('SarakShellUserWidget — identidade genérica', () => {
    it.each(['vertical', 'horizontal'] as const)('exibe nome e papel em %s', (variant) => {
        renderWidget({ name: 'Ana Lima', role: 'Finance Manager' }, variant);

        expect(screen.getByText('Ana Lima')).toBeInTheDocument();
        expect(screen.getByText('Finance Manager')).toBeInTheDocument();
        expect(screen.queryByText(/Master|Admin|\d+/)).not.toBeInTheDocument();
    });

    it('usa a URL segura do avatar e troca para iniciais se a imagem falhar', () => {
        const avatarUrl = new URL('/ana.png', window.location.href).href;
        const { container } = renderWidget({ name: 'Ana Lima', avatarUrl });
        const image = container.querySelector('img');

        expect(image).toHaveAttribute('src', avatarUrl);
        fireEvent.error(image!);
        expect(screen.getByText('AL')).toBeInTheDocument();
    });

    it('recusa avatar com esquema inseguro e mostra iniciais', () => {
        const { container } = renderWidget({ name: 'Igor Souza', avatarUrl: 'javascript:alert(1)' });

        expect(container.querySelector('img')).toBeNull();
        expect(screen.getByText('IS')).toBeInTheDocument();
    });

    it('mantém nome e papel acessíveis na variante mini', () => {
        const { container } = renderWidget({ name: 'Ana Lima', role: 'Finance Manager' }, 'mini');
        const accessibleIdentity = container.querySelector('.sr-only');

        expect(accessibleIdentity).toHaveTextContent('Ana Lima, Finance Manager');
        expect(screen.getByText('AL')).toBeInTheDocument();
    });

    it('executa logout quando a operação é fornecida', () => {
        const logout = vi.fn();
        render(
            <SarakUIProvider config={{ language: 'en' }}>
                <SarakShellUserWidget user={{ name: 'Ana Lima' }} logout={logout} />
            </SarakUIProvider>,
        );
        fireEvent.click(screen.getByRole('button'));

        expect(logout).toHaveBeenCalledOnce();
    });
});
