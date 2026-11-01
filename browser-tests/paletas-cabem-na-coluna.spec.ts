/**
 * "Criar paleta a partir de uma cor" cabe na largura da coluna do painel, nos dois modos e nos seis idiomas, sem caixa-alta
 * decorativa; e a lista de alterações e o menu "Mais ações" nunca ficam abertos juntos.
 *
 * LIMITES DECLARADOS (R18): Chromium headless, tema `sarak-sovereign`, coluna de 320px (a largura inicial do painel); os
 * idiomas são medidos trocando o texto do botão pelo do catálogo, não trocando o idioma do Provider; lê `src/` pelo
 * esbuild do harness e o CSS do `dist/` (precisa de um `npm run build` já feito).
 */
import { test, expect, chromium, type Browser } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { buildHarness } from './build-harness.mjs';
import { LIBRARY_TEXT_CATALOG } from '../src/core/i18n/catalog';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ENTRY = path.join(HERE, 'fixtures', 'plan-135-paletas-entry.tsx');
const LABELS = Object.values(LIBRARY_TEXT_CATALOG.paletteCreateOpen);

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

for (const mode of ['escuro', 'claro'] as const) {
    test(`o botão de criar paleta cabe na coluna, em seis idiomas (${mode})`, async () => {
        const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
        await page.goto(harnessUrl);
        if (mode === 'claro') await page.locator('.sarak-device-desktop').getByRole('button', { name: 'Modo Claro' }).click();
        const section = page.getByRole('region', { name: 'Paleta de cores' });
        const button = section.getByRole('button', { name: 'Criar paleta a partir de uma cor' });
        await button.scrollIntoViewIfNeeded();

        expect(await button.evaluate((node) => getComputedStyle(node).textTransform)).toBe('none');

        const fits = await button.evaluate((node, labels) => {
            const box = node.closest('section') as HTMLElement;
            return labels.map((label) => {
                node.textContent = label;
                const rect = node.getBoundingClientRect();
                const bounds = box.getBoundingClientRect();
                return { label, overflowsSelf: node.scrollWidth > node.clientWidth, leaves: rect.right > bounds.right + 0.5 || rect.left < bounds.left - 0.5 };
            });
        }, LABELS);
        expect(fits.filter((item) => item.overflowsSelf || item.leaves)).toEqual([]);
        await page.close();
    });
}

test('a lista de alterações e o menu de mais ações não ficam abertos juntos', async () => {
    const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
    await page.goto(harnessUrl);
    await page.getByRole('radiogroup', { name: 'Paletas prontas' }).getByRole('radio').nth(2).click();

    await page.getByRole('status').getByRole('button').click();
    await expect(page.getByRole('list', { name: 'Alterações pendentes' })).toBeVisible();

    await page.getByRole('button', { name: 'Mais ações' }).click();
    await expect(page.getByRole('menu', { name: 'Mais ações' })).toBeVisible();
    await expect(page.getByRole('list', { name: 'Alterações pendentes' })).toHaveCount(0);

    // O menu aberto cobre o contador: Esc o fecha e devolve o foco, e o contador volta a ser alcançável.
    await page.keyboard.press('Escape');
    await page.getByRole('status').getByRole('button').click();
    await expect(page.getByRole('list', { name: 'Alterações pendentes' })).toBeVisible();
    await expect(page.getByRole('menu')).toHaveCount(0);
    await page.close();
});
