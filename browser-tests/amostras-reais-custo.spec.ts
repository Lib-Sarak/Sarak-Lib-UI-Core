/**
 * O custo das amostras do painel com o componente real, no navegador (lote 1 da plan-166): para cada grupo de opções, o que custa
 * abrir hoje (catálogo de produção) e com o protótipo (componente real), nos dois modos. Mede, por grupo: o tempo do clique até o
 * primeiro cartão pintado, a memória do JavaScript depois de coletar o lixo, os nós do DOM com todas as opções desenhadas e, na
 * troca de modo, os recálculos de estilo e o tempo de estilo + layout + script. Mediana de 3 rodadas, cada uma numa página nova.
 *
 * Os números saem em `console.log` (linhas `[plan-166]`) e, com `SARAK_PREVIA_CUSTO_DIR`, num `medidas.json`, nas capturas lado a
 * lado (hoje × protótipo) e num `index.html` para o dono:
 *   $env:SARAK_PREVIA_CUSTO_DIR='C:\tmp\sarak-previa-166'
 *   npx playwright test --config=browser-tests/playwright.config.ts browser-tests/amostras-reais-custo.spec.ts
 *
 * LIMITES DECLARADOS (R18): Chromium headless; React de desenvolvimento (o mesmo que a medida de hoje da plan-161 usou, para as duas
 * séries serem comparáveis); o tema `sarak-sovereign`; lê `src/` pelo esbuild do harness e o CSS de `dist/` (sem `npm run build`
 * recente, mede a folha anterior); a coluna é a do painel (360 px), só com as opções destacadas de cada grupo (o "Ver todas" fica
 * fechado, como a decisão abre); o tempo é o da máquina que roda, e vale a razão entre as duas variantes, não o valor absoluto. O
 * protótipo só existe onde o componente real cabe numa miniatura: o `SarakModal` abre sempre em portal no `body`, então o grupo
 * `modal` não tem protótipo e o spec o registra como tal.
 */
import { test, expect, chromium, type Browser, type CDPSession, type Page } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { buildHarness } from './build-harness.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ENTRY = path.join(HERE, 'fixtures', 'amostras-reais-custo-entry.tsx');
const PREVIEW_DIR = process.env.SARAK_PREVIA_CUSTO_DIR;
const RUNS = Number(process.env.SARAK_CUSTO_RODADAS ?? 3);

/** Os grupos com protótipo, na ordem da tabela: a decisão a que pertencem e o que a amostra de hoje desenha. */
const GROUPS = [
    { id: 'themes', decision: 'Tema', label: 'Miniatura de tema (25 temas)', lote: 2 },
    { id: 'cards', decision: 'Forma', label: 'Cards', lote: 2 },
    { id: 'shadow', decision: 'Forma', label: 'Sombra', lote: 2 },
    { id: 'corners', decision: 'Forma', label: 'Cantos', lote: 2 },
    { id: 'cardTextures', decision: 'Forma', label: 'Textura do card', lote: 2 },
    { id: 'textures', decision: 'Forma', label: 'Textura do fundo', lote: 2 },
    { id: 'tables', decision: 'Componentes', label: 'Tabela', lote: 3 },
    { id: 'charts', decision: 'Componentes', label: 'Gráfico', lote: 3 },
    { id: 'notice', decision: 'Componentes', label: 'Aviso', lote: 3 },
    { id: 'badge', decision: 'Componentes', label: 'Selo e progresso', lote: 3 },
    { id: 'emptyState', decision: 'Componentes', label: 'Estado vazio', lote: 3 },
] as const;
/**
 * As variantes de cada lote. Lote 2 (Tema e Forma, já no produto): `atual` é o catálogo de produção (na miniatura de tema, a tela "Painel" inteira) e, na miniatura de tema, `hoje` é a
 * cópia congelada de antes da plan-166 (medida na mesma rodada) e a tela "Painel" inteira é a `atual` (decisão M do dono: a tela inteira, dentro do teto de 2×). Lote 3 (Componentes, ainda não no produto): `hoje` é o catálogo e
 * `prototipo` o protótipo do lote 1.
 */
