import { describe, it, expect, vi } from 'vitest';
import { expandRenderFor, VIRTUALIZE_THRESHOLD } from '../RenderFor/expandRenderFor';
import type { ManifestNode } from '../types';

const EMPTY_SCOPE = {} as Record<string, unknown>;

describe('Spec 23 — expandRenderFor (Regra 1: itera a fonte)', () => {
    it('deve gerar exatamente N instâncias para uma lista de N itens', () => {
        const node: ManifestNode = { type: 'SarakCard', renderFor: { source: '{{usuarios}}' } };
        const state = { usuarios: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }] };
        const result = expandRenderFor(node, EMPTY_SCOPE, state);
        expect(result.ok).toBe(true);
        expect(result.items).toHaveLength(5);
    });

    it('deve iterar um array simples de 3 strings', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const node: ManifestNode = { type: 'SarakTypography', renderFor: { source: '{{labels}}' } };
        const result = expandRenderFor(node, EMPTY_SCOPE, { labels: ['a', 'b', 'c'] });
        expect(result.items).toHaveLength(3);
        warn.mockRestore();
    });
});

describe('Spec 23 — Escopo de iteração (Regra 2)', () => {
    it('deve injetar item/index no escopo local de cada instância', () => {
        const node: ManifestNode = { type: 'SarakCard', renderFor: { source: '{{users}}' } };
        const state = { users: [{ email: 'a@x.com' }, { email: 'b@x.com' }] };
        const result = expandRenderFor(node, EMPTY_SCOPE, state);
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        expect(result.items[0].scope.item).toEqual({ email: 'a@x.com' });
        expect(result.items[0].scope.index).toBe(0);
        expect(result.items[1].scope.index).toBe(1);
        warn.mockRestore();
    });

    it('deve respeitar `as`/`indexAs` customizados', () => {
        const node: ManifestNode = {
            type: 'SarakCard',
            renderFor: { source: '{{rows}}', as: 'row', indexAs: 'i' },
        };
        const result = expandRenderFor(node, EMPTY_SCOPE, { rows: [{ id: 9 }] });
        expect(result.items[0].scope.row).toEqual({ id: 9 });
        expect(result.items[0].scope.i).toBe(0);
    });

    it('deve remover a diretiva renderFor do nó-base (sem re-expansão)', () => {
        const node: ManifestNode = { type: 'SarakCard', renderFor: { source: '{{x}}' } };
        const result = expandRenderFor(node, EMPTY_SCOPE, { x: [{ id: 1 }] });
        expect(result.items[0].node.renderFor).toBeUndefined();
    });
});

describe('Spec 23 — Geração de keys (Regra 3)', () => {
    it('deve usar id/uuid do item como chave sem avisar', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const node: ManifestNode = { type: 'SarakCard', renderFor: { source: '{{x}}' } };
        const result = expandRenderFor(node, EMPTY_SCOPE, { x: [{ id: 'abc' }, { uuid: 'def' }] });
        expect(result.items[0].key).toBe('abc');
        expect(result.items[1].key).toBe('def');
        expect(warn).not.toHaveBeenCalled();
        warn.mockRestore();
    });

    it('deve respeitar keyBy explícito', () => {
        const node: ManifestNode = {
            type: 'SarakCard',
            renderFor: { source: '{{x}}', keyBy: 'sku' },
        };
        const result = expandRenderFor(node, EMPTY_SCOPE, { x: [{ sku: 'P-1' }] });
        expect(result.items[0].key).toBe('P-1');
    });

    it('deve cair para índice + aviso quando a chave é ausente', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const node: ManifestNode = { type: 'SarakCard', renderFor: { source: '{{x}}' } };
        const result = expandRenderFor(node, EMPTY_SCOPE, { x: [{ nome: 'sem-id' }] });
        expect(result.items[0].key).toBe('0');
        expect(warn).toHaveBeenCalled();
        warn.mockRestore();
    });
});

describe('Spec 23 — Fonte inválida (Regra 2: erro capturável)', () => {
    it('deve devolver ok=false com erro quando a fonte não é um Array', () => {
        const node: ManifestNode = { type: 'SarakCard', renderFor: { source: '{{naoLista}}' } };
        const result = expandRenderFor(node, EMPTY_SCOPE, { naoLista: { foo: 'bar' } });
        expect(result.ok).toBe(false);
        expect(result.items).toHaveLength(0);
        expect(result.error).toContain('não resolveu para um Array');
    });
});

describe('Spec 23 — Limiar de virtualização (Regra 4)', () => {
    it('deve expor o limiar e expandir listas grandes integralmente (decisão fica no Renderer)', () => {
        const big = Array.from({ length: VIRTUALIZE_THRESHOLD + 50 }, (_v, i) => ({ id: i }));
        const node: ManifestNode = { type: 'SarakCard', renderFor: { source: '{{big}}' } };
        const result = expandRenderFor(node, EMPTY_SCOPE, { big });
        expect(result.items.length).toBeGreaterThan(VIRTUALIZE_THRESHOLD);
    });
});
