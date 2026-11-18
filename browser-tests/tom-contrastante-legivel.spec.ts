/**
 * Contraste, em navegador real, do que a barra de tom contrastante (`inverse`, `primary`, `secondary`) desenha sobre o próprio
 * fundo: todo texto e todo ícone dentro da barra (rótulo do item, ícone, busca, pílulas P/M/G e Lateral/Topo, ⚙, idioma,
 * notificações, usuário) passa 4,5:1 contra o fundo da barra, nas duas orientações, em dois temas e nos dois modos.
 * O `jsdom` não calcula cor composta nem tema embarcado.
 *
 * -------------------------------------------------------------------------
 * LIMITES DECLARADOS (R18) — o que esta medição NÃO vê
 * -------------------------------------------------------------------------
 * 0. Os controles P/M/G e Lateral/Topo sobre barra em degradê (último bloco do arquivo) medem o texto do grupo contra cada parada de cor do degradê, no modo claro, sem tom contrastante.
 * 1. O fundo é a cor composta dos ancestrais da barra sobre o fundo da página; fundo em degradê vale por cada parada de cor dele
 *    (a pior), e a textura da barra (`*BackgroundStyle: texture`) não entra.
 * 1.1. O código do idioma (60% do texto forte) e o botão de sair (vermelho misturado ao texto) não são medidos: ficam fora da
 *    promessa da barra de tom (rótulo, ícone, busca, pílulas e ⚙) e saem como achado do resumo.
 * 2. Só dois temas de barra SÓLIDA que NÃO declaram a cor das barras (`sarak-sovereign` e `minimalist-airy`: a paleta calcula o
 *    fundo do tom) e os papéis `inverse`, `primary` e `secondary`. Não medido, e reprova hoje: tema que declara o
 *    fundo da barra (`sarak-sovereign-classic`, `dot-matrix-elegant`) vence o tom que o host põe no `config`; e barra em degradê
 *    (`nebula-space`, `cyberpunk-neon`, `corporate-ledger` e `industrial-terminal`, no modo claro; a lateral também) com o item ativo em véu sobre a parada clara do degradê (3,4 a 4,4:1);
 *    o controle P/M/G e Lateral/Topo deixou o véu e é medido no último bloco.
 * 3. Só texto e ícone visíveis, no estado de repouso: hover, foco e item desabilitado não entram.
 * 4. Só Chromium headless, a 1440×900, lendo o código-fonte com a folha `dist/sarak.css` (rodar `npm run build:css` antes).
 * -------------------------------------------------------------------------
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { expect, test, type Page } from '@playwright/test';
import { buildHarness } from './build-harness.mjs';

const ENTRY = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures', 'barra-lateral-anatomia-entry.tsx');
const THEMES = ['sarak-sovereign', 'minimalist-airy'] as const;
const TONES = ['inverse', 'primary', 'secondary'] as const;
const BARS = ['sidebar', 'topbar'] as const;
const MIN_TEXT_CONTRAST = 4.5;

let harnessDirectory: string;
let harnessUrl: string;

test.beforeAll(async () => {
    const harness = await buildHarness(ENTRY, { useSourceLibrary: true });
    harnessDirectory = harness.outDir;
    harnessUrl = pathToFileURL(harness.htmlPath).href;
});

test.afterAll(() => {
    if (harnessDirectory) fs.rmSync(harnessDirectory, { recursive: true, force: true });
});

interface Reading { what: string; color: string; background: string; ratio: number }

/** Todo texto e ícone visível dentro da barra, com a cor e o fundo composto (ancestrais sobre o fundo da página). */
const readBar = (page: Page, bar: 'sidebar' | 'topbar', scope?: string): Promise<Reading[]> => page.evaluate(([selector, scopeSelector]) => {
    const barRoot = document.querySelector(selector) as HTMLElement;
    const roots = scopeSelector ? [...barRoot.querySelectorAll<HTMLElement>(scopeSelector)] : [barRoot];
    type Rgba = [number, number, number, number];
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const context = canvas.getContext('2d', { willReadFrequently: true })!;
    const parse = (color: string): Rgba => {
        context.clearRect(0, 0, 1, 1);
        context.fillStyle = '#000';
        context.fillStyle = color;
        context.fillRect(0, 0, 1, 1);
        const [r, g, b, a] = context.getImageData(0, 0, 1, 1).data;
        return [r, g, b, a / 255];
    };
    const over = (top: Rgba, below: Rgba): Rgba => {
        const alpha = top[3] + below[3] * (1 - top[3]);
        if (alpha === 0) return [0, 0, 0, 0];
        const mix = (i: number): number => (top[i] * top[3] + below[i] * below[3] * (1 - top[3])) / alpha;
        return [mix(0), mix(1), mix(2), alpha];
    };
    // O fundo composto de um elemento: a cor sólida dos ancestrais sobre o fundo da página. Fundo em degradê vale por cada parada
    // de cor dele (o texto precisa passar contra a pior), então o resultado é uma lista de fundos candidatos.
    const stopsOf = (image: string): Rgba[] => (image.match(/rgba?\([^)]*\)|color\([^)]*\)|oklab\([^)]*\)|oklch\([^)]*\)/g) ?? []).map(parse);
    const backgrounds = (element: Element): Rgba[] => {
        const chain: Element[] = [];
        for (let node: Element | null = element; node; node = node.parentElement) chain.push(node);
        return chain.reduceRight<Rgba[]>((below, node) => {
            const style = getComputedStyle(node);
            const layers = style.backgroundImage.includes('gradient') ? stopsOf(style.backgroundImage) : [parse(style.backgroundColor)];
            return below.flatMap((under) => layers.map((layer) => over(layer, under)));
        }, [[255, 255, 255, 1]]);
    };
    const opacityOf = (element: Element): number => {
        let value = 1;
        for (let node: Element | null = element; node; node = node.parentElement) value *= Number(getComputedStyle(node).opacity);
        return value;
    };
    const luminance = ([r, g, b]: number[]): number => {
        const linear = (channel: number): number => {
            const n = channel / 255;
            return n <= 0.03928 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4;
        };
        return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
    };
    const ratio = (a: number[], b: number[]): number => {
        const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
        return (light + 0.05) / (dark + 0.05);
    };
    const visible = (element: Element): boolean => {
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && getComputedStyle(element).visibility !== 'hidden' && opacityOf(element) > 0.05;
    };
    const label = (element: Element): string => {
        const own = [...element.childNodes].filter((n) => n.nodeType === Node.TEXT_NODE).map((n) => n.textContent?.trim()).filter(Boolean).join(' ');
        return own || element.getAttribute('aria-label') || element.tagName.toLowerCase();
    };
    const readings: Reading[] = [];
    // Fora do que a barra de tom promete (rótulo, ícone, busca, pílulas e ⚙): o código do idioma (60% do texto forte) e o botão de
    // sair (vermelho misturado ao texto). Medidos à parte, sem reprovar aqui.
    const outOfScope = (element: Element): boolean => /sair|logout|sign out/i.test(element.closest('[title]')?.getAttribute('title') ?? '')
        || (element.textContent ?? '').trim() === document.documentElement.lang
        || /^(pt|en|es|fr|de|it)$/.test((element.textContent ?? '').trim());
    const record = (element: Element, what: string): void => {
        if (outOfScope(element)) return;
        const fgColor = parse(getComputedStyle(element).color);
        const worst = backgrounds(element).map((bg) => {
            const fg = over([fgColor[0], fgColor[1], fgColor[2], fgColor[3] * opacityOf(element)], bg);
            return { bg, ratio: ratio(fg, bg) };
        }).sort((a, b) => a.ratio - b.ratio)[0];
        readings.push({ what, color: getComputedStyle(element).color, background: `rgb(${worst.bg.slice(0, 3).map(Math.round).join(',')})`, ratio: worst.ratio });
    };
    for (const element of roots.flatMap((scopeRoot) => [...scopeRoot.querySelectorAll('*')])) {
        if (!visible(element)) continue;
        const hasText = [...element.childNodes].some((n) => n.nodeType === Node.TEXT_NODE && (n.textContent ?? '').trim().length > 0);
        if (hasText) record(element, `texto "${label(element)}"`);
        else if (element instanceof SVGElement && element.tagName.toLowerCase() === 'svg') record(element, `ícone em "${label(element.closest('a, button') ?? element)}"`);
        else if (element instanceof HTMLInputElement) record(element, `campo "${element.placeholder || element.getAttribute('aria-label') || 'busca'}"`);
    }
    return readings;
}, [bar === 'sidebar' ? 'aside' : 'header', scope ?? ''] as const);

