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
 * absoluta (fundo, textura, brilho); a rolagem é a da coluna, com o ajuste fino recolhido. A amostra do card é o card real do painel sobre o
 * rascunho (decisão D1 da plan-166): ela segue o tema atual, e o motor deixa o escopo da amostra mandar nos atributos `data-sx-*` (`_card-defaults.css`, `_card-materials.css`).
 * A medida de rolagem do "Ver todas" de cards lê o `dist/sarak.css`: com o build defasado a grade sai de uma coluna só; rode `npm run build` antes.
 */
import { test, expect, chromium, type Browser, type Page } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { buildHarness } from './build-harness.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ENTRY = path.join(HERE, 'fixtures', 'plan-140-coluna-entry.tsx');
const PREVIEW_DIR = process.env.SARAK_PREVIA_161_DIR;
const DECISIONS = ['Tema', 'Cores', 'Fontes', 'Forma', 'Componentes', 'Barras', 'Layout'] as const;

/** A meta de rolagem: nenhuma decisão passa de tantas alturas da área da coluna a 1440×900 (a medida de antes chegou a 15×). */
const MAX_SCROLL_SCREENS = 2.5;
/** O Tema mede com a galeria de temas aberta (ela é o grupo em uso da decisão), com a miniatura de tema do lote 2. */

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

            expect(screens, `rolagem de ${decision}: ${initial.scrollHeight}px de ${initial.clientHeight}px`).toBeLessThanOrEqual(MAX_SCROLL_SCREENS);
            expect(clipped.map((tile) => `${tile.name}: ${tile.clippedText.join('|')}`), `texto cortado em ${decision}`).toEqual([]);
            expect(leaking.map((tile) => `${tile.name}: ${tile.leaks}`), `elementos vazando em ${decision}`).toEqual([]);
            expect(worst, `a amostra mais alta de ${decision}`).toBeLessThanOrEqual(initial.clientHeight * MAX_TILE_HEIGHT_RATIO);
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

/**
 * O custo de abrir a decisão Tema (passo 2.3): o tempo do clique até o primeiro cartão de tema pintado e, com todas as
 * miniaturas desenhadas (rolando a coluna até o fim), a memória do JavaScript depois de coletar o lixo e o número de nós
 * do DOM. Cada rodada abre uma página nova; vale a mediana.
 */
const COST_RUNS = 3;
const median = (values: number[]): number => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];

const measureThemeCost = async (): Promise<{ openMs: number; heapMb: number; nodes: number; cards: number }> => {
    const page = await open(1440, 900);
    const session = await page.context().newCDPSession(page);
    await session.send('HeapProfiler.enable');
    const opened = await page.evaluate(() => new Promise<number>((resolve) => {
        const started = performance.now();
        const button = Array.from(document.querySelectorAll<HTMLButtonElement>('button')).find((node) => /^Tema/.test((node.textContent ?? '').trim()));
        button?.click();
        const poll = (): void => {
            if (document.querySelector('[data-theme-id]')) requestAnimationFrame(() => requestAnimationFrame(() => resolve(performance.now() - started)));
            else requestAnimationFrame(poll);
        };
        poll();
    }));
    await revealEverything(page);
    await page.evaluate(async () => {
        const scroller = (document.querySelector('[data-testid^="decision-"]') as HTMLElement).closest('.overflow-y-auto, .overflow-auto') as HTMLElement;
        for (let top = 0; top <= scroller.scrollHeight; top += scroller.clientHeight / 2) { scroller.scrollTop = top; await new Promise((resolve) => setTimeout(resolve, 80)); }
    });
    await page.waitForTimeout(800);
    await session.send('HeapProfiler.collectGarbage');
    const metrics = await session.send('Performance.getMetrics').catch(() => ({ metrics: [] as Array<{ name: string; value: number }> }));
    await session.send('Performance.enable');
    const heap = (await session.send('Performance.getMetrics')).metrics.find((metric) => metric.name === 'JSHeapUsedSize')?.value ?? metrics.metrics.find((metric) => metric.name === 'JSHeapUsedSize')?.value ?? 0;
    const counts = await page.evaluate(() => ({ nodes: document.querySelectorAll('*').length, cards: document.querySelectorAll('[data-theme-id]').length }));
    await page.close();
    return { openMs: opened, heapMb: heap / 1048576, nodes: counts.nodes, cards: counts.cards };
};

