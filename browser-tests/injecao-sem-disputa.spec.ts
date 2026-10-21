/**
 * O motor escreve cada variável por UM canal só. Medição, em navegador real, de que o valor que o tema declara
 * chega igual nos modos App e Embarcado qualquer que seja o formato — escalar ou responsivo — do token mestre
 * (o raio do cartão e o do botão) e da exceção (o canto), e de que trocar de tema não deixa variável do tema
 * anterior vencendo. O `jsdom` não resolve `@media` nem a disputa entre estilo inline e `<style>`
 * (specs/specs/11-testes-e-cobertura.md §7).
 *
 * Mesmo harness e mesmo artefato do `cromo-css-real.spec.ts` (`dist/index.js` + `dist/sarak.css`), cena
 * `?cena=cascata` (e `?cena=troca-de-tema`, que monta o Provider com estado). Os dois modos de injeção: App
 * (variável inline em `html`/`body` + `<style>` responsivo em `:root`) e Embarcado (inline e regra em
 * `.sarak-scope`, mais o `<style>` responsivo na ilha).
 *
 * -------------------------------------------------------------------------
 * LIMITES DECLARADOS (R18) — o que esta medição NÃO vê
 * -------------------------------------------------------------------------
 * 1. Só valores COMPUTADOS dos quatro cantos do `.sarak-card` e do botão da cena, e a variável inline do
 *    canto de cada cartão; nenhum outro token com `exceptionOf` (só o raio mestre tem exceção no schema).
 * 2. Só Chromium e três larguras de janela (400, 800 e 1280 px — um ponto responsivo cada); o par de breakpoints
 *    é o padrão do motor, não o de um tema que o redefina.
 * 3. Embarcado mede a ORDEM das variáveis na ilha com o `dist/sarak.css` global, não o escopo dos seletores
 *    (esse é do `scopeCss.test.ts`).
 * 4. A troca é a de `activeThemeId` entre dois temas do consumidor; a troca por `applyConfig`/`setDesign` usa o
 *    mesmo injetor, mas não é medida aqui.
 * 5. Lê o `dist/` — sem `npm run build` recente, mede o build anterior.
 * -------------------------------------------------------------------------
 */
import { test, expect, chromium, type Browser, type Locator, type Page } from '@playwright/test';

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

type Mode = 'app' | 'embarcado';
type Point = 'mob' | 'tab' | 'desk';

const WIDTHS: Record<Point, number> = { mob: 400, tab: 800, desk: 1280 };
const MODES: Mode[] = ['app', 'embarcado'];
const POINTS: Point[] = ['mob', 'tab', 'desk'];

const CORNERS = ['border-top-left-radius', 'border-top-right-radius', 'border-bottom-right-radius', 'border-bottom-left-radius'] as const;
type Corner = (typeof CORNERS)[number];

async function withScene(
    scene: string,
    theme: string | undefined,
    mode: Mode,
    point: Point,
    measure: (page: Page) => Promise<void>,
): Promise<void> {
    const page = await browser.newPage({ viewport: { width: WIDTHS[point], height: 900 } });
    try {
        const searchParams = new URLSearchParams({ cena: scene });
        if (theme) searchParams.set('tema', theme);
        if (mode === 'embarcado') searchParams.set('modo', 'embarcado');
        await page.goto(`${harnessUrl}?${searchParams.toString()}`);
        await page.locator('[data-probe="cartao-puro"] .sarak-card').waitFor();
        await measure(page);
    } finally {
        await page.close();
    }
}

const card = (page: Page): Locator => page.locator('[data-probe="cartao-puro"] .sarak-card');
const button = (page: Page): Locator => page.locator('[data-probe="botao"] button');

/** Os quatro cantos de uma peça: o valor esperado de cada um, em px. */
async function expectCorners(target: Locator, expected: Record<Corner, number>, label: string): Promise<void> {
    for (const property of CORNERS) {
        await expect(target, `${label}: ${property}`).toHaveCSS(property, `${expected[property]}px`);
    }
}

const all = (value: number): Record<Corner, number> => ({
    'border-top-left-radius': value,
    'border-top-right-radius': value,
    'border-bottom-right-radius': value,
    'border-bottom-left-radius': value,
});

const CARD_MASTER: Record<Point, number> = { mob: 10, tab: 14, desk: 18 };
const BUTTON_MASTER: Record<Point, number> = { mob: 12, tab: 16, desk: 20 };
const CARD_CORNER: Record<Point, number> = { mob: 2, tab: 4, desk: 6 };
const BUTTON_CORNER: Record<Point, number> = { mob: 1, tab: 3, desk: 5 };

