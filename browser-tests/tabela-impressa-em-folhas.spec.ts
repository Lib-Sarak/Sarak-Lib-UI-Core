/**
 * A tabela impressa em várias folhas, medida no PDF de verdade (`page.pdf()`, A4) e lido com o
 * `pdfjs-dist`: a emulação de mídia não divide o conteúdo em folhas, então só o PDF prova a quebra de
 * página, o cabeçalho por folha e o grupo recolhido na tela que sai aberto no papel.
 *
 * LIMITES DECLARADOS (R18): lê o `dist/` — sem `npm run build` recente mede o build anterior. "Linha
 * cortada" se mede pelo texto: toda linha de dado tem várias linhas de texto, e o texto inteiro dela tem de
 * cair numa folha só.
 */
import fs from 'node:fs';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { buildHarness } from './build-harness.mjs';

const ENTRY = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures', 'tabela-folhas-entry.tsx');
const ROW_COUNT = 200;
const POINT_TOLERANCE = 0.75;
const HEADER_LABELS = ['Nome', 'Nota', 'Cidade'];

interface TextItem { str: string; x: number; y: number }
interface PdfPage { items: TextItem[] }

let harnessDirectory: string;
let harnessUrl: string;

test.beforeAll(async () => {
    const harness = await buildHarness(ENTRY);
    harnessDirectory = harness.outDir;
    harnessUrl = pathToFileURL(harness.htmlPath).href;
});

test.afterAll(() => {
    if (harnessDirectory) fs.rmSync(harnessDirectory, { recursive: true, force: true });
});

async function open(page: Page, screenName: string): Promise<void> {
    await page.setViewportSize({ width: 1200, height: 900 });
    await page.goto(`${harnessUrl}?tela=${screenName}`);
}

async function readPdf(page: Page): Promise<PdfPage[]> {
    const bytes = await page.pdf({ format: 'A4', printBackground: true });
    const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
    const document = await pdfjs.getDocument({ data: new Uint8Array(bytes), useSystemFonts: true }).promise;
    const pages: PdfPage[] = [];
    for (let number = 1; number <= document.numPages; number += 1) {
        const content = await (await document.getPage(number)).getTextContent();
        const items = content.items.flatMap((item) => ('str' in item && item.str.trim() ? [{ str: item.str.trim(), x: item.transform[4], y: item.transform[5] }] : []));
        pages.push({ items });
    }
    return pages;
}

const rowItems = (pdfPage: PdfPage, prefix: string): TextItem[] =>
    pdfPage.items.filter((item) => item.str.startsWith(`${prefix} `)).sort((a, b) => b.y - a.y);

const topOf = (pdfPage: PdfPage): number => Math.max(...pdfPage.items.map((item) => item.y));

const MIN_LINES = 3;
const LINE_VARIATIONS = 3;
/** O PDF junta linhas de texto seguidas num item só (`r1l1r1l2…`): lê-se cada token dentro do item. */
const LINE_TOKEN = /r(\d+)l\d+/g;

/**
 * Cada linha de dado tem de 3 a 5 linhas de texto (`r<id>l<n>`, ver a fixture). Uma quebra de folha no meio
 * de uma linha deixa parte desse texto numa folha e parte na seguinte; aqui todo o texto de cada linha tem de
 * estar numa folha só, e as linhas têm de ter mesmo várias linhas de texto para o corte poder acontecer.
 */
function expectNoCutRow(pages: PdfPage[]): void {
    const sheetsOf = new Map<number, Set<number>>();
    const linesOfRow = new Map<number, number>();
    pages.forEach((pdfPage, index) => pdfPage.items.forEach((item) => {
        for (const match of item.str.matchAll(LINE_TOKEN)) {
            const id = Number(match[1]);
            sheetsOf.set(id, (sheetsOf.get(id) ?? new Set()).add(index + 1));
            linesOfRow.set(id, (linesOfRow.get(id) ?? 0) + 1);
        }
    }));
    expect(sheetsOf.size, 'linhas com texto no PDF').toBe(ROW_COUNT);
    const cut = [...sheetsOf].filter(([, sheets]) => sheets.size > 1).map(([id, sheets]) => `linha ${id} nas folhas ${[...sheets].join(' e ')}`);
    expect(cut, 'linhas cortadas entre duas folhas').toEqual([]);
    linesOfRow.forEach((count, id) => expect(count, `linha ${id}: linhas de texto no PDF`).toBe(MIN_LINES + (id % LINE_VARIATIONS)));
}

function expectHeaderPerPage(pages: PdfPage[]): void {
    pages.forEach((pdfPage, index) => {
        const top = topOf(pdfPage);
        const topTexts = pdfPage.items.filter((item) => Math.abs(item.y - top) <= POINT_TOLERANCE).map((item) => item.str);
        expect(topTexts, `folha ${index + 1}: o cabeçalho no topo`).toEqual(expect.arrayContaining(HEADER_LABELS));
    });
}

function expectAllRows(pages: PdfPage[], prefix: string): void {
    const labels = pages.flatMap((pdfPage) => rowItems(pdfPage, prefix).map((item) => item.str));
    const expected = Array.from({ length: ROW_COUNT }, (_, index) => `${prefix} ${index + 1}`);
    expect(labels.length, `linhas no PDF (${pages.length} folhas)`).toBe(ROW_COUNT);
    expect([...labels].sort()).toEqual([...expected].sort());
}

test('SarakDataTable: 200 linhas em várias folhas, cabeçalho em cada uma, sem linha cortada', async ({ page }) => {
    await open(page, 'tabela');
    const pages = await readPdf(page);
    expect(pages.length, 'a tabela ocupa mais de uma folha').toBeGreaterThan(1);
    expectAllRows(pages, 'Pessoa');
    expectHeaderPerPage(pages);
    expectNoCutRow(pages);
});

test('SarakDataTable com groupBy: o grupo recolhido na tela sai aberto e a tela volta recolhida', async ({ page }) => {
    await open(page, 'grupo');
    const toggle = page.locator('[data-sarak-group="Lima"] button');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');

    const pages = await readPdf(page);
    expectAllRows(pages, 'Pessoa');
    expectHeaderPerPage(pages);
    expectNoCutRow(pages);

    await page.emulateMedia({ media: 'screen' });
    await expect(toggle, 'a tela volta recolhida').toHaveAttribute('aria-expanded', 'false');
});

test('SarakDataGrid: 200 linhas em várias folhas, sem linha cortada', async ({ page }) => {
    await open(page, 'planilha');
    const pages = await readPdf(page);
    expect(pages.length, 'a planilha ocupa mais de uma folha').toBeGreaterThan(1);
    expectAllRows(pages, 'Linha');
    expectNoCutRow(pages);
});
