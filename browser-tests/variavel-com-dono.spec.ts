/**
 * Uma variável, um dono. Medição, em navegador real, de que o token MESTRE chega onde o canto não é declarado
 * (o canto é exceção), de que a exceção declarada vence só no canto dela, e de que as duas semânticas que
 * dividiam um nome — o raio do sistema × o do cartão, a superfície × o fundo do cartão — têm cada uma o seu.
 * O `jsdom` não calcula `border-radius` nem herda custom property pela cascata real
 * (specs/specs/11-testes-e-cobertura.md §7).
 *
 * Mesmo harness e mesmo artefato do `cromo-css-real.spec.ts` (`dist/index.js` + `dist/sarak.css`), cena
 * `?cena=cascata`. Os dois modos de injeção: App (variável inline em `html`/`body` + `<style>` responsivo em
 * `:root`) e Embarcado (`.sarak-scope` + `<style>` responsivo na ilha, depois dela).
 *
 * -------------------------------------------------------------------------
 * LIMITES DECLARADOS (R18) — o que esta medição NÃO vê
 * -------------------------------------------------------------------------
 * 1. Só valores COMPUTADOS no `.sarak-card` e no botão da cena; nenhuma outra superfície que leia o raio.
 * 2. Só Chromium, o recorte de tokens nomeado em `TOKEN_VARIANTS` e a faixa de 1280 px (os três pontos
 *    responsivos valem o mesmo nos recortes, de propósito: o caso não mede a faixa).
 * 3. No Modo Embarcado o CSS é o `dist/sarak.css` global, não o `sarak-scoped.css`: mede a ORDEM das
 *    variáveis na ilha, não o escopo dos seletores (esse é do `scopeCss.test.ts`).
 * 4. Lê o `dist/` — sem `npm run build` recente, mede o build anterior.
 * -------------------------------------------------------------------------
 */
import { test, expect, chromium, type Browser, type Locator, type Page } from '@playwright/test';

const DESKTOP = { width: 1280, height: 900 } as const;

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

type Modo = 'app' | 'embarcado';

async function withScene(tema: string, modo: Modo, measure: (page: Page) => Promise<void>): Promise<void> {
    const page = await browser.newPage({ viewport: DESKTOP });
    try {
        const searchParams = new URLSearchParams({ cena: 'cascata', tema });
        if (modo === 'embarcado') searchParams.set('modo', 'embarcado');
        await page.goto(`${harnessUrl}?${searchParams.toString()}`);
        await page.locator('[data-probe="cartao-puro"] .sarak-card').waitFor();
        await measure(page);
    } finally {
        await page.close();
    }
}

const corner = (target: Locator, property: string): Promise<string> =>
    target.evaluate((el, prop) => getComputedStyle(el).getPropertyValue(prop), property);

const CORNERS = ['border-top-left-radius', 'border-top-right-radius', 'border-bottom-right-radius', 'border-bottom-left-radius'] as const;
const MODOS: Modo[] = ['app', 'embarcado'];

for (const modo of MODOS) {
    test.describe(`modo ${modo}`, () => {
        test('o raio mestre do cartão chega aos quatro cantos', async () => {
            await withScene('dono-raio-mestre', modo, async (page) => {
                const card = page.locator('[data-probe="cartao-puro"] .sarak-card');
                for (const property of CORNERS) {
                    await expect(card, `${property}: o mestre (20px), e não o padrão do canto (12px)`).toHaveCSS(property, '20px');
                }
            });
        });

        test('o raio mestre do botão chega aos quatro cantos', async () => {
            await withScene('dono-raio-mestre', modo, async (page) => {
                const button = page.locator('[data-probe="botao"] button');
                for (const property of CORNERS) {
                    await expect(button, `${property}: o mestre (30px), e não o padrão do canto (8px)`).toHaveCSS(property, '30px');
                }
            });
        });

        test('o canto declarado vence só no canto dele, e os outros seguem o mestre', async () => {
            await withScene('dono-raio-canto', modo, async (page) => {
                const card = page.locator('[data-probe="cartao-puro"] .sarak-card');
                const button = page.locator('[data-probe="botao"] button');
                await expect(card, 'cardRadiusTL declarado = 0').toHaveCSS('border-top-left-radius', '0px');
                for (const property of CORNERS.slice(1)) await expect(card, `${property} segue o mestre`).toHaveCSS(property, '20px');
                await expect(button, 'btnRadiusTR declarado = 0').toHaveCSS('border-top-right-radius', '0px');
                for (const property of CORNERS.filter((name) => name !== 'border-top-right-radius')) {
                    await expect(button, `${property} segue o mestre`).toHaveCSS(property, '30px');
                }
            });
        });
    });
}

test('CONTRAPROVA: sem tema, o cartão e o botão computam o padrão do canto (que é o do mestre)', async () => {
    await withScene('sem-tema-nomeado', 'app', async (page) => {
        const card = page.locator('[data-probe="cartao-puro"] .sarak-card');
        const button = page.locator('[data-probe="botao"] button');
        const cardTL = await corner(card, 'border-top-left-radius');
        const cardBR = await corner(card, 'border-bottom-right-radius');
        expect(cardTL, 'o padrão chega igual aos quatro cantos').toBe(cardBR);
        expect(await corner(button, 'border-top-left-radius')).toBe(await corner(button, 'border-bottom-left-radius'));
    });
});

test('--theme-surface é a cor de superfície e igual a --surface-color; o fundo do cartão tem o próprio nome', async () => {
    await withScene('dono-superficie', 'app', async (page) => {
        const read = (name: string): Promise<string> => page.evaluate((prop) => getComputedStyle(document.body).getPropertyValue(prop).trim(), name);
        expect(await read('--theme-surface'), '--theme-surface = surfaceColor').toBe('#123456');
        expect(await read('--surface-color'), '--surface-color = --theme-surface').toBe('#123456');
        expect(await read('--sarak-card-bg'), 'o fundo do cartão segue o dele').toBe('#654321');
        expect(await read('--theme-card'), '--theme-card = cardBackgroundColor').toBe('#654321');
    });
});

test('--radius-theme é o raio do sistema; o do cartão é --sarak-card-radius', async () => {
    await withScene('dono-raio-sistema', 'app', async (page) => {
        const read = (name: string): Promise<string> => page.evaluate((prop) => getComputedStyle(document.body).getPropertyValue(prop).trim(), name);
        expect(await read('--radius-theme'), '--radius-theme = borderRadius').toBe('5px');
        expect(await read('--sarak-card-radius'), '--sarak-card-radius = cardBorderRadius').toBe('20px');
    });
});
