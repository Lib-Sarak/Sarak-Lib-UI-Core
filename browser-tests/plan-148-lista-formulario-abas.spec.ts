/**
 * Linha de recurso compacta, métrica única com link, afixo dentro do campo e abas que não transbordam,
 * medidos em navegador real (o `jsdom` não resolve container query nem layout).
 *
 * LIMITES DECLARADOS (R18): lê o `dist/` — sem `npm run build` recente mede o build anterior; mede
 * geometria (larguras, alturas, contagem de linhas) e foco, não pixels nem o tema em si.
 */
import fs from 'node:fs';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { buildHarness } from './build-harness.mjs';

const ENTRY = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures', 'plan-148-entry.tsx');
const TOUCH_TARGET_MIN = 44;
const SUBPIXEL = 1;

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

async function open(page: Page): Promise<void> {
    await page.setViewportSize({ width: 1200, height: 1000 });
    await page.goto(harnessUrl);
    await expect(page.getByTestId('row-wide')).toBeVisible();
    // O campo anima o padding (`transition-all`); a medida só vale depois de a animação assentar.
    await page.evaluate(() => Promise.all(document.getAnimations().map((animation) => animation.finished)));
}

test('linha inline: menor que a empilhada, título corta, ação não passa da borda, empilha em contêiner estreito', async ({ page }) => {
    await open(page);
    const m = await page.evaluate(() => {
        const rect = (id: string) => document.querySelector(`[data-testid="${id}"]`)!.getBoundingClientRect();
        const heading = (id: string) => document.querySelector<HTMLElement>(`[data-testid="${id}"] h3`)!;
        const buttons = (id: string) => [...document.querySelectorAll<HTMLElement>(`[data-testid="${id}"] button`)];
        return {
            wide: rect('row-wide').height,
            stacked: rect('row-stacked').height,
            narrow: rect('row-narrow').height,
            wideTitleClipped: heading('row-wide').scrollWidth > heading('row-wide').clientWidth,
            wideTitleOverflow: getComputedStyle(heading('row-wide')).textOverflow,
            narrowButtons: buttons('row-narrow').map((b) => b.getBoundingClientRect().right),
            narrowRight: rect('row-narrow').right,
            wideButtonsTops: new Set(buttons('row-wide').map((b) => Math.round(b.getBoundingClientRect().top))).size,
            wideTitleTop: heading('row-wide').getBoundingClientRect().top,
            wideButtonTop: buttons('row-wide')[0].getBoundingClientRect().top,
        };
    });
    expect(m.wide, 'inline compacta é mais baixa que a empilhada').toBeLessThan(m.stacked);
    expect(m.wideTitleOverflow).toBe('ellipsis');
    expect(m.wideTitleClipped, 'título longo é cortado, não quebrado').toBe(true);
    expect(m.wideButtonsTops, 'ações lado a lado em contêiner largo').toBe(1);
    expect(m.wideButtonTop, 'ação alinhada ao título, não abaixo').toBeLessThan(m.wideTitleTop + m.wide);
    for (const right of m.narrowButtons) expect(right).toBeLessThanOrEqual(m.narrowRight + SUBPIXEL);
    expect(m.narrow, 'em 320 px a linha empilha e fica mais alta').toBeGreaterThan(m.wide);
});

test('uma métrica preenche a célula e o link responde ao teclado', async ({ page }) => {
    await open(page);
    const m = await page.evaluate(() => {
        const wrapper = document.querySelector('[data-testid="stats-one"]')!.getBoundingClientRect();
        const card = document.querySelector<HTMLElement>('[data-testid="stats-one"] .card')!.getBoundingClientRect();
        const label = document.querySelector('[data-testid="stats-one"] span.uppercase')!.getBoundingClientRect();
        return { wrapper: wrapper.width, card: card.width, labelHeight: label.height };
    });
    expect(m.card).toBeGreaterThanOrEqual(m.wrapper - SUBPIXEL);
    const link = page.getByTestId('stats-one').getByRole('link', { name: 'Pedidos em aberto no mês' });
    await page.keyboard.press('Tab');
    await link.focus();
    await expect(link).toBeFocused();
    await page.keyboard.press('Enter');
    expect(new URL(page.url()).hash).toBe('#pedidos');
});

