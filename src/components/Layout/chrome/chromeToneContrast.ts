import { GRADIENT_LIGHT_SHARE, CONTRASTING_ACTIVE_VEIL_SHARE } from '../../../core/Design/palette/contrast-pairs';
import { ON_COLOR_DARK, ON_COLOR_LIGHT, isLiteralColor, relativeLuminance } from '../../../core/Provider/utils/on-color';
import { parseToRgba } from '../../../core/Provider/utils/color-engine';
import type { NavigationBarTone } from '../../../core/Provider/useNavigationAppearance';

type Bar = 'sidebar' | 'topbar';
type Rgb = [number, number, number];
type Rgba = { r: number; g: number; b: number; a: number };
interface ContrastSurface { background: Rgb; minimum: number }

const TEXT_MINIMUM = 4.55;
const ICON_MINIMUM = 3;
/** O sair é ícone (3:1) com folga de arredondamento do navegador. */
const LOGOUT_MINIMUM = 3.05;
const LOGOUT_ERROR_TINT_SHARE = 0.15;
const STRIP_TINT_SHARE = 0.05;
const LANGUAGE_BUTTON_TINT_SHARE = 0.1;

const readColor = (value: unknown): Rgba | undefined => {
    if (!isLiteralColor(value)) return undefined;
    const color = parseToRgba(value);
    return [color.r, color.g, color.b, color.a].every(Number.isFinite) ? color : undefined;
};

const composite = (foreground: Rgba, background: Rgb): Rgb => [
    foreground.a * foreground.r + (1 - foreground.a) * background[0],
    foreground.a * foreground.g + (1 - foreground.a) * background[1],
    foreground.a * foreground.b + (1 - foreground.a) * background[2],
];

const contrastRatio = (foreground: Rgba, background: Rgb): number => {
    const [r, g, b] = composite(foreground, background);
    const foregroundLuminance = relativeLuminance(r, g, b);
    const backgroundLuminance = relativeLuminance(...background);
    const [lighter, darker] = [foregroundLuminance, backgroundLuminance].sort((first, second) => second - first);
    return (lighter + 0.05) / (darker + 0.05);
};

const mix = (first: Rgb, second: Rgb, share: number): Rgb => first.map((channel, index) =>
    channel * (1 - share) + second[index] * share,
) as Rgb;

const barStops = (bar: Bar, design: Record<string, unknown>): Rgb[] | undefined => {
    const declared = readColor(design[`${bar}Color`]);
    if (!declared) return undefined;
    const body = readColor(design.colorBgBody);
    const base = declared.a >= 0.999 || !body ? [declared.r, declared.g, declared.b] as Rgb : composite(declared, [body.r, body.g, body.b]);
    return design[`${bar}BackgroundStyle`] === 'gradient'
        ? [base, mix(base, [255, 255, 255], GRADIENT_LIGHT_SHARE)]
        : [base];
};

const withOpacityShare = (color: Rgba, share: number): Rgba => ({ ...color, a: color.a * share });

const formatColor = ({ r, g, b, a }: Rgba): string => {
    const channels = [r, g, b].map((channel) => Math.round(Math.max(0, Math.min(255, channel))));
    if (a >= 0.999) return `#${channels.map((channel) => channel.toString(16).padStart(2, '0')).join('')}`;
    return `rgba(${channels.join(', ')}, ${Number(a.toFixed(4))})`;
};

const blend = (source: Rgba, target: Rgba, share: number): Rgba => ({
    r: source.r * (1 - share) + target.r * share,
    g: source.g * (1 - share) + target.g * share,
    b: source.b * (1 - share) + target.b * share,
    a: source.a * (1 - share) + target.a * share,
});

const meetsSurfaces = (foreground: Rgba, surfaces: readonly ContrastSurface[]): boolean =>
    surfaces.every(({ background, minimum }) => contrastRatio(foreground, background) >= minimum);

