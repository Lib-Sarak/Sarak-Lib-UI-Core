import { describe, expect, it } from 'vitest';
import { SARAK_ALL_THEMES } from '../all';
import { composeThemeForMode } from '../compose';
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

    it('declara cores hierárquicas acessíveis no tema e em cada contraparte', () => {
        const roles = ['titleColor', 'subtitleColor', 'emphasisColor', 'cardTitleColor'] as const;

        SARAK_ALL_THEMES.forEach((theme) => {
            // o design composto de cada modo: a hierarquia vem da paleta, que o tema não declara
            (['light', 'dark'] as const).map((mode) => composeThemeForMode(theme as never, mode) as unknown as Record<string, unknown>).forEach((design, index) => {
                expect(design, `${theme.id} modo ${index}`).toBeDefined();
                roles.forEach((role) => {
                    expect(typeof design?.[role], `${theme.id}.${role} modo ${index}`).toBe('string');
                    expect(design?.[role], `${theme.id}.${role} não pode repetir textColorMaster no modo ${index}`)
                        .not.toBe(design?.textColorMaster);
                });
            });
        });
    });

    it('mantém o tamanho do título de cartão abaixo do h2 da página em cada breakpoint', () => {
        const breakpoints = ['mob', 'tab', 'desk'] as const;
        const sizeAt = (value: unknown, breakpoint: typeof breakpoints[number]): number | undefined => {
            if (typeof value === 'number') return value;
            if (typeof value !== 'object' || value === null) return undefined;
            const size = (value as Record<string, unknown>)[breakpoint];
            return typeof size === 'number' ? size : undefined;
        };

        SARAK_ALL_THEMES.forEach((theme) => {
            breakpoints.forEach((breakpoint) => {
                const cardTitleSize = sizeAt(theme.design.cardTitleFontSize, breakpoint);
                const pageTitleSize = sizeAt(theme.design.h2Size, breakpoint);
                expect(cardTitleSize, `${theme.id}.cardTitleFontSize.${breakpoint}`).toBeDefined();
                expect(pageTitleSize, `${theme.id}.h2Size.${breakpoint}`).toBeDefined();
                expect(cardTitleSize).toBeLessThan(pageTitleSize!);
            });
        });
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
