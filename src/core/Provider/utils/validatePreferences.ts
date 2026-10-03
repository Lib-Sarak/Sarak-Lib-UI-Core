import { PREFERENCE_IDS } from '../../Design/schema/preferences';
import type { SarakUserPreferences } from '../preferencesTypes';

const COLOR_MODE_VALUES = ['light', 'dark', 'system'] as const;
const FONT_SIZE_VALUES = ['sm', 'md', 'lg'] as const;
const NAVIGATION_STYLE_VALUES = ['topbar', 'sidebar'] as const;
/** Só a FORMA de um código de idioma (`pt`, `pt-BR`, `en-US`) — o domínio de
 *  idiomas HABILITADOS e o SIGNIFICADO funcional são do tema/host. */
const LANGUAGE_PATTERN = /^[a-zA-Z]{2,3}(-[a-zA-Z0-9]{2,8})?$/;

/**
 * Trata preferências como dado hostil — mesmo espírito de `validateDesign`
 * (specs/10 §2.1): domínio fechado por preferência, valor fora do domínio
 * descartado, com um único `console.warn` por chamada listando o que caiu.
 * Fonte: `localStorage`, `options.preferences.onLoad`, outra aba (`storage`).
 */
export const validatePreferences = (raw: unknown): SarakUserPreferences => {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
    const input = raw as Record<string, unknown>;
    const result: SarakUserPreferences = {};
    const discarded: string[] = [];

    if (input.colorMode !== undefined) {
        if ((COLOR_MODE_VALUES as readonly unknown[]).includes(input.colorMode)) {
            result.colorMode = input.colorMode as SarakUserPreferences['colorMode'];
        } else discarded.push('colorMode');
    }
    if (input.fontSize !== undefined) {
        if ((FONT_SIZE_VALUES as readonly unknown[]).includes(input.fontSize)) {
            result.fontSize = input.fontSize as SarakUserPreferences['fontSize'];
        } else discarded.push('fontSize');
    }
    if (input.navigationStyle !== undefined) {
        if ((NAVIGATION_STYLE_VALUES as readonly unknown[]).includes(input.navigationStyle)) {
            result.navigationStyle = input.navigationStyle as SarakUserPreferences['navigationStyle'];
        } else discarded.push('navigationStyle');
    }
    if (input.navCollapsed !== undefined) {
        if (typeof input.navCollapsed === 'boolean') result.navCollapsed = input.navCollapsed;
        else discarded.push('navCollapsed');
    }
    if (input.language !== undefined) {
        if (typeof input.language === 'string' && LANGUAGE_PATTERN.test(input.language)) result.language = input.language;
        else discarded.push('language');
    }

    Object.keys(input).forEach((key) => {
        if (!(PREFERENCE_IDS as readonly string[]).includes(key)) discarded.push(key);
    });

    if (discarded.length > 0) {
        console.warn(`[Sarak:Preferences] Descartado(s) fora do domínio: ${discarded.join(', ')}.`);
    }

    return result;
};
