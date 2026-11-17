/**
 * O catálogo do painel proporcional, no navegador (lote 1 da plan-161): a rolagem de cada decisão, a geometria das amostras
 * (largura, altura, texto cortado, elemento vazando) e o corte de botão e texto no cabeçalho e na barra de ações, a 1440×900
 * e a 390×844.
 *
 * Os números saem em `console.log` (linhas `[plan-161]`) e, com `SARAK_PREVIA_161_DIR`, num `medidas.json` e nas capturas PNG
 * da prévia para o dono:
 *   $env:SARAK_PREVIA_161_DIR='C:\tmp\sarak-previa-161'
 *   npx playwright test --config=browser-tests/playwright.config.ts browser-tests/plan-161-catalogo-proporcional.spec.ts
 *
 * LIMITES DECLARADOS (R18): Chromium headless; o tema `sarak-sovereign`; lê `src/` pelo esbuild do harness (não mede o `dist/`);
 * "vazando" é geométrico — texto, controle ou imagem cuja caixa passa da caixa da amostra — e ignora o que é decoração
 * absoluta (fundo, textura, brilho); a rolagem é a da coluna, com o ajuste fino recolhido.
 */
import { test, expect, chromium, type Browser, type Page } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { buildHarness } from './build-harness.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ENTRY = path.join(HERE, 'fixtures', 'plan-140-coluna-entry.tsx');
const PREVIEW_DIR = process.env.SARAK_PREVIA_161_DIR;
const DECISIONS = ['Tema', 'Cores', 'Fontes', 'Forma', 'Componentes', 'Layout'] as const;

/** A meta de rolagem: nenhuma decisão passa de tantas alturas da área da coluna a 1440×900 (a medida de antes chegou a 15×). */
const MAX_SCROLL_SCREENS = 2.5;
/** O Tema mede com a galeria de temas aberta (ela é o grupo em uso da decisão); o cartão antigo cai no lote 2, então o limite fica declarado aqui até lá. */
const SCROLL_LIMIT: Readonly<Record<string, number>> = { Tema: 15 };
/** O que esta rodada não mede: a miniatura de tema é do lote 2, e a seção de paletas é da plan-164. */
const NOT_IN_LOTE_1: Readonly<Record<string, string>> = { Cores: 'a seção de paletas é da plan-164' };

/** O lado máximo, em px, de um quadrado de Personalidade (a plan pede "quadrado pequeno com o nome"). */
const MAX_PERSONALITY_SIDE = 120;
/** Altura máxima de uma amostra de grupo, em alturas da coluna. */
const MAX_TILE_HEIGHT_RATIO = 0.45;

interface TileReport { name: string; width: number; height: number; clippedText: string[]; leaks: number }
interface DecisionReport { decision: string; scrollHeight: number; clientHeight: number; screens: number; tiles: number; worstTile: number; clipped: number; leaks: number; columns: number }

const report: { desktop: DecisionReport[]; narrow: Record<string, unknown>; hint: Record<string, unknown> } = { desktop: [], narrow: {}, hint: {} };
const captures: Array<{ file: string; caption: string }> = [];
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
    if (!PREVIEW_DIR) return;
    fs.mkdirSync(PREVIEW_DIR, { recursive: true });
    const label = process.env.SARAK_PREVIA_161_LABEL ?? 'depois';
    fs.writeFileSync(path.join(PREVIEW_DIR, `medidas-${label}.json`), JSON.stringify(report, null, 2), 'utf8');
    const figures = captures.map((item, index) => `<figure><img src="${item.file}" alt="${item.caption}"><figcaption>${index + 1}. ${item.caption}</figcaption></figure>`).join('\n');
    fs.writeFileSync(path.join(PREVIEW_DIR, `index-${label}.html`), `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Plan 161 — ${label}</title>
<style>body{font-family:system-ui,sans-serif;margin:24px;background:#10131a;color:#e8ecf4}figure{margin:0 0 32px}img{max-width:100%;border:1px solid #2b3242;border-radius:8px}figcaption{margin-top:8px;font-size:14px}</style></head>
<body><h1>Plan 161 — ${label}</h1>\n${figures}\n</body></html>`, 'utf8');
});

