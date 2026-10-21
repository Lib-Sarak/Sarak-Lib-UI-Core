/**
 * As fontes do host no navegador: uma família registrada em `options.fonts.custom`, com o arquivo servido pelo host
 * (aqui, um woff2 local, por caminho relativo à página `file://`), é a que o título usa, e nenhuma requisição sai da
 * máquina. Uma URL com esquema perigoso é recusada com aviso, e nenhuma regra dela chega ao documento.
 *
 * O `jsdom` não baixa fonte: só o navegador mede se o `@font-face` do host carrega de fato e o que vai para a rede
 * (specs/specs/11-testes-e-cobertura.md §7). Mesmo harness do `cromo-css-real.spec.ts`, cena `?cena=fontes-do-host`.
 *
 * -------------------------------------------------------------------------
 * LIMITES DECLARADOS (R18) — o que esta medição NÃO vê
 * -------------------------------------------------------------------------
 * 1. Só Chromium e só `file://`: o arquivo "do host" é um woff2 do próprio `dist/fonts/` (VT323), apontado por
 *    caminho RELATIVO — `file:` em si é esquema recusado pela validação, de propósito. CDN `https:` não passa por aqui.
 * 2. "Sem requisição externa" é o que a página PEDE (`page.on('request')`), em qualquer esquema fora de `file:`/`data:`.
 * 3. A fonte "usada" é a família carregada (`document.fonts`) e a primeira família computada do título; não compara
 *    pixels da renderização.
 * 4. Lê o `dist/` — sem `npm run build` recente, mede o build anterior.
 * -------------------------------------------------------------------------
 */
import { test, expect, chromium, type Browser } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const harnessUrl = process.env.SARAK_CROMO_HARNESS_URL;
if (!harnessUrl) {
    throw new Error('O globalSetup não preparou o harness de CSS para esta execução do Playwright.');
}

const DIST_FONTS_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist', 'fonts');
const HOST_FILE = path.join(DIST_FONTS_DIR, 'vt323-latin-400-normal.woff2');
/** O arquivo do host relativo à página do harness — o navegador o resolve para `file://`. */
const HOST_FILE_RELATIVE = path.relative(path.dirname(fileURLToPath(harnessUrl)), HOST_FILE).split(path.sep).join('/');
const LOCAL_SCHEMES = /^(file|data|blob):/;

let browser: Browser;

test.beforeAll(async () => {
    browser = await chromium.launch();
});

test.afterAll(async () => {
    await browser.close();
});

const sceneUrl = (file: string): string =>
    `${harnessUrl}?cena=fontes-do-host&fontes=${encodeURIComponent(pathToFileURL(DIST_FONTS_DIR).href)}&arquivo=${encodeURIComponent(file)}`;

test('a família do host é a que o título usa, sem nenhuma requisição externa', async () => {
    const page = await browser.newPage();
    const external: string[] = [];
    page.on('request', (request) => {
        if (!LOCAL_SCHEMES.test(request.url())) external.push(request.url());
    });
    await page.goto(sceneUrl(HOST_FILE_RELATIVE));
    await page.waitForFunction(() => Array.from(document.fonts).some((face) => face.family.replace(/"/g, '') === 'Fonte Do Host' && face.status === 'loaded'));

    const probe = await page.evaluate(() => ({
        computed: getComputedStyle(document.querySelector('[data-probe="titulo"]') as Element).fontFamily,
        hostLoaded: document.fonts.check('400 32px "Fonte Do Host"'),
        preconnects: document.querySelectorAll('link[rel="preconnect"]').length,
    }));
    expect(probe.computed.split(',')[0].replace(/['"]/g, '').trim()).toBe('Fonte Do Host');
    expect(probe.hostLoaded).toBe(true);
    expect(probe.preconnects).toBe(0);
    expect(external).toEqual([]);
    await page.close();
});

test('URL com esquema perigoso: recusada com aviso, nenhuma regra da família no documento', async () => {
    const page = await browser.newPage();
    const warnings: string[] = [];
    page.on('console', (message) => {
        if (message.type() === 'warning') warnings.push(message.text());
    });
    await page.goto(sceneUrl('javascript:alert(1)'));
    await expect.poll(() => warnings.some((text) => text.includes('família "Fonte Do Host" recusado'))).toBe(true);
    const hostRules = await page.evaluate(() => Array.from(document.querySelectorAll('style[data-sarak-font]'))
        .filter((el) => el.getAttribute('data-sarak-font') === 'Fonte Do Host').length);
    expect(hostRules).toBe(0);
    await page.close();
});
