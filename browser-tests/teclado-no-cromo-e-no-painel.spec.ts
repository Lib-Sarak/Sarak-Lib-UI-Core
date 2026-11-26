/**
 * Medição, em navegador real, do que um usuário que só usa o teclado vê e ouve no cromo e no painel de customização: o foco
 * aparece em toda parada de `Tab` (a captura da caixa do elemento muda, e a mudança chega a 3:1 contra o pixel sem foco), todo
 * controle focável tem nome na árvore de acessibilidade, a decisão Tema deixa o 1º cartão a poucas paradas do título (as miniaturas
 * dos cartões ficam fora do `Tab`), a gaveta móvel é um diálogo que prende o foco, o seletor de idioma fecha no Esc e os rótulos dos
 * cartões de opção se leem sobre o fundo do próprio cartão. O harness monta o código-fonte contra o `dist/sarak.css`.
 *
 * -------------------------------------------------------------------------
 * LIMITES DECLARADOS (R18) — o que esta medição NÃO vê
 * -------------------------------------------------------------------------
 * 1. Transições e animações são desligadas na página medida: sem isso a captura "com foco" pega o anel a meio caminho. O anel
 *    medido é o estado final.
 * 2. O contraste do anel é o maior entre os pixels da caixa (com folga de 4 px) que mudaram; não mede se o anel agrada nem se
 *    cobre o texto vizinho.
 * 3. O nome é o da árvore de acessibilidade do Chromium (CDP), não o de um leitor de tela real.
 * 4. O painel é percorrido a 1440×900 com o tema padrão do harness; o cromo, a 1440 e a 390 px.
 * 5. O contraste dos rótulos é o do `color` computado do rótulo contra o primeiro fundo não transparente acima dele; fundo em
 *    degradê ou imagem tem a cor-base lida. Os 25 temas entram sempre; `SARAK_TECLADO_TEMAS=<id>,<id>…` restringe, para depurar.
 * -------------------------------------------------------------------------
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { PNG } from 'pngjs';
import { expect, test, type CDPSession, type Page } from '@playwright/test';
import { SARAK_ALL_THEMES } from '../src/core/Design/presets/themes/all';
import { buildHarness } from './build-harness.mjs';

const ENTRY = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures', 'teclado-entry.tsx');
const RING_MIN_CONTRAST = 3;
const LABEL_MIN_CONTRAST = 4.5;
const PIXEL_MARGIN = 4;
const MAX_STOPS = 1500;
/** O tempo para o estado de foco do componente (React) assentar antes da captura. */
const SETTLE_MS = 80;
const FIRST_TILE_MAX_STOPS = 5;
const DECISIONS = ['brand', 'theme', 'colors', 'fonts', 'shape', 'components', 'bars', 'layout'] as const;
const ALL_THEME_IDS = SARAK_ALL_THEMES.map((theme) => theme.id);
const THEME_OVERRIDE = (process.env.SARAK_TECLADO_TEMAS ?? '').split(',').filter(Boolean);
const THEMES_UNDER_TEST = THEME_OVERRIDE.length ? THEME_OVERRIDE : ALL_THEME_IDS;
const HINT_MIN_WIDTH = 160;

let harnessDirectory: string;
let harnessUrl: string;

test.setTimeout(900_000);

test.beforeAll(async () => {
    const harness = await buildHarness(ENTRY, { useSourceLibrary: true });
    harnessDirectory = harness.outDir;
    harnessUrl = pathToFileURL(harness.htmlPath).href;
});

test.afterAll(() => {
    if (harnessDirectory) fs.rmSync(harnessDirectory, { recursive: true, force: true });
});

const STILL = '*, *::before, *::after { transition: none !important; animation: none !important; caret-color: transparent !important; scroll-behavior: auto !important; }';

