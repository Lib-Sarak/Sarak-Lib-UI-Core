/**
 * Contraste, em navegador real, do texto e do ícone de toda linha do ⚙ "Preferências" contra o fundo do próprio menu. O menu abre
 * num portal sobre o fundo do cartão, não sobre a barra: o texto da linha segue essa superfície, nunca a cor do item da barra
 * (num tom contrastante, `sidebarTone: "inverse"`, a cor do item da barra é clara sobre o cartão claro e some).
 *
 * -------------------------------------------------------------------------
 * LIMITES DECLARADOS (R18) — o que esta medição NÃO vê
 * -------------------------------------------------------------------------
 * 1. Só o ⚙ aberto com tamanho, orientação e modo no menu, idioma e busca, a 1440×900, em Chromium headless; a gaveta do celular
 *    (que abre sobre o fundo da barra, com o tom dela) e as barras fora do ⚙ ficam para `tom-contrastante-legivel.spec.ts`.
 * 2. O fundo é a cor composta dos ancestrais do menu sobre o fundo da página; o texto é medido em repouso (hover e foco não entram).
 * 3. Três cenas: Corporate Ledger (declara a lateral invertida), o tema padrão e o tema padrão com as duas barras em tom `inverse`.
 * 4. O código do idioma (60% do texto forte) é medido à parte e não reprova aqui, como em `tom-contrastante-legivel.spec.ts`.
 * -------------------------------------------------------------------------
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { expect, test, type Page } from '@playwright/test';
import { buildHarness } from './build-harness.mjs';

const ENTRY = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures', 'barra-lateral-anatomia-entry.tsx');
const MIN_TEXT_CONTRAST = 4.5;
const CAPTURE_DIRECTORY = process.env.SARAK_PREVIA_159_DIR;
const SCENES = [
    { name: 'corporate-ledger', theme: 'corporate-ledger', extra: {} },
    { name: 'padrao', theme: '', extra: {} },
    { name: 'padrao-inverse', theme: '', extra: { sidebarTone: 'inverse', topbarTone: 'inverse' } },
] as const;
const BARS = ['sidebar', 'topbar'] as const;
const IN_MENU = { preferenceFontSizePosition: 'menu', preferenceNavigationStylePosition: 'menu', preferenceModePosition: 'menu' };

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

/** Todo texto e ícone visível dentro do menu aberto, com a cor e o fundo composto dos ancestrais sobre o fundo da página. */
const readMenu = (page: Page): Promise<Reading[]> => page.evaluate(() => {
    type Rgba = [number, number, number, number];
    const menu = document.querySelector('[role="menu"]') as HTMLElement;
    const context = Object.assign(document.createElement('canvas'), { width: 1, height: 1 }).getContext('2d', { willReadFrequently: true })!;
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
    const backgroundOf = (element: Element): Rgba => {
        const chain: Element[] = [];
        for (let node: Element | null = element; node; node = node.parentElement) chain.push(node);
        return chain.reduceRight<Rgba>((below, node) => over(parse(getComputedStyle(node).backgroundColor), below), [255, 255, 255, 1]);
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
    const label = (element: Element): string => {
        const own = [...element.childNodes].filter((n) => n.nodeType === Node.TEXT_NODE).map((n) => n.textContent?.trim()).filter(Boolean).join(' ');
        return own || element.getAttribute('aria-label') || element.tagName.toLowerCase();
    };
    const readings: Reading[] = [];
    for (const element of [...menu.querySelectorAll('*')]) {
        const rect = element.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) continue;
        const hasText = [...element.childNodes].some((n) => n.nodeType === Node.TEXT_NODE && (n.textContent ?? '').trim().length > 0);
        const isIcon = element.tagName.toLowerCase() === 'svg';
        if (!hasText && !isIcon) continue;
        const text = (element.textContent ?? '').trim();
        if (hasText && /^(pt|en|es|fr|de|it)$/.test(text)) continue;
        const style = getComputedStyle(element);
        const fg = parse(style.color);
        const bg = backgroundOf(element);
        readings.push({
            what: hasText ? `texto "${label(element)}"` : `ícone em "${label(element.closest('a, button') ?? element)}"`,
            color: style.color,
            background: `rgb(${bg.slice(0, 3).map(Math.round).join(',')})`,
            ratio: ratio(over([fg[0], fg[1], fg[2], fg[3] * Number(style.opacity)], bg), bg),
        });
    }
    return readings;
});

for (const scene of SCENES) {
    for (const light of [false, true]) {
        for (const bar of BARS) {
            test(`${scene.name}, ${light ? 'claro' : 'escuro'}, ⚙ na ${bar === 'sidebar' ? 'lateral' : 'barra do topo'}: toda linha passa 4,5:1 contra o fundo do menu`, async ({ page }) => {
                const design = { navigationStyle: bar, ...IN_MENU, ...scene.extra };
                const query = new URLSearchParams({ design: JSON.stringify(design) });
                if (scene.theme) query.set('theme', scene.theme);
                if (light) query.set('light', '1');
                await page.setViewportSize({ width: 1440, height: 900 });
                await page.goto(`${harnessUrl}?${query.toString()}`);
                await expect(page.getByTestId('content')).toBeVisible();
                await page.waitForFunction(() => document.querySelector('[aria-current="page"]') !== null);
                await page.waitForTimeout(500);
                await page.getByRole('button', { name: 'Preferências' }).click();
                await expect(page.getByRole('menu')).toBeVisible();
                await page.waitForTimeout(200);
                const selected = page.getByRole('menu').locator('[aria-checked="true"]');
                expect(await selected.count(), 'o menu tem linha escolhida (P/M/G e Lateral/Topo)').toBeGreaterThan(0);
                if (CAPTURE_DIRECTORY) await page.screenshot({ path: path.join(CAPTURE_DIRECTORY, `c1-${scene.name}-${light ? 'claro' : 'escuro'}-${bar}.png`) });
                const readings = await readMenu(page);
                expect(readings.length, 'o menu tem texto e ícone para medir').toBeGreaterThan(6);
                const failing = readings.filter((reading) => reading.ratio < MIN_TEXT_CONTRAST)
                    .map((reading) => `${reading.what}: ${reading.color} sobre ${reading.background} = ${reading.ratio.toFixed(2)}`);
                expect(failing, 'o que não passa 4,5:1 contra o fundo do menu').toEqual([]);
            });
        }
    }
}
