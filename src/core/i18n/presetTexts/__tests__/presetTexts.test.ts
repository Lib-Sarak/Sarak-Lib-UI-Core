// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { ALL_COMPONENT_PRESETS, PRESET_GROUPS } from '../../../Design/presets/components/registry';
import { TEXTURE_FAMILIES } from '../../../Design/presets/components/textureFamilies';
import { THEME_FONTS } from '../../../Design/schema/typography';
import { LANGUAGES } from '../../languages';
import type { SarakLibraryLanguage } from '../../catalog.types';
import { PRESET_TEXT_TABLE, presetFamilyTitle, presetFontCategoryTitle, presetGroupTitle, presetUiText, resolvePresetText } from '../index';
import { FONT_CATEGORIES } from '../../../Design/presets/components/typographyKits';

const LANGUAGE_IDS = LANGUAGES.map((language) => language.id) as SarakLibraryLanguage[];
const JARGON = /\b(token|css|json)\b/i;

describe('textos dos presets do painel — seis idiomas', () => {
    it('a lib oferece os seis idiomas que a tabela cobre', () => {
        expect([...LANGUAGE_IDS].sort()).toEqual(['de', 'en', 'es', 'fr', 'it', 'pt']);
    });

    it.each(LANGUAGE_IDS)('%s: todo preset tem nome e descrição não vazios', (language) => {
        const empty = ALL_COMPONENT_PRESETS.filter((preset) => {
            const text = resolvePresetText(preset, language);
            return text.name.trim() === '' || text.description.trim() === '';
        });
        expect(empty.map((preset) => preset.id)).toEqual([]);
    });

    it('nenhum preset escrito à mão fica sem tradução (cairia no português)', () => {
        const derived = /^(tex-|card-tex-|typo-|btn-style-)/;
        const missing = ALL_COMPONENT_PRESETS.filter((preset) => !derived.test(preset.id) && PRESET_TEXT_TABLE[preset.id] === undefined);
        expect(missing.map((preset) => preset.id)).toEqual([]);
    });

    it('a tabela não guarda texto de preset que não existe mais', () => {
        const known = new Set(ALL_COMPONENT_PRESETS.map((preset) => preset.id));
        expect(Object.keys(PRESET_TEXT_TABLE).filter((id) => !known.has(id))).toEqual([]);
    });

    it('as traduções existem de fato: fora o português, o texto muda em quase todo preset', () => {
        const handwritten = ALL_COMPONENT_PRESETS.filter((preset) => PRESET_TEXT_TABLE[preset.id] !== undefined);
        const sameAsPortuguese = (language: SarakLibraryLanguage): number => handwritten.filter((preset) => resolvePresetText(preset, language).description === preset.description).length;
        LANGUAGE_IDS.filter((language) => language !== 'pt').forEach((language) => expect(sameAsPortuguese(language)).toBeLessThan(handwritten.length * 0.02));
    });

    it('nome e descrição sem jargão de programador, em nenhum idioma', () => {
        const offenders = LANGUAGE_IDS.flatMap((language) => ALL_COMPONENT_PRESETS
            .filter((preset) => JARGON.test(resolvePresetText(preset, language).name) || JARGON.test(resolvePresetText(preset, language).description))
            .map((preset) => `${language}:${preset.id}`));
        expect(offenders).toEqual([]);
    });

    it('os nomes de um grupo não se repetem no mesmo idioma', () => {
        const repeated = LANGUAGE_IDS.flatMap((language) => PRESET_GROUPS.flatMap((group) => {
            const names = group.presets.map((preset) => resolvePresetText(preset, language).name);
            return names.filter((name, index) => names.indexOf(name) !== index).map((name) => `${language}:${group.id}:${name}`);
        }));
        expect(repeated).toEqual([]);
    });
});

describe('textos dos presets do painel — títulos de grupo, família e categoria', () => {
    it.each(LANGUAGE_IDS)('%s: todo grupo, família e categoria de fonte tem título', (language) => {
        PRESET_GROUPS.forEach((group) => expect(presetGroupTitle(group.id, language), group.id).not.toBe(group.id));
        TEXTURE_FAMILIES.forEach((family) => expect(presetFamilyTitle(family.id, language), family.id).not.toBe(family.id));
        FONT_CATEGORIES.forEach((category) => expect(presetFontCategoryTitle(category, language), category).not.toBe(''));
        expect(new Set(THEME_FONTS.map((font) => font.category))).toEqual(new Set(FONT_CATEGORIES));
    });

    it.each(LANGUAGE_IDS)('%s: os textos de interface do "Ver todas" existem e interpolam a contagem', (language) => {
        expect(presetUiText('seeAllCount', language, { count: 7 })).toContain('7');
        expect(presetUiText('seeFewer', language)).not.toBe('');
    });
});
