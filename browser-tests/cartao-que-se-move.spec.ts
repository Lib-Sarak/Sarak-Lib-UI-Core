/**
 * Medição, em navegador real, dos três tokens de movimento do cartão que o painel oferecia e nada
 * desenhava: o spotlight que segue o cursor (`cardSpotlightOpacity`), o aperto do botão de ação
 * (`cardActionClickScale`) e o zoom da imagem de capa sob o ponteiro (`imageCardHoverZoom`). O `jsdom`
 * não calcula cascata de stylesheet nem `color-mix`, então o efeito se mede aqui — em repouso, sob o
 * ponteiro e pressionado, no valor padrão e num extremo de cada token.
 *
 * Mesmo harness e mesmo artefato do `token-que-desenha.spec.ts` (`dist/index.js` + `dist/sarak.css`),
 * cena `?cena=cartao-movimento` e recortes `?tema=cartao-*` (ver `fixtures/harness-entry.tsx`).
 *
 * -------------------------------------------------------------------------
 * LIMITES DECLARADOS (R18) — o que esta medição NÃO vê
 * -------------------------------------------------------------------------
 * 1. Só valores COMPUTADOS de propriedades nomeadas; nenhum pixel. "O brilho fica bonito" não é provado
 *    — só que o gradiente existe, na cor e na opacidade do token, e que o ponto segue o ponteiro.
 * 2. O zoom é lido na matriz de transformação da camada da imagem depois da duração do movimento; o
 *    quadro intermediário não é medido.
 * 3. O toque (sem ponteiro fino) não é emulado aqui: a ausência de listener sob `hover: none` é
 *    conferida no teste de componente do hook, não neste.
 * 4. Só Chromium headless. Lê o `dist/` — sem `npm run build` recente, mede o build anterior.
 * -------------------------------------------------------------------------
 */
import { test, expect, chromium, type Browser, type Locator, type Page } from '@playwright/test';

const DESKTOP = { width: 1280, height: 900 } as const;
/** Mais que a duração lenta do tema (0,6 s): a camada do spotlight e o zoom já assentaram. */
const SETTLE_MS = 900;

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

interface SceneOptions { theme?: string; reducedMotion?: 'reduce' }

/** Conta os listeners `pointermove` que a lib registra em cartões: o custo do spotlight. */
const COUNT_LISTENERS = `
    window.__cardPointerListeners = 0;
    const original = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function (type, ...rest) {
        if (type === 'pointermove' && this instanceof Element && this.classList.contains('sarak-card')) {
            window.__cardPointerListeners += 1;
        }
        return original.call(this, type, ...rest);
    };
`;

async function withScene<T>(options: SceneOptions, measure: (page: Page) => Promise<T>): Promise<T> {
    const page = await browser.newPage({ viewport: DESKTOP, reducedMotion: options.reducedMotion });
    try {
        await page.addInitScript(COUNT_LISTENERS);
        const searchParams = new URLSearchParams({ cena: 'cartao-movimento' });
        if (options.theme) searchParams.set('tema', options.theme);
        await page.goto(`${harnessUrl}?${searchParams.toString()}`);
        await page.waitForFunction(() => document.body.hasAttribute('data-sx-texture'));
        return await measure(page);
    } finally {
        await page.close();
    }
}

const probe = (page: Page, name: string): Locator => page.locator(`[data-probe="${name}"]`);
const readComputed = (target: Locator, property: string): Promise<string> =>
    target.evaluate((el, prop) => getComputedStyle(el).getPropertyValue(prop), property);
const listenerCount = (page: Page): Promise<number> => page.evaluate(() => (window as unknown as { __cardPointerListeners: number }).__cardPointerListeners);

/**
 * Espera o cartão parar: a caixa fica idêntica por 5 quadros seguidos e nenhuma animação do elemento corre.
 * A entrada (`y: 15 → 0`) e a subida do hover mexem o cartão enquanto se mede; um prazo fixo mede o meio do movimento.
 */
