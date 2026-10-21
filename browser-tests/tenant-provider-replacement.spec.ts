import { test, expect, chromium, type Browser } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { buildHarness } from './build-harness.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ENTRY = path.join(HERE, 'fixtures', 'tenant-provider-replacement-entry.tsx');

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

test('Provider keyed novo conserva tema, atributos, modo e fundo após a troca no mesmo root', async () => {
    const page = await browser.newPage();
    const pageErrors: string[] = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));

    await page.goto(harnessUrl);
    const switchButton = page.getByRole('button', { name: 'Trocar tenant' });
    await expect(switchButton).toBeVisible();

    await switchButton.click();

    await expect.poll(() => page.locator('html').getAttribute('data-sx-shadow-orientation')).toBe('dynamic');
    await expect.poll(() => page.locator('body').getAttribute('data-sarak-has-media')).toBe('true');
    await expect.poll(() => page.locator('body').evaluate((body) => body.classList.contains('dark'))).toBe(true);

    const result = await page.evaluate(() => ({
        primaryColor: document.documentElement.style.getPropertyValue('--sarak-primary-color'),
        tenant: document.documentElement.getAttribute('data-sx-shadow-orientation'),
        backgroundImage: document.documentElement.style.getPropertyValue('--sarak-global-bg-image'),
        responsiveCssLength: document.getElementById('sarak-responsive-vars')?.textContent?.length ?? 0,
        bodyMode: document.body.className,
        hasMedia: document.body.getAttribute('data-sarak-has-media'),
    }));

    expect(result.primaryColor).toBe('#7c3aed');
    expect(result.tenant).toBe('dynamic');
    expect(result.backgroundImage).toContain('tenant-b.png');
    expect(result.responsiveCssLength).toBeGreaterThan(0);
    expect(result.bodyMode.split(/\s+/)).toContain('dark');
    expect(result.hasMedia).toBe('true');
    expect(pageErrors).toEqual([]);
    await page.close();
});
