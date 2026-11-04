/**
 * Tabela de trabalho (lote, colunas, edição), relatório, moldura de documento e impressão, medidos em
 * navegador real: foco, teclado, `@media print` e largura de contêiner não existem no `jsdom`.
 *
 * LIMITES DECLARADOS (R18): lê o `dist/` — sem `npm run build` recente mede o build anterior. A impressão
 * é a emulação da mídia (`page.emulateMedia`), não o PDF: mede o que sai do fluxo e o que fica, não a
 * quebra de página. `sarakPrint` tem o `window.print` trocado por um dublê, que não abre diálogo.
 */
import fs from 'node:fs';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { buildHarness } from './build-harness.mjs';

const ENTRY = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures', 'tabela-documento-entry.tsx');
const ROW_COUNT = 200;
const COLUMN_STEP = 16;
const SUBPIXEL = 1;
const PAPER_TEXT = 'rgb(0, 0, 0)';

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

async function open(page: Page, tela = ''): Promise<void> {
    await page.setViewportSize({ width: 1200, height: 900 });
    await page.goto(`${harnessUrl}${tela ? `?tela=${tela}` : ''}`);
}

const editableCell = (page: Page, value: string) => page.getByRole('button', { name: new RegExp(`^Editar .*: ${value}$`) });

async function selectRows(page: Page, count: number): Promise<void> {
    for (let row = 1; row <= count; row += 1) {
        await page.getByRole('checkbox', { name: `Selecionar linha ${row}`, exact: true }).focus();
        await page.keyboard.press('Space');
    }
}

test('lote: a barra conta a seleção, age com os ids e a ação de perigo confirma antes', async ({ page }) => {
    await open(page);
    await expect(page.getByRole('toolbar', { name: 'Ações em lote' })).toHaveCount(0);
    await selectRows(page, 2);
    const bar = page.getByRole('toolbar', { name: 'Ações em lote' });
    await expect(bar.getByRole('status')).toHaveText('2 selecionados');

    await bar.getByRole('button', { name: 'Arquivar' }).click();
    await expect(page.getByTestId('log')).toHaveText('arquivar:1,2');

    await bar.getByRole('button', { name: 'Excluir' }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toContainText('Esta ação vale para 2 itens.');
    await expect(page.getByTestId('log')).toHaveText('arquivar:1,2');
    await dialog.getByRole('button', { name: 'Excluir' }).click();
    await expect(page.getByTestId('log')).toHaveText('excluir:1,2');

    await bar.getByRole('button', { name: 'Limpar seleção' }).click();
    await expect(bar).toHaveCount(0);
});

test('colunas: esconder, reordenar e redimensionar por teclado, com o valor devolvido', async ({ page }) => {
    await open(page);
    const state = page.getByTestId('columns');
    const trigger = page.getByRole('button', { name: 'Colunas' });
    await trigger.focus();
    await page.keyboard.press('Enter');

    const dialog = page.getByRole('dialog');
    const city = dialog.getByRole('checkbox', { name: 'Exibir coluna Cidade' });
    await city.focus();
    await page.keyboard.press('Space');
    await expect(state).toContainText('"hidden":["city"]');
    await expect(page.locator('[role="columnheader"][data-column-id="city"]')).toHaveCount(0);

    const moveUp = dialog.getByRole('button', { name: 'Mover Nota para antes' });
    await moveUp.focus();
    await page.keyboard.press('Enter');
    await expect(state).toContainText('"order":["score","name","city"]');
    await expect(moveUp, 'o foco fica no botão que moveu a coluna').toBeFocused();

    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);

    const handle = page.locator('[data-resize-handle="name"]');
    const before = await page.locator('[role="columnheader"][data-column-id="name"]').evaluate((cell) => cell.getBoundingClientRect().width);
    await handle.focus();
    await page.keyboard.press('ArrowRight');
    await expect(state).toContainText(`"widths":{"name":${before + COLUMN_STEP}}`);
    const after = await page.locator('[role="columnheader"][data-column-id="name"]').evaluate((cell) => cell.getBoundingClientRect().width);
    expect(after).toBeCloseTo(before + COLUMN_STEP, 0);
});