const resolveSafeForeground = (source: Rgba, surfaces: readonly ContrastSurface[]): Rgba => {
    if (meetsSurfaces(source, surfaces)) return source;
    const targets = [readColor(ON_COLOR_DARK), readColor(ON_COLOR_LIGHT)].filter((color): color is Rgba => Boolean(color));
    let nearest: { color: Rgba; step: number } | undefined;
    targets.forEach((target) => {
        for (let step = 1; step <= 100; step += 1) {
            const candidate = blend(source, target, step / 100);
            if (!meetsSurfaces(candidate, surfaces)) continue;
            if (!nearest || step < nearest.step) nearest = { color: candidate, step };
            break;
        }
    });
    return nearest?.color ?? source;
};

/** Os fundos que o texto inativo também pisa: a faixa do usuário (tinta do marcador, 5%) na lateral e o botão de idioma (10% da própria cor) na topbar. */
const idleExtraBackgrounds = (bar: Bar, design: Record<string, unknown>, stops: readonly Rgb[], candidate: Rgba): Rgb[] => {
    if (bar === 'topbar') return stops.map((stop) => composite(withOpacityShare(candidate, LANGUAGE_BUTTON_TINT_SHARE), stop));
    const marker = readColor(design.navActiveMarkerColor) ?? readColor(design.primaryColor);
    return marker ? stops.map((stop) => composite(withOpacityShare(marker, STRIP_TINT_SHARE), stop)) : [];
};

const resolveIdleForeground = (
    source: Rgba,
    stops: readonly Rgb[],
    activeForeground: Rgba,
    activeSurfaces: readonly ContrastSurface[],
    extraBackgrounds: (candidate: Rgba) => readonly Rgb[] = () => [],
): Rgba => {
    const activeBackgrounds = stops.map((stop, index) => activeSurfaces[index]?.background ?? stop);
    const maximums = activeBackgrounds.map((background) => contrastRatio(activeForeground, background) - 0.05);
    const fits = (candidate: Rgba): boolean => stops.every((stop, index) => {
        const ratio = contrastRatio(candidate, stop);
        return ratio >= 4.5 && ratio <= maximums[index];
    }) && extraBackgrounds(candidate).every((background) => contrastRatio(candidate, background) >= TEXT_MINIMUM);
    if (fits(source)) return source;
    let nearest: { color: Rgba; step: number } | undefined;
    [ON_COLOR_DARK, ON_COLOR_LIGHT].forEach((value) => {
        const target = readColor(value);
        if (!target) return;
        for (let step = 1; step <= 100; step += 1) {
            const candidate = blend(source, target, step / 100);
            if (!fits(candidate)) continue;
            if (!nearest || step < nearest.step) nearest = { color: candidate, step };
            break;
        }
    });
    return nearest?.color ?? source;
};

const activeSurfaces = (
    bar: Bar,
    design: Record<string, unknown>,
    stops: readonly Rgb[],
    activeColor: Rgba | undefined,
    tone: NavigationBarTone,
): { surfaces: ContrastSurface[]; renderedActiveColor?: Rgba } => {
    const style = design[`${bar}ActiveItemStyle`];
    if (!activeColor || style === 'underline' || style === 'outline' || style === 'filled') return { surfaces: [] };
    const share = tone === 'primary' || tone === 'secondary' || tone === 'inverse'
        ? CONTRASTING_ACTIVE_VEIL_SHARE
        : 1;
    const renderedActiveColor = withOpacityShare(activeColor, share);
    const surfaces = stops.map((stop) => ({ background: composite(renderedActiveColor, stop), minimum: TEXT_MINIMUM }));
    return { surfaces, renderedActiveColor };
};

