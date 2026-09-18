import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { ShellUserWidget } from '../ShellUserWidget';
import { SarakUIProvider } from '../../../../core/Provider/SarakUIProvider';

const renderWithProvider = (ui: React.ReactElement) => render(<SarakUIProvider>{ui}</SarakUIProvider>);

vi.mock('../../../../components/atomic/Icon/SarakIcon', () => ({
    SarakIcon: ({ name }: any) => <span>{name}</span>
}));

describe('ShellUserWidget', () => {
    const user = { username: 'testuser', level: 100 };
    const logoutMock = vi.fn();

    it('renderiza na variante vertical', () => {
        renderWithProvider(<ShellUserWidget user={user} logout={logoutMock} variant="vertical" />);
        expect(screen.getByText('testuser')).toBeInTheDocument();
        expect(screen.getByText('Master')).toBeInTheDocument();

        const logoutBtn = screen.getByTitle('Sair');
        fireEvent.click(logoutBtn);
        expect(logoutMock).toHaveBeenCalled();
    });

    it('renderiza na variante horizontal', () => {
        renderWithProvider(<ShellUserWidget user={user} logout={logoutMock} variant="horizontal" />);
        expect(screen.getByText('testuser')).toBeInTheDocument();
    });

    // Sem `logout`, o botão de sair não aparece — evita montar um controle sem handler.
    it('sem `logout`, o botão de sair não aparece (vertical)', () => {
        renderWithProvider(<ShellUserWidget user={user} variant="vertical" />);
        expect(screen.getByText('testuser')).toBeInTheDocument();
        expect(screen.queryByTitle('Sair')).toBeNull();
    });

    it('sem `logout`, o botão de sair não aparece (horizontal)', () => {
        renderWithProvider(<ShellUserWidget user={user} variant="horizontal" />);
        expect(screen.getByText('testuser')).toBeInTheDocument();
        expect(screen.queryByTitle('Sair')).toBeNull();
    });

    it('sem `logout`, o botão de sair não aparece (mini)', () => {
        renderWithProvider(<ShellUserWidget user={user} variant="mini" />);
        expect(screen.queryByTitle('Sair')).toBeNull();
    });

    // Sem `username`/`email`, o rótulo padrão do usuário — aparece duas vezes
    // (o nome e o papel, ambos caem no genérico para nível < 50).
    it('sem `username`/`email`, mostra o rótulo genérico de usuário', () => {
        renderWithProvider(<ShellUserWidget user={{ level: 10 }} variant="vertical" />);
        expect(screen.getAllByText('Usuário')).toHaveLength(2);
    });
});

// os textos da própria lib seguem o idioma que vale.
describe('ShellUserWidget — idioma que vale', () => {
    const user = { level: 60 };

    it('sai em inglês com `config.language: "en"`', () => {
        render(
            <SarakUIProvider config={{ language: 'en' }}>
                <ShellUserWidget user={user} logout={vi.fn()} variant="vertical" />
            </SarakUIProvider>,
        );
        expect(screen.getByText('Admin')).toBeInTheDocument();
        expect(screen.getByTitle('Logout')).toBeInTheDocument();
    });

    it('sem Provider, sai em português (R34)', () => {
        render(<ShellUserWidget user={user} logout={vi.fn()} variant="vertical" />);
        expect(screen.getByText('Administrador')).toBeInTheDocument();
        expect(screen.getByTitle('Sair')).toBeInTheDocument();
    });
});
