import { test, expect, chromium, type Page } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { sarakCreateThemeBootCss } from '../src/core/Provider/utils/createThemeBootCss';
import { buildHarness } from './build-harness.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));

const withImporterHarness = async (run: (page: Page) => Promise<void>): Promise<void> => {
    const fixturePath = path.join(HERE, 'fixtures', 'importador-temas-entry.tsx');
    const { outDir, htmlPath } = await buildHarness(fixturePath);
    const browser = await chromium.launch({ executablePath: process.env.SARAK_PLAYWRIGHT_CHROMIUM_PATH || undefined });

    try {
        const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await page.goto(pathToFileURL(htmlPath).href);
        await expect(page.getByRole('button', { name: 'Salvar tema' })).toBeVisible();
        await run(page);
    } finally {
        await browser.close();
        fs.rmSync(outDir, { recursive: true, force: true });
    }
};

test('salva o rascunho aplicado como tema novo e o Aplicar seguinte persiste o id novo', async () => {
    await withImporterHarness(async (page) => {
        await page.getByTestId('activate-embedded').click();
        await page.getByTestId('edit-current-draft').click();
        await page.getByRole('button', { name: 'Salvar tema' }).click();
        await page.getByRole('radio', { name: 'Salvar como novo', exact: true }).locator('xpath=ancestor::label').click();
        await page.getByLabel('Nome do tema').fill('ERP Noite Novo');
        await page.getByRole('button', { name: 'Salvar como novo' }).click();

        await expect(page.getByTestId('last-theme-operation')).toHaveText('create:erp-noite-novo');
        await expect(page.getByTestId('active-theme-id')).toHaveText('erp-noite-novo');
        await expect(page.getByTestId('theme-collection')).toContainText('ERP Noite Novo');

        await page.getByTestId('edit-current-draft').click();
        const applyButton = page.getByRole('button', { name: /^Aplicar/ });
        await expect(applyButton).toBeEnabled();
        await applyButton.click();
        await expect(page.getByTestId('persisted-theme-id')).toHaveText('erp-noite-novo');
    });
});

test('substitui o tema do importador preservando o id na coleção retornada por customThemes', async () => {
    await withImporterHarness(async (page) => {
        await page.getByTestId('edit-current-draft').click();
        await page.getByRole('button', { name: 'Salvar tema' }).click();
        await page.getByLabel('Nome do tema').fill('ERP Noite Revisto');
        await page.getByRole('button', { name: /^Salvar$/ }).click();

        await expect(page.getByTestId('last-theme-operation')).toHaveText('replace:erp-noite');
        await expect(page.getByTestId('theme-collection')).toContainText('"id":"erp-noite","name":"ERP Noite Revisto"');
        await expect(page.getByTestId('active-theme-id')).toHaveText('erp-noite');
    });
});

test('duplica um tema do importador com nome e id novos, mantendo o original', async () => {
    await withImporterHarness(async (page) => {
        await page.getByRole('button', { name: 'Salvar tema' }).click();
        await page.getByText('Duplicar', { exact: true }).click();
        await page.getByRole('button', { name: 'Duplicar' }).click();

        await expect(page.getByTestId('last-theme-operation')).toHaveText('create:erp-noite-copia');
        await expect(page.getByTestId('theme-collection')).toContainText('"id":"erp-noite"');
        await expect(page.getByTestId('theme-collection')).toContainText('"id":"erp-noite-copia"');
        await expect(page.getByTestId('active-theme-id')).toHaveText('erp-noite-copia');
    });
});

