import path from 'node:path';
import { expect, test, chromium, type Browser, type Page } from '@playwright/test';
import { createServer, type Plugin, type ViteDevServer } from 'vite';

const BROWSER_CACHE = path.resolve('node_modules/.cache/ms-playwright');
const CHART_TYPES = ['area', 'bar', 'pie', 'scatter', 'gauge', 'radar', 'heatmap'] as const;

let browser: Browser;
let harnessUrl: string;
let viteServer: ViteDevServer;

test.beforeAll(async () => {
    process.env.PLAYWRIGHT_BROWSERS_PATH = BROWSER_CACHE;
    const iconStubPath = path.resolve('browser-tests/fixtures/arsenal-lote4-icon-stub.tsx');
    const providerStubPath = path.resolve('browser-tests/fixtures/arsenal-lote4-provider-stub.tsx');
    const inputStubPath = path.resolve('browser-tests/fixtures/arsenal-lote4-input-stub.tsx');
    const echartsWrapperPath = path.resolve('browser-tests/fixtures/arsenal-lote4-echarts-wrapper.tsx');
    const echartsGlobalPath = path.resolve('browser-tests/fixtures/arsenal-lote4-echarts-global.ts');
    const echartsCoreStubPath = path.resolve('browser-tests/fixtures/arsenal-lote4-echarts-core-stub.ts');
    const echartsComponentsStubPath = path.resolve('browser-tests/fixtures/arsenal-lote4-echarts-components-stub.ts');
    const rechartsStubPath = path.resolve('browser-tests/fixtures/arsenal-lote4-recharts-stub.tsx');
    const iconStubPlugin: Plugin = {
        name: 'arsenal-lote4-icon-stub',
        enforce: 'pre',
        resolveId(source, importer) {
            if (source.endsWith('/SarakIcon')) return iconStubPath;
            if (source.endsWith('/SarakUIProvider')) return providerStubPath;
            if (source === '../Inputs' && importer?.endsWith('/SarakCatalogGrid.tsx')) return inputStubPath;
            if (source === 'echarts-for-react') return echartsWrapperPath;
            if (source === 'echarts') return echartsGlobalPath;
            if (source === 'echarts/core') return echartsCoreStubPath;
            if (source === 'echarts/components') return echartsComponentsStubPath;
            if (source === './SubEngines/RechartsChart' && importer?.endsWith('/SarakChartEngine.tsx')) return rechartsStubPath;
            return null;
        },
    };

    viteServer = await createServer({
        configFile: false,
        root: process.cwd(),
        appType: 'mpa',
        server: { host: '127.0.0.1', port: 0 },
        plugins: [iconStubPlugin],
        esbuild: { jsx: 'automatic', tsconfigRaw: { compilerOptions: { jsx: 'react-jsx' } } },
        optimizeDeps: {
            noDiscovery: true,
            include: [
                'react', 'react/jsx-runtime', 'react/jsx-dev-runtime', 'react-dom', 'react-dom/client',
            ],
        },
    });
    await viteServer.listen();
    const address = viteServer.httpServer?.address();
    if (!address || typeof address === 'string') throw new Error('O servidor de medição não abriu uma porta TCP.');
    harnessUrl = `http://127.0.0.1:${address.port}/browser-tests/fixtures/arsenal-lote4-source.html`;
    browser = await chromium.launch();
});

test.afterAll(async () => {
    await browser?.close();
    await viteServer?.close();
});

async function openMeasurement(parameters: Record<string, string>): Promise<{ page: Page; errors: string[] }> {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    const errors: string[] = [];
    const failedRequests: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('requestfailed', (request) => failedRequests.push(`${request.url()}: ${request.failure()?.errorText ?? 'falha sem detalhe'}`));
    page.on('console', (message) => {
        if (message.type() === 'error') errors.push(message.text());
    });

    const url = new URL(harnessUrl);
    Object.entries(parameters).forEach(([key, value]) => url.searchParams.set(key, value));
    await page.goto(url.href, { waitUntil: 'domcontentloaded', timeout: 45_000 });
    await page.waitForFunction(
        () => document.body.dataset.measurementReady === 'true' || Boolean(document.body.dataset.measurementError),
        undefined,
        { timeout: 15_000 },
    ).catch(async () => {
        const pageError = await page.locator('body').getAttribute('data-measurement-error');
        throw new Error(`A cena não montou. ${pageError ?? ''} ${errors.join(' | ')} ${failedRequests.join(' | ')}`.trim());
    });
    return { page, errors };
}

