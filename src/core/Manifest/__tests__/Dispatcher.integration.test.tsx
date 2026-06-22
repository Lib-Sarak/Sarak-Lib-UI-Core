import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SarakManifestRenderer } from '../SarakManifestRenderer';
import { createComponentRegistry } from '../Registry/ComponentRegistry';
import { createSarakDataStore } from '../DataStore/SarakDataStore';
import { SarakToastProvider } from '../../../components/atomic/Feedback/SarakToast';
import { SarakUIProvider } from '../../Provider/SarakUIProvider';
import type { ManifestRoot } from '../types';

// Botão simples que repassa props (inclusive onClick injetado pelo Renderer) ao DOM.
const Btn: React.FC<{ children?: React.ReactNode }> = (props) => <button {...props} />;

describe('Spec 25 — Integração: clique dispara a cadeia de ações via Renderer', () => {
    it('clique: api_call → trigger_toast → navigate (fluxo feliz do Critério 1)', async () => {
        const order: string[] = [];
        const interceptor = vi.fn(async () => {
            order.push('api');
            return { id: 1 };
        });
        const onNavigate = vi.fn(() => order.push('nav'));

        const registry = createComponentRegistry();
        registry.register('Btn', Btn);

        const store = createSarakDataStore({});
        const manifest: ManifestRoot = {
            schemaVersion: 1,
            type: 'Btn',
            props: { 'data-testid': 'save', children: 'Salvar' },
            actions: [
                { type: 'api_call', payload: { endpoint: '/save', method: 'POST' } },
                { type: 'trigger_toast', payload: { message: 'Salvo!', variant: 'success' } },
                { type: 'navigate', payload: { to: '/home' } },
            ],
        };

        render(
            <SarakUIProvider>
                <SarakToastProvider>
                    <SarakManifestRenderer
                        manifest={manifest}
                        registry={registry}
                        dataStore={store}
                        networkInterceptor={interceptor}
                        onNavigate={onNavigate}
                    />
                </SarakToastProvider>
            </SarakUIProvider>,
        );

        fireEvent.click(screen.getByTestId('save'));

        await waitFor(() => expect(onNavigate).toHaveBeenCalled());
        expect(order).toEqual(['api', 'nav']);
        expect(interceptor).toHaveBeenCalledWith(
            expect.objectContaining({ endpoint: '/save', method: 'POST' }),
        );
        // O toast de sucesso foi renderizado na pilha.
        expect(screen.getByText('Salvo!')).toBeInTheDocument();
    });
});
