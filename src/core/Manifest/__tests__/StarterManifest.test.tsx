/**
 * GATE do manifesto-starter (Spec 08 §3.1).
 *
 * O template oficial que todo consumidor recebe na instalação precisa:
 *  1. ser um ManifestRoot válido;
 *  2. usar SOMENTE types resolvíveis no Registry e ações do Dispatcher
 *     (template quebrado = primeira impressão quebrada do plug-and-play);
 *  3. entregar o Design Engine desde o primeiro boot: rota com
 *     `CustomizationPanel` + item correspondente no `SarakShellNav`;
 *  4. renderizar de verdade (smoke test com o Renderer real).
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SARAK_STARTER_MANIFEST } from '../templates/starter';
import { SarakManifestRenderer } from '../SarakManifestRenderer';
import SarakUIProvider from '../../Provider/SarakUIProvider';
import { validateManifestRoot } from '../validateNode';
import { defaultComponentRegistry } from '../Registry/ComponentRegistry';
import { ACTION_HANDLERS } from '../Dispatcher';
import type { ManifestNode, ManifestRoot } from '../types';

/** Percorre a árvore inteira (shell, rotas, children, slots) coletando nós. */
const collectNodes = (root: ManifestRoot): ManifestNode[] => {
    const nodes: ManifestNode[] = [];
    const visit = (node: ManifestNode | undefined): void => {
        if (!node || typeof node !== 'object') return;
        nodes.push(node);
        node.children?.forEach(visit);
        if (node.slots) Object.values(node.slots).forEach(visit);
    };
    visit(root);
    visit(root.shell?.topbar);
    visit(root.shell?.sidebar);
    for (const target of Object.values(root.routes ?? {})) {
        if (!('lazy' in target)) visit(target as ManifestNode);
    }
    return nodes;
};

describe('Gate do manifesto-starter (templates/app-starter.manifest.json)', () => {
    it('é um ManifestRoot válido', () => {
        const validation = validateManifestRoot(SARAK_STARTER_MANIFEST);
        expect(validation.errors, JSON.stringify(validation.errors)).toEqual([]);
        expect(validation.valid).toBe(true);
    });

    it('usa somente types do Registry e ações do Dispatcher', () => {
        for (const node of collectNodes(SARAK_STARTER_MANIFEST)) {
            expect(
                defaultComponentRegistry.has(node.type),
                `type "${node.type}" do template não existe no Registry.`,
            ).toBe(true);
            for (const action of node.actions ?? []) {
                expect(
                    ACTION_HANDLERS[action.type],
                    `ação "${action.type}" do template não existe no Dispatcher.`,
                ).toBeTruthy();
            }
        }
    });

    it('entrega o Design Engine desde o primeiro boot (rota + item de menu)', () => {
        const routes = SARAK_STARTER_MANIFEST.routes ?? {};
        const designRoute = Object.values(routes).find(
            (target) => !('lazy' in target) && (target as ManifestNode).type === 'CustomizationPanel',
        );
        expect(designRoute, 'o template PERDEU a rota do CustomizationPanel.').toBeTruthy();

        const nav = collectNodes(SARAK_STARTER_MANIFEST).find((n) => n.type === 'SarakShellNav');
        expect(nav, 'o template não tem SarakShellNav no shell.').toBeTruthy();
        const items = (nav?.props?.items ?? []) as Array<{ route?: string }>;
        const designPath = Object.entries(routes).find(
            ([, target]) => !('lazy' in target) && (target as ManifestNode).type === 'CustomizationPanel',
        )?.[0];
        expect(
            items.some((item) => item.route === designPath),
            'o menu do template não aponta para a rota do Design Engine.',
        ).toBe(true);
    });

    it('renderiza com o motor real dentro do Provider obrigatório (smoke)', async () => {
        render(
            <SarakUIProvider>
                <SarakManifestRenderer payload={SARAK_STARTER_MANIFEST} route="/" />
            </SarakUIProvider>,
        );
        expect(await screen.findByText('Bem-vindo 👋')).toBeInTheDocument();
        expect(screen.getByText('Design Engine')).toBeInTheDocument();
    });
});
