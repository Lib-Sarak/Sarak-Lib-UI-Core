import { chromium, expect, test, type Browser } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { buildHarness } from './build-harness.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ENTRY = path.join(HERE, 'fixtures', 'login-theme-application-entry.tsx');
const STORAGE_KEY = 'login-theme-application';
const TENANT_STORAGE_KEY = `${STORAGE_KEY}::tenant:tenant-acme`;
const EXPECTED_TENANT_CACHE = {
    design: { mode: 'dark', primaryColor: '#123456', colorBgBody: '#123456' },
    activeThemeId: 'sarak-sovereign',
};

declare global {
    interface Window {
        __tenantThemeSave?: { design: Record<string, unknown>; activeThemeId?: string };
        __namedThemeSaveCalled?: boolean;
        __sovereignBackground?: string;
    }
}

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

test('Provider sem tenant aplica e persiste o tema escolhido depois do login', async () => {
    const page = await browser.newPage();
    const pageErrors: string[] = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));
    await page.goto(harnessUrl);
    await page.getByRole('button', { name: 'Fazer login' }).click();

    await expect(page.locator('[data-probe="tenant-primary-color"]')).toHaveText('#123456');
    expect(await readStoredTheme(page, STORAGE_KEY)).toBeNull();
    await expect.poll(() => readStoredThemePair(page, TENANT_STORAGE_KEY)).toMatchObject(EXPECTED_TENANT_CACHE);
    expect(await page.evaluate(() => window.__tenantThemeSave)).toBeUndefined();

    await page.getByRole('button', { name: 'Abrir galeria' }).click();
    await expect(page.getByRole('heading', { name: 'Galeria de estilos' })).toBeVisible();
    await page.getByRole('button', { name: /Sarak Sovereign/ }).click();

    const applyButton = page.getByRole('button', { name: 'Aplicar' });
    await expect(page.getByText(/\d+ altera(?:ção|ções)/)).toBeVisible();
    await expect(applyButton).toBeEnabled();
    const sovereignBackground = (await page.evaluate(() => window.__sovereignBackground))!;
    await expect(page.locator('[data-probe="tenant-draft-background"]')).toHaveText(sovereignBackground);
    await expect(page.locator('[data-probe="tenant-system-background"]')).toHaveText('#123456');
    expect(await readStoredThemePair(page, TENANT_STORAGE_KEY)).toMatchObject(EXPECTED_TENANT_CACHE);

    await applyButton.click();
    await expect.poll(() => page.evaluate(() => Boolean(window.__tenantThemeSave))).toBe(true);
    expect(await page.evaluate(() => window.__tenantThemeSave?.activeThemeId)).toBe('sarak-sovereign');
    const persistedTheme = await readStoredThemePair(page, TENANT_STORAGE_KEY);
    expect(persistedTheme.design).not.toBeNull();
    expect((persistedTheme.design as { primaryColor: string }).primaryColor).not.toBe('#123456');
    expect(persistedTheme.activeThemeId).toBe('sarak-sovereign');
    await expect(page.locator('[data-probe="tenant-system-background"]')).toHaveText(sovereignBackground);
    expect(await page.evaluate(() => window.__namedThemeSaveCalled)).toBeUndefined();
    expect(pageErrors).toEqual([]);
    await page.close();
});

const readStoredTheme = async (page: import('@playwright/test').Page, key: string): Promise<unknown> =>
    page.evaluate((storageKey) => {
        const value = localStorage.getItem(storageKey);
        return value === null ? null : JSON.parse(value);
    }, key);

const readStoredThemePair = async (
    page: import('@playwright/test').Page,
    key: string,
): Promise<{ design: unknown; activeThemeId: string | null }> => page.evaluate((storageKey) => {
    const value = localStorage.getItem(storageKey);
    return {
        design: value === null ? null : JSON.parse(value),
        activeThemeId: localStorage.getItem(`${storageKey}::active-theme-id`),
    };
}, key);