const open = async (width: number, height: number): Promise<Page> => {
    const page = await browser.newPage({ viewport: { width, height } });
    await page.goto(`${harnessUrl}?largura=${width}px`);
    await page.getByRole('button', { name: /Usar minha marca/ }).waitFor();
    await page.waitForTimeout(600);
    return page;
};

const snap = async (page: Page, file: string, caption: string): Promise<void> => {
    if (!PREVIEW_DIR) return;
    await page.waitForTimeout(700);
    fs.mkdirSync(PREVIEW_DIR, { recursive: true });
    const label = process.env.SARAK_PREVIA_161_LABEL ?? 'depois';
    const name = `${label}-${file}`;
    await page.screenshot({ path: path.join(PREVIEW_DIR, name) });
    captures.push({ file: name, caption });
};

/** Abre toda seção recolhida da decisão (o lote põe os grupos fechados por padrão) e rola até desenhar todas as amostras. */
const revealEverything = async (page: Page): Promise<void> => {
    await page.waitForTimeout(500);
    for (let round = 0; round < 40; round += 1) {
        const closed = page.locator(`[data-group-toggle][aria-expanded="false"]`);
        if (!(await closed.count())) break;
        await closed.first().click();
    }
    const expanders = page.locator('[data-preset-toggle][aria-expanded="false"]');
    for (let index = 0; index < (await expanders.count()); index += 1) await expanders.nth(index).click();
    await page.evaluate(async () => {
        const scroller = (document.querySelector('[data-testid^="decision-"]') as HTMLElement | null)?.closest('.overflow-y-auto, .overflow-auto') as HTMLElement | null;
        if (!scroller) return;
        for (let top = 0; top <= scroller.scrollHeight; top += Math.max(120, scroller.clientHeight / 2)) {
            scroller.scrollTop = top;
            await new Promise((resolve) => setTimeout(resolve, 60));
        }
        scroller.scrollTop = 0;
    });
    await page.waitForTimeout(300);
};

/** A rolagem da decisão: o elemento rolável mais próximo da decisão, e a altura do conteúdo contra a da área. */
const measureScroll = (page: Page) => page.evaluate(() => {
    const root = document.querySelector('[data-testid^="decision-"]') as HTMLElement;
    let node: HTMLElement | null = root;
    while (node && !/(auto|scroll)/.test(getComputedStyle(node).overflowY)) node = node.parentElement;
    return { scrollHeight: node?.scrollHeight ?? 0, clientHeight: node?.clientHeight ?? 0, width: root.getBoundingClientRect().width };
});

