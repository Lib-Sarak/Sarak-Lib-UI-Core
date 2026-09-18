import { describe, it, expect } from 'vitest';
import { LIBRARY_TEXT_CATALOG } from '../catalog';
import { LANGUAGES } from '../../Discovery/constants';

const LANGUAGE_IDS = LANGUAGES.map((lang) => lang.id);

describe('LIBRARY_TEXT_CATALOG — paridade dos seis idiomas', () => {
    it('toda chave tem os seis idiomas oferecidos, cada um não-vazio', () => {
        const keys = Object.keys(LIBRARY_TEXT_CATALOG);
        expect(keys.length).toBeGreaterThan(0);

        for (const key of keys) {
            const entry = LIBRARY_TEXT_CATALOG[key as keyof typeof LIBRARY_TEXT_CATALOG] as Record<string, string>;
            for (const lang of LANGUAGE_IDS) {
                expect(entry, `chave "${key}" não tem o idioma "${lang}"`).toHaveProperty(lang);
                expect(entry[lang].length, `chave "${key}" no idioma "${lang}" está vazia`).toBeGreaterThan(0);
            }
        }
    });

    it('cai quando uma tradução é apagada — prova que o teste acima de fato verifica (mutação)', () => {
        const withMissingTranslation = JSON.parse(JSON.stringify(LIBRARY_TEXT_CATALOG)) as Record<string, Record<string, string>>;
        const [firstKey] = Object.keys(withMissingTranslation);
        withMissingTranslation[firstKey].en = '';

        const isComplete = Object.values(withMissingTranslation).every((entry) =>
            LANGUAGE_IDS.every((lang) => typeof entry[lang] === 'string' && entry[lang].length > 0),
        );

        expect(isComplete).toBe(false);
    });
});
