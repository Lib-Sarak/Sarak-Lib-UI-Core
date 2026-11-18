import { describe, it, expect } from 'vitest';
import { CHROME_WIDGET_POSITION_TOKEN_IDS, FONT_SIZE_INCREASE_TOKEN_ID, FONT_SIZE_REDUCTION_TOKEN_ID, PREFERENCE_IDS, PREFERENCE_POSITION_TOKEN_IDS, PreferencesSchema, getChromeWidgetPosition, getPreferencePosition, isPreferenceOffered } from '../preferences';
import { NavigationSchema } from '../navigation';

/** Os tokens de posição — os dois degraus de P e G (sliders em px) ficam de fora. */
const POSITION_SCHEMA_TOKENS = PreferencesSchema.tokens.filter((token) => token.type === 'select');

describe('preferences (schema)', () => {
    it('declara exatamente as cinco preferências do contrato (§2.1)', () => {
        expect(PREFERENCE_IDS).toEqual(['colorMode', 'fontSize', 'navigationStyle', 'navCollapsed', 'language']);
    });

    it('cada preferência tem um token de posição próprio, e o schema declara exatamente esses 5', () => {
        // O recolher da barra do topo tem token próprio (`preferenceNavCollapsePositionTopbar`), fora das 5 preferências do usuário.
        const schemaIds = POSITION_SCHEMA_TOKENS.map((t) => t.id).filter((id) => id !== 'preferenceNavCollapsePositionTopbar').sort();
        const mappedIds = Object.values(PREFERENCE_POSITION_TOKEN_IDS).sort();
        expect(schemaIds).toEqual(mappedIds);
        expect(schemaIds).toHaveLength(5);
    });

    it('cada token de posição é `select` com as três posições possíveis', () => {
        POSITION_SCHEMA_TOKENS.forEach((token) => {
            expect(token.type).toBe('select');
            expect(token.constraints?.options?.map((o) => o.value)).toEqual(['off', 'menu', 'pinned']);
        });
    });

    it('padrão de fábrica: controles essenciais ficam fixos e layout/tipografia ficam no menu', () => {
        const byId = Object.fromEntries(POSITION_SCHEMA_TOKENS.map((t) => [t.id, t.defaultValue]));
        expect(byId[PREFERENCE_POSITION_TOKEN_IDS.colorMode]).toBe('menu');
        expect(byId.preferenceNavCollapsePositionTopbar).toBe('menu');
        expect(byId[PREFERENCE_POSITION_TOKEN_IDS.fontSize]).toBe('menu');
        expect(byId[PREFERENCE_POSITION_TOKEN_IDS.navigationStyle]).toBe('menu');
        expect(byId[PREFERENCE_POSITION_TOKEN_IDS.navCollapsed]).toBe('pinned');
        expect(byId[PREFERENCE_POSITION_TOKEN_IDS.language]).toBe('pinned');

        const chromeDefaults = Object.fromEntries(NavigationSchema.tokens.map((token) => [token.id, token.defaultValue]));
        expect(chromeDefaults[CHROME_WIDGET_POSITION_TOKEN_IDS.search]).toBe('pinned');
        expect(chromeDefaults[CHROME_WIDGET_POSITION_TOKEN_IDS.user]).toBe('pinned');
        expect(chromeDefaults[CHROME_WIDGET_POSITION_TOKEN_IDS.notifications]).toBe('pinned');
    });

    it('P e G são sliders em px, de 0 a 6, com padrão de 2 px (−2 e +2 sobre `bodySize`)', () => {
        [FONT_SIZE_REDUCTION_TOKEN_ID, FONT_SIZE_INCREASE_TOKEN_ID].forEach((id) => {
            const token = PreferencesSchema.tokens.find((t) => t.id === id);
            expect(token?.type).toBe('slider');
            expect(token?.unit).toBe('px');
            expect(token?.constraints).toMatchObject({ min: 0, max: 6, step: 1 });
            expect(token?.defaultValue).toBe(2);
        });
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
