import fs from 'node:fs';
import path from 'node:path';
import { expect, test } from '@playwright/test';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { buildHarness } from './build-harness.mjs';

const GRID_HARNESS_ENTRY = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures', 'grid-span-entry.tsx');
const responsiveDefaults = [
    { width: 900, span: 6 },
    { width: 1100, span: 4 },
    { width: 1400, span: 3 },
] as const;

let harnessDirectory: string;
let harnessUrl: string;

test.beforeAll(async () => {
    const harness = await buildHarness(GRID_HARNESS_ENTRY);
    harnessDirectory = harness.outDir;
    harnessUrl = pathToFileURL(harness.htmlPath).href;
});

test.afterAll(() => {
    if (harnessDirectory) {
        fs.rmSync(harnessDirectory, { recursive: true, force: true });
    }
});

test('col-12 mantém o span do consumidor e aplica o padrão sem span em cada breakpoint', async ({ page }) => {
    for (const { width, span: defaultSpan } of responsiveDefaults) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(harnessUrl);
        await expect(page.getByTestId('custom-span')).toBeVisible();

        const measurement = await page.evaluate((expectedDefaultSpan) => {
            const grid = document.querySelector<HTMLElement>('[data-testid="contract-grid"]');
            const defaultChild = document.querySelector<HTMLElement>('[data-testid="default-span"]');
            const customChild = document.querySelector<HTMLElement>('[data-testid="custom-span"]');

            if (!grid || !defaultChild || !customChild) {
                throw new Error('O grid de contrato não foi montado.');
            }

            const gridStyle = getComputedStyle(grid);
            const tracks = gridStyle.gridTemplateColumns.trim().split(/\s+/);
            const trackWidth = Number.parseFloat(tracks[0]);
            const columnGap = Number.parseFloat(gridStyle.columnGap) || 0;
            const measureSpan = (span: number) => trackWidth * span + columnGap * (span - 1);

            return {
                trackCount: tracks.length,
                defaultEnd: getComputedStyle(defaultChild).gridColumnEnd,
                customEnd: getComputedStyle(customChild).gridColumnEnd,
                defaultWidth: defaultChild.getBoundingClientRect().width,
                customWidth: customChild.getBoundingClientRect().width,
                expectedDefaultWidth: measureSpan(expectedDefaultSpan),
                expectedCustomWidth: measureSpan(6),
            };
        }, defaultSpan);

        expect(measurement.trackCount, `${width}px deve ativar as 12 trilhas`).toBe(12);
        expect(measurement.defaultEnd, `${width}px deve atribuir span ${defaultSpan} sem classe no filho`).toBe(`span ${defaultSpan}`);
        expect(measurement.customEnd, `${width}px deve preservar o col-span-6 do consumidor`).toBe('span 6');
        expect(measurement.defaultWidth).toBeCloseTo(measurement.expectedDefaultWidth, 0);
        expect(measurement.customWidth).toBeCloseTo(measurement.expectedCustomWidth, 0);
    }
});