async function waitUntilStill(card: Locator): Promise<void> {
    await card.evaluate((el) => new Promise<void>((resolve, reject) => {
        const deadline = performance.now() + 5000;
        let last = '';
        let stableFrames = 0;
        const tick = (): void => {
            const box = el.getBoundingClientRect();
            const key = `${box.left}|${box.top}|${box.width}|${box.height}`;
            const running = el.getAnimations({ subtree: true }).some((animation) => animation.playState === 'running');
            stableFrames = key === last && !running ? stableFrames + 1 : 0;
            last = key;
            if (stableFrames >= 5) return resolve();
            if (performance.now() > deadline) return reject(new Error('o cartão não parou em 5 s'));
            requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }));
}

/**
 * Move o ponteiro para (dx, dy) relativo ao cartão JÁ ASSENTADO: entra no cartão, espera ele parar (a entrada e a
 * subida do hover), relê a caixa e só então posiciona o ponteiro e espera o quadro que grava as variáveis.
 * O ponto esperado do gradiente é, portanto, o mesmo (dx, dy) contra a caixa final.
 */
async function pointAt(page: Page, card: Locator, dx: number, dy: number): Promise<void> {
    const first = await card.boundingBox();
    if (!first) throw new Error('cartão sem caixa');
    await page.mouse.move(first.x + dx, first.y + dy);
    await waitUntilStill(card);
    const settled = await card.boundingBox();
    if (!settled) throw new Error('cartão sem caixa');
    await page.mouse.move(settled.x + dx, settled.y + dy);
    await waitUntilStill(card);
    await page.waitForTimeout(SETTLE_MS);
}

/** O canal alfa da PRIMEIRA cor do gradiente computado (`color(srgb … / a)` ou `rgb(a)(…)`); sem canal, opaca. */
function gradientAlpha(backgroundImage: string): number {
    const first = backgroundImage.match(/circle at [^,]+, ((?:rgba?|color)\([^)]*\))/)?.[1] ?? '';
    const slash = first.match(/\/\s*([\d.]+)\)/);
    if (slash) return Number(slash[1]);
    const rgba = first.match(/^rgba\(\s*[\d.]+,\s*[\d.]+,\s*[\d.]+,\s*([\d.]+)\)/);
    return rgba ? Number(rgba[1]) : 1;
}

/** O centro do gradiente em px; o cartão pode estar a meio pixel do repouso (subida do hover), por isso a comparação tem tolerância. */
const gradientCenter = (backgroundImage: string): number[] =>
    (backgroundImage.match(/circle at ([^,]+),/)?.[1] ?? '').split(' ').map((part) => parseFloat(part));

const SPOTLIGHT_CARDS = ['cartao-acao', 'cartao-titulo', 'cartao-busca'] as const;

test.describe('spotlight do cartão (cardSpotlightOpacity)', () => {
    for (const name of SPOTLIGHT_CARDS) {
        test(`${name}: desenha a primária do tema, na opacidade do token, e segue o ponteiro`, async () => {
            const defaults = await withScene({}, async (page) => {
                const card = probe(page, name).locator('.sarak-card').first();
                const layer = card.locator('> .spotlight-effect');
                const resting = await readComputed(layer, 'opacity');
                await pointAt(page, card, 40, 30);
                const first = await readComputed(layer, 'background-image');
                const opacityOnHover = await readComputed(layer, 'opacity');
                await pointAt(page, card, 200, 60);
                const second = await readComputed(layer, 'background-image');
                return { resting, first, second, opacityOnHover };
            });
            expect(defaults.resting).toBe('0');
            expect(defaults.opacityOnHover).toBe('1');
            expect(defaults.first).toContain('radial-gradient');
            expect(gradientAlpha(defaults.first)).toBeCloseTo(0.1, 2);
            const [firstX, firstY] = gradientCenter(defaults.first);
            const [secondX, secondY] = gradientCenter(defaults.second);
            expect(Math.abs(firstX - 40)).toBeLessThan(2);
            expect(Math.abs(firstY - 30)).toBeLessThan(2);
            expect(Math.abs(secondX - 200)).toBeLessThan(2);
            expect(Math.abs(secondY - 60)).toBeLessThan(2);

            const strong = await withScene({ theme: 'cartao-spotlight-forte' }, async (page) => {
                const card = probe(page, name).locator('.sarak-card').first();
                await pointAt(page, card, 40, 30);
                return readComputed(card.locator('> .spotlight-effect'), 'background-image');
            });
            expect(gradientAlpha(strong)).toBeCloseTo(1, 2);
        });
    }

    test('token 0: nenhum gradiente e nenhum listener registrado', async () => {
        await withScene({ theme: 'cartao-spotlight-zero' }, async (page) => {
            for (const name of SPOTLIGHT_CARDS) {
                const card = probe(page, name).locator('.sarak-card').first();
                await pointAt(page, card, 40, 30);
                expect(await readComputed(card.locator('> .spotlight-effect'), 'background-image')).toBe('none');
            }
            expect(await listenerCount(page)).toBe(0);
        });
    });

    test('token padrão: um listener por cartão e a posição some quando o ponteiro sai', async () => {
        await withScene({}, async (page) => {
            const card = probe(page, 'cartao-acao').locator('.sarak-card').first();
            await pointAt(page, card, 40, 30);
            expect(await listenerCount(page)).toBeGreaterThanOrEqual(3);
            expect(await card.evaluate((el) => (el as HTMLElement).style.getPropertyValue('--sarak-spot-x'))).toBe('40px');
            await page.mouse.move(DESKTOP.width - 1, DESKTOP.height - 1);
            await page.waitForTimeout(SETTLE_MS);
            expect(await card.evaluate((el) => (el as HTMLElement).style.getPropertyValue('--sarak-spot-x'))).toBe('');
        });
    });

    test('movimento reduzido (token): sem camada desenhada e sem listener', async () => {
        await withScene({ theme: 'movimento-reduzido' }, async (page) => {
            const card = probe(page, 'cartao-acao').locator('.sarak-card').first();
            await pointAt(page, card, 40, 30);
            expect(await readComputed(card.locator('> .spotlight-effect'), 'display')).toBe('none');
            expect(await listenerCount(page)).toBe(0);
        });
    });

    test('movimento reduzido (preferência do sistema): sem camada desenhada', async () => {
        await withScene({ reducedMotion: 'reduce' }, async (page) => {
            const card = probe(page, 'cartao-acao').locator('.sarak-card').first();
            await pointAt(page, card, 40, 30);
            expect(await readComputed(card.locator('> .spotlight-effect'), 'display')).toBe('none');
        });
    });
});