test('P10: a sombra da categoria selecionada acompanha os três tokens, mesmo com SarakButton matte', async () => {
    const baseline = await openMeasurement({ case: 'catalog' });
    const selectedButton = baseline.page.getByRole('button', { name: 'Todos' });
    const defaultShadow = await selectedButton.evaluate((button) => getComputedStyle(button).boxShadow);
    expect(baseline.errors).toEqual([]);
    expect(defaultShadow).not.toBe('none');

    for (const profile of ['offset', 'blur', 'spread']) {
        const measurement = await openMeasurement({ case: 'catalog', profile });
        const measuredShadow = await measurement.page.getByRole('button', { name: 'Todos' })
            .evaluate((button) => getComputedStyle(button).boxShadow);

        expect(measurement.errors, `${profile} gerou erro no navegador`).toEqual([]);
        expect(measuredShadow, `${profile} não alterou box-shadow`).not.toBe(defaultShadow);
        expect(measuredShadow).toContain('0.05');
        await measurement.page.close();
    }

    expect(defaultShadow).toContain('0.05');

    await baseline.page.close();
});

test('P13: a cor ativa do trilho, dos thumbs e das dicas segue rangeActiveColor', async () => {
    const baseline = await openMeasurement({ case: 'range' });
    const extreme = await openMeasurement({ case: 'range', profile: 'extreme' });
    const activeTrack = (page: Page) => page.locator('[data-testid="sarak-range"] > div').nth(1);
    const firstThumb = (page: Page) => page.getByRole('slider').first();
    const firstTooltip = (page: Page) => page.locator('[data-testid="sarak-range"] > span').first();

    const defaultTrackColor = await activeTrack(baseline.page).evaluate((element) => getComputedStyle(element).backgroundColor);
    const extremeTrackColor = await activeTrack(extreme.page).evaluate((element) => getComputedStyle(element).backgroundColor);
    const extremeThumbColor = await firstThumb(extreme.page).evaluate((element) => getComputedStyle(element).accentColor);
    const extremeTooltipColor = await firstTooltip(extreme.page).evaluate((element) => getComputedStyle(element).color);

    expect(baseline.errors).toEqual([]);
    expect(extreme.errors).toEqual([]);
    expect(defaultTrackColor).not.toBe(extremeTrackColor);
    expect(extremeTrackColor).toBe('rgb(225, 29, 72)');
    expect(extremeThumbColor).toBe('rgb(225, 29, 72)');
    expect(extremeTooltipColor).toBe('rgb(225, 29, 72)');

    await baseline.page.close();
    await extreme.page.close();
});

test('P11: colorDepth e colorVariation alteram hover e pressionado globais', async () => {
    const baseline = await openMeasurement({ case: 'color-variants', profile: 'base' });
    const depth = await openMeasurement({ case: 'color-variants', profile: 'depth' });
    const variation = await openMeasurement({ case: 'color-variants', profile: 'variation' });
    const interactionColors = async (page: Page): Promise<{
        hover: string;
        pressed: string;
        hoverVariable: string;
        pressedVariable: string;
    }> => {
        const button = page.getByTestId('theme-hover-probe');
        await button.hover();
        await page.waitForTimeout(250);
        const hover = await button.evaluate((element) => getComputedStyle(element).backgroundColor);
        await page.mouse.down();
        await page.waitForTimeout(250);
        const pressed = await button.evaluate((element) => getComputedStyle(element).backgroundColor);
        await page.mouse.up();
        const variables = await button.evaluate((element) => ({
            hoverVariable: getComputedStyle(element).getPropertyValue('--theme-primary-hover').trim(),
            pressedVariable: getComputedStyle(element).getPropertyValue('--theme-primary-active').trim(),
        }));
        return { hover, pressed, ...variables };
    };

    const [base, depthResult, variationResult] = await Promise.all([
        interactionColors(baseline.page),
        interactionColors(depth.page),
        interactionColors(variation.page),
    ]);

    expect(baseline.errors).toEqual([]);
    expect(depth.errors).toEqual([]);
    expect(variation.errors).toEqual([]);
    expect(depthResult.hover).not.toBe(base.hover);
    expect(variationResult.hover).not.toBe(base.hover);
    expect(depthResult.pressed).not.toBe(base.pressed);
    expect(variationResult.pressed).not.toBe(base.pressed);
    expect(base.hoverVariable).not.toBe('');
    expect(base.pressedVariable).not.toBe('');

    await baseline.page.close();
    await depth.page.close();
    await variation.page.close();
});

test('P12: os sete formatos declarados renderizam canvas sem erro de console', async () => {
    for (const type of CHART_TYPES) {
        const { page, errors } = await openMeasurement({ case: 'chart', type });
        const canvas = page.locator(`[data-chart-type="${type}"] canvas`);
        await expect(canvas).toHaveCount(1);
        await expect.poll(() => canvas.evaluate((element) => element.getBoundingClientRect().width)).toBeGreaterThan(0);
        await expect.poll(() => canvas.evaluate((element) => element.getBoundingClientRect().height)).toBeGreaterThan(0);
        expect(errors, `${type} gerou erro no navegador`).toEqual([]);
        await page.close();
    }
});
