import fs from 'node:fs';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { buildHarness } from './build-harness.mjs';
import { GRADIENT_LIGHT_SHARE } from '../src/core/Design/palette/contrast-pairs';

const ENTRY = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures', 'plan-145-entry.tsx');
const MODES = ['light', 'dark'] as const;
const TONES = ['inverse', 'primary', 'secondary'] as const;
const TEXT_MIN = 4.5;
const ICON_MIN = 3;
const GRADIENT_THEMES = [
    ['nebula-space', 'topbar'],
    ['cyberpunk-neon', 'topbar'],
    ['corporate-ledger', 'topbar'],
    ['industrial-terminal', 'sidebar'],
] as const;

let harnessDirectory: string;
let harnessUrl: string;

test.beforeAll(async () => {
    const fixture = fs.readFileSync(ENTRY, 'utf8');
    const original = 'const composed = composeThemeForMode({ design: theme.design as Record<string, SarakTokenValue>, contraparte: theme.contraparte }, mode) as unknown as Record<string, unknown>;';
    const replacement = [
        "const tone = params.get('tone');",
        "const toneKey = params.get('bar') === 'topbar' ? 'topbarTone' : 'sidebarTone';",
        'const themeDesign = { ...theme.design, ...(tone ? { [toneKey]: tone } : {}) };',
        'const composed = composeThemeForMode({ design: themeDesign as Record<string, SarakTokenValue>, contraparte: theme.contraparte }, mode) as unknown as Record<string, unknown>;',
    ].join('\n    ');
    if (!fixture.includes(original)) throw new Error('A fixture-base não contém o ponto de composição esperado.');
    const temporaryEntry = path.join(path.dirname(ENTRY), 'plan-170-harness-entry.tsx');
    fs.writeFileSync(temporaryEntry, fixture.replace(original, replacement), 'utf8');
    try {
        const harness = await buildHarness(temporaryEntry);
        harnessDirectory = harness.outDir;
        harnessUrl = pathToFileURL(harness.htmlPath).href;
    } finally {
        fs.rmSync(temporaryEntry, { force: true });
    }
});

test.afterAll(() => {
    if (harnessDirectory) fs.rmSync(harnessDirectory, { recursive: true, force: true });
});

interface PieceRatios {
    brand: number | null;
    idle: number | null;
    active: number | null;
    name: number | null;
    avatar: number | null;
    language: number | null;
    gear: number | null;
    logout: number | null;
    activePillIndicator: number | null;
}

interface Measurement {
    theme: string;
    bar: 'sidebar' | 'topbar';
    tone: string;
    mode: 'light' | 'dark';
    stop: 'base' | 'light';
    ratios: PieceRatios;
    activeVeilDarkensLightStop: boolean | null;
}

type MeasurementScene = Pick<Measurement, 'theme' | 'bar' | 'tone' | 'mode'>;

async function open(page: Page, url: string): Promise<void> {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(url);
    await expect(page.getByTestId('content')).toBeVisible();
    await page.waitForFunction(() => getComputedStyle(document.documentElement).getPropertyValue('--sarak-topbar-bg').trim() !== '');
}

function sceneUrl(themeId: string, bar: 'sidebar' | 'topbar', tone: typeof TONES[number], mode: typeof MODES[number]): string {
    return `${harnessUrl}?${new URLSearchParams({
        theme: themeId,
        mode,
        bar,
        tone,
        route: bar === 'topbar' ? '#fiscal' : '#vendas/pedidos',
    })}`;
}

function measure(page: Page, scene: MeasurementScene): Promise<Measurement[]> {
    return page.evaluate(measureInBrowser, { ...scene, lightShare: GRADIENT_LIGHT_SHARE });
}

