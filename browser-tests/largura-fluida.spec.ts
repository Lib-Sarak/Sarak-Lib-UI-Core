import { expect, test } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { buildHarness } from './build-harness.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ENTRY = path.join(HERE, 'fixtures', 'largura-fluida-entry.tsx');
const VIEWPORT_WIDTHS = [1280, 1920, 2560] as const;

let harnessDirectory: string | undefined;
let harnessUrl: string;

test.beforeAll(async () => {
    const harness = await buildHarness(ENTRY);
    harnessDirectory = harness.outDir;
    harnessUrl = pathToFileURL(harness.htmlPath).href;
});

test.afterAll(() => {
    if (harnessDirectory) fs.rmSync(harnessDirectory, { recursive: true, force: true });
});

test('largura padrão cresce com o contêiner e mantém tabela larga sem rolagem horizontal', async ({ page }) => {
    const measurements: Array<{
        containerWidth: number;
        contentWidth: number;
        leftMargin: number;
        rightMargin: number;
        clientWidth: number;
        scrollWidth: number;
    }> = [];

    for (const width of VIEWPORT_WIDTHS) {
        await page.setViewportSize({ width, height: 900 });
        if (width === VIEWPORT_WIDTHS[0]) await page.goto(harnessUrl);

        const content = page.locator('main[data-sarak-content]');
        await expect(content).toBeVisible();
        await expect(page.getByTestId('wide-layout-table')).toBeVisible();

        measurements.push(await content.evaluate((element) => {
            const parent = element.parentElement;
            if (!parent) throw new Error('A região de conteúdo precisa de um contêiner pai.');

            const contentBounds = element.getBoundingClientRect();
            const parentBounds = parent.getBoundingClientRect();
            return {
                containerWidth: parentBounds.width,
                contentWidth: contentBounds.width,
                leftMargin: contentBounds.left - parentBounds.left,
                rightMargin: parentBounds.right - contentBounds.right,
                clientWidth: element.clientWidth,
                scrollWidth: element.scrollWidth,
            };
        }));
    }

    for (const [index, measurement] of measurements.entries()) {
        expect(measurement.leftMargin).toBeCloseTo(measurement.rightMargin, 0);
        expect(measurement.scrollWidth).toBe(measurement.clientWidth);
        if (index > 0) {
            expect(measurement.containerWidth).toBeGreaterThan(measurements[index - 1].containerWidth);
            expect(measurement.contentWidth).toBeGreaterThan(measurements[index - 1].contentWidth);
            expect(measurement.leftMargin).toBeGreaterThan(measurements[index - 1].leftMargin);
        }
    }
});
