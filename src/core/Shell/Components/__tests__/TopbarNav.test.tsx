import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TopbarNav } from '../TopbarNav';
import '@testing-library/jest-dom';
import { SarakUIProvider } from '../../../Provider/SarakUIProvider';
import { BREAKPOINT_DESKTOP } from '../../../Design/breakpoints';

const renderWithProvider = (ui: React.ReactElement) => render(<SarakUIProvider>{ui}</SarakUIProvider>);

vi.mock('../../../../components/atomic/Icon/SarakIcon', () => ({
    SarakIcon: () => <div data-testid="sarak-icon" />
}));

vi.mock('../IconRenderer', () => ({
    IconRenderer: () => <div data-testid="icon-renderer" />
}));

vi.mock('../ShellSearchWidget', () => ({
    ShellSearchWidget: ({ onClick }: any) => <button data-testid="shell-search" onClick={onClick}>Search</button>
}));

vi.mock('../ShellThemeToggle', () => ({
    ShellThemeToggle: () => <div data-testid="shell-theme">Theme</div>
}));

vi.mock('../ShellLanguageSelector', () => ({
    ShellLanguageSelector: () => <div data-testid="shell-lang">Lang</div>
}));

vi.mock('../ShellUserWidget', () => ({
    ShellUserWidget: () => <div data-testid="shell-user" />
}));

describe('TopbarNav', () => {
    const mockProps = {
        design: { searchPositionTopbar: 'left', navigationStyle: 'topbar', mode: 'light', systemName: 'Sarak Test' },
        brand: { name: 'Brand Name' },
        toggleNav: vi.fn(),
        setIsSearchOpen: vi.fn(),
        activeModuleId: 'module1',
        setActiveModuleId: vi.fn(),
        discoveredModules: [
            { id: 'module1', label: 'Mod 1', status: 'online' as const, icon: 'Box', category: 'system', priority: 1 },
            { id: 'module2', label: 'Mod 2', status: 'online' as const, icon: 'Activity', category: 'system', priority: 2 },
            { id: 'module3', label: 'Mod 3', status: 'offline' as const, icon: 'Off', category: 'system', priority: 3 }
        ],
        startResizing: vi.fn()
    };

    it('renderiza o logo e o systemName', () => {
        renderWithProvider(<TopbarNav {...mockProps} />);
        expect(screen.getByText('Sarak Test')).toBeInTheDocument();
    });

    it('renderiza os módulos online na navegação principal e muda o ativo', () => {
        renderWithProvider(<TopbarNav {...mockProps} />);
        
        // Modules online: module1, module2. module3 is offline.
        expect(screen.getByText('Mod 1')).toBeInTheDocument();
        expect(screen.getByText('Mod 2')).toBeInTheDocument();
        expect(screen.queryByText('Mod 3')).not.toBeInTheDocument();

        fireEvent.click(screen.getByText('Mod 2'));
        expect(mockProps.setActiveModuleId).toHaveBeenCalledWith('module2');
    });

    it('aciona o botão de menu lateral', () => {
        const { container } = renderWithProvider(<TopbarNav {...mockProps} />);
        // Menu button is the first button usually, let's find it by icon or role
        const menuBtn = container.querySelector('button');
        fireEvent.click(menuBtn!);
        expect(mockProps.toggleNav).toHaveBeenCalled();
    });

    it('aciona o search widget', () => {
        renderWithProvider(<TopbarNav {...mockProps} />);
        const searchWidget = screen.getByTestId('shell-search');
        fireEvent.click(searchWidget);
        expect(mockProps.setIsSearchOpen).toHaveBeenCalledWith(true);
    });

    it('renderiza sem search widget se searchPos for hidden', () => {
        renderWithProvider(<TopbarNav {...mockProps} design={{ ...mockProps.design, searchPositionTopbar: 'hidden' }} />);
        expect(screen.queryByTestId('shell-search')).not.toBeInTheDocument();
    });

    it('a nav de módulos usa a classe de container query LITERAL — @min-[1024px]:flex, o MESMO número de BREAKPOINT_DESKTOP (plan-39)', () => {
        const { container } = renderWithProvider(<TopbarNav {...mockProps} />);
        const nav = container.querySelector('nav');
        expect(nav).not.toBeNull();
        expect(nav?.className).toContain(`@min-[${BREAKPOINT_DESKTOP}px]:flex`);
    });
});
