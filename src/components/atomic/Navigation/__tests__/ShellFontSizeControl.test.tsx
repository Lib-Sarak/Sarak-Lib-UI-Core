import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { ShellFontSizeControl } from '../ShellFontSizeControl';

const updatePreferencesMock = vi.fn();
vi.mock('../../../../core/Provider/SarakUIProvider', () => {
    const useSarakUIOptional = vi.fn(() => ({ preferences: { fontSize: 'md' }, updatePreferences: updatePreferencesMock }));
    return { useSarakUIOptional };
});

describe('ShellFontSizeControl', () => {
    it('marca o degrau atual como pressionado (aria-pressed)', () => {
        render(<ShellFontSizeControl />);
        expect(screen.getByRole('button', { name: 'M' })).toHaveAttribute('aria-pressed', 'true');
        expect(screen.getByRole('button', { name: 'P' })).toHaveAttribute('aria-pressed', 'false');
    });

    it('clicar em outro degrau grava a PREFERÊNCIA de fontSize, nunca o tema', () => {
        render(<ShellFontSizeControl />);
        fireEvent.click(screen.getByRole('button', { name: 'G' }));
        expect(updatePreferencesMock).toHaveBeenCalledWith({ fontSize: 'lg' });
    });
});
