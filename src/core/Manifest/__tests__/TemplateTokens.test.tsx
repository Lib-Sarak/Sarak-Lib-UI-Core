/**
 * GATE anti-regressão de tokens dos templates embarcados (Spec 16 §2.3).
 *
 * Percorre TODA medida de espaçamento declarada nos templates que o consumidor
 * recebe na instalação (`gap`/`padding` de props e de `props.style`) e falha se
 * algum valor não for resolvível pelo resolutor oficial nem CSS já válido — o
 * bug original (`gap: "spacing-md"` indo cru pro CSS) nunca mais entra pela porta
 * do template.
 */

import { describe, it, expect } from 'vitest';
import { SARAK_STARTER_MANIFEST } from '../templates/starter';
import { isResolvableSpacing } from '../Tokens';
import type { ManifestNode, ManifestRoot } from '../types';

/** Propriedades de estilo que carregam comprimentos de espaçamento a validar. */
const SPACING_STYLE_KEYS = ['gap', 'padding', 'margin', 'rowGap', 'columnGap'] as const;

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

/** Extrai pares [origem, valor] de todas as medidas de espaçamento de um nó. */
const spacingMeasuresOf = (node: ManifestNode): Array<[string, unknown]> => {
    const props = (node.props ?? {}) as Record<string, unknown>;
    const measures: Array<[string, unknown]> = [];
    if (props.gap != null) measures.push([`${node.type}.props.gap`, props.gap]);
    if (props.padding != null) measures.push([`${node.type}.props.padding`, props.padding]);
    const style = (props.style ?? {}) as Record<string, unknown>;
    for (const key of SPACING_STYLE_KEYS) {
        if (style[key] != null) measures.push([`${node.type}.props.style.${key}`, style[key]]);
    }
    return measures;
};

describe('Gate de tokens dos templates embarcados (Spec 16)', () => {
    const measures = collectNodes(SARAK_STARTER_MANIFEST).flatMap(spacingMeasuresOf);

    it('o template starter declara medidas de espaçamento (sanidade do gate)', () => {
        expect(measures.length).toBeGreaterThan(0);
    });

    it('toda medida é um token resolvível ou CSS válido', () => {
        const invalid = measures.filter(([, value]) => !isResolvableSpacing(value));
        expect(
            invalid,
            `Medidas não resolvíveis no template: ${JSON.stringify(invalid)}`,
        ).toEqual([]);
    });
});
