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

        const name = screen.getByText('Ana Lima');
        const role = screen.getByText('Finance Manager');
        expect(name).toBeInTheDocument();
        expect(name.className).toContain('theme-title');
        expect(role).toBeInTheDocument();
        expect(role.className).toContain(variant === 'vertical' ? '--sarak-sidebar-item-text-color' : '--sarak-subtitle-color');
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

describe('SarakShellUserWidget — faixa e avatar da lateral', () => {
    const renderWith = (config: Record<string, unknown>, user: SarakShellUser = { name: 'Ana Lima', role: 'Finance Manager' }): ReturnType<typeof render> =>
        render(
            <SarakUIProvider config={{ language: 'en', ...config }}>
                <SarakShellUserWidget user={user} logout={() => undefined} variant="vertical" />
            </SarakUIProvider>,
        );

    it('a faixa tem linha em cima na cor da borda da barra e fundo tingido, nome em cima e papel em caixa alta embaixo', () => {
        const { container } = renderWith({});
        const strip = container.querySelector('[data-sarak-user-strip]') as HTMLElement;
        expect(strip.style.borderTop).toContain('var(--sarak-sidebar-border-color');
        expect(strip.style.background).toContain('color-mix');
        const name = screen.getByText('Ana Lima');
        const role = screen.getByText('Finance Manager');
        expect(name.className).toContain('text-sm');
        expect(name.className).toContain('font-bold');
        expect(role.className).toContain('text-2xs');
        expect(role.className).toContain('uppercase');
        expect(role.className).toContain('tracking-widest');
        expect(name.compareDocumentPosition(role) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });

    it('`userAvatarStyle: initials` (o padrão) mostra as iniciais', () => {
        const { container } = renderWith({});
        expect(container.querySelector('[data-sarak-avatar-initials]')).toHaveTextContent('AL');
    });

    it('`userAvatarStyle: icon` mostra o ícone de pessoa no lugar das iniciais', () => {
        const { container } = renderWith({ userAvatarStyle: 'icon' });
        expect(container.querySelector('[data-sarak-avatar-initials]')).toBeNull();
        expect(screen.queryByText('AL')).toBeNull();
        expect(container.querySelector('[aria-hidden="true"] svg')).not.toBeNull();
    });

    it('com imagem, a imagem vale nos dois estilos', () => {
        const avatarUrl = new URL('/ana.png', window.location.href).href;
        const { container } = renderWith({ userAvatarStyle: 'icon' }, { name: 'Ana Lima', avatarUrl });
        expect(container.querySelector('img')).toHaveAttribute('src', avatarUrl);
    });
});
