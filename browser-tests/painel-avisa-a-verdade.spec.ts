/**
 * Medição, em navegador real, do que o painel diz junto do controle de token: a preferência pessoal gravada que está por cima do
 * tema (com a ação que a apaga do `localStorage`), o controle que não vale com a navegação de hoje (desabilitado, com o motivo) e o
 * intervalo da largura da lateral. O harness é montado a partir do código-fonte (não do `dist/`).
 *
 * -------------------------------------------------------------------------
 * LIMITES DECLARADOS (R18) — o que esta medição NÃO vê
 * -------------------------------------------------------------------------
 * 1. Só a pilha de controles (`DecisionTokenList`) com seis tokens, numa coluna de 360 px; a decisão inteira e a busca não entram.
 * 2. O aviso é medido com a preferência escrita no `localStorage` antes de a página abrir; preferência que chega por `onLoad` do
 *    host (servidor) usa o mesmo caminho do Provider e não é exercitada aqui.
 * 3. Não mede o cromo: o efeito da preferência sobre a barra é de `preferencias-discretas.spec.ts` e de `cromo-css-real.spec.ts`.
 * -------------------------------------------------------------------------
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { expect, test, type Page } from '@playwright/test';
import { buildHarness } from './build-harness.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ENTRY = path.join(ROOT, 'browser-tests', 'fixtures', 'painel-avisa-entry.tsx');
const TAILWIND_CLI = path.join(ROOT, 'node_modules', '@tailwindcss', 'cli', 'dist', 'index.mjs');
const STORAGE_KEY = 'sarak-ui-preferences-v1';
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

async function open(page: Page, draft: Record<string, unknown>, preferences?: Record<string, unknown>): Promise<void> {
    await page.addInitScript(([key, value]) => { if (value) localStorage.setItem(key as string, value as string); }, [STORAGE_KEY, preferences ? JSON.stringify(preferences) : '']);
    await page.setViewportSize({ width: 420, height: 900 });
    await page.goto(`${harnessUrl}?draft=${encodeURIComponent(JSON.stringify(draft))}`);
    await page.getByTestId('column').waitFor({ state: 'visible' });
    await page.waitForTimeout(300);
}

async function capture(page: Page, name: string): Promise<void> {
    if (CAPTURE_DIRECTORY) await page.getByTestId('column').screenshot({ path: path.join(CAPTURE_DIRECTORY, `l3-${name}.png`) });
}

const row = (page: Page, id: string) => page.locator(`[data-token-row="${id}"]`);
/** O primeiro controle de verdade dentro da linha: o navegador desabilita o que está num fieldset desabilitado, e é isso que o usuário sente. */
const control = (page: Page, id: string) => row(page, id).locator('fieldset :is(input, select, button, textarea)').first();

test('com navigationStyle gravado no navegador, o painel avisa; a ação apaga só aquela preferência e o aviso some', async ({ page }) => {
    await open(page, { navigationStyle: 'topbar' }, { navigationStyle: 'sidebar', fontSize: 'lg' });
    await expect(row(page, 'navigationStyle').getByTestId('token-personal-note')).toContainText('Sua preferência pessoal (Lateral) está por cima do tema');
    await expect(row(page, 'bodySize').getByTestId('token-personal-note')).toContainText('(G)');
    await capture(page, 'aviso');
    await row(page, 'navigationStyle').getByRole('button', { name: 'Apagar minha preferência' }).click();
    await expect(row(page, 'navigationStyle').getByTestId('token-personal-note')).toHaveCount(0);
    await expect.poll(() => page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY)).not.toContain('navigationStyle');
    expect(await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY)).toContain('"fontSize":"lg"');
});

test('sem preferência gravada, nenhum aviso aparece', async ({ page }) => {
    await open(page, { navigationStyle: 'topbar' });
    await expect(page.getByTestId('token-personal-note')).toHaveCount(0);
});

test('com navegação lateral, os controles só do topo ficam desabilitados com o motivo; os da lateral seguem editáveis', async ({ page }) => {
    await open(page, { navigationStyle: 'sidebar' });
    await expect(control(page, 'navbarLayout')).toBeDisabled();
    await expect(row(page, 'navbarLayout').getByTestId('token-inactive-note')).toContainText('Só vale com navegação no topo');
    await expect(control(page, 'sidebarPosition')).toBeEnabled();
    await capture(page, 'desabilitado');
});

test('com navegação no topo, é o inverso: o da lateral desabilita e o do topo edita', async ({ page }) => {
    await open(page, { navigationStyle: 'topbar' });
    await expect(control(page, 'sidebarPosition')).toBeDisabled();
    await expect(row(page, 'sidebarPosition').getByTestId('token-inactive-note')).toContainText('Só vale com navegação lateral');
    await expect(control(page, 'navbarLayout')).toBeEnabled();
});

test('a largura da lateral mostra e respeita o piso do design: com sidebarMinWidth 300 o campo vai de 300 a 400', async ({ page }) => {
    await open(page, { sidebarMinWidth: { mob: 150, tab: 180, desk: 300 }, sidebarMaxWidth: { mob: 300, tab: 400, desk: 600 }, sidebarWidth: { mob: 200, tab: 220, desk: 320 } });
    await expect(row(page, 'sidebarWidth').getByTestId('token-range-note')).toContainText('Entre 300 e 400 px');
    const slider = row(page, 'sidebarWidth').getByRole('slider');
    await expect(slider).toHaveAttribute('min', '300');
    await expect(slider).toHaveAttribute('max', '400');
    await capture(page, 'largura');
});

test('o rótulo de isNavHidden é o da preferência: "Navegação recolhida"', async ({ page }) => {
    await open(page, {});
    await expect(row(page, 'isNavHidden')).toContainText('Navegação recolhida');
    await expect(row(page, 'isNavHidden')).not.toContainText('Ocultar Navegação');
});
