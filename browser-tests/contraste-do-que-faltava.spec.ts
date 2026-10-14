/**
 * Os pares de texto que os componentes desenham e o verificador não media passam de 4,5:1 nos dois modos, em
 * navegador real: o aviso e o erro da tela de autenticação sobre a PRÓPRIA tinta a 10%, o botão de sair do usuário,
 * o hover do botão fantasma e do contorno, e o texto do botão de perigo, de sucesso e primário no estilo `cyberpunk`
 * (fundo transparente — o texto "sobre a cor" caía sobre o cartão). O `jsdom` não resolve `color-mix`, `:hover` nem
 * a cascata (specs/specs/11-testes-e-cobertura.md §7).
 *
 * Mesmo harness e mesmo artefato do `cromo-css-real.spec.ts` (`dist/index.js` + `dist/sarak.css`), cenas
 * `?cena=contraste-botoes` e `?cena=contraste-auth`. Os recortes `contraste-claro` (primária e status CLAROS sobre
 * fundo branco) e `contraste-escuro` (ESCUROS sobre preto) são os piores casos de um texto cru na cor do status; cada
 * um é a contraprova do outro. Um texto cru na cor do status — o desenho anterior — reprova nos dois.
 *
 * -------------------------------------------------------------------------
 * LIMITES DECLARADOS (R18) — o que esta medição NÃO vê
 * -------------------------------------------------------------------------
 * 1. Só valores COMPUTADOS de `color` e `background-color` e o contraste calculado a partir deles; nenhum pixel. O
 *    fundo é a composição das camadas translúcidas do elemento e dos ancestrais sobre o primeiro fundo opaco.
 * 2. Só Chromium headless, os quatro recortes `contraste-*` e os componentes das duas cenas. Os 14 temas de referência
 *    nos dois modos são medidos por `verify_contrast.ts` (a conta), não aqui.
 * 3. O `hover` é o do ponteiro sobre o botão, com movimento reduzido ligado (a transição é instantânea).
 * 4. Lê o `dist/` — sem `npm run build` recente, mede o build anterior.
 * -------------------------------------------------------------------------
 */
import { test, expect, chromium, type Browser, type Locator, type Page } from '@playwright/test';

const DESKTOP = { width: 1280, height: 900 } as const;
const MIN_RATIO = 4.5;

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

interface Rgba {
    r: number;
    g: number;
    b: number;
    a: number;
}

/** `rgb()`/`rgba()` (0-255) ou `color(srgb r g b / a)` (0-1, o resultado do `color-mix`) → canais 0-255. */
function parseColor(value: string): Rgba {
    const numbers = (value.match(/-?[\d.]+(?:e-?\d+)?/g) ?? []).map(Number);
    if (value.startsWith('color(')) {
        const [r, g, b, a] = numbers;
        return { r: r * 255, g: g * 255, b: b * 255, a: a ?? 1 };
    }
    const [r, g, b, a] = numbers;
    return { r, g, b, a: a ?? 1 };
}

function luminance({ r, g, b }: Rgba): number {
    const channel = (c: number): number => (c / 255 <= 0.03928 ? c / 255 / 12.92 : Math.pow((c / 255 + 0.055) / 1.055, 2.4));
    return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function ratio(foreground: Rgba, background: Rgba): number {
    const [a, b] = [luminance(foreground), luminance(background)];
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

/** Compõe as camadas de fundo, da mais externa para a mais próxima do texto, sobre o branco do navegador. */
function flatten(layers: string[]): Rgba {
    let base: Rgba = { r: 255, g: 255, b: 255, a: 1 };
    for (const layer of layers) {
        const top = parseColor(layer);
        base = {
            r: top.a * top.r + (1 - top.a) * base.r,
            g: top.a * top.g + (1 - top.a) * base.g,
            b: top.a * top.b + (1 - top.a) * base.b,
            a: 1,
        };
    }
    return base;
}

/** Os `background-color` do elemento e de todos os ancestrais, da raiz para o elemento. */
async function backgroundLayers(target: Locator): Promise<string[]> {
    return target.evaluate((el) => {
        const layers: string[] = [];
        for (let node: Element | null = el; node; node = node.parentElement) layers.unshift(getComputedStyle(node).backgroundColor);
        return layers;
    });
}

async function textContrast(target: Locator, text: Locator = target): Promise<number> {
    const color = await text.evaluate((el) => getComputedStyle(el).color);
    return ratio(parseColor(color), flatten(await backgroundLayers(target)));
}

async function withScene<T>(scene: string, params: Record<string, string>, measure: (page: Page) => Promise<T>): Promise<T> {
    const page = await browser.newPage({ viewport: DESKTOP });
    try {
        await page.goto(`${harnessUrl}?${new URLSearchParams({ cena: scene, ...params }).toString()}`);
        await page.waitForFunction(() => document.body.hasAttribute('data-sx-texture'));
        return await measure(page);
    } finally {
        await page.close();
    }
}

const probe = (page: Page, name: string): Locator => page.locator(`[data-probe="${name}"]`);

const THEMES = ['contraste-claro', 'contraste-escuro'] as const;

for (const theme of THEMES) {
    test.describe(`recorte ${theme}`, () => {
        for (const variant of ['erro', 'aviso']) {
            test(`tela de autenticação: o ${variant} passa de 4,5:1 sobre a própria tinta a 10%`, async () => {
                await withScene('contraste-auth', { tema: theme, v: variant }, async (page) => {
                    const message = probe(page, 'auth').locator('span.flex-1');
                    const box = message.locator('xpath=..');

                    expect(await textContrast(box, message), `${theme}: ${variant}`).toBeGreaterThanOrEqual(MIN_RATIO);
                });
            });
        }

        test('botão de sair do usuário: o texto passa de 4,5:1 sobre a tinta de erro', async () => {
            await withScene('contraste-botoes', { tema: theme }, async (page) => {
                const button = probe(page, 'sair').getByRole('button');

                expect(await textContrast(button), `${theme}: sair`).toBeGreaterThanOrEqual(MIN_RATIO);
            });
        });

        for (const name of ['fantasma', 'contorno']) {
            test(`botão ${name}: o texto no hover passa de 4,5:1 sobre o fundo do hover`, async () => {
                await withScene('contraste-botoes', { tema: theme }, async (page) => {
                    const button = probe(page, name).getByRole('button');
                    await button.hover();
                    await page.waitForTimeout(200);

                    expect(await textContrast(button), `${theme}: ${name} em hover`).toBeGreaterThanOrEqual(MIN_RATIO);
                });
            });
        }

        test('CONTRAPROVA: o botão sólido (perigo) segue com o texto escolhido pelo motor, legível', async () => {
            await withScene('contraste-botoes', { tema: theme }, async (page) => {
                const button = probe(page, 'perigo').getByRole('button');

                expect(await textContrast(button), `${theme}: perigo`).toBeGreaterThanOrEqual(MIN_RATIO);
            });
        });
    });
}

for (const theme of ['contraste-cyberpunk-claro', 'contraste-cyberpunk-escuro'] as const) {
    test.describe(`recorte ${theme}`, () => {
        for (const name of ['primario', 'perigo', 'sucesso']) {
            test(`estilo cyberpunk: o texto do botão ${name} passa de 4,5:1 sobre o fundo transparente`, async () => {
                await withScene('contraste-botoes', { tema: theme }, async (page) => {
                    const button = probe(page, name).getByRole('button');

                    await expect(button).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
                    expect(await textContrast(button), `${theme}: ${name}`).toBeGreaterThanOrEqual(MIN_RATIO);
                });
            });
        }
    });
}