function measureInBrowser({ theme, bar, tone, mode, lightShare }: MeasurementScene & { lightShare: number }): Measurement[] {
    const context = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
    if (!context) throw new Error('Canvas indisponível para medir contraste.');
    const parse = (value: string): number[] => { context.clearRect(0, 0, 1, 1); context.fillStyle = value; context.fillRect(0, 0, 1, 1); const [r, g, b, a] = context.getImageData(0, 0, 1, 1).data; return [r, g, b, a / 255]; };
    const linear = (value: number): number => { const channel = value / 255; return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4; };
    const luminance = ([r, g, b]: number[]): number => 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
    const ratio = (first: number[], second: number[]): number => { const [high, low] = [luminance(first), luminance(second)].sort((a, b) => b - a); return (high + 0.05) / (low + 0.05); };
    const over = (top: number[], bottom: number[]): number[] => top.slice(0, 3).map((channel, index) => channel * top[3] + bottom[index] * (1 - top[3]));
    const element = document.querySelector(bar === 'sidebar' ? 'aside' : 'header') as HTMLElement | null;
    if (!element || !getComputedStyle(element).backgroundImage.includes('linear-gradient')) throw new Error(`Barra sem degradê: ${bar}`);
    const body = parse(getComputedStyle(document.body).backgroundColor);
    const declared = parse(getComputedStyle(document.documentElement).getPropertyValue(`--sarak-${bar}-bg`).trim());
    const base = declared[3] === 1 ? declared : over(declared, body);
    const light = base.slice(0, 3).map((channel) => channel * (1 - lightShare) + 255 * lightShare);
    const behind = (node: Element, stop: number[]): number[] => {
        const chain: Element[] = [];
        for (let current: Element | null = node; current && current !== element; current = current.parentElement) chain.unshift(current);
        return chain.reduce((lower, item) => { const paint = parse(getComputedStyle(item).backgroundColor); return paint[3] ? over(paint, lower) : lower; }, stop.slice(0, 3));
    };
    const against = (node: Element | null, stop: number[]): number | null => node ? ratio(parse(getComputedStyle(node).color), behind(node, stop)) : null;
    const byText = (text: string): Element | null => [...element.querySelectorAll('*')].find((node) => node.children.length === 0 && node.textContent?.trim().toUpperCase() === text.toUpperCase()) ?? null;
    const nodes: Record<keyof PieceRatios, Element | null> = {
        brand: element.querySelector('.sarak-chrome-brand span'), idle: element.querySelector('a[href="#home"]'), active: element.querySelector('[aria-current="page"]'),
        name: byText('Ana'), avatar: byText('A') ?? element.querySelector('[data-sarak-user-strip] [aria-hidden="true"] svg, [data-sarak-widget="user-theme"] div[aria-hidden="true"] svg'),
        language: byText('PT'), gear: element.querySelector('[data-sarak-widget="preferences-menu"] button svg, [data-sarak-widget="preferences-menu"] button'),
        logout: [...element.querySelectorAll('[data-sarak-widget="user-theme"] button')].find((node) => node.querySelector('svg')) ?? null,
        activePillIndicator: element.querySelector('[aria-current="page"]'),
    };
    const active = nodes.activePillIndicator as HTMLElement | null;
    return [{ stop: 'base' as const, color: base }, { stop: 'light' as const, color: light }].map(({ stop, color }) => ({
        theme,
        bar,
        tone,
        mode,
        stop,
        ratios: {
            ...Object.fromEntries(Object.entries(nodes).filter(([piece]) => piece !== 'activePillIndicator').map(([piece, node]) => [piece, against(node, color)])),
            activePillIndicator: active ? (() => {
                const outline = getComputedStyle(active);
                const outlineColor = parse(outline.outlineColor);
                return outline.outlineStyle !== 'none' && Number.parseFloat(outline.outlineWidth) > 0 && outlineColor[3] > 0
                    ? ratio(over(outlineColor, color), color)
                    : null;
            })() : null,
        } as PieceRatios,
        activeVeilDarkensLightStop: stop === 'light' && active
            ? (() => {
                const outline = getComputedStyle(active);
                const veil = parse(outline.backgroundColor);
                const parent = active.parentElement;
                const underlying = parent ? behind(parent, color) : color;
                const rendered = over(veil, underlying);
                return outline.outlineStyle !== 'none' && Number.parseFloat(outline.outlineWidth) > 0 && parse(outline.outlineColor)[3] > 0
                    ? luminance(rendered) < luminance(color)
                    : null;
            })()
            : null,
    }));
}

test('barras contrastantes em degradê: cada peça passa nas duas paradas e ativo não perde para inativo', async ({ page }) => {
    test.setTimeout(900_000);
    const results: Measurement[] = [];
    for (const [theme, bar] of GRADIENT_THEMES) {
        for (const tone of TONES) {
            for (const mode of MODES) {
                const scene = { theme, bar, tone, mode };
                await open(page, sceneUrl(theme, bar, tone, mode));
                results.push(...await measure(page, scene));
            }
        }
    }
    const minima: Record<keyof PieceRatios, number> = {
        brand: TEXT_MIN, idle: TEXT_MIN, active: TEXT_MIN, name: TEXT_MIN,
        avatar: ICON_MIN, language: TEXT_MIN, gear: ICON_MIN, logout: ICON_MIN, activePillIndicator: ICON_MIN,
    };
    const below = results.flatMap((row) => Object.entries(row.ratios)
        .filter(([piece, value]) => value !== null && value < minima[piece as keyof PieceRatios])
        .map(([piece, value]) => ({ ...row, piece, ratio: Number(value?.toFixed(4)), minimum: minima[piece as keyof PieceRatios] })));
    const activeBelowIdle = results.filter((row) => row.ratios.active !== null && row.ratios.idle !== null && row.ratios.active + 1e-9 < row.ratios.idle)
        .map((row) => ({ ...row, active: Number(row.ratios.active?.toFixed(4)), idle: Number(row.ratios.idle?.toFixed(4)) }));
    const pillRows = results.filter((row) => row.ratios.activePillIndicator !== null);
    const pillLightRows = results.filter((row) => row.activeVeilDarkensLightStop !== null);
    const pillVeilDirectionFailures = pillLightRows.filter((row) => row.activeVeilDarkensLightStop !== true);
    console.log(`CHROME_BAR_CONTRAST_MEASUREMENTS ${JSON.stringify({ scenarios: results.length / 2, stops: results.length, below, activeBelowIdle, activePillIndicators: pillRows.length, pillVeilDirectionFailures })}`);
    expect(results).toHaveLength(GRADIENT_THEMES.length * TONES.length * MODES.length * 2);
    expect(results.every((row) => Object.entries(row.ratios).filter(([piece]) => piece !== 'activePillIndicator').every(([, value]) => value !== null && Number.isFinite(value)))).toBe(true);
    expect(below, 'Cada peça precisa alcançar 4,5:1 (texto) ou 3:1 (ícone) nas duas paradas.').toEqual([]);
    expect(activeBelowIdle, 'O texto ativo não pode ficar abaixo do item inativo em nenhuma parada.').toEqual([]);
    expect(pillRows.length, 'Cada cena de pílula ativa precisa expor o indicador não textual nas duas paradas.').toBeGreaterThan(0);
    expect(pillLightRows.length, 'Cada cena de pílula ativa precisa medir o véu na parada clara.').toBe(pillRows.length / 2);
    expect(pillVeilDirectionFailures, 'O véu da pílula ativa deve escurecer a parada clara.').toEqual([]);
});
