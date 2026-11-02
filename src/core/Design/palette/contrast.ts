import { parseToRgba } from '../../Provider/utils/color-engine';
import { pickOnColor } from '../../Provider/utils/on-color';
import { rgbToHex } from './color-space';
import { MIX_SOURCE_SHARE, type ContrastPair } from './contrast-pairs';
import { findMinimalShift, SHIFT_CONTRAST_GUARD, type ShiftResult } from './contrast-shift';
import { PALETTE_LIGHTNESS_SCALE } from './scale';
import { DEFAULT_PALETTE_PLAN, type PalettePlan } from './tone-plan';
import type { PaletteColorRole, SarakPaletteMode, PaletteScales, RgbColor } from './types';

const MAX_CONTRAST_PASSES = 12;

type RgbChannels = [number, number, number];
type PaletteColors = Record<string, string>;
type CandidateSearch = {
    tokenId: string;
    role: PaletteColorRole;
    pairs: readonly ContrastPair[];
    colors: PaletteColors;
    scales: PaletteScales;
    mode: SarakPaletteMode;
};
type ContrastCandidate = { tone: number; failedPairs: number; minimumRatio: number; distanceFromDefault: number };

const compositeOver = (foreground: ReturnType<typeof parseToRgba>, background: RgbChannels): RgbChannels => [
    foreground.a * foreground.r + (1 - foreground.a) * background[0],
    foreground.a * foreground.g + (1 - foreground.a) * background[1],
    foreground.a * foreground.b + (1 - foreground.a) * background[2],
];

