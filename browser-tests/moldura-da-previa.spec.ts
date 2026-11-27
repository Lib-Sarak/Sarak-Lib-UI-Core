/**
 * A moldura da prévia do painel: a largura que ela desenha, onde abrem os popovers do cromo, o que um item da navegação pode fazer,
 * a marca d'água que saiu, o botão do painel fora do aparelho, o corte nos cartões de tablet e a rolagem da lista de opções.
 *
 * LIMITES DECLARADOS (R18): Chromium headless, 1600×1000, tema `sarak-sovereign`, modo escuro; lê o `dist/` (sem `npm run build`
 * recente, mede o build anterior). O menu de contexto NATIVO do navegador não é aberto pelo Playwright: o spec confere que o evento
 * `contextmenu` do item tem o padrão cancelado, que é o que impede "abrir em nova aba" por ali.
 */
import { test, expect, chromium, type Browser, type Page } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { buildHarness } from './build-harness.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ENTRY = path.join(HERE, 'fixtures', 'previa-mostra-a-opcao-entry.tsx');
const DIST_FONTS = pathToFileURL(path.resolve(HERE, '..', 'dist', 'fonts')).href;
/** A largura mínima da janela do sistema que a prévia desktop desenha. */
const MIN_SYSTEM_WIDTH = 1280;
const SETTLE_MS = 1200;
const FRAME = '[data-testid="live-preview-frame"]';
/** Soma da diferença dos três canais acima da qual um pixel conta (o serrilhado do texto fica abaixo), e a fração da área que ainda é "igual". */
const PIXEL_NOISE = 30;
const SAME_SHARE = 0.0003;

/** A fração da área da foto que difere da outra por mais que o ruído. */
const changedShare = (page: Page, first: Buffer, second: Buffer): Promise<number> => page.evaluate(async ([a, b, noise]) => {
    const decode = async (base64: string): Promise<ImageData> => {
        const bitmap = await createImageBitmap(await (await fetch(`data:image/png;base64,${base64}`)).blob());
        const context = new OffscreenCanvas(bitmap.width, bitmap.height).getContext('2d') as OffscreenCanvasRenderingContext2D;
        context.drawImage(bitmap, 0, 0);
        return context.getImageData(0, 0, bitmap.width, bitmap.height);
    };
    const [one, two] = [await decode(a), await decode(b)];
    if (one.width !== two.width || one.height !== two.height) return 1;
    let differing = 0;
    for (let i = 0; i < one.data.length; i += 4) {
        if (Math.abs(one.data[i] - two.data[i]) + Math.abs(one.data[i + 1] - two.data[i + 1]) + Math.abs(one.data[i + 2] - two.data[i + 2]) > noise) differing += 1;
    }
    return differing / (one.width * one.height);
}, [first.toString('base64'), second.toString('base64'), PIXEL_NOISE] as const);

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

const openPanel = async (decision: string, device?: 'Tablet' | 'Mobile'): Promise<Page> => {
    const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
    await page.goto(`${harnessUrl}?fontes=${encodeURIComponent(DIST_FONTS)}`);
    await page.getByRole('button', { name: /Usar minha marca/ }).waitFor();
    await page.getByRole('button', { name: new RegExp(`^${decision}`) }).click();
    await page.getByRole('heading', { level: 2, name: decision }).waitFor();
    if (device) await page.getByRole('group', { name: 'Dispositivo do preview' }).getByRole('button', { name: device }).click();
    await page.waitForTimeout(SETTLE_MS);
    return page;
};

test('desktop: a prévia desenha a janela do sistema (mínimo 1.280 px) e a reduz para caber na moldura', async () => {
    const page = await openPanel('Layout');
    const sizes = await page.evaluate((frameSelector) => {
        const layer = document.querySelector(`${frameSelector} .origin-top-left`) as HTMLElement;
        const frame = document.querySelector(frameSelector) as HTMLElement;
        const scale = Number.parseFloat(layer.style.transform.replace('scale(', ''));
        return { scale, drawnWidth: layer.getBoundingClientRect().width / scale, shownWidth: layer.getBoundingClientRect().width, frameWidth: frame.getBoundingClientRect().width };
    }, FRAME);
    await page.close();
    expect(sizes.drawnWidth, 'largura desenhada do sistema').toBeGreaterThanOrEqual(MIN_SYSTEM_WIDTH);
    expect(sizes.scale, 'a prévia reduz o desenho').toBeLessThan(1);
    expect(sizes.shownWidth, 'e o desenho reduzido cabe na moldura').toBeLessThanOrEqual(sizes.frameWidth + 1);
});

test('o menu ⚙ da barra da prévia abre dentro da moldura e na escala dela', async () => {
    const page = await openPanel('Layout');
    await page.locator(`${FRAME} [data-sarak-widget="preferences-menu"]`).getByRole('button').first().click();
    await expect(page.getByRole('menu', { name: 'Preferências' })).toBeVisible();
    const placement = await page.evaluate((frameSelector) => {
        const frame = (document.querySelector(frameSelector) as HTMLElement).getBoundingClientRect();
        const menuNode = document.querySelector('[role="menu"]') as HTMLElement;
        const box = menuNode.getBoundingClientRect();
        const layer = document.querySelector(`${frameSelector} .origin-top-left`) as HTMLElement;
        const scale = Number.parseFloat(layer.style.transform.replace('scale(', ''));
        const fits = box.left >= frame.left && box.right <= frame.right && box.top >= frame.top && box.bottom <= frame.bottom;
        return { inside: Boolean(menuNode.closest(frameSelector)), fits, scale };
    }, FRAME);
    await page.close();
    expect(placement.inside, 'o menu mora dentro da moldura (não no body)').toBe(true);
    expect(placement.fits, 'o menu cabe inteiro na moldura').toBe(true);
    expect(placement.scale).toBeLessThan(1);
});

