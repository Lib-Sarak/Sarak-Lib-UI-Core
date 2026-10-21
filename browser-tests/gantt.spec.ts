/**
 * Medição, em navegador real, do SarakGantt dentro do `SarakUIProvider` — o que o `jsdom` não enxerga: ele não
 * calcula layout, não rola, não aplica `position: sticky` nem container query (specs/specs/11-testes-e-cobertura.md §7).
 *
 * Mesmo harness e mesmo artefato dos outros casos (`dist/index.js` + `dist/sarak.css`), cena `?cena=gantt` (ver
 * `fixtures/harness-entry.tsx`): 30 tarefas, 8 dependências (uma para tarefa inexistente), escala de dia num
 * contêiner de 1000 px e de semana noutro de 340 px. As datas partem de hoje.
 *
 * Régua relacional: a largura de um dia é medida na própria marca do cabeçalho; o alinhamento da lista com a
 * linha do tempo, pelo topo de uma linha contra o da outra. Nenhum valor em px escrito à mão.
 *
 * -------------------------------------------------------------------------
 * LIMITES DECLARADOS (R18) — o que esta medição NÃO vê
 * -------------------------------------------------------------------------
 * 1. Só caixas (`getBoundingClientRect`), larguras de rolagem e valores COMPUTADOS; nenhum pixel, nenhuma cor.
 * 2. Só Chromium headless, só o tema default, só os dois contêineres da cena.
 * 3. Lê o `dist/` — sem `npm run build` recente, mede o build anterior.
 * 4. Rola por `scrollTop`/`scrollLeft`, não por roda nem toque; não mede inércia nem gesto em aparelho.
 * 5. Não mede teclado nem leitor de tela: esses vivem nos testes `jsdom` do componente.
 * -------------------------------------------------------------------------
 */
import { test, expect, chromium, type Browser, type Locator, type Page } from '@playwright/test';

const DESKTOP = { width: 1280, height: 900 } as const;
/** Folga de arredondamento de subpixel entre duas caixas medidas. */
const SUBPIXEL = 1;

const harnessUrl = process.env.SARAK_CROMO_HARNESS_URL;
if (!harnessUrl) {
    throw new Error('O globalSetup não preparou o harness de CSS para esta execução do Playwright.');
}

let browser: Browser;
let page: Page;

test.beforeAll(async () => {
    browser = await chromium.launch();
    page = await browser.newPage({ viewport: DESKTOP });
    await page.goto(`${harnessUrl}?cena=gantt`);
    await page.locator('[data-probe="gantt-estreito"] [data-gantt-scroll]').waitFor();
});

test.afterAll(async () => {
    await browser.close();
});

const inWide = (selector: string): Locator => page.locator(`[data-probe="gantt-largo"] ${selector}`).first();
const box = (target: Locator) => target.evaluate((el) => el.getBoundingClientRect().toJSON() as DOMRect);
const pageScrollsHorizontally = () =>
    page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);

async function scrollRegion(region: Locator, position: { top?: number; left?: number }): Promise<void> {
    await region.evaluate((el, { top, left }) => {
        if (top !== undefined) el.scrollTop = top;
        if (left !== undefined) el.scrollLeft = left;
    }, position);
}