async function open(page: Page, query: Record<string, string>, size: { width: number; height: number }): Promise<void> {
    await page.addInitScript(() => localStorage.clear());
    await page.setViewportSize(size);
    await page.goto(`${harnessUrl}?${new URLSearchParams(query).toString()}`);
    await page.addStyleTag({ content: STILL });
    if (query.so === 'painel') await page.getByTestId('panel-host').waitFor({ state: 'visible' });
    else await page.getByRole('button', { name: 'Ação do conteúdo' }).waitFor({ state: 'attached' });
    await page.waitForTimeout(800);
}

const channel = (value: number): number => {
    const unit = value / 255;
    return unit <= 0.03928 ? unit / 12.92 : ((unit + 0.055) / 1.055) ** 2.4;
};
const luminance = (r: number, g: number, b: number): number => 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
const contrast = (a: number, b: number): number => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

/** O maior contraste, entre os pixels da caixa, de cada pixel com foco contra o mesmo pixel sem foco (0 se nada mudou). */
function strongestChange(withFocus: Buffer, without: Buffer): number {
    const after = PNG.sync.read(withFocus);
    const before = PNG.sync.read(without);
    if (after.width !== before.width || after.height !== before.height) return Number.POSITIVE_INFINITY;
    let best = 0;
    for (let offset = 0; offset < after.data.length; offset += 4) {
        const same = after.data[offset] === before.data[offset]
            && after.data[offset + 1] === before.data[offset + 1]
            && after.data[offset + 2] === before.data[offset + 2];
        if (same) continue;
        const ratio = contrast(
            luminance(after.data[offset], after.data[offset + 1], after.data[offset + 2]),
            luminance(before.data[offset], before.data[offset + 1], before.data[offset + 2]),
        );
        if (ratio > best) best = ratio;
    }
    return best;
}

interface Stop { label: string; name: string; ring: number; html: string }
interface Box { x: number; y: number; width: number; height: number }

/** O nome do elemento em foco, pela árvore de acessibilidade do Chromium. */
async function focusedName(cdp: CDPSession): Promise<string> {
    const { result } = await cdp.send('Runtime.evaluate', { expression: 'document.activeElement' });
    if (!result.objectId) return '';
    const { nodes } = await cdp.send('Accessibility.getPartialAXTree', { objectId: result.objectId, fetchRelatives: false });
    const name = nodes[0]?.name?.value;
    return typeof name === 'string' ? name.trim() : '';
}

const describeFocus = (page: Page): Promise<{ label: string; box: Box | null; isBody: boolean }> =>
    page.evaluate(() => {
        const element = document.activeElement as HTMLElement | null;
        if (!element || element === document.body) return { label: 'body', box: null, isBody: true };
        element.setAttribute('data-sarak-stop', '');
        const rect = element.getBoundingClientRect();
        const tag = element.tagName.toLowerCase();
        const text = (element.getAttribute('aria-label') ?? element.textContent ?? '').trim().slice(0, 40);
        const siblings = element.parentElement ? [...element.parentElement.children].indexOf(element) : 0;
        return {
            label: `${tag}${(element as HTMLInputElement).type ? `:${(element as HTMLInputElement).type}` : ''}[${siblings}] .${String(element.className).slice(0, 40)} "${text}" @${Math.round(rect.x)},${Math.round(rect.y)}`,
            box: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
            isBody: false,
        };
    });

async function ringContrast(page: Page, box: Box): Promise<number> {
    const viewport = page.viewportSize() ?? { width: 1440, height: 900 };
    const x = Math.max(0, Math.floor(box.x - PIXEL_MARGIN));
    const y = Math.max(0, Math.floor(box.y - PIXEL_MARGIN));
    const clip = {
        x,
        y,
        width: Math.max(1, Math.min(viewport.width - x, Math.ceil(box.width + PIXEL_MARGIN * 2))),
        height: Math.max(1, Math.min(viewport.height - y, Math.ceil(box.height + PIXEL_MARGIN * 2))),
    };
    const focused = await page.screenshot({ clip });
    await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
    const unfocused = await page.screenshot({ clip });
    await page.evaluate(() => {
        (document.querySelector('[data-sarak-stop]') as HTMLElement | null)?.focus();
        document.querySelectorAll('[data-sarak-stop]').forEach((node) => node.removeAttribute('data-sarak-stop'));
    });
    return strongestChange(focused, unfocused);
}

