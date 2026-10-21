/**
 * Medição, em navegador real, do SarakCalendar dentro do `SarakUIProvider` — o que o `jsdom` não enxerga: ele
 * não avalia container query, não resolve a cascata entre o estilo inline e a classe, nem herda as classes do
 * átomo de botão (specs/specs/11-testes-e-cobertura.md §7).
 *
 * Mesmo harness e mesmo artefato dos outros casos (`dist/index.js` + `dist/sarak.css`), cena `?cena=calendario`
 * (ver `fixtures/harness-entry.tsx`): o calendário num contêiner de 1000 px e noutro de 340 px, na mesma página.
 * No estreito o chip é só um ponto e nada rola na horizontal; no largo o ponto some e o título aparece, em
 * caixa normal.
 *
 * -------------------------------------------------------------------------
 * LIMITES DECLARADOS (R18) — o que esta medição NÃO vê
 * -------------------------------------------------------------------------
 * 1. Só valores COMPUTADOS (`display`, `text-transform`) e larguras de rolagem; nenhum pixel, nenhuma cor.
 * 2. Só Chromium headless, só o tema default, só os dois contêineres da cena (1000 e 340 px).
 * 3. Lê o `dist/` — sem `npm run build` recente, mede o build anterior.
 * 4. Não mede teclado, foco nem toque: esses vivem nos testes `jsdom` do componente.
 * -------------------------------------------------------------------------
 */
import { test, expect, chromium, type Browser, type Locator, type Page } from '@playwright/test';

const DESKTOP = { width: 1280, height: 900 } as const;

const harnessUrl = process.env.SARAK_CROMO_HARNESS_URL;
if (!harnessUrl) {
    throw new Error('O globalSetup não preparou o harness de CSS para esta execução do Playwright.');
}

let browser: Browser;
let page: Page;

test.beforeAll(async () => {
    browser = await chromium.launch();
    page = await browser.newPage({ viewport: DESKTOP });
    await page.goto(`${harnessUrl}?cena=calendario`);
    await page.locator('[data-probe="calendario-estreito"] [role="grid"]').waitFor();
});

test.afterAll(async () => {
    await browser.close();
});

async function readComputed(target: Locator, property: string): Promise<string> {
    return target.evaluate((el, prop) => getComputedStyle(el).getPropertyValue(prop), property);
}

/** O primeiro chip do evento de vários dias, dentro do contêiner pedido. */
function chipIn(probe: string): Locator {
    return page.locator(`[data-probe="${probe}"] [data-event-id="sprint"]`).first();
}

/** O ponto é o `span` decorativo do chip; o título, o irmão logo depois dele. */
const dotOf = (chip: Locator): Locator => chip.locator('span[aria-hidden="true"]');
const labelOf = (chip: Locator): Locator => chip.locator('span[aria-hidden="true"] + span');

test.describe('SarakCalendar — contêiner estreito (340 px)', () => {
    test('nada rola na horizontal', async () => {
        const probe = page.locator('[data-probe="calendario-estreito"]');
        const { scrollWidth, clientWidth } = await probe.evaluate((el) => ({ scrollWidth: el.scrollWidth, clientWidth: el.clientWidth }));
        expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
    });

    test('o chip mostra o ponto e esconde o título', async () => {
        const chip = chipIn('calendario-estreito');
        expect(await readComputed(dotOf(chip), 'display')).not.toBe('none');
        // Visível de fato: um `span` inline ignora largura e sumiria com caixa vazia.
        expect(await dotOf(chip).evaluate((el) => el.getBoundingClientRect().width)).toBeGreaterThan(0);
        expect(await readComputed(labelOf(chip), 'display')).toBe('none');
    });
});

test.describe('SarakCalendar — contêiner largo (1000 px)', () => {
    test('o chip esconde o ponto e mostra o título', async () => {
        const chip = chipIn('calendario-largo');
        expect(await readComputed(dotOf(chip), 'display')).toBe('none');
        expect(await readComputed(labelOf(chip), 'display')).not.toBe('none');
    });

    test('o título do evento sai em caixa normal, não na do botão de ação', async () => {
        expect(await readComputed(chipIn('calendario-largo'), 'text-transform')).toBe('none');
    });
});
