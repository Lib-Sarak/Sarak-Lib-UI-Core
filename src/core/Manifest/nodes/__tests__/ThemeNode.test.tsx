import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ManifestNodeRenderer } from '../renderNode';
import { createComponentRegistry, type ComponentRegistry } from '../../Registry/ComponentRegistry';
import { SarakUIProvider } from '../../../Provider/SarakUIProvider';
import { EMPTY_STATE, type NodeRenderContext } from '../context';
import type { ManifestNode } from '../../types';

const Safe: React.FC<{ label?: React.ReactNode; children?: React.ReactNode }> = ({ label, children }) => (
    <div>{label}{children}</div>
);

const registryWith = (): ComponentRegistry => {
    const reg = createComponentRegistry();
    reg.register('Safe', Safe);
    return reg;
};

const renderTree = (node: ManifestNode, registry: ComponentRegistry) =>
    render(
        <SarakUIProvider>
            <ManifestNodeRenderer
                node={node}
                path="root"
                scope={EMPTY_STATE}
                ctx={{ registry, global: EMPTY_STATE } as NodeRenderContext}
            />
        </SarakUIProvider>,
    );

describe('ThemeNode (Spec 42 — diretiva theme no pipeline)', () => {
    it('envolve a subárvore num DesignScope e renderiza o conteúdo (Regra 1)', () => {
        const { container } = renderTree(
            { type: 'Safe', props: { label: 'na região' }, theme: 'cyberpunk-neon' },
            registryWith(),
        );
        expect(container.querySelector('.sarak-design-scope')).not.toBeNull();
        expect(screen.getByText('na região')).toBeInTheDocument();
    });

    it('isola duas regiões com temas distintos lado a lado (Regra 1 — sem vazamento)', () => {
        const { container } = renderTree(
            {
                type: 'Safe',
                children: [
                    { type: 'Safe', props: { label: 'A' }, theme: { primaryColor: '#ff0000' } },
                    { type: 'Safe', props: { label: 'B' }, theme: { primaryColor: '#00ff00' } },
                ],
            },
            registryWith(),
        );
        const scopes = container.querySelectorAll('.sarak-design-scope');
        expect(scopes.length).toBe(2);
        // Cada região injeta a própria cor como variável CSS isolada — sem vazar para a outra.
        expect(container.innerHTML).toContain('#ff0000');
        expect(container.innerHTML).toContain('#00ff00');
        expect(screen.getByText('A')).toBeInTheDocument();
        expect(screen.getByText('B')).toBeInTheDocument();
    });
});
