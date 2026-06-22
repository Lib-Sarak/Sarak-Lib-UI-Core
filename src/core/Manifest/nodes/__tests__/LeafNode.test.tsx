import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SarakManifestRenderer } from '../../SarakManifestRenderer';
import { createComponentRegistry, type ComponentRegistry } from '../../Registry/ComponentRegistry';
import { createSarakDataStore } from '../../DataStore/SarakDataStore';
import type { ManifestRoot } from '../../types';

// LeafNode é o passo final do Renderer; exercitamos sua lógica via o Renderer.
const Btn: React.FC<{ children?: React.ReactNode }> = (props) => <button {...props} />;

const makeRegistry = (): ComponentRegistry => {
    const registry = createComponentRegistry();
    registry.register('Btn', Btn);
    return registry;
};

describe('Spec 25/26 — LeafNode: props, disabledIf e eventos', () => {
    it('interpola props e renderiza o componente resolvido', () => {
        const store = createSarakDataStore({ label: 'Enviar' });
        const manifest: ManifestRoot = {
            schemaVersion: 1,
            type: 'Btn',
            props: { 'data-testid': 'b', title: '{{label}}' },
        };
        render(<SarakManifestRenderer manifest={manifest} registry={makeRegistry()} dataStore={store} />);
        expect(screen.getByTestId('b')).toHaveAttribute('title', 'Enviar');
    });

    it('disabledIf=true injeta disabled e NÃO dispara ações no clique', () => {
        const onNavigate = vi.fn();
        const store = createSarakDataStore({ locked: true });
        const manifest: ManifestRoot = {
            schemaVersion: 1,
            type: 'Btn',
            props: { 'data-testid': 'b', children: 'X' },
            disabledIf: '{{locked}}',
            actions: [{ type: 'navigate', payload: { to: '/x' } }],
        };
        render(
            <SarakManifestRenderer
                manifest={manifest}
                registry={makeRegistry()}
                dataStore={store}
                onNavigate={onNavigate}
            />,
        );
        const btn = screen.getByTestId('b');
        expect(btn).toBeDisabled();
        fireEvent.click(btn);
        expect(onNavigate).not.toHaveBeenCalled();
    });

    it('type desconhecido cai no fallback sem derrubar a árvore', () => {
        vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const manifest: ManifestRoot = { schemaVersion: 1, type: 'Inexistente' };
        render(<SarakManifestRenderer manifest={manifest} registry={makeRegistry()} />);
        expect(screen.getByText(/Inexistente/)).toBeInTheDocument();
    });
});
