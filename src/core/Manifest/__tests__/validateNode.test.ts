import { describe, it, expect } from 'vitest';
import {
    validateManifestNode,
    validateManifestRoot,
    separateNodeParts,
} from '../validateNode';
import type { ManifestNode } from '../types';
import { RESERVED_DIRECTIVES } from '../directives';

describe('Spec 20 — validateManifestNode', () => {
    it('deve validar um nó bem-formado com filhos aninhados', () => {
        const node: ManifestNode = {
            type: 'SarakFlex',
            id: 'root-flex',
            props: { gap: '16px' },
            children: [
                { type: 'SarakCard', props: { title: 'A' } },
                { type: 'SarakCard', props: { title: 'B' } },
            ],
        };

        const result = validateManifestNode(node);
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });

    it('deve rejeitar diretiva escrita incorretamente devolvendo path e id do nó culpado', () => {
        const node = {
            type: 'SarakCard',
            id: 'card-typo',
            // "renderForr" não é diretiva reservada nem chave estrutural
            renderForr: '{{items}}',
        } as unknown;

        const result = validateManifestNode(node);
        expect(result.valid).toBe(false);
        const offender = result.errors.find((e) => e.code === 'unknown_key');
        expect(offender).toBeDefined();
        expect(offender?.nodeId).toBe('card-typo');
        expect(offender?.path).toBe('root');
        expect(offender?.message).toContain('renderForr');
    });

    it('deve localizar o nó culpado em sub-árvore profunda (children e slots)', () => {
        const node = {
            type: 'SarakGrid',
            children: [
                { type: 'SarakFlex' },
                {
                    type: 'SarakCard',
                    slots: {
                        header: { type: 'SarakText', bogusKey: 1 },
                    },
                },
            ],
        } as unknown;

        const result = validateManifestNode(node);
        expect(result.valid).toBe(false);
        const offender = result.errors.find((e) => e.code === 'unknown_key');
        expect(offender?.path).toBe('root.children[1].slots.header');
    });

    it('deve aceitar todas as diretivas reservadas do catálogo como chaves válidas', () => {
        const node: Record<string, unknown> = { type: 'SarakCard' };
        for (const directive of RESERVED_DIRECTIVES) {
            node[directive] = undefined;
        }
        const result = validateManifestNode(node);
        expect(result.valid).toBe(true);
    });

    it('deve exigir um "type" string não-vazio', () => {
        const result = validateManifestNode({ id: 'sem-tipo' });
        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.code === 'invalid_type')).toBe(true);
    });

    it('deve rejeitar children que não seja array', () => {
        const result = validateManifestNode({ type: 'SarakFlex', children: {} });
        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.code === 'invalid_children')).toBe(true);
    });
});

describe('Spec 20 — separateNodeParts (Regra 4: props × diretivas)', () => {
    it('deve separar props visuais das diretivas de comportamento', () => {
        const node: ManifestNode = {
            type: 'SarakCard',
            props: { title: 'Olá', variant: 'primary' },
            renderIf: "{{role}} === 'ADMIN'",
            actions: [{ type: 'navigate', payload: { to: '/home' } }],
        };

        const { props, directives } = separateNodeParts(node);
        expect(props).toEqual({ title: 'Olá', variant: 'primary' });
        expect(directives.renderIf).toBe("{{role}} === 'ADMIN'");
        expect(directives.actions).toBeDefined();
        // Diretivas nunca aparecem em props.
        expect((props as Record<string, unknown>).renderIf).toBeUndefined();
        expect((props as Record<string, unknown>).actions).toBeUndefined();
    });

    it('deve devolver props vazias quando o nó não declara props', () => {
        const { props } = separateNodeParts({ type: 'SarakFlex' });
        expect(props).toEqual({});
    });
});

describe('Spec 20 — validateManifestRoot (Regra 5: schemaVersion)', () => {
    it('deve aceitar o nó raiz com schemaVersion compatível', () => {
        const result = validateManifestRoot({ type: 'SarakShell', schemaVersion: 1 });
        expect(result.valid).toBe(true);
    });

    it('deve acionar fallback de manifesto inválido sem schemaVersion compatível', () => {
        const result = validateManifestRoot({ type: 'SarakShell' });
        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.code === 'unsupported_schema_version')).toBe(true);
    });

    it('deve rejeitar schemaVersion de versão futura/incompatível', () => {
        const result = validateManifestRoot({ type: 'SarakShell', schemaVersion: 999 });
        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.code === 'unsupported_schema_version')).toBe(true);
    });
});
