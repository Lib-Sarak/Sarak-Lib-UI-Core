import { test, expect, chromium, type Browser } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { buildHarness } from './build-harness.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ENTRY = path.join(HERE, 'fixtures', 'plan-122-preview-mode-entry.tsx');

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

test('a prévia e os cartões acompanham a preferência clara e o toggle alterna nos dois sentidos', async () => {
    const page = await browser.newPage();
    const pageErrors: string[] = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));

    await page.goto(harnessUrl);
    const previewSurface = page.locator('.sarak-device-desktop > div.absolute.inset-0.z-0');
    const previewToggle = page.locator('.sarak-device-desktop').getByRole('button', { name: 'Modo Escuro' });

    await expect(previewToggle).toBeVisible();
    await expect.poll(() => previewSurface.evaluate((surface) => getComputedStyle(surface).backgroundColor))
        .toBe('rgb(243, 246, 250)');

    await page.getByRole('button', { name: 'Abrir galeria' }).click();
    const themeCard = page.getByRole('button', { name: /Sarak Sovereign/i });
    await expect(themeCard).toBeVisible();
    const themeCardSurface = themeCard.locator(':scope > div').first();
    await expect.poll(() => themeCardSurface.evaluate((surface) => getComputedStyle(surface).backgroundColor))
        .toBe('rgb(255, 255, 255)');

    await previewToggle.click();
    const darkModeToggle = page.locator('.sarak-device-desktop').getByRole('button', { name: 'Modo Claro' });
    await expect(darkModeToggle).toBeVisible();
    await expect.poll(() => previewSurface.evaluate((surface) => getComputedStyle(surface).backgroundColor))
        .toBe('rgb(6, 8, 13)');

    await darkModeToggle.click();
    await expect(page.locator('.sarak-device-desktop').getByRole('button', { name: 'Modo Escuro' })).toBeVisible();
    await expect.poll(() => previewSurface.evaluate((surface) => getComputedStyle(surface).backgroundColor))
        .toBe('rgb(243, 246, 250)');
    expect(pageErrors).toEqual([]);

    await page.close();
});
