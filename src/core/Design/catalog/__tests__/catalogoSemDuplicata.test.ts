// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { TokenCatalog } from '../index';
import { sarakGetAllDesignTokens } from '../../master-map';

/**
 * O catálogo de tokens (o que a busca e o painel mostram) tem UMA entrada por token. Antes, sete tokens
 * (`bgBaseColor`, `cardBackgroundColor`, `cardBorderColor`, `colorBgBody`, `colorBgLayer1`, `colorBgLayer2`,
 * `zIndexModal`) apareciam duas vezes, com descrições divergentes — e valia a última, em silêncio.
 */
describe('catálogo de tokens', () => {
    it('nenhum `tokenId` aparece mais de uma vez', () => {
        const seen = new Map<string, number>();
        for (const entry of TokenCatalog) seen.set(entry.tokenId, (seen.get(entry.tokenId) ?? 0) + 1);
        const duplicated = [...seen].filter(([, count]) => count > 1).map(([id]) => id);
        expect(duplicated).toEqual([]);
    });

    it('MUTAÇÃO: o detector de duplicata acusa uma entrada repetida', () => {
        const withDuplicate = [...TokenCatalog, TokenCatalog[0]];
        const seen = new Map<string, number>();
        for (const entry of withDuplicate) seen.set(entry.tokenId, (seen.get(entry.tokenId) ?? 0) + 1);
        expect([...seen].filter(([, count]) => count > 1).map(([id]) => id)).toEqual([TokenCatalog[0].tokenId]);
    });

    it('todo token do catálogo existe no schema', () => {
        const ids = new Set(sarakGetAllDesignTokens().map((token) => token.id));
        const orphans = TokenCatalog.filter((entry) => !ids.has(entry.tokenId)).map((entry) => entry.tokenId);
        expect(orphans).toEqual([]);
    });
});
