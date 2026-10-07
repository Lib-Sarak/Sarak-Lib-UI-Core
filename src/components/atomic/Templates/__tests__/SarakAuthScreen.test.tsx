import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SarakAuthScreen, type SarakAuthScreenEvent } from '../SarakAuthScreen';
import { SarakUIProvider } from '../../../../core/Provider/SarakUIProvider';

const renderWithProvider = (ui: React.ReactElement) => render(<SarakUIProvider>{ui}</SarakUIProvider>);
const FAKE_PASSWORD = ['secret', '123'].join('');

describe('SarakAuthScreen host configuration', () => {
    it('defaults to login and hides registration, MFA, and social login', () => {
        renderWithProvider(<SarakAuthScreen />);

        expect(screen.getByRole('heading', { name: 'Entrar' })).toBeInTheDocument();
        expect(screen.queryByText('Criar conta')).not.toBeInTheDocument();
        expect(screen.queryByPlaceholderText('000000')).not.toBeInTheDocument();
        expect(screen.queryByText('Ou continue com')).not.toBeInTheDocument();
    });

    it('submits the entered credentials through the declarative event', () => {
        const onChange = vi.fn<(event: SarakAuthScreenEvent) => void>();
        renderWithProvider(<SarakAuthScreen onChange={onChange} />);

        fireEvent.change(screen.getByPlaceholderText('nome@exemplo.com'), { target: { value: 'user@example.test' } });
        fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: FAKE_PASSWORD } });
        expect(screen.getByPlaceholderText('nome@exemplo.com')).toHaveAttribute('autocomplete', 'username');
        expect(screen.getByPlaceholderText('••••••••')).toHaveAttribute('autocomplete', 'current-password');
        fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));

        expect(onChange).toHaveBeenCalledWith(expect.objectContaining({
            intent: 'submit', username: 'user@example.test', password: FAKE_PASSWORD,
        }));
    });

    it('renders registration only when enabled and uses new-password autocomplete', () => {
        const onChange = vi.fn();
        renderWithProvider(<SarakAuthScreen allowRegistration onChange={onChange} />);

        fireEvent.click(screen.getByRole('button', { name: 'Criar conta' }));
        expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ intent: 'toggleRegister', isRegistering: true }));
        expect(screen.getByPlaceholderText('••••••••')).toHaveAttribute('autocomplete', 'new-password');
    });

    it('renders MFA only when enabled and labels its code for autofill', () => {
        renderWithProvider(<SarakAuthScreen allowMfa mfaStep />);

        expect(screen.getByPlaceholderText('000000')).toHaveAttribute('autocomplete', 'one-time-code');
        expect(screen.getByRole('button', { name: 'Confirmar' })).toBeInTheDocument();
    });

    it('accepts translated text overrides from the host', () => {
        renderWithProvider(<SarakAuthScreen labels={{ authTitleLogin: 'Access portal', authSubmitLogin: 'Continue' }} />);

        expect(screen.getByText('Access portal')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument();
    });

    it('keeps social login opt-in and emits the selected generic provider', () => {
        const onChange = vi.fn();
        const { rerender } = renderWithProvider(<SarakAuthScreen onChange={onChange} />);
        expect(screen.queryByText('Ou continue com')).not.toBeInTheDocument();

        rerender(
            <SarakUIProvider>
                <SarakAuthScreen
                    onChange={onChange}
                    socialConfig={{ enabled: true, display: 'full', providers: [{ id: 'company-sso', icon: <svg />, variant: 'glass' }] }}
                />
            </SarakUIProvider>,
        );
        fireEvent.click(screen.getByRole('button', { name: 'Continuar com company-sso' }));
        expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ intent: 'social', provider: 'company-sso' }));
    });

    it('shows forgot-password action only when the host provides a handler', () => {
        const onForgot = vi.fn();
        renderWithProvider(<SarakAuthScreen onForgot={onForgot} />);

        fireEvent.click(screen.getByRole('button', { name: 'Esqueceu a senha?' }));
        expect(onForgot).toHaveBeenCalledOnce();
    });
});
