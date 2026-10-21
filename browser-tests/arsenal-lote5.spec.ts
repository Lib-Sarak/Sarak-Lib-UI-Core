/**
 * Medição, em navegador real, dos achados do lote 5 do arsenal: a saída do modal e da paleta de busca
 * (`motionEaseIn`), a largura da lateral recolhida (`sidebarCollapsedWidth`), o raio 0 do acordeão
 * (`borderRadius`), o espaço dos sub-itens da matriz (`matrixGap`) e o aviso de `ref` da linha da tabela.
 *
 * Mesmo harness e mesmo artefato do `token-que-desenha.spec.ts` (`dist/index.js` + `dist/sarak.css`). Cenas e
 * recortes novos em `fixtures/harness-entry.tsx` (`?cena=saida-sobreposicao`, `?tema=saida-*`, `lateral-*`…).
 *
 * -------------------------------------------------------------------------
 * LIMITES DECLARADOS (R18) — o que esta medição NÃO vê
 * -------------------------------------------------------------------------
 * 1. A presença do painel durante a saída é amostrada por `requestAnimationFrame`; a curva de opacidade é medida
 *    com Web Animations API em três instantes fixos. Lê `opacity` computado, não o pixel, e distingue as duas curvas
 *    preparadas (a de fábrica e uma que parte rápido), sem reconstruí-las.
 * 2. O aviso de `ref` só existe no React de desenvolvimento; o harness empacota o React sem minificar, então
 *    ele aparece. Num React de produção este caso passaria sem provar nada.
 * 3. Só Chromium headless. Lê o `dist/` — sem `npm run build` recente, mede o build anterior.
 * 4. `contentAlignment` e `searchPositionTopbar: center` NÃO estão aqui: o lote os deixou para decisão.
 * -------------------------------------------------------------------------
 */
import { test, expect, chromium, type Browser, type Page } from '@playwright/test';

const DESKTOP = { width: 1280, height: 900 } as const;
/** Instante, em ms depois do clique, em que a saída de 500 ms está no meio. */
const SAMPLE_AT_MS = 250;
const EXIT_CURVE_SAMPLE_TIMES_MS = [125, 250, 375] as const;
const OBSERVE_MS = 900;

const harnessUrl = process.env.SARAK_CROMO_HARNESS_URL;
if (!harnessUrl) {
    throw new Error('O globalSetup não preparou o harness de CSS para esta execução do Playwright.');
}

let browser: Browser;

test.beforeAll(async () => {
    browser = await chromium.launch();
});

test.afterAll(async () => {
    await browser.close();
});

interface SceneOptions { theme?: string; scene?: string; target?: string }

async function withScene<T>(options: SceneOptions, measure: (page: Page) => Promise<T>): Promise<T> {
    const page = await browser.newPage({ viewport: DESKTOP });
    try {
        const searchParams = new URLSearchParams();
        if (options.scene) searchParams.set('cena', options.scene);
        if (options.theme) searchParams.set('tema', options.theme);
        if (options.target) searchParams.set('alvo', options.target);
        await page.goto(`${harnessUrl}?${searchParams.toString()}`);
        await page.waitForFunction(() => document.body.hasAttribute('data-sx-texture'));
        // As transições da hidratação (fundo, cor, entrada) terminam antes de medir o hover e o pressionado: com a espera fixa depois do
        // ponteiro, medir no meio delas lê o fundo ainda transparente.
        await page.evaluate(() => Promise.all(document.getAnimations().filter((animation) => animation instanceof CSSTransition).map((animation) => animation.finished.catch(() => undefined))));
        return await measure(page);
    } finally {
        await page.close();
    }
}

interface ExitSample { t: number; present: boolean; opacity: number; pointerEvents: string }

