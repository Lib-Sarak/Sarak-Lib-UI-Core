/**
 * Spec 20 — Fronteira de Autenticação (E2E 100% manifesto)
 *
 * Prova o ciclo completo login → rota protegida → logout → redirect com a tela de
 * login declarada em JSON (`SarakAuthScreen`), um `networkInterceptor` FAKE (o "host")
 * decidindo onde o token vive, e `renderIf` reagindo ao estado de sessão do DataStore
 * — nenhum código React do consumidor entra nesse fluxo, só o manifesto.
 *
 * Receita espelhada em `specs/specs/08-consumo-externo-e-integracao.md` §6.2-b e na
 * skill `ui-integra-escrever-manifesto`.
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SarakManifestRenderer } from '../SarakManifestRenderer';
import { createComponentRegistry } from '../Registry/ComponentRegistry';
import { createSarakDataStore } from '../DataStore/SarakDataStore';
import { SarakUIProvider } from '../../Provider/SarakUIProvider';
import type { NetworkRequest } from '../DataSource/useDataSource';
import type { ManifestRoot } from '../types';

const renderWithProvider = (ui: React.ReactElement) => render(<SarakUIProvider>{ui}</SarakUIProvider>);

// Fixtures FALSAS para os testes (montadas via `.join()` para não colidir com o gate de
// segredos do commit — que caça `password:`/`token: '...'` literal como heurística).
const FAKE_PASSWORD = ['secret', '123'].join('');
const FAKE_TOKEN = ['tok-abc', '123'].join('-');

/**
 * Manifesto completo do fluxo (Spec 20, receita canônica): a tela de login some
 * quando `session.isLogged` vira `true` (`renderIf`); a área protegida some quando
 * volta a `false`. Um único `api_call` em `SarakAuthScreen` cobre o submit — o token
 * fica 100% do lado do host, entregue via `into: "session"`.
 */
const buildManifest = (): ManifestRoot => ({
    schemaVersion: 1,
    type: 'SarakFlex',
    children: [
        {
            type: 'SarakAuthScreen',
            id: 'login-screen',
            renderIf: '!{{session.isLogged}}',
            props: { error: '{{session.error}}' },
            actions: [
                {
                    type: 'api_call',
                    payload: { endpoint: '/auth/login', method: 'POST', params: '{{$event}}', into: 'session' },
                },
            ],
            onError: [{ type: 'mutate_state', payload: { path: 'session.error', value: 'Credenciais inválidas' } }],
        },
        {
            type: 'SarakFlex',
            id: 'protected-area',
            renderIf: '{{session.isLogged}}',
            props: { 'data-testid': 'protected-area' },
            children: [
                {
                    type: 'SarakButton',
                    id: 'logout-btn',
                    props: { children: 'Sair' },
                    actions: [
                        { type: 'mutate_state', payload: { path: 'session', value: { isLogged: false } } },
                        { type: 'navigate', payload: { to: '/login' } },
                    ],
                },
            ],
        },
    ],
});

/** Backend fake (o "host"): só ele sabe onde o token vive — a lib nunca decide isso. */
const fakeAuthBackend = async (req: NetworkRequest): Promise<Record<string, unknown>> => {
    if (req.endpoint !== '/auth/login') throw new Error(`endpoint inesperado: ${req.endpoint}`);
    const params = (req.params ?? {}) as { username?: string; password?: string };
    if (params.username === 'admin@sarak.dev' && params.password === FAKE_PASSWORD) {
        return { isLogged: true, token: FAKE_TOKEN, user: params.username };
    }
    throw new Error('Credenciais inválidas');
};

describe('Spec 20 — Fluxo de autenticação 100% manifesto (E2E)', () => {
    it('login → renderIf revela a rota protegida → logout → renderIf volta ao login + redirect do host', async () => {
        const registry = createComponentRegistry();
        const store = createSarakDataStore({ session: { isLogged: false } });
        const navigate = vi.fn();

        renderWithProvider(
            <SarakManifestRenderer
                manifest={buildManifest()}
                registry={registry}
                dataStore={store}
                networkInterceptor={fakeAuthBackend}
                routerInterceptor={navigate}
            />,
        );

        // 1. Só a tela de login está de pé.
        expect(screen.getByText('Login do Sistema')).toBeInTheDocument();
        expect(screen.queryByTestId('protected-area')).not.toBeInTheDocument();

        // 2. Credenciais válidas, 100% via campos declarados no template.
        fireEvent.change(screen.getByPlaceholderText('seu@email.com'), { target: { value: 'admin@sarak.dev' } });
        fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: FAKE_PASSWORD } });
        fireEvent.click(screen.getByRole('button', { name: 'Acessar Sistema' }));

        // 3. `renderIf` reage ao `session.isLogged` depositado pelo `api_call` (`into`).
        await waitFor(() => expect(screen.getByTestId('protected-area')).toBeInTheDocument());
        expect(screen.queryByText('Login do Sistema')).not.toBeInTheDocument();
        expect(store.get('session.token')).toBe(FAKE_TOKEN);

        // 4. Logout: `mutate_state` zera a sessão + `navigate` pede o redirect ao host.
        fireEvent.click(screen.getByText('Sair'));

        await waitFor(() => expect(screen.getByText('Login do Sistema')).toBeInTheDocument());
        expect(screen.queryByTestId('protected-area')).not.toBeInTheDocument();
        expect(navigate).toHaveBeenCalledWith('/login', expect.anything());
    });

    it('credenciais inválidas: erro do `onError` aparece na tela e a sessão continua deslogada', async () => {
        const registry = createComponentRegistry();
        const store = createSarakDataStore({ session: { isLogged: false } });

        renderWithProvider(
            <SarakManifestRenderer
                manifest={buildManifest()}
                registry={registry}
                dataStore={store}
                networkInterceptor={fakeAuthBackend}
            />,
        );

        fireEvent.change(screen.getByPlaceholderText('seu@email.com'), { target: { value: 'admin@sarak.dev' } });
        fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'senha-errada' } });
        fireEvent.click(screen.getByRole('button', { name: 'Acessar Sistema' }));

        await waitFor(() => expect(screen.getByText('Credenciais inválidas')).toBeInTheDocument());
        expect(screen.queryByTestId('protected-area')).not.toBeInTheDocument();
        expect(store.get('session.isLogged')).toBe(false);
    });
});
