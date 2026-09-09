import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { ShellThemeToggle } from '../ShellThemeToggle';

const applyFullConfigRawMock = vi.fn();
vi.mock('../../../../core/Provider/SarakUIProvider', () => {
    const useSarakUI = vi.fn(() => ({ design: { mode: 'dark' }, applyFullConfigRaw: applyFullConfigRawMock }));
    return { useSarakUI, useSarakUIOptional: useSarakUI };
});

describe('ShellThemeToggle', () => {
    it('renderiza na variante mini e chama toggle com o tema COMPLETO sincronizado para o novo modo (Decisão D)', () => {
        render(<ShellThemeToggle variant="mini" />);
        const btn = screen.getByRole('button');
        fireEvent.click(btn);

        expect(applyFullConfigRawMock).toHaveBeenCalledTimes(1);
        const applied = applyFullConfigRawMock.mock.calls[0][0];
        // `syncThemeWithMode` roda UMA vez, no toggle — o resultado já vem completo
        // (mode + todas as cores derivadas), não um patch parcial `{ mode: 'light' }`.
        expect(applied.mode).toBe('light');
        expect(Object.keys(applied).length).toBeGreaterThan(50);
    });

    it('renderiza na variante vertical e exibe texto', () => {
        render(<ShellThemeToggle variant="vertical" />);
        expect(screen.getByText('Light Mode')).toBeInTheDocument();
    });
});
