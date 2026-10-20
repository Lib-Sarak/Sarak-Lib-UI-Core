import { test, expect, chromium, type Page } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
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