test.describe('custo da miniatura de tema', () => {
    test('abrir a decisão Tema: tempo, memória e nós, medidos', async () => {
        test.setTimeout(240_000);
        const runs: Array<{ openMs: number; heapMb: number; nodes: number; cards: number }> = [];
        for (let run = 0; run < COST_RUNS; run += 1) runs.push(await measureThemeCost());
        const cost = { openMs: Math.round(median(runs.map((item) => item.openMs))), heapMb: Number(median(runs.map((item) => item.heapMb)).toFixed(1)), nodes: median(runs.map((item) => item.nodes)), cards: runs[0].cards, runs };
        report.narrow.themeCost = cost;
        console.log(`[plan-161] custo do Tema ${JSON.stringify({ ...cost, runs: undefined })}`);
        const baseline = process.env.SARAK_CUSTO_161_ANTES ? JSON.parse(process.env.SARAK_CUSTO_161_ANTES) as { openMs: number } : null;
        if (baseline) expect(cost.openMs, `abrir o Tema custa no máximo o dobro de antes (${baseline.openMs} ms)`).toBeLessThanOrEqual(baseline.openMs * 2);
        expect(cost.cards).toBeGreaterThan(0);
    });
});

/** As larguras da coluna de decisões que o administrador alcança: o mínimo, o padrão e uma coluna arrastada larga. */
const COLUMN_WIDTHS = [280, 320, 480, 600] as const;
/** O nome do tema cabe em até tantas linhas, e nenhuma palavra se parte no meio (a medida de antes era uma letra por linha). */
const MAX_NAME_LINES = 4;

test.describe('o nome do tema na galeria', () => {
    for (const width of COLUMN_WIDTHS) {
        test(`com a coluna em ${width}px o nome não quebra uma letra por linha nem se corta`, async () => {
            const page = await open(1440, 900);
            await page.evaluate((value) => (document.querySelector('[style*="--sarak-design-engine-sidebar-w"]') as HTMLElement).style.setProperty('--sarak-design-engine-sidebar-w', `${value}px`), width);
            await page.getByRole('button', { name: /^Tema/ }).click();
            await page.getByRole('heading', { level: 2, name: 'Tema' }).waitFor();
            await page.locator('[data-theme-id]').first().waitFor();
            const names = await page.evaluate(() => Array.from(document.querySelectorAll<HTMLElement>('[data-theme-id]')).map((button) => {
                const tile = button.closest('[data-option-tile]') as HTMLElement;
                const heading = tile.querySelector('h3') as HTMLElement;
                const line = parseFloat(getComputedStyle(heading).lineHeight) || heading.getBoundingClientRect().height;
                const words = (heading.textContent ?? '').split(/[\s-]+/);
                const probe = document.createElement('span');
                probe.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap;font:inherit;letter-spacing:inherit';
                heading.appendChild(probe);
                let longest = 0;
                words.forEach((word) => { probe.textContent = word; longest = Math.max(longest, probe.getBoundingClientRect().width); });
                probe.remove();
                return { name: heading.textContent ?? '', lines: Math.round(heading.getBoundingClientRect().height / line), cut: heading.scrollWidth > heading.clientWidth + 1, room: heading.clientWidth, longestWord: Math.ceil(longest), tile: Math.round(tile.getBoundingClientRect().width) };
            }));
            const columns = await columnsOf(page);
            report.narrow[`themeNames${width}`] = { columns, widest: Math.max(...names.map((item) => item.tile)), worstLines: Math.max(...names.map((item) => item.lines)) };
            console.log(`[plan-161] nome do tema a ${width}px: ${JSON.stringify(report.narrow[`themeNames${width}`])}`);
            expect(names.length).toBeGreaterThan(0);
            expect(names.filter((item) => item.cut).map((item) => item.name), 'nome cortado').toEqual([]);
            expect(names.filter((item) => item.lines > MAX_NAME_LINES).map((item) => `${item.name}: ${item.lines} linhas`), `nome em mais de ${MAX_NAME_LINES} linhas`).toEqual([]);
            expect(names.filter((item) => item.longestWord > item.room + 1).map((item) => `${item.name}: palavra de ${item.longestWord}px em ${item.room}px`), 'palavra partida no meio').toEqual([]);
            await page.close();
        });
    }
});

