import { test, expect, chromium, type Browser } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { buildHarness } from './build-harness.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ENTRY = path.join(HERE, 'fixtures', 'no-provider-css-entry.tsx');
const STYLESHEET_LINK = '<link rel="stylesheet" href="./sarak.css" />';

let browser: Browser;
let harnessDirectory: string;
let harnessUrl: string;

test.beforeAll(async () => {
    const executablePath = process.env.SARAK_CHROMIUM_EXECUTABLE_PATH;
    browser = await chromium.launch(executablePath ? { executablePath } : {});
    const harness = await buildHarness(ENTRY);
    harnessDirectory = harness.outDir;
    const html = fs.readFileSync(harness.htmlPath, 'utf8');
    if (!html.includes(STYLESHEET_LINK)) throw new Error('no-provider-css: link do stylesheet ausente no harness.');
    fs.writeFileSync(harness.htmlPath, html.replace(STYLESHEET_LINK, ''), 'utf8');
    harnessUrl = pathToFileURL(harness.htmlPath).href;
});

test.afterAll(async () => {
    if (browser) await browser.close();
    if (harnessDirectory) fs.rmSync(harnessDirectory, { recursive: true, force: true });
});

test('componente da lib recebe CSS no import sem folha externa nem Provider', async () => {
    const page = await browser.newPage();
    const pageErrors: string[] = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));

    await page.goto(harnessUrl);
    const button = page.getByRole('button', { name: 'Sem Provider' });
    await expect(button).toBeVisible();

    const result = await page.evaluate(() => {
        const buttonElement = document.querySelector('button');
        const style = document.getElementById('sarak-ui-core-styles');
        return {
            externalStylesheets: document.querySelectorAll('link[rel="stylesheet"]').length,
            styleText: style?.textContent ?? '',
            paddingTop: buttonElement ? getComputedStyle(buttonElement).paddingTop : '',
            rootFontSize: getComputedStyle(document.documentElement).fontSize,
            buttonClasses: buttonElement?.className ?? '',
        };
    });

    expect(result.externalStylesheets).toBe(0);
    expect(result.styleText.length).toBeGreaterThan(1000);
    expect(result.buttonClasses.split(/\s+/)).toContain('py-4');
    expect(result.paddingTop).toBe(result.rootFontSize);
    expect(pageErrors).toEqual([]);

    await page.close();
});
