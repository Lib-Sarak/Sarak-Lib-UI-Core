import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SarakManifestRenderer } from '../SarakManifestRenderer';
import { createComponentRegistry } from '../Registry/ComponentRegistry';
import { createSarakDataStore } from '../DataStore/SarakDataStore';
import type { NetworkInterceptor } from '../DataSource/useDataSource';
import type { ManifestRoot } from '../types';
import { SarakUIProvider } from '../../Provider/SarakUIProvider';

const renderWithProvider = (ui: React.ReactElement) =>
    render(<SarakUIProvider>{ui}</SarakUIProvider>);

/** Registry com um átomo de linha simples para inspecionar a iteração. */
const buildRegistry = () => {
    const registry = createComponentRegistry();
    const Row: React.FC<{ label?: string }> = ({ label }) => <li data-row>{label}</li>;
    const ListBox: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
        <ul data-testid="list">{children}</ul>
    );
    registry.register('Row', Row);
    registry.register('ListBox', ListBox);
    return registry;
};

const dataGridManifest = (): ManifestRoot => ({
    schemaVersion: 1,
    type: 'ListBox',
    source: { endpoint: '/clients', into: 'clients' },
    children: [
        {
            type: 'Row',
            renderFor: { source: '{{clients}}' },
            props: { label: '{{item.nome}}' },
        },
    ],
});

describe('Spec 31 — Fonte de dados → renderFor (ciclo completo / integração)', () => {
    it('deve carregar no onMount, depositar em `into` e desenhar as linhas', async () => {
        const interceptor: NetworkInterceptor = vi.fn(async () => [
            { id: 1, nome: 'Ana' },
            { id: 2, nome: 'Bia' },
        ]);
        const store = createSarakDataStore<{ clients: unknown[] }>({ clients: [] });

        renderWithProvider(
            <SarakManifestRenderer
                manifest={dataGridManifest()}
                registry={buildRegistry()}
                dataStore={store}
                networkInterceptor={interceptor}
            />,
        );

        // Skeleton durante a busca.
        expect(screen.getByRole('status')).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getAllByText(/Ana|Bia/)).toHaveLength(2);
        });
        expect(interceptor).toHaveBeenCalledTimes(1);
        expect(store.get('clients')).toHaveLength(2);
    });

    it('deve exibir o Empty State quando a lista volta vazia', async () => {
        const interceptor: NetworkInterceptor = vi.fn(async () => []);
        const store = createSarakDataStore({ clients: [] });

        renderWithProvider(
            <SarakManifestRenderer
                manifest={dataGridManifest()}
                registry={buildRegistry()}
                dataStore={store}
                networkInterceptor={interceptor}
            />,
        );

        await waitFor(() => {
            expect(document.querySelector('[data-sarak-data-empty="true"]')).not.toBeNull();
        });
    });

    it('deve cair no Fallback isolado quando a rede falha (sem derrubar a tela)', async () => {
        const interceptor: NetworkInterceptor = vi.fn(async () => {
            throw new Error('500');
        });
        const store = createSarakDataStore({ clients: [] });

        renderWithProvider(
            <SarakManifestRenderer
                manifest={dataGridManifest()}
                registry={buildRegistry()}
                dataStore={store}
                networkInterceptor={interceptor}
            />,
        );

        await waitFor(() => {
            expect(screen.getByRole('alert')).toHaveTextContent('FonteDeDados');
        });
    });

    it('NÃO deve buscar sem networkInterceptor (Regra 5) e mostrar erro', async () => {
        const store = createSarakDataStore({ clients: [] });
        renderWithProvider(
            <SarakManifestRenderer
                manifest={dataGridManifest()}
                registry={buildRegistry()}
                dataStore={store}
            />,
        );
        await waitFor(() => {
            expect(screen.getByRole('alert')).toBeInTheDocument();
        });
    });

    it('deve refletir mutate_state imediatamente nos textos interpolados (Regra 3 da Spec 24)', async () => {
        const interceptor: NetworkInterceptor = vi.fn(async () => [{ id: 1, nome: 'Ana' }]);
        const store = createSarakDataStore<{ clients: { id: number; nome: string }[] }>({ clients: [] });

        renderWithProvider(
            <SarakManifestRenderer
                manifest={dataGridManifest()}
                registry={buildRegistry()}
                dataStore={store}
                networkInterceptor={interceptor}
            />,
        );

        await waitFor(() => expect(screen.getByText('Ana')).toBeInTheDocument());

        // Atualização imutável idiomática: substitui a fatia (array) por uma nova.
        store.mutate_state('clients', [{ id: 1, nome: 'Ana Maria' }]);
        await waitFor(() => expect(screen.getByText('Ana Maria')).toBeInTheDocument());
    });
});
