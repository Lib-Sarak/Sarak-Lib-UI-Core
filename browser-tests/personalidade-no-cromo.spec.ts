/**
 * As Personalidades com navegação no topo aplicam pelo painel montado como o consumidor o monta: numa rota do app, dentro do
 * `SarakAppChrome`. Ao escolher uma delas, o rascunho passa a `navigationStyle: "topbar"` e o cromo troca de barra; o painel tem de
 * continuar na decisão aberta, com a opção marcada e o "Aplicar" habilitado.
 *
 * LIMITES DECLARADOS: só Chromium headless a 1440×900, com o tema sarak-sovereign e o React de desenvolvimento; lê `src/` pelo esbuild
 * do harness e o CSS de `dist/`.
 */
import { test, expect, chromium, type Browser, type Page } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { buildHarness } from './build-harness.mjs';

const ENTRY = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures', 'personalidade-no-cromo-entry.tsx');
const VIEWPORT = { width: 1440, height: 900 };
/** As quatro personalidades de navegação no topo. */
/** Com a barra no topo, o primeiro item do menu fica acima desta altura; na lateral ele fica abaixo da marca. */
const TOPBAR_MAX_Y = 80;
const TOPBAR_PERSONALITIES = ['Executivo', 'Editorial', 'Brutalista', 'Vidro'] as const;

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

const openPersonalities = async (page: Page): Promise<void> => {
    await page.getByRole('button', { name: /^Tema/ }).first().click();
    await page.getByRole('button', { name: 'Personalidades' }).click();
    await expect(page.locator('[data-preset-group="personalities"]')).toBeVisible();
};

for (const name of TOPBAR_PERSONALITIES) {
    test(`personalidade ${name}: aplica pelo painel dentro do cromo e habilita o Aplicar`, async () => {
        const page = await browser.newPage({ viewport: VIEWPORT });
        try {
            await page.goto(harnessUrl);
            await openPersonalities(page);
            const apply = page.getByRole('button', { name: 'Aplicar' });
            await expect(apply).toBeDisabled();
            await page.locator('[data-preset-group="personalities"]').getByRole('button', { name: new RegExp(name) }).click();
            await expect(apply).toBeEnabled({ timeout: 10_000 });
            // O clique não tira o usuário da decisão: o grupo de personalidades segue na tela.
            await expect(page.locator('[data-preset-group="personalities"]')).toBeVisible();
            // O cromo trocou mesmo de barra (o item do menu subiu para o topo), e o painel não foi remontado por isso.
            await expect.poll(async () => (await page.getByRole('link', { name: 'Início' }).first().boundingBox())?.y ?? 999).toBeLessThan(TOPBAR_MAX_Y);
            await expect(apply).toBeEnabled();
        } finally {
            await page.close();
        }
    });
}