test('afixo dentro: campos de uma linha mantêm a mesma largura e o texto não cobre o afixo', async ({ page }) => {
    await open(page);
    const m = await page.evaluate(() => {
        const input = (name: string) => document.querySelector<HTMLInputElement>(`input[aria-label="${name}"]`)!;
        const prefix = document.querySelector<HTMLElement>(`#${CSS.escape(input('inside').id)}-prefix`)!;
        const suffix = document.querySelector<HTMLElement>(`#${CSS.escape(input('inside').id)}-suffix`)!;
        const box = input('inside').getBoundingClientRect();
        const style = getComputedStyle(input('inside'));
        return {
            plain: input('plain').getBoundingClientRect().width,
            inside: box.width,
            outside: input('outside').getBoundingClientRect().width,
            prefixInside: prefix.getBoundingClientRect().left >= box.left && prefix.getBoundingClientRect().right <= box.right,
            suffixInside: suffix.getBoundingClientRect().left >= box.left && suffix.getBoundingClientRect().right <= box.right,
            textStart: box.left + Number.parseFloat(style.paddingLeft),
            prefixRight: prefix.getBoundingClientRect().right,
            textEnd: box.right - Number.parseFloat(style.paddingRight),
            suffixLeft: suffix.getBoundingClientRect().left,
        };
    });
    expect(m.inside).toBeCloseTo(m.plain, 0);
    expect(m.outside, 'fora, o afixo come largura do campo').toBeLessThan(m.plain);
    expect(m.prefixInside && m.suffixInside).toBe(true);
    expect(m.textStart).toBeGreaterThanOrEqual(m.prefixRight);
    expect(m.textEnd).toBeLessThanOrEqual(m.suffixLeft);
});

test('abas: a faixa nunca passa do contêiner nos três modos e o alvo tem 44 px', async ({ page }) => {
    await open(page);
    for (const mode of ['scroll', 'wrap', 'menu'] as const) {
        const m = await page.evaluate((id) => {
            const container = document.querySelector(`[data-testid="${id}"]`)!;
            const list = container.querySelector<HTMLElement>('[role="tablist"]')!;
            const tabs = [...list.querySelectorAll<HTMLElement>('[role="tab"]')];
            return {
                container: container.getBoundingClientRect().width,
                list: list.getBoundingClientRect().width,
                page: document.documentElement.scrollWidth,
                viewport: window.innerWidth,
                minTabHeight: Math.min(...tabs.map((t) => t.getBoundingClientRect().height)),
                rows: new Set(tabs.map((t) => Math.round(t.getBoundingClientRect().top))).size,
                scrolls: list.scrollWidth > list.clientWidth,
            };
        }, `tabs-${mode}`);
        expect(m.list, `${mode}: faixa ≤ contêiner`).toBeLessThanOrEqual(m.container + SUBPIXEL);
        expect(m.page, `${mode}: a página não ganha rolagem horizontal`).toBeLessThanOrEqual(m.viewport);
        expect(m.minTabHeight, `${mode}: alvo de toque`).toBeGreaterThanOrEqual(TOUCH_TARGET_MIN - SUBPIXEL);
        if (mode === 'wrap') expect(m.rows, 'wrap quebra em mais de uma linha').toBeGreaterThan(1);
        if (mode === 'scroll') expect(m.scrolls, 'scroll rola dentro da faixa').toBe(true);
    }
});

test('abas em modo scroll sinalizam que há mais; em menu, as que não cabem vão ao menu por teclado', async ({ page }) => {
    await open(page);
    const mask = await page.evaluate(() => getComputedStyle(document.querySelector('[data-testid="tabs-scroll"] [role="tablist"]')!).maskImage);
    expect(mask, 'sinal de mais abas à direita').toContain('linear-gradient');

    const trigger = page.getByTestId('tabs-menu').getByRole('button', { name: /mais abas|more tabs/i });
    await expect(trigger).toBeVisible();
    const hidden = await page.evaluate(() => [...document.querySelectorAll('[data-testid="tabs-menu"] [role="tab"][aria-hidden="true"]')].length);
    expect(hidden).toBeGreaterThan(0);

    await trigger.focus();
    await page.keyboard.press('ArrowDown');
    const items = page.getByTestId('tabs-menu').getByRole('menuitem');
    expect(await items.count()).toBe(hidden);
    await expect(items.first()).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(trigger).toBeFocused();
});

test('abas em menu: as setas percorrem só as visíveis e a última vai ao botão do menu', async ({ page }) => {
    await open(page);
    const tabs = page.getByTestId('tabs-menu').locator('[role="tab"]');
    const visible = page.getByTestId('tabs-menu').locator('[role="tab"]:not([aria-hidden="true"])');
    const trigger = page.getByTestId('tabs-menu').getByRole('button', { name: /mais abas|more tabs/i });
    const visibleCount = await visible.count();
    expect(visibleCount).toBeGreaterThan(1);
    expect(await tabs.count()).toBeGreaterThan(visibleCount);

    await visible.first().focus();
    for (let step = 1; step < visibleCount; step++) {
        await page.keyboard.press('ArrowRight');
        await expect(visible.nth(step)).toBeFocused();
    }
    await page.keyboard.press('ArrowRight');
    await expect(trigger).toBeFocused();
    expect(await page.evaluate(() => document.activeElement?.closest('[aria-hidden="true"]') === null)).toBe(true);

    await page.keyboard.press('ArrowLeft');
    await expect(visible.nth(visibleCount - 1)).toBeFocused();
    await expect(visible.nth(visibleCount - 1)).toHaveAttribute('aria-selected', 'true');
});
