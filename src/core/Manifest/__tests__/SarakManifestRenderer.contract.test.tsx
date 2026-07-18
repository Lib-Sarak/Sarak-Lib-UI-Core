import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { SarakManifestRenderer } from '../SarakManifestRenderer';
import { createComponentRegistry, type ComponentRegistry } from '../Registry/ComponentRegistry';
import type { ManifestRoot } from '../types';

const Btn: React.FC<{ children?: React.ReactNode }> = (props) => <button {...props} />;

const makeRegistry = (): ComponentRegistry => {
    const registry = createComponentRegistry();
    registry.register('Btn', Btn);
    return registry;
};

afterEach(() => vi.restoreAllMocks());

describe('Spec 30 — Contrato do Importador', () => {
    it('aceita o alias canônico `payload` (Regra 2)', () => {
        const payload: ManifestRoot = {
            schemaVersion: 1,
            type: 'Btn',
            props: { 'data-testid': 'b', children: 'OK' },
        };
        render(<SarakManifestRenderer payload={payload} registry={makeRegistry()} />);
        expect(screen.getByTestId('b')).toBeInTheDocument();
    });

    it('aciona o `routerInterceptor` injetado nas ações `navigate` (Regra 2)', () => {
        const routerInterceptor = vi.fn();
        const payload: ManifestRoot = {
            schemaVersion: 1,
            type: 'Btn',
            props: { 'data-testid': 'go', children: 'Ir' },
            actions: [{ type: 'navigate', payload: { to: '/destino' } }],
        };
        render(
            <SarakManifestRenderer payload={payload} registry={makeRegistry()} routerInterceptor={routerInterceptor} />,
        );
        fireEvent.click(screen.getByTestId('go'));
        expect(routerInterceptor).toHaveBeenCalledWith('/destino', expect.objectContaining({ to: '/destino' }));
    });

    it('payload malformado → tela DX "Manifesto inválido" + erros no console (Spec 17, Regra 3)', () => {
        const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        const { container } = render(<SarakManifestRenderer payload={{ semVersao: true }} registry={makeRegistry()} />);
        expect(error).toHaveBeenCalledWith(expect.stringContaining('Manifesto de UI inválido'), expect.any(Array));
        expect(container.querySelector('[data-sarak-invalid-manifest="true"]')).not.toBeNull();
    });

    it('api_call sem networkInterceptor levanta aviso em desenvolvimento (Plano de Testes)', async () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const payload: ManifestRoot = {
            schemaVersion: 1,
            type: 'Btn',
            props: { 'data-testid': 'call', children: 'Chamar' },
            actions: [{ type: 'api_call', payload: { endpoint: '/api/x' } }],
        };
        render(<SarakManifestRenderer payload={payload} registry={makeRegistry()} />);
        fireEvent.click(screen.getByTestId('call'));
        await waitFor(() =>
            expect(warn).toHaveBeenCalledWith(expect.stringContaining('api_call sem networkInterceptor')),
        );
    });
});