test('edição: teclado, Esc, validação com erro na célula e setas pela grade', async ({ page }) => {
    await open(page);
    const cell = editableCell(page, 'Pessoa 1');
    await cell.focus();
    await page.keyboard.press('Enter');
    const field = page.getByRole('textbox', { name: 'Nome' });
    await expect(field).toBeFocused();
    await page.keyboard.type('Rascunho');
    await page.keyboard.press('Escape');
    await expect(cell, 'Esc cancela e devolve o foco').toBeFocused();
    await expect(page.getByTestId('log')).toHaveText('');

    await page.keyboard.press('Enter');
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Delete');
    await page.keyboard.press('Enter');
    await expect(page.getByText('Obrigatório')).toBeVisible();
    await expect(field).toHaveAttribute('aria-invalid', 'true');
    const message = await page.getByText('Obrigatório').evaluate((node) => {
        const rect = node.getBoundingClientRect();
        const top = document.elementFromPoint(rect.left + 2, rect.top + rect.height / 2);
        return { height: rect.height, covered: !node.contains(top) && !top?.contains(node) };
    });
    expect(message.height).toBeGreaterThan(0);
    expect(message.covered, 'o erro não fica atrás da linha de baixo').toBe(false);

    await page.keyboard.type('Bia');
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('log')).toHaveText('edit:1:name:Bia');
    await expect(cell).toBeFocused();

    await page.keyboard.press('ArrowDown');
    await expect(editableCell(page, 'Pessoa 2')).toBeFocused();
    await page.keyboard.press('ArrowRight');
    await expect(editableCell(page, 'Rio').first()).toBeFocused();
    await expect(page.getByRole('checkbox').first()).not.toBeFocused();
});

test('tom da célula leva ícone e texto, em relatório sem rolagem própria', async ({ page }) => {
    await open(page, 'relatorio');
    const root = page.getByTestId('report').locator('[data-sarak-datatable]');
    await expect(root).toHaveAttribute('data-density', 'report');
    await expect(root.locator('[role="row"]')).toHaveCount(ROW_COUNT + 1);
    const m = await root.evaluate((element) => {
        const tone = element.querySelector('[data-cell-tone="danger"]')!;
        const header = element.querySelector('[role="columnheader"]')!.parentElement!;
        return {
            scrolls: element.scrollHeight > element.clientHeight + 1,
            icon: tone.querySelector('svg') !== null,
            label: tone.querySelector('.sr-only')?.textContent,
            headerBackground: getComputedStyle(header).backgroundColor,
            pageWidth: document.documentElement.scrollWidth,
            viewport: window.innerWidth,
        };
    });
    expect(m.scrolls, 'o relatório cresce com a página').toBe(false);
    expect(m.icon).toBe(true);
    expect(m.label).toBe('Crítico');
    expect(m.headerBackground, 'sem cromo de cartão').toBe('rgba(0, 0, 0, 0)');
    expect(m.pageWidth).toBeLessThanOrEqual(m.viewport);
});

test('impressão: sem cromo nem ações, sem sombra, com a tabela inteira no fluxo', async ({ page }) => {
    await open(page);
    await selectRows(page, 1);
    const shown = await page.locator('[data-sarak-datatable] [role="row"]').count();
    expect(shown, 'na tela a janela é virtual').toBeLessThan(ROW_COUNT);

    await page.emulateMedia({ media: 'print' });
    const root = page.locator('[data-sarak-datatable]');
    await expect(root.locator('[role="row"]')).toHaveCount(ROW_COUNT + 1);
    const m = await root.evaluate((element) => {
        const first = element.querySelectorAll('[role="row"]')[1];
        const last = element.querySelector('[role="row"]:last-child')!;
        const hidden = (selector: string) => [...document.querySelectorAll(selector)].every((node) => getComputedStyle(node).display === 'none');
        return {
            position: getComputedStyle(first).position,
            flowing: last.getBoundingClientRect().top > first.getBoundingClientRect().top,
            overflow: getComputedStyle(element).overflowY,
            chrome: hidden('header:not([data-sarak-content] *), aside:not([data-sarak-content] *)'),
            toolbar: hidden('[data-sarak-table-toolbar], [data-sarak-bulk-bar]'),
            checkboxes: element.querySelectorAll('input[type="checkbox"]').length,
            handles: element.querySelectorAll('[data-resize-handle]').length,
            width: element.getBoundingClientRect().width,
            pageWidth: document.documentElement.getBoundingClientRect().width,
        };
    });
    expect(m.position).toBe('static');
    expect(m.flowing).toBe(true);
    expect(m.overflow).toBe('visible');
    expect(m.chrome, 'cromo fora do papel').toBe(true);
    expect(m.toolbar, 'ações fora do papel').toBe(true);
    expect(m.checkboxes).toBe(0);
    expect(m.handles).toBe(0);
    expect(m.width).toBeLessThanOrEqual(m.pageWidth + SUBPIXEL);

    await page.emulateMedia({ media: 'screen' });
    await expect.poll(() => page.locator('[data-sarak-datatable] [role="row"]').count()).toBeLessThan(ROW_COUNT);
});

