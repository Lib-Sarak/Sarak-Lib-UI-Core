/**
 * O texto que o componente desenha sobre a cor sólida e sobre a superfície é legível nos dois modos: o badge
 * sólido e o botão de perigo escolhem o texto pelo contraste da cor do tema (`--sarak-on-*`, emitido pelo
 * motor), a bandeja das abas em pílula é a cor de TEXTO do tema a 5% (e não branco/preto fixo), e o badge suave
 * mistura a cor do status ao texto de maior contraste sobre o corpo. O `jsdom` não resolve `color-mix` nem a
 * cascata (specs/specs/11-testes-e-cobertura.md §7).
 *
 * Mesmo harness e mesmo artefato do `cromo-css-real.spec.ts` (`dist/index.js` + `dist/sarak.css`), cena
 * `?cena=legivel`. O recorte `?tema=legivel-claro` (primária e status CLAROS sobre fundo branco) e
 * `?tema=legivel-escuro` (primária e status ESCUROS sobre fundo preto) é o que muda; cada um é a contraprova do
 * outro — um texto fixo em branco/preto passaria num e falharia no outro.
 *
 * -------------------------------------------------------------------------
 * LIMITES DECLARADOS (R18) — o que esta medição NÃO vê
 * -------------------------------------------------------------------------
 * 1. Só valores COMPUTADOS de propriedades nomeadas e o contraste calculado a partir deles; nenhum pixel.
 * 2. Só Chromium headless, os dois recortes `legivel-*` e os cinco componentes da cena (badge sólido e suave,
 *    botão de perigo, abas em pílula). Os demais componentes corrigidos no lote (cartão de busca, estado vazio,
 *    fluxo, chat) são lidos pelo `fixed-translucent:check` (texto) e pelo `verify_contrast.ts` (par), não aqui.
 * 3. Lê o `dist/` — sem `npm run build` recente, mede o build anterior.
 * -------------------------------------------------------------------------
 */
import { test, expect, chromium, type Browser, type Locator, type Page } from '@playwright/test';

const DESKTOP = { width: 1280, height: 900 } as const;
const DARK_TEXT = 'rgb(2, 6, 23)';
const LIGHT_TEXT = 'rgb(255, 255, 255)';
const LARGE_TITLE_MINIMUM_FONT_SIZE_PX = 24;
const LARGE_TITLE_MINIMUM_CONTRAST_RATIO = 3;
const BODY_TEXT_MINIMUM_CONTRAST_RATIO = 4.5;

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

async function withScene<T>(tema: string, measure: (page: Page) => Promise<T>): Promise<T> {
    const page = await browser.newPage({ viewport: DESKTOP });
    try {
        await page.goto(`${harnessUrl}?${new URLSearchParams({ cena: 'legivel', tema }).toString()}`);
        await page.waitForFunction(() => document.body.hasAttribute('data-sx-texture'));
        // O fundo e a cor do corpo entram por transição na hidratação: medir o contraste no meio dela lê o corpo transparente.
        await page.evaluate(() => Promise.all(document.getAnimations().filter((animation) => animation instanceof CSSTransition).map((animation) => animation.finished.catch(() => undefined))));
        return await measure(page);
    } finally {
        await page.close();
    }
}

const probe = (page: Page, name: string): Locator => page.locator(`[data-probe="${name}"]`);

async function readComputed(target: Locator, property: string): Promise<string> {
    return target.evaluate((el, prop) => getComputedStyle(el).getPropertyValue(prop), property);
}

/**
 * Canais 0-255 de uma cor computada: `rgb()`/`rgba()` já vêm em 0-255; o resultado de `color-mix` vem como
 * `color(srgb r g b / a)` em 0-1.
 */
function channels(value: string): number[] {
    const numbers = (value.match(/-?[\d.]+(?:e-?\d+)?/g) ?? []).slice(0, 3).map(Number);
    return value.startsWith('color(') ? numbers.map((n) => n * 255) : numbers;
}

