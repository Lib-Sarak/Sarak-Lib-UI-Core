import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SarakManifestRenderer } from '../SarakManifestRenderer';
import { createComponentRegistry } from '../Registry/ComponentRegistry';
import { createSarakDataStore } from '../DataStore/SarakDataStore';
import { namespacedKey } from '../Storage/safeStorage';
import { resetDirectiveWarnings } from '../nodes/sanitizeDirectives';
import { SarakUIProvider } from '../../Provider/SarakUIProvider';
import { SarakToastProvider } from '../../../components/atomic/Feedback/SarakToast';
import type { ManifestRoot } from '../types';

const Safe: React.FC<{ label?: React.ReactNode }> = ({ label }) => <div>{label}</div>;
const Boom: React.FC = () => {
    throw new Error('explosão fatal no card');
};
const Btn: React.FC<{ children?: React.ReactNode }> = (props) => <button {...props} />;
const Box: React.FC<{ children?: React.ReactNode }> = ({ children }) => <div>{children}</div>;

describe('Spec 27 — Isolamento de falhas (Error Boundaries)', () => {
    afterEach(() => vi.restoreAllMocks());

    it('erro fatal num card isola só aquele nó; irmãos sobrevivem (Critério 27.1)', () => {
        vi.spyOn(console, 'error').mockImplementation(() => undefined);
        vi.spyOn(console, 'warn').mockImplementation(() => undefined);

        const registry = createComponentRegistry();
        registry.register('Safe', Safe);
        registry.register('Boom', Boom);

        const manifest: ManifestRoot = {
            schemaVersion: 1,
            type: 'SarakFlex',
            fallbackErrorUI: { type: 'Safe', props: { label: 'Ops, falha ao carregar' } },
            children: [
                { type: 'Safe', id: 'a', props: { label: 'Card A' } },
                { type: 'Boom', id: 'b' },
                { type: 'Safe', id: 'c', props: { label: 'Card C' } },
            ],
        };

        render(
            <SarakUIProvider>
                <SarakManifestRenderer manifest={manifest} registry={registry} />
            </SarakUIProvider>,
        );

        // Irmãos intactos + fallback dinâmico no lugar do card que quebrou.
        expect(screen.getByText('Card A')).toBeInTheDocument();
        expect(screen.getByText('Card C')).toBeInTheDocument();
        expect(screen.getByText('Ops, falha ao carregar')).toBeInTheDocument();
    });

    it('sem fallbackErrorUI: mostra a mensagem real do erro, não "Componente desconhecido" (regressão)', () => {
        vi.spyOn(console, 'error').mockImplementation(() => undefined);
        vi.spyOn(console, 'warn').mockImplementation(() => undefined);

        const registry = createComponentRegistry();
        registry.register('Safe', Safe);
        registry.register('Boom', Boom);

        // Nó SEM `fallbackErrorUI`: cai no fallback padrão. Antes desta correção, um
        // erro real de render era mascarado como `Componente desconhecido:
        // "ErroDeRenderizacao"` — indistinguível de um typo de `type` no manifesto.
        const manifest: ManifestRoot = {
            schemaVersion: 1,
            type: 'SarakFlex',
            children: [{ type: 'Boom', id: 'b' }],
        };

        const { container } = render(
            <SarakUIProvider>
                <SarakManifestRenderer manifest={manifest} registry={registry} />
            </SarakUIProvider>,
        );

        // Query pelo container do fallback (não por texto — a mensagem também aparece
        // no stack técnico colapsável, gerando múltiplos matches de texto).
        const errorFallback = container.querySelector('[data-sarak-error-fallback="true"]');
        expect(errorFallback).not.toBeNull();
        expect(errorFallback?.textContent).toContain('explosão fatal no card');
        expect(screen.queryByText(/Componente desconhecido/)).not.toBeInTheDocument();
        expect(screen.queryByText(/^ErroDeRenderizacao$/)).not.toBeInTheDocument();
    });

    it('api_call que rejeita dispara onError sem quebrar a árvore (Critério 27.2)', async () => {
        const interceptor = vi.fn(async () => {
            throw new Error('CORS');
        });
        const registry = createComponentRegistry();
        registry.register('Btn', Btn);

        const manifest: ManifestRoot = {
            schemaVersion: 1,
            type: 'Btn',
            props: { 'data-testid': 'go', children: 'Enviar' },
            actions: [{ type: 'api_call', payload: { endpoint: '/x' } }],
            onError: [{ type: 'trigger_toast', payload: { message: 'Falha de rede', variant: 'error' } }],
        };

        render(
            <SarakUIProvider>
                <SarakToastProvider>
                    <SarakManifestRenderer
                        manifest={manifest}
                        registry={registry}
                        networkInterceptor={interceptor}
                    />
                </SarakToastProvider>
            </SarakUIProvider>,
        );

        fireEvent.click(screen.getByTestId('go'));

        await waitFor(() => expect(screen.getByText('Falha de rede')).toBeInTheDocument());
        // O botão (árvore) continua montado.
        expect(screen.getByTestId('go')).toBeInTheDocument();
    });
});

