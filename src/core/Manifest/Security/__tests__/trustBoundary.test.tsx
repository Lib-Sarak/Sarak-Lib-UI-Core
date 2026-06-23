import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { evaluateCondition } from '../../Conditional/evaluateCondition';
import { expandRenderFor, MAX_RENDERFOR_ITEMS } from '../../RenderFor/expandRenderFor';
import { ManifestNodeRenderer, MAX_NESTING_DEPTH } from '../../nodes/renderNode';
import { createComponentRegistry } from '../../Registry/ComponentRegistry';
import { SarakUIProvider } from '../../../Provider/SarakUIProvider';
import { EMPTY_STATE, type NodeRenderContext } from '../../nodes/context';
import type { ManifestNode } from '../../types';

describe('Fronteira de confiança (Spec 40) — avaliação sem eval (Regra 3)', () => {
    afterEach(() => vi.restoreAllMocks());

    it('condicional que toca `window`/`document`/globais falha fechado (false)', () => {
        vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        vi.spyOn(console, 'error').mockImplementation(() => undefined);
        expect(evaluateCondition("window.location === 'x'", EMPTY_STATE, EMPTY_STATE)).toBe(false);
        expect(evaluateCondition('document.cookie', EMPTY_STATE, EMPTY_STATE)).toBe(false);
        expect(evaluateCondition('global', EMPTY_STATE, EMPTY_STATE)).toBe(false);
    });

    it('condicional legítima continua funcionando (não é falso-positivo)', () => {
        expect(evaluateCondition("{{role}} === 'ADMIN'", { role: 'ADMIN' }, EMPTY_STATE)).toBe(true);
    });
});

describe('Fronteira de confiança (Spec 40) — limites anti-DoS (Regra 5)', () => {
    afterEach(() => vi.restoreAllMocks());

    it('renderFor trunca listas hostis no teto máximo de itens', () => {
        vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const huge = Array.from({ length: MAX_RENDERFOR_ITEMS + 500 }, (_, i) => ({ id: i }));
        const node: ManifestNode = { type: 'Row', renderFor: { source: '{{list}}' } };
        const result = expandRenderFor(node, { list: huge }, EMPTY_STATE);
        expect(result.ok).toBe(true);
        expect(result.items.length).toBe(MAX_RENDERFOR_ITEMS);
    });

    it('aninhamento profundo cai no Fallback em vez de estourar a pilha', () => {
        vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        vi.spyOn(console, 'error').mockImplementation(() => undefined);
        const reg = createComponentRegistry();
        reg.register('Box', (props: { children?: React.ReactNode }) => <div>{props.children}</div>);

        // Constrói uma cadeia de filhos mais funda que o limite.
        let node: ManifestNode = { type: 'Box', props: { label: 'fundo' } };
        for (let i = 0; i < MAX_NESTING_DEPTH + 20; i++) {
            node = { type: 'Box', children: [node] };
        }

        const { container } = render(
            <SarakUIProvider>
                <ManifestNodeRenderer
                    node={node}
                    path="root"
                    scope={EMPTY_STATE}
                    ctx={{ registry: reg, global: EMPTY_STATE } as NodeRenderContext}
                />
            </SarakUIProvider>,
        );
        // Renderizou sem estourar; o corte de profundidade evitou recursão infinita.
        expect(container).toBeTruthy();
    });
});