/** O vazio máximo, em px de tela, entre a barra desenhada e a borda de baixo da opção na amostra larga da Barra de topo. */
const MAX_TOPBAR_VOID = 6;

test.describe('Barra de topo: a amostra larga sem vazio sob a barra e com o item ativo visível', () => {
    test('nenhuma das amostras deixa espaço sob a barra, e "Pedidos" aparece em todas', async () => {
        test.setTimeout(120_000);
        const page = await open(1440, 900);
        await page.getByRole('button', { name: /^Barras/ }).click();
        await page.getByRole('heading', { level: 2, name: 'Barras' }).waitFor();
        await revealEverything(page);
        await page.locator('[data-preset-group="topbar"]').scrollIntoViewIfNeeded();
        await page.waitForTimeout(1500);
        const tiles = await page.evaluate(() => Array.from(document.querySelectorAll<HTMLElement>('[data-preset-group="topbar"] [data-option-tile]')).map((tile) => {
            const sample = tile.querySelector('[data-option-sample]') as HTMLElement;
            const bar = tile.querySelector('[data-testid="bar-sample"]') as HTMLElement | null;
            const active = tile.querySelector<HTMLElement>('[aria-current="page"]');
            const rect = active?.getBoundingClientRect();
            return {
                name: tile.querySelector('h3')?.textContent?.trim() ?? '',
                empty: bar ? Math.round((sample.getBoundingClientRect().bottom - bar.getBoundingClientRect().bottom) * 10) / 10 : -1,
                activeVisible: Boolean(active && rect && rect.width > 0 && getComputedStyle(active).visibility !== 'hidden'),
            };
        }));
        report.narrow.topbarSamples = tiles;
        console.log('[plan-161] escondidos', tiles.filter((tile) => !tile.activeVisible).map((tile) => tile.name).join('; '));
        console.log(`[plan-161] amostras de topbar: ${tiles.length}, vazio máx ${Math.max(...tiles.map((tile) => tile.empty))} px, ativo visível ${tiles.filter((tile) => tile.activeVisible).length}`);
        expect(tiles.length, 'as amostras da Barra de topo (7 no registro)').toBe(7);
        expect(tiles.filter((tile) => tile.empty < -MAX_TOPBAR_VOID || tile.empty > MAX_TOPBAR_VOID).map((tile) => `${tile.name}: ${tile.empty}px`), 'vazio sob a barra').toEqual([]);
        expect(tiles.filter((tile) => !tile.activeVisible).map((tile) => tile.name), 'item ativo escondido').toEqual([]);
        await page.close();
    });
});

