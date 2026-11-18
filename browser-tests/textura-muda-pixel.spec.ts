/**
 * Medição, em navegador real, de que escolher "Textura local" no fundo da barra muda pixel mesmo com a opacidade do ruído em 0
 * (o valor de fábrica): a camada de textura nunca desce de um piso visível. O harness é montado a partir do código-fonte.
 *
 * -------------------------------------------------------------------------
 * LIMITES DECLARADOS (R18) — o que esta medição NÃO vê
 * -------------------------------------------------------------------------
 * 1. Só o tema padrão do harness, a 1440 px, em Chromium headless; o celular (gaveta e barra de baixo) não entra.
 * 2. Compara a captura da barra pintada sólida com a pintada em textura; não mede QUANTO a textura muda nem se agrada.
 * 3. O `max(opacidade, piso)` da camada é conferido em unidade (`ChromeSidebarBody.test.tsx`); aqui só o pixel que chega à tela.
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

const CAPTURE_DIRECTORY = process.env.SARAK_PREVIA_159_DIR;

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

async function captureBar(page: Page, bar: 'header' | 'aside', design: Record<string, unknown>): Promise<Buffer> {
    await page.setViewportSize({ width: 1440, height: 800 });
    const navigation = bar === 'aside' ? '&nav=sidebar' : '';
    await page.goto(`${harnessUrl}?design=${encodeURIComponent(JSON.stringify(design))}${navigation}`);
    await page.locator(bar).first().waitFor({ state: 'visible' });
    await page.waitForTimeout(400);
    return page.locator(bar).first().screenshot();
}

const CASES = [
    { bar: 'header', style: 'topbarBackgroundStyle', opacity: 'topbarNoiseOpacity', label: 'a barra do topo' },
    { bar: 'aside', style: 'sidebarBackgroundStyle', opacity: 'sidebarNoiseOpacity', label: 'a barra lateral' },
] as const;

for (const { bar, style, opacity, label } of CASES) {
    test(`${label}: "Textura local" com ruído 0 muda pixel em relação ao fundo sólido`, async ({ page }) => {
        const solid = await captureBar(page, bar, { [style]: 'solid', [opacity]: 0 });
        const textured = await captureBar(page, bar, { [style]: 'texture', [opacity]: 0 });
        if (CAPTURE_DIRECTORY) {
            fs.writeFileSync(path.join(CAPTURE_DIRECTORY, `l3-textura-${bar}-solido.png`), solid);
            fs.writeFileSync(path.join(CAPTURE_DIRECTORY, `l3-textura-${bar}-textura.png`), textured);
        }
        expect(textured.equals(solid), `${label}: a captura em textura é idêntica à sólida`).toBe(false);
    });

    test(`${label}: a captura sólida repetida é idêntica (a diferença acima vem da textura, não de ruído de renderização)`, async ({ page }) => {
        const first = await captureBar(page, bar, { [style]: 'solid', [opacity]: 0 });
        const second = await captureBar(page, bar, { [style]: 'solid', [opacity]: 0 });
        expect(second.equals(first)).toBe(true);
    });
}
