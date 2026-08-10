import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SarakUIProvider } from '../../../../core/Provider/SarakUIProvider';
import { LanguageSelector, ThemeToggle, UserMenu, ModuleSelector } from '../Controls';

const renderWithProvider = (ui: React.ReactElement) => render(<SarakUIProvider>{ui}</SarakUIProvider>);

describe('Controls (conserto R10 — plan-22)', () => {
    it('LanguageSelector: lista os idiomas habilitados como botões clicáveis', () => {
        renderWithProvider(<LanguageSelector />);
        expect(screen.getByRole('button', { name: 'PT' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'EN' })).toBeInTheDocument();
    });

    it('ThemeToggle: o botão preserva o atributo de telemetria e responde a clique', () => {
        renderWithProvider(<ThemeToggle />);
        // Sem aria-label — localiza pelo atributo de telemetria que o conserto precisa preservar.
        const button = document.querySelector('[data-action-id="ui:theme_toggle_btn"]');
        expect(button).not.toBeNull();
        expect(() => fireEvent.click(button as Element)).not.toThrow();
    });

    it('UserMenu: abre o dropdown e aciona Change Password / Log Out', () => {
        const onPasswordModal = vi.fn();
        const onLogout = vi.fn();
        renderWithProvider(
            <UserMenu user={{ email: 'ana@example.com' }} onPasswordModal={onPasswordModal} onLogout={onLogout} />,
        );
        fireEvent.click(screen.getByText('ana'));
        fireEvent.click(screen.getByText('Change Password'));
        expect(onPasswordModal).toHaveBeenCalled();

        fireEvent.click(screen.getByText('ana'));
        fireEvent.click(screen.getByText('Log Out'));
        expect(onLogout).toHaveBeenCalled();
    });

    it('ModuleSelector: reporta o módulo clicado', () => {
        const setCurrentModule = vi.fn();
        renderWithProvider(
            <ModuleSelector
                currentModule="a"
                setCurrentModule={setCurrentModule}
                modules={[{ id: 'a', label: 'Módulo A' }, { id: 'b', label: 'Módulo B' }]}
            />,
        );
        fireEvent.click(screen.getByText('Módulo B'));
        expect(setCurrentModule).toHaveBeenCalledWith('b');
    });
});
