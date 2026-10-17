/**
 * Medição, em navegador real, dos achados do lote 4 do arsenal: a sombra de ação do botão da categoria selecionada
 * (`actionGlowShadowOffsetY`/`Blur`/`Spread`), a cor ativa da faixa (`rangeActiveColor`), o hover e o pressionado globais
 * do botão (`colorDepth`/`colorVariation`) e os sete formatos de `chartType` com o dado padrão.
 *
 * Mesmo harness e mesmo artefato do `token-que-desenha.spec.ts` (`dist/index.js` + `dist/sarak.css`), com o Provider e os
 * componentes REAIS: cena `?cena=arsenal-lote4` e recortes `?tema=` (ver `fixtures/harness-entry.tsx`).
 *
 * -------------------------------------------------------------------------
 * LIMITES DECLARADOS (R18) — o que esta medição NÃO vê
 * -------------------------------------------------------------------------
 * 1. Só valores COMPUTADOS de propriedades nomeadas (`box-shadow`, `background-color`, `accent-color`, `color`); nenhum
 *    pixel. "A sombra fica bonita" não é provado — só que ela muda com cada token e que o estilo `matte` a preserva.
 * 2. O gráfico: prova que cada formato monta um `<canvas>` de área não nula e que o navegador não registra erro de console
 *    nem exceção, inclusive com o ponteiro varrendo o canvas (no radar o tooltip tem de abrir por item). NÃO prova
 *    o desenho dentro do canvas (barras, fatias, células), nem o conteúdo do tooltip além do nome do primeiro ponto.
 * 3. O hover e o pressionado são lidos depois de 250 ms, quando a transição já assentou; o quadro intermediário não.
 * 4. A sombra de ação só existe com um estilo de botão que preserva o `style` (o `matte`, padrão); outros estilos não são
 *    medidos aqui.
 * 5. Só Chromium headless. Lê o `dist/` — sem `npm run build` recente, mede o build anterior.
 * -------------------------------------------------------------------------
 */
import { test, expect, chromium, type Browser, type Page } from '@playwright/test';

const DESKTOP = { width: 1280, height: 900 } as const;
const CHART_TYPES = ['area', 'bar', 'pie', 'scatter', 'gauge', 'radar', 'heatmap'] as const;
const TRANSITION_SETTLE_MS = 250;

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

interface Opened { page: Page; errors: string[] }

async function openScene(theme?: string, chartType?: string): Promise<Opened> {
    const page = await browser.newPage({ viewport: DESKTOP });
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
        if (message.type() === 'error') errors.push(message.text());
    });
    const searchParams = new URLSearchParams({ cena: 'arsenal-lote4' });
    if (theme) searchParams.set('tema', theme);
    if (chartType) searchParams.set('tipo', chartType);
    await page.goto(`${harnessUrl}?${searchParams.toString()}`);
    await page.waitForFunction(() => document.body.hasAttribute('data-sx-texture'));
    return { page, errors };
}

async function measure<T>(theme: string | undefined, read: (page: Page) => Promise<T>): Promise<T> {
    const { page, errors } = await openScene(theme);
    try {
        const value = await read(page);
        expect(errors, 'erro no navegador').toEqual([]);
        return value;
    } finally {
        await page.close();
    }
}

const selectedCategoryShadow = (page: Page): Promise<string> =>
    page.locator('[data-probe="catalogo-acao"]').getByRole('button', { name: 'Todos' })
        .evaluate((button) => getComputedStyle(button).boxShadow);

test('P10: a sombra da categoria selecionada acompanha cada um dos três tokens (botão matte, o padrão)', async () => {
    const base = await measure(undefined, selectedCategoryShadow);
    expect(base).not.toBe('none');
    for (const theme of ['acao-brilho-y', 'acao-brilho-desfoque', 'acao-brilho-espalhamento']) {
        const shadow = await measure(theme, selectedCategoryShadow);
        expect(shadow, `${theme} não alterou o box-shadow`).not.toBe(base);
        expect(shadow).not.toBe('none');
    }
});

