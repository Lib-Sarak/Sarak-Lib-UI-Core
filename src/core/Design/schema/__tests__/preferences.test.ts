import { describe, it, expect } from 'vitest';
import { CHROME_WIDGET_POSITION_TOKEN_IDS, PREFERENCE_IDS, PREFERENCE_POSITION_TOKEN_IDS, PreferencesSchema, getChromeWidgetPosition, getPreferencePosition, isPreferenceOffered } from '../preferences';
import { NavigationSchema } from '../navigation';

describe('preferences (schema)', () => {
    it('declara exatamente as cinco preferências do contrato (§2.1)', () => {
        expect(PREFERENCE_IDS).toEqual(['colorMode', 'fontSize', 'navigationStyle', 'navCollapsed', 'language']);
    });

    it('cada preferência tem um token de posição próprio, e o schema declara exatamente esses 5', () => {
        const schemaIds = PreferencesSchema.tokens.map((t) => t.id).sort();
        const mappedIds = Object.values(PREFERENCE_POSITION_TOKEN_IDS).sort();
        expect(schemaIds).toEqual(mappedIds);
        expect(schemaIds).toHaveLength(5);
    });

    it('cada token de posição é `select` com as três posições possíveis', () => {
        PreferencesSchema.tokens.forEach((token) => {
            expect(token.type).toBe('select');
            expect(token.constraints?.options?.map((o) => o.value)).toEqual(['off', 'menu', 'pinned']);
        });
    });

    it('padrão de fábrica: controles essenciais ficam fixos e layout/tipografia ficam no menu', () => {
        const byId = Object.fromEntries(PreferencesSchema.tokens.map((t) => [t.id, t.defaultValue]));
        expect(byId[PREFERENCE_POSITION_TOKEN_IDS.colorMode]).toBe('pinned');
        expect(byId[PREFERENCE_POSITION_TOKEN_IDS.fontSize]).toBe('menu');
        expect(byId[PREFERENCE_POSITION_TOKEN_IDS.navigationStyle]).toBe('menu');
        expect(byId[PREFERENCE_POSITION_TOKEN_IDS.navCollapsed]).toBe('menu');
        expect(byId[PREFERENCE_POSITION_TOKEN_IDS.language]).toBe('pinned');

        const chromeDefaults = Object.fromEntries(NavigationSchema.tokens.map((token) => [token.id, token.defaultValue]));
        expect(chromeDefaults[CHROME_WIDGET_POSITION_TOKEN_IDS.search]).toBe('pinned');
        expect(chromeDefaults[CHROME_WIDGET_POSITION_TOKEN_IDS.user]).toBe('pinned');
        expect(chromeDefaults[CHROME_WIDGET_POSITION_TOKEN_IDS.notifications]).toBe('pinned');
    });

    describe('isPreferenceOffered', () => {
        it('token ausente no design cai no PADRÃO DO PRÓPRIO TOKEN — nunca "oferecida" por default genérico', () => {
            // `colorMode` tem padrão de fábrica 'pinned' — ausência conta como oferecida.
            expect(isPreferenceOffered(undefined, 'colorMode')).toBe(true);
            expect(isPreferenceOffered({}, 'colorMode')).toBe(true);
            // Tamanho de fonte aparece no menu por padrão e segue oferecido.
            expect(isPreferenceOffered(undefined, 'fontSize')).toBe(true);
            expect(isPreferenceOffered({}, 'fontSize')).toBe(true);
            expect(getPreferencePosition(undefined, 'fontSize')).toBe('menu');
            expect(getPreferencePosition({}, 'navigationStyle')).toBe('menu');
        });

        it('só o valor "off" tira a preferência de circulação', () => {
            expect(isPreferenceOffered({ preferenceModePosition: 'off' }, 'colorMode')).toBe(false);
        });

        it('"menu" e "pinned" contam como oferecida', () => {
            expect(isPreferenceOffered({ preferenceModePosition: 'menu' }, 'colorMode')).toBe(true);
            expect(isPreferenceOffered({ preferenceModePosition: 'pinned' }, 'colorMode')).toBe(true);
        });

        it('lê o token PRÓPRIO de cada preferência, nunca um dos outros quatro', () => {
            const design = { preferenceModePosition: 'off', preferenceFontSizePosition: 'pinned' };
            expect(isPreferenceOffered(design, 'colorMode')).toBe(false);
            expect(isPreferenceOffered(design, 'fontSize')).toBe(true);
        });
    });

    it('preserva a posição que o sistema já salvou no design', () => {
        expect(getPreferencePosition({ preferenceFontSizePosition: 'pinned' }, 'fontSize')).toBe('pinned');
        expect(getPreferencePosition({ preferenceNavigationStylePosition: 'off' }, 'navigationStyle')).toBe('off');
        expect(getChromeWidgetPosition({ chromeSearchPosition: 'menu' }, 'search')).toBe('menu');
    });
});
