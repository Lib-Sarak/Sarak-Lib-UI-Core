import { useMemo } from 'react';
import { useSarakUI } from '../../../../core/Provider/SarakUIProvider';
import { parseToRgba } from '../../../../core/Provider/utils/color-engine';
import { CHART_STATUS_TOKENS } from './builders/types';
import type { ChartStatusToken } from './builders/types';
import { deriveCategoricalPalette } from './categoricalPalette';
import type { PaletteMode } from './categoricalPalette';
import { rgbToHex } from './oklch';

const CHART_THEME_FALLBACK_COLOR = '#3b82f6';
const SURFACE_FALLBACK: Record<PaletteMode, string> = { light: '#fcfcfb', dark: '#1a1a19' };
const RGB_CHANNEL_MAX = 255;
const DEFAULT_CHART_GRID_OPACITY = 0.05;
const DEFAULT_CHART_THICKNESS = 2;
const DEFAULT_CHART_FONT_SIZE = 11;
const DEFAULT_CHART_SMALL_GAP = 12;
const DEFAULT_CHART_MEDIUM_GAP = 24;
const DEFAULT_ANIMATION_DURATION = 2500;

type ResolvedDesign = ReturnType<typeof useSarakUI>['design'];

interface ChartThemeSettings extends Omit<EChartsTheme, 'baseOption'> {
    gridMargin: number;
    tooltipPadding: number[];
}

export interface EChartsBaseOption extends Record<string, unknown> {
    color: string[];
    aria: { enabled: boolean; decal: { show: boolean } };
    tooltip: Record<string, unknown>;
    grid: Record<string, unknown>;
    animation: boolean;
    animationDuration: number;
    animationEasing: string;
}

export interface EChartsTheme {
    baseOption: EChartsBaseOption;
    palette: string[];
    /** Cores de estado, FORA da paleta: só semântica de alta/baixa ou escolha explícita da série. */
    statusColors: Record<ChartStatusToken, string>;
    primaryColor: string;
    secondaryColor: string;
    textColor: string;
    titleColor: string;
    borderColor: string;
    borderWidth: number;
    borderRadius: number;
    surfaceColor: string;
    bodyFont: string;
    headingFont: string;
    fontSize: number;
    axisLabelMargin: number;
    chartGridOpacity: number;
    chartShowGrid: boolean;
    chartTooltipBg: string;
    chartType: string;
    chartThickness: number;
    chartSmoothing: boolean;
}

function resolveDesignNumber(value: unknown, fallback: number): number {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value !== 'object' || value === null) return fallback;
    const responsiveValue = value as Record<string, unknown>;
    const preferredValue = responsiveValue.desk ?? responsiveValue.tab ?? responsiveValue.mob;
    return typeof preferredValue === 'number' && Number.isFinite(preferredValue) ? preferredValue : fallback;
}

function resolveDesignColor(value: unknown): string {
    return typeof value === 'string' && value.trim() ? value : CHART_THEME_FALLBACK_COLOR;
}

/** Qualquer cor CSS opaca que o motor sabe ler → `#rrggbb`. */
function toHex(value: unknown): string {
    const color = resolveDesignColor(value);
    const parseable = /^(#|rgb|hsl)/i.test(color.trim());
    const { r, g, b } = parseToRgba(parseable ? color : CHART_THEME_FALLBACK_COLOR);
    return rgbToHex([r / RGB_CHANNEL_MAX, g / RGB_CHANNEL_MAX, b / RGB_CHANNEL_MAX]);
}

function resolvePalette(design: ResolvedDesign): string[] {
    const mode: PaletteMode = design.mode === 'light' ? 'light' : 'dark';
    const surface = design.colorBgBody ? toHex(design.colorBgBody) : SURFACE_FALLBACK[mode];
    return deriveCategoricalPalette({
        brand: [design.chartColorPalette, design.secondaryColor, design.accentColor, design.tertiaryColor].map(toHex),
        mode,
        surface,
    });
}

function resolveStatusColors(design: ResolvedDesign): Record<ChartStatusToken, string> {
    const entries = CHART_STATUS_TOKENS.map((token) => [token, resolveDesignColor(design[token])] as const);
    return Object.fromEntries(entries) as Record<ChartStatusToken, string>;
}

function resolveThemeSettings(design: ResolvedDesign): ChartThemeSettings {
    const palette = resolvePalette(design);
    const smallGap = resolveDesignNumber(design.layoutGapSm, DEFAULT_CHART_SMALL_GAP);
    const mediumGap = resolveDesignNumber(design.layoutGapMd, DEFAULT_CHART_MEDIUM_GAP);
    const bodyFont = design.bodyFont || 'Inter';
    return {
        palette,
        statusColors: resolveStatusColors(design),
        primaryColor: palette[0],
        secondaryColor: palette[1],
        textColor: resolveDesignColor(design.textColorSecondary),
        titleColor: resolveDesignColor(design.textColorMaster),
        borderColor: resolveDesignColor(design.cardBorderColor),
        borderWidth: resolveDesignNumber(design.borderWidth, 1),
        borderRadius: resolveDesignNumber(design.borderRadius, smallGap),
        surfaceColor: resolveDesignColor(design.colorBgBody),
        bodyFont,
        headingFont: design.headingFont || bodyFont,
        fontSize: resolveDesignNumber(design.typeScaleXs, DEFAULT_CHART_FONT_SIZE),
        axisLabelMargin: smallGap,
        chartGridOpacity: resolveDesignNumber(design.chartGridOpacity, DEFAULT_CHART_GRID_OPACITY),
        chartShowGrid: design.chartShowGrid ?? true,
        chartTooltipBg: resolveDesignColor(design.chartTooltipBg),
        chartType: design.chartType ?? 'line',
        chartThickness: resolveDesignNumber(design.chartThickness, DEFAULT_CHART_THICKNESS),
        chartSmoothing: design.chartSmoothing ?? true,
        gridMargin: mediumGap,
        tooltipPadding: [smallGap, mediumGap],
    };
}

function buildBaseOption(theme: ChartThemeSettings): EChartsBaseOption {
    return {
        backgroundColor: 'transparent',
        color: theme.palette,
        aria: { enabled: true, decal: { show: true } },
        tooltip: {
            backgroundColor: theme.chartTooltipBg,
            borderColor: theme.borderColor,
            borderWidth: theme.borderWidth,
            borderRadius: theme.borderRadius,
            textStyle: { color: theme.titleColor, fontSize: theme.fontSize, fontFamily: theme.bodyFont },
            padding: theme.tooltipPadding,
        },
        grid: {
            top: theme.gridMargin * 2,
            bottom: theme.gridMargin * 2,
            left: theme.gridMargin,
            right: theme.gridMargin,
            containLabel: true,
        },
        animation: true,
        animationDuration: DEFAULT_ANIMATION_DURATION,
        animationEasing: 'elasticOut',
    };
}

export const useEChartsTheme = (): EChartsTheme => {
    const { design } = useSarakUI();
    const settings = useMemo(() => resolveThemeSettings(design), [design]);
    const baseOption = useMemo(() => buildBaseOption(settings), [settings]);
    return useMemo(() => ({ ...settings, baseOption }), [settings, baseOption]);
};