test('P13: a cor ativa do trilho, dos polegares e da dica segue rangeActiveColor', async () => {
    const colors = (page: Page) => page.locator('[data-probe="faixa"]').evaluate((root) => {
        const track = root.querySelector('[data-testid="sarak-range"] > div:nth-of-type(2)') as HTMLElement;
        const thumb = root.querySelector('input[type="range"]') as HTMLElement;
        const tip = root.querySelector('[data-testid="sarak-range"] > span') as HTMLElement;
        return {
            track: getComputedStyle(track).backgroundColor,
            thumb: getComputedStyle(thumb).accentColor,
            tip: getComputedStyle(tip).color,
        };
    });
    const base = await measure(undefined, colors);
    const extreme = await measure('faixa-ativa', colors);
    expect(extreme.track).toBe('rgb(225, 29, 72)');
    expect(extreme.thumb).toBe('rgb(225, 29, 72)');
    expect(extreme.tip).toBe('rgb(225, 29, 72)');
    expect(base.track).not.toBe(extreme.track);
});

interface Interaction { hover: string; pressed: string; hoverVariable: string; pressedVariable: string }

async function hoverAndPress(page: Page): Promise<Interaction> {
    const button = page.locator('[data-probe="hover-tema"]');
    const background = (): Promise<string> => button.evaluate((el) => getComputedStyle(el).backgroundColor);
    await button.hover();
    await page.waitForTimeout(TRANSITION_SETTLE_MS);
    const hover = await background();
    await page.mouse.down();
    await page.waitForTimeout(TRANSITION_SETTLE_MS);
    const pressed = await background();
    await page.mouse.up();
    const variables = await button.evaluate((el) => ({
        hoverVariable: getComputedStyle(el).getPropertyValue('--theme-primary-hover').trim(),
        pressedVariable: getComputedStyle(el).getPropertyValue('--theme-primary-active').trim(),
    }));
    return { hover, pressed, ...variables };
}

test('P11: colorDepth e colorVariation alteram o hover e o pressionado globais do botão', async () => {
    const base = await measure('cor-hover-base', hoverAndPress);
    const depth = await measure('cor-profunda', hoverAndPress);
    const variation = await measure('cor-variada', hoverAndPress);
    expect(base.hoverVariable).not.toBe('');
    expect(base.pressedVariable).not.toBe('');
    expect(depth.hover).not.toBe(base.hover);
    expect(depth.pressed).not.toBe(base.pressed);
    expect(variation.hover).not.toBe(base.hover);
    expect(variation.pressed).not.toBe(base.pressed);
});

for (const type of CHART_TYPES) {
    test(`P12: chartType ${type} monta o canvas com o dado padrão, sem erro de console`, async () => {
        const { page, errors } = await openScene(undefined, type);
        try {
            const canvas = page.locator(`[data-probe="grafico"][data-chart-type="${type}"] canvas`);
            await expect(canvas).toHaveCount(1, { timeout: 15_000 });
            await expect.poll(() => canvas.evaluate((el) => el.getBoundingClientRect().width)).toBeGreaterThan(0);
            await expect.poll(() => canvas.evaluate((el) => el.getBoundingClientRect().height)).toBeGreaterThan(0);
            // Varre o canvas em grade e anota o que o tooltip (um `div` absoluto dentro do gráfico) mostra: com o disparo
            // por eixo o radar não abre tooltip algum, e o eixo ausente também pode lançar erro com o ponteiro em cima.
            await canvas.scrollIntoViewIfNeeded();
            const box = await canvas.boundingBox();
            if (!box) throw new Error('O canvas não tem caixa.');
            let tooltipText = '';
            for (let row = 1; row <= 7 && !tooltipText; row += 1) {
                for (let column = 1; column <= 7 && !tooltipText; column += 1) {
                    await page.mouse.move(box.x + (box.width * column) / 8, box.y + (box.height * row) / 8);
                    tooltipText = await page.evaluate(() => {
                        const tips = [...document.querySelectorAll<HTMLElement>('[data-probe="grafico"] div')]
                            .filter((div) => div.style.position === 'absolute' && div.style.display !== 'none' && div.innerText.trim() !== '');
                        return tips.map((div) => div.innerText).join(' ');
                    });
                }
            }
            if (type === 'radar') expect(tooltipText, 'o radar não abriu tooltip por item').toContain('Alpha');
            // O ECharts lança no primeiro `setOption` quando o eixo não existe; dá um respiro para o erro chegar.
            await page.waitForTimeout(500);
            expect(errors, `${type} gerou erro no navegador`).toEqual([]);
        } finally {
            await page.close();
        }
    });
}
