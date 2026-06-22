import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SarakManifestRenderer } from '../SarakManifestRenderer';
import { createComponentRegistry } from '../Registry/ComponentRegistry';
import { createSarakDataStore } from '../DataStore/SarakDataStore';
import type { ManifestRoot } from '../types';
import { SarakUIProvider } from '../../Provider/SarakUIProvider';

const renderWithProvider = (ui: React.ReactElement) =>
    render(<SarakUIProvider>{ui}</SarakUIProvider>);

describe('Spec 30 (mínima) — SarakManifestRenderer (E2E da fundação)', () => {
    it('deve materializar um manifesto aninhado misturando átomos nativos e customizado', () => {
        const registry = createComponentRegistry();
        const Badge: React.FC<{ text?: string }> = ({ text }) => (
            <span data-testid="custom-badge">{text}</span>
        );
        registry.register('CustomBadge', Badge);

        const manifest: ManifestRoot = {
            schemaVersion: 1,
            type: 'SarakFlex',
            props: { gap: '8px' },
            children: [
                { type: 'SarakGrid', props: { 'data-testid': 'inner-grid' } },
                { type: 'CustomBadge', props: { text: 'OK' } },
            ],
        };

        renderWithProvider(<SarakManifestRenderer manifest={manifest} registry={registry} />);

        expect(screen.getByTestId('inner-grid')).toBeInTheDocument();
        expect(screen.getByTestId('custom-badge')).toHaveTextContent('OK');
    });

    it('deve NÃO vazar diretivas como atributos no DOM (Regra 4)', () => {
        // `renderIf` avalia true (Spec 26) com o estado fornecido → o nó monta, e aí
        // verificamos que as diretivas comportamentais não viram atributos do DOM.
        const store = createSarakDataStore({ role: 'ADMIN' });
        const manifest: ManifestRoot = {
            schemaVersion: 1,
            type: 'SarakFlex',
            props: { 'data-testid': 'host' },
            renderIf: "{{role}} === 'ADMIN'",
            actions: [{ type: 'navigate', payload: { to: '/x' } }],
        };

        renderWithProvider(<SarakManifestRenderer manifest={manifest} dataStore={store} />);

        const host = screen.getByTestId('host');
        expect(host.getAttribute('renderIf')).toBeNull();
        expect(host.getAttribute('actions')).toBeNull();
        expect(host.outerHTML).not.toContain('renderIf');
        expect(host.outerHTML).not.toContain('navigate');
    });

    it('deve suprimir o nó do DOM quando renderIf é falso (Spec 26, Regra 2)', () => {
        const store = createSarakDataStore({ role: 'USER' });
        const manifest: ManifestRoot = {
            schemaVersion: 1,
            type: 'SarakFlex',
            props: { 'data-testid': 'host' },
            renderIf: "{{role}} === 'ADMIN'",
        };

        renderWithProvider(<SarakManifestRenderer manifest={manifest} dataStore={store} />);

        expect(screen.queryByTestId('host')).not.toBeInTheDocument();
    });

    it('deve isolar type desconhecido no fallback sem derrubar a árvore', () => {
        vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const manifest: ManifestRoot = {
            schemaVersion: 1,
            type: 'SarakFlex',
            props: { 'data-testid': 'host' },
            children: [
                { type: 'SarakGrid', props: { 'data-testid': 'ok-node' } },
                { type: 'NaoExiste', id: 'broken' },
            ],
        };

        renderWithProvider(<SarakManifestRenderer manifest={manifest} />);

        expect(screen.getByTestId('ok-node')).toBeInTheDocument(); // árvore intacta
        expect(screen.getByRole('alert')).toHaveTextContent('NaoExiste');
    });

    it('deve acionar fallback de Manifesto Inválido sem schemaVersion compatível', () => {
        vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const manifest = { type: 'SarakFlex' } as unknown as ManifestRoot;

        renderWithProvider(<SarakManifestRenderer manifest={manifest} />);

        expect(screen.getByRole('alert')).toHaveTextContent('ManifestoInvalido');
    });

    it('deve aceitar um dataStore injetado e renderizar a árvore (plumbing reativo)', () => {
        const dataStore = createSarakDataStore({ user: { name: 'Ana' } });
        const manifest: ManifestRoot = {
            schemaVersion: 1,
            type: 'SarakGrid',
            props: { 'data-testid': 'with-store' },
        };

        renderWithProvider(<SarakManifestRenderer manifest={manifest} dataStore={dataStore} />);
        expect(screen.getByTestId('with-store')).toBeInTheDocument();
    });
});
