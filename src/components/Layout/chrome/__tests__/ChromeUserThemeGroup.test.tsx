import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, expect, it, vi } from 'vitest';
import SarakUIProvider from '../../../../core/Provider/SarakUIProvider';
import { ChromeUserThemeGroup } from '../ChromeUserThemeGroup';

const renderGroup = (ui: React.ReactElement) => render(<SarakUIProvider>{ui}</SarakUIProvider>);

describe('ChromeUserThemeGroup', () => {
    it('os dois desligados: não renderiza nada (nem o marcador)', () => {
        const { container } = renderGroup(
            <ChromeUserThemeGroup showThemeToggle={false} showUser={false} variant="vertical" />,
        );
        expect(container.querySelector('[data-sarak-widget="user-theme"]')).toBeNull();
    });

    it('showThemeToggle: monta o ShellThemeToggle dentro do marcador', () => {
        const { container } = renderGroup(
            <ChromeUserThemeGroup showThemeToggle showUser={false} variant="vertical" />,
        );
        const group = container.querySelector('[data-sarak-widget="user-theme"]') as HTMLElement;
        expect(group).not.toBeNull();
        expect(screen.queryByTitle('Sair')).toBeNull();
        expect(group.querySelector('button')).not.toBeNull();
    });

    it('showUser: monta o ShellUserWidget com a identidade recebida', () => {
        const logout = vi.fn();
        renderGroup(
            <ChromeUserThemeGroup
                showThemeToggle={false}
                showUser
                user={{ name: 'Visitante' }}
                logout={logout}
                variant="vertical"
            />,
        );
        expect(screen.getByText('Visitante')).toBeInTheDocument();
        expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('os dois ligados: ambos montam juntos', () => {
        renderGroup(
            <ChromeUserThemeGroup showThemeToggle showUser user={{ name: 'Ana' }} logout={vi.fn()} variant="horizontal" />,
        );
        expect(screen.getByTitle(/Mudar para modo/)).toBeInTheDocument();
        expect(screen.getAllByRole('button')).toHaveLength(2);
    });

    it('showUser sem `logout`: apresenta o estado indisponível e fica desabilitado', () => {
        renderGroup(
            <ChromeUserThemeGroup showThemeToggle={false} showUser user={{ name: 'Visitante' }} variant="vertical" />,
        );
        const unavailableWidget = screen.getByRole('button', { name: 'Usuário indisponível' });
        expect(unavailableWidget).toHaveAttribute('aria-disabled', 'true');
        expect(screen.queryByText('visitante')).toBeNull();
        expect(screen.queryByTitle('Sair')).toBeNull();
    });

    it('showUser sem identidade: aparece desabilitado', () => {
        renderGroup(
            <ChromeUserThemeGroup showThemeToggle={false} showUser logout={vi.fn()} variant="vertical" />,
        );
        expect(screen.getByRole('button', { name: 'Usuário indisponível' })).toHaveAttribute('aria-disabled', 'true');
    });
});
