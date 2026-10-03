import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SarakUIProvider } from '../../Provider/SarakUIProvider';
import { SarakShellLanguageSelector } from '../../../components/atomic/Navigation/SarakShellLanguageSelector';
import { SarakShellThemeToggle } from '../../../components/atomic/Navigation/SarakShellThemeToggle';

/**
 * A troca de idioma em runtime repinta os textos sem recarregar a página.
 * Prova ponta a ponta: escolher um idioma no `ShellLanguageSelector` muda o
 * texto de OUTRO widget (`ShellThemeToggle`) no mesmo render, e nenhum
 * `window.location.reload` é chamado — a diferença central com o seletor
 * duplicado removido (`Controls.tsx`), que recarregava a página a cada troca.
 */
describe('Trocar o idioma pela preferência repinta o cromo sem recarga', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('escolher inglês no seletor muda o texto de outro widget, sem reload', () => {
        const reloadSpy = vi.fn();
        Object.defineProperty(window, 'location', {
            value: { ...window.location, reload: reloadSpy },
            writable: true,
        });

        render(
            <SarakUIProvider config={{ enabledLanguages: ['pt', 'en'], preferenceLanguagePosition: 'menu' }}>
                <SarakShellLanguageSelector variant="horizontal" />
                <SarakShellThemeToggle variant="vertical" />
            </SarakUIProvider>,
        );

        expect(screen.getByText('Modo Claro')).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: /pt/i }));
        fireEvent.click(screen.getByText('English'));

        expect(screen.queryByText('Modo Claro')).not.toBeInTheDocument();
        expect(screen.getByText('Light Mode')).toBeInTheDocument();
        expect(reloadSpy).not.toHaveBeenCalled();
    });
});
