import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SarakManifestRenderer } from '../../SarakManifestRenderer';
import { createComponentRegistry, type ComponentRegistry } from '../../Registry/ComponentRegistry';
import { createSarakDataStore } from '../../DataStore/SarakDataStore';
import type { ManifestRoot } from '../../types';

const Pass: React.FC<{ children?: React.ReactNode }> = (props) => <div {...props} />;
const Btn: React.FC<{ children?: React.ReactNode }> = (props) => <button {...props} />;

const makeRegistry = (): ComponentRegistry => {
    const registry = createComponentRegistry();
    ['Nav', 'Bar', 'Box', 'Field'].forEach((t) => registry.register(t, Pass));
    registry.register('Btn', Btn);
    return registry;
};

const appManifest = (): ManifestRoot => ({
    schemaVersion: 1,
    type: 'Frame',
    shell: {
        topbar: { type: 'Bar', props: { 'data-testid': 'topbar', children: 'TOP' } },
        sidebar: {
            type: 'Nav',
            props: { 'data-testid': 'sidebar' },
            children: [
                {
                    type: 'Btn',
                    props: { 'data-testid': 'go-b', children: 'Ir B' },
                    actions: [{ type: 'navigate', payload: { to: '/b' } }],
                },
            ],
        },
        content: '<slot-rotas>',
    },
    routes: {
        '/a': { type: 'Box', props: { 'data-testid': 'page-a', children: 'PAGE A' } },
        '/b': { type: 'Box', props: { 'data-testid': 'page-b', children: 'PAGE B' } },
        '/c': { type: 'Box', props: { 'data-testid': 'page-c', children: 'PAGE C' } },
    },
});

describe('Spec 33 — App-Shell + Rotas como dado', () => {
    it('renderiza sidebar/topbar fixos e a subárvore da rota ativa', () => {
        render(<SarakManifestRenderer manifest={appManifest()} registry={makeRegistry()} route="/a" />);
        expect(screen.getByTestId('topbar')).toBeInTheDocument();
        expect(screen.getByTestId('sidebar')).toBeInTheDocument();
        expect(screen.getByTestId('page-a')).toBeInTheDocument();
        expect(screen.queryByTestId('page-b')).not.toBeInTheDocument();
    });

    it('troca apenas o content ao mudar a rota; o shell não remonta', () => {
        const registry = makeRegistry();
        const { rerender } = render(
            <SarakManifestRenderer manifest={appManifest()} registry={registry} route="/a" />,
        );
        const sidebarBefore = screen.getByTestId('sidebar');
        expect(screen.getByTestId('page-a')).toBeInTheDocument();

        rerender(<SarakManifestRenderer manifest={appManifest()} registry={registry} route="/b" />);
        // Conteúdo trocou...
        expect(screen.queryByTestId('page-a')).not.toBeInTheDocument();
        expect(screen.getByTestId('page-b')).toBeInTheDocument();
        // ...mas a sidebar é o MESMO nó do DOM (não remontou).
        expect(screen.getByTestId('sidebar')).toBe(sidebarBefore);
    });

    it('a navegação delega ao routerInterceptor (onNavigate), não à URL', () => {
        const onNavigate = vi.fn();
        render(
            <SarakManifestRenderer
                manifest={appManifest()}
                registry={makeRegistry()}
                route="/a"
                onNavigate={onNavigate}
            />,
        );
        fireEvent.click(screen.getByTestId('go-b'));
        expect(onNavigate).toHaveBeenCalledWith('/b', expect.objectContaining({ to: '/b' }));
    });

    it('sem rota informada, resolve a primeira rota declarada', () => {
        render(<SarakManifestRenderer manifest={appManifest()} registry={makeRegistry()} />);
        expect(screen.getByTestId('page-a')).toBeInTheDocument();
    });

    it('rota inexistente cai num fallback sem derrubar o shell', () => {
        vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        render(<SarakManifestRenderer manifest={appManifest()} registry={makeRegistry()} route="/zzz" />);
        expect(screen.getByTestId('sidebar')).toBeInTheDocument();
        expect(screen.queryByTestId('page-a')).not.toBeInTheDocument();
    });

    it('estado de shell vivo (DataStore) sobrevive à troca de página', () => {
        const store = createSarakDataStore({ collapsed: 'recolhida' });
        const manifest = appManifest();
        manifest.shell!.sidebar!.children!.push({
            type: 'Field',
            props: { 'data-testid': 'sidebar-state', title: '{{collapsed}}' },
        });
        const registry = makeRegistry();
        const { rerender } = render(
            <SarakManifestRenderer manifest={manifest} registry={registry} dataStore={store} route="/a" />,
        );
        expect(screen.getByTestId('sidebar-state')).toHaveAttribute('title', 'recolhida');
        rerender(
            <SarakManifestRenderer manifest={manifest} registry={registry} dataStore={store} route="/b" />,
        );
        // A sidebar permaneceu montada → seu estado vivo continua refletido.
        expect(screen.getByTestId('sidebar-state')).toHaveAttribute('title', 'recolhida');
    });
});
