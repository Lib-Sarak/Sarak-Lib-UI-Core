/**
 * Painel arrastável, mapa, assinatura, tour e carrossel medidos em navegador real, nos dois modos de cor e em
 * contêiner estreito (o `jsdom` não tem layout, canvas nem ponteiro de verdade).
 *
 * LIMITES DECLARADOS (R18): lê o `dist/` — sem `npm run build` recente mede o build anterior; mede geometria,
 * foco, pixels do canvas e quais requisições saem, não a aparência do tema; o toque é injetado por CDP
 * (`Input.dispatchTouchEvent`), não por um aparelho; o arrastar do painel com o mouse é do `react-grid-layout`
 * e não é exercitado aqui — o teclado é.
 */
import fs from 'node:fs';
import path from 'node:path';
import { chromium, expect, test, type Browser, type Page } from '@playwright/test';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { buildHarness } from './build-harness.mjs';

const ENTRY = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures', 'plan-155-entry.tsx');
const MODES = ['light', 'dark'] as const;
const WIDE = 900;
const NARROW = 320;
/** PNG 1x1 transparente: o que o "provedor" de teste devolve para qualquer bloco. */
const PIXEL = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');

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

interface OpenOptions { params?: Record<string, string>; hasTouch?: boolean; reducedMotion?: 'reduce' }

async function open({ params = {}, hasTouch = false, reducedMotion }: OpenOptions = {}): Promise<{ page: Page; tileRequests: string[]; close: () => Promise<void> }> {
    const context = await browser.newContext({ viewport: { width: 1200, height: 1400 }, hasTouch, reducedMotion });
    const page = await context.newPage();
    const tileRequests: string[] = [];
    await page.route('https://tiles.invalid/**', async (route) => {
        tileRequests.push(route.request().url());
        await route.fulfill({ status: 200, contentType: 'image/png', body: PIXEL });
    });
    await page.goto(`${harnessUrl}?${new URLSearchParams({ largura: String(WIDE), ...params }).toString()}`);
    await page.locator('[data-probe="dashboard"] [data-sarak-dashboard-widget]').first().waitFor({ timeout: 15_000 });
    return { page, tileRequests, close: () => context.close() };
}

const box = async (page: Page, selector: string) => (await page.locator(selector).first().boundingBox())!;
const widget = (probe: string, id: string): string => `[data-probe="${probe}"] [data-sarak-dashboard-widget="${id}"]`;