/** Cada amostra: a caixa, o texto cortado e os elementos que passam da caixa da própria amostra. */
const measureTiles = (page: Page): Promise<TileReport[]> => page.evaluate(() => {
    const decorative = (element: Element): boolean => {
        for (let node: Element | null = element; node; node = node.parentElement) {
            const style = getComputedStyle(node);
            if ((style.position === 'absolute' || style.position === 'fixed') && (node.getAttribute('aria-hidden') === 'true' || style.pointerEvents === 'none')) return true;
            if (node.hasAttribute('data-option-tile')) return false;
        }
        return false;
    };
    return Array.from(document.querySelectorAll<HTMLElement>('[data-option-tile]')).map((tile) => {
        const box = tile.getBoundingClientRect();
        const sample = (tile.querySelector('[data-option-sample]') as HTMLElement | null) ?? tile;
        const frame = sample.getBoundingClientRect();
        const name = Array.from(tile.querySelectorAll('h3')).pop()?.textContent?.trim() ?? tile.textContent?.trim().slice(0, 30) ?? '';
        const clippedText: string[] = [];
        let leaks = 0;
        tile.querySelectorAll<HTMLElement>('*').forEach((element) => {
            if (element.closest('svg') && element.tagName !== 'svg') return;
            const rect = element.getBoundingClientRect();
            if (rect.width <= 1 || rect.height <= 1 || decorative(element)) return;
            const hasText = Array.from(element.childNodes).some((child) => child.nodeType === 3 && (child.textContent ?? '').trim().length > 0);
            const inSample = sample.contains(element);
            const area = inSample ? frame : box;
            const outside = rect.left < area.left - 1.5 || rect.right > area.right + 1.5 || rect.top < area.top - 1.5 || rect.bottom > area.bottom + 1.5;
            if (outside && (hasText || /^(BUTTON|INPUT|IMG|SVG|TABLE)$/i.test(element.tagName))) leaks += 1;
            const style = getComputedStyle(element);
            const cuts = /(hidden|clip)/.test(style.overflowX + style.overflowY) || style.textOverflow === 'ellipsis';
            if (hasText && ((cuts && (element.scrollWidth > element.clientWidth + 1 || element.scrollHeight > element.clientHeight + 1)) || (outside && inSample))) clippedText.push((element.textContent ?? '').trim().slice(0, 24));
        });
        return { name, width: Math.round(box.width), height: Math.round(box.height), clippedText, leaks };
    });
});

const columnsOf = (page: Page): Promise<number> => page.evaluate(() => {
    const tops = Array.from(document.querySelectorAll<HTMLElement>('[data-option-tile]')).map((tile) => Math.round(tile.getBoundingClientRect().top + window.scrollY));
    if (!tops.length) return 0;
    const firstRow = tops.filter((top) => Math.abs(top - tops[0]) < 4);
    return firstRow.length;
});

