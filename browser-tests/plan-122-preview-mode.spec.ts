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

test('o dual-view usa o espaço do container e o empilhado rola os dois quadros', async () => {
    const page = await browser.newPage();
    await page.goto(harnessUrl);
    await page.getByRole('button', { name: 'Abrir galeria' }).click();

    const panelHost = page.getByTestId('plan-122-panel-host');
    const previewLayout = page.getByTestId('preview-layout');
    const getLayoutDirection = (): Promise<string> =>
        previewLayout.evaluate((layout) => getComputedStyle(layout).flexDirection);

    await expect.poll(getLayoutDirection).toBe('row');
    await panelHost.evaluate((element) => {
        (element as HTMLElement).style.width = '700px';
    });
    await expect.poll(getLayoutDirection).toBe('column');

    await panelHost.evaluate((element) => {
        (element as HTMLElement).style.width = '1600px';
    });
    await expect.poll(getLayoutDirection).toBe('row');
    await page.getByRole('switch', { name: 'Empilhar previews' }).check({ force: true });

    const liveFrame = page.getByTestId('live-preview-frame');
    const catalogFrame = page.getByTestId('catalog-preview-frame');
    await expect.poll(async () => previewLayout.evaluate((layout) => layout.scrollHeight > layout.clientHeight)).toBe(true);
    await expect.poll(async () => {
        const layoutHeight = await previewLayout.evaluate((layout) => layout.clientHeight);
        const gap = await previewLayout.evaluate((layout) => Number.parseFloat(getComputedStyle(layout).rowGap));
        const frameHeights = await Promise.all([
            liveFrame.evaluate((frame) => frame.getBoundingClientRect().height),
            catalogFrame.evaluate((frame) => frame.getBoundingClientRect().height),
        ]);
        return frameHeights.every((height) => Math.abs(height - (layoutHeight - gap)) <= 2);
    }).toBe(true);

    expect(await liveFrame.evaluate((frame) => getComputedStyle(frame).overflowY)).toBe('auto');
    expect(await catalogFrame.evaluate((frame) => getComputedStyle(frame).overflowY)).toBe('auto');
    await page.close();
});
