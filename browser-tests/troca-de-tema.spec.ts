/**
 * Troca de tema sem transição: escolher um tema na galeria do painel reescreve centenas de variáveis, e cada
 * elemento com `transition` recalculava o estilo a cada quadro enquanto a transição durava (9 a 14 s no ERP). O
 * `DesignInjector` e o `SarakDesignScope` marcam a raiz do escopo (`data-sarak-theme-switching`) e `_motion.css`
 * zera a transição sob ela; a marca sai dois quadros depois.
 *
 * O que se afirma é CONTAGEM e estado computado, nunca milissegundos: o tempo varia por máquina e por carga, a
 * contagem não. Três famílias de caso, nos dois modos de injeção (App e Embarcado, este com a folha escopada):
 *   1. Durante a marca, a transição computada de um botão é `none` — lida no instante em que a marca entra, pelo
 *      MutationObserver, depois de as variáveis novas já estarem escritas (prova a ORDEM: marca antes da pintura).
 *   2. Depois da troca a transição computada volta ao valor do tema, e o hover volta a animar.
 *   3. Orçamento: as transições iniciadas e os recálculos de estilo durante a troca ficam abaixo de um teto. Sem a
 *      marca a mesma troca inicia perto de 1.900 transições (medido em 2026-10-31).
 *
 * -------------------------------------------------------------------------
 * LIMITES DECLARADOS (R18) — o que esta medição NÃO vê
 * -------------------------------------------------------------------------
 * 1. Só Chromium headless, uma troca (Sarak Sovereign → Cyberpunk Neon) com a galeria de temas aberta; não mede
 *    outro par de temas nem o ERP real.
 * 2. Não afirma tempo. A meta de 300 ms (1,5 s com CPU 4× mais lenta) é conferida na tabela do resumo da plan, por
 *    medição manual com `Performance.getMetrics`, e não é um teste: varia por máquina.
 * 3. Os tetos são o valor medido + 20%; uma máquina que renderize mais quadros durante a troca pode passar do teto
 *    de recálculos sem regressão. O teto de transições é o que separa a regressão (perto de 1.900) do normal.
 * 4. Não cobre o arrastar de um slider (a marca não entra); isso é teste de unidade do `DesignInjector`.
 *    O caso do mouse conta os elementos que cada recálculo de estilo visitou (`UpdateLayoutTree.elementCount`, do
 *    Tracing do CDP): mede o alcance do recálculo, não o tempo, e só vê o `mousemove` com a luz dinâmica desligada.
 * 5. Lê `src/` pelo esbuild do harness e o CSS de `dist/` — sem `npm run build` recente, mede a folha anterior.
 * -------------------------------------------------------------------------
 */
import { test, expect, chromium, type Browser, type CDPSession, type Page } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { buildHarness } from './build-harness.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ENTRY = path.join(HERE, 'fixtures', 'troca-de-tema-entry.tsx');
const THEME_CARD = /Cyberpunk Neon/;

/** Medido em 2026-11-01 com a galeria aberta, 8 trocas nos dois modos: de 23 a 27 recálculos; teto = maior medida + 20%. */
const RECALC_STYLE_COUNT_BUDGET = 32;
/** Medido nas mesmas 8 trocas: de 139 a 145 transições (o resto da tela mudando de estado); teto = maior + 20%. Sem a marca: perto de 1.900. */
const TRANSITION_RUNS_BUDGET = 174;

/** Medido: mover o mouse na galeria visita no máximo 470 de 2.055 elementos (23%, o hover de um cartão); a escrita de `--mouse-x/y` no `:root` visitava 2.124 (a tela inteira). O teto fica no meio. */
const WHOLE_TREE_SHARE = 0.5;

/** Medido em 2026-11-01: 2 recálculos visitam 50% ou mais da tela na troca (a troca e a retirada da marca). */
const WHOLE_TREE_RECALC_BUDGET = 2;

const MODES = [
    { name: 'app', query: '' },
    { name: 'embarcado', query: '?modo=embarcado&css=escopado' },
] as const;

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