/** Razão de contraste WCAG entre duas cores computadas (a segunda, sobre fundo opaco). */
function contrast(foreground: string, background: string): number {
    const parse = channels;
    const luminance = ([r, g, b]: number[]): number => {
        const channel = (c: number) => (c / 255 <= 0.03928 ? c / 255 / 12.92 : Math.pow((c / 255 + 0.055) / 1.055, 2.4));
        return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
    };
    const [a, b] = [luminance(parse(foreground)), luminance(parse(background))];
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

test.describe('texto sobre cor sólida: escolhido pelo contraste da cor do tema', () => {
    test('modo claro, primária clara: o badge sólido e o botão de perigo usam texto ESCURO', async () => {
        await withScene('legivel-claro', async (page) => {
            await expect(probe(page, 'badge-solido-primario').locator('span').first()).toHaveCSS('color', DARK_TEXT);
            await expect(probe(page, 'badge-solido-perigo').locator('span').first()).toHaveCSS('color', DARK_TEXT);
            await expect(probe(page, 'botao-perigo').getByRole('button')).toHaveCSS('color', DARK_TEXT);
        });
    });

    test('CONTRAPROVA: modo escuro, primária e perigo escuros: o texto inverte para CLARO', async () => {
        await withScene('legivel-escuro', async (page) => {
            await expect(probe(page, 'badge-solido-primario').locator('span').first()).toHaveCSS('color', LIGHT_TEXT);
            await expect(probe(page, 'badge-solido-perigo').locator('span').first()).toHaveCSS('color', LIGHT_TEXT);
            await expect(probe(page, 'botao-perigo').getByRole('button')).toHaveCSS('color', LIGHT_TEXT);
        });
    });

    test('o texto escolhido passa de 4,5:1 sobre a cor sólida, nos dois recortes', async () => {
        for (const tema of ['legivel-claro', 'legivel-escuro']) {
            await withScene(tema, async (page) => {
                const badge = probe(page, 'badge-solido-primario').locator('span').first();
                const ratio = contrast(await readComputed(badge, 'color'), await readComputed(badge, 'background-color'));

                expect(ratio, `${tema}: badge sólido primário`).toBeGreaterThanOrEqual(4.5);
            });
        }
    });
});

test.describe('hierarquia de texto: título, subtítulo e destaque legíveis no modo claro', () => {
    test('cada papel mantém contraste suficiente sobre o corpo branco', async () => {
        await withScene('legivel-claro', async (page) => {
            const background = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
            const title = probe(page, 'hierarquia-titulo').locator('h1');
            const subtitle = probe(page, 'hierarquia-subtitulo').locator('p');
            const emphasis = probe(page, 'hierarquia-destaque').locator('p');

            expect(Number.parseFloat(await readComputed(title, 'font-size'))).toBeGreaterThanOrEqual(LARGE_TITLE_MINIMUM_FONT_SIZE_PX);
            expect(contrast(await readComputed(title, 'color'), background)).toBeGreaterThanOrEqual(LARGE_TITLE_MINIMUM_CONTRAST_RATIO);
            expect(contrast(await readComputed(subtitle, 'color'), background)).toBeGreaterThanOrEqual(BODY_TEXT_MINIMUM_CONTRAST_RATIO);
            expect(contrast(await readComputed(emphasis, 'color'), background)).toBeGreaterThanOrEqual(BODY_TEXT_MINIMUM_CONTRAST_RATIO);
        });
    });
});

test.describe('superfície: a tinta de realce deriva da cor de texto do tema', () => {
    test('modo claro: a bandeja das abas em pílula é a cor de texto ESCURA a 5%, não branco', async () => {
        await withScene('legivel-claro', async (page) => {
            const tray = probe(page, 'abas').locator('[role="tablist"]').first();
            const background = await readComputed(tray, 'background-color');
            const [r, g, b] = channels(background);

            expect(Math.max(r, g, b), `a tinta no claro é escura (veio ${background})`).toBeLessThan(128);
        });
    });

    test('CONTRAPROVA: modo escuro: a mesma bandeja é a cor de texto CLARA a 5%', async () => {
        await withScene('legivel-escuro', async (page) => {
            const tray = probe(page, 'abas').locator('[role="tablist"]').first();
            const background = await readComputed(tray, 'background-color');
            const [r, g, b] = channels(background);

            expect(Math.min(r, g, b), `a tinta no escuro é clara (veio ${background})`).toBeGreaterThan(128);
        });
    });
});

test.describe('badge suave: a cor do status misturada ao texto de maior contraste', () => {
    test('o texto do badge de sucesso passa de 4,5:1 sobre o corpo, nos dois modos', async () => {
        for (const tema of ['legivel-claro', 'legivel-escuro']) {
            await withScene(tema, async (page) => {
                const badge = probe(page, 'badge-suave-sucesso').locator('span').first();
                const body = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
                const ratio = contrast(await readComputed(badge, 'color'), body);

                expect(ratio, `${tema}: sucesso suave sobre o corpo`).toBeGreaterThanOrEqual(4.5);
            });
        }
    });

    test('CONTRAPROVA: a cor crua do status (#10b981) NÃO passa sobre branco — é o que a mistura corrige', async () => {
        await withScene('legivel-claro', async (page) => {
            const ratio = contrast('rgb(16, 185, 129)', 'rgb(255, 255, 255)');

            expect(ratio).toBeLessThan(4.5);
        });
    });
});
