/**
 * Medição, em navegador real, dos controles de preferência discretos: P/M/G e Lateral/Topo fixados na barra do topo viram grupos
 * compactos com a altura de um item de navegação; dentro do ⚙ viram linhas de menu com seleção (não pílulas); o ⚙ não repete o
 * que já está fixo na barra visível. O harness é montado a partir do código-fonte (não do `dist/`).
 *
 * -------------------------------------------------------------------------
 * LIMITES DECLARADOS (R18) — o que esta medição NÃO vê
 * -------------------------------------------------------------------------
 * 1. Só o tema padrão do harness, a 1440 px, em Chromium headless; a barra lateral e o celular não entram aqui.
 * 2. A altura é a de um item de navegação na densidade `comfortable` (a de fábrica); outra densidade não é exercitada.
 * 3. O contraste dos grupos sobre barra em degradê é medido em `tom-contrastante-legivel.spec.ts`.
 * -------------------------------------------------------------------------
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { expect, test, type Page } from '@playwright/test';
import { buildHarness } from './build-harness.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ENTRY = path.join(ROOT, 'browser-tests', 'fixtures', 'topbar-mais-entry.tsx');
const TAILWIND_CLI = path.join(ROOT, 'node_modules', '@tailwindcss', 'cli', 'dist', 'index.mjs');
const TOLERANCE_PX = 1;
const FONT_GROUP = 'header [role="group"][aria-label="Tamanho da fonte"]';
const NAV_GROUP = 'header [role="group"][aria-label="Estilo de navegação"]';
const FACTORY = { preferenceFontSizePosition: 'menu', preferenceNavigationStylePosition: 'menu', preferenceModePosition: 'menu' };

let harnessDirectory: string | undefined;
let harnessUrl = '';

test.beforeAll(async () => {
    const harness = await buildHarness(ENTRY);
    harnessDirectory = harness.outDir;
    harnessUrl = pathToFileURL(harness.htmlPath).href;
    execFileSync(process.execPath, [
        TAILWIND_CLI, '--input', path.join(ROOT, 'src', 'styles', 'sarak-base.css'),
        '--output', path.join(harnessDirectory, 'sarak.css'), '--minify',
    ], { cwd: ROOT, stdio: 'pipe' });
});

test.afterAll(() => {
    if (harnessDirectory) fs.rmSync(harnessDirectory, { recursive: true, force: true });
});

async function open(page: Page, design: Record<string, unknown> | null): Promise<void> {
    await page.setViewportSize({ width: 1440, height: 800 });
    const query = design ? `?design=${encodeURIComponent(JSON.stringify(design))}` : '';
    await page.goto(`${harnessUrl}${query}`);
    await page.locator('header nav').waitFor({ state: 'visible' });
    await page.waitForTimeout(400);
}

const heightOf = (page: Page, selector: string): Promise<number> =>
    page.locator(selector).first().evaluate((element) => element.getBoundingClientRect().height);

test('fixados na barra, P/M/G e Lateral/Topo têm a altura de um item de navegação e cabem em menos de 240 px juntos (eram ~299)', async ({ page }) => {
    await open(page, null);
    const itemHeight = await heightOf(page, 'header nav [data-sarak-nav-cell] a');
    const fontHeight = await heightOf(page, FONT_GROUP);
    const navHeight = await heightOf(page, NAV_GROUP);
    expect(Math.abs(fontHeight - itemHeight), `P/M/G (${fontHeight}) × item (${itemHeight})`).toBeLessThanOrEqual(TOLERANCE_PX);
    expect(Math.abs(navHeight - itemHeight), `Lateral/Topo (${navHeight}) × item (${itemHeight})`).toBeLessThanOrEqual(TOLERANCE_PX);
    const widths = await page.evaluate(([font, nav]) => [font, nav].map((selector) => document.querySelector(selector)!.getBoundingClientRect().width), [FONT_GROUP, NAV_GROUP]);
    expect(widths[0] + widths[1], 'os dois grupos juntos na barra').toBeLessThan(240);
});

test('o ⚙ não repete o que já está fixo na barra visível (tamanho, orientação e busca)', async ({ page }) => {
    await open(page, { preferenceFontSizePosition: 'pinned', preferenceNavigationStylePosition: 'pinned', preferenceModePosition: 'menu' });
    await expect(page.locator(FONT_GROUP)).toBeVisible();
    await page.getByRole('button', { name: 'Preferências' }).click();
    const menu = page.getByRole('menu');
    await expect(menu).toBeVisible();
    // O modo fica no menu (não está fixado); tamanho, orientação e busca já estão na barra e não voltam ao ⚙.
    await expect(menu.getByRole('button', { name: /modo/i })).toBeVisible();
    await expect(menu.getByRole('menuitemradio')).toHaveCount(0);
    await expect(menu.locator('[role="group"]')).toHaveCount(0);
    await expect(menu.getByText(/buscar/i)).toHaveCount(0);
});

test('com tamanho e orientação no menu, o ⚙ mostra linhas com seleção marcada, não pílulas', async ({ page }) => {
    await open(page, FACTORY);
    await page.getByRole('button', { name: 'Preferências' }).click();
    const menu = page.getByRole('menu');
    await expect(menu.getByRole('menuitemradio', { name: 'Média' })).toHaveAttribute('aria-checked', 'true');
    await expect(menu.getByRole('menuitemradio', { name: 'Lateral' })).toBeVisible();
    await expect(menu.locator('button[aria-pressed]')).toHaveCount(0);
    await menu.getByRole('menuitemradio', { name: 'Grande' }).click();
    await expect.poll(() => page.evaluate(() => getComputedStyle(document.body).fontSize)).not.toBe('14px');
});
