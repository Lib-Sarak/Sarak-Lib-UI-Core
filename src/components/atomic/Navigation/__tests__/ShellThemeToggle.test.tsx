import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { ShellThemeToggle } from '../ShellThemeToggle';

const updatePreferencesMock = vi.fn();
vi.mock('../../../../core/Provider/SarakUIProvider', () => {
    const useSarakUI = vi.fn(() => ({ design: { mode: 'dark' }, updatePreferences: updatePreferencesMock }));
    return { useSarakUI, useSarakUIOptional: useSarakUI };
});

describe('ShellThemeToggle', () => {
    it('renderiza na variante mini e grava a PREFERÊNCIA de modo, nunca o tema', () => {
        render(<ShellThemeToggle variant="mini" />);
        const btn = screen.getByRole('button');
        fireEvent.click(btn);

        expect(updatePreferencesMock).toHaveBeenCalledTimes(1);
        expect(updatePreferencesMock).toHaveBeenCalledWith({ colorMode: 'light' });
    });

    it('renderiza na variante vertical e exibe texto', () => {
        render(<ShellThemeToggle variant="vertical" />);
        expect(screen.getByText('Light Mode')).toBeInTheDocument();
    });
});
