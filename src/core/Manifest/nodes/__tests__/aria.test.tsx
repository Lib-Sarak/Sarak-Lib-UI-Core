import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { mapAriaDirective } from '../aria';
import { ManifestNodeRenderer } from '../renderNode';
import { createComponentRegistry } from '../../Registry/ComponentRegistry';
import { SarakUIProvider } from '../../../Provider/SarakUIProvider';
import { EMPTY_STATE, type NodeRenderContext } from '../context';
import type { ManifestNode } from '../../types';

describe('mapAriaDirective (Spec 41 — a11y como dado)', () => {
    it('traduz atalhos semânticos para atributos ARIA canônicos', () => {
        expect(mapAriaDirective({ label: 'Fechar', describedby: 'ajuda' })).toEqual({
            'aria-label': 'Fechar',
            'aria-describedby': 'ajuda',
        });
    });

    it('repassa `role` e chaves `aria-*` cruas; prefixa chaves bare', () => {
        expect(mapAriaDirective({ role: 'switch', 'aria-pressed': true, expanded: false })).toEqual({
            role: 'switch',
            'aria-pressed': true,
            'aria-expanded': false,
        });
    });

    it('retorna {} quando não há diretiva', () => {
        expect(mapAriaDirective(undefined)).toEqual({});
    });
});

describe('LeafNode — diretiva aria repassada ao átomo (Spec 41, Regra 5)', () => {
    it('injeta os atributos ARIA no componente renderizado', () => {
        const reg = createComponentRegistry();
        reg.register('Btn', (props: Record<string, unknown>) => <button {...props}>X</button>);
        const node: ManifestNode = { type: 'Btn', aria: { label: 'Fechar painel' } };
        const { getByRole } = render(
            <SarakUIProvider>
                <ManifestNodeRenderer
                    node={node}
                    path="root"
                    scope={EMPTY_STATE}
                    ctx={{ registry: reg, global: EMPTY_STATE } as NodeRenderContext}
                />
            </SarakUIProvider>,
        );
        expect(getByRole('button', { name: 'Fechar painel' })).toBeInTheDocument();
    });
});