interface SwitchRecord {
    phase: 'on' | 'off';
    transitionProperty: string;
    transitionDuration: string;
}

declare global {
    interface Window {
        __switchRecords: SwitchRecord[];
        __transitionRuns: number;
    }
}

const recalcStyleCount = async (cdp: CDPSession): Promise<number> => {
    const { metrics } = await cdp.send('Performance.getMetrics');
    return metrics.find((metric) => metric.name === 'RecalcStyleCount')?.value ?? 0;
};

/** Quantos elementos cada recálculo de estilo visitou enquanto `action` rodava, e o total de elementos da tela. */
const styleRecalcSizes = async (page: Page, cdp: CDPSession, action: () => Promise<void>): Promise<{ sizes: number[]; total: number }> => {
    const events: Array<{ name: string; args?: { elementCount?: number } }> = [];
    cdp.on('Tracing.dataCollected', (chunk) => events.push(...(chunk.value as typeof events)));
    const complete = new Promise<void>((resolve) => cdp.once('Tracing.tracingComplete', () => resolve()));
    await cdp.send('Tracing.start', { categories: 'devtools.timeline', transferMode: 'ReportEvents' });
    await action();
    await cdp.send('Tracing.end');
    await complete;
    const sizes = events.filter((event) => event.name === 'UpdateLayoutTree').map((event) => event.args?.elementCount ?? 0);
    return { sizes, total: await page.evaluate(() => document.querySelectorAll('*').length) };
};

/** Espera a tela assentar: nenhum recálculo novo por meio segundo. */
const settle = async (page: Page, cdp: CDPSession): Promise<void> => {
    let previous = -1;
    for (let attempt = 0; attempt < 40; attempt += 1) {
        const current = await recalcStyleCount(cdp);
        if (current === previous) return;
        previous = current;
        await page.waitForTimeout(500);
    }
};

/** Anota o estilo computado do botão de prova no instante em que a marca entra e no instante em que sai. */
const watchSwitchMark = (page: Page): Promise<void> => page.evaluate(() => {
    window.__switchRecords = [];
    const probe = document.querySelector<HTMLElement>('[data-probe="botao-de-prova"]');
    if (!probe) throw new Error('botão de prova ausente');
    // A raiz do escopo (o `:root` ou a ilha); o escopo da prévia do painel (`.sarak-design-scope`) leva a marca dele, antes.
    const isMarked = (): boolean => document.querySelector('[data-sarak-theme-switching="true"]:not(.sarak-design-scope)') !== null;
    let marked = false;
    const record = (): void => {
        const nowMarked = isMarked();
        if (nowMarked === marked) return;
        marked = nowMarked;
        const style = getComputedStyle(probe);
        window.__switchRecords.push({
            phase: nowMarked ? 'on' : 'off',
            transitionProperty: style.transitionProperty,
            transitionDuration: style.transitionDuration,
        });
    };
    new MutationObserver(record).observe(document, { subtree: true, attributes: true, attributeFilter: ['data-sarak-theme-switching'] });
});

const probeTransition = (page: Page): Promise<{ property: string; duration: string }> =>
    page.locator('[data-probe="botao-de-prova"]').evaluate((element) => {
        const style = getComputedStyle(element);
        return { property: style.transitionProperty, duration: style.transitionDuration };
    });