test.describe('390×844: a galeria de temas', () => {
    test('o cartão do tema cabe na coluna, com o nome inteiro', async () => {
        const page = await open(390, 844);
        await page.getByRole('button', { name: /^Tema/ }).click();
        await page.getByRole('heading', { level: 2, name: 'Tema' }).waitFor();
        await page.locator('[data-theme-id]').first().waitFor();
        await page.locator('[data-theme-id]').first().scrollIntoViewIfNeeded();
        await page.waitForTimeout(500);
        const geometry = await page.evaluate(() => {
            const cards = Array.from(document.querySelectorAll<HTMLElement>('[data-theme-id]')).map((button) => button.closest('[data-option-tile]') as HTMLElement);
            const names = cards.map((card) => {
                const heading = card.querySelector('h3') as HTMLElement;
                return { cut: heading.scrollWidth > heading.clientWidth + 1, lines: Math.round(heading.getBoundingClientRect().height / (parseFloat(getComputedStyle(heading).lineHeight) || 16)) };
            });
            return { cards: cards.length, width: Math.round(cards[0].getBoundingClientRect().width), cut: names.filter((item) => item.cut).length, worstLines: Math.max(...names.map((item) => item.lines)), pageScroll: document.documentElement.scrollWidth, viewport: window.innerWidth };
        });
        report.narrow.themes390 = geometry;
        console.log(`[plan-161] temas a 390: ${JSON.stringify(geometry)}`);
        await snap(page, 'estreito-tema.png', 'Decisão Tema a 390×844.');
        expect(geometry.cut, 'nome cortado').toBe(0);
        expect(geometry.worstLines, 'nome em poucas linhas').toBeLessThanOrEqual(MAX_NAME_LINES);
        expect(geometry.pageScroll, 'sem rolagem horizontal da página').toBeLessThanOrEqual(geometry.viewport);
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

// ---------------------------------------------------------------------------------------------------------------------
// Lote 3: o card de cada tema, desenhado sobre o rascunho (a base neutra saiu na plan-166)
// ---------------------------------------------------------------------------------------------------------------------
/** O que o card de uma amostra desenha: forma, borda, sombra e respiro, lidos do estilo calculado do `.sarak-card` dentro do tile. */
const cardSignatures = (page: Page): Promise<Record<string, Record<string, string>>> => page.evaluate(() => {
    const result: Record<string, Record<string, string>> = {};
    document.querySelectorAll<HTMLElement>('[data-preset-group="cards"] [data-option-tile]').forEach((tile, index) => {
        const card = tile.querySelector<HTMLElement>('.sarak-card');
        const name = `${index}:${Array.from(tile.querySelectorAll('h3')).pop()?.textContent?.trim() ?? ''}`;
        if (!card) return;
        const style = getComputedStyle(card);
        result[name] = {
            radius: style.borderTopLeftRadius, border: `${style.borderTopWidth} ${style.borderTopStyle}`, shadow: style.boxShadow, padding: style.paddingTop, background: style.backgroundColor,
        };
    });
    return result;
});

const openCardsGroup = async (page: Page): Promise<void> => {
    await page.getByRole('button', { name: /^Forma/ }).click();
    await page.getByRole('heading', { level: 2, name: 'Forma' }).waitFor();
    const toggle = page.locator('[data-group-toggle="cards"]');
    if ((await toggle.getAttribute('aria-expanded')) === 'false') await toggle.click();
    const seeAll = page.locator('[data-preset-toggle="cards"]');
    if ((await seeAll.getAttribute('aria-expanded')) === 'false') await seeAll.click();
    await page.locator('[data-preset-group="cards"]').scrollIntoViewIfNeeded();
    await page.evaluate(async () => {
        const group = document.querySelector('[data-preset-group="cards"]') as HTMLElement;
        const scroller = group.closest('.overflow-y-auto, .overflow-auto') as HTMLElement | null;
        if (!scroller) return;
        const top = group.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop;
        for (let y = top; y <= top + group.scrollHeight + scroller.clientHeight; y += Math.max(120, scroller.clientHeight / 2)) {
            scroller.scrollTop = y;
            await new Promise((resolve) => setTimeout(resolve, 80));
        }
        scroller.scrollTop = top;
    });
    // A amostra só se desenha quando entra na área visível: o que ficou para trás recebe uma visita até desenhar.
    await page.evaluate(async () => {
        for (let round = 0; round < 4; round += 1) {
            const pending = Array.from(document.querySelectorAll<HTMLElement>('[data-preset-group="cards"] [data-option-tile]')).filter((tile) => !tile.querySelector('.sarak-card'));
            if (!pending.length) return;
            for (const tile of pending) {
                tile.scrollIntoView({ block: 'center' });
                await new Promise((resolve) => setTimeout(resolve, 150));
            }
        }
    });
    await page.waitForTimeout(400);
};

test.describe('o card de cada tema, sobre o rascunho', () => {
    test('há um card por tema embarcado, em seção própria, e a amostra segue o tema atual', async () => {
        const page = await open(1440, 900);
        await openCardsGroup(page);
        const headings = await page.locator('[data-preset-group="cards"] h4').allTextContents();
        const before = await cardSignatures(page);
        await snap(page, 'forma-cards-dos-temas.png', 'Forma › Estilo dos cards, "Ver todas": os cards curados e o card de cada tema, sobre o rascunho (tema atual: Sarak Sovereign).');

        await page.getByRole('button', { name: /Voltar para a lista de decisões/ }).click();
        await page.getByRole('button', { name: /^Tema/ }).click();
        await page.getByRole('heading', { level: 2, name: 'Tema' }).waitFor();
        const brutalism = page.locator('[data-theme-id="neo-brutalism"]');
        await brutalism.scrollIntoViewIfNeeded();
        await brutalism.click();
        await page.waitForTimeout(800);
        await page.getByRole('button', { name: /Voltar para a lista de decisões/ }).click();
        await openCardsGroup(page);
        const after = await cardSignatures(page);
        await snap(page, 'forma-cards-dos-temas-outro-tema.png', 'O mesmo grupo com outro tema aplicado ao rascunho (Neo Brutalism): as amostras seguem o tema.');

        report.narrow.themeCards = { sections: headings, tiles: Object.keys(before).length };
        console.log(`[plan-161] cards: ${Object.keys(before).length} amostras; seções ${JSON.stringify(headings)}`);
        expect(headings, 'seções').toEqual(expect.arrayContaining(['Cards curados', 'Cards dos temas']));
        const tiles = await page.locator('[data-preset-group="cards"] [data-option-tile]').count();
        const undrawn = await page.locator('[data-preset-group="cards"] [data-option-tile]').evaluateAll((nodes) => nodes.filter((node) => !node.querySelector('.sarak-card')).map((node) => Array.from(node.querySelectorAll('h3')).pop()?.textContent?.trim()));
        expect(undrawn, 'opção sem card desenhado').toEqual([]);
        expect(Object.keys(before).length, 'toda opção desenhou o card').toBe(tiles);
        expect(tiles, 'os curados e um card por tema embarcado').toBeGreaterThanOrEqual(25 + 28);
        expect(after, 'o card de cada amostra segue o tema atual (forma, borda, sombra, respiro e fundo mudam com ele)').not.toEqual(before);
        await page.close();
    });

    test('Forma com o "Ver todas" de cards aberto: rolagem e geometria das amostras de card', async () => {
        const page = await open(1440, 900);
        await openCardsGroup(page);
        const scroll = await measureScroll(page);
        const geometry = await page.locator('[data-preset-group="cards"] [data-option-tile]').evaluateAll((nodes) => {
            const boxes = nodes.map((node) => node.getBoundingClientRect());
            const firstRow = boxes.filter((box) => Math.abs(box.top - boxes[0].top) < 4).length;
            const grid = document.querySelector('[data-preset-group="cards"] .grid') as HTMLElement;
            return {
                template: getComputedStyle(grid).gridTemplateColumns, tiles: boxes.length, columns: firstRow,
                width: Math.round(boxes[0].width), height: Math.round(boxes[0].height), tallest: Math.round(Math.max(...boxes.map((box) => box.height))),
            };
        });
        const entry = { scrollHeight: scroll.scrollHeight, clientHeight: scroll.clientHeight, screens: Number((scroll.scrollHeight / Math.max(1, scroll.clientHeight)).toFixed(2)), ...geometry };
        report.narrow.formaCardsVerTodas = entry;
        console.log(`[plan-161] Forma, "Ver todas" de cards aberto: ${JSON.stringify(entry)}`);
        expect(entry.columns, 'colunas das amostras de card a 1440 px').toBeGreaterThanOrEqual(2);
        expect(entry.tallest, 'a amostra de card mais alta').toBeLessThanOrEqual(scroll.clientHeight * MAX_TILE_HEIGHT_RATIO);
        await page.close();
    });

    test('o card de dois temas diferentes tem amostras diferentes (o rascunho não achata os presets)', async () => {
        const page = await open(1440, 900);
        await openCardsGroup(page);
        const signatures = await cardSignatures(page);
        const distinct = new Set(Object.values(signatures).map((signature) => JSON.stringify(signature)));
        expect(distinct.size, 'assinaturas distintas entre as amostras').toBeGreaterThan(Object.keys(signatures).length * 0.6);
        await page.close();
    });
});

// ---------------------------------------------------------------------------------------------------------------------
// Lote 4: a textura do card e a do fundo, cada uma num grupo da Forma com o alvo no nome
// ---------------------------------------------------------------------------------------------------------------------
/** Abre um grupo da Forma (e o "Ver todas" dele), rola até desenhar todas as amostras e volta ao topo do grupo. */
const openFormGroup = async (page: Page, group: string, seeAll = true): Promise<void> => {
    const selector = `[data-preset-group="${group}"]`;
    const toggle = page.locator(`[data-group-toggle="${group}"]`);
    if ((await toggle.getAttribute('aria-expanded')) === 'false') await toggle.click();
    const more = page.locator(`[data-preset-toggle="${group}"]`);
    if (seeAll && (await more.count()) && (await more.getAttribute('aria-expanded')) === 'false') await more.click();
    await page.locator(selector).scrollIntoViewIfNeeded();
    await page.evaluate(async (css) => {
        for (let round = 0; round < 4; round += 1) {
            const tiles = Array.from(document.querySelectorAll<HTMLElement>(`${css} [data-option-tile]`));
            const pending = tiles.filter((tile) => !tile.querySelector('.sarak-card, .sarak-design-scope'));
            if (!pending.length) return;
            for (const tile of pending) {
                tile.scrollIntoView({ block: 'center' });
                await new Promise((resolve) => setTimeout(resolve, 120));
            }
        }
    }, selector);
    await page.waitForTimeout(300);
};

const openForm = async (page: Page): Promise<void> => {
    await page.getByRole('button', { name: /^Forma/ }).click();
    await page.getByRole('heading', { level: 2, name: 'Forma' }).waitFor();
    await page.waitForTimeout(500);
};

/** O que a amostra desenha de textura: o `::after` do card e o `::before` do escopo (fundo), mais a cor do fundo do escopo. */
const textureSignatures = (page: Page, groups: string[]): Promise<Record<string, string>> => page.evaluate((ids) => {
    const result: Record<string, string> = {};
    for (const id of ids) {
        document.querySelectorAll<HTMLElement>(`[data-preset-group="${id}"] [data-option-tile]`).forEach((tile, index) => {
            const name = `${id}:${index}:${Array.from(tile.querySelectorAll('h3')).pop()?.textContent?.trim() ?? ''}`;
            const card = tile.querySelector<HTMLElement>('.sarak-card');
            const scope = tile.querySelector<HTMLElement>('.sarak-design-scope');
            const image = (element: Element | null, pseudo: string): string => (element ? getComputedStyle(element, pseudo).backgroundImage.slice(0, 90) : '-');
            result[name] = [image(card, '::after'), image(scope, '::before'), scope ? getComputedStyle(scope).backgroundColor : '-'].join(' | ');
        });
    }
    return result;
}, groups);

test.describe('Forma: textura do card e textura do fundo', () => {
    test('são dois grupos vizinhos com o alvo no nome, e nenhuma aba se chama só "Texturas"', async () => {
        const page = await open(1440, 900);
        await openForm(page);
        const toggles = await page.locator('[data-group-toggle]').evaluateAll((nodes) => nodes.map((node) => ({ id: node.getAttribute('data-group-toggle') ?? '', title: (node.textContent ?? '').trim() })));
        const ids = toggles.map((toggle) => toggle.id);
        const card = toggles.find((toggle) => toggle.id === 'cardTextures');
        const background = toggles.find((toggle) => toggle.id === 'textures');
        report.narrow.formaTexturas = { grupos: toggles.map((toggle) => `${toggle.id}: ${toggle.title}`) };
        console.log(`[plan-161] Forma, grupos: ${JSON.stringify(toggles.map((toggle) => toggle.title))}`);
        expect(card?.title, 'título do grupo da textura do card').toMatch(/Textura do card/);
        expect(background?.title, 'título do grupo da textura do fundo').toMatch(/Textura do fundo/);
        expect(Math.abs(ids.indexOf('cardTextures') - ids.indexOf('textures')), 'os dois grupos são vizinhos').toBe(1);
        const onlyTextures = await page.getByRole('button', { name: /^Texturas$/ }).count();
        expect(onlyTextures, 'botão que se chama só "Texturas"').toBe(0);
        expect(await page.getByRole('tab', { name: /^Texturas$/ }).count(), 'aba que se chama só "Texturas"').toBe(0);
        expect(await page.locator('[data-group-toggle="atmosphere"]').textContent(), 'a Atmosfera já não carrega a textura no nome').not.toMatch(/textura/i);

        await openFormGroup(page, 'cardTextures');
        await snap(page, 'forma-textura-do-card.png', 'Forma › Textura do card, "Ver todas": as famílias de textura, cada amostra com a textura dela.');
        await openFormGroup(page, 'textures');
        await snap(page, 'forma-textura-do-fundo.png', 'Forma › Textura do fundo, "Ver todas": ao lado da textura do card, com o alvo no nome.');
        for (const group of ['cardTextures', 'textures']) {
            const drawn = await page.locator(`[data-preset-group="${group}"] [data-option-tile]`).count();
            expect(drawn, `opções do grupo ${group}`).toBeGreaterThanOrEqual(30);
        }
        await page.close();
    });

    test('a textura do card que o rascunho já tem não aparece nas amostras de card nem nas de fundo', async () => {
        const page = await open(1440, 900);
        await openForm(page);
        await openFormGroup(page, 'cards', false);
        await openFormGroup(page, 'cardTextures', false);
        await openFormGroup(page, 'textures', false);
        const groups = ['cards', 'cardTextures', 'textures'];
        const before = await textureSignatures(page, groups);
        const grid = page.locator('[data-preset-group="cardTextures"] [data-option-tile]', { hasText: /Grade|Grid/i }).first();
        await grid.scrollIntoViewIfNeeded();
        await grid.click();
        await page.waitForTimeout(800);
        const after = await textureSignatures(page, groups);
        const changed = Object.keys(before).filter((key) => before[key] !== after[key]);
        report.narrow.texturaDoCardNoRascunho = { amostras: Object.keys(before).length, mudaram: changed };
        console.log(`[plan-161] textura do card aplicada: ${Object.keys(before).length} amostras, ${changed.length} mudaram ${JSON.stringify(changed.slice(0, 5))}`);
        expect(changed, 'amostras que herdaram a textura do card aplicada').toEqual([]);
        await page.close();
    });

    test('a textura do fundo que o rascunho já tem não aparece nas amostras de card nem nas de fundo', async () => {
        const page = await open(1440, 900);
        await openForm(page);
        await openFormGroup(page, 'cards', false);
        await openFormGroup(page, 'cardTextures', false);
        await openFormGroup(page, 'textures', false);
        const groups = ['cards', 'cardTextures', 'textures'];
        const before = await textureSignatures(page, groups);
        const grid = page.locator('[data-preset-group="textures"] [data-option-tile]', { hasText: /Grade|Grid/i }).first();
        await grid.scrollIntoViewIfNeeded();
        await grid.click();
        await page.waitForTimeout(800);
        const after = await textureSignatures(page, groups);
        const changed = Object.keys(before).filter((key) => before[key] !== after[key]);
        report.narrow.texturaDoFundoNoRascunho = { amostras: Object.keys(before).length, mudaram: changed };
        console.log(`[plan-161] textura do fundo aplicada: ${Object.keys(before).length} amostras, ${changed.length} mudaram ${JSON.stringify(changed.slice(0, 5))}`);
        expect(changed, 'amostras que herdaram a textura do fundo aplicada').toEqual([]);
        await page.close();
    });

    test('a Forma como abre fica na meta de rolagem; com os dois grupos de textura abertos só se mede, sem meta', async () => {
        const page = await open(1440, 900);
        await openForm(page);
        const closed = await measureScroll(page);
        await openFormGroup(page, 'cardTextures');
        await openFormGroup(page, 'textures');
        const opened = await measureScroll(page);
        report.narrow.formaTexturasRolagem = { fechada: closed, aberta: opened, alturasAberta: Number((opened.scrollHeight / opened.clientHeight).toFixed(2)) };
        console.log(`[plan-161] Forma: ${JSON.stringify(report.narrow.formaTexturasRolagem)}`);
        expect(closed.scrollHeight / closed.clientHeight, 'Forma como abre').toBeLessThanOrEqual(MAX_SCROLL_SCREENS);
        await page.close();
    });
});