describe('Spec 17 — Resiliência leniente por diretiva + DX de erros', () => {
    afterEach(() => {
        resetDirectiveWarnings();
        vi.restoreAllMocks();
    });

    it('`actions` como objeto num botão: rota renderiza irmãos e o botão, SEM cartão de erro + warn (Critério 17.1)', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const registry = createComponentRegistry();
        registry.register('Box', Box);
        registry.register('Safe', Safe);
        registry.register('Btn', Btn);

        const manifest: ManifestRoot = {
            schemaVersion: 1,
            type: 'Box',
            children: [
                { type: 'Safe', props: { label: 'Irmão OK' } },
                {
                    type: 'Btn',
                    id: 'bad',
                    props: { children: 'Clique' },
                    actions: { onClick: [] } as unknown as ManifestRoot['actions'],
                },
            ],
        };

        const { container } = render(
            <SarakUIProvider>
                <SarakManifestRenderer manifest={manifest} registry={registry} />
            </SarakUIProvider>,
        );

        expect(screen.getByText('Irmão OK')).toBeInTheDocument();
        expect(screen.getByText('Clique')).toBeInTheDocument();
        expect(container.querySelector('[data-sarak-error-fallback="true"]')).toBeNull();
        expect(warn).toHaveBeenCalled();
        expect(warn.mock.calls.flat().join(' ')).toContain('"actions"');
    });

    it('sem payload: tela "Manifesto não fornecido" com instrução do template (Critério 17.3)', () => {
        vi.spyOn(console, 'error').mockImplementation(() => undefined);
        render(
            <SarakUIProvider>
                <SarakManifestRenderer />
            </SarakUIProvider>,
        );
        expect(screen.getByText('Manifesto não fornecido')).toBeInTheDocument();
        expect(screen.getByText(/templates\/app-starter\.manifest\.json/)).toBeInTheDocument();
    });

    it('payload inválido: tela "Manifesto inválido" lista os erros com path (Critério 17.4)', () => {
        vi.spyOn(console, 'error').mockImplementation(() => undefined);
        const { container } = render(
            <SarakUIProvider>
                <SarakManifestRenderer payload={'não é um manifesto' as unknown} />
            </SarakUIProvider>,
        );
        expect(screen.getByText('Manifesto inválido')).toBeInTheDocument();
        expect(container.querySelector('[data-sarak-invalid-manifest="true"]')).not.toBeNull();
        expect(container.querySelectorAll('li').length).toBeGreaterThan(0);
        expect(screen.queryByText(/Componente desconhecido/)).not.toBeInTheDocument();
    });
});

describe('Spec 28 — Persistência declarativa (persistState)', () => {
    beforeEach(() => window.localStorage.clear());

    const buildManifest = (): ManifestRoot => ({
        schemaVersion: 1,
        type: 'SarakInput',
        model: { path: 'profile.name' },
        persistState: { key: 'profile.name' },
        props: { 'data-testid': 'name' },
    });

    it('hidrata do storage no mount (F5 já com o valor) e grava on-change', async () => {
        window.localStorage.setItem(namespacedKey('profile.name'), JSON.stringify('Bob'));
        const store = createSarakDataStore<{ profile: { name: string } }>({ profile: { name: '' } });

        render(
            <SarakUIProvider>
                <SarakManifestRenderer manifest={buildManifest()} dataStore={store} />
            </SarakUIProvider>,
        );

        const input = screen.getByTestId('name') as HTMLInputElement;
        // Hidratação (useLayoutEffect) semeia o estado antes do paint.
        await waitFor(() => expect(input.value).toBe('Bob'));

        fireEvent.change(input, { target: { value: 'Carol' } });
        await waitFor(() =>
            expect(window.localStorage.getItem(namespacedKey('profile.name'))).toBe(
                JSON.stringify('Carol'),
            ),
        );
    });

    it('sincroniza entre abas: evento storage externo atualiza a UI (Regra 2)', async () => {
        const store = createSarakDataStore<{ profile: { name: string } }>({ profile: { name: 'Ana' } });

        render(
            <SarakUIProvider>
                <SarakManifestRenderer manifest={buildManifest()} dataStore={store} />
            </SarakUIProvider>,
        );

        const input = screen.getByTestId('name') as HTMLInputElement;
        await waitFor(() => expect(input.value).toBe('Ana'));

        // Outra aba grava e emite o evento storage.
        window.localStorage.setItem(namespacedKey('profile.name'), JSON.stringify('Dora'));
        act(() => {
            window.dispatchEvent(
                new StorageEvent('storage', { key: namespacedKey('profile.name') }),
            );
        });

        await waitFor(() => expect(input.value).toBe('Dora'));
    });
});
