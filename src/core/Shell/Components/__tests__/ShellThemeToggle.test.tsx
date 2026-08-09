import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { ShellThemeToggle } from '../ShellThemeToggle';

const applyConfigRawMock = vi.fn();
vi.mock('../../../../core/Provider/SarakUIProvider', () => {
    const useSarakUI = vi.fn(() => ({ design: { mode: 'dark' }, applyConfigRaw: applyConfigRawMock }));
    return { useSarakUI, useSarakUIOptional: useSarakUI };
});

describe('ShellThemeToggle', () => {
    it('renderiza na variante mini e chama toggle', () => {
        render(<ShellThemeToggle variant="mini" />);
        const btn = screen.getByRole('button');
        fireEvent.click(btn);
        expect(applyConfigRawMock).toHaveBeenCalledWith({ mode: 'light' });
    });

    it('renderiza na variante vertical e exibe texto', () => {
        render(<ShellThemeToggle variant="vertical" />);
        expect(screen.getByText('Light Mode')).toBeInTheDocument();
    });
});