const relativeLuminance = ([red, green, blue]: RgbChannels): number => {
    const channel = (value: number): number => {
        const linear = value / 255;
        return linear <= 0.03928 ? linear / 12.92 : ((linear + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * channel(red) + 0.7152 * channel(green) + 0.0722 * channel(blue);
};

const contrastRatio = (first: RgbChannels, second: RgbChannels): number => {
    const luminances = [relativeLuminance(first), relativeLuminance(second)].sort((left, right) => right - left);
    return (luminances[0] + 0.05) / (luminances[1] + 0.05);
};

const resolveBackground = (chain: readonly string[], colors: PaletteColors): RgbChannels | undefined => {
    if (chain.length === 0) return undefined;
    const lastToken = chain[chain.length - 1];
    const base = parseToRgba(colors[lastToken]);
    if (base.a < 0.999) return undefined;
    let background: RgbChannels = [base.r, base.g, base.b];
    for (let index = chain.length - 2; index >= 0; index -= 1) {
        const [tokenId, tint] = chain[index].split('@');
        const color = parseToRgba(colors[tokenId]);
        const opacity = tint === undefined ? color.a : color.a * Number(tint);
        background = compositeOver({ ...color, a: opacity }, background);
    }
    return background;
};

const getOnColorChannels = (background: RgbChannels): RgbChannels => {
    const value = `rgb(${background.map(Math.round).join(', ')})`;
    const onColor = parseToRgba(pickOnColor(value));
    return [onColor.r, onColor.g, onColor.b];
};

const getPairContrastRatio = (pair: ContrastPair, colors: PaletteColors): number | undefined => {
    const background = resolveBackground(pair.bgChain, colors);
    if (!background) return undefined;
    if (pair.fg.startsWith('on:')) return contrastRatio(getOnColorChannels(background), background);

    const isMixedText = pair.fg.startsWith('mix:');
    const tokenId = pair.fg.replace(/^(mix:)/, '');
    const foreground = parseToRgba(colors[tokenId]);
    const foregroundChannels = foreground.a >= 0.999
        ? [foreground.r, foreground.g, foreground.b] as RgbChannels
        : compositeOver(foreground, background);
    if (!isMixedText) return contrastRatio(foregroundChannels, background);

    const body = resolveBackground(['colorBgBody'], colors);
    if (!body) return undefined;
    const onSurface = getOnColorChannels(body);
    const mixed = foregroundChannels.map((channel, index) =>
        MIX_SOURCE_SHARE * channel + (1 - MIX_SOURCE_SHARE) * onSurface[index],
    ) as RgbChannels;
    return contrastRatio(mixed, background);
};

const getAdjustableTokenId = (foreground: string): string | undefined => {
    if (foreground.startsWith('on:')) return undefined;
    return foreground.replace(/^(mix:)/, '');
};

const formatPaletteColor = (rgb: RgbColor, alpha?: number): string => {
    if (alpha === undefined) return rgbToHex(rgb);
    const channels = [rgb.red, rgb.green, rgb.blue].map((channel) => Math.round(channel));
    return `rgba(${channels.join(', ')}, ${Number(alpha.toFixed(3))})`;
};

const scoreColor = (color: string, search: CandidateSearch, guard: number = 0): { failedPairs: number; minimumRatio: number } => {
    const candidateColors = { ...search.colors, [search.tokenId]: color };
    const ratios = search.pairs.map((pair) => getPairContrastRatio(pair, candidateColors));
    const resolvedRatios = ratios.filter((ratio): ratio is number => ratio !== undefined);
    return {
        failedPairs: ratios.filter((ratio, index) => ratio === undefined || ratio < search.pairs[index].min + guard).length,
        minimumRatio: resolvedRatios.length ? Math.min(...resolvedRatios) : 0,
    };
};

const evaluateCandidate = (
    tone: number,
    search: CandidateSearch,
): ContrastCandidate => {
    const { role, scales, mode } = search;
    return {
        tone,
        ...scoreColor(formatPaletteColor(scales[role.scale][tone], role.alpha), search),
        distanceFromDefault: Math.abs(tone - role.toneByMode[mode]),
    };
};

const chooseContrastTone = (
    search: CandidateSearch,
): number => {
    const candidates = PALETTE_LIGHTNESS_SCALE.map(({ tone }) =>
        evaluateCandidate(tone, search),
    );
    candidates.sort((first, second) => {
        if (first.failedPairs !== second.failedPairs) return first.failedPairs - second.failedPairs;
        if (first.failedPairs > 0) return second.minimumRatio - first.minimumRatio
            || first.distanceFromDefault - second.distanceFromDefault;
        return first.distanceFromDefault - second.distanceFromDefault
            || second.minimumRatio - first.minimumRatio;
    });
    return candidates[0].tone;
};

/** Texto da marca: parte da cor da escala e anda o mínimo de luminosidade que os pares pedem; vence a origem que anda menos. */
const chooseShiftedColor = (search: CandidateSearch): string => {
    const { role, scales } = search;
    const results: ShiftResult[] = (role.shiftFrom ?? []).map((tone) => findMinimalShift(
        scales[role.scale][tone],
        (color) => scoreColor(formatPaletteColor(color, role.alpha), search, SHIFT_CONTRAST_GUARD),
    ));
    const best = results.reduce((left, right) => {
        if (left.failedPairs !== right.failedPairs) return left.failedPairs < right.failedPairs ? left : right;
        return right.shift < left.shift ? right : left;
    });
    return formatPaletteColor(best.color, role.alpha);
};

const chooseTokenColor = (search: CandidateSearch): string => search.role.shiftFrom
    ? chooseShiftedColor(search)
    : formatPaletteColor(search.scales[search.role.scale][chooseContrastTone(search)], search.role.alpha);

const getTextTokenIds = (plan: PalettePlan): string[] => [...new Set(plan.pairs
    .map((pair) => getAdjustableTokenId(pair.fg))
    .filter((tokenId): tokenId is string => tokenId !== undefined && tokenId in plan.roles))];

const correctTokenTones = (
    colors: PaletteColors,
    scales: PaletteScales,
    mode: SarakPaletteMode,
    tokenIds: readonly string[],
    plan: PalettePlan,
): PaletteColors => {
    const corrected = { ...colors };
    for (let pass = 0; pass < MAX_CONTRAST_PASSES; pass += 1) {
        let changed = false;
        tokenIds.forEach((tokenId) => {
            const pairs = plan.pairs.filter((pair) => getAdjustableTokenId(pair.fg) === tokenId);
            const role = plan.roles[tokenId];
            const search = { tokenId, pairs, role, colors: corrected, scales, mode };
            const color = chooseTokenColor(search);
            if (corrected[tokenId] === color) return;
            corrected[tokenId] = color;
            changed = true;
        });
        if (!changed) break;
    }
    return corrected;
};

export const correctPaletteContrast = (
    colors: PaletteColors,
    scales: PaletteScales,
    mode: SarakPaletteMode,
    plan: PalettePlan = DEFAULT_PALETTE_PLAN,
): PaletteColors => correctTokenTones(colors, scales, mode, getTextTokenIds(plan), plan);

const COLOR_LITERAL = /^(#[0-9a-f]{3,8}|rgba?\()/i;

const pickDeclaredColors = (palette: PaletteColors, declared: Record<string, unknown>, plan: PalettePlan): PaletteColors =>
    Object.fromEntries(Object.entries(declared).filter(([tokenId, value]) =>
        tokenId in plan.roles && typeof value === 'string' && COLOR_LITERAL.test(value) && value !== palette[tokenId],
    )) as PaletteColors;

/**
 * Re-corrige o texto que a paleta calcula contra o fundo EFETIVO: o que o host ou o tema declara por cima
 * dela. A paleta só enxerga os fundos que ela mesma gera; uma barra escura num tema claro deixaria o texto
 * dela ilegível. O texto que o host ou o tema declarou também não é tocado.
 */
export const correctPaletteAgainstDeclared = (
    palette: PaletteColors,
    scales: PaletteScales,
    mode: SarakPaletteMode,
    declared: Record<string, unknown>,
    plan: PalettePlan = DEFAULT_PALETTE_PLAN,
): PaletteColors => {
    const overrides = pickDeclaredColors(palette, declared, plan);
    if (Object.keys(overrides).length === 0) return palette;
    const effective = { ...palette, ...overrides };
    const failing = getTextTokenIds(plan).filter((tokenId) => !(tokenId in declared) && plan.pairs.some((pair) => {
        if (getAdjustableTokenId(pair.fg) !== tokenId) return false;
        const ratio = getPairContrastRatio(pair, effective);
        return ratio !== undefined && ratio < pair.min;
    }));
    if (failing.length === 0) return palette;
    const corrected = correctTokenTones(effective, scales, mode, failing, plan);
    return { ...palette, ...Object.fromEntries(failing.map((tokenId) => [tokenId, corrected[tokenId]])) };
};
