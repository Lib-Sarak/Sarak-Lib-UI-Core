// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { sarakGetAllDesignTokens } from '../../master-map';
import { PALETTE_ROLE_MAP } from '../role-map';
import { PALETTE_BASE_TONE, PALETTE_LIGHTNESS_SCALE } from '../scale';

describe('PALETTE_ROLE_MAP', () => {
    it('covers every color token in the live schema exactly once', () => {
        const colorTokenIds = sarakGetAllDesignTokens()
            .filter((token) => token.type === 'color')
            .map((token) => token.id)
            .sort();
        expect(Object.keys(PALETTE_ROLE_MAP).sort()).toEqual(colorTokenIds);
    });

    it('provides a tone that exists in the scale for both display modes', () => {
        const tones = new Set<number>([PALETTE_BASE_TONE, ...PALETTE_LIGHTNESS_SCALE.map(({ tone }) => tone)]);
        Object.values(PALETTE_ROLE_MAP).forEach(({ toneByMode }) => {
            expect(tones.has(toneByMode.light)).toBe(true);
            expect(tones.has(toneByMode.dark)).toBe(true);
        });
    });

    it('o título, o título do card, a primária e o item ativo saem da base e se corrigem por deslocamento', () => {
        for (const key of ['titleColor', 'cardTitleColor', 'primaryColor', 'navItemActiveColor']) {
            expect(PALETTE_ROLE_MAP[key].scale, key).toBe('primary');
            expect(PALETTE_ROLE_MAP[key].toneByMode, key).toEqual({ light: PALETTE_BASE_TONE, dark: PALETTE_BASE_TONE });
            expect(PALETTE_ROLE_MAP[key].shiftFrom, key).toEqual([PALETTE_BASE_TONE]);
        }
    });

    it('distribui 60-30-10: a primária pinta ação e controle, a secundária o cabeçalho, o acento a ênfase e o foco', () => {
        const scaleOf = (tokens: string[]): string[] => [...new Set(tokens.map((token) => PALETTE_ROLE_MAP[token].scale))];
        expect(scaleOf(['btnPrimaryBg', 'rangeActiveColor', 'switchTrackActiveBg', 'checkboxActiveColor', 'primaryColor', 'titleColor'])).toEqual(['primary']);
        expect(scaleOf(['subtitleColor', 'btnSecondaryBg', 'cardHeaderBg', 'cardHeaderBorder', 'tableHeaderBg', 'sidebarCategoryColor', 'chartColorPalette'])).toEqual(['secondary']);
        expect(scaleOf(['emphasisColor', 'navActiveMarkerColor', 'inputFocusBorderColor', 'cardTitleIconGlow', 'sidebarBrandColor'])).toEqual(['accent']);
    });

    it('o preenchimento de marca é a cor da semente, exata, nos dois modos', () => {
        for (const key of ['btnPrimaryBg', 'rangeActiveColor', 'switchTrackActiveBg', 'checkboxActiveColor']) {
            expect(PALETTE_ROLE_MAP[key].toneByMode, key).toEqual({ light: PALETTE_BASE_TONE, dark: PALETTE_BASE_TONE });
        }
    });

    it('mestre, secundário e apagado têm degraus distintos nos dois modos', () => {
        for (const mode of ['light', 'dark'] as const) {
            const tones = ['textColorMaster', 'textColorSecondary', 'textColorMuted'].map((key) => PALETTE_ROLE_MAP[key].toneByMode[mode]);
            expect(new Set(tones).size, mode).toBe(3);
        }
    });
});

describe('PALETTE_ROLE_MAP — a área define o tratamento da cor', () => {
    const TEXT = {
        secondary: ['subtitleColor', 'sidebarCategoryColor', 'secondaryColor'],
        accent: ['emphasisColor', 'accentColor', 'tertiaryColor', 'inputFocusBorderColor'],
    } as const;
    const SMALL = { secondary: ['chartColorPalette'], accent: ['navActiveMarkerColor'] } as const;
    const SURFACE = ['cardHeaderBg', 'cardHeaderBorder', 'tableHeaderBg', 'btnSecondaryBg'];

    it.each(Object.entries(TEXT))('texto da %s: parte da semente e anda o mínimo (shiftFrom na base)', (scale, tokens) => {
        tokens.forEach((token) => {
            expect(PALETTE_ROLE_MAP[token].scale, token).toBe(scale);
            expect(PALETTE_ROLE_MAP[token].shiftFrom, token).toEqual([PALETTE_BASE_TONE]);
        });
    });

    it.each(Object.entries(SMALL))('elemento pequeno da %s: a semente exata nos dois modos', (scale, tokens) => {
        tokens.forEach((token) => {
            expect(PALETTE_ROLE_MAP[token].scale, token).toBe(scale);
            expect(PALETTE_ROLE_MAP[token].toneByMode, token).toEqual({ light: PALETTE_BASE_TONE, dark: PALETTE_BASE_TONE });
            expect(PALETTE_ROLE_MAP[token].shiftFrom, token).toBeUndefined();
        });
    });

    it('superfície grande continua tingida: secundária, em tom da escala, sem deslocamento', () => {
        SURFACE.forEach((token) => {
            expect(PALETTE_ROLE_MAP[token].scale, token).toBe('secondary');
            expect(PALETTE_ROLE_MAP[token].toneByMode.light, token).not.toBe(PALETTE_BASE_TONE);
            expect(PALETTE_ROLE_MAP[token].toneByMode.dark, token).not.toBe(PALETTE_BASE_TONE);
            expect(PALETTE_ROLE_MAP[token].shiftFrom, token).toBeUndefined();
        });
    });
});