/** Clica em `closeProbe` e anota, a cada quadro, se o painel ainda está na página e com que opacidade. */
async function recordExit(page: Page, closeProbe: string, panelFinder: string): Promise<ExitSample[]> {
    // A entrada (mola) ainda corre logo após o carregamento: fechar antes de a opacidade chegar a 1 mediria a entrada.
    await page.waitForFunction((finder) => {
        const panel = (new Function(`return (${finder})();`) as () => HTMLElement | null)();
        return panel !== null && getComputedStyle(panel).opacity === '1';
    }, panelFinder);
    return page.evaluate(({ closeProbe: probe, panelFinder: finder, observe }) => new Promise<ExitSample[]>((resolve) => {
        const findPanel = new Function(`return (${finder})();`) as () => HTMLElement | null;
        const frame = (): HTMLElement | null => findPanel()?.closest<HTMLElement>('.fixed.inset-0') ?? null;
        const samples: ExitSample[] = [];
        const start = performance.now();
        (document.querySelector(`[data-probe="${probe}"]`) as HTMLElement).click();
        const tick = (): void => {
            const panel = findPanel();
            samples.push({
                t: performance.now() - start,
                present: panel !== null,
                opacity: panel ? Number(getComputedStyle(panel).opacity) : 0,
                pointerEvents: frame() ? getComputedStyle(frame() as HTMLElement).pointerEvents : '',
            });
            if (performance.now() - start < observe) requestAnimationFrame(tick);
            else resolve(samples);
        };
        requestAnimationFrame(tick);
    }), { closeProbe, panelFinder, observe: OBSERVE_MS });
}

const MODAL_PANEL = `() => document.querySelector('[role="dialog"]')`;
const SEARCH_PANEL = `() => document.querySelector('input[type="search"]')?.closest('.overflow-hidden') ?? null`;

const nearest = (samples: ExitSample[], at: number): ExitSample =>
    samples.reduce((best, sample) => (Math.abs(sample.t - at) < Math.abs(best.t - at) ? sample : best));

interface ExitCurveSample { time: number; opacity: number }

async function waitForFullyVisiblePanel(page: Page, panelFinder: string): Promise<void> {
    await page.waitForFunction((finder) => {
        const panel = (new Function(`return (${finder})();`) as () => HTMLElement | null)();
        return panel !== null && getComputedStyle(panel).opacity === '1';
    }, panelFinder, { timeout: 5000 });
}

async function closePanelByProbe(page: Page, closeProbe: string): Promise<void> {
    await page.evaluate((probe) => {
        const closeControl = document.querySelector(`[data-probe="${probe}"]`);
        if (!(closeControl instanceof HTMLElement)) throw new Error(`Controle de fechamento ausente: ${probe}`);
        closeControl.click();
    }, closeProbe);
}

async function waitForPanelOpacityAnimation(page: Page, panelFinder: string): Promise<void> {
    await page.waitForFunction((finder) => {
        const panel = (new Function(`return (${finder})();`) as () => HTMLElement | null)();
        if (!panel) return false;
        return document.getAnimations().some((animation) => {
            const effect = animation.effect;
            return effect instanceof KeyframeEffect
                && effect.target === panel
                && animation.playState === 'running'
                && effect.getKeyframes().some((keyframe) => keyframe.opacity !== undefined);
        });
    }, panelFinder, { timeout: 5000 });
}

async function samplePanelOpacityAtFixedTimes(page: Page, panelFinder: string): Promise<ExitCurveSample[]> {
    return page.evaluate(({ finder, sampleTimes }) => {
        const panel = (new Function(`return (${finder})();`) as () => HTMLElement | null)();
        if (!panel) throw new Error('O painel saiu antes de medir a curva de saída.');
        const animation = document.getAnimations().find((candidate) => {
            const effect = candidate.effect;
            return effect instanceof KeyframeEffect
                && effect.target === panel
                && candidate.playState === 'running'
                && effect.getKeyframes().some((keyframe) => keyframe.opacity !== undefined);
        });
        if (!animation) throw new Error('A API Web Animations não encontrou a animação de opacidade do painel.');

        animation.pause();
        return sampleTimes.map((time) => {
            animation.currentTime = time;
            return { time, opacity: Number(getComputedStyle(panel).opacity) };
        });
    }, { finder: panelFinder, sampleTimes: [...EXIT_CURVE_SAMPLE_TIMES_MS] });
}

