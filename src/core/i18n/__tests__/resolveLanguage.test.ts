import { describe, expect, it } from 'vitest';
import { languageCode, primaryLanguage, resolveSarakLanguage, toIntlLocale } from '../resolveLanguage';
import { resolveDateFnsLocale } from '../dateFnsLocale';
import { resolveLibraryLanguage } from '../useLibraryText';

describe('resolveSarakLanguage — a ordem da fonte única', () => {
    it('controlado vence preferência e tema', () => {
        expect(resolveSarakLanguage({ i18n: { language: 'en-US' }, preferenceLanguage: 'es', designLanguage: 'fr' })).toBe('en-US');
    });

    it('com i18n sem idioma controlado, a preferência vence o tema', () => {
        expect(resolveSarakLanguage({ i18n: { languages: ['pt-BR'] }, preferenceLanguage: 'es', designLanguage: 'fr' })).toBe('es');
    });

    it('sem i18n, a fonte é o design efetivo (rc.3) e ignora a preferência crua', () => {
        expect(resolveSarakLanguage({ preferenceLanguage: 'es', designLanguage: 'fr' })).toBe('fr');
    });

    it('sem nada, português', () => {
        expect(resolveSarakLanguage({})).toBe('pt');
    });
});

describe('toIntlLocale e primaryLanguage', () => {
    it('`pt` sem região vira pt-BR; com região fica como veio', () => {
        expect(toIntlLocale('pt')).toBe('pt-BR');
        expect(toIntlLocale('en-US')).toBe('en-US');
        expect(toIntlLocale('de')).toBe('de');
    });

    it('código inválido cai em pt-BR em vez de lançar RangeError', () => {
        expect(toIntlLocale('!!')).toBe('pt-BR');
    });

    it('a parte primária alimenta o texto da lib e idioma fora dos seis cai em pt', () => {
        expect(primaryLanguage('pt-BR')).toBe('pt');
        expect(resolveLibraryLanguage('en-US')).toBe('en');
        expect(resolveLibraryLanguage('ja-JP')).toBe('pt');
    });

    it('languageCode aceita string e objeto', () => {
        expect(languageCode('en-US')).toBe('en-US');
        expect(languageCode({ code: 'pt-BR', label: 'Português' })).toBe('pt-BR');
    });
});

describe('resolveDateFnsLocale', () => {
    it('mapeia os seis idiomas e cai em português fora deles', () => {
        expect(resolveDateFnsLocale('en-US')).toMatchObject({ code: 'en-US' });
        expect(resolveDateFnsLocale('de')).toMatchObject({ code: 'de' });
        expect(resolveDateFnsLocale('ja')).toMatchObject({ code: 'pt-BR' });
    });
});
