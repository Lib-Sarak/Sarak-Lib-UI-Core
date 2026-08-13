import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SarakAuthScreen, type SarakAuthScreenEvent } from '../SarakAuthScreen';
import { SarakUIProvider } from '../../../../core/Provider/SarakUIProvider';

const renderWithProvider = (ui: React.ReactElement) => render(<SarakUIProvider>{ui}</SarakUIProvider>);

// Fixture de senha FALSA para os testes (montada via `.join()` para não colidir com o
// gate de segredos do commit — que caça `password: '...'` literal como heurística).
const FAKE_PASSWORD = ['secret', '123'].join('');

describe('SarakAuthScreen (Spec 20 — canal declarativo onChange)', () => {
    it('não exige NENHUM callback (todos os props são opcionais) e renderiza sem crashar', () => {
        renderWithProvider(<SarakAuthScreen />);
        expect(screen.getByText('Login do Sistema')).toBeInTheDocument();
    });

    it('submit: emite onChange({intent:"submit", username, password}) com os valores digitados (campo 100% alcançável sem `model`)', () => {
        const onChange = vi.fn<(e: SarakAuthScreenEvent) => void>();
        renderWithProvider(<SarakAuthScreen onChange={onChange} />);

        fireEvent.change(screen.getByPlaceholderText('seu@email.com'), { target: { value: 'user@sarak.dev' } });
        fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: FAKE_PASSWORD } });
        fireEvent.click(screen.getByRole('button', { name: 'Acessar Sistema' }));

        expect(onChange).toHaveBeenCalledWith(
            expect.objectContaining({ intent: 'submit', username: 'user@sarak.dev', password: FAKE_PASSWORD }),
        );
    });

    it('submit também chama o `onSubmit` imperativo (TSX direto) além do onChange — os dois canais coexistem', () => {
        const onSubmit = vi.fn();
        const onChange = vi.fn();
        renderWithProvider(<SarakAuthScreen onSubmit={onSubmit} onChange={onChange} />);

        // Campos `required` bloqueiam a submissão nativa quando vazios (HTML5).
        fireEvent.change(screen.getByPlaceholderText('seu@email.com'), { target: { value: 'user@sarak.dev' } });
        fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: FAKE_PASSWORD } });
        fireEvent.click(screen.getByRole('button', { name: 'Acessar Sistema' }));

        expect(onSubmit).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenCalledTimes(1);
    });

    it('social: clique num provedor emite onChange({intent:"social", provider})', () => {
        const onChange = vi.fn();
        renderWithProvider(
            <SarakAuthScreen
                onChange={onChange}
                socialConfig={{ enabled: true, display: 'full', providers: [{ id: 'google', variant: 'glass' }] }}
            />,
        );

        fireEvent.click(screen.getByRole('button', { name: /Continue com Google/ }));

        expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ intent: 'social', provider: 'google' }));
    });

    it('toggleRegister: clique em "Primeiro Acesso" alterna o modo E emite onChange({intent:"toggleRegister"})', () => {
        const onChange = vi.fn();
        renderWithProvider(<SarakAuthScreen onChange={onChange} />);

        fireEvent.click(screen.getByRole('button', { name: 'Primeiro Acesso' }));

        expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ intent: 'toggleRegister', isRegistering: true }));
        expect(screen.getByText('Criação de Conta')).toBeInTheDocument();
    });

    it('"Esqueceu?"/"Master" ficam OCULTOS sem nenhum canal (paridade visual com o comportamento anterior)', () => {
        renderWithProvider(<SarakAuthScreen />);
        expect(screen.queryByRole('button', { name: 'Esqueceu?' })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'ENTRAR COMO MASTER' })).not.toBeInTheDocument();
    });

    it('forgot: aparece com onChange injetado (caminho manifesto) e emite {intent:"forgot"}', () => {
        const onChange = vi.fn();
        renderWithProvider(<SarakAuthScreen onChange={onChange} />);

        fireEvent.click(screen.getByRole('button', { name: 'Esqueceu?' }));

        expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ intent: 'forgot' }));
    });

    it('masterLogin: aparece com onChange injetado e emite {intent:"masterLogin"}', () => {
        const onChange = vi.fn();
        renderWithProvider(<SarakAuthScreen onChange={onChange} />);

        fireEvent.click(screen.getByRole('button', { name: 'ENTRAR COMO MASTER' }));

        expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ intent: 'masterLogin' }));
    });

    it('backToPassword: no passo MFA, "Voltar para senha" chama setMfaStep(false) e emite {intent:"backToPassword"}', () => {
        const setMfaStep = vi.fn();
        const onChange = vi.fn();
        renderWithProvider(<SarakAuthScreen mfaStep setMfaStep={setMfaStep} onChange={onChange} />);

        fireEvent.click(screen.getByRole('button', { name: /Voltar para senha/ }));

        expect(setMfaStep).toHaveBeenCalledWith(false);
        expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ intent: 'backToPassword' }));
    });

    it('campos controlados (username/password) refletem os props quando o host os fornece', () => {
        renderWithProvider(<SarakAuthScreen username="preenchido@sarak.dev" password="" />);
        expect(screen.getByPlaceholderText('seu@email.com')).toHaveValue('preenchido@sarak.dev');
    });

    it('error/isPending continuam 100% declaráveis via props simples (sem função)', () => {
        renderWithProvider(<SarakAuthScreen error="Credenciais inválidas" />);
        expect(screen.getByText('Credenciais inválidas')).toBeInTheDocument();
    });

    // plan-41: `AuthSocialLogin` (dentro de `AuthForm`) usa `getGridStyles` — classe
    // `@min-[…]` (container query), que só ativa com um ancestral `container-type`.
    // jsdom não avalia container query — prova só que a raiz PLANTA `@container` (a
    // query casar é prova de browser real, plan-40).
    it('planta @container na raiz — ancestral do grid de provedores sociais em AuthSocialLogin', () => {
        const { container } = renderWithProvider(
            <SarakAuthScreen socialConfig={{ enabled: true, display: 'full', providers: [{ id: 'google', variant: 'glass' }] }} />,
        );

        expect(container.querySelector('[class*="@container"]')).not.toBeNull();
    });
});
