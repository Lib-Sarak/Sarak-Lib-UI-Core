import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium, expect, test } from '@playwright/test';
import { buildHarness } from './build-harness.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ENTRY = path.join(ROOT, 'browser-tests', 'fixtures', 'plan-123-color-hierarchy-entry.tsx');

test('título, subtítulo e destaque diferem do corpo nos três temas', async () => {
    const { outDir, htmlPath } = await buildHarness(ENTRY);
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

    try {
        await page.goto(pathToFileURL(htmlPath).href);
        await expect(page.locator('[data-color-theme="sarak-sovereign"] [data-color-role="title"]')).toBeVisible();

        for (const themeId of ['sarak-sovereign', 'cyberpunk-neon', 'minimalist-airy']) {
            const colors = await page.locator(`[data-color-theme="${themeId}"]`).evaluate((scope) => {
                const read = (role: string) => getComputedStyle(scope.querySelector(`[data-color-role="${role}"]`)!).color;
                return {
                    title: read('title'),
                    subtitle: read('subtitle'),
                    emphasis: read('emphasis'),
                    body: read('body'),
                };
            });

            expect(colors.title, `${themeId}: título`).not.toBe(colors.body);
            expect(colors.subtitle, `${themeId}: subtítulo`).not.toBe(colors.body);
            expect(colors.emphasis, `${themeId}: destaque`).not.toBe(colors.body);
        }
    } finally {
        await page.close();
        await browser.close();
        fs.rmSync(outDir, { recursive: true, force: true });
    }
});