for (const mode of MODES) {
    test.describe(`modo ${mode.name}`, () => {
        test('mover o mouse não recalcula o estilo da tela inteira', async () => {
            const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
            await page.goto(`${harnessUrl}${mode.query}`);
            await page.getByRole('button', { name: 'Abrir galeria' }).click();
            await expect(page.getByRole('heading', { name: 'Galeria de estilos' })).toBeVisible();
            const cdp = await page.context().newCDPSession(page);
            await cdp.send('Performance.enable');
            await settle(page, cdp);

            const { sizes, total } = await styleRecalcSizes(page, cdp, async () => {
                for (let step = 0; step < 20; step += 1) {
                    await page.mouse.move(200 + step * 40, 150 + step * 20);
                    await page.waitForTimeout(30);
                }
                await page.waitForTimeout(300);
            });
            const widest = Math.max(0, ...sizes);
            test.info().annotations.push({ type: 'medido', description: `maior recálculo: ${widest} de ${total} elementos` });
            expect(widest, 'elementos visitados pelo maior recálculo ao mover o mouse').toBeLessThan(total * WHOLE_TREE_SHARE);
            await page.close();
        });

        test('escolher um tema desliga a transição durante a troca, devolve-a depois e fica no orçamento', async () => {
            const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
            const pageErrors: string[] = [];
            page.on('pageerror', (error) => pageErrors.push(error.message));
            await page.goto(`${harnessUrl}${mode.query}`);
            await page.getByRole('button', { name: 'Abrir galeria' }).click();
            await expect(page.getByRole('heading', { name: 'Galeria de estilos' })).toBeVisible();

            const cdp = await page.context().newCDPSession(page);
            await cdp.send('Performance.enable');
            await settle(page, cdp);

            const beforeSwitch = await probeTransition(page);
            expect(beforeSwitch.property, 'o botão de prova tem de animar fora da troca').not.toBe('none');
            expect(beforeSwitch.duration).not.toBe('0s');

            await watchSwitchMark(page);
            await page.evaluate(() => { window.__transitionRuns = 0; });
            const recalcsBefore = await recalcStyleCount(cdp);

            const { sizes, total } = await styleRecalcSizes(page, cdp, async () => {
                await page.getByRole('button', { name: THEME_CARD }).click();
                await expect.poll(() => page.evaluate(() => window.__switchRecords.map((record) => record.phase)), { timeout: 60_000 })
                    .toEqual(['on', 'off']);
                await settle(page, cdp);
            });

            // 1. Na entrada da marca as variáveis novas já estavam escritas e a transição já estava desligada.
            const [during, after] = await page.evaluate(() => window.__switchRecords);
            expect(during.transitionProperty, 'durante a troca a transição computada é none').toBe('none');
            expect(during.transitionDuration).toBe('0s');

            // 2. Depois da marca a transição volta ao valor do tema novo (a duração rápida é do tema, por isso difere da de
            //    antes), e o hover volta a animar.
            const settled = await probeTransition(page);
            expect(settled.property).toBe(beforeSwitch.property);
            expect(settled.duration, 'a duração do tema novo, não a da marca').not.toBe('0s');
            expect({ property: after.transitionProperty, duration: after.transitionDuration }).toEqual(settled);

            // 3. Orçamento: contagem, não tempo.
            const transitionRuns = await page.evaluate(() => window.__transitionRuns);
            const recalcs = (await recalcStyleCount(cdp)) - recalcsBefore;
            test.info().annotations.push({ type: 'medido', description: `${transitionRuns} transições, ${recalcs} recálculos de estilo` });
            expect(transitionRuns, 'transições iniciadas na troca').toBeLessThanOrEqual(TRANSITION_RUNS_BUDGET);
            expect(recalcs, 'recálculos de estilo na troca').toBeLessThanOrEqual(RECALC_STYLE_COUNT_BUDGET);
            // A troca e a retirada da marca são os dois recálculos da tela inteira esperados; um terceiro é regressão.
            const wholeTree = sizes.filter((size) => size >= total * WHOLE_TREE_SHARE).length;
            test.info().annotations.push({ type: 'medido', description: `${wholeTree} recálculos da tela inteira` });
            expect(wholeTree, 'recálculos da tela inteira na troca').toBeLessThanOrEqual(WHOLE_TREE_RECALC_BUDGET);

            await page.evaluate(() => { window.__transitionRuns = 0; });
            await page.locator('[data-probe="botao-de-prova"]').hover();
            await expect.poll(() => page.evaluate(() => window.__transitionRuns), { message: 'o hover anima como antes' }).toBeGreaterThan(0);

            expect(pageErrors).toEqual([]);
            await page.close();
        });
    });
}
