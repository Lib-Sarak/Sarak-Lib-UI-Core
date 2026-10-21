/**
 * Medição, em navegador real, do SarakGantt com `rangeStart`/`rangeEnd` informados: nada desenhado fora do
 * intervalo alarga a área de rolagem (specs/specs/11-testes-e-cobertura.md §7). O `jsdom` não calcula
 * `scrollWidth`, então a largura de rolagem só se prova aqui.
 *
 * Mesmo harness e mesmo artefato dos outros casos (`dist/index.js` + `dist/sarak.css`), cena `?cena=gantt-intervalo`
 * (ver `fixtures/harness-entry.tsx`): intervalo de 20 dias na escala de dia, num host mais estreito que ele, com
 * tarefas antes do intervalo, cruzando cada borda, dentro e depois dele.
 *
 * Régua relacional: a largura do intervalo é a soma das marcas do cabeçalho; a da lista, a caixa dela. Nenhum
 * valor em px escrito à mão.
 *
 * -------------------------------------------------------------------------
 * LIMITES DECLARADOS (R18) — o que esta medição NÃO vê
 * -------------------------------------------------------------------------
 * 1. Só caixas (`getBoundingClientRect`) e larguras de rolagem; nenhum pixel, nenhuma cor.
 * 2. Só Chromium headless, só o tema default, só a escala de dia e o host da cena.
 * 3. Lê o `dist/` — sem `npm run build` recente, mede o build anterior.
 * 4. Não olha o recorte vertical nem o das setas: a geometria delas é dos testes `jsdom` do componente.
 * -------------------------------------------------------------------------
 */
import { test, expect, chromium, type Browser, type Locator, type Page } from '@playwright/test';

const DESKTOP = { width: 1280, height: 900 } as const;
/** Folga de arredondamento de subpixel entre duas medidas. */
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
    await page.goto(`${harnessUrl}?cena=gantt-intervalo`);
    await page.locator('[data-probe="gantt-intervalo"] [data-gantt-scroll]').waitFor();
});

test.afterAll(async () => {
    await browser.close();
});

const inScene = (selector: string): Locator => page.locator(`[data-probe="gantt-intervalo"] ${selector}`);

test.describe('SarakGantt — rangeStart/rangeEnd informados', () => {
    test('a rolagem horizontal vai até o fim do intervalo, e não além, com uma tarefa depois de rangeEnd', async () => {
        const listWidth = await inScene('[data-gantt-list]').evaluate((el) => el.getBoundingClientRect().width);
        const rangeWidth = await inScene('[data-gantt-header] > span').evaluateAll((ticks) =>
            ticks.reduce((sum, tick) => sum + tick.getBoundingClientRect().width, 0));
        const { scrollWidth, clientWidth } = await inScene('[data-gantt-scroll]').evaluate((el) => ({ scrollWidth: el.scrollWidth, clientWidth: el.clientWidth }));

        expect(scrollWidth).toBeGreaterThan(clientWidth);
        expect(Math.abs(scrollWidth - (listWidth + rangeWidth))).toBeLessThanOrEqual(SUBPIXEL);
    });

    test('a tarefa inteiramente fora não tem barra; a que cruza o fim termina na borda do intervalo', async () => {
        expect(await inScene('[data-gantt-bar="depois"]').count()).toBe(0);
        expect(await inScene('[data-gantt-bar="antes"]').count()).toBe(0);
        const timelineRight = await inScene('[data-gantt-timeline]').evaluate((el) => el.getBoundingClientRect().right);
        const barRight = await inScene('[data-gantt-bar="cruza-fim"]').evaluate((el) => el.getBoundingClientRect().right);
        expect(Math.abs(barRight - timelineRight)).toBeLessThanOrEqual(SUBPIXEL);
    });
});