test('nenhum item da navegação da prévia leva o navegador para fora do painel', async () => {
    const page = await openPanel('Layout');
    const popups: string[] = [];
    page.context().on('page', (opened) => popups.push(opened.url()));
    const item = page.locator(`${FRAME} a[href^="#"]`).filter({ hasText: 'Tabela' }).first();
    await item.click({ modifiers: ['Control'] });
    await item.click({ button: 'middle' });
    await item.click({ modifiers: ['Shift'] });
    const contextMenuPrevented = await item.evaluate((node) => {
        const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true });
        node.dispatchEvent(event);
        return event.defaultPrevented;
    });
    await page.waitForTimeout(500);
    const hrefs = await page.evaluate((frameSelector) => Array.from(document.querySelectorAll(`${frameSelector} a[href]`)).map((link) => link.getAttribute('href') ?? ''), FRAME);
    await page.close();
    expect(popups, 'nenhuma aba nova').toEqual([]);
    expect(contextMenuPrevented, 'o menu de contexto do item é cancelado').toBe(true);
    expect(hrefs.length, 'há itens de navegação na prévia').toBeGreaterThan(0);
    expect(hrefs.filter((href) => !href.startsWith('#')), 'toda âncora da prévia é interna (#tela)').toEqual([]);
});

for (const [device, label] of [['desktop', undefined], ['tablet', 'Tablet'], ['celular', 'Mobile']] as const) {
    test(`${device}: nenhuma marca d'água na prévia e o botão do painel fica fora do aparelho`, async () => {
        const page = await openPanel('Layout', label);
        const found = await page.evaluate((frameSelector) => {
            const frame = document.querySelector(frameSelector) as HTMLElement;
            const viewport = frame.querySelector('[data-testid="device-viewport"]') as HTMLElement;
            const inspector = Array.from(frame.querySelectorAll('button')).find((button) => (button.getAttribute('title') ?? '').includes('Inspeção'));
            return { text: frame.textContent ?? '', inspectorInsideDevice: inspector ? viewport.contains(inspector) : null, hasInspector: Boolean(inspector) };
        }, FRAME);
        await page.close();
        expect(found.text.toUpperCase()).not.toContain('SARAK TWIN');
        expect(found.hasInspector).toBe(true);
        if (label) expect(found.inspectorInsideDevice, 'o botão do painel não fica sobre a tela do aparelho').toBe(false);
    });
}

test('tablet: nenhum texto dos cartões da tela Painel é cortado com reticências', async () => {
    const page = await openPanel('Layout', 'Tablet');
    const clipped = await page.evaluate((frameSelector) => Array.from(document.querySelectorAll(`${frameSelector} .sarak-card *`))
        .filter((node) => getComputedStyle(node).textOverflow === 'ellipsis' && (node as HTMLElement).scrollWidth > (node as HTMLElement).clientWidth + 1)
        .map((node) => node.textContent ?? ''), FRAME);
    await page.close();
    expect(clipped).toEqual([]);
});

test('rolar a lista de opções, com o mouse parado, não muda a prévia', async () => {
    const page = await openPanel('Forma');
    const frame = page.locator(FRAME);
    await page.mouse.move(2, 2);
    await page.waitForTimeout(SETTLE_MS);
    const before = await frame.screenshot({ animations: 'disabled' });
    // O ponteiro para no vão abaixo da primeira opção (nenhuma o recebe agora) e a rolagem põe outras sob ele: o navegador dispara o
    // evento de entrada delas sem o mouse ter se mexido.
    const first = await page.locator('[data-option-group] [data-option-tile]').first().boundingBox();
    if (first) await page.mouse.move(first.x + first.width / 2, first.y + first.height + 6);
    await page.mouse.wheel(0, 900);
    await page.waitForTimeout(SETTLE_MS + 600);
    const after = await frame.screenshot({ animations: 'disabled' });
    const status = await page.locator('[role="status"]').allTextContents();
    const share = await changedShare(page, before, after);
    await page.close();
    expect(share, 'a prévia é a mesma antes e depois da rolagem').toBeLessThan(SAME_SHARE);
    expect(status.join(' '), 'nenhuma espiada em curso').not.toContain('nada foi gravado');
});

test('tableCellPadding: cada opção de tabela muda o respiro da célula da tabela da prévia', async () => {
    const page = await openPanel('Componentes');
    await page.locator('select').filter({ has: page.locator('option[value="dashboard"]') }).selectOption('tabela');
    await page.waitForTimeout(SETTLE_MS);
    const toggle = page.locator('[data-group-toggle="tables"]');
    if ((await toggle.getAttribute('aria-expanded')) === 'false') await toggle.click();
    const cellPadding = (): Promise<number> => page.evaluate((frameSelector) => {
        const cell = document.querySelector(`${frameSelector} [data-sarak-datatable] [role="cell"]`) as HTMLElement;
        return Number.parseFloat(getComputedStyle(cell).paddingLeft);
    }, FRAME);
    const measured: Record<string, number> = {};
    for (const [name, expected] of [['Compacta', 5], ['Arejada', 22], ['Listrada e redonda', 14], ['Reta e densa', 4]] as const) {
        const tile = page.locator('[data-option-group="tables"] [data-option-tile]', { hasText: name }).first();
        await tile.scrollIntoViewIfNeeded();
        await page.mouse.move(2, 2);
        await page.waitForTimeout(500);
        const box = await tile.boundingBox();
        if (box) await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.waitForTimeout(SETTLE_MS);
        measured[name] = await cellPadding();
        expect(measured[name], `${name}: respiro horizontal da célula`).toBe(expected);
    }
    await page.close();
});
