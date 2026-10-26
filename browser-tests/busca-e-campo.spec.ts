import { expect, test, type Page } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { buildHarness } from './build-harness.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ENTRY = path.join(HERE, 'fixtures', 'search-links-entry.tsx');

let harnessDirectory: string | undefined;
let harnessUrl: string;

test.beforeAll(async () => {
    const harness = await buildHarness(ENTRY);
    harnessDirectory = harness.outDir;
    harnessUrl = pathToFileURL(harness.htmlPath).href;
});

test.afterAll(() => {
    if (harnessDirectory) fs.rmSync(harnessDirectory, { recursive: true, force: true });
});

const openScene = async (page: Page, scene: 'bar' | 'palette', width = 240) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(`${harnessUrl}?cena=${scene}&largura=${width}`);
};

test('a barra de 240 px esconde o atalho e mantém o campo dentro do contêiner', async ({ page }) => {
    await openScene(page, 'bar', 240);
    const host = page.getByTestId('search-bar-host');
    const input = page.getByRole('combobox');
    await expect(input).toBeVisible();
    await expect(page.getByTestId('sarak-shell-search-shortcut')).toBeHidden();

    const bounds = await Promise.all([
        host.boundingBox(),
        input.boundingBox(),
    ]);
    expect(bounds[0]).not.toBeNull();
    expect(bounds[1]).not.toBeNull();
    expect(bounds[1]!.x + bounds[1]!.width).toBeLessThanOrEqual(bounds[0]!.x + bounds[0]!.width);
});

test('a barra reserva espaço entre o campo e o atalho quando ambos cabem', async ({ page }) => {
    await openScene(page, 'bar', 320);
    const input = page.getByRole('combobox');
    const shortcut = page.getByTestId('sarak-shell-search-shortcut');
    await expect(shortcut).toBeVisible();

    const bounds = await Promise.all([input.boundingBox(), shortcut.boundingBox()]);
    expect(bounds[0]).not.toBeNull();
    expect(bounds[1]).not.toBeNull();
    expect(bounds[0]!.x + bounds[0]!.width).toBeLessThanOrEqual(bounds[1]!.x);
});

test('resultado da barra sem callback segue o href e atualiza a URL', async ({ page }) => {
    await openScene(page, 'bar', 320);
    await page.getByRole('combobox').fill('Propostas');
    await page.getByRole('option', { name: /Propostas/ }).click();
    await expect(page).toHaveURL(/#\/propostas$/);
});

test('a paleta ativa o primeiro resultado e Enter segue sua rota sem callback', async ({ page }) => {
    await openScene(page, 'palette');
    const input = page.getByRole('combobox');
    await expect(page.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
    await input.fill('Propostas');

    const firstResult = page.getByRole('option', { name: /Propostas/ });
    await expect(input).toHaveAttribute('aria-controls', await page.getByRole('listbox').getAttribute('id') ?? '');
    await expect(firstResult).toHaveAttribute('aria-selected', 'true');
    await input.press('Enter');
    await expect(page).toHaveURL(/#\/propostas$/);
});
