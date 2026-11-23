import { test, expect, chromium, type Browser, type Page } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { buildHarness } from './build-harness.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ENTRY = path.join(HERE, 'fixtures', 'harness-entry.tsx');
const THRESHOLD = 4.5;
const modes = [
    { name: 'claro', theme: 'modo-claro' },
    { name: 'escuro', theme: 'modo-escuro' },
] as const;

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

interface ContrastReading {
    ratio: number;
    label: string;
    visualSignature: string;
    hasText: boolean;
}

interface ContrastSample {
    text: string;
    backgrounds: string[];
    visualLayers: string[];
    hasText: boolean;
}

const collectContrastSamples = (button: Element): ContrastSample[] => {
    const elements = [button, ...button.querySelectorAll('*')];
    const textElements = elements.filter((element) =>
        Array.from(element.childNodes).some((node) => node.nodeType === Node.TEXT_NODE && Boolean(node.textContent?.trim())),
    );
    const targets = textElements.length > 0 ? textElements : [button];
    return targets.map((textElement) => {
        const backgrounds: string[] = [];
        const visualLayers: string[] = [];
        let backgroundNode: Element | null = textElement;
        while (backgroundNode) {
            const style = getComputedStyle(backgroundNode);
            if (style.backgroundColor !== 'transparent' && !style.backgroundColor.endsWith(', 0)')) {
                backgrounds.push(style.backgroundColor);
                visualLayers.push(style.backgroundColor);
            }
            if (style.backgroundImage !== 'none') visualLayers.push(style.backgroundImage);
            if (style.opacity !== '1') visualLayers.push(`opacity:${style.opacity}`);
            if (style.filter !== 'none') visualLayers.push(style.filter);
            backgroundNode = backgroundNode.parentElement;
        }
        return { text: getComputedStyle(textElement).color, backgrounds, visualLayers, hasText: textElements.length > 0 };
    });
};

const calculateContrastReadings = (_button: Element, samples: ContrastSample[]): ContrastReading => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) throw new Error('Canvas 2D indisponível para medir contraste.');
    const composite = (layers: string[], base: string): number[] => {
        context.clearRect(0, 0, 1, 1);
        context.fillStyle = base;
        context.fillRect(0, 0, 1, 1);
        layers.forEach((layer) => {
            context.fillStyle = layer;
            context.fillRect(0, 0, 1, 1);
        });
        return Array.from(context.getImageData(0, 0, 1, 1).data).slice(0, 3);
    };
    const luminance = (value: number[]): number => {
        const linear = value.map((channel) => {
            const normalized = channel / 255;
            return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
        });
        return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
    };
    const isDark = Boolean(document.querySelector('.dark'));
    const base = isDark ? '#000000' : '#ffffff';
    const readings = samples.map(({ text, backgrounds, visualLayers }) => {
        const backgroundRgb = composite([...backgrounds].reverse(), base);
        const foregroundRgb = composite([text], `rgb(${backgroundRgb.join(',')})`);
        const foregroundLuminance = luminance(foregroundRgb);
        const backgroundLuminance = luminance(backgroundRgb);
        const ratio = (Math.max(foregroundLuminance, backgroundLuminance) + 0.05)
            / (Math.min(foregroundLuminance, backgroundLuminance) + 0.05);
        return {
            ratio,
            label: `${text} sobre rgba(${backgroundRgb.join(', ')}, 1)`,
            visualSignature: `${text}|${[...visualLayers].reverse().join('|')}`,
        };
    });
    const worst = readings.reduce((lowest, reading) => reading.ratio < lowest.ratio ? reading : lowest);
    return {
        ratio: worst.ratio,
        label: worst.label,
        visualSignature: readings.map(({ visualSignature }) => visualSignature).sort().join('||'),
        hasText: samples[0].hasText,
    };
};

async function contrast(button: import('@playwright/test').Locator): Promise<ContrastReading> {
    const samples = await button.evaluate(collectContrastSamples);
    return button.evaluate(calculateContrastReadings, samples);
}

const hoverChangedColors = (resting: ContrastReading, hovered: ContrastReading): boolean =>
    resting.visualSignature !== hovered.visualSignature;

