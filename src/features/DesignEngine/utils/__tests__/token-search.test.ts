import { describe, it, expect } from 'vitest';
import { MASTER_DESIGN_MAP } from '../../../../core/Design/master-map';
import { TokenCatalog } from '../../../../core/Design/catalog';
import ConceptGroups from '../../config/token-search-concepts.json';
import {
    searchTokens, matchesText, locateToken, buildCatalogMap, tokenizeText, normalizeText,
    type SearchableToken, type CatalogSearchEntry,
} from '../token-search';

const catalogMap = buildCatalogMap(TokenCatalog);
const allTokens: SearchableToken[] = MASTER_DESIGN_MAP.components.flatMap((component) =>
    component.tokens.map((token) => ({ ...token, componentLabel: component.label })),
);

const ids = (query: string): string[] => searchTokens(query, allTokens, catalogMap).map((token) => token.id);

const synthetic = (id: string, label: string): SearchableToken => ({ id, label, type: 'text', defaultValue: '' });
const noCatalog = new Map<string, CatalogSearchEntry>();

describe('token-search', () => {
    it('normaliza acento, caixa e palavras de ligação', () => {
        expect(normalizeText('Tipográfia')).toBe('tipografia');
        expect(tokenizeText('Cor do Texto da Tela')).toEqual(['cor', 'texto', 'tela']);
    });

    it('`cor texto` e `cor do texto` devolvem a mesma lista, na mesma ordem', () => {
        expect(ids('cor texto').length).toBeGreaterThan(0);
        expect(ids('cor do texto')).toEqual(ids('cor texto'));
    });

    it('`cor do tex` (digitação em curso) devolve todos os que a busca antiga devolvia e os três da captura', () => {
        const legacy = allTokens.filter((t) => t.label.toLowerCase().includes('cor do tex') || t.id.toLowerCase().includes('cor do tex'));
        const found = ids('cor do tex');
        expect(legacy.length).toBeGreaterThanOrEqual(4);
        legacy.forEach((token) => expect(found).toContain(token.id));
        ['cardTitleColor', 'cardActionBtnText', 'cardSearchTextFocusColor'].forEach((id) => expect(found).toContain(id));
    });

    it('ordena quem tem as palavras no nome antes de quem só as tem em tag ou descrição', () => {
        const found = ids('cor texto');
        const inName = found.indexOf('inputTextColor');
        expect(inName).toBeGreaterThanOrEqual(0);
        expect(inName).toBeLessThan(found.indexOf('textColorMaster'));
        expect(inName).toBeLessThan(found.indexOf('tooltipTextColor'));
    });

    it.each(['fonte', 'escrita', 'texto', 'letra', 'tipografia'])('`%s` traz as três fontes entre os 10 primeiros', (term) => {
        const top = ids(term).slice(0, 10);
        ['headingFont', 'bodyFont', 'monoFont'].forEach((id) => expect(top).toContain(id));
    });

    it('acento e caixa diferentes devolvem o mesmo resultado', () => {
        expect(ids('Tipográfia')).toEqual(ids('tipografia'));
    });

    it('`cor` não põe um token só-de-prefixo acima de um que tem a palavra', () => {
        const tokens = [synthetic('bodyThing', 'Corpo do Texto'), synthetic('baseHue', 'Cor Base')];
        expect(searchTokens('cor', tokens, noCatalog).map((t) => t.id)).toEqual(['baseHue', 'bodyThing']);
    });

    it('prefixo só vale no último termo: `cor texto` não acha `corpo texto`', () => {
        const tokens = [synthetic('onlyPrefix', 'Corpo Texto')];
        expect(searchTokens('cor texto', tokens, noCatalog)).toEqual([]);
        expect(searchTokens('texto cor', tokens, noCatalog).map((t) => t.id)).toEqual(['onlyPrefix']);
    });

    it('acha pelo `name` do catálogo que a tela mostra: `logo` acha identityAlignment', () => {
        const schemaLabel = allTokens.find((t) => t.id === 'identityAlignment')?.label ?? '';
        expect(normalizeText(schemaLabel)).not.toContain('logo');
        expect(ids('logo')).toContain('identityAlignment');
    });

    it('consulta sem resultado ou só de palavras de ligação devolve []', () => {
        expect(ids('xyzq')).toEqual([]);
        expect(ids('de do')).toEqual([]);
        expect(ids('')).toEqual([]);
    });

    it('degrada para o label do schema quando o token não tem entrada no catálogo', () => {
        const tokens = [synthetic('orphanToken', 'Sombra Suave')];
        expect(searchTokens('sombra', tokens, noCatalog).map((t) => t.id)).toEqual(['orphanToken']);
        expect(searchTokens('shadow', tokens, noCatalog).map((t) => t.id)).toEqual(['orphanToken']);
    });

    it('indexa o rótulo do componente de origem', () => {
        const token = { ...synthetic('plainId', 'Valor'), componentLabel: 'Tooltips' };
        expect(searchTokens('tooltips', [token], noCatalog)).toHaveLength(1);
    });

    it('matchesText aplica as mesmas regras a um rótulo avulso', () => {
        expect(matchesText('fonte', 'Typography Font')).toBe(true);
        expect(matchesText('cor texto', 'Corpo Texto')).toBe(false);
        expect(matchesText('', 'Qualquer')).toBe(false);
    });

    describe('locateToken', () => {
        const pillars = [{ id: 'typography', title: '2. Tipografia e Escala' }, { id: 'brand', title: '1. Marca e Identidade' }];
        const grouped = { typography: { Fontes: [synthetic('headingFont', 'Fonte')] }, brand: {} };

        it('devolve `Pilar › Seção` sem a numeração do pilar', () => {
            expect(locateToken('headingFont', grouped, pillars)).toBe('Tipografia e Escala › Fontes');
        });

        it('token fora de qualquer grupo não ganha caminho', () => {
            expect(locateToken('semGrupo', grouped, pillars)).toBeNull();
        });
    });

    describe('dicionário de conceitos', () => {
        const wordsOfToken = (token: SearchableToken): Set<string> => {
            const entry = catalogMap.get(token.id);
            const texts = [token.id.replace(/([a-z0-9])([A-Z])/g, '$1 $2'), token.label, token.description ?? '',
                entry?.name ?? '', entry?.description ?? '', ...(entry?.tags ?? []), ...(entry?.categories ?? [])];
            return new Set(texts.flatMap(tokenizeText));
        };
        const tokenWords = allTokens.map(wordsOfToken);

        it.each(Object.entries(ConceptGroups))('grupo `%s` tem 2+ termos normalizados e casa 2+ tokens', (_name, terms) => {
            expect(terms.length).toBeGreaterThanOrEqual(2);
            terms.forEach((term) => expect(term).toBe(normalizeText(term)));
            const matched = tokenWords.filter((words) => terms.some((term) => words.has(term)));
            expect(matched.length).toBeGreaterThanOrEqual(2);
        });
    });
});
