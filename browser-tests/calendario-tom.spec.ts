/**
 * Medição, em navegador real, do SarakCalendar com um evento de tom FORA da união (`neutral`, como chega de dado
 * solto): o chip continua com fundo visível, igual ao de um evento `primary` (specs/specs/11-testes-e-cobertura.md §7).
 *
 * Cena `?cena=calendario-tom` (ver `fixtures/harness-entry.tsx`), dentro do `SarakUIProvider`, contêiner largo.
 *
 * -------------------------------------------------------------------------
 * LIMITES DECLARADOS (R18) — o que esta medição NÃO vê
 * -------------------------------------------------------------------------
 * 1. Só o `background-color` COMPUTADO do título do chip; nenhum pixel.
 * 2. Só Chromium headless, só o tema default, só o contêiner largo (no estreito o chip é um ponto).
 * 3. Lê o `dist/` — sem `npm run build` recente, mede o build anterior.
 * -------------------------------------------------------------------------
 */
import { test, expect, chromium, type Browser, type Page } from '@playwright/test';

const harnessUrl = process.env.SARAK_CROMO_HARNESS_URL;
if (!harnessUrl) {
    throw new Error('O globalSetup não preparou o harness de CSS para esta execução do Playwright.');
}

let browser: Browser;
let page: Page;

test.beforeAll(async () => {
    browser = await chromium.launch();
    page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await page.goto(`${harnessUrl}?cena=calendario-tom`);
    await page.locator('[data-probe="calendario-tom"] [role="grid"]').waitFor();
});

test.afterAll(async () => {
    await browser.close();
});

const labelBackground = (eventId: string) =>
    page
        .locator(`[data-probe="calendario-tom"] [data-event-id="${eventId}"] span[aria-hidden="true"] + span`)
        .evaluate((el) => getComputedStyle(el).backgroundColor);

test('o chip de tom fora da união tem fundo visível, o mesmo de um evento primary', async () => {
    const unknown = await labelBackground('sem-tom');
    const primary = await labelBackground('primario');
    expect(unknown).not.toBe('rgba(0, 0, 0, 0)');
    expect(unknown).toBe(primary);
});
