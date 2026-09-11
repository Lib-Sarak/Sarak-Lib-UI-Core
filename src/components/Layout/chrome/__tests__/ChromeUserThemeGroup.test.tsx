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
        expect(screen.queryByTitle('Logout')).toBeNull();
        expect(group.querySelector('button')).not.toBeNull();
    });

    it('showUser: monta o ShellUserWidget com a identidade recebida', () => {
        const logout = vi.fn();
        renderGroup(
            <ChromeUserThemeGroup
                showThemeToggle={false}
                showUser
                user={{ username: 'visitante' }}
                logout={logout}
                variant="vertical"
            />,
        );
        expect(screen.getByText('visitante')).toBeInTheDocument();
        expect(screen.getByTitle('Logout')).toBeInTheDocument();
    });

    it('os dois ligados: ambos montam juntos', () => {
        renderGroup(
            <ChromeUserThemeGroup showThemeToggle showUser user={{ username: 'ana' }} logout={vi.fn()} variant="horizontal" />,
        );
        expect(screen.getByTitle(/Mudar para modo/)).toBeInTheDocument();
        expect(screen.getByTitle('Logout')).toBeInTheDocument();
    });

    it('showUser sem `logout`: o widget aparece, mas sem o botão de sair', () => {
        renderGroup(
            <ChromeUserThemeGroup showThemeToggle={false} showUser user={{ username: 'visitante' }} variant="vertical" />,
        );
        expect(screen.getByText('visitante')).toBeInTheDocument();
        expect(screen.queryByTitle('Logout')).toBeNull();
    });
});
