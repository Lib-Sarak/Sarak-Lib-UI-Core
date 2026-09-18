import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ShellNavigationStyleControl } from '../ShellNavigationStyleControl';

const updatePreferencesMock = vi.fn();
let mockDesign: Record<string, unknown> = { navigationStyle: 'sidebar' };
vi.mock('../../../../core/Provider/SarakUIProvider', () => {
    const useSarakUIOptional = vi.fn(() => ({
        design: mockDesign,
        preferences: {},
        updatePreferences: updatePreferencesMock,
    }));
    return { useSarakUIOptional };
});

describe('ShellNavigationStyleControl', () => {
    beforeEach(() => {
        mockDesign = { navigationStyle: 'sidebar' };
    });

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

// os textos da própria lib seguem o idioma que vale.
describe('ShellNavigationStyleControl — idioma que vale', () => {
    it('sai em inglês quando `design.language` é "en"', () => {
        mockDesign = { navigationStyle: 'sidebar', language: 'en' };
        render(<ShellNavigationStyleControl />);
        expect(screen.getByRole('button', { name: 'Sidebar' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Top' })).toBeInTheDocument();
    });
});