const variantsOf = (group: { id: string; lote: number }): readonly string[] => (group.lote === 3 ? ['hoje', 'prototipo'] : group.id === 'themes' ? ['hoje', 'atual'] : ['atual']);
/** O teto, em vezes o custo de hoje, para abrir cada grupo (decisão do dono, plan-166 §10). */
const OPEN_CEILING = 2;
/** O teto do Tema: a tela inteira custa cerca de 1 s a mais para abrir, e só o administrador abre o painel (decisão M2 do dono). */
const THEME_OPEN_CEILING = 2.5;
/**
 * O tempo de abrir de hoje dos grupos do lote 2 que NÃO têm cópia congelada, medido no lote 1 (2026-11-18, mesma bancada, 3 rodadas):
 * escuro e claro, em ms. A miniatura de tema compara na mesma rodada com a cópia congelada.
 */
const BASELINE_OPEN_MS: Record<string, { escuro: number; claro: number }> = {
    cards: { escuro: 350, claro: 319 }, shadow: { escuro: 295, claro: 222 }, corners: { escuro: 346, claro: 242 },
    cardTextures: { escuro: 344, claro: 381 }, textures: { escuro: 282, claro: 258 },
};
const MODES = [{ name: 'escuro', query: '' }, { name: 'claro', query: '&claro=1' }] as const;

interface Cost { openMs: number; heapMb: number; nodes: number; tiles: number; drawn: number; switchRecalcs: number; switchMs: number; errors: string[] }
interface Row { group: string; decision: string; label: string; variant: string; mode: string; cost: Cost | null; note?: string }

const rows: Row[] = [];
const captures: Array<{ file: string; group: string; label: string; variant: string; mode: string }> = [];
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
    // Uma rodada parcial (`-g`) substitui só os grupos que mediu e mantém o resto do arquivo.
    const file = path.join(PREVIEW_DIR, 'medidas.json');
    const previous = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) as { rows: Row[]; captures: typeof captures } : { rows: [], captures: [] };
    const touched = new Set([...rows.map((row) => row.group), ...captures.map((item) => item.group)]);
    const merged = { rodadas: RUNS, tema: Object.keys(themeReport).length ? themeReport : (previous as { tema?: unknown }).tema, rows: [...previous.rows.filter((row) => !touched.has(row.group)), ...rows], captures: [...previous.captures.filter((item) => !touched.has(item.group)), ...captures] };
    fs.writeFileSync(file, JSON.stringify(merged, null, 2), 'utf8');
});

const median = (values: number[]): number => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];
const url = (group: string, variant: string, query: string, capture = false): string => `${harnessUrl}?grupo=${group}&variante=${variant}${query}${capture ? '&captura=1' : ''}`;

const openAndWaitFirstTile = (page: Page): Promise<number> => page.evaluate(() => new Promise<number>((resolve) => {
    const started = performance.now();
    document.querySelector<HTMLButtonElement>('[data-testid="abrir"]')?.click();
    const poll = (): void => {
        if (document.querySelector('[data-testid="bancada"] [data-option-tile] [data-sx-lazy="shown"] > *')) requestAnimationFrame(() => requestAnimationFrame(() => resolve(performance.now() - started)));
        else requestAnimationFrame(poll);
    };
    poll();
}));

/** Rola a coluna até o fim, para toda opção entrar na área visível e desenhar. */
const drawEverything = async (page: Page): Promise<void> => {
    await page.evaluate(async () => {
        const scroller = document.querySelector('[data-testid="bancada"]') as HTMLElement;
        for (let top = 0; top <= scroller.scrollHeight; top += scroller.clientHeight / 2) { scroller.scrollTop = top; await new Promise((resolve) => setTimeout(resolve, 90)); }
        scroller.scrollTop = 0;
    });
    await page.waitForTimeout(900);
};

/** Os contadores do navegador numa sessão que já está ligada: uma sessão nova recomeça do zero, e a diferença some. */
const metricsOf = async (session: CDPSession, names: string[]): Promise<Record<string, number>> => {
    const { metrics } = await session.send('Performance.getMetrics');
    return Object.fromEntries(names.map((name) => [name, metrics.find((metric) => metric.name === name)?.value ?? 0]));
};

