import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { expect, test } from '@playwright/test';
import { buildHarness } from './build-harness.mjs';
import { sarakSovereignTheme } from '../src/core/Design/presets/themes/sarak-sovereign';
import { cyberpunkneonTheme } from '../src/core/Design/presets/themes/cyberpunk-neon';
import { industrialTerminalTheme } from '../src/core/Design/presets/themes/industrial-terminal';
import { blueprintProtocolTheme } from '../src/core/Design/presets/themes/blueprint-protocol';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ENTRY = path.join(ROOT, 'browser-tests', 'fixtures', 'chrome-theme-identity-entry.tsx');
const TAILWIND_CLI = path.join(ROOT, 'node_modules', '@tailwindcss', 'cli', 'dist', 'index.mjs');
const SOURCE_STYLESHEET = path.join(ROOT, 'src', 'styles', 'sarak-base.css');
/** O estilo esperado da barra é o que o `design` do próprio tema declara, não uma cópia à mão. */
const THEME_STYLES = [sarakSovereignTheme, cyberpunkneonTheme, industrialTerminalTheme, blueprintProtocolTheme].map((theme) => {
    const design = theme.design as Record<string, string>;
    return { id: theme.id, background: design.sidebarBackgroundStyle, active: design.sidebarActiveItemStyle };
});

let harnessDirectory: string | undefined;
let harnessUrl = '';

test.beforeAll(async () => {
    const harness = await buildHarness(ENTRY, { useSourceLibrary: true });
    harnessDirectory = harness.outDir;
    harnessUrl = pathToFileURL(harness.htmlPath).href;
    compileCurrentSourceStyles(harnessDirectory);
});

test.afterAll(() => {
    if (harnessDirectory) fs.rmSync(harnessDirectory, { recursive: true, force: true });
});

test('quatro temas produzem estilos computados diferentes na barra', async ({ page }) => {
    await page.goto(harnessUrl);
    const readout = page.getByTestId('theme-readout');
    await expect(readout).toHaveAttribute('data-theme-id', THEME_STYLES[0].id);

    const computedStyles: string[] = [];
    for (const theme of THEME_STYLES) {
        await page.getByRole('button', { name: theme.id }).click();
        await expect(readout).toHaveAttribute('data-theme-id', theme.id);
        await expect(readout).toHaveAttribute('data-sidebar-background-style', theme.background);
        await expect(readout).toHaveAttribute('data-sidebar-active-style', theme.active);
        const declaredColors = await readDeclaredSidebarColors(readout);
        const normalizedDeclaredColors = await normalizeSidebarColors(page, declaredColors);
        await expect.poll(async () => {
            const style = await readSidebarStyle(page);
            return style.itemTextColor === normalizedDeclaredColors.itemTextColor;
        }).toBe(true);
        const sidebarStyle = await readSidebarStyle(page);
        expect(sidebarStyle.itemTextColor).toBe(normalizedDeclaredColors.itemTextColor);
        expect(sidebarStyle.brandColor).toBe(normalizedDeclaredColors.brandColor);
        expect(sidebarStyle.borderColor).toBe(normalizedDeclaredColors.borderColor);
        computedStyles.push(JSON.stringify(sidebarStyle));
    }

    expect(new Set(computedStyles).size).toBe(THEME_STYLES.length);
});

function compileCurrentSourceStyles(outputDirectory: string): void {
    execFileSync(process.execPath, [
        TAILWIND_CLI,
        '--input', SOURCE_STYLESHEET,
        '--output', path.join(outputDirectory, 'sarak.css'),
        '--minify',
    ], { cwd: ROOT, stdio: 'pipe' });
}

async function readSidebarStyle(page: import('@playwright/test').Page): Promise<Record<string, string>> {
    return page.evaluate(() => {
        const sidebar = document.querySelector('aside')!;
        const inactiveItem = sidebar.querySelector('a[href="/reports"]')!;
        const brand = sidebar.querySelector('.sarak-chrome-brand span.truncate')!;
        const textureLayer = sidebar.querySelector(':scope > div.absolute')!;
        const marker = sidebar.querySelector('a[aria-current="page"] span[aria-hidden="true"]');
        const sidebarStyle = getComputedStyle(sidebar);
        return {
            backgroundColor: sidebarStyle.backgroundColor,
            backgroundImage: sidebarStyle.backgroundImage,
            borderStyle: sidebarStyle.borderStyle,
            borderWidth: sidebarStyle.borderWidth,
            borderColor: sidebarStyle.borderRightColor,
            itemTextColor: getComputedStyle(inactiveItem).color,
            brandColor: getComputedStyle(brand).color,
            markerColor: marker ? getComputedStyle(marker).backgroundColor : 'none',
            textureOpacity: getComputedStyle(textureLayer).opacity,
        };
    });
}

interface DeclaredSidebarColors {
    itemTextColor: string;
    brandColor: string;
    borderColor: string;
}

async function readDeclaredSidebarColors(readout: import('@playwright/test').Locator): Promise<DeclaredSidebarColors> {
    const colors = {
        itemTextColor: await readout.getAttribute('data-sidebar-item-text-color'),
        brandColor: await readout.getAttribute('data-sidebar-brand-color'),
        borderColor: await readout.getAttribute('data-sidebar-border-color'),
    };
    if (!colors.itemTextColor || !colors.brandColor || !colors.borderColor) {
        throw new Error('O tema ativo não declarou todas as cores de identidade da barra.');
    }
    return colors as DeclaredSidebarColors;
}

async function normalizeSidebarColors(
    page: import('@playwright/test').Page,
    colors: DeclaredSidebarColors,
): Promise<DeclaredSidebarColors> {
    return page.evaluate((declaredColors) => {
        const normalize = (value: string): string => {
            const probe = document.createElement('span');
            probe.style.color = value;
            document.body.append(probe);
            const normalized = getComputedStyle(probe).color;
            probe.remove();
            return normalized;
        };
        return {
            itemTextColor: normalize(declaredColors.itemTextColor),
            brandColor: normalize(declaredColors.brandColor),
            borderColor: normalize(declaredColors.borderColor),
        };
    }, colors);
}
