import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { ShellUserWidget } from '../ShellUserWidget';
import { SarakUIProvider } from '../../../Provider/SarakUIProvider';

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
});
