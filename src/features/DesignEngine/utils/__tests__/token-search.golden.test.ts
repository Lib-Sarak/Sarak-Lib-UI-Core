import { describe, it, expect } from 'vitest';
import { MASTER_DESIGN_MAP } from '../../../../core/Design/master-map';
import { TokenCatalog } from '../../../../core/Design/catalog';
import { searchTokens, suggestQuery, buildCatalogMap, type SearchableToken } from '../token-search';
import golden from './token-search.golden.json';

const TOP = 3;
const MIN_HIT_RATE = 0.9;
const MAX_SEARCH_MS = 50;
const MIN_GOLDEN_TERMS = 120;

const catalogMap = buildCatalogMap(TokenCatalog);
const buildTokens = (): SearchableToken[] => MASTER_DESIGN_MAP.components.flatMap((component) =>
    component.tokens.map((token) => ({ ...token, componentLabel: component.label })),
);
const allTokens = buildTokens();
const ids = (query: string): string[] => searchTokens(query, allTokens, catalogMap).map((token) => token.id);

describe('termos de ouro da busca', () => {
    it(`tem ao menos ${MIN_GOLDEN_TERMS} termos, sem repetição`, () => {
        expect(golden.length).toBeGreaterThanOrEqual(MIN_GOLDEN_TERMS);
        expect(new Set(golden.map((entry) => entry.q)).size).toBe(golden.length);
    });

    it('todo id esperado existe no schema', () => {
        const known = new Set(allTokens.map((token) => token.id));
        golden.forEach((entry) => entry.expect.forEach((id) => expect(known.has(id), `${entry.q} → ${id}`).toBe(true)));
    });

    it('nenhum termo fica sem resultado', () => {
        const empty = golden.filter((entry) => ids(entry.q).length === 0).map((entry) => entry.q);
        expect(empty).toEqual([]);
    });

    it(`ao menos ${MIN_HIT_RATE * 100}% dos termos trazem o token esperado entre os ${TOP} primeiros`, () => {
        const missed = golden.filter((entry) => !ids(entry.q).slice(0, TOP).some((id) => entry.expect.includes(id)));
        expect(missed.map((entry) => entry.q)).toEqual([]);
        expect(1 - missed.length / golden.length).toBeGreaterThanOrEqual(MIN_HIT_RATE);
    });

    it.each([
        ['cor do botão', 'btnPrimaryBg'],
        ['fundo', 'colorBgBody'],
        ['sombra', 'shadowIntensity'],
        ['espessura da borda', 'borderWidth'],
    ])('`%s` começa por %s', (query, first) => {
        expect(ids(query)[0]).toBe(first);
    });

    it('o verbo de ação leva ao valor: `esconder claro escuro` abre a posição da escolha de modo', () => {
        expect(ids('esconder claro escuro')[0]).toBe('preferenceModePosition');
    });

    it('o verbo sozinho busca como palavra: `esconder` acha a navegação oculta', () => {
        expect(ids('esconder')).toContain('isNavHidden');
    });

    it('vidro, desfoque e transparência deixaram de ser o mesmo grupo', () => {
        const [glass, blur, alpha] = ['vidro', 'desfoque', 'transparência'].map((query) => new Set(ids(query)));
        expect(glass).not.toEqual(blur);
        expect(blur).not.toEqual(alpha);
        expect(glass).not.toEqual(alpha);
    });

    it(`com ${allTokens.length} tokens, uma busca responde em menos de ${MAX_SEARCH_MS} ms, a fria e a morna`, () => {
        const fresh = buildTokens();
        const timed = (): number => {
            const start = performance.now();
            searchTokens('cor do botão', fresh, catalogMap);
            return performance.now() - start;
        };
        expect(timed()).toBeLessThan(MAX_SEARCH_MS);
        expect(timed()).toBeLessThan(MAX_SEARCH_MS);
    });

    it('palavra desconhecida: sugere o termo mais próximo em até dois erros e nada quando nada se aproxima', () => {
        expect(suggestQuery('tipografiaa', catalogMap)).toBe('tipografia');
        expect(suggestQuery('tooltpp', catalogMap)).toBe('tooltip');
        expect(suggestQuery('xyzqwk', catalogMap)).toBeNull();
        expect(suggestQuery('sombra', catalogMap)).toBeNull();
    });
});
