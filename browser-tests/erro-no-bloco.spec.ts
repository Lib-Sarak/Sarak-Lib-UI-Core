/**
 * Erro de render contido no bloco, medido em navegador real: o resto da tela segue visível e clicável,
 * "Tentar de novo" remonta o conteúdo e trocar `activeRoute` limpa o erro.
 *
 * LIMITES DECLARADOS (R18): lê o `dist/` — sem `npm run build` recente mede o build anterior. Cobre
 * `SarakSection` e o cromo em lateral na largura de computador; os modos topo e celular passam pelo mesmo
 * `ChromeContentRegion`, e só o teste em `jsdom` lhes confere o `activeRoute`.
 */
import fs from 'node:fs';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { buildHarness } from './build-harness.mjs';

const ENTRY = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures', 'erro-no-bloco-entry.tsx');
const ERROR_TITLE = 'Este bloco não pôde ser exibido';

let harnessDirectory: string;
let harnessUrl: string;

test.beforeAll(async () => {
    const harness = await buildHarness(ENTRY);
    harnessDirectory = harness.outDir;
    harnessUrl = pathToFileURL(harness.htmlPath).href;
});

test.afterAll(() => {
    if (harnessDirectory) fs.rmSync(harnessDirectory, { recursive: true, force: true });
});

async function open(page: Page, scene = ''): Promise<void> {
    await page.setViewportSize({ width: 1200, height: 900 });
    await page.goto(`${harnessUrl}${scene ? `?tela=${scene}` : ''}`);
}

const retryButton = (page: Page) => page.getByRole('button', { name: 'Tentar de novo' });

test('seção: o erro fica no bloco, e o título, as ações e a seção vizinha seguem clicáveis', async ({ page }) => {
    await open(page);

    await expect(page.getByRole('alert')).toContainText(ERROR_TITLE);
    await expect(page.getByRole('alert')).not.toContainText('falha interna');
    await expect(page.getByRole('heading', { name: 'Seção quebrada' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Seção vizinha' })).toBeVisible();

    await page.getByRole('button', { name: 'Cliques 0' }).click();
    await expect(page.getByRole('button', { name: 'Cliques 1' })).toBeVisible();
    await expect(page.getByRole('alert')).toBeVisible();
});

test('seção: nova tentativa sem conserto volta ao aviso, e depois do conserto remonta', async ({ page }) => {
    await open(page);

    await retryButton(page).click();
    await expect(page.getByRole('alert')).toContainText(ERROR_TITLE);

    await page.getByRole('button', { name: 'Consertar' }).click();
    await expect(page.getByRole('alert')).toBeVisible();

    await retryButton(page).click();
    await expect(page.getByTestId('recovered')).toHaveText('Montado 1');
    await expect(page.getByRole('alert')).toHaveCount(0);
});

test('cromo: o erro fica na área de conteúdo, e a navegação segue visível e clicável', async ({ page }) => {
    await open(page, 'cromo');
    const content = page.locator('[data-sarak-content]');

    await expect(content.getByRole('alert')).toContainText(ERROR_TITLE);
    await expect(page.getByText('Tela boa')).toBeVisible();

    await page.getByRole('button', { name: 'Cliques 0' }).click();
    await expect(page.getByRole('button', { name: 'Cliques 1' })).toBeVisible();
    await expect(content.getByRole('alert')).toBeVisible();
});

test('cromo: "Tentar de novo" remonta a tela', async ({ page }) => {
    await open(page, 'cromo');

    await page.getByRole('button', { name: 'Consertar' }).click();
    await retryButton(page).click();

    await expect(page.getByTestId('recovered')).toHaveText('Montado 1');
    await expect(page.getByRole('alert')).toHaveCount(0);
});

test('cromo: trocar activeRoute limpa o erro, e voltar à tela quebrada mostra o aviso de novo', async ({ page }) => {
    await open(page, 'cromo');
    await expect(page.getByRole('alert')).toBeVisible();

    await page.getByText('Tela boa').click();
    await expect(page.getByText('Conteúdo da tela boa')).toBeVisible();
    await expect(page.getByRole('alert')).toHaveCount(0);

    await page.getByText('Tela quebrada').click();
    await expect(page.getByRole('alert')).toContainText(ERROR_TITLE);
});