test.describe('aperto do botão de ação (cardActionClickScale)', () => {
    async function scaleWhilePressed(options: SceneOptions): Promise<{ resting: string; pressed: string }> {
        return withScene(options, async (page) => {
            const button = probe(page, 'cartao-acao').locator('.sarak-card-action-btn');
            const resting = await readComputed(button, 'scale');
            await button.hover();
            await page.mouse.down();
            await page.waitForTimeout(SETTLE_MS);
            const pressed = await readComputed(button, 'scale');
            await page.mouse.up();
            return { resting, pressed };
        });
    }

    test('padrão 0,96 e extremo 0,8: o botão encolhe até a escala do token, só enquanto pressionado', async () => {
        const defaults = await scaleWhilePressed({});
        expect(defaults.resting).toBe('none');
        expect(Number(defaults.pressed)).toBeCloseTo(0.96, 3);
        const strong = await scaleWhilePressed({ theme: 'cartao-clique-forte' });
        expect(Number(strong.pressed)).toBeCloseTo(0.8, 3);
    });

    test('escala 1: o aperto não muda o tamanho do botão', async () => {
        const none = await scaleWhilePressed({ theme: 'cartao-clique-nenhum' });
        expect(Number(none.pressed)).toBe(1);
    });

    test('movimento reduzido: o botão não encolhe', async () => {
        const reduced = await scaleWhilePressed({ theme: 'movimento-reduzido' });
        expect(Number(reduced.pressed)).toBe(1);
    });
});

test.describe('zoom da imagem de capa (imageCardHoverZoom)', () => {
    /** O fator `a` da matriz de transformação da camada da imagem, com o ponteiro no CENTRO do cartão (sobre o conteúdo). */
    async function zoomUnderPointer(options: SceneOptions): Promise<{ resting: number; hovered: number }> {
        return withScene(options, async (page) => {
            const card = probe(page, 'cartao-imagem').locator('> *').first();
            const layer = card.locator('img').locator('..');
            const factor = async (): Promise<number> => {
                const transform = await readComputed(layer, 'transform');
                return transform === 'none' ? 1 : Number(transform.match(/matrix\(([-\d.]+)/)?.[1]);
            };
            const resting = await factor();
            await card.hover();
            await page.waitForTimeout(SETTLE_MS);
            return { resting, hovered: await factor() };
        });
    }

    test('padrão 1,05 e extremo 1,5: ao passar o ponteiro sobre o cartão inteiro a imagem cresce', async () => {
        const defaults = await zoomUnderPointer({});
        expect(defaults.resting).toBe(1);
        expect(defaults.hovered).toBeCloseTo(1.05, 3);
        const strong = await zoomUnderPointer({ theme: 'cartao-zoom-forte' });
        expect(strong.hovered).toBeCloseTo(1.5, 3);
    });

    test('zoom 1: sem efeito', async () => {
        const none = await zoomUnderPointer({ theme: 'cartao-zoom-nenhum' });
        expect(none.hovered).toBe(1);
    });

    test('movimento reduzido (token e preferência do sistema): sem zoom', async () => {
        const token = await zoomUnderPointer({ theme: 'movimento-reduzido' });
        expect(token.hovered).toBe(1);
        const system = await zoomUnderPointer({ reducedMotion: 'reduce' });
        expect(system.hovered).toBe(1);
    });
});