/** Percorre só com `Tab`, a partir do elemento já em foco, até voltar a ele ou sair da página (o `body`). */
async function walk(page: Page): Promise<{ stops: Stop[]; closed: boolean }> {
    const cdp = await page.context().newCDPSession(page);
    const stops: Stop[] = [];
    const first = await describeFocus(page);
    await page.evaluate(() => document.querySelectorAll('[data-sarak-stop]').forEach((node) => node.removeAttribute('data-sarak-stop')));
    let closed = false;
    for (let index = 0; index < MAX_STOPS; index += 1) {
        await page.keyboard.press('Tab');
        await page.waitForTimeout(SETTLE_MS);
        const now = await describeFocus(page);
        if (now.isBody) { closed = true; break; }
        const ring = now.box ? await ringContrast(page, now.box) : Number.POSITIVE_INFINITY;
        stops.push({ label: now.label, name: await focusedName(cdp), ring, html: await page.evaluate(() => (document.activeElement as HTMLElement).outerHTML.slice(0, 220)) });
        if (now.label === first.label) { closed = true; break; }
    }
    await cdp.detach();
    return { stops, closed };
}

function expectGoodStops(stops: Stop[]): void {
    const noRing = stops.filter((stop) => stop.ring < RING_MIN_CONTRAST).map((stop) => `${stop.label} (${stop.ring.toFixed(2)}:1)`);
    const noName = stops.filter((stop) => !stop.name).map((stop) => `${stop.label} ${stop.html}`);
    expect(noRing, 'toda parada de Tab mostra o foco em ao menos 3:1').toEqual([]);
    expect(noName, 'todo controle focável tem nome').toEqual([]);
}

for (const scenario of [
    { name: 'a barra lateral a 1440 px', query: { so: 'cromo', chrome: 'sidebar' } },
    { name: 'a barra de topo a 1440 px', query: { so: 'cromo', chrome: 'topbar' } },
]) {
    test(`cromo, ${scenario.name}: toda parada de Tab tem anel de 3:1 e nome`, async ({ page }) => {
        await open(page, scenario.query, { width: 1440, height: 900 });
        const { stops } = await walk(page);
        expect(stops.length, 'o percurso achou controles').toBeGreaterThan(5);
        expectGoodStops(stops);
    });
}

test('cromo a 390 px: o hambúrguer e a gaveta aberta têm anel de 3:1 e nome', async ({ page }) => {
    await open(page, { so: 'cromo' }, { width: 390, height: 800 });
    const menu = page.getByRole('button', { name: /menu/i }).first();
    await menu.focus();
    await page.keyboard.press('Enter');
    await page.locator('#sarak-chrome-drawer').waitFor();
    const { stops } = await walk(page);
    expect(stops.length, 'a gaveta tem controles').toBeGreaterThan(3);
    expectGoodStops(stops);
});

/** Abre o "Ajuste fino" da decisão (se ela tem) e o "mostrar todos": o percurso mede também o que a seção revela. */
async function openFineTuning(page: Page): Promise<void> {
    const section = page.locator('[data-testid="fine-tuning"]');
    if (await section.count() === 0) return;
    await section.locator('> button').first().click();
    const showAll = section.locator('button[aria-expanded="false"]');
    if (await showAll.count() > 0) await showAll.first().click();
    await page.waitForTimeout(SETTLE_MS);
}

