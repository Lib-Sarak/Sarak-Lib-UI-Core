import { describe, expect, it } from 'vitest';
import { SARAK_ALL_THEMES } from '../all';
import type { SarakThemePreset } from '../index';
import { FLUID_MAX_CONTENT_WIDTH_OPTION } from '../../../schema/system';

interface ThemeSetCoverage {
    cardTextures: number;
    headingFonts: number;
    iconFamilies: number;
    iconWeights: number;
    gradientModes: number;
    duplicateCombinations: string[];
}

const distinctDesignValues = (themes: readonly SarakThemePreset[], key: string): number =>
    new Set(themes
        .map((theme) => theme.design[key])
        .filter((value): value is string => typeof value === 'string'))
        .size;

function measureThemeSet(themes: readonly SarakThemePreset[]): ThemeSetCoverage {
    const combinationOwners = new Map<string, string>();
    const duplicateCombinations: string[] = [];

    for (const theme of themes) {
        const combination = JSON.stringify([
            theme.design.cardTextureType,
            theme.design.btnStyleType,
            theme.design.headingFont,
        ]);
        const existingOwner = combinationOwners.get(combination);
        if (existingOwner) duplicateCombinations.push(`${existingOwner} × ${theme.id}`);
        else combinationOwners.set(combination, theme.id);
    }

    return {
        cardTextures: distinctDesignValues(themes, 'cardTextureType'),
        headingFonts: distinctDesignValues(themes, 'headingFont'),
        iconFamilies: distinctDesignValues(themes, 'iconFamily'),
        iconWeights: distinctDesignValues(themes, 'iconWeight'),
        gradientModes: distinctDesignValues(themes, 'bgGradientMode'),
        duplicateCombinations,
    };
}

function hasRequiredCoverage(coverage: ThemeSetCoverage): boolean {
    return coverage.cardTextures >= 15
        && coverage.headingFonts >= 10
        && coverage.iconFamilies >= 3
        && coverage.iconWeights >= 4
        && coverage.gradientModes >= 4
        && coverage.duplicateCombinations.length === 0;
}

describe('cobertura do conjunto de temas embarcados', () => {
    it('declara a opção fluida de largura em todos os temas', () => {
        expect(SARAK_ALL_THEMES.length).toBe(19);
        expect(SARAK_ALL_THEMES.every((theme) => theme.design.maxContentWidth === FLUID_MAX_CONTENT_WIDTH_OPTION)).toBe(true);
    });

    it('mantém diversidade estética no conjunto inteiro', () => {
        const coverage = measureThemeSet(SARAK_ALL_THEMES);

        expect(coverage.cardTextures).toBeGreaterThanOrEqual(15);
        expect(coverage.headingFonts).toBeGreaterThanOrEqual(10);
        expect(coverage.iconFamilies).toBeGreaterThanOrEqual(3);
        expect(coverage.iconWeights).toBeGreaterThanOrEqual(4);
        expect(coverage.gradientModes).toBeGreaterThanOrEqual(4);
        expect(coverage.duplicateCombinations).toEqual([]);
        expect(hasRequiredCoverage(coverage)).toBe(true);
    });

    it('a mutação de um tema para repetir a combinação de outro é detectada', () => {
        const [firstTheme, secondTheme] = SARAK_ALL_THEMES;
        const mutatedTheme: SarakThemePreset = {
            ...secondTheme,
            design: {
                ...secondTheme.design,
                cardTextureType: firstTheme.design.cardTextureType,
                btnStyleType: firstTheme.design.btnStyleType,
                headingFont: firstTheme.design.headingFont,
            },
        };
        const mutatedThemes = SARAK_ALL_THEMES.map((theme) =>
            theme.id === mutatedTheme.id ? mutatedTheme : theme,
        );
        const coverage = measureThemeSet(mutatedThemes);

        expect(coverage.duplicateCombinations).toContain(`${firstTheme.id} × ${secondTheme.id}`);
        expect(hasRequiredCoverage(coverage)).toBe(false);
    });
});