async function recordExitCurveAtFixedTimes(
    page: Page,
    closeProbe: string,
    panelFinder: string,
): Promise<ExitCurveSample[]> {
    await waitForFullyVisiblePanel(page, panelFinder);
    await closePanelByProbe(page, closeProbe);
    await waitForPanelOpacityAnimation(page, panelFinder);
    return samplePanelOpacityAtFixedTimes(page, panelFinder);
}

const fixedOpacityAt = (samples: ExitCurveSample[], time: number): number => {
    const sample = samples.find((candidate) => candidate.time === time);
    if (!sample) throw new Error(`Não há amostra fixa para ${time} ms.`);
    return sample.opacity;
};

const OVERLAYS = [
    { name: 'modal', target: 'modal', close: 'fechar-modal', panel: MODAL_PANEL },
    { name: 'paleta de busca', target: 'busca', close: 'fechar-busca', panel: SEARCH_PANEL },
] as const;

for (const overlay of OVERLAYS) {
    test(`P14: ${overlay.name} — fechar não remove o painel no mesmo quadro, e ele sai ao fim da saída`, async () => {
        await withScene({ scene: 'saida-sobreposicao', target: overlay.target, theme: 'saida-curva-lenta' }, async (page) => {
            const samples = await recordExit(page, overlay.close, overlay.panel);
            expect(samples[0].present).toBe(true);
            expect(nearest(samples, SAMPLE_AT_MS).present).toBe(true);
            expect(samples[samples.length - 1].present).toBe(false);
        });
    });

    test(`P14: ${overlay.name} — motionEaseIn muda a opacidade no meio da saída (de fábrica × curva que parte rápido)`, async () => {
        const slow = await withScene({ scene: 'saida-sobreposicao', target: overlay.target, theme: 'saida-curva-lenta' }, (page) => recordExitCurveAtFixedTimes(page, overlay.close, overlay.panel));
        const fast = await withScene({ scene: 'saida-sobreposicao', target: overlay.target, theme: 'saida-curva-rapida' }, (page) => recordExitCurveAtFixedTimes(page, overlay.close, overlay.panel));
        const slowMid = fixedOpacityAt(slow, SAMPLE_AT_MS);
        const fastMid = fixedOpacityAt(fast, SAMPLE_AT_MS);
        expect(slowMid).toBeGreaterThan(0.5);
        expect(fastMid).toBeLessThan(0.3);
        expect(slowMid - fastMid).toBeGreaterThan(0.3);
        expect(slow.map((sample) => sample.time)).toEqual(EXIT_CURVE_SAMPLE_TIMES_MS);
        expect(fast.map((sample) => sample.time)).toEqual(EXIT_CURVE_SAMPLE_TIMES_MS);
    });

    test(`P14: ${overlay.name} — na saída o painel não segura o ponteiro; sob movimento reduzido sai de uma vez`, async () => {
        await withScene({ scene: 'saida-sobreposicao', target: overlay.target, theme: 'saida-curva-lenta' }, async (page) => {
            const samples = await recordExit(page, overlay.close, overlay.panel);
            expect(nearest(samples, SAMPLE_AT_MS).pointerEvents).toBe('none');
        });
        await withScene({ scene: 'saida-sobreposicao', target: overlay.target, theme: 'saida-reduzida' }, async (page) => {
            const samples = await recordExit(page, overlay.close, overlay.panel);
            expect(nearest(samples, SAMPLE_AT_MS).present).toBe(false);
        });
    });
}

const collapsedAsideWidth = (page: Page): Promise<{ width: number; minWidth: string }> =>
    page.locator('aside').first().evaluate((aside) => {
        const computed = getComputedStyle(aside);
        return { width: aside.getBoundingClientRect().width, minWidth: computed.minWidth };
    });

