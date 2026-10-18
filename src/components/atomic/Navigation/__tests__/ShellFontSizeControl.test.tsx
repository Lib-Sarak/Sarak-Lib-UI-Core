import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ShellFontSizeControl } from '../ShellFontSizeControl';

const updatePreferencesMock = vi.fn();
let mockDesign: Record<string, unknown> = {};
vi.mock('../../../../core/Provider/SarakUIProvider', () => {
    const useSarakUIOptional = vi.fn(() => ({ design: mockDesign, preferences: { fontSize: 'md' }, updatePreferences: updatePreferencesMock }));
    return { useSarakUIOptional };
});

describe('ShellFontSizeControl', () => {
    beforeEach(() => {
        mockDesign = {};
    });

    it('marca o degrau atual como pressionado (aria-pressed)', () => {
        render(<ShellFontSizeControl />);
        expect(screen.getByRole('button', { name: 'M' })).toHaveAttribute('aria-pressed', 'true');
        expect(screen.getByRole('button', { name: 'P' })).toHaveAttribute('aria-pressed', 'false');
    });


    it('o botão selecionado lê o texto de --sarak-on-nav-active (o contraste contra o fundo que ele mesmo usa), não o da primária', () => {
        render(<ShellFontSizeControl />);
        const selected = screen.getAllByRole('button').find((button) => button.getAttribute('aria-pressed') === 'true') as HTMLElement;
        expect(selected.className).toContain('bg-[var(--sarak-nav-active-color,#19e3f0)]');
        expect(selected.className).toContain('text-[var(--sarak-on-nav-active,');
        expect(selected.className).not.toMatch(/text-[var(--color-theme-on-primary,#020617)]/);
    });

    it('clicar em outro degrau grava a PREFERÊNCIA de fontSize, nunca o tema', () => {
        render(<ShellFontSizeControl />);
        fireEvent.click(screen.getByRole('button', { name: 'G' }));
        expect(updatePreferencesMock).toHaveBeenCalledWith({ fontSize: 'lg' });
    });
});

// os textos da própria lib seguem o idioma que vale.
describe('ShellFontSizeControl — idioma que vale', () => {
    it('sai em inglês quando `design.language` é "en"', () => {
        mockDesign = { language: 'en' };
        render(<ShellFontSizeControl />);
        expect(screen.getByRole('button', { name: 'S' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'L' })).toBeInTheDocument();
    });
});
