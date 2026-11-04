import { useCallback } from 'react';
import { useLibraryLanguage } from '../../../core/i18n/useLibraryText';
import {
    presetFamilyTitle, presetFontCategoryTitle, presetGroupTitle, presetUiText, resolvePresetText,
    type PresetText, type PresetTextSource, type PresetUiTextKey,
} from '../../../core/i18n/presetTexts';

export interface PresetTextApi {
    preset: (source: PresetTextSource) => PresetText;
    group: (groupId: string) => string;
    family: (familyId: string) => string;
    fontCategory: (category: string) => string;
    ui: (key: PresetUiTextKey, vars?: Record<string, string | number>) => string;
}

/** Os textos dos presets do painel no idioma que vale; sem Provider ou fora dos seis, saem em português. */
export const usePresetText = (): PresetTextApi => {
    const language = useLibraryLanguage();
    return {
        preset: useCallback((source) => resolvePresetText(source, language), [language]),
        group: useCallback((groupId) => presetGroupTitle(groupId, language), [language]),
        family: useCallback((familyId) => presetFamilyTitle(familyId, language), [language]),
        fontCategory: useCallback((category) => presetFontCategoryTitle(category, language), [language]),
        ui: useCallback((key, vars) => presetUiText(key, language, vars), [language]),
    };
};