test('duplica um tema embarcado como criação com identidade nova', async () => {
    await withImporterHarness(async (page) => {
        const defaultThemeId = await page.getByTestId('default-theme-id').innerText();
        await page.getByTestId('activate-embedded').click();
        await page.getByRole('button', { name: 'Salvar tema' }).click();
        await page.getByText('Duplicar', { exact: true }).click();
        await page.getByRole('button', { name: 'Duplicar' }).click();

        const operation = await page.getByTestId('last-theme-operation').innerText();
        const createdThemeId = operation.replace(/^create:/, '');
        expect(operation).toMatch(/^create:.+-copia$/);
        expect(createdThemeId).not.toBe(defaultThemeId);
        await expect(page.getByTestId('provider-theme-ids')).toContainText(defaultThemeId);
        await expect(page.getByTestId('active-theme-id')).toHaveText(createdThemeId);
    });
});

test('cria tema a partir da referência completa para o modo atual', async () => {
    await withImporterHarness(async (page) => {
        await page.getByRole('button', { name: 'Novo tema' }).click();
        await expect(page.getByRole('dialog', { name: 'Salvar tema' })).toBeVisible();
        await page.getByLabel('Nome do tema').fill('Tema de Referência Novo');
        await page.getByRole('button', { name: 'Salvar como novo' }).click();

        await expect(page.getByTestId('last-theme-operation')).toHaveText('create:tema-de-referencia-novo');
        await expect(page.getByTestId('theme-collection')).toContainText('"contraparte"');
        await expect(page.getByTestId('active-theme-id')).toHaveText('tema-de-referencia-novo');
    });
});

test('não oferece substituir tema embarcado e salva uma cópia com id livre', async () => {
    await withImporterHarness(async (page) => {
        const defaultThemeId = await page.getByTestId('default-theme-id').innerText();
        const defaultThemeName = await page.getByTestId('default-theme-name').innerText();
        await page.getByTestId('activate-embedded').click();
        await page.getByRole('button', { name: 'Salvar tema' }).click();
        await expect(page.getByRole('radio', { name: 'Salvar', exact: true })).toHaveCount(0);
        await page.getByLabel('Nome do tema').fill(defaultThemeName);
        await page.getByRole('button', { name: 'Salvar como novo' }).click();
        await expect(page.getByTestId('feedback-message')).toHaveText('Use um nome diferente para salvar como novo tema.');
        await expect(page.getByTestId('last-theme-operation')).toHaveText('');

        await page.getByLabel('Nome do tema').fill(`${defaultThemeName} Cópia`);
        await page.getByRole('button', { name: 'Salvar como novo' }).click();

        const operation = await page.getByTestId('last-theme-operation').innerText();
        const createdThemeId = operation.replace(/^create:/, '');
        expect(operation).toMatch(/^create:.+-copia$/);
        expect(createdThemeId).not.toBe(defaultThemeId);
        await expect(page.getByTestId('provider-theme-ids')).toContainText(defaultThemeId);
        await expect(page.getByTestId('provider-theme-ids')).toContainText(createdThemeId);
    });
});

test('apagar ativo usa confirmação da lib e ativa o tema padrão do modo', async () => {
    await withImporterHarness(async (page) => {
        const defaultThemeId = await page.getByTestId('default-theme-id').innerText();
        await page.getByRole('button', { name: 'Apagar tema' }).click();
        await expect(page.getByRole('dialog', { name: 'Apagar tema?' })).toBeVisible();
        await expect(page.getByText('Apagar o tema “ERP Noite”?')).toBeVisible();
        await page.getByRole('button', { name: 'Confirmar' }).click();

        await expect(page.getByTestId('last-theme-operation')).toHaveText('delete:erp-noite');
        await expect(page.getByTestId('active-theme-id')).toHaveText(defaultThemeId);
        await expect(page.getByTestId('provider-theme-ids')).not.toContainText('erp-noite');
    });
});

