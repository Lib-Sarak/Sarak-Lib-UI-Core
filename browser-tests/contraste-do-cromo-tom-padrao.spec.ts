import fs from 'node:fs';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { buildHarness } from './build-harness.mjs';
import { GRADIENT_LIGHT_SHARE } from '../src/core/Design/palette/contrast-pairs';

const ENTRY = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures', 'personalidades-legiveis-entry.tsx');
const MODES = ['light', 'dark'] as const;
const BARS = ['sidebar', 'topbar'] as const;
const TEXT_MIN = 4.5;
const ICON_MIN = 3;
const ROLE_LABEL = 'Gerente';
const TITLE_LABEL = 'Título do cartão';

let harnessDirectory: string;
let harnessUrl: string;

test.beforeAll(async () => {
    // A fixture-base compõe o tema por `composeThemeForMode`, que não passa pelo caminho de modo do Provider. A cópia temporária monta
    // como o importador (`initialTheme` + `defaultColorMode`, `config` sem cor) e dá um cargo ao usuário.
    const fixture = fs.readFileSync(ENTRY, 'utf8');
    const provider = '<SarakUIProvider config={sceneDesign()}>';
    const user = "user={{ name: 'Ana' }}";
    if (!fixture.includes(provider) || !fixture.includes(user)) throw new Error('A fixture-base não contém o ponto de montagem esperado.');
    const importerProvider = [
        "<SarakUIProvider initialTheme={params.get('theme') ?? undefined}",
        "config={{ navigationStyle: params.get('bar') === 'topbar' ? 'topbar' : 'sidebar', ...(params.get('gradient') ? { sidebarBackgroundStyle: 'gradient', topbarBackgroundStyle: 'gradient' } : {}) }}",
        "options={{ preferences: { defaultColorMode: mode } }}>",
    ].join(' ');
    const temporaryEntry = path.join(path.dirname(ENTRY), 'plan-176-harness-entry.tsx');
    const sceneSource = fixture
        .replace(provider, importerProvider)
        .replace(user, `user={{ name: 'Ana', role: '${ROLE_LABEL}' }}`)
        .replace("import { SarakAppChrome, SarakUIProvider } from '@sarak/lib-ui-core';", "import { SarakAppChrome, SarakTitleCard, SarakUIProvider } from '@sarak/lib-ui-core';")
        .replace("<table style={{ width: '100%'", `<div data-probe="title-card"><SarakTitleCard item={{ title: '${TITLE_LABEL}', sub: 'Subtítulo' }} mapping={{ title: 'title', subtitle: 'sub' }} /></div><table style={{ width: '100%'`);
    if (!sceneSource.includes('data-probe="title-card"') || !sceneSource.includes('SarakTitleCard,')) throw new Error('A fixture-base não aceitou o cartão de título.');
    fs.writeFileSync(temporaryEntry, sceneSource, 'utf8');
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

type Piece = 'brand' | 'idle' | 'active' | 'name' | 'role' | 'language' | 'languageBorder' | 'avatar' | 'gear' | 'logout' | 'idleIcon' | 'activeIcon';

const MINIMUMS: Record<Piece, number> = {
    brand: TEXT_MIN, idle: TEXT_MIN, active: TEXT_MIN, name: TEXT_MIN, role: TEXT_MIN, language: TEXT_MIN,
    languageBorder: ICON_MIN, avatar: ICON_MIN, gear: ICON_MIN, logout: ICON_MIN, idleIcon: ICON_MIN, activeIcon: ICON_MIN,
};

interface Scene { theme: string; bar: typeof BARS[number]; mode: typeof MODES[number] }
interface Measurement extends Scene { ratios: Partial<Record<Piece, number>> }

async function open(page: Page, scene: Scene): Promise<void> {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${harnessUrl}?${new URLSearchParams({
        theme: scene.theme, mode: scene.mode, bar: scene.bar, route: scene.bar === 'topbar' ? '#fiscal' : '#vendas/pedidos',
    })}`);
    await expect(page.getByTestId('content')).toBeVisible();
    await page.waitForFunction(() => getComputedStyle(document.documentElement).getPropertyValue('--sarak-topbar-bg').trim() !== '');
    // O tema chega por import dinâmico: espera as variáveis do cromo pararem de mudar.
    await page.waitForFunction(() => {
        const root = getComputedStyle(document.documentElement);
        const key = ['--sarak-topbar-bg', '--sarak-sidebar-bg', '--sarak-primary-color', '--sarak-title-color'].map((name) => root.getPropertyValue(name)).join('|');
        const win = window as unknown as { __sceneKey?: string; __sceneSince?: number };
        if (win.__sceneKey !== key) { win.__sceneKey = key; win.__sceneSince = performance.now(); return false; }
        return performance.now() - (win.__sceneSince ?? 0) > 400;
    }, undefined, { polling: 100 });
}

/**
 * Mede a cor que chega à tela: a cor do glifo com o canal alfa e a `opacity` de cada ancestral até a barra, sobre a cadeia de fundos
 * (cada ancestral pinta por cima do anterior). Barra em degradê é medida nas duas paradas e vale a pior.
 */
function measureInBrowser({ bar, lightShare }: { bar: Scene['bar']; lightShare: number }): Partial<Record<Piece, number>> {
    const context = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
    if (!context) throw new Error('Canvas indisponível para medir contraste.');
    const parse = (value: string): number[] => { context.clearRect(0, 0, 1, 1); context.fillStyle = value; context.fillRect(0, 0, 1, 1); const [r, g, b, a] = context.getImageData(0, 0, 1, 1).data; return [r, g, b, a / 255]; };
    const linear = (value: number): number => { const channel = value / 255; return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4; };
    const luminance = ([r, g, b]: number[]): number => 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
    const ratio = (first: number[], second: number[]): number => { const [high, low] = [luminance(first), luminance(second)].sort((a, b) => b - a); return (high + 0.05) / (low + 0.05); };
    const over = (top: number[], bottom: number[], alpha: number = top[3]): number[] => top.slice(0, 3).map((channel, index) => channel * alpha + bottom[index] * (1 - alpha));
    const element = document.querySelector(bar === 'sidebar' ? 'aside' : 'header') as HTMLElement | null;
    if (!element) throw new Error(`Barra ausente: ${bar}`);
    const page = parse(getComputedStyle(document.body).backgroundColor);
    const pageRgb = page[3] === 1 ? page : [...over(page, [255, 255, 255]), 1];
    const declared = parse(getComputedStyle(document.documentElement).getPropertyValue(`--sarak-${bar}-bg`).trim());
    const base = declared[3] === 1 ? declared : over(declared, pageRgb);
    const gradient = getComputedStyle(element).backgroundImage.includes('linear-gradient');
    const stops = gradient ? [base, base.slice(0, 3).map((channel) => channel * (1 - lightShare) + 255 * lightShare)] : [base];
    const behind = (node: Element, stop: number[]): number[] => {
        const chain: Element[] = [];
        for (let current: Element | null = node; current && current !== element; current = current.parentElement) chain.unshift(current);
        return chain.reduce((lower, item) => { const paint = parse(getComputedStyle(item).backgroundColor); return paint[3] ? over(paint, lower) : lower; }, stop.slice(0, 3));
    };
    const effectiveAlpha = (node: Element): number => {
        let alpha = 1;
        for (let current: Element | null = node; current; current = current.parentElement) alpha *= Number.parseFloat(getComputedStyle(current).opacity);
        return alpha;
    };
    const against = (node: Element | null): number | null => {
        if (!node) return null;
        const color = parse(getComputedStyle(node).color);
        const alpha = color[3] * effectiveAlpha(node);
        return Math.min(...stops.map((stop) => { const lower = behind(node, stop); return ratio(over(color, lower, alpha), lower); }));
    };
    const leaves = [...element.querySelectorAll('*')].filter((node) => node.children.length === 0);
    const byText = (text: string): Element | null => leaves.find((node) => node.textContent?.trim().toUpperCase() === text.toUpperCase()) ?? null;
    const idleLink = element.querySelector('a[href="#home"]');
    const activeLink = element.querySelector('[aria-current="page"]');
    const nodes: Record<Exclude<Piece, 'languageBorder'>, Element | null> = {
        brand: element.querySelector('.sarak-chrome-brand span'), idle: idleLink, active: activeLink,
        name: byText('Ana'), role: byText('Gerente'),
        language: byText('PT'),
        avatar: element.querySelector('[data-sarak-user-strip] [aria-hidden="true"] svg, [data-sarak-widget="user-theme"] div[aria-hidden="true"] svg'),
        gear: element.querySelector('[data-sarak-widget="preferences-menu"] button svg, [data-sarak-widget="preferences-menu"] button'),
        logout: [...element.querySelectorAll('[data-sarak-widget="user-theme"] button')].find((node) => node.querySelector('svg')) ?? null,
        idleIcon: idleLink?.querySelector('svg') ?? null, activeIcon: activeLink?.querySelector('svg') ?? null,
    };
    const result: Partial<Record<Piece, number>> = {};
    (Object.keys(nodes) as Exclude<Piece, 'languageBorder'>[]).forEach((piece) => { const value = against(nodes[piece]); if (value !== null) result[piece] = value; });
    // O botão de idioma não leva tinta: o contorno (`outline`) é o que o distingue da barra, e vale como ícone (3:1) contra a parada da barra.
    const languageButton = bar === 'topbar' ? nodes.language?.closest('button') ?? null : null;
    if (languageButton) {
        const outline = getComputedStyle(languageButton);
        const border = parse(outline.outlineColor);
        result.languageBorder = outline.outlineStyle !== 'none' && Number.parseFloat(outline.outlineWidth) > 0
            ? Math.min(...stops.map((stop) => { const lower = behind(languageButton, stop); return ratio(over(border, lower, border[3] * effectiveAlpha(languageButton)), lower); }))
            : 0;
    }
    return result;
}

test('cromo no tom padrão: texto a 4,5:1 e ícone a 3:1 em todo tema embarcado, nos dois modos e nas duas barras', async ({ page }) => {
    test.setTimeout(1_800_000);
    await open(page, { theme: 'sarak-sovereign', bar: 'sidebar', mode: 'dark' });
    const themes = await page.evaluate(() => (window as unknown as { __scenes: { themes: string[] } }).__scenes.themes);
    const results: Measurement[] = [];
    for (const theme of themes) {
        for (const mode of MODES) {
            for (const bar of BARS) {
                const scene = { theme, bar, mode };
                await open(page, scene);
                results.push({ ...scene, ratios: await page.evaluate(measureInBrowser, { bar, lightShare: GRADIENT_LIGHT_SHARE }) });
            }
        }
    }
    const below = results.flatMap((row) => Object.entries(row.ratios)
        .filter(([piece, value]) => value < MINIMUMS[piece as Piece])
        .map(([piece, value]) => ({ theme: row.theme, mode: row.mode, bar: row.bar, piece, ratio: Number(value.toFixed(2)), minimum: MINIMUMS[piece as Piece] })));
    const failedScenes = new Set(below.map((row) => `${row.theme}/${row.mode}/${row.bar}`));
    console.log(`CHROME_DEFAULT_TONE_MEASUREMENTS ${JSON.stringify({ themes: themes.length, scenarios: results.length, failedScenes: failedScenes.size, failedPairs: new Set(below.map((row) => `${row.theme}/${row.mode}`)).size, below })}`);
    expect(results).toHaveLength(themes.length * MODES.length * BARS.length);
    expect(themes).toHaveLength(25);
    expect(results.every((row) => ['brand', 'idle', 'active', 'name', 'language', 'logout'].every((piece) => Number.isFinite(row.ratios[piece as Piece])))).toBe(true);
    expect(below, 'No tom padrão, cada peça do cromo precisa de 4,5:1 (texto) ou 3:1 (ícone), com a opacidade aplicada.').toEqual([]);
});

/** A cor do título do cartão (com alfa e `opacity` dos ancestrais) sobre a cadeia de fundos do cartão até o corpo da página. */
function measureTitleInBrowser(): { ratio: number; backgroundImage: string } {
    const context = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
    if (!context) throw new Error('Canvas indisponível para medir contraste.');
    const parse = (value: string): number[] => { context.clearRect(0, 0, 1, 1); context.fillStyle = value; context.fillRect(0, 0, 1, 1); const [r, g, b, a] = context.getImageData(0, 0, 1, 1).data; return [r, g, b, a / 255]; };
    const linear = (value: number): number => { const channel = value / 255; return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4; };
    const luminance = ([r, g, b]: number[]): number => 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
    const over = (top: number[], bottom: number[], alpha: number = top[3]): number[] => top.slice(0, 3).map((channel, index) => channel * alpha + bottom[index] * (1 - alpha));
    const title = document.querySelector('[data-probe="title-card"] [data-contrast-part="title"]');
    if (!title) throw new Error('Cartão de título ausente.');
    const chain: Element[] = [];
    for (let current: Element | null = title; current; current = current.parentElement) chain.unshift(current);
    let background = [255, 255, 255];
    let image = '';
    let alpha = 1;
    chain.forEach((node) => {
        const style = getComputedStyle(node);
        const paint = parse(style.backgroundColor);
        if (paint[3]) background = over(paint, background);
        if (style.backgroundImage !== 'none' && node !== title) image = `${node.tagName.toLowerCase()}${node.className ? `.${String(node.className).split(' ')[0]}` : ''}`;
        alpha *= Number.parseFloat(style.opacity);
    });
    const color = parse(getComputedStyle(title).color);
    const foreground = over(color, background, color[3] * alpha);
    const [high, low] = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
    return { ratio: (high + 0.05) / (low + 0.05), backgroundImage: image };
}

test('título do SarakTitleCard: 4,5:1 em repouso e sob o ponteiro, nos 25 temas, no modo escuro', async ({ page }) => {
    test.setTimeout(900_000);
    await open(page, { theme: 'sarak-sovereign', bar: 'sidebar', mode: 'dark' });
    const themes = await page.evaluate(() => (window as unknown as { __scenes: { themes: string[] } }).__scenes.themes);
    const rows: { theme: string; rest: number; hover: number; backgroundImage: string }[] = [];
    for (const theme of themes) {
        await open(page, { theme, bar: 'sidebar', mode: 'dark' });
        const card = page.locator('[data-probe="title-card"] .sarak-card');
        const rest = await page.evaluate(measureTitleInBrowser);
        const box = await card.boundingBox();
        if (!box) throw new Error(`Cartão de título sem caixa em ${theme}.`);
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.waitForTimeout(300);
        const hover = await page.evaluate(measureTitleInBrowser);
        rows.push({ theme, rest: Number(rest.ratio.toFixed(2)), hover: Number(hover.ratio.toFixed(2)), backgroundImage: rest.backgroundImage || hover.backgroundImage });
    }
    console.log(`TITLE_CARD_MEASUREMENTS ${JSON.stringify({ rows })}`);
    expect(rows).toHaveLength(25);
    expect(rows.filter((row) => row.rest < TEXT_MIN || row.hover < TEXT_MIN), 'O título do cartão precisa de 4,5:1 em repouso e sob o ponteiro.').toEqual([]);
});
