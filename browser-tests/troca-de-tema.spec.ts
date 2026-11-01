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

/** Medido em 2026-10-31 com a galeria aberta, 6 trocas nos dois modos: de 25 a 29 recálculos; teto = maior medida + 20%. */
const RECALC_STYLE_COUNT_BUDGET = 35;
/** Medido nas mesmas 6 trocas: de 221 a 227 transições (o resto da tela mudando de estado); teto = maior + 20%. Sem a marca: perto de 1.900. */
const TRANSITION_RUNS_BUDGET = 273;

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

            await page.getByRole('button', { name: THEME_CARD }).click();
            await expect.poll(() => page.evaluate(() => window.__switchRecords.map((record) => record.phase)), { timeout: 60_000 })
                .toEqual(['on', 'off']);
            await settle(page, cdp);

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

            await page.evaluate(() => { window.__transitionRuns = 0; });
            await page.locator('[data-probe="botao-de-prova"]').hover();
            await expect.poll(() => page.evaluate(() => window.__transitionRuns), { message: 'o hover anima como antes' }).toBeGreaterThan(0);

            expect(pageErrors).toEqual([]);
            await page.close();
        });
    });
}