for (const mode of MODES) {
    test.describe(`modo ${mode}`, () => {
        test('mestre escalar e canto responsivo: o canto declarado chega em cada ponto, os outros seguem o mestre', async () => {
            for (const point of POINTS) {
                await withScene('cascata', 'dono-mestre-escalar-canto-responsivo', mode, point, async (page) => {
                    await expectCorners(card(page), { ...all(20), 'border-top-left-radius': CARD_CORNER[point] }, `cartão @${point}`);
                    await expectCorners(button(page), { ...all(30), 'border-top-right-radius': BUTTON_CORNER[point] }, `botão @${point}`);
                });
            }
        });

        test('mestre responsivo e canto escalar: o canto declarado vale em todo ponto, os outros seguem o mestre', async () => {
            for (const point of POINTS) {
                await withScene('cascata', 'dono-mestre-responsivo-canto-escalar', mode, point, async (page) => {
                    await expectCorners(card(page), { ...all(CARD_MASTER[point]), 'border-top-left-radius': 3 }, `cartão @${point}`);
                    await expectCorners(button(page), { ...all(BUTTON_MASTER[point]), 'border-top-right-radius': 4 }, `botão @${point}`);
                });
            }
        });

        test('CONTRAPROVA: mestre escalar sem canto declarado chega igual aos quatro cantos', async () => {
            await withScene('cascata', 'dono-mestre-escalar', mode, 'desk', async (page) => {
                await expectCorners(card(page), all(20), 'cartão');
                await expectCorners(button(page), all(30), 'botão');
            });
        });

        test('trocar de tema não deixa o valor do tema anterior: mestre e canto escalares viram responsivos', async () => {
            for (const point of POINTS) {
                await withScene('troca-de-tema', undefined, mode, point, async (page) => {
                    // Antes: mestre 20 e canto 3 (os dois escalares, inline). O tema B declara os dois responsivos.
                    await expectCorners(card(page), { ...all(20), 'border-top-left-radius': 3 }, `cartão antes @${point}`);
                    await expectCorners(button(page), { ...all(30), 'border-top-right-radius': 4 }, `botão antes @${point}`);
                    await page.locator('[data-probe="trocar"]').click();
                    await expect(card(page), 'o tema B chegou ao mestre').toHaveCSS(
                        'border-bottom-right-radius', `${CARD_MASTER[point]}px`,
                    );
                    await expectCorners(card(page), { ...all(CARD_MASTER[point]), 'border-top-left-radius': CARD_CORNER[point] }, `cartão depois @${point}`);
                    await expectCorners(button(page), { ...all(BUTTON_MASTER[point]), 'border-top-right-radius': BUTTON_CORNER[point] }, `botão depois @${point}`);
                });
            }
        });

        test('trocar de tema não deixa variável inline: a que o tema B não escreve sai do elemento', async () => {
            await withScene('troca-de-tema', undefined, mode, 'desk', async (page) => {
                const inlineValue = (name: string): Promise<string> => page.evaluate(({ prop, embedded }) => {
                    const holder = embedded ? document.querySelector<HTMLElement>('.sarak-scope') : document.documentElement;
                    return holder?.style.getPropertyValue(prop) ?? 'sem-elemento';
                }, { prop: name, embedded: mode === 'embarcado' });

                expect(await inlineValue('--sarak-card-radius-tl'), 'tema A: o canto escalar está inline').toBe('3px');
                await page.locator('[data-probe="trocar"]').click();
                await expect(card(page)).toHaveCSS('border-bottom-right-radius', `${CARD_MASTER.desk}px`);
                expect(await inlineValue('--sarak-card-radius-tl'), 'tema B: o canto do A não fica inline').toBe('');
                expect(await inlineValue('--sarak-card-radius-br'), 'tema B: o canto que o mestre do A escreveu não fica inline').toBe('');
                expect(await inlineValue('--sarak-card-border-radius'), 'tema B: o mestre é responsivo, fora do inline').toBe('');
            });
        });

        test('trocar para um tema sem imagem de fundo tira a arte do tema anterior (as duas variáveis e o atributo de mídia)', async () => {
            const page = await browser.newPage({ viewport: { width: WIDTHS.desk, height: 900 } });
            try {
                const search = new URLSearchParams({ cena: 'troca-de-tema', imagem: '1' });
                if (mode === 'embarcado') search.set('modo', 'embarcado');
                await page.goto(`${harnessUrl}?${search.toString()}`);
                await page.locator('[data-probe="cartao-puro"] .sarak-card').waitFor();
                const read = (): Promise<{ bg: string; url: string; media: string | null }> => page.evaluate((embedded) => {
                    const holder = embedded ? document.querySelector<HTMLElement>('.sarak-scope') : document.documentElement;
                    const mediaHolder = embedded ? holder : document.body;
                    return {
                        bg: holder?.style.getPropertyValue('--sarak-global-bg-image') ?? 'sem-elemento',
                        url: holder?.style.getPropertyValue('--sarak-global-background-image-url') ?? 'sem-elemento',
                        media: mediaHolder?.getAttribute('data-sarak-has-media') ?? null,
                    };
                }, mode === 'embarcado');

                const before = await read();
                expect(before.bg, 'tema A: a imagem está na variável').toContain('arte-do-tema-a.png');
                expect(before.url, 'tema A: a imagem está na variável de URL').toContain('arte-do-tema-a.png');
                expect(before.media, 'tema A: o atributo de mídia está ligado').toBe('true');

                await page.locator('[data-probe="trocar"]').click();
                await expect(card(page)).toHaveCSS('border-bottom-right-radius', `${CARD_MASTER.desk}px`);
                expect(await read(), 'tema B (sem imagem): nada da arte do A fica no elemento').toEqual({ bg: '', url: '', media: null });
            } finally {
                await page.close();
            }
        });
    });
}
