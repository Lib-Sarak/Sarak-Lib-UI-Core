import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { expect, test, type Page } from '@playwright/test';
import { buildHarness } from './build-harness.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ENTRY = path.join(ROOT, 'browser-tests', 'fixtures', 'plan-124-sidebar-contrast-entry.tsx');
const TAILWIND_CLI = path.join(ROOT, 'node_modules', '@tailwindcss', 'cli', 'dist', 'index.mjs');
const SOURCE_STYLESHEET = path.join(ROOT, 'src', 'styles', 'sarak-base.css');
const MINIMUM_CONTRAST = 4.5;

let harnessDirectory: string | undefined;
let harnessUrl = '';

test.beforeAll(async () => {
    const harness = await buildHarness(ENTRY);
    harnessDirectory = harness.outDir;
    harnessUrl = pathToFileURL(harness.htmlPath).href;
    compileCurrentSourceStyles(harnessDirectory);
});

test.afterAll(() => {
    if (harnessDirectory) fs.rmSync(harnessDirectory, { recursive: true, force: true });
});

test('item inativo mantém contraste mínimo na sidebar escura de um tema claro', async ({ page }) => {
    await page.goto(harnessUrl);
    await expect(page.getByTestId('plan-124-page')).toBeVisible();

    const colors = await readNavigationColors(page);
    expect(calculateLuminance(parseRgb(colors.pageBackground))).toBeGreaterThan(0.9);
    expect(calculateLuminance(parseRgb(colors.sidebarBackground))).toBeLessThan(0.1);
    expect(
        calculateContrast(parseRgb(colors.itemText), parseRgb(colors.sidebarBackground)),
        `texto ${colors.itemText} sobre sidebar ${colors.sidebarBackground}`,
    ).toBeGreaterThanOrEqual(MINIMUM_CONTRAST);
});

function compileCurrentSourceStyles(outputDirectory: string): void {
    execFileSync(process.execPath, [
        TAILWIND_CLI,
        '--input', SOURCE_STYLESHEET,
        '--output', path.join(outputDirectory, 'sarak.css'),
        '--minify',
    ], { cwd: ROOT, stdio: 'pipe' });
}

function readNavigationColors(page: Page): Promise<{
    itemText: string;
    sidebarBackground: string;
    pageBackground: string;
}> {
    return page.evaluate(() => {
        const inactiveItem = document.querySelector('aside nav a[href="/inativa"]');
        const sidebar = document.querySelector('aside');
        if (!inactiveItem || !sidebar) throw new Error('A navegação da sidebar não foi renderizada.');

        return {
            itemText: getComputedStyle(inactiveItem).color,
            sidebarBackground: getComputedStyle(sidebar).backgroundColor,
            pageBackground: getComputedStyle(document.body).backgroundColor,
        };
    });
}

function parseRgb(color: string): readonly [number, number, number] {
    const channels = color.match(/[\d.]+/g)?.slice(0, 3).map(Number);
    if (!channels || channels.length < 3) throw new Error(`Cor RGB computada inválida: ${color}`);
    return [channels[0], channels[1], channels[2]];
}

function calculateContrast(firstColor: readonly number[], secondColor: readonly number[]): number {
    const [lighter, darker] = [calculateLuminance(firstColor), calculateLuminance(secondColor)].sort((a, b) => b - a);
    return (lighter + 0.05) / (darker + 0.05);
}

function calculateLuminance([red, green, blue]: readonly number[]): number {
    const linearize = (channel: number): number => {
        const normalized = channel / 255;
        return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * linearize(red) + 0.7152 * linearize(green) + 0.0722 * linearize(blue);
}