test.describe('SarakGantt — contêiner largo (1000 px, escala de dia)', () => {
    test('a linha do tempo rola na horizontal e a página não', async () => {
        const region = inWide('[data-gantt-scroll]');
        const { scrollWidth, clientWidth } = await region.evaluate((el) => ({ scrollWidth: el.scrollWidth, clientWidth: el.clientWidth }));
        expect(scrollWidth).toBeGreaterThan(clientWidth);
        expect(await pageScrollsHorizontally()).toBe(false);
    });

    test('a rolagem vertical da lista e da linha do tempo anda junta', async () => {
        const region = inWide('[data-gantt-scroll]');
        const listRow = inWide('[data-gantt-list-row="t20"]');
        const timelineRow = inWide('[data-gantt-row="t20"]');
        await scrollRegion(region, { top: 0 });
        const before = await box(listRow);
        await scrollRegion(region, { top: before.height * 8 });
        const [list, timeline] = [await box(listRow), await box(timelineRow)];
        expect(before.top - list.top).toBeGreaterThan(0);
        expect(Math.abs(list.top - timeline.top)).toBeLessThanOrEqual(SUBPIXEL);
        await scrollRegion(region, { top: 0 });
    });

    test('o cabeçalho de datas fica fixo ao rolar na vertical, e a lista fica fixa ao rolar na horizontal', async () => {
        const region = inWide('[data-gantt-scroll]');
        const header = inWide('[data-gantt-header]');
        const list = inWide('[data-gantt-list]');
        const regionBox = await box(region);
        const clientTop = await region.evaluate((el) => el.clientTop);
        const clientLeft = await region.evaluate((el) => el.clientLeft);
        await scrollRegion(region, { top: regionBox.height, left: regionBox.width });
        expect(Math.abs((await box(header)).top - (regionBox.top + clientTop))).toBeLessThanOrEqual(SUBPIXEL);
        expect(Math.abs((await box(list)).left - (regionBox.left + clientLeft))).toBeLessThanOrEqual(SUBPIXEL);
        await scrollRegion(region, { top: 0, left: 0 });
    });

    test('a barra de uma tarefa de 3 dias tem a largura de 3 dias, medida na marca do cabeçalho', async () => {
        const dayWidth = (await box(inWide('[data-gantt-header] span'))).width;
        const bar = await box(inWide('[data-gantt-bar="t0"]'));
        expect(Math.abs(bar.width - 3 * dayWidth)).toBeLessThanOrEqual(SUBPIXEL);
    });

    test('o marcador de hoje existe, dentro da linha do tempo', async () => {
        const today = await box(inWide('[data-gantt-today]'));
        const timeline = await box(inWide('[data-gantt-timeline]'));
        expect(today.left).toBeGreaterThanOrEqual(timeline.left);
        expect(today.left).toBeLessThanOrEqual(timeline.right);
        expect(today.height).toBeGreaterThan(0);
    });

    test('desenha as 7 setas válidas, ignora a dependência inexistente, e a barra sai em caixa normal', async () => {
        expect(await page.locator('[data-probe="gantt-largo"] [data-gantt-arrow]').count()).toBe(7);
        const textTransform = await inWide('[data-gantt-bar="t0"]').evaluate((el) => getComputedStyle(el).textTransform);
        expect(textTransform).toBe('none');
    });
});

/** Alfa do `background-color` computado (`rgb()` = 1). */
const backgroundAlpha = (target: Locator) =>
    target.evaluate((el) => {
        const match = getComputedStyle(el).backgroundColor.match(/rgba?\(([^)]+)\)/);
        const parts = match ? match[1].split(',').map((part) => Number(part.trim())) : [];
        return parts.length === 4 ? parts[3] : parts.length === 3 ? 1 : 0;
    });

test.describe('SarakGantt — o que fica preso cobre o que rola por baixo', () => {
    test('a lista, o cabeçalho dela e o cabeçalho de datas têm fundo opaco (o cartão translúcido do tema não basta)', async () => {
        const list = inWide('[data-gantt-list]');
        expect(await backgroundAlpha(list)).toBe(1);
        expect(await backgroundAlpha(list.locator('> div').first())).toBe(1);
        expect(await backgroundAlpha(inWide('[data-gantt-header]'))).toBe(1);
    });

    test('nenhuma marca do cabeçalho corta o próprio rótulo', async () => {
        const clipped = await page.locator('[data-gantt-header] > span').evaluateAll((ticks) =>
            ticks.filter((tick) => tick.scrollWidth > tick.clientWidth + 1).map((tick) => tick.textContent));
        expect(clipped).toEqual([]);
    });
});

test.describe('SarakGantt — contêiner estreito (340 px, escala de semana)', () => {
    test('nada da página rola na horizontal; só a área do cronograma', async () => {
        const probe = page.locator('[data-probe="gantt-estreito"]');
        const { scrollWidth, clientWidth } = await probe.evaluate((el) => ({ scrollWidth: el.scrollWidth, clientWidth: el.clientWidth }));
        expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
        expect(await pageScrollsHorizontally()).toBe(false);
    });

    test('a lista vira a coluna estreita, sem o grupo', async () => {
        const narrowList = await box(page.locator('[data-probe="gantt-estreito"] [data-gantt-list]'));
        const wideList = await box(inWide('[data-gantt-list]'));
        expect(narrowList.width).toBeLessThan(wideList.width);
        const group = page.locator('[data-probe="gantt-estreito"] [data-gantt-list-row="t0"] span').nth(1);
        expect(await group.evaluate((el) => getComputedStyle(el).display)).toBe('none');
    });
});