for (const decision of DECISIONS) {
    test(`painel, decisão ${decision}: toda parada de Tab tem anel de 3:1 e nome`, async ({ page }) => {
        await open(page, { so: 'painel' }, { width: 1440, height: 900 });
        await page.locator(`[data-decision-row="${decision}"]`).click();
        const heading = page.getByRole('heading', { level: 2 }).first();
        await heading.waitFor();
        await openFineTuning(page);
        await heading.focus();
        const { stops, closed } = await walk(page);
        expect(closed, 'o ciclo de Tab fecha').toBe(true);
        expectGoodStops(stops);
        if (decision === 'theme') {
            const tileName = await page.locator('[data-option-tile] > button').first().getAttribute('aria-label');
            const index = stops.findIndex((stop) => stop.name === tileName);
            expect(index, `o 1º cartão de tema (${tileName}) está no percurso: ${stops.slice(0, 10).map((stop) => stop.name).join(' | ')}`).toBeGreaterThanOrEqual(0);
            expect(index + 1, 'o 1º cartão de tema chega em poucas paradas depois do título').toBeLessThanOrEqual(FIRST_TILE_MAX_STOPS);
        }
    });
}

test('o seletor de idioma da lateral fecha com Esc e devolve o foco ao botão', async ({ page }) => {
    await open(page, { so: 'cromo', chrome: 'sidebar' }, { width: 1440, height: 900 });
    const button = page.locator('aside button[aria-haspopup="menu"]').first();
    await button.focus();
    await page.keyboard.press('Enter');
    await expect(button).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press('Escape');
    await expect(button).toHaveAttribute('aria-expanded', 'false');
    await expect(button).toBeFocused();
});

test('o seletor de idioma do topo expõe aria-haspopup e aria-expanded e fecha com Esc', async ({ page }) => {
    await open(page, { so: 'cromo', chrome: 'topbar' }, { width: 1440, height: 900 });
    const button = page.locator('header button[aria-haspopup]').filter({ hasText: /pt/i }).first();
    await expect(button).toHaveAttribute('aria-expanded', 'false');
    await button.focus();
    await page.keyboard.press('Enter');
    await expect(button).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press('Escape');
    await expect(button).toHaveAttribute('aria-expanded', 'false');
    await expect(button).toBeFocused();
});

test('a gaveta móvel é um diálogo: o foco entra, o Tab circula, o fundo fica inerte e o Esc devolve o foco', async ({ page }) => {
    await open(page, { so: 'cromo' }, { width: 390, height: 800 });
    const menu = page.getByRole('button', { name: /menu/i }).first();
    await menu.focus();
    await page.keyboard.press('Enter');
    const drawer = page.locator('#sarak-chrome-drawer');
    await expect(drawer).toHaveAttribute('role', 'dialog');
    await expect(drawer).toHaveAttribute('aria-modal', 'true');
    expect(await drawer.getAttribute('aria-label')).toBeTruthy();
    expect(await drawer.evaluate((node) => node.contains(document.activeElement)), 'o foco entra na gaveta').toBe(true);
    const visited = new Set<string>();
    for (let index = 0; index < 40; index += 1) {
        await page.keyboard.press('Tab');
        expect(await drawer.evaluate((node) => node.contains(document.activeElement)), 'o Tab fica dentro da gaveta').toBe(true);
        visited.add(await page.evaluate(() => (document.activeElement as HTMLElement).outerHTML.slice(0, 160)));
    }
    const total = await drawer.evaluate((node) => [...node.querySelectorAll('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])')].filter((item) => item.getClientRects().length > 0 && getComputedStyle(item).visibility !== 'hidden').length);
    expect(visited.size, 'o Tab circula por todos os itens da gaveta').toBe(total);
    expect(await page.getByRole('button', { name: 'Ação do conteúdo' }).evaluate((node) => node.closest('[inert]') !== null), 'o fundo fica inerte').toBe(true);
    await page.keyboard.press('Escape');
    await expect(drawer).toHaveCount(0);
    await expect(menu).toBeFocused();
});

test('a troca de modo do cromo mantém o foco no controle do conteúdo', async ({ page }) => {
    await open(page, { so: 'cromo', chrome: 'sidebar' }, { width: 1440, height: 900 });
    const action = page.getByRole('button', { name: 'Ação do conteúdo' });
    await action.focus();
    await page.setViewportSize({ width: 390, height: 800 });
    await page.waitForTimeout(600);
    await expect(action).toBeFocused();
});

