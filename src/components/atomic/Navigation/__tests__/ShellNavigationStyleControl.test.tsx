import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { ShellNavigationStyleControl } from '../ShellNavigationStyleControl';

const updatePreferencesMock = vi.fn();
vi.mock('../../../../core/Provider/SarakUIProvider', () => {
    const useSarakUIOptional = vi.fn(() => ({
        design: { navigationStyle: 'sidebar' },
        preferences: {},
        updatePreferences: updatePreferencesMock,
    }));
    return { useSarakUIOptional };
});

describe('ShellNavigationStyleControl', () => {
    it('sem preferência salva, mostra o que o TEMA já decidiu como atual', () => {
        render(<ShellNavigationStyleControl />);
        expect(screen.getByRole('button', { name: 'Lateral' })).toHaveAttribute('aria-pressed', 'true');
        expect(screen.getByRole('button', { name: 'Topo' })).toHaveAttribute('aria-pressed', 'false');
    });

    it('clicar grava a PREFERÊNCIA de navigationStyle, nunca o tema', () => {
        render(<ShellNavigationStyleControl />);
        fireEvent.click(screen.getByRole('button', { name: 'Topo' }));
        expect(updatePreferencesMock).toHaveBeenCalledWith({ navigationStyle: 'topbar' });
    });
});
