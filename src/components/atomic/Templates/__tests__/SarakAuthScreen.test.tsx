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

    it('can render configured providers without credential fields', () => {
        renderWithProvider(
            <SarakAuthScreen
                showCredentials={false}
                allowRegistration
                socialConfig={{ enabled: true, display: 'full', providers: [{ id: 'company-sso', icon: <svg />, variant: 'glass' }] }}
            />,
        );

        expect(screen.getByRole('button', { name: 'Continuar com company-sso' })).toBeInTheDocument();
        expect(screen.queryByText('Informe suas credenciais para continuar.')).not.toBeInTheDocument();
        expect(screen.queryByPlaceholderText('nome@exemplo.com')).not.toBeInTheDocument();
        expect(screen.queryByPlaceholderText('••••••••')).not.toBeInTheDocument();
        expect(screen.queryByText('Ou continue com')).not.toBeInTheDocument();
        expect(screen.queryByText('Criar conta')).not.toBeInTheDocument();
    });

    it('shows forgot-password action only when the host provides a handler', () => {
        const onForgot = vi.fn();
        const onChange = vi.fn<(event: SarakAuthScreenEvent) => void>();
        renderWithProvider(<SarakAuthScreen onForgot={onForgot} onChange={onChange} />);

        fireEvent.click(screen.getByRole('button', { name: 'Esqueceu a senha?' }));
        expect(onForgot).toHaveBeenCalledOnce();
        expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ intent: 'forgot' }));
    });

    it('links each label to its field, so the screen reader announces the field name', () => {
        renderWithProvider(<SarakAuthScreen />);

        const email = screen.getByLabelText('E-mail');
        const password = screen.getByLabelText('Senha');
        expect(email.tagName).toBe('INPUT');
        expect(password.tagName).toBe('INPUT');
        expect(email).not.toBe(password);

        // O jsdom não move o foco no clique do rótulo; `control` é o vínculo que o navegador usa para isso.
        expect((screen.getByText('Senha') as HTMLLabelElement).control).toBe(password);
        expect((screen.getByText('E-mail') as HTMLLabelElement).control).toBe(email);
    });

    it('links the MFA label to the code field', () => {
        renderWithProvider(<SarakAuthScreen allowMfa mfaStep />);

        const code = screen.getByLabelText('Código de verificação');
        expect(code).toBe(screen.getByPlaceholderText('000000'));
    });

    it('names the password toggle by the next action, without aria-pressed', () => {
        renderWithProvider(<SarakAuthScreen />);

        const show = screen.getByRole('button', { name: 'Mostrar senha' });
        expect(show).not.toHaveAttribute('aria-pressed');
        expect(screen.getByLabelText('Senha')).toHaveAttribute('type', 'password');

        fireEvent.click(show);
        const hide = screen.getByRole('button', { name: 'Ocultar senha' });
        expect(hide).not.toHaveAttribute('aria-pressed');
        expect(screen.getByLabelText('Senha')).toHaveAttribute('type', 'text');
    });

    it('lets the host override the password toggle names through labels', () => {
        renderWithProvider(<SarakAuthScreen labels={{ authShowPassword: 'Reveal', authHidePassword: 'Conceal' }} />);

        fireEvent.click(screen.getByRole('button', { name: 'Reveal' }));
        expect(screen.getByRole('button', { name: 'Conceal' })).toBeInTheDocument();
    });

    it('announces a credential error as an alert and a warning as a status', () => {
        const { rerender } = renderWithProvider(<SarakAuthScreen error="credenciais inválidas" />);
        expect(screen.getByRole('alert')).toHaveTextContent('credenciais inválidas');

        rerender(
            <SarakUIProvider>
                <SarakAuthScreen error="conta quase bloqueada" errorVariant="warning" />
            </SarakUIProvider>,
        );
        expect(screen.getByRole('status')).toHaveTextContent('conta quase bloqueada');
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('does not show forgot-password action when the host only provides onChange', () => {
        const onChange = vi.fn<(event: SarakAuthScreenEvent) => void>();
        renderWithProvider(<SarakAuthScreen onChange={onChange} />);

        expect(screen.queryByRole('button', { name: 'Esqueceu a senha?' })).not.toBeInTheDocument();
    });
});
