/**
 * A galeria de fontes do painel no navegador: cada cartão mostra a PRÓPRIA fonte (font-family computada diferente),
 * a família só é carregada quando o cartão entra na área visível, e a origem `none` não carrega nada.
 *
 * O `jsdom` não baixa fonte: se o `@font-face` carrega de fato (`document.fonts.check`) só o navegador mede
 * (specs/specs/11-testes-e-cobertura.md §7).
 *
 * LIMITES DECLARADOS (R18): Chromium headless, `file://`, a lista de `THEME_FONTS` e o tema `sarak-sovereign`;
 * lê `src/` pelo esbuild do harness e as fontes de `dist/fonts` (precisa de um `npm run build` já feito); não
 * compara pixels, só a família computada e o estado de `document.fonts`.
 */
import { test, expect, chromium, type Browser } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { buildHarness } from './build-harness.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ENTRY = path.join(HERE, 'fixtures', 'fontes-no-painel-entry.tsx');
const DIST_FONTS = pathToFileURL(path.resolve(HERE, '..', 'dist', 'fonts')).href;
const FIRST_FAMILY = (value: string): string => value.split(',')[0].replace(/['"]/g, '').trim();

let browser: Browser;
let harnessDirectory: string;
let harnessUrl: string;

test.beforeAll(async () => {
    const executablePath = process.env.SARAK_CHROMIUM_EXECUTABLE_PATH;
    browser = await chromium.launch(executablePath ? { executablePath } : {});
    const harness = await buildHarness(ENTRY);
    harnessDirectory = harness.outDir;
    harnessUrl = pathToFileURL(harness.htmlPath).href;
});

test.afterAll(async () => {
    if (browser) await browser.close();
    if (harnessDirectory) fs.rmSync(harnessDirectory, { recursive: true, force: true });
});

const titleFonts = (page: import('@playwright/test').Page) => page.evaluate(() =>
    Array.from(document.querySelectorAll('[data-testid="font-sample-title"]')).map((node) => getComputedStyle(node).fontFamily));

test('origem bundled: cada cartão usa a própria família e a fonte carrega de verdade', async () => {
    const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
    await page.goto(`${harnessUrl}?origem=bundled&fontes=${encodeURIComponent(DIST_FONTS)}`);

    const families = await titleFonts(page);
    expect(new Set(families.map(FIRST_FAMILY)).size).toBeGreaterThan(10);
    expect(FIRST_FAMILY(families[0])).toBe('Inter');
    expect(FIRST_FAMILY(families[1])).toBe('Outfit');

    await page.waitForFunction(() => Array.from(document.fonts).some((face) => face.family.replace(/"/g, '') === 'Outfit' && face.status === 'loaded'));
    expect(await page.evaluate(() => document.fonts.check('700 32px "Outfit"'))).toBe(true);
    await page.close();
});

test('só as famílias dos cartões visíveis são carregadas, não as 42 de uma vez', async () => {
    const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
    await page.goto(`${harnessUrl}?origem=bundled&fontes=${encodeURIComponent(DIST_FONTS)}`);
    await page.waitForFunction(() => document.querySelectorAll('style[data-sarak-font]').length > 0);

    const total = await page.evaluate(() => document.querySelectorAll('[data-testid="font-sample-title"]').length);
    const injected = await page.evaluate(() => document.querySelectorAll('style[data-sarak-font]').length);
    expect(injected).toBeGreaterThan(0);
    expect(injected).toBeLessThan(total / 2);
    await page.close();
});

test('origem none: nenhuma família é injetada, e o cartão ainda declara a própria fonte', async () => {
    const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
    await page.goto(`${harnessUrl}?origem=none`);
    await page.waitForSelector('[data-testid="font-sample-title"]');

    expect(await page.evaluate(() => document.querySelectorAll('style[data-sarak-font]').length)).toBe(0);
    const families = await titleFonts(page);
    expect(FIRST_FAMILY(families[1])).toBe('Outfit');
    await page.close();
});
