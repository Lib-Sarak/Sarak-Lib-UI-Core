import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { SidebarNav } from '../SidebarNav';
import { SarakUIProvider } from '../../../Provider/SarakUIProvider';

const renderWithProvider = (ui: React.ReactElement) => render(<SarakUIProvider>{ui}</SarakUIProvider>);

vi.mock('framer-motion', async () => {
    const actual = await vi.importActual('framer-motion');
    return { ...actual as any, motion: { div: ({ children, ...props }: any) => <div {...props}>{children}</div> } };
});

vi.mock('../ShellSearchWidget', () => ({ ShellSearchWidget: () => <div data-testid="mock-search">Search</div> }));
vi.mock('../ShellThemeToggle', () => ({ ShellThemeToggle: () => <div data-testid="mock-theme">Theme</div> }));
vi.mock('../ShellLanguageSelector', () => ({ ShellLanguageSelector: () => <div data-testid="mock-lang">Lang</div> }));
vi.mock('../ShellUserWidget', () => ({ ShellUserWidget: () => <div data-testid="mock-user">User</div> }));
vi.mock('../IconRenderer', () => ({ IconRenderer: ({ name }: any) => <span>{name}</span> }));
vi.mock('../../../../components/atomic/Icon/SarakIcon', () => ({ SarakIcon: ({ name }: any) => <span>{name}</span> }));

describe('SidebarNav', () => {
    const defaultProps = {
        design: { systemName: 'Test System', searchPositionSidebar: 'top' },
        brand: { name: 'Test Brand' },
        user: {},
        toggleNav: vi.fn(),
        setIsSearchOpen: vi.fn(),
        activeModuleId: 'm1',
        setActiveModuleId: vi.fn(),
        groupedModules: {
            'Core': [{ id: 'm1', label: 'Module 1', icon: 'Home', status: 'online' }] as any
        },
        setIsNavVisible: vi.fn(),
        startResizing: vi.fn()
    };

    it('renderiza o sistema e módulos', () => {
        renderWithProvider(<SidebarNav {...defaultProps} />);
        expect(screen.getByText('Test System')).toBeInTheDocument();
        expect(screen.getByText('Module 1')).toBeInTheDocument();
        expect(screen.getByTestId('mock-search')).toBeInTheDocument();
        expect(screen.getByTestId('mock-theme')).toBeInTheDocument();
    });

    it('chama setActiveModuleId ao clicar em um módulo online', () => {
        renderWithProvider(<SidebarNav {...defaultProps} />);
        const btn = screen.getByRole('button', { name: /Module 1/i });
        fireEvent.click(btn);
        expect(defaultProps.setActiveModuleId).toHaveBeenCalledWith('m1');
    });
});