test('moldura imprime só o documento, sem escala nem borda, e mantém o cabeçalho dele', async ({ page }) => {
    await open(page, 'documento');
    await expect(page.getByTestId('outside')).toBeVisible();
    await page.emulateMedia({ media: 'print' });
    await expect(page.getByTestId('outside')).toBeHidden();
    await expect(page.getByRole('button', { name: 'Baixar' })).toBeHidden();
    await expect(page.getByTestId('doc-header'), 'o header do documento não é cromo').toBeVisible();
    const sheet = await page.locator('[data-sarak-document]').evaluate((element) => {
        const style = getComputedStyle(element);
        return { zoom: style.zoom, border: style.borderTopStyle };
    });
    expect(sheet).toEqual({ zoom: '1', border: 'none' });
});

test('sarakPrint(element) leva só o elemento ao papel e limpa ao terminar', async ({ page }) => {
    await open(page, 'alvo');
    await page.evaluate(() => { window.print = () => undefined; });
    await page.getByTestId('print').click();
    await page.emulateMedia({ media: 'print' });
    await expect(page.getByTestId('target')).toBeVisible();
    await expect(page.getByTestId('outside')).toBeHidden();
    await page.evaluate(() => window.dispatchEvent(new Event('afterprint')));
    await expect(page.getByTestId('outside')).toBeVisible();
});

test('tema escuro: fora de tabela e documento o texto também escurece no papel', async ({ page }) => {
    await open(page, 'alvo');
    const colorOf = (testId: string) => page.getByTestId(testId).evaluate((element) => getComputedStyle(element).color);
    const lightness = (color: string): number => Math.max(...(color.match(/\d+/g) ?? []).slice(0, 3).map(Number));
    const DARK_THEME_TEXT = 150;
    expect(lightness(await colorOf('card')), 'na tela o tema é escuro').toBeGreaterThan(DARK_THEME_TEXT);
    expect(lightness(await colorOf('target'))).toBeGreaterThan(DARK_THEME_TEXT);

    await page.evaluate(() => { window.print = () => undefined; });
    await page.emulateMedia({ media: 'print' });
    expect(await colorOf('card'), 'cartão comum no conteúdo').toBe(PAPER_TEXT);

    await page.getByTestId('print').evaluate((button: HTMLElement) => button.click());
    await expect(page.getByTestId('target')).toBeVisible();
    expect(await colorOf('target'), 'alvo do sarakPrint, fora do conteúdo').toBe(PAPER_TEXT);
});

test('moldura em contêiner estreito reduz a folha, sem rolagem na página', async ({ page }) => {
    await open(page, 'estreita');
    const m = await page.getByTestId('narrow').evaluate((box) => {
        const sheet = box.querySelector('[data-sarak-document]')!;
        return {
            box: box.getBoundingClientRect().width,
            sheet: sheet.getBoundingClientRect().width,
            pageWidth: document.documentElement.scrollWidth,
            viewport: window.innerWidth,
        };
    });
    expect(m.sheet).toBeLessThanOrEqual(m.box + SUBPIXEL);
    expect(m.sheet, 'a folha acompanha o contêiner, não a janela').toBeGreaterThan(m.box - 4);
    expect(m.pageWidth).toBeLessThanOrEqual(m.viewport);
});