test('apagar rejeitado mantém o tema na coleção e mostra o aviso', async () => {
    await withImporterHarness(async (page) => {
        await page.getByTestId('reject-next-delete').click();
        await page.getByRole('button', { name: 'Apagar tema' }).click();
        await page.getByRole('button', { name: 'Confirmar' }).click();

        await expect(page.getByTestId('last-theme-operation')).toHaveText('delete-rejected:erp-noite');
        await expect(page.getByTestId('theme-collection')).toContainText('"id":"erp-noite"');
        await expect(page.getByTestId('provider-theme-ids')).toContainText('erp-noite');
        await expect(page.getByTestId('feedback-message')).toHaveText('Não foi possível apagar o tema. Ele continua disponível na coleção.');
    });
});

test('restaura id e tema do servidor sem clarão, e mostra falha da porta de gravação', async () => {
    const fixturePath = path.join(HERE, 'fixtures', 'tema-que-volta-entry.tsx');
    const { outDir, htmlPath } = await buildHarness(fixturePath);
    const criticalCss = sarakCreateThemeBootCss({ mode: 'dark', primaryColor: '#123456', colorBgBody: '#123456' });
    const pageHtml = fs.readFileSync(htmlPath, 'utf8').replace(
        '</head>',
        `<style>${criticalCss}</style></head>`,
    );
    fs.writeFileSync(htmlPath, pageHtml, 'utf8');
    const browser = await chromium.launch({ executablePath: process.env.SARAK_PLAYWRIGHT_CHROMIUM_PATH || undefined });

    try {
        const firstPaintPage = await browser.newPage({ javaScriptEnabled: false });
        await firstPaintPage.setContent(pageHtml);
        expect(await firstPaintPage.locator('html').evaluate((element) => getComputedStyle(element).backgroundColor)).toBe('rgb(18, 52, 86)');
        expect(await firstPaintPage.locator('body').evaluate((element) => getComputedStyle(element).backgroundColor)).toBe('rgb(18, 52, 86)');
        expect(await firstPaintPage.locator('html').evaluate((element) => getComputedStyle(element).colorScheme)).toBe('dark');
        await firstPaintPage.close();

        const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
        await page.clock.install();
        await page.addInitScript(() => {
            localStorage.setItem('browser-theme-restore::tenant:org-a', JSON.stringify({ primaryColor: '#8a1111', colorBgBody: '#8a1111' }));
            localStorage.setItem('browser-theme-restore::tenant:org-a::active-theme-id', 'old-theme');
        });
        await page.goto(pathToFileURL(htmlPath).href);
        await expect(page.getByTestId('restored-primary-color')).toHaveText('#123456');
        await expect(page.getByTestId('restored-active-theme-id')).toHaveText('config-theme');
        await page.getByRole('button', { name: 'Salvar tema' }).click();
        await expect(page.getByLabel('Nome do tema')).toHaveValue('Tema do config');
        await page.getByRole('button', { name: 'Cancelar' }).click();

        await page.evaluate(() => window.__resolveRestoredTheme?.());
        await expect(page.getByTestId('restored-primary-color')).toHaveText('#265f87');
        await expect(page.getByTestId('restored-active-theme-id')).toHaveText('server-theme');
        await expect(page.getByRole('button', { name: 'Salvar tema' })).toBeVisible();
        await page.getByRole('button', { name: 'Salvar tema' }).click();
        await expect(page.getByLabel('Nome do tema')).toHaveValue('Tema do servidor');
        await page.getByRole('button', { name: 'Cancelar' }).click();
        expect(await page.evaluate(() => localStorage.getItem('browser-theme-restore::tenant:org-a::active-theme-id'))).toBe('server-theme');
        expect(await page.evaluate(() => JSON.parse(localStorage.getItem('browser-theme-restore::tenant:org-a') ?? 'null').primaryColor)).toBe('#265f87');

        await page.getByTestId('change-applied-design').click();
        await page.clock.fastForward(1500);
        await expect(page.getByRole('alert')).toContainText('Não foi possível salvar o tema.');
        await page.close();
    } finally {
        await browser.close();
        fs.rmSync(outDir, { recursive: true, force: true });
    }
});
