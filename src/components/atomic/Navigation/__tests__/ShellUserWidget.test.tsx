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

        const logoutBtn = screen.getByTitle('Logout');
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
        expect(screen.queryByTitle('Logout')).toBeNull();
    });

    it('sem `logout`, o botão de sair não aparece (horizontal)', () => {
        renderWithProvider(<ShellUserWidget user={user} variant="horizontal" />);
        expect(screen.getByText('testuser')).toBeInTheDocument();
        expect(screen.queryByTitle('Logout')).toBeNull();
    });

    it('sem `logout`, o botão de sair não aparece (mini)', () => {
        renderWithProvider(<ShellUserWidget user={user} variant="mini" />);
        expect(screen.queryByTitle('Logout')).toBeNull();
    });
});