for (const theme of THEMES) {
    for (const light of [false, true]) {
        for (const bar of BARS) {
            for (const tone of TONES) {
                test(`${theme}, ${light ? 'claro' : 'escuro'}, ${bar} em ${tone}: texto e ícone passam 4,5:1`, async ({ page }) => {
                    const design = {
                        navigationStyle: bar,
                        sidebarTone: tone,
                        topbarTone: tone,
                        preferenceFontSizePosition: 'pinned',
                        preferenceNavigationStylePosition: 'pinned',
                        preferenceModePosition: 'pinned',
                    };
                    const query = new URLSearchParams({ theme, design: JSON.stringify(design) });
                    if (light) query.set('light', '1');
                    await page.setViewportSize({ width: 1440, height: 900 });
                    await page.goto(`${harnessUrl}?${query.toString()}`);
                    await expect(page.getByTestId('content')).toBeVisible();
                    await page.waitForFunction(() => document.querySelector('[aria-current="page"]') !== null);
                    await page.waitForTimeout(500);
                    const readings = await readBar(page, bar);
                    expect(readings.length, 'a barra tem texto e ícone para medir').toBeGreaterThan(5);
                    const failing = readings.filter((reading) => reading.ratio < MIN_TEXT_CONTRAST)
                        .map((reading) => `${reading.what}: ${reading.color} sobre ${reading.background} = ${reading.ratio.toFixed(2)}`);
                    expect(failing, 'o que não passa 4,5:1 contra o fundo da barra').toEqual([]);
                });
            }
        }
    }
}