const additionalSurfaces = (bar: Bar, design: Record<string, unknown>, stops: readonly Rgb[], idle: Rgba | undefined): ContrastSurface[] => {
    const surfaces: ContrastSurface[] = [];
    if (bar === 'sidebar') {
        const marker = readColor(design.navActiveMarkerColor) ?? readColor(design.primaryColor);
        if (marker) stops.forEach((stop) => surfaces.push({
            background: composite(withOpacityShare(marker, STRIP_TINT_SHARE), stop),
            minimum: TEXT_MINIMUM,
        }));
    }
    if (bar === 'topbar') {
        if (idle) stops.forEach((stop) => surfaces.push({
            background: composite(withOpacityShare(idle, LANGUAGE_BUTTON_TINT_SHARE), stop),
            minimum: TEXT_MINIMUM,
        }));
    }
    return surfaces;
};

/** Onde o sair pousa: a parada da barra e, na lateral, também a faixa do usuário (tinta de 5% do marcador). */
const logoutBackgrounds = (bar: Bar, design: Record<string, unknown>, stops: readonly Rgb[]): Rgb[] => {
    if (bar === 'topbar') return [...stops];
    const marker = readColor(design.navActiveMarkerColor) ?? readColor(design.primaryColor);
    return marker ? [...stops, ...stops.map((stop) => composite(withOpacityShare(marker, STRIP_TINT_SHARE), stop))] : [...stops];
};

export interface ChromeToneContrastColors {
    strongTextColor?: string;
    idleTextColor?: string;
    activeBackgroundColor?: string;
    logoutTextColor?: string;
}

export const resolveChromeToneContrastColors = (
    tone: NavigationBarTone,
    bar: Bar,
    design?: Record<string, unknown>,
): ChromeToneContrastColors => {
    if (tone === 'neutral' || !design) return {};
    const stops = barStops(bar, design);
    const strong = readColor(design[`${bar}ItemHoverTextColor`]);
    if (!stops || !strong) return {};

    const active = activeSurfaces(
        bar,
        design,
        stops,
        readColor(design[`${bar}ActiveColor`]),
        tone,
    );
    const isContrasting = tone === 'primary' || tone === 'secondary' || tone === 'inverse';
    const declaredIdle = readColor(design[`${bar}ItemTextColor`]);
    // O texto inativo e o forte se apoiam um no outro: o botão de idioma tinge o fundo com a própria cor inativa, e o inativo precisa
    // ficar abaixo do forte no item ativo. Resolvem-se juntos, até estabilizar.
    let idleColor = declaredIdle;
    let safeStrong = strong;
    for (let round = 0; round < 4; round += 1) {
        const surfaces = [
            ...stops.map((background) => ({ background, minimum: TEXT_MINIMUM })),
            ...active.surfaces,
            ...additionalSurfaces(bar, design, stops, idleColor),
        ];
        safeStrong = resolveSafeForeground(strong, surfaces);
        if (!declaredIdle || !isContrasting) break;
        const nextIdle = resolveIdleForeground(
            declaredIdle,
            stops,
            safeStrong,
            active.surfaces,
            (candidate) => idleExtraBackgrounds(bar, design, stops, candidate),
        );
        if (idleColor && formatColor(nextIdle) === formatColor(idleColor)) break;
        idleColor = nextIdle;
    }
    const idleTextColor = declaredIdle && isContrasting && idleColor ? formatColor(idleColor) : undefined;
    const strongTextColor = formatColor(safeStrong);
    const error = readColor(design.statusErrorColor);
    const logoutSurfaces = error ? logoutBackgrounds(bar, design, stops).flatMap((background) => [
        { background, minimum: LOGOUT_MINIMUM },
        { background: composite(withOpacityShare(error, LOGOUT_ERROR_TINT_SHARE), background), minimum: LOGOUT_MINIMUM },
    ]) : [];
    return {
        strongTextColor,
        ...(idleTextColor ? { idleTextColor } : {}),
        ...(error && logoutSurfaces.length > 0
            ? { logoutTextColor: formatColor(resolveSafeForeground(error, logoutSurfaces)) }
            : {}),
        ...(active.renderedActiveColor ? { activeBackgroundColor: formatColor(active.renderedActiveColor) } : {}),
    };
};