const hoverFailsContrastRule = (
    resting: ContrastReading,
    hovered: ContrastReading,
    allowUnchangedPanelColors: boolean,
): boolean => {
    if (allowUnchangedPanelColors && !hoverChangedColors(resting, hovered)) return false;
    const minimum = hovered.hasText ? THRESHOLD : 3;
    const contrastDropped = hovered.hasText && hovered.ratio < resting.ratio;
    return hovered.ratio < minimum || contrastDropped;
};

for (const mode of modes) {
    for (const presentation of ['app', 'embarcado'] as const) {
        for (const surface of ['cromo', 'painel'] as const) {
            test(`${surface} ${presentation} ${mode.name}: lista botões abaixo de 4,5:1 no hover`, async () => {
                const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
                const params = new URLSearchParams({ tema: mode.theme });
                if (presentation === 'embarcado') params.set('modo', 'embarcado');
                if (surface === 'painel') params.set('cena', 'painel');
                await page.goto(`${harnessUrl}?${params}`);
                if (surface === 'painel') {
                    await page.getByRole('button', { name: 'Abrir painel' }).click();
                    await page.getByRole('button').nth(1).waitFor({ state: 'visible' });
                }
                const buttons = page.locator('button:visible');
                const total = await buttons.count();
                const failures: Array<{
                    name: string;
                    resting: string;
                    hovered: string;
                    colorsChanged: boolean;
                }> = [];
                const measurements: Array<{
                    name: string;
                    hasText: boolean;
                    resting: string;
                    hovered: string;
                    colorsChanged: boolean;
                }> = [];
                for (let index = 0; index < total; index += 1) {
                    const button = buttons.nth(index);
                    const name = (await button.innerText().catch(() => '')).trim().replace(/\s+/g, ' ')
                        || await button.getAttribute('aria-label') || `button[${index}]`;
                    await page.mouse.move(-1, -1);
                    const resting = await contrast(button);
                    const point = await button.evaluate((element) => {
                        element.scrollIntoView({ block: 'center', inline: 'center' });
                        const rect = element.getBoundingClientRect();
                        return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
                    });
                    await page.mouse.move(point.x, point.y);
                    await page.waitForTimeout(250);
                    const hovered = await contrast(button);
                    const colorsChanged = hoverChangedColors(resting, hovered);
                    if (surface === 'painel') {
                        measurements.push({
                            name,
                            hasText: resting.hasText,
                            resting: `${resting.ratio.toFixed(2)}:1 (${resting.label})`,
                            hovered: `${hovered.ratio.toFixed(2)}:1 (${hovered.label})`,
                            colorsChanged,
                        });
                    }
                    if (hoverFailsContrastRule(resting, hovered, surface === 'painel')) {
                        failures.push({
                            name,
                            resting: `${resting.ratio.toFixed(2)}:1 (${resting.label})`,
                            hovered: `${hovered.ratio.toFixed(2)}:1 (${hovered.label})`,
                            colorsChanged,
                        });
                    }
                }
                console.log(JSON.stringify({
                    surface,
                    presentation,
                    mode: mode.name,
                    total,
                    failures,
                    ...(surface === 'painel' ? { measurements } : {}),
                }, null, 2));
                await page.close();
                expect(total, 'a página precisa expor botões para medir').toBeGreaterThan(0);
                expect(failures, 'o hover não pode reduzir o contraste abaixo de 4,5:1 nem do repouso').toEqual([]);
            });
        }
    }
}