test.describe('1440×900: rolagem e amostras de cada decisão', () => {
    for (const decision of DECISIONS) {
        test(`${decision}: rola até ${MAX_SCROLL_SCREENS} alturas, sem texto cortado nem elemento vazando`, async () => {
            const page = await open(1440, 900);
            await page.getByRole('button', { name: new RegExp(`^${decision}`) }).click();
            await page.getByRole('heading', { level: 2, name: decision }).waitFor();
            await page.waitForTimeout(500);

            const initial = await measureScroll(page);
            const screens = initial.scrollHeight / Math.max(1, initial.clientHeight);
            await snap(page, `desktop-${decision.toLowerCase()}.png`, `Decisão ${decision} a 1440×900, grupos como abrem por padrão.`);

            await revealEverything(page);
            const tiles = await measureTiles(page);
            const clipped = tiles.filter((tile) => tile.clippedText.length > 0);
            const leaking = tiles.filter((tile) => tile.leaks > 0);
            const worst = tiles.reduce((max, tile) => Math.max(max, tile.height), 0);
            const entry: DecisionReport = {
                decision, scrollHeight: initial.scrollHeight, clientHeight: initial.clientHeight, screens: Number(screens.toFixed(2)),
                tiles: tiles.length, worstTile: worst, clipped: clipped.length, leaks: leaking.reduce((sum, tile) => sum + tile.leaks, 0), columns: await columnsOf(page),
            };
            report.desktop.push(entry);
            console.log(`[plan-161] ${JSON.stringify(entry)}`);
            if (clipped.length) console.log(`[plan-161] ${decision} cortados: ${clipped.slice(0, 6).map((tile) => `${tile.name} → ${tile.clippedText.join('|')}`).join(' ; ')}`);

            if (!NOT_IN_LOTE_1[decision]) expect(screens, `rolagem de ${decision}: ${initial.scrollHeight}px de ${initial.clientHeight}px`).toBeLessThanOrEqual(SCROLL_LIMIT[decision] ?? MAX_SCROLL_SCREENS);
            expect(clipped.map((tile) => `${tile.name}: ${tile.clippedText.join('|')}`), `texto cortado em ${decision}`).toEqual([]);
            expect(leaking.map((tile) => `${tile.name}: ${tile.leaks}`), `elementos vazando em ${decision}`).toEqual([]);
            if (!NOT_IN_LOTE_1[decision]) expect(worst, `a amostra mais alta de ${decision}`).toBeLessThanOrEqual(initial.clientHeight * MAX_TILE_HEIGHT_RATIO);
            await page.close();
        });
    }

    test('Personalidades: quadrado pequeno com o nome; Fontes na mesma grade de várias colunas', async () => {
        const page = await open(1440, 900);
        await page.getByRole('button', { name: /^Tema/ }).click();
        await page.getByRole('heading', { level: 2, name: 'Tema' }).waitFor();
        await revealEverything(page);
        const personalities = await page.locator('[data-preset-group="personalities"] [data-option-tile]').evaluateAll((nodes) => nodes.map((node) => {
            const rect = node.getBoundingClientRect();
            return { name: Array.from(node.querySelectorAll('h3')).pop()?.textContent?.trim() ?? '', width: Math.round(rect.width), height: Math.round(rect.height) };
        }));
        report.narrow.personalities = personalities;
        console.log(`[plan-161] personalidades ${JSON.stringify(personalities.slice(0, 3))} (${personalities.length})`);
        expect(personalities.length).toBeGreaterThan(0);
        for (const item of personalities) {
            expect(item.width, `${item.name}: largura`).toBeLessThanOrEqual(MAX_PERSONALITY_SIDE * 1.6);
            expect(item.height, `${item.name}: altura`).toBeLessThanOrEqual(MAX_PERSONALITY_SIDE * 1.9);
            expect(item.name.length, 'o nome está no cartão').toBeGreaterThan(0);
        }
        const personalityColumns = await page.evaluate(() => {
            const tiles = Array.from(document.querySelectorAll<HTMLElement>('[data-preset-group="personalities"] [data-option-tile]'));
            return tiles.filter((tile) => Math.abs(tile.getBoundingClientRect().top - tiles[0].getBoundingClientRect().top) < 4).length;
        });
        expect(personalityColumns, 'Personalidades em várias colunas').toBeGreaterThanOrEqual(2);
        await page.keyboard.press('Escape');

        await page.getByRole('button', { name: /^Fontes/ }).click();
        await page.getByRole('heading', { level: 2, name: 'Fontes' }).waitFor();
        await revealEverything(page);
        console.log(`[plan-161] grupos de Fontes: ${await page.locator('[data-preset-group]').evaluateAll((nodes) => nodes.map((node) => `${node.getAttribute('data-preset-group')}:${node.querySelectorAll('[data-option-tile]').length}`).join(','))}`);
        const fontColumns = await page.evaluate(() => {
            const tiles = Array.from(document.querySelectorAll<HTMLElement>('[data-preset-group="fonts"] [data-option-tile]'));
            return { total: tiles.length, firstRow: tiles.filter((tile) => Math.abs(tile.getBoundingClientRect().top - tiles[0].getBoundingClientRect().top) < 4).length, width: Math.round(tiles[0]?.getBoundingClientRect().width ?? 0), height: Math.round(tiles[0]?.getBoundingClientRect().height ?? 0) };
        });
        report.narrow.fonts = fontColumns;
        console.log(`[plan-161] fontes ${JSON.stringify(fontColumns)}`);
        expect(fontColumns.firstRow, 'Fontes na mesma grade de colunas').toBeGreaterThanOrEqual(2);
        await page.close();
    });

    test('Atmosfera: nenhum botão de "Ver detalhes" por cima da amostra', async () => {
        const page = await open(1440, 900);
        await page.getByRole('button', { name: /^Forma/ }).click();
        await page.getByRole('heading', { level: 2, name: 'Forma' }).waitFor();
        await revealEverything(page);
        const overlays = await page.evaluate(() => Array.from(document.querySelectorAll('[data-preset-group="atmosphere"] [data-option-tile], [data-preset-group="gradient"] [data-option-tile]'))
            .filter((tile) => /ver detalhes/i.test(tile.querySelector('[data-option-sample]')?.textContent ?? '')).length);
        report.narrow.atmosphereDetailLabels = overlays;
        expect(overlays).toBe(0);
        await page.close();
    });

    test('o texto do cabeçalho da prévia cabe ou quebra, sem reticências', async () => {
        const page = await open(1440, 900);
        const hint = await page.evaluate(() => {
            const node = Array.from(document.querySelectorAll<HTMLElement>('p')).find((paragraph) => /Passe o mouse/.test(paragraph.textContent ?? ''));
            if (!node) return null;
            const style = getComputedStyle(node);
            return { text: node.textContent, ellipsis: style.textOverflow === 'ellipsis', truncated: node.scrollWidth > node.clientWidth + 1, whiteSpace: style.whiteSpace };
        });
        report.hint = { ...(hint ?? {}) };
        console.log(`[plan-161] dica ${JSON.stringify(hint)}`);
        expect(hint, 'a dica da barra da prévia existe a 1440').not.toBeNull();
        expect(hint?.ellipsis, 'sem reticências').toBe(false);
        expect(hint?.truncated, 'sem texto escondido').toBe(false);
        await page.close();
    });
});

