import { test, expect, chromium, type Browser, type Page } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { buildHarness } from './build-harness.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ENTRY = path.join(HERE, 'fixtures', 'plan-122-preview-mode-entry.tsx');

const rgbChannels = (color: string): [number, number, number] => {
    const values = color.match(/[\d.]+/g)?.slice(0, 3).map(Number);
    if (!values || values.length !== 3) throw new Error(`Cor computada fora do formato RGB: ${color}`);
    return [values[0], values[1], values[2]];
};

const relativeLuminance = (color: string): number => {
    const linearize = (channel: number): number => {
        const normalized = channel / 255;
        return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
    };
    const [red, green, blue] = rgbChannels(color);
    return 0.2126 * linearize(red) + 0.7152 * linearize(green) + 0.0722 * linearize(blue);
};

const contrastRatio = (foreground: string, background: string): number => {
    const luminances = [relativeLuminance(foreground), relativeLuminance(background)].sort((left, right) => right - left);
    return (luminances[0] + 0.05) / (luminances[1] + 0.05);
};

/** `#rrggbb` na forma que o navegador computa (`rgb(r, g, b)`). */
const asComputed = (page: Page, color: string): Promise<string> =>
    page.evaluate((value) => {
        const el = document.createElement('div');
        el.style.backgroundColor = value;
        document.body.appendChild(el);
        const computed = getComputedStyle(el).backgroundColor;
        el.remove();
        return computed;
    }, color);

const sovereignBody = (page: Page, mode: 'light' | 'dark' | 'lightSurface'): Promise<string> =>
    page.evaluate((key) => (window as unknown as { __sovereignBody: Record<string, string> }).__sovereignBody[key], mode)
        .then((color) => asComputed(page, color));

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

test('a prévia e os cartões acompanham a preferência clara e o toggle alterna nos dois sentidos', async () => {
    const page = await browser.newPage();
    const pageErrors: string[] = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));

    await page.goto(harnessUrl);
    const previewSurface = page.locator('.sarak-device-desktop > div.absolute.inset-0.z-0');
    const previewToggle = page.locator('.sarak-device-desktop').getByRole('button', { name: 'Modo Escuro' });

    await expect(previewToggle).toBeVisible();
    const lightBody = await sovereignBody(page, 'light');
    const darkBody = await sovereignBody(page, 'dark');
    const lightSurface = await sovereignBody(page, 'lightSurface');
    await expect.poll(() => previewSurface.evaluate((surface) => getComputedStyle(surface).backgroundColor))
        .toBe(lightBody);

    await page.getByRole('button', { name: /^Tema/ }).click();
    const themeCard = page.getByRole('button', { name: /Sarak Sovereign/i });
    await expect(themeCard).toBeVisible();
    const themeCardSurface = themeCard.locator(':scope > div').first();
    await expect.poll(() => themeCardSurface.evaluate((surface) => getComputedStyle(surface).backgroundColor))
        .toBe(lightSurface);

    await previewToggle.click();
    const darkModeToggle = page.locator('.sarak-device-desktop').getByRole('button', { name: 'Modo Claro' });
    await expect(darkModeToggle).toBeVisible();
    await expect.poll(() => previewSurface.evaluate((surface) => getComputedStyle(surface).backgroundColor))
        .toBe(darkBody);

    await darkModeToggle.click();
    await expect(page.locator('.sarak-device-desktop').getByRole('button', { name: 'Modo Escuro' })).toBeVisible();
    await expect.poll(() => previewSurface.evaluate((surface) => getComputedStyle(surface).backgroundColor))
        .toBe(lightBody);
    expect(pageErrors).toEqual([]);

    await page.close();
});

test('o painel mede o container: coluna e prévia lado a lado e, estreito, empilhados com a prévia ao alcance', async () => {
    const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
    await page.goto(harnessUrl);

    const panelHost = page.getByTestId('plan-122-panel-host');
    const column = page.locator('.sarak-panel-column');
    const previewFrame = page.getByTestId('live-preview-frame');
    const box = async (locator: typeof column) => (await locator.boundingBox()) ?? { x: 0, y: 0, width: 0, height: 0 };

    const wide = { column: await box(column), preview: await box(previewFrame) };
    expect(wide.preview.x).toBeGreaterThanOrEqual(wide.column.x + wide.column.width - 1);

    await panelHost.evaluate((element) => { (element as HTMLElement).style.width = '500px'; });
    await expect.poll(async () => (await box(previewFrame)).y > (await box(column)).y).toBe(true);
    // A largura da coluna anima junto com a troca de disposição: espera assentar antes de medir.
    await expect.poll(async () => (await box(column)).width).toBeGreaterThan(400);
    const narrow = { column: await box(column), preview: await box(previewFrame) };
    expect(narrow.preview.width).toBeGreaterThan(300);

    // O painel rola e a prévia fica ao alcance: rolar até ela a põe dentro da área visível do host.
    await previewFrame.scrollIntoViewIfNeeded();
    const host = await box(panelHost as unknown as typeof column);
    const reached = await box(previewFrame);
    expect(reached.y).toBeGreaterThanOrEqual(host.y - 1);
    expect(reached.y).toBeLessThan(host.y + host.height);

    await panelHost.evaluate((element) => { (element as HTMLElement).style.width = '1600px'; });
    await expect.poll(async () => (await box(previewFrame)).x > (await box(column)).x + 200).toBe(true);
    await page.close();
});

test('option mantém o modo efetivo e contraste mínimo em dois temas claros e dois escuros', async () => {
    const page = await browser.newPage();
    await page.goto(harnessUrl);

    const themeModes = [
        ['sarak-sovereign', 'dark'],
        ['cyberpunk-neon', 'dark'],
        ['neo-brutalism', 'light'],
        ['minimalist-airy', 'light'],
    ] as const;

    for (const [themeId, expectedMode] of themeModes) {
        const select = page.getByTestId(`plan-122-select-${themeId}`);
        const computedStyle = await select.locator('option').evaluate((option) => {
            const optionStyle = getComputedStyle(option);
            const selectStyle = getComputedStyle(option.parentElement as HTMLSelectElement);
            return {
                color: optionStyle.color,
                backgroundColor: optionStyle.backgroundColor,
                colorScheme: selectStyle.colorScheme,
            };
        });

        expect(computedStyle.colorScheme).toBe(expectedMode);
        expect(contrastRatio(computedStyle.color, computedStyle.backgroundColor)).toBeGreaterThanOrEqual(4.5);
    }

    await page.close();
});
