import { describe, it, expect } from 'vitest';
import { MASTER_DESIGN_MAP } from '../../../../core/Design/master-map';
import { TokenCatalog } from '../../../../core/Design/catalog';
import { searchTokens, buildCatalogMap, type SearchableToken } from '../token-search';
import validation from './token-search.validation.json';

const TOP = 5;
const MIN_HIT_RATE = 0.8;
const MIN_PHRASES = 40;

const catalogMap = buildCatalogMap(TokenCatalog);
const allTokens: SearchableToken[] = MASTER_DESIGN_MAP.components.flatMap((component) =>
    component.tokens.map((token) => ({ ...token, componentLabel: component.label })),
);
const ids = (query: string): string[] => searchTokens(query, allTokens, catalogMap).map((token) => token.id);

/** Frases escritas como a pessoa fala, fora da lista de ouro: o que impede a busca de virar molde dela. */
describe('frases de validação da busca', () => {
    it(`tem ao menos ${MIN_PHRASES} frases e todo id esperado existe`, () => {
        const known = new Set(allTokens.map((token) => token.id));
        expect(validation.length).toBeGreaterThanOrEqual(MIN_PHRASES);
        validation.forEach((entry) => entry.expect.forEach((id) => expect(known.has(id), `${entry.q} → ${id}`).toBe(true)));
    });

    it('nenhuma frase fica sem resultado', () => {
        expect(validation.filter((entry) => ids(entry.q).length === 0).map((entry) => entry.q)).toEqual([]);
    });

    it(`ao menos ${MIN_HIT_RATE * 100}% trazem o token esperado entre os ${TOP} primeiros`, () => {
        const missed = validation.filter((entry) => !ids(entry.q).slice(0, TOP).some((id) => entry.expect.includes(id)));
        expect(1 - missed.length / validation.length, `erraram: ${missed.map((entry) => entry.q).join(' | ')}`).toBeGreaterThanOrEqual(MIN_HIT_RATE);
    });

    it('as frases do revisor que erravam: `fundo da página` começa no fundo do corpo', () => {
        expect(ids('fundo da página')[0]).toBe('colorBgBody');
        expect(ids('letras maiúsculas nos títulos').slice(0, TOP)).toContain('headingTransform');
    });

    it('sem casamento completo, o token que casa com mais termos vem antes do que casa com um', () => {
        const found = ids('cor de quando passa o mouse no menu');
        expect(found.length).toBeGreaterThan(0);
        expect(found.slice(0, TOP).some((id) => /Hover/.test(id))).toBe(true);
    });
});