const measureOnce = async (group: string, variant: string, query: string): Promise<Cost> => {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message.slice(0, 160)));
    page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text().slice(0, 160)); });
    await page.goto(url(group, variant, query));
    await page.locator('[data-testid="abrir"]').waitFor();
    await page.waitForTimeout(500);
    const session = await page.context().newCDPSession(page);
    await session.send('Performance.enable');
    const openMs = await openAndWaitFirstTile(page);
    await drawEverything(page);
    await session.send('HeapProfiler.enable');
    await session.send('HeapProfiler.collectGarbage');
    const heap = (await session.send('Performance.getMetrics')).metrics.find((metric) => metric.name === 'JSHeapUsedSize')?.value ?? 0;
    const counts = await page.evaluate(() => ({ nodes: document.querySelectorAll('*').length, tiles: document.querySelectorAll('[data-option-tile]').length, drawn: document.querySelectorAll('[data-option-tile] [data-sx-lazy="shown"]').length }));
    const names = ['RecalcStyleCount', 'RecalcStyleDuration', 'LayoutDuration', 'ScriptDuration'];
    const before = await metricsOf(session, names);
    await page.locator('[data-testid="trocar-modo"]').click();
    await page.waitForTimeout(1800);
    const after = await metricsOf(session, names);
    await page.close();
    const switchMs = ((after.RecalcStyleDuration - before.RecalcStyleDuration) + (after.LayoutDuration - before.LayoutDuration) + (after.ScriptDuration - before.ScriptDuration)) * 1000;
    return { openMs, heapMb: heap / 1048576, nodes: counts.nodes, tiles: counts.tiles, drawn: counts.drawn, switchRecalcs: after.RecalcStyleCount - before.RecalcStyleCount, switchMs, errors: [...new Set(errors)].slice(0, 3) };
};

const hasPrototype = async (group: string): Promise<boolean> => {
    const page = await browser.newPage();
    await page.goto(url(group, 'prototipo', ''));
    const effective = await page.locator('[data-testid="variante-efetiva"]').textContent();
    await page.close();
    return effective === 'prototipo';
};

test.describe('custo de abrir cada grupo: hoje × protótipo', () => {
    for (const group of GROUPS) {
        for (const variant of group.id === 'themes' ? [] : variantsOf(group)) {
            for (const mode of MODES) {
                test(`${group.label} · ${variant} · ${mode.name}`, async () => {
                    test.setTimeout(300_000);
                    test.skip(variant === 'prototipo' && !(await hasPrototype(group.id)), 'sem protótipo: o componente real não cabe na miniatura');
                    const runs: Cost[] = [];
                    for (let run = 0; run < RUNS; run += 1) runs.push(await measureOnce(group.id, variant, mode.query));
                    const cost: Cost = {
                        openMs: Math.round(median(runs.map((item) => item.openMs))), heapMb: Number(median(runs.map((item) => item.heapMb)).toFixed(1)), nodes: median(runs.map((item) => item.nodes)),
                        tiles: runs[0].tiles, drawn: runs[0].drawn, switchRecalcs: median(runs.map((item) => item.switchRecalcs)), switchMs: Math.round(median(runs.map((item) => item.switchMs))), errors: runs[0].errors,
                    };
                    rows.push({ group: group.id, decision: group.decision, label: group.label, variant, mode: mode.name, cost });
                    console.log(`[plan-166] ${group.id} ${variant} ${mode.name} ${JSON.stringify(cost)}`);
                    expect(cost.tiles, 'há opções na coluna').toBeGreaterThan(0);
                    expect(cost.drawn, 'toda opção desenhou').toBe(cost.tiles);
                    const baseline = BASELINE_OPEN_MS[group.id]?.[mode.name];
                    if (variant === 'atual' && baseline) expect(cost.openMs, `abrir ${group.label} custa no máximo ${OPEN_CEILING}× o de hoje (${baseline} ms)`).toBeLessThanOrEqual(baseline * OPEN_CEILING);
                });
            }
        }
    }
});

/** As rodadas alternadas da miniatura de tema: em cada uma, hoje e a tela inteira (o produto), nessa ordem, cada um numa página nova. */
const THEME_ROUNDS = Number(process.env.SARAK_CUSTO_RODADAS_TEMA ?? 5);
const THEME_VARIANTS = ['hoje', 'atual'] as const;
const THEME_LABEL: Record<string, string> = { hoje: 'Hoje', atual: 'Tela inteira' };
const themeReport: Record<string, { rounds: Array<Record<string, Cost>>; ratio: Record<string, number>; ratios: Record<string, number[]>; nodes: Record<string, number> }> = {};

