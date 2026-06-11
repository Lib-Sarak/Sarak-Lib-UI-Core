import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { DockNav } from '../DockNav';

vi.mock('framer-motion', async () => {
    const actual = await vi.importActual('framer-motion');
    return { ...actual as any, AnimatePresence: ({ children }: any) => <>{children}</>, motion: { div: ({ children, ...props }: any) => <div {...props}>{children}</div>, button: ({ children, ...props }: any) => <button {...props}>{children}</button> } };
});

vi.mock('../IconRenderer', () => ({ IconRenderer: ({ name }: any) => <span>{name}</span> }));

describe('DockNav', () => {
    const defaultProps = {
        design: { isAutoHideEnabled: false },
        discoveredModules: [
            { id: 'm1', label: 'Module 1', icon: 'Home', status: 'online' } as any,
            { id: 'm2', label: 'Module 2', icon: 'Settings', status: 'offline' } as any
        ],
        activeModuleId: 'm1',
        setActiveModuleId: vi.fn(),
        setIsSearchOpen: vi.fn(),
        isNavVisible: true,
        setIsNavVisible: vi.fn()
    };

    it('renderiza os ícones dos módulos online no dock', () => {
        render(<DockNav {...defaultProps} />);
        expect(screen.getByText('Home')).toBeInTheDocument();
        expect(screen.queryByText('Settings')).not.toBeInTheDocument(); // Offline modules are filtered out in DockNav
    });

    it('chama setActiveModuleId ao clicar em um ícone de módulo', () => {
        render(<DockNav {...defaultProps} />);
        const btn = screen.getByRole('button', { name: /Home/i });
        fireEvent.click(btn);
        expect(defaultProps.setActiveModuleId).toHaveBeenCalledWith('m1');
    });
});