interface LabelMeasure { text: string; ratio: number }

const measureLabels = (page: Page): Promise<LabelMeasure[]> => page.evaluate(() => {
    const parse = (value: string): number[] | null => {
        const rgb = value.match(/rgba?\(([^)]+)\)/);
        if (rgb) return rgb[1].split(/[ ,/]+/).filter(Boolean).slice(0, 4).map(Number);
        const srgb = value.match(/color\(srgb ([^)]+)\)/);
        if (!srgb) return null;
        const parts = srgb[1].split(/[ /]+/).map(Number);
        return [parts[0] * 255, parts[1] * 255, parts[2] * 255, parts[3] ?? 1];
    };
    const channel = (v: number): number => { const u = v / 255; return u <= 0.03928 ? u / 12.92 : ((u + 0.055) / 1.055) ** 2.4; };
    const lum = (c: number[]): number => 0.2126 * channel(c[0]) + 0.7152 * channel(c[1]) + 0.0722 * channel(c[2]);
    // O fundo visto atrás do rótulo: as camadas translúcidas acima dele, compostas de baixo para cima sobre o primeiro fundo opaco
    // (ou sobre o branco do documento, se nenhum ancestral pinta).
    const background = (start: HTMLElement): number[] => {
        const layers: number[][] = [];
        for (let node: HTMLElement | null = start; node; node = node.parentElement) {
            const color = parse(getComputedStyle(node).backgroundColor);
            if (!color || (color[3] ?? 1) === 0) continue;
            layers.push(color);
            if ((color[3] ?? 1) >= 0.99) break;
        }
        return layers.reduceRight<number[]>((below, layer) => {
            const alpha = layer[3] ?? 1;
            return [0, 1, 2].map((i) => layer[i] * alpha + below[i] * (1 - alpha)).concat([1]);
        }, [255, 255, 255, 1]);
    };
    return [...document.querySelectorAll<HTMLElement>('[data-option-tile] h3')].map((label) => {
        const text = parse(getComputedStyle(label).color) ?? [0, 0, 0, 1];
        const a = lum(text);
        const b = lum(background(label));
        return { text: label.textContent ?? '', ratio: (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05) };
    });
});

for (const mode of ['escuro', 'claro']) {
    test(`os rótulos dos cartões de opção se leem sobre o cartão (4,5:1), em todas as decisões — ${mode}`, async ({ page }) => {
        for (const theme of THEMES_UNDER_TEST) {
            await open(page, { so: 'painel', tema: theme, ...(mode === 'claro' ? { claro: '1' } : {}) }, { width: 1440, height: 900 });
            for (const decision of DECISIONS) {
                await page.locator(`[data-decision-row="${decision}"]`).click();
                await page.getByRole('heading', { level: 2 }).first().waitFor();
                await page.waitForTimeout(250);
                const weak = (await measureLabels(page))
                    .filter((label) => label.ratio < LABEL_MIN_CONTRAST)
                    .map((label) => `${theme}/${decision}/"${label.text}" ${label.ratio.toFixed(2)}:1`);
                expect(weak, 'o rótulo se lê sobre o fundo do cartão').toEqual([]);
                await page.getByRole('button', { name: /voltar/i }).first().click();
                await page.locator('[data-decision-row="theme"]').waitFor();
            }
        }
    });
}

test('o texto de ajuda da prévia tem ao menos 160 px de largura, nos 25 temas', async ({ page }) => {
    const narrow: string[] = [];
    for (const theme of THEMES_UNDER_TEST) {
        await open(page, { so: 'painel', tema: theme }, { width: 1440, height: 900 });
        const width = await page.evaluate(() => document.querySelector('[data-testid="panel-host"] p.min-w-0, [data-testid="panel-host"] p[class*="basis-"]')?.getBoundingClientRect().width ?? -1);
        if (width < HINT_MIN_WIDTH) narrow.push(`${theme}: ${Math.round(width)}px`);
    }
    expect(narrow, 'o texto de ajuda cabe em linhas legíveis').toEqual([]);
});