test.describe('a miniatura de tema: a tela inteira, rodadas alternadas, contra o de hoje na mesma rodada', () => {
    for (const mode of MODES) {
        test(`${THEME_ROUNDS} rodadas alternadas (${mode.name})`, async () => {
            test.setTimeout(900_000);
            const rounds: Array<Record<string, Cost>> = [];
            for (let round = 0; round < THEME_ROUNDS; round += 1) {
                const entry: Record<string, Cost> = {};
                for (const variant of THEME_VARIANTS) entry[variant] = await measureOnce('themes', variant, mode.query);
                rounds.push(entry);
            }
            const ratios: Record<string, number[]> = {};
            for (const variant of ['atual']) ratios[variant] = rounds.map((entry) => entry[variant].openMs / entry.hoje.openMs);
            const ratio = Object.fromEntries(Object.entries(ratios).map(([variant, list]) => [variant, Number(median(list).toFixed(2))]));
            const nodes = Object.fromEntries(THEME_VARIANTS.map((variant) => [variant, median(rounds.map((entry) => entry[variant].nodes))]));
            themeReport[mode.name] = { rounds, ratio, ratios, nodes };
            for (const variant of THEME_VARIANTS) {
                const list = rounds.map((entry) => entry[variant]);
                rows.push({ group: 'themes', decision: 'Tema', label: 'Miniatura de tema (25 temas)', variant, mode: mode.name, cost: {
                    openMs: Math.round(median(list.map((item) => item.openMs))), heapMb: Number(median(list.map((item) => item.heapMb)).toFixed(1)), nodes: median(list.map((item) => item.nodes)),
                    tiles: list[0].tiles, drawn: list[0].drawn, switchRecalcs: median(list.map((item) => item.switchRecalcs)), switchMs: Math.round(median(list.map((item) => item.switchMs))), errors: list[0].errors,
                } });
            }
            console.log(`[plan-166] Tema ${mode.name}: razão da tela inteira (mediana de ${THEME_ROUNDS}) ${ratio.atual}× [${ratios.atual.map((value) => value.toFixed(2)).join(', ')}]; nós ${JSON.stringify(nodes)}`);
            expect(rounds.every((entry) => THEME_VARIANTS.every((variant) => entry[variant].drawn === entry[variant].tiles)), 'toda miniatura desenhou').toBe(true);
            // O produto é a tela inteira: o teto de 2,5× vale para ela, pela mediana das razões das rodadas alternadas.
            expect(ratio.atual, `abrir o Tema com a tela inteira contra hoje, mediana das razões de ${THEME_ROUNDS} rodadas`).toBeLessThanOrEqual(THEME_OPEN_CEILING);
        });
    }
});

test.describe('capturas lado a lado', () => {
    test('cada grupo, hoje × protótipo, nos dois modos', async () => {
        test.setTimeout(600_000);
        const dir = PREVIEW_DIR ?? '';
        if (dir) fs.mkdirSync(dir, { recursive: true });
        for (const group of GROUPS.filter((item) => !process.env.SARAK_CUSTO_GRUPO || item.id === process.env.SARAK_CUSTO_GRUPO)) {
            const prototyped = await hasPrototype(group.id);
            for (const variant of group.id === 'themes' ? THEME_VARIANTS : variantsOf(group)) {
                if (variant === 'prototipo' && !prototyped) continue;
                for (const mode of MODES) {
                    const page = await browser.newPage({ viewport: { width: 1440, height: 3200 } });
                    await page.goto(url(group.id, variant, mode.query, true));
                    await page.locator('[data-testid="abrir"]').click();
                    await page.locator('[data-testid="bancada"] [data-option-tile]').first().waitFor();
                    await page.waitForFunction(() => {
                        const tiles = document.querySelectorAll('[data-option-tile]').length;
                        return tiles > 0 && document.querySelectorAll('[data-option-tile] [data-sx-lazy="shown"]').length === tiles;
                    }, undefined, { timeout: 30_000 }).catch(() => undefined);
                    await page.waitForTimeout(1500);
                    const file = `${group.id}-${variant}-${mode.name}.png`;
                    if (dir) await page.locator('[data-testid="bancada"]').screenshot({ path: path.join(dir, file) });
                    captures.push({ file, group: group.id, label: group.label, variant, mode: mode.name });
                    await page.close();
                }
            }
            if (!prototyped && group.lote === 3) rows.push({ group: group.id, decision: group.decision, label: group.label, variant: 'prototipo', mode: '-', cost: null, note: 'sem protótipo' });
        }
        expect(captures.length).toBeGreaterThan(0);
    });
});
