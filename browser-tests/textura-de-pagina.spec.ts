/**
 * Medição, em navegador real, de que a textura de PÁGINA (`texture`, o `::before` do `html` e do `body`) não faz o documento
 * ganhar largura: o `scrollWidth` fica igual à largura da janela durante 40 s, também nas texturas que ANIMAM. Uma animação
 * de `transform` (`scale`) no pseudoelemento da página estoura a área rolável (`html` com `overflow-x: visible`) e cria barra de
 * rolagem horizontal que cresce com o tempo (medido antes da correção: `nebula` 1291 → 1402 px em 40 s e `stars` oscilando
 * entre 1280 e 1310 px, numa janela de 1280 px). O `jsdom` não calcula área rolável nem roda animação CSS.
 *
 * A prova tem duas pontas, para não passar por vazio: a textura ESTÁ aplicada (o atributo do `html`) e a animação ESTÁ rodando
 * (`animation-name` do `::before`), e mesmo assim a largura do documento não muda. `aurora` (anima `background-position`),
 * `noise` (anima `background-position` com `bgNoiseAnimation`) e `constellation` (estática) são as contraprovas: nunca
 * estouraram.
 *
 * -------------------------------------------------------------------------
 * LIMITES DECLARADOS (R18) — o que esta medição NÃO vê
 * -------------------------------------------------------------------------
 * 1. Só a textura de página do tema do harness (`?tema=pagina-<textura>`), em 1280 px de largura, no Modo App; a ilha do Modo
 *    Embarcado (`.sarak-scope[data-sx-texture]`) usa as mesmas regras, mas não é medida aqui.
 * 2. Mede o MÁXIMO do `scrollWidth` amostrado a cada 250 ms; um estouro mais curto que a amostra passaria. A deriva da
 *    `nebula` (60 s por ciclo) e o ciclo de 4 s da `stars` são mais lentos que a amostra.
 * 3. As 41 texturas não são todas medidas: só as que animam (`nebula`, `stars`, `aurora`, `noise`) e uma estática.
 *    `.texture-aurora-classic` (rotação e escala) é uma classe que nenhuma opção de `texture` aplica na página.
 * 4. Só Chromium headless, contra o artefato que o `globalSetup` montou.
 * -------------------------------------------------------------------------
 */
import { test, expect, chromium, type Browser, type Page } from '@playwright/test';

const harnessUrl = process.env.SARAK_CROMO_HARNESS_URL;
if (!harnessUrl) {
    throw new Error('O globalSetup não preparou o harness de CSS para esta execução do Playwright.');
}

const WINDOW_WIDTH = 1280;
const MEASURE_SECONDS = 40;
const SAMPLE_EVERY_MS = 250;

/** textura de página → a animação que a regra dela liga (`null`: estática). */
const TEXTURES: Array<{ texture: string; animation: string | null }> = [
    { texture: 'nebula', animation: 'nebula-drift' },
    { texture: 'stars', animation: 'stars-twinkle' },
    { texture: 'aurora', animation: 'aurora-flow' },
    { texture: 'noise', animation: 'sarak-noise-shift' },
    { texture: 'constellation', animation: null },
];

let browser: Browser;

test.beforeAll(async () => {
    browser = await chromium.launch();
});

test.afterAll(async () => {
    await browser.close();
});

/** Abre a cena da textura e começa a anotar, dentro da página, o maior `scrollWidth` que o documento teve. */
async function openAndSample(texture: string): Promise<Page> {
    const page = await browser.newPage({ viewport: { width: WINDOW_WIDTH, height: 800 } });
    await page.goto(`${harnessUrl}?cena=textura&tema=pagina-${texture}`);
    await page.waitForFunction((name) => document.documentElement.getAttribute('data-sx-texture') === name, texture);
    await page.evaluate((everyMs) => {
        const win = window as unknown as { __maxScrollWidth: number };
        win.__maxScrollWidth = 0;
        window.setInterval(() => {
            win.__maxScrollWidth = Math.max(win.__maxScrollWidth, document.documentElement.scrollWidth);
        }, everyMs);
    }, SAMPLE_EVERY_MS);
    return page;
}

test(`a textura de página não aumenta o scrollWidth do documento em ${MEASURE_SECONDS} s (nebula, stars, aurora, noise e a estática)`, async () => {
    test.setTimeout((MEASURE_SECONDS + 60) * 1000);
    const opened: Array<{ texture: string; animation: string | null; page: Page }> = [];
    for (const entry of TEXTURES) opened.push({ ...entry, page: await openAndSample(entry.texture) });

    // As páginas correm em paralelo: uma espera só, a janela de medida é a mesma para todas.
    await opened[0].page.waitForTimeout(MEASURE_SECONDS * 1000);

    for (const { texture, animation, page } of opened) {
        const measured = await page.evaluate(() => ({
            max: (window as unknown as { __maxScrollWidth: number }).__maxScrollWidth,
            animationName: getComputedStyle(document.documentElement, '::before').animationName,
        }));
        expect(measured.animationName, `${texture}: a animação da regra segue ligada`).toBe(animation ?? 'none');
        expect(measured.max, `${texture}: o maior scrollWidth em ${MEASURE_SECONDS} s é a largura da janela`).toBe(WINDOW_WIDTH);
        await page.close();
    }
});
