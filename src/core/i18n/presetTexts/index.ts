import type { SarakLibraryLanguage } from '../catalog.types';
import { THEME_FONTS } from '../../Design/schema/typography';
import { PRESET_TEXTS_LAYOUT } from './layout';
import { PRESET_TEXTS_SHAPE_A } from './shapeA';
import { PRESET_TEXTS_SHAPE_B } from './shapeB';
import { PRESET_TEXTS_COMPONENTS_A } from './componentsA';
import { PRESET_TEXTS_COMPONENTS_B } from './componentsB';
import { PRESET_TEXTS_FONTS } from './fonts';
import { BUTTON_STYLE_DESCRIPTION, BUTTON_STYLE_NAMES, FONT_CATEGORY_DESCRIPTIONS, TEXTURE_DESCRIPTION_TEMPLATES, TEXTURE_NAMES } from './textures';
import { PRESET_FAMILY_TITLES, PRESET_FONT_CATEGORY_TITLES, PRESET_GROUP_TITLES, PRESET_UI_TEXT } from './groups';
import { PRESET_TEXT_LANGUAGES, type PresetTextTable } from './types';

/**
 * Nome e descrição de cada preset do painel nos seis idiomas. Fica FORA do catálogo de textos que o boot carrega: só o
 * painel importa este módulo, e o painel é um pedaço sob demanda. O português é o `name`/`description` do próprio preset.
 */
export const PRESET_TEXT_TABLE: PresetTextTable = {
    ...PRESET_TEXTS_LAYOUT, ...PRESET_TEXTS_SHAPE_A, ...PRESET_TEXTS_SHAPE_B, ...PRESET_TEXTS_COMPONENTS_A, ...PRESET_TEXTS_COMPONENTS_B, ...PRESET_TEXTS_FONTS,
};

export interface PresetTextSource {
    id: string;
    name: string;
    description: string;
}

export interface PresetText {
    name: string;
    description: string;
}

/** Ordem das tuplas de seis (pt, en, es, fr, de, it). */
const SIX_INDEX: Readonly<Record<SarakLibraryLanguage, number>> = { pt: 0, en: 1, es: 2, fr: 3, de: 4, it: 5 };

type SixTuple = readonly [string, string, string, string, string, string];

const NO_TEXTURE_DESCRIPTION: SixTuple = ['Sem textura.', 'No texture.', 'Sin textura.', 'Sans texture.', 'Ohne Textur.', 'Senza texture.'];

export const pickSix = (tuple: SixTuple, language: SarakLibraryLanguage): string => tuple[SIX_INDEX[language]];

const fill = (template: SixTuple, language: SarakLibraryLanguage, name: string): string => pickSix(template, language).split('{name}').join(name);

const TEXTURE_PREFIXES: ReadonlyArray<readonly [string, 'background' | 'card']> = [['card-tex-', 'card'], ['tex-', 'background']];

const textureText = (id: string, language: SarakLibraryLanguage): PresetText | undefined => {
    const match = TEXTURE_PREFIXES.find(([prefix]) => id.startsWith(prefix));
    const entry = match && TEXTURE_NAMES[id.slice(match[0].length)];
    if (!match || !entry) return undefined;
    const name = language === 'pt' ? entry.pt : entry.others[PRESET_TEXT_LANGUAGES[language]];
    const description = id.endsWith('-none') ? pickSix(NO_TEXTURE_DESCRIPTION, language) : fill(TEXTURE_DESCRIPTION_TEMPLATES[match[1]], language, name);
    return { name, description };
};

const buttonStyleText = (id: string, language: SarakLibraryLanguage): PresetText | undefined => {
    const entry = BUTTON_STYLE_NAMES[id];
    if (!entry) return undefined;
    const name = language === 'pt' ? entry.pt : entry.others[PRESET_TEXT_LANGUAGES[language]];
    return { name, description: fill(BUTTON_STYLE_DESCRIPTION, language, name) };
};

const fontText = (preset: PresetTextSource, language: SarakLibraryLanguage): PresetText | undefined => {
    if (!preset.id.startsWith('typo-')) return undefined;
    const font = THEME_FONTS.find((candidate) => candidate.name === preset.name);
    const description = font && FONT_CATEGORY_DESCRIPTIONS[font.category];
    return description ? { name: preset.name, description: pickSix(description, language) } : undefined;
};

/** O nome e a descrição do preset no idioma pedido; o que não tem tradução cai no texto do próprio preset (português). */
export const resolvePresetText = (preset: PresetTextSource, language: SarakLibraryLanguage): PresetText => {
    const own: PresetText = { name: preset.name, description: preset.description };
    const derived = textureText(preset.id, language) ?? buttonStyleText(preset.id, language) ?? fontText(preset, language);
    if (derived) return derived;
    const entry = PRESET_TEXT_TABLE[preset.id];
    if (!entry || language === 'pt') return own;
    const index = PRESET_TEXT_LANGUAGES[language];
    return { name: entry.name[index], description: entry.description[index] };
};

export const presetGroupTitle = (groupId: string, language: SarakLibraryLanguage): string => {
    const title = PRESET_GROUP_TITLES[groupId];
    return title ? pickSix(title, language) : groupId;
};

export const presetFamilyTitle = (familyId: string, language: SarakLibraryLanguage): string => {
    const title = PRESET_FAMILY_TITLES[familyId];
    return title ? pickSix(title, language) : familyId;
};

export const presetFontCategoryTitle = (category: string, language: SarakLibraryLanguage): string => {
    const title = PRESET_FONT_CATEGORY_TITLES[category];
    return title ? pickSix(title, language) : category;
};

export type PresetUiTextKey = keyof typeof PRESET_UI_TEXT;

export const presetUiText = (key: PresetUiTextKey, language: SarakLibraryLanguage, vars?: Record<string, string | number>): string =>
    Object.entries(vars ?? {}).reduce((text, [name, value]) => text.split(`{${name}}`).join(String(value)), pickSix(PRESET_UI_TEXT[key], language));
