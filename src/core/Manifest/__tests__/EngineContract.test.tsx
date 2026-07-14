/**
 * Contrato funcional do motor — recursos que fecham a paridade plug-and-play:
 *  - `{{$route}}`: rota ativa interpolável (nav com estado ativo 100% via JSON);
 *  - `{{$event}}`: valor emitido pelo componente disponível às ações do nó;
 *  - `slots` nomeados renderizados como props ReactNode (Spec 20, Regra 6);
 *  - rotas lazy `{ lazy: id }` resolvidas pelo `manifestLoader` (Spec 33).
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SarakManifestRenderer } from '../SarakManifestRenderer';
import { createComponentRegistry, type ComponentRegistry } from '../Registry/ComponentRegistry';
import { createSarakDataStore } from '../DataStore/SarakDataStore';
import type { ManifestNode, ManifestRoot } from '../types';

const Box: React.FC<{ children?: React.ReactNode }> = (props) => <div {...props} />;

/** Componente data-driven que emite um VALOR no clique (padrão SarakShellNav). */
const Emitter: React.FC<{ onChange?: (value: string) => void; children?: React.ReactNode }> = ({
    onChange,
    children,
}) => (
    <button data-testid="emitter" type="button" onClick={() => onChange?.('/alvo-emitido')}>
        {children}
    </button>
);

/** Componente com regiões nomeadas — recebe slots como props ReactNode. */
const Panel: React.FC<{ header?: React.ReactNode; children?: React.ReactNode }> = ({
    header,
    children,
}) => (
    <section>
        <header data-testid="panel-header">{header}</header>
        <div data-testid="panel-body">{children}</div>
    </section>
);

const makeRegistry = (): ComponentRegistry => {
    const registry = createComponentRegistry();
    registry.register('Box', Box);
    registry.register('Emitter', Emitter);
    registry.register('Panel', Panel);
    return registry;
};

describe('{{$route}} — rota ativa como dado de binding', () => {
    const manifest = (): ManifestRoot => ({
        schemaVersion: 1,
        type: 'Box',
        props: { 'data-testid': 'raiz', children: 'Rota: {{$route}}' },
    });

    it('interpola a rota ativa injetada pelo host', () => {
        render(<SarakManifestRenderer manifest={manifest()} registry={makeRegistry()} route="/contratos" />);
        expect(screen.getByTestId('raiz')).toHaveTextContent('Rota: /contratos');
    });

    it('$route é reservada: o valor do motor prevalece sobre chave homônima do estado', () => {
        const store = createSarakDataStore({ $route: '/impostor' });
        render(
            <SarakManifestRenderer
                manifest={manifest()}
                registry={makeRegistry()}
                dataStore={store}
                route="/verdadeira"
            />,
        );
        expect(screen.getByTestId('raiz')).toHaveTextContent('Rota: /verdadeira');
    });
});

describe('{{$event}} — valor do evento disponível às ações', () => {
    it('navigate recebe o valor emitido pelo componente via onChange', () => {
        const onNavigate = vi.fn();
        const manifest: ManifestNode = {
            schemaVersion: 1,
            type: 'Emitter',
            actions: [{ type: 'navigate', payload: { to: '{{$event}}' } }],
        };
        render(
            <SarakManifestRenderer manifest={manifest} registry={makeRegistry()} onNavigate={onNavigate} />,
        );
        fireEvent.click(screen.getByTestId('emitter'));
        expect(onNavigate).toHaveBeenCalledWith('/alvo-emitido', expect.anything());
    });

    it('mutate_state grava o valor emitido no DataStore', () => {
        const store = createSarakDataStore({ ultimo: '' });
        const manifest: ManifestNode = {
            schemaVersion: 1,
            type: 'Emitter',
            actions: [{ type: 'mutate_state', payload: { path: 'ultimo', value: '{{$event}}' } }],
        };
        render(<SarakManifestRenderer manifest={manifest} registry={makeRegistry()} dataStore={store} />);
        fireEvent.click(screen.getByTestId('emitter'));
        expect(store.get('ultimo')).toBe('/alvo-emitido');
    });
});

describe('slots nomeados → props ReactNode (Spec 20, Regra 6)', () => {
    it('renderiza cada slot como prop do componente resolvido', () => {
        const manifest: ManifestNode = {
            schemaVersion: 1,
            type: 'Panel',
            slots: {
                header: { type: 'Box', props: { children: 'TÍTULO DO SLOT' } },
            },
            children: [{ type: 'Box', props: { children: 'CORPO' } }],
        };
        render(<SarakManifestRenderer manifest={manifest} registry={makeRegistry()} />);
        expect(screen.getByTestId('panel-header')).toHaveTextContent('TÍTULO DO SLOT');
        expect(screen.getByTestId('panel-body')).toHaveTextContent('CORPO');
    });
});

describe('rotas lazy — manifestLoader (Spec 33)', () => {
    const lazyApp = (): ManifestRoot => ({
        schemaVersion: 1,
        type: 'Box',
        shell: { content: '<slot-rotas>' },
        routes: {
            '/preguicosa': { lazy: 'pagina-remota' },
        },
    });

    it('carrega a subárvore via loader e a renderiza', async () => {
        const loader = vi.fn().mockResolvedValue({
            type: 'Box',
            props: { 'data-testid': 'pagina-lazy', children: 'CHEGUEI' },
        } satisfies ManifestNode);
        render(
            <SarakManifestRenderer
                manifest={lazyApp()}
                registry={makeRegistry()}
                route="/preguicosa"
                manifestLoader={loader}
            />,
        );
        expect(await screen.findByTestId('pagina-lazy')).toHaveTextContent('CHEGUEI');
        expect(loader).toHaveBeenCalledWith('pagina-remota');
    });

    it('falha do loader degrada para fallback VISÍVEL (nunca silencioso)', async () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const loader = vi.fn().mockRejectedValue(new Error('rede caiu'));
        render(
            <SarakManifestRenderer
                manifest={lazyApp()}
                registry={makeRegistry()}
                route="/preguicosa"
                manifestLoader={loader}
            />,
        );
        await waitFor(() =>
            expect(warn).toHaveBeenCalledWith(expect.stringContaining('manifestLoader falhou')),
        );
        warn.mockRestore();
    });

    it('sem loader injetado, avisa e degrada para fallback', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        render(
            <SarakManifestRenderer manifest={lazyApp()} registry={makeRegistry()} route="/preguicosa" />,
        );
        expect(warn).toHaveBeenCalledWith(expect.stringContaining('sem manifestLoader'));
        warn.mockRestore();
    });
});
