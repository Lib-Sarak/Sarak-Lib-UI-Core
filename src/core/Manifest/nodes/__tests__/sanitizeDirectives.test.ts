import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
    sanitizeDirectives,
    emitDirectiveWarnings,
    resetDirectiveWarnings,
} from '../sanitizeDirectives';
import type { ManifestNode } from '../../types';

describe('sanitizeDirectives (Spec 17, §2.1)', () => {
    it('remove `actions` objeto (erro de autoria) e produz aviso com exemplo', () => {
        const node = {
            type: 'SarakButton',
            id: 'btn',
            actions: { onClick: [] } as unknown as ManifestNode['actions'],
        } as ManifestNode;

        const result = sanitizeDirectives(node, 'btn');

        expect(result.node.actions).toBeUndefined();
        expect(result.warnings).toHaveLength(1);
        const warning = result.warnings[0];
        expect(warning.directive).toBe('actions');
        expect(warning.key).toBe('btn:actions');
        expect(warning.message).toContain('diretiva "actions" inválida');
        expect(warning.message).toContain('esperado array, recebido object');
        expect(warning.message).toContain('Ex. correto:');
    });

    it('não muta o nó original (função pura)', () => {
        const node = { type: 'SarakButton', actions: {} as unknown as ManifestNode['actions'] } as ManifestNode;
        sanitizeDirectives(node, 'root');
        expect(node.actions).toBeDefined();
    });

    it('deixa diretivas válidas intactas e reusa o nó sem clonar', () => {
        const node: ManifestNode = {
            type: 'SarakButton',
            actions: [{ type: 'navigate', payload: { to: '/x' } }],
            renderIf: "{{role}} === 'ADMIN'",
            model: { path: 'user.name' },
        };
        const result = sanitizeDirectives(node, 'root');
        expect(result.warnings).toHaveLength(0);
        expect(result.node).toBe(node);
    });

    it('nó sem diretivas passa intacto', () => {
        const node: ManifestNode = { type: 'SarakFlex', props: { gap: 'spacing-md' } };
        const result = sanitizeDirectives(node, 'root');
        expect(result.node).toBe(node);
        expect(result.warnings).toEqual([]);
    });

    it.each([
        ['model', 'x' as unknown, 'model'],
        ['validation', {} as unknown, 'validation'],
        ['renderIf', 123 as unknown, 'renderIf'],
        ['source', { endpoint: '/x' } as unknown, 'source'],
        ['onError', {} as unknown, 'onError'],
        ['bindings', 'nope' as unknown, 'bindings'],
    ])('remove `%s` mal formatado', (directive, value, expected) => {
        const node = { type: 'X', [directive]: value } as unknown as ManifestNode;
        const result = sanitizeDirectives(node, 'root');
        expect((result.node as Record<string, unknown>)[directive]).toBeUndefined();
        expect(result.warnings.map((w) => w.directive)).toContain(expected);
    });

    it('acumula múltiplos avisos num só nó', () => {
        const node = {
            type: 'X',
            actions: {} as unknown as ManifestNode['actions'],
            model: 5 as unknown as ManifestNode['model'],
        } as ManifestNode;
        const result = sanitizeDirectives(node, 'n1');
        expect(result.warnings).toHaveLength(2);
    });
});

describe('emitDirectiveWarnings — dedupe por nó (Spec 17, §2.1)', () => {
    let warn: ReturnType<typeof vi.spyOn>;
    beforeEach(() => {
        resetDirectiveWarnings();
        warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    });
    afterEach(() => warn.mockRestore());

    it('emite o mesmo aviso UMA vez (2 renders → 1 warn)', () => {
        const warnings = [{ key: 'btn:actions', directive: 'actions' as const, message: 'msg' }];
        emitDirectiveWarnings(warnings);
        emitDirectiveWarnings(warnings);
        expect(warn).toHaveBeenCalledTimes(1);
    });

    it('avisos de nós distintos não colidem', () => {
        emitDirectiveWarnings([{ key: 'a:actions', directive: 'actions', message: 'm1' }]);
        emitDirectiveWarnings([{ key: 'b:actions', directive: 'actions', message: 'm2' }]);
        expect(warn).toHaveBeenCalledTimes(2);
    });
});