for (const mode of MODES) {
    test.describe(`modo ${mode}`, () => {
        test('painel: seta move, Shift+seta redimensiona, só leitura não muda; estreito empilha em uma coluna', async () => {
            const { page, close } = await open({ params: { modo: mode } });
            const before = await box(page, widget('dashboard', 'vendas'));
            await page.locator(widget('dashboard', 'vendas')).focus();
            await page.keyboard.press('ArrowRight');
            await expect.poll(async () => (await box(page, widget('dashboard', 'vendas'))).x).toBeGreaterThan(before.x);
            await page.keyboard.press('Shift+ArrowRight');
            await expect.poll(async () => (await box(page, widget('dashboard', 'vendas'))).width).toBeGreaterThan(before.width);
            const readOnlyBefore = await box(page, widget('dashboard-readonly', 'vendas'));
            await page.locator(widget('dashboard-readonly', 'vendas')).focus();
            await page.keyboard.press('ArrowRight');
            await page.waitForTimeout(200);
            expect((await box(page, widget('dashboard-readonly', 'vendas'))).x).toBe(readOnlyBefore.x);
            await close();

            const narrow = await open({ params: { modo: mode, largura: String(NARROW) } });
            const lefts = await narrow.page.locator('[data-probe="dashboard"] [data-sarak-dashboard-widget]').evaluateAll((nodes) => nodes.map((node) => Math.round(node.getBoundingClientRect().left)));
            expect(new Set(lefts).size, 'uma coluna: todos na mesma borda esquerda').toBe(1);
            const overflow = await narrow.page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
            expect(overflow).toBeLessThanOrEqual(0);
            await narrow.close();
        });

        test('mapa: sem tileUrl nenhuma requisição e aviso; com tileUrl pede blocos, mostra atribuição e o zoom troca o nível', async () => {
            const bare = await open({ params: { modo: mode } });
            await bare.page.waitForTimeout(400);
            expect(bare.tileRequests).toHaveLength(0);
            expect(await bare.page.locator('[data-probe="map"] img').count()).toBe(0);
            await expect(bare.page.locator('[data-sarak-map-no-tiles]')).toBeVisible();
            await bare.close();

            const { page, tileRequests, close } = await open({ params: { modo: mode, tile: '1' } });
            await expect.poll(() => tileRequests.length).toBeGreaterThan(0);
            expect(tileRequests.every((url) => /\/10\/\d+\/\d+\.png$/.test(url))).toBe(true);
            await expect(page.locator('[data-sarak-map-attribution]')).toContainText('Provedor de teste');
            tileRequests.length = 0;
            await page.getByRole('button', { name: 'Aproximar' }).click();
            await expect.poll(() => tileRequests.some((url) => /\/11\//.test(url))).toBe(true);
            await page.getByRole('button', { name: 'Matriz' }).click();
            expect(await page.evaluate(() => window.__plan155.markerClicks)).toEqual(['matriz']);
            await close();
        });

        test('assinatura: mouse e toque deixam pixels no canvas; digitar o nome devolve imagem', async () => {
            const { page, close } = await open({ params: { modo: mode }, hasTouch: true });
            const canvas = page.locator('[data-probe="signature"] canvas');
            await canvas.scrollIntoViewIfNeeded();
            const area = (await canvas.boundingBox())!;
            const inked = (): Promise<number> => canvas.evaluate((node) => {
                const context = (node as HTMLCanvasElement).getContext('2d')!;
                const data = context.getImageData(0, 0, (node as HTMLCanvasElement).width, (node as HTMLCanvasElement).height).data;
                return data.reduce((count, value, index) => (index % 4 === 3 && value > 0 ? count + 1 : count), 0);
            });
            expect(await inked()).toBe(0);

            await page.mouse.move(area.x + 20, area.y + 20);
            await page.mouse.down();
            await page.mouse.move(area.x + 120, area.y + 80, { steps: 8 });
            await page.mouse.up();
            const afterMouse = await inked();
            expect(afterMouse).toBeGreaterThan(0);
            expect(await page.evaluate(() => window.__plan155.signature?.png.startsWith('data:image/png'))).toBe(true);

            const session = await page.context().newCDPSession(page);
            const touch = async (type: string, x: number, y: number): Promise<unknown> =>
                session.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y }] });
            await touch('touchStart', area.x + 200, area.y + 30);
            await touch('touchMove', area.x + 260, area.y + 90);
            await touch('touchMove', area.x + 320, area.y + 40);
            await touch('touchEnd', 0, 0);
            expect(await inked()).toBeGreaterThan(afterMouse);
            expect(await page.evaluate(() => window.__plan155.signature?.strokes.length)).toBe(2);

            await page.getByRole('button', { name: 'Limpar' }).click();
            expect(await inked()).toBe(0);
            await page.getByRole('button', { name: 'Digitar o nome' }).click();
            await page.getByLabel('Nome completo').first().fill('Maria Souza');
            expect(await page.evaluate(() => window.__plan155.signature?.typedName)).toBe('Maria Souza');
            expect(await inked()).toBeGreaterThan(0);
            await close();
        });

        test('tour: só pelo teclado — destaque no alvo, Tab preso no cartão, Esc fecha e o foco volta ao gatilho', async () => {
            const { page, close } = await open({ params: { modo: mode } });
            const trigger = page.locator('#tour-alvo');
            await trigger.focus();
            await page.keyboard.press('Enter');
            const dialog = page.getByRole('dialog', { name: 'Este é o alvo' });
            await expect(dialog).toBeVisible();
            const highlight = (await page.locator('[data-sarak-tour-highlight]').boundingBox())!;
            const target = (await trigger.boundingBox())!;
            expect(highlight.x).toBeLessThanOrEqual(target.x);
            expect(highlight.y).toBeLessThanOrEqual(target.y);
            expect(highlight.x + highlight.width).toBeGreaterThanOrEqual(target.x + target.width);
            for (let press = 0; press < 6; press += 1) {
                await page.keyboard.press('Tab');
                expect(await dialog.evaluate((node) => node.contains(document.activeElement)), `Tab ${press + 1} saiu do cartão`).toBe(true);
            }
            const card = (await dialog.boundingBox())!;
            expect(card.x).toBeGreaterThanOrEqual(0);
            expect(card.x + card.width).toBeLessThanOrEqual(1200);
            await dialog.getByRole('button', { name: 'Próximo' }).click();
            await expect(page.getByRole('dialog', { name: 'Sem alvo' })).toBeVisible();
            await page.keyboard.press('Escape');
            await expect(page.getByRole('dialog')).toHaveCount(0);
            expect(await page.evaluate(() => window.__plan155.tourClosed)).toBe('escape');
            await expect(trigger).toBeFocused();
            await close();
        });

        test('tour em contêiner estreito: o cartão cabe na janela de 320 px', async () => {
            const { page, close } = await open({ params: { modo: mode, largura: String(NARROW) } });
            await page.setViewportSize({ width: NARROW, height: 700 });
            await page.locator('#tour-alvo').click();
            const card = (await page.getByRole('dialog').boundingBox())!;
            expect(card.x).toBeGreaterThanOrEqual(0);
            expect(card.x + card.width).toBeLessThanOrEqual(NARROW);
            await close();
        });

        test('carrossel: setas trocam o slide, não gira sozinho por padrão', async () => {
            const { page, close } = await open({ params: { modo: mode } });
            const slide = (): Promise<string | null> => page.locator('[data-probe="carousel"] [data-sarak-carousel-slide="current"]').textContent();
            expect(await slide()).toBe('um');
            await page.waitForTimeout(1500);
            expect(await slide()).toBe('um');
            await page.locator('[data-probe="carousel"] [tabindex="0"]').focus();
            await page.keyboard.press('ArrowRight');
            expect(await slide()).toBe('dois');
            await close();
        });
    });
}

test('carrossel com autoPlay gira e, com movimento reduzido, não gira', async () => {
    const moving = await open({ params: { autoplay: '1' } });
    const slide = (page: Page): Promise<string | null> => page.locator('[data-probe="carousel"] [data-sarak-carousel-slide="current"]').textContent();
    await expect.poll(() => slide(moving.page), { timeout: 5000 }).not.toBe('um');
    await moving.close();

    const still = await open({ params: { autoplay: '1' }, reducedMotion: 'reduce' });
    await still.page.waitForTimeout(2000);
    expect(await slide(still.page)).toBe('um');
    await expect(still.page.getByRole('button', { name: 'Pausar rotação' })).toHaveCount(0);
    await still.close();
});
