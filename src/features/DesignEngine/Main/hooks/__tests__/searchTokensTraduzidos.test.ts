import { describe, expect, it } from 'vitest';
import { LIBRARY_TEXT_CATALOG, type LibraryTextKey, type SarakLibraryLanguage } from '../../../../../core/i18n/catalog';
import { DECISION_TOKEN_IDS, decisionTokenTextKey } from '../../../../../core/i18n/catalogEntries.decisionTokens';
import { TokenCatalog } from '../../../../../core/Design/catalog';
import { buildCatalogMap, searchTokens } from '../../../utils/token-search';
import { buildSearchableTokens } from '../searchableTokens';

import { prazoDeTeste } from '../../../../../shared/testing/prazoDeTeste';
/** O administrador digita o nome que a tela mostra: o ajuste tem de estar entre os 5 primeiros, em qualquer idioma do painel. */
const LANGUAGES: readonly SarakLibraryLanguage[] = ['pt', 'en', 'es', 'fr', 'de', 'it'];
const TOP = 5;
const catalogMap = new Map(TokenCatalog.map((entry) => [entry.tokenId, { name: entry.name, description: entry.description }]));
const searchCatalog = buildCatalogMap(TokenCatalog);

const rankOf = (language: SarakLibraryLanguage, tokenId: string): number => {
    const name = LIBRARY_TEXT_CATALOG[decisionTokenTextKey(tokenId, 'name') as LibraryTextKey]![language];
    return searchTokens(name, buildSearchableTokens(language, catalogMap), searchCatalog).findIndex((token) => token.id === tokenId);
};

describe('a busca acha o ajuste pelo nome que a tela mostra', () => {
    const searchable = buildSearchableTokens('pt', catalogMap);
    const ids = DECISION_TOKEN_IDS.filter((id) => searchable.some((token) => token.id === id));

    it('cobre os ajustes das decisões principais', () => {
        expect(ids.length).toBeGreaterThanOrEqual(59);
    });

    LANGUAGES.forEach((language) => {
        it(`${language}: os ajustes ficam entre os ${TOP} primeiros`, () => {
            const outside = ids.map((id) => ({ id, rank: rankOf(language, id) })).filter(({ rank }) => rank < 0 || rank >= TOP);
            expect(outside).toEqual([]);
        }, prazoDeTeste(120_000));
    });

    it('pt: continua em primeiro lugar (sem piorar)', () => {
        const notFirst = ids.map((id) => ({ id, rank: rankOf('pt', id) })).filter(({ rank }) => rank !== 0);
        expect(notFirst).toEqual([]);
    }, prazoDeTeste(120_000));

    it('"System theme" acha `mode`', () => {
        const found = searchTokens('System theme', buildSearchableTokens('en', catalogMap), searchCatalog);
        expect(found[0]?.id).toBe('mode');
    });
});
