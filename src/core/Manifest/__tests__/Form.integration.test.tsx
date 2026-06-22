import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SarakManifestRenderer } from '../SarakManifestRenderer';
import { createComponentRegistry } from '../Registry/ComponentRegistry';
import { createSarakDataStore } from '../DataStore/SarakDataStore';
import { SarakUIProvider } from '../../Provider/SarakUIProvider';
import type { ManifestRoot } from '../types';

// Botão simples que repassa o onClick injetado pelo Renderer ao DOM.
const Btn: React.FC<{ children?: React.ReactNode }> = (props) => <button {...props} />;
// Espelho de leitura do estado (prova a interpolação em tempo real do model).
// Lê via prop `label` (não `children`: o children-JSX do nó sobrescreveria props.children).
const Mirror: React.FC<{ label?: React.ReactNode }> = ({ label }) => (
    <span data-testid="mirror">{label}</span>
);

const renderForm = (interceptor = vi.fn(async () => ({ ok: true }))) => {
    const registry = createComponentRegistry();
    registry.register('Btn', Btn);
    registry.register('Mirror', Mirror);
    const store = createSarakDataStore<{ user: { name: string } }>({ user: { name: '' } });

    const manifest: ManifestRoot = {
        schemaVersion: 1,
        type: 'SarakFormGroup',
        form: { id: 'cadastro', resetOn: 'submitSuccess' },
        children: [
            {
                type: 'SarakInput',
                model: { path: 'user.name' },
                validation: [{ rule: 'required', message: 'Nome obrigatório' }],
                props: { 'data-testid': 'name' },
            },
            { type: 'Mirror', props: { label: '{{user.name}}' } },
            {
                type: 'Btn',
                props: { 'data-testid': 'save', children: 'Salvar' },
                actions: [{ type: 'api_call', submit: true, payload: { endpoint: '/save', method: 'POST' } }],
            },
        ],
    };

    render(
        <SarakUIProvider>
            <SarakManifestRenderer
                manifest={manifest}
                registry={registry}
                dataStore={store}
                networkInterceptor={interceptor}
            />
        </SarakUIProvider>,
    );

    return { store, interceptor };
};

describe('Specs 29 + 32 — Integração de formulário no Renderer', () => {
    it('two-way model: digitar espelha {{user.name}} em tempo real, sem loop', async () => {
        renderForm();
        const input = screen.getByTestId('name') as HTMLInputElement;

        fireEvent.change(input, { target: { value: 'Ana' } });

        await waitFor(() => expect(screen.getByTestId('mirror')).toHaveTextContent('Ana'));
        expect(input.value).toBe('Ana');
    });

    it('submit sujo: bloqueia o api_call e revela o erro (Critério 29.1)', async () => {
        const { interceptor } = renderForm();

        fireEvent.click(screen.getByTestId('save'));

        // Erro aparece (campo required vazio) e a requisição é cancelada.
        await waitFor(() => expect(screen.getByText('Nome obrigatório')).toBeInTheDocument());
        expect(interceptor).not.toHaveBeenCalled();
    });

    it('corrigir e submeter: dispara o request com payload do model e reseta (Regra 4)', async () => {
        const { interceptor, store } = renderForm();
        const input = screen.getByTestId('name') as HTMLInputElement;

        fireEvent.change(input, { target: { value: 'Ana' } });
        fireEvent.click(screen.getByTestId('save'));

        await waitFor(() => expect(interceptor).toHaveBeenCalledTimes(1));
        expect(interceptor).toHaveBeenCalledWith(
            expect.objectContaining({ endpoint: '/save', params: { user: { name: 'Ana' } } }),
        );
        // resetOn=submitSuccess restaura o valor inicial.
        await waitFor(() => expect(store.get('user.name')).toBe(''));
    });

    it('erro do onBlur: mostra a borda de erro ao sair do campo vazio', async () => {
        renderForm();
        const input = screen.getByTestId('name');

        fireEvent.blur(input);

        await waitFor(() => expect(screen.getByText('Nome obrigatório')).toBeInTheDocument());
    });
});