for (const mode of modes) {
    for (const presentation of ['app', 'embarcado'] as const) {
        test(`botão neutro e texto apagado ${presentation} ${mode.name}: preservam 4,5:1 no hover`, async () => {
            const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
            const params = new URLSearchParams({ cena: 'contraste-botoes', tema: mode.theme });
            if (presentation === 'embarcado') params.set('modo', 'embarcado');
            await page.goto(`${harnessUrl}?${params}`);
            for (const probe of ['neutro', 'texto-apagado']) {
                const button = page.locator(`[data-probe="${probe}"]`);
                const rect = await button.boundingBox();
                if (!rect) throw new Error(`Botão ${probe} não tem caixa visível.`);
                await page.mouse.move(-1, -1);
                const resting = await contrast(button);
                await page.mouse.move(rect.x + rect.width / 2, rect.y + rect.height / 2);
                await page.waitForTimeout(250);
                const hovered = await contrast(button);
                expect(hovered.ratio, `${probe} em repouso ${resting.ratio.toFixed(2)}:1; hover ${hovered.ratio.toFixed(2)}:1 (${hovered.label})`).toBeGreaterThanOrEqual(THRESHOLD);
                expect(hovered.ratio, `${probe} não pode perder contraste no hover`).toBeGreaterThanOrEqual(resting.ratio);
            }
            await page.close();
        });
    }
}

test('botão neutro: o estado active mantém o transform sem pintar o fundo global', async () => {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const harness = new URLSearchParams({ cena: 'contraste-botoes', tema: 'modo-claro' });
    await page.goto(`${harnessUrl}?${harness}`);
    const button = page.locator('[data-probe="neutro"]');
    const resting = await button.evaluate((element) => ({
        backgroundColor: getComputedStyle(element).backgroundColor,
        transform: getComputedStyle(element).transform,
    }));
    const box = await button.boundingBox();
    if (!box) throw new Error('O botão neutro não tem caixa visível.');
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.waitForTimeout(250);
    const hovered = await button.evaluate((element) => ({
        backgroundColor: getComputedStyle(element).backgroundColor,
        transform: getComputedStyle(element).transform,
    }));
    await page.mouse.down();
    await page.waitForTimeout(250);
    const active = await button.evaluate((element) => ({
        backgroundColor: getComputedStyle(element).backgroundColor,
        transform: getComputedStyle(element).transform,
    }));
    await page.mouse.up();
    await page.close();
    expect(hovered.backgroundColor).toBe(resting.backgroundColor);
    expect(active.backgroundColor).toBe(resting.backgroundColor);
    expect(hovered.transform).not.toBe(resting.transform);
    expect(active.transform).not.toBe(hovered.transform);
});

const titleCardThemes = [
    { name: 'padrão', theme: undefined },
    { name: 'escuro', theme: 'cyberpunk-neon' },
    { name: 'claro', theme: 'minimalist-airy' },
] as const;

for (const theme of titleCardThemes) {
    test(`SarakTitleCard ${theme.name}: título, subtítulo e etiquetas preservam 4,5:1`, async () => {
        const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
        const params = new URLSearchParams({ cena: 'contraste-card-titulo' });
        if (theme.theme) params.set('tema-ativo', theme.theme);
        await page.goto(`${harnessUrl}?${params}`);

        const card = page.locator('[data-probe="titlecard-contraste"] .sarak-card');
        const capabilityLabels = await card.locator('[data-contrast-part="capability"]').all();
        const parts = [
            card.locator('[data-contrast-part="subtitle"]'),
            card.locator('[data-contrast-part="title"]'),
            ...capabilityLabels,
        ];
        const restingReadings: ContrastReading[] = [];
        for (const part of parts) restingReadings.push(await contrast(part));

        const bounds = await card.boundingBox();
        if (!bounds) throw new Error('SarakTitleCard não tem caixa visível.');
        await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
        await page.waitForTimeout(250);
        const hoveredReadings: ContrastReading[] = [];
        for (const part of parts) hoveredReadings.push(await contrast(part));

        for (let index = 0; index < parts.length; index += 1) {
            expect(
                hoveredReadings[index].ratio,
                `${theme.name}: ${hoveredReadings[index].label}; repouso ${restingReadings[index].ratio.toFixed(2)}:1`,
            ).toBeGreaterThanOrEqual(THRESHOLD);
            // O título muda de cor no hover (mistura com a primária) e pode descer do repouso, nunca abaixo de 4,5:1; as demais partes não mudam.
            if (index !== 1) expect(hoveredReadings[index].ratio, `${theme.name}: hover não pode reduzir o contraste`).toBeGreaterThanOrEqual(restingReadings[index].ratio);
        }
        await page.close();
    });
}
