import { describe, it, expect } from 'vitest';
import { PREFERENCE_IDS, PREFERENCE_POSITION_TOKEN_IDS, PreferencesSchema, isPreferenceOffered } from '../preferences';

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

    it('padrão de fábrica: modo e navegação recolhida fixos; o resto, não oferecido', () => {
        const byId = Object.fromEntries(PreferencesSchema.tokens.map((t) => [t.id, t.defaultValue]));
        expect(byId[PREFERENCE_POSITION_TOKEN_IDS.colorMode]).toBe('pinned');
        expect(byId[PREFERENCE_POSITION_TOKEN_IDS.navCollapsed]).toBe('pinned');
        expect(byId[PREFERENCE_POSITION_TOKEN_IDS.fontSize]).toBe('off');
        expect(byId[PREFERENCE_POSITION_TOKEN_IDS.navigationStyle]).toBe('off');
        expect(byId[PREFERENCE_POSITION_TOKEN_IDS.language]).toBe('off');
    });

    describe('isPreferenceOffered', () => {
        it('token ausente no design cai no PADRÃO DO PRÓPRIO TOKEN — nunca "oferecida" por default genérico', () => {
            // `colorMode` tem padrão de fábrica 'pinned' — ausência conta como oferecida.
            expect(isPreferenceOffered(undefined, 'colorMode')).toBe(true);
            expect(isPreferenceOffered({}, 'colorMode')).toBe(true);
            // `fontSize` tem padrão de fábrica 'off' — ausência NÃO pode contar como oferecida,
            // senão um design sem as chaves novas (ex.: um modelo aplicado pelo painel que
            // substitui o design inteiro) passa a oferecer tudo, ao contrário da fábrica.
            expect(isPreferenceOffered(undefined, 'fontSize')).toBe(false);
            expect(isPreferenceOffered({}, 'fontSize')).toBe(false);
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
});