// P/M/G e Lateral/Topo sobre barra em degradê no modo claro: o grupo fixado na barra não tem véu de fundo, então o texto de cada
// opção (a escolhida e as outras) é medido contra cada parada de cor do degradê.
const GRADIENT_THEMES = ['nebula-space', 'corporate-ledger'] as const;
const GROUP_SELECTOR = '[role="group"]';

for (const theme of GRADIENT_THEMES) {
    for (const bar of BARS) {
        test(`${theme}, claro, ${bar} em degradê: o grupo P/M/G e o de Lateral/Topo passam 4,5:1 sobre cada parada`, async ({ page }) => {
            const design = {
                navigationStyle: bar,
                preferenceFontSizePosition: 'pinned',
                preferenceNavigationStylePosition: 'pinned',
                [`${bar}BackgroundStyle`]: 'gradient',
            };
            const query = new URLSearchParams({ theme, design: JSON.stringify(design), light: '1' });
            await page.setViewportSize({ width: 1440, height: 900 });
            await page.goto(`${harnessUrl}?${query.toString()}`);
            await expect(page.getByTestId('content')).toBeVisible();
            await page.waitForFunction(() => document.querySelector('[aria-current="page"]') !== null);
            await page.waitForTimeout(500);
            const groups = await page.locator(`${bar === 'sidebar' ? 'aside' : 'header'} ${GROUP_SELECTOR}`).count();
            expect(groups, 'os dois grupos fixados estão na barra').toBeGreaterThanOrEqual(2);
            const readings = await readBar(page, bar, GROUP_SELECTOR);
            expect(readings.length, 'os grupos têm texto para medir (P, M, G, Lateral, Topo)').toBeGreaterThanOrEqual(5);
            const failing = readings.filter((reading) => reading.ratio < MIN_TEXT_CONTRAST)
                .map((reading) => `${reading.what}: ${reading.color} sobre ${reading.background} = ${reading.ratio.toFixed(2)}`);
            expect(failing, 'o que não passa 4,5:1 contra o degradê').toEqual([]);
        });
    }
}