test.describe('390×844: Aplicar e as abas de dispositivo', () => {
    test('"Aplicar" e as abas de dispositivo cabem inteiros na largura', async () => {
        const page = await open(390, 844);
        await page.getByRole('button', { name: /^Forma/ }).click();
        await page.getByRole('heading', { level: 2, name: 'Forma' }).waitFor();

        const geometry = await page.evaluate(() => {
            const cut = (element: HTMLElement | null) => (element ? { left: Math.round(element.getBoundingClientRect().left), right: Math.round(element.getBoundingClientRect().right), cut: element.scrollWidth > element.clientWidth + 1, text: (element.textContent ?? '').trim() } : null);
            const apply = document.querySelector<HTMLElement>('[data-testid="sarak-panel-apply"]');
            const group = Array.from(document.querySelectorAll<HTMLElement>('[role="group"]')).find((node) => /Dispositivo/.test(node.getAttribute('aria-label') ?? ''));
            const devices = group ? Array.from(group.querySelectorAll<HTMLElement>('button')).map((button) => cut(button)) : [];
            apply?.scrollIntoView({ block: 'center' });
            const column = document.querySelector<HTMLElement>('.sarak-panel-column');
            const list = document.querySelector<HTMLElement>('[data-testid^="decision-"]');
            return { viewport: window.innerWidth, apply: cut(apply), group: cut(group ?? null), devices, columnHeight: Math.round(column?.getBoundingClientRect().height ?? 0), listHeight: Math.round(list?.parentElement?.clientHeight ?? 0), pageScroll: document.documentElement.scrollWidth };
        });
        report.narrow.geometry = geometry;
        console.log(`[plan-161] 390 ${JSON.stringify(geometry)}`);
        await snap(page, 'estreito-forma.png', 'Painel a 390×844, decisão Forma.');

        expect(geometry.apply, '"Aplicar" existe').not.toBeNull();
        expect(geometry.apply!.left).toBeGreaterThanOrEqual(0);
        expect(geometry.apply!.right).toBeLessThanOrEqual(geometry.viewport);
        expect(geometry.apply!.cut, '"Aplicar" sem texto cortado').toBe(false);
        for (const device of geometry.devices) {
            expect(device!.cut, `a aba "${device!.text}" sem texto cortado`).toBe(false);
            expect(device!.right, `a aba "${device!.text}" dentro da tela`).toBeLessThanOrEqual(geometry.viewport);
        }
        expect(geometry.pageScroll, 'sem rolagem horizontal da página').toBeLessThanOrEqual(geometry.viewport);
        await page.close();
    });
});