test('P17: a lateral recolhida mede sidebarCollapsedWidth, sem o piso da largura aberta', async () => {
    await withScene({ theme: 'lateral-recolhida' }, async (page) => {
        const standard = await collapsedAsideWidth(page);
        expect(standard.minWidth).toBe('0px');
        expect(standard.width).toBe(74);
    });
    await withScene({ theme: 'lateral-recolhida-larga' }, async (page) => {
        expect((await collapsedAsideWidth(page)).width).toBe(96);
    });
});

test('P17: aberta, a lateral continua com o piso de sidebarMinWidth', async () => {
    await withScene({}, async (page) => {
        const open = await collapsedAsideWidth(page);
        expect(open.width).toBeGreaterThanOrEqual(200);
        expect(open.minWidth).not.toBe('0px');
    });
});

test('P18: borderRadius 0 deixa os cantos do acordeão retos; sem isso o raio é o do tema', async () => {
    const radius = (page: Page): Promise<string> =>
        page.locator('[data-probe="acordeao"] > div').first().evaluate((root) => getComputedStyle(root).borderTopLeftRadius);
    expect(await withScene({ scene: 'atomos', theme: 'raio-sistema-zero' }, radius)).toBe('0px');
    expect(await withScene({ scene: 'atomos', theme: 'raio-sistema-cinco' }, radius)).toBe('5px');
});

test('P15: matrixGap é o espaço entre os sub-itens da matriz (par padrão × extremo)', async () => {
    const stackGap = async (page: Page): Promise<string> => {
        await page.getByText('Papel de prova').click();
        const stack = page.locator('[data-probe="matriz"] [style*="gap: var(--sarak-matrix-gap"]').first();
        await stack.waitFor({ timeout: 5000 });
        return stack.evaluate((el) => getComputedStyle(el).rowGap);
    };
    expect(await withScene({ scene: 'valores-fixos' }, stackGap)).toBe('12px');
    expect(await withScene({ scene: 'valores-fixos', theme: 'matriz-gap-largo' }, stackGap)).toBe('28px');
});

test('P37: o véu da gaveta sai pela motionEaseIn e motionDurationFast', async () => {
    const timing = await withScene(
        { scene: 'saida-sobreposicao', target: 'gaveta', theme: 'saida-curva-rapida' },
        async (page) => {
            const scrim = page.locator('[data-testid="sarak-drawer-overlay"]');
            await scrim.evaluate(async (element) => {
                await Promise.all(element.getAnimations().map((animation) => animation.finished.catch(() => undefined)));
            });
            await scrim.evaluate((element) => (element as HTMLButtonElement).click());
            await page.waitForFunction(() => {
                const element = document.querySelector('[data-testid="sarak-drawer-overlay"]');
                return element?.getAnimations().some((animation) => animation.playState === 'running');
            });
            return scrim.evaluate((element) => {
                const animation = element.getAnimations().find((candidate) => candidate.playState === 'running');
                return animation?.effect?.getTiming();
            });
        },
    );

    expect(timing?.duration).toBe(500);
    expect(timing?.easing).toContain('0, 1, 0, 1');
});

test('P21: a tabela não faz o React acusar função sem ref (a linha recebe a ref do popLayout)', async () => {
    const page = await browser.newPage({ viewport: DESKTOP });
    const refWarnings: string[] = [];
    page.on('console', (message) => {
        if (message.type() === 'error' && message.text().includes('cannot be given refs')) refWarnings.push(message.text());
    });
    try {
        await page.goto(`${harnessUrl}?cena=componente`);
        await page.waitForFunction(() => document.querySelector('[data-probe="tabela"] tbody tr') !== null);
        await page.waitForTimeout(500);
        expect(refWarnings).toEqual([]);
    } finally {
        await page.close();
    }
});
