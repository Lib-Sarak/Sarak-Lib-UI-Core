/**
 * Medição, em navegador real, do SarakChartEngine da rc.5:
 *   - RÓTULO INTERNO: em `funnel` e `treemap`, o texto escolhido contra o item (cor do item com a opacidade
 *     composta sobre o fundo da página) ≥ 4,5:1, nos temas embarcados × os dois modos; em `pie`, o rótulo
 *     externo contra o fundo da página.
 *   - MARCAS DE EIXO: em largura estreita, com `R$ 200.000,00` no eixo, nenhum texto desenhado sobrepõe outro
 *     nem passa da borda do gráfico, na barra vertical e na horizontal.
 *   - DICA DO FUNIL: mostra o valor recebido, formatado.
 *
 * O canvas não tem DOM: a régua lê a opção resolvida pelo ECharts (cor do rótulo, cor e opacidade do item) e os
 * textos já desenhados (zrender), em `fixtures/plan-147-graficos-entry.tsx`. Lê o `dist/` — sem `npm run build`
 * recente, mede o build anterior.
 */
import { test, expect, chromium, type Browser, type Page } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { buildHarness } from './build-harness.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ENTRY = path.join(HERE, 'fixtures', 'plan-147-graficos-entry.tsx');
const AA_NORMAL_TEXT = 4.5;
const OVERLAP_TOLERANCE = 0.5;
const NARROW_WIDTHS = [260, 320, 360] as const;
const VIEWPORT = { width: 900, height: 1500 } as const;
const MODES = ['light', 'dark'] as const;
const STAGE_NAMES = ['Propostas', 'Aprovadas', 'Faturadas', 'Recusadas'];

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

async function openScene(params: Record<string, string>): Promise<Page> {
    const page = await browser.newPage({ viewport: VIEWPORT });
    await page.goto(`${harnessUrl}?${new URLSearchParams(params).toString()}`);
    for (const id of ['funnel', 'treemap', 'pie', 'bar-narrow', 'bar-horizontal']) {
        await page.locator(`[data-probe="${id}"] canvas`).first().waitFor({ timeout: 15_000 });
    }
    await page.waitForTimeout(400);
    return page;
}

interface Box { text: string; x: number; y: number; w: number; h: number }
interface Contrast { name: string; ratio: number; label: string; fill: string; opacity: number }

const fmt = (rows: Contrast[]): string => rows.map((row) => `${row.name}=${row.ratio.toFixed(2)}(${row.label} em ${row.fill}@${row.opacity})`).join(' ');

test.describe('rótulo interno ≥ 4,5:1 em todos os temas × modos', () => {
    test('funil, treemap e pizza', async () => {
        const probe = await openScene({});
        const ids = await probe.evaluate(() => (window as unknown as { __plan147: { ids: string[] } }).__plan147.ids);
        await probe.close();
        expect(ids.length).toBeGreaterThanOrEqual(19);

        const failures: string[] = [];
        for (const themeId of ids) {
            for (const mode of MODES) {
                const page = await openScene({ tema: themeId, modo: mode });
                const read = await page.evaluate(() => {
                    const api = (window as unknown as { __plan147: any }).__plan147;
                    return { funnel: api.labelContrast('funnel'), treemap: api.labelContrast('treemap'), pie: api.pieLabelContrast('pie') };
                });
                await page.close();
                if (process.env.SARAK_147_VERBOSE) console.log(themeId, mode, fmt(read.funnel), '|', fmt(read.treemap), '| pie', read.pie.toFixed(2));
                for (const type of ['funnel', 'treemap'] as const) {
                    const rows = (read[type] as Contrast[]).filter((row) => STAGE_NAMES.includes(row.name));
                    expect(rows.length, `${themeId}/${mode}/${type} sem itens`).toBe(4);
                    const worst = rows.filter((row) => !(row.ratio >= AA_NORMAL_TEXT));
                    if (worst.length > 0) failures.push(`${themeId}/${mode}/${type}: ${fmt(worst)}`);
                }
                if (!(read.pie >= AA_NORMAL_TEXT)) failures.push(`${themeId}/${mode}/pie: ${read.pie.toFixed(2)}`);
            }
        }
        expect(failures, failures.join('\n')).toEqual([]);
    });
});

function overlaps(a: Box, b: Box): boolean {
    return a.x + a.w - b.x > OVERLAP_TOLERANCE && b.x + b.w - a.x > OVERLAP_TOLERANCE
        && a.y + a.h - b.y > OVERLAP_TOLERANCE && b.y + b.h - a.y > OVERLAP_TOLERANCE;
}

function problems(read: { width: number; height: number; boxes: Box[] }): string[] {
    const found: string[] = [];
    read.boxes.forEach((box, index) => {
        const outside = box.x < -OVERLAP_TOLERANCE || box.y < -OVERLAP_TOLERANCE
            || box.x + box.w > read.width + OVERLAP_TOLERANCE || box.y + box.h > read.height + OVERLAP_TOLERANCE;
        if (outside) found.push(`corte: "${box.text}" x=${box.x.toFixed(1)}..${(box.x + box.w).toFixed(1)} em ${read.width}x${read.height}`);
        read.boxes.slice(index + 1).forEach((other) => {
            if (overlaps(box, other)) found.push(`sobreposição: "${box.text}" × "${other.text}"`);
        });
    });
    return found;
}

test.describe('a régua de marcas', () => {
    test('acusa sobreposição e corte em caixas conhecidas', () => {
        const chart = { width: 100, height: 100 };
        const apart = [{ text: 'a', x: 0, y: 0, w: 20, h: 10 }, { text: 'b', x: 40, y: 0, w: 20, h: 10 }];
        expect(problems({ ...chart, boxes: apart })).toEqual([]);
        expect(problems({ ...chart, boxes: [apart[0], { text: 'c', x: 10, y: 5, w: 20, h: 10 }] })).toHaveLength(1);
        expect(problems({ ...chart, boxes: [{ text: 'd', x: 90, y: 0, w: 20, h: 10 }] })).toHaveLength(1);
    });
});

test.describe('marcas de eixo em largura estreita', () => {
    for (const width of NARROW_WIDTHS) {
        for (const id of ['bar-narrow', 'bar-horizontal'] as const) {
            test(`${id} a ${width}px: sem sobreposição nem corte, com o valor em moeda`, async () => {
                const page = await openScene({ largura: String(width) });
                const read = await page.evaluate((target) =>
                    (window as unknown as { __plan147: any }).__plan147.textBoxes(target) as { width: number; height: number; boxes: Box[] }, id);
                await page.close();
                const texts = read.boxes.map((box) => box.text.replace(/\s/g, ' '));
                expect(texts.some((text) => /R\$ ?\d/.test(text)), `sem rótulo em moeda: ${texts.join(' | ')}`).toBe(true);
                expect(problems(read), texts.join(' | ')).toEqual([]);
            });
        }
    }
});

test.describe('dica do funil', () => {
    test('mostra o valor recebido, formatado, e não o normalizado', async () => {
        const page = await openScene({});
        const tip = await page.evaluate(() => (window as unknown as { __plan147: any }).__plan147.funnelTip('funnel') as string);
        await page.close();
        expect(tip.replace(/\s/g, ' ')).toContain('R$ 200.000,00');
    });
});
