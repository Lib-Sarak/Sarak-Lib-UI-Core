import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { expect, test, type Page } from '@playwright/test';
import { buildHarness } from './build-harness.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ENTRY = path.join(ROOT, 'browser-tests', 'composition-scenes-entry.tsx');
const TAILWIND_CLI = path.join(ROOT, 'node_modules', '@tailwindcss', 'cli', 'dist', 'index.mjs');
const SOURCE_STYLESHEET = path.join(ROOT, 'src', 'styles', 'sarak-base.css');
const THEME_IDS = ['sarak-sovereign', 'cyberpunk-neon', 'minimalist-airy'];
const VIEWPORT_WIDTHS = [390, 1280, 2560];
const VIEWPORT_HEIGHT = 1000;
const MINIMUM_FONT_SIZE_PX = 11;
const MINIMUM_TARGET_SIZE_PX = 24;
const MAXIMUM_MEASUREMENT_DELTA_PX = 1;
// A cena é um molde que entra no `<main>` do cromo, não um `<main>`: a raiz dela é o filho do escopo do tema.
const SCENE_SELECTOR = '[data-theme] > :not(style)';

let harnessDirectory = '';
let harnessUrl = '';

test.beforeAll(async () => {
    const harness = await buildHarness(ENTRY, { useSourceLibrary: true });
    harnessDirectory = harness.outDir;
    harnessUrl = pathToFileURL(harness.htmlPath).href;
    compileCurrentSourceStyles(harnessDirectory);
});

test.afterAll(() => {
    if (harnessDirectory) fs.rmSync(harnessDirectory, { recursive: true, force: true });
    fs.rmSync(path.join(os.tmpdir(), 'sarak-composition-scenes-results'), { recursive: true, force: true });
});

test('lista: respiro, tipografia, alvos e largura nos três temas', async ({ page }) => {
    await measureScene(page, 'list');
});

test('detalhe: respiro, tipografia, alvos e largura nos três temas', async ({ page }) => {
    await measureScene(page, 'detail');
});

function compileCurrentSourceStyles(outputDirectory: string): void {
    execFileSync(process.execPath, [
        TAILWIND_CLI,
        '--input', SOURCE_STYLESHEET,
        '--output', path.join(outputDirectory, 'sarak.css'),
        '--minify',
    ], { cwd: ROOT, stdio: 'pipe' });
}

async function measureScene(page: Page, scene: 'list' | 'detail'): Promise<void> {
    for (const themeId of THEME_IDS) {
        for (const width of VIEWPORT_WIDTHS) {
            await page.setViewportSize({ width, height: VIEWPORT_HEIGHT });
            await page.goto(`${harnessUrl}?scene=${scene}&theme=${themeId}`);
            await expect(page.locator(SCENE_SELECTOR)).toBeVisible();
            await expect(page.locator('h1')).toHaveCount(1);

            const measurement = await measureRenderedScene(page);
            expect(measurement.computedGapPx, `${scene}/${themeId}/${width}: gap do tema`).toBeGreaterThan(0);
            expect(measurement.blockGapsPx.length, `${scene}/${themeId}/${width}: blocos consecutivos`).toBeGreaterThan(0);
            for (const blockGap of measurement.blockGapsPx) {
                expect(
                    Math.abs(blockGap - measurement.computedGapPx),
                    `${scene}/${themeId}/${width}: distância entre blocos (${blockGap}px) deve seguir o token (${measurement.computedGapPx}px)`,
                ).toBeLessThanOrEqual(MAXIMUM_MEASUREMENT_DELTA_PX);
            }
            expect(measurement.minimumFontSizePx, `${scene}/${themeId}/${width}: piso tipográfico (${measurement.minimumFontTarget})`).toBeGreaterThanOrEqual(MINIMUM_FONT_SIZE_PX);
            expect(measurement.horizontalOverflowPx, `${scene}/${themeId}/${width}: transbordamento horizontal`).toBeLessThanOrEqual(0);
            expect(measurement.smallTargets, `${scene}/${themeId}/${width}: alvos menores que o mínimo`).toEqual([]);

            process.stdout.write(
                `CENA ${scene === 'list' ? 'lista' : 'detalhe'} | tema ${themeId} | largura ${width}px | ` +
                `gap-token ${measurement.computedGapPx}px | blocos ${measurement.blockGapsPx.map((gap) => `${gap}px`).join(',')} | ` +
                `texto mínimo ${measurement.minimumFontSizePx}px | overflow ${measurement.horizontalOverflowPx}px | ` +
                `alvos pequenos ${measurement.smallTargets.length} | OK\n`,
            );
        }
    }
}

