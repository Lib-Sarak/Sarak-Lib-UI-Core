import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, afterEach, vi } from 'vitest';
import { ManifestNodeRenderer } from '../renderNode';
import { createComponentRegistry, type ComponentRegistry } from '../../Registry/ComponentRegistry';
import { SarakUIProvider } from '../../../Provider/SarakUIProvider';
import { EMPTY_STATE, type NodeRenderContext } from '../context';
import type { ManifestNode } from '../../types';

const Safe: React.FC<{ label?: React.ReactNode }> = ({ label }) => <div>{label}</div>;
const Boom: React.FC = () => {
    throw new Error('falha simulada no nó');
};

const ctxWith = (
    registry: ComponentRegistry,
    fallbackErrorUI?: ManifestNode,
): NodeRenderContext => ({ registry, global: EMPTY_STATE, fallbackErrorUI });

const renderNode = (node: ManifestNode, ctx: NodeRenderContext) =>
    render(
        <SarakUIProvider>
            <ManifestNodeRenderer node={node} path="root" scope={EMPTY_STATE} ctx={ctx} />
        </SarakUIProvider>,
    );

describe('renderNode — ManifestNodeRenderer', () => {
    afterEach(() => vi.restoreAllMocks());

    it('resolve e renderiza um nó simples via registry', () => {
        const reg = createComponentRegistry();
        reg.register('Safe', Safe);
        renderNode({ type: 'Safe', props: { label: 'Olá' } }, ctxWith(reg));
        expect(screen.getByText('Olá')).toBeInTheDocument();
    });

    it('isola a falha no Error Boundary e usa o fallbackErrorUI do contexto (Spec 27)', () => {
        vi.spyOn(console, 'error').mockImplementation(() => undefined);
        vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const reg = createComponentRegistry();
        reg.register('Boom', Boom);
        reg.register('Safe', Safe);
        const fallback: ManifestNode = { type: 'Safe', props: { label: 'recuperado' } };

        renderNode({ type: 'Boom' }, ctxWith(reg, fallback));

        expect(screen.getByText('recuperado')).toBeInTheDocument();
    });

    it('renderIf falso suprime o nó (Spec 26)', () => {
        const reg = createComponentRegistry();
        reg.register('Safe', Safe);
        renderNode({ type: 'Safe', props: { label: 'Escondido' }, renderIf: 'false' }, ctxWith(reg));
        expect(screen.queryByText('Escondido')).toBeNull();
    });
});
