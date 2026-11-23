import { test, expect, chromium, type Browser } from '@playwright/test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { buildHarness } from './build-harness.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ENTRY = path.join(HERE, 'fixtures', 'graficos-ocupam-o-quadro-entry.tsx');
const TYPES = ['line', 'area', 'bar', 'pie', 'radar', 'scatter', 'heatmap', 'gauge'] as const;
const MODES = ['light', 'dark'] as const;
const OUTPUT = process.env.SARAK_CHART_AREA_OUTPUT ?? path.join(os.tmpdir(), 'sarak-graficos-ocupam-o-quadro');

let browser: Browser;
let harnessDirectory: string;
let harnessUrl: string;

test.beforeAll(async () => {
    browser = await chromium.launch(process.env.SARAK_CHROMIUM_EXECUTABLE_PATH
        ? { executablePath: process.env.SARAK_CHROMIUM_EXECUTABLE_PATH }
        : {});
    const harness = await buildHarness(ENTRY);
    harnessDirectory = harness.outDir;
    harnessUrl = pathToFileURL(harness.htmlPath).href;
});

test.afterAll(async () => {
    if (browser) await browser.close();
    if (harnessDirectory) fs.rmSync(harnessDirectory, { recursive: true, force: true });
});

test('mede os oito tipos nos quadros da tela e de 600x300', async () => {
    fs.mkdirSync(OUTPUT, { recursive: true });
    const measurements: Record<string, unknown> = {};
    for (const mode of MODES) {
        const page = await browser.newPage({ viewport: { width: 1120, height: 1760 } });
        await page.goto(`${harnessUrl}?modo=${mode}`);
        await page.locator('[data-chart="gauge-large"] canvas').waitFor({ timeout: 15_000 });
        await page.waitForFunction(() => {
            const probe = (window as unknown as { __chartAreaProbe?: { measure: () => unknown[] } }).__chartAreaProbe;
            return probe?.measure().length === 16;
        }, null, { timeout: 15_000 });
        const rows = await page.evaluate(() => (window as unknown as { __chartAreaProbe: { measure: () => unknown[] } }).__chartAreaProbe.measure());
        measurements[mode] = rows;
        const measurementsForMode = rows as Array<{
            type: string;
            frame: { width: number; height: number };
            chartSize: { width: number; height: number };
            fraction: { width: number; height: number };
            labels?: Array<{ text: string; x: number; y: number; width: number; height: number }>;
            yAxisExtent?: [number, number];
        }>;
        const failures = measurementsForMode.filter((row) => row.fraction.height < 0.6);
        const sizeMismatches = measurementsForMode.filter((row) =>
            row.chartSize.width !== row.frame.width || row.chartSize.height !== row.frame.height);
        const radarRows = measurementsForMode.filter((row) => row.type === 'radar');
        const radarLabelsMissingOrClipped = radarRows.flatMap((row) => {
            const labels = row.labels ?? [];
            return Array.from({ length: 7 }, (_, index) => `${index + 1}`).filter((text) => {
                const label = labels.find((candidate) => candidate.text === text);
                return !label || label.x < 0 || label.y < 0 || label.x + label.width > row.frame.width || label.y + label.height > row.frame.height;
            }).map((text) => `${row.frame.width}x${row.frame.height}: ${text}`);
        });
        const zeroBasedAxisFailures = measurementsForMode.filter((row) =>
            ['line', 'area', 'bar', 'scatter', 'heatmap'].includes(row.type) && row.yAxisExtent?.[0] !== 0);
        expect(failures.map((row) => `${row.type}: ${(row.fraction.height * 100).toFixed(1)}%`)).toEqual([]);
        expect(sizeMismatches.map((row) => `${row.type}: chart ${row.chartSize.width}x${row.chartSize.height}, frame ${row.frame.width}x${row.frame.height}`)).toEqual([]);
        expect(radarLabelsMissingOrClipped).toEqual([]);
        expect(zeroBasedAxisFailures.map((row) => `${row.type}: ${row.yAxisExtent?.[0]}`)).toEqual([]);
        await page.locator('main').screenshot({ path: path.join(OUTPUT, `graficos-${mode}.png`) });
        await page.close();
    }
    fs.writeFileSync(path.join(OUTPUT, 'medicao.json'), `${JSON.stringify(measurements, null, 2)}\n`, 'utf8');
});