async function measureRenderedScene(page: Page): Promise<SceneMeasurement> {
    const spacing = await measureBlockSpacing(page);
    const typography = await measureMinimumTextSize(page);
    const horizontalOverflowPx = await measureHorizontalOverflow(page);
    const smallTargets = await measureSmallTargets(page);
    return { ...spacing, ...typography, horizontalOverflowPx, smallTargets };
}

async function measureBlockSpacing(page: Page): Promise<Pick<SceneMeasurement, 'computedGapPx' | 'blockGapsPx'>> {
    return page.locator(SCENE_SELECTOR).evaluate((main) => {
        const computedGapPx = Number.parseFloat(getComputedStyle(main).rowGap);
        const blocks = Array.from(main.children).filter((child) => child.getBoundingClientRect().height > 0);
        const blockGapsPx = blocks.slice(1).map((block, index) => {
            const previous = blocks[index].getBoundingClientRect();
            return Math.round((block.getBoundingClientRect().top - previous.bottom) * 100) / 100;
        });
        return { computedGapPx, blockGapsPx };
    });
}

async function measureMinimumTextSize(page: Page): Promise<Pick<SceneMeasurement, 'minimumFontSizePx' | 'minimumFontTarget'>> {
    return page.locator(SCENE_SELECTOR).evaluate((main) => {
        const textElements = Array.from(main.querySelectorAll('*')).filter((element) =>
            !element.closest('[aria-hidden="true"],script,style') &&
            Array.from(element.childNodes).some((node) => node.nodeType === Node.TEXT_NODE && Boolean(node.textContent?.trim())),
        );
        main.querySelectorAll('input,select,textarea').forEach((element) => textElements.push(element));
        const sizes = textElements
            .filter((element) => element.getClientRects().length > 0)
            .map((element) => ({
                element,
                size: Number.parseFloat(getComputedStyle(element).fontSize),
                text: element.textContent?.trim().replace(/\s+/g, ' ').slice(0, 48) || element.tagName.toLowerCase(),
            }))
            .filter(({ size }) => Number.isFinite(size));
        if (sizes.length === 0) return { minimumFontSizePx: Number.POSITIVE_INFINITY, minimumFontTarget: 'sem texto' };
        const smallest = sizes.reduce((minimum, current) => current.size < minimum.size ? current : minimum);
        return {
            minimumFontSizePx: smallest.size,
            minimumFontTarget: `${smallest.element.tagName.toLowerCase()} “${smallest.text}”`,
        };
    });
}

async function measureHorizontalOverflow(page: Page): Promise<number> {
    return page.evaluate(() => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - document.documentElement.clientWidth);
}

async function measureSmallTargets(page: Page): Promise<string[]> {
    return page.locator(SCENE_SELECTOR).evaluate((main, minimumTargetSize) =>
        Array.from(main.querySelectorAll('button,a[href],[role="radio"]'))
            .filter((element) => {
                const rectangle = element.getBoundingClientRect();
                return rectangle.width > 0 && rectangle.height > 0 &&
                    (rectangle.width < minimumTargetSize || rectangle.height < minimumTargetSize);
            })
            .map((element) => {
                const rectangle = element.getBoundingClientRect();
                const label = element.getAttribute('aria-label') || element.textContent?.trim() || element.tagName.toLowerCase();
                return `${label}:${Math.round(rectangle.width)}x${Math.round(rectangle.height)}`;
            }),
    MINIMUM_TARGET_SIZE_PX);
}

interface SceneMeasurement {
    computedGapPx: number;
    blockGapsPx: number[];
    minimumFontSizePx: number;
    minimumFontTarget: string;
    horizontalOverflowPx: number;
    smallTargets: string[];
}
