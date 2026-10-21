// @vitest-environment node
// Teste do PRÓPRIO passo "catálogo = schema" da paridade: casos plantados que ele acusa, passantes que ele deixa passar,
// e o repositório real (que tem de estar em zero).
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { findCatalogDrift, schemaAllowedValues } from '../catalog-drift.ts';
import { MASTER_DESIGN_MAP } from '../../../../src/core/Design/master-map.ts';

const select = { id: 'shadowOrientation', type: 'select', constraints: { options: [{ id: 'top', value: 'top' }, { id: 'dynamic', value: 'dynamic' }] } };
const slider = { id: 'glassBlur', type: 'slider', constraints: { min: 0, max: 40, step: 1 } };

describe('findCatalogDrift', () => {
    it('PASSANTE: tipo igual, opções em outra ordem e faixa igual não são achado', () => {
        const entries = [
            { tokenId: 'shadowOrientation', type: 'select', allowedValues: ['dynamic', 'top'] },
            { tokenId: 'glassBlur', type: 'slider', allowedValues: { min: 0, max: 40, step: 1 } },
        ];

        expect(findCatalogDrift([select, slider], entries)).toEqual([]);
    });

    it('PLANTADO: opção a mais, opção a menos e opção de outro nome são acusadas', () => {
        const withExtra = [{ tokenId: 'shadowOrientation', type: 'select', allowedValues: ['top', 'dynamic', 'top-left'] }];
        const withMissing = [{ tokenId: 'shadowOrientation', type: 'select', allowedValues: ['top'] }];

        expect(findCatalogDrift([select], withExtra).map((d) => d.field)).toEqual(['allowedValues']);
        expect(findCatalogDrift([select], withMissing).map((d) => d.field)).toEqual(['allowedValues']);
    });

    it('PLANTADO: tipo trocado (`slider` como `boolean`, `string` como `number`) é acusado', () => {
        const entries = [{ tokenId: 'glassBlur', type: 'string', allowedValues: { min: 0, max: 40, step: 1 } }];

        expect(findCatalogDrift([slider], entries)).toEqual([{ tokenId: 'glassBlur', field: 'type', catalog: 'string', schema: 'slider' }]);
    });

    it('PLANTADO: faixa diferente (máximo e passo) é acusada', () => {
        const entries = [{ tokenId: 'glassBlur', type: 'slider', allowedValues: { min: 0, max: 100, step: 5 } }];

        expect(findCatalogDrift([slider], entries).map((d) => d.field)).toEqual(['allowedValues']);
    });

    it('opção por `id` (sem `value`) é lida como texto, e `300` é `"300"`', () => {
        const weight = { id: 'h1Weight', type: 'select', constraints: { options: [{ id: 300 }, { id: 900 }] } };
        const entries = [{ tokenId: 'h1Weight', type: 'select', allowedValues: ['900', '300'] }];

        expect(findCatalogDrift([weight], entries)).toEqual([]);
    });

    it('MUTAÇÃO: opção declarada no nível de cima do token (`options`, não `constraints.options`) é lida; o catálogo vazio é achado', () => {
        const top = { id: 'texture', type: 'select', options: [{ id: 'noise', value: 'noise' }, { id: 'grid', value: 'grid' }] };

        expect(schemaAllowedValues(top)).toEqual(['noise', 'grid']);
        expect(findCatalogDrift([top], [{ tokenId: 'texture', type: 'select', allowedValues: ['grid', 'noise'] }])).toEqual([]);
        expect(findCatalogDrift([top], [{ tokenId: 'texture', type: 'select' }]).map((d) => d.field)).toEqual(['allowedValues']);
    });

    it('constraints.options vence options (a mesma precedência da validação)', () => {
        const both = { id: 'x', type: 'select', constraints: { options: [{ value: 'a' }] }, options: [{ value: 'b' }] };

        expect(schemaAllowedValues(both)).toEqual(['a']);
    });

    it('token sem restrição não tem valores permitidos, e catálogo com lista para ele é achado', () => {
        const text = { id: 'cardShadow', type: 'text' };

        expect(schemaAllowedValues(text)).toBeNull();
        expect(findCatalogDrift([text], [{ tokenId: 'cardShadow', type: 'text' }])).toEqual([]);
        expect(findCatalogDrift([text], [{ tokenId: 'cardShadow', type: 'text', allowedValues: ['a'] }])).toHaveLength(1);
    });
});

describe('o repositório', () => {
    it('o catálogo tem o tipo e os valores permitidos do schema, nos tokens do schema', () => {
        const dir = path.resolve(__dirname, '../../../../src/core/Design/catalog/partitions');
        const entries = fs.readdirSync(dir).filter((f) => f.endsWith('.json')).flatMap((f) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));
        const tokens = MASTER_DESIGN_MAP.components.flatMap((c) => c.tokens) as unknown as Parameters<typeof findCatalogDrift>[0];

        expect(findCatalogDrift(tokens, entries)).toEqual([]);
    });

    it('nenhum `select` do catálogo está sem opção (a sincronização do lote 4 chegou a apagar 16)', () => {
        const dir = path.resolve(__dirname, '../../../../src/core/Design/catalog/partitions');
        const entries = fs.readdirSync(dir).filter((f) => f.endsWith('.json')).flatMap((f) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));
        const empty = entries.filter((e: { type?: string; allowedValues?: unknown }) => e.type === 'select' && !(Array.isArray(e.allowedValues) && e.allowedValues.length > 0));

        expect(empty.map((e: { tokenId: string }) => e.tokenId)).toEqual([]);
    });
});
