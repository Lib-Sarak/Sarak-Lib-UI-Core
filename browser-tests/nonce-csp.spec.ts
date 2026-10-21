import { test, expect, chromium, type Browser } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { buildHarness } from './build-harness.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ENTRY = path.join(HERE, 'fixtures', 'nonce-csp-entry.tsx');
const NONCE = 'sarak-csp-nonce';
const CSP = [
    "default-src 'self' data:",
    "script-src 'self'",
    `style-src 'self' 'nonce-${NONCE}'`,
    "style-src-attr 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self' data:",
    "connect-src 'self' data:",
].join('; ');

let browser: Browser;
let harnessDirectory: string;
let harnessUrl: string;

test.beforeAll(async () => {
    const executablePath = process.env.SARAK_CHROMIUM_EXECUTABLE_PATH;
    browser = await chromium.launch(executablePath ? { executablePath } : {});
    const harness = await buildHarness(ENTRY);
    harnessDirectory = harness.outDir;
    const html = fs.readFileSync(harness.htmlPath, 'utf8');
    const stylesheet = '<link rel="stylesheet" href="./sarak.css" />';
    if (!html.includes(stylesheet)) throw new Error('nonce-csp: link do stylesheet ausente no harness.');
    fs.writeFileSync(
        harness.htmlPath,
        html.replace(stylesheet, `<meta http-equiv="Content-Security-Policy" content="${CSP}" />\n${stylesheet}`),
        'utf8',
    );
    harnessUrl = pathToFileURL(harness.htmlPath).href;
});

test.afterAll(async () => {
    if (browser) await browser.close();
    if (harnessDirectory) fs.rmSync(harnessDirectory, { recursive: true, force: true });
});

test('renderiza a tela sob CSP com nonce em toda tag style criada pela biblioteca', async () => {
    const page = await browser.newPage();
    const pageErrors: string[] = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));

    await page.goto(harnessUrl);
    await expect(page.getByRole('heading', { name: 'Entrar' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Continuar com empresa' })).toBeVisible();

    const result = await page.evaluate(() => ({
        display: getComputedStyle(document.querySelector('.sarak-page-surface') as HTMLElement).display,
        styleNonces: Array.from(document.querySelectorAll('style')).map((style) => style.nonce),
        csp: document.querySelector<HTMLMetaElement>('meta[http-equiv="Content-Security-Policy"]')?.content ?? '',
    }));
    expect(result.display).toBe('flex');
    expect(result.styleNonces.length).toBeGreaterThan(0);
    expect(result.styleNonces.every((nonce) => nonce === NONCE)).toBe(true);
    expect(result.csp).toMatch(new RegExp(`style-src 'self' 'nonce-${NONCE}'`));
    expect(result.csp).not.toMatch(/style-src\s+[^;]*'unsafe-inline'/);
    expect(pageErrors).toEqual([]);

    await page.close();
});
