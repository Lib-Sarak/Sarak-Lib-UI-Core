import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ShellThemeToggle } from '../ShellThemeToggle';

const updatePreferencesMock = vi.fn();
// Mutável: o mock devolve o `design` corrente, para os testes de idioma
// poderem mudar `language` sem reconfigurar o módulo inteiro.
let mockDesign: Record<string, unknown> = { mode: 'dark' };
vi.mock('../../../../core/Provider/SarakUIProvider', () => {
    const useSarakUI = vi.fn(() => ({ design: mockDesign, updatePreferences: updatePreferencesMock }));
    return { useSarakUI, useSarakUIOptional: useSarakUI };
});

describe('ShellThemeToggle', () => {
    beforeEach(() => {
        mockDesign = { mode: 'dark' };
    });

    it('renderiza na variante mini e grava a PREFERÊNCIA de modo, nunca o tema', () => {
        render(<ShellThemeToggle variant="mini" />);
        const btn = screen.getByRole('button');
        fireEvent.click(btn);

        expect(updatePreferencesMock).toHaveBeenCalledTimes(1);
        expect(updatePreferencesMock).toHaveBeenCalledWith({ colorMode: 'light' });
    });

    it('renderiza na variante vertical e exibe texto', () => {
        render(<ShellThemeToggle variant="vertical" />);
        expect(screen.getByText('Modo Claro')).toBeInTheDocument();
    });
});

// os textos da própria lib seguem o idioma que vale.
describe('ShellThemeToggle — idioma que vale', () => {
    beforeEach(() => {
        mockDesign = { mode: 'dark' };
    });

    it('sai em inglês quando `design.language` é "en"', () => {
        mockDesign = { mode: 'dark', language: 'en' };
        render(<ShellThemeToggle variant="vertical" />);
        expect(screen.getByText('Light Mode')).toBeInTheDocument();
    });
});
