import type { SarakLibraryLanguage } from '../catalog.types';

/** Os cinco idiomas além do português, na ordem fixa en, es, fr, de, it. O português é o `name`/`description` do próprio preset. */
export type PresetTextTuple = readonly [en: string, es: string, fr: string, de: string, it: string];

export interface PresetTextEntry {
    name: PresetTextTuple;
    description: PresetTextTuple;
}

export type PresetTextTable = Readonly<Record<string, PresetTextEntry>>;

/** A posição de cada idioma na tupla; o português não tem posição: vem do preset. */
export const PRESET_TEXT_LANGUAGES: Readonly<Record<Exclude<SarakLibraryLanguage, 'pt'>, number>> = { en: 0, es: 1, fr: 2, de: 3, it: 4 };
