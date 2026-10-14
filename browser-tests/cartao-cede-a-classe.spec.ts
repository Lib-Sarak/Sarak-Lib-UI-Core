/**
 * O material e a moldura escolhidos por atributo, a caixa do cartão (preenchimento, sombra, recorte,
 * posição) e o aperto do botão são PADRÃO: a classe utilitária e o `style` do componente vencem; sem
 * classe, o token vale. E o `bg-theme-card` é só a utilitária de cor — não traz padding, sombra nem raio.
 * O `jsdom` não resolve cascata de stylesheet nem camadas (specs/specs/11-testes-e-cobertura.md §7).
 *
 * Mesmo harness e mesmo artefato do `cromo-css-real.spec.ts` (`dist/index.js` + `dist/sarak.css`), cena
 * `?cena=cartao-cede`. Cada caso traz a CONTRAPROVA do padrão (o mesmo elemento sem a classe) e roda nos
 * dois modos de injeção, App e Embarcado — o que muda é onde as variáveis do tema moram.
 *
 * -------------------------------------------------------------------------
 * LIMITES DECLARADOS (R18) — o que esta medição NÃO vê
 * -------------------------------------------------------------------------
 * 1. Só valores COMPUTADOS de propriedades nomeadas num `.sarak-card` nativo, num `<div>` com
 *    `bg-theme-card` e em dois `<button>` nativos; nenhum componente da lib e nenhum pixel.
 * 2. Só as utilitárias que o `dist/sarak.css` já emite (`bg-gradient-to-r`, `backdrop-blur-sm`,
 *    `border-dashed`, `p-8`, `p-0`, `shadow-none`, `absolute`): o `@source` do build varre `src/`, não a
 *    fixture. O recorte geométrico não tem utilitária emitida, então só se prova o token que o liga, e a camada
 *    em que a regra mora (varredura da CSSOM) — não uma classe que o vença.
 * 3. O aperto é medido com o ponteiro pressionado sobre o botão (`:active`), não com toque.
 * 4. Lê o `dist/` — sem `npm run build` recente, mede o build anterior.
 * -------------------------------------------------------------------------
 */
import { test, expect, chromium, type Browser, type Locator, type Page } from '@playwright/test';

const DESKTOP = { width: 1280, height: 900 } as const;

/** Folga para a transição do aperto assentar: bem acima da duração rápida padrão (0,2 s). */
const PRESS_SETTLE_MS = 500;

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
const MODES: Mode[] = ['app', 'embarcado'];

async function withScene(theme: string | undefined, mode: Mode, measure: (page: Page) => Promise<void>): Promise<void> {
    const page = await browser.newPage({ viewport: DESKTOP });
    try {
        const searchParams = new URLSearchParams({ cena: 'cartao-cede' });
        if (theme) searchParams.set('tema', theme);
        if (mode === 'embarcado') searchParams.set('modo', 'embarcado');
        await page.goto(`${harnessUrl}?${searchParams.toString()}`);
        await page.locator('[data-probe="cartao-puro"] .sarak-card').waitFor();
        await measure(page);
    } finally {
        await page.close();
    }
}

const probe = (page: Page, name: string): Locator => page.locator(`[data-probe="${name}"] > *`);
const computed = (target: Locator, property: string): Promise<string> =>
    target.evaluate((el, prop) => getComputedStyle(el).getPropertyValue(prop), property);

for (const mode of MODES) {
    test.describe(`modo ${mode}`, () => {
        test('material: o gradiente e o desfoque da classe vencem o do material; sem classe, o material vale', async () => {
            await withScene('material-frosted', mode, async (page) => {
                const plain = probe(page, 'cartao-puro');
                expect(await computed(plain, 'background-image'), 'CONTRAPROVA: sem classe, o gradiente do material').toContain('135deg');
                expect(await computed(plain, 'backdrop-filter'), 'CONTRAPROVA: sem classe, o desfoque do material').toContain('saturate(');

                const gradient = await computed(probe(page, 'cartao-gradiente'), 'background-image');
                expect(gradient, 'o gradiente da classe, não o do material').toContain('to right');
                expect(gradient).not.toContain('135deg');

                const blur = await computed(probe(page, 'cartao-desfoque'), 'backdrop-filter');
                expect(blur, 'o desfoque da classe (8px), não o do material (24px + saturação)').toBe('blur(8px)');
            });
        });

        test('moldura: border-dashed vence a moldura dupla; sem classe, a moldura vale', async () => {
            await withScene('moldura-dupla', mode, async (page) => {
                expect(await computed(probe(page, 'cartao-puro'), 'border-top-style'), 'CONTRAPROVA: a moldura dupla').toBe('double');
                expect(await computed(probe(page, 'cartao-moldura'), 'border-top-style'), 'a classe, não a moldura').toBe('dashed');
            });
        });

        test('caixa: p-8, p-0 e shadow-none vencem o padrão do cartão; sem classe, o token vale', async () => {
            await withScene(undefined, mode, async (page) => {
                const plainPadding = await computed(probe(page, 'cartao-puro'), 'padding-top');
                expect(plainPadding, 'CONTRAPROVA: o padrão do cartão é o token, não zero').not.toBe('0px');
                const reference = await computed(probe(page, 'referencia-p8'), 'padding-top');
                expect(reference, 'o p-8 fora do cartão (a escala de espaçamento do tema)').not.toBe('0px');
                expect(plainPadding, 'CONTRAPROVA: o padrão do cartão não é o do p-8').not.toBe(reference);
                expect(await computed(probe(page, 'cartao-preenchimento'), 'padding-top'), 'p-8 vence o padrão do cartão').toBe(reference);
                expect(await computed(probe(page, 'cartao-sem-preenchimento'), 'padding-top'), 'p-0').toBe('0px');

                const plainShadow = await computed(probe(page, 'cartao-puro'), 'box-shadow');
                const noShadow = await computed(probe(page, 'cartao-sem-sombra'), 'box-shadow');
                expect(plainShadow, 'CONTRAPROVA: o cartão tem sombra').not.toBe('none');
                expect(noShadow, 'shadow-none, não a sombra do cartão').not.toBe(plainShadow);
                expect(noShadow).toMatch(/0px 0px 0px 0px/);
            });
        });

        test('posição: a classe `absolute` vence o `relative` do cartão', async () => {
            await withScene(undefined, mode, async (page) => {
                expect(await computed(probe(page, 'cartao-puro'), 'position'), 'CONTRAPROVA').toBe('relative');
                expect(await computed(probe(page, 'cartao-posicao'), 'position')).toBe('absolute');
            });
        });

        test('bg-theme-card é só a cor: sem preenchimento, sombra, raio nem recorte do cartão', async () => {
            await withScene(undefined, mode, async (page) => {
                const colorOnly = probe(page, 'so-cor');
                expect(await computed(colorOnly, 'padding-top')).toBe('0px');
                expect(await computed(colorOnly, 'box-shadow')).toBe('none');
                expect(await computed(colorOnly, 'border-top-left-radius')).toBe('0px');
                expect(await computed(colorOnly, 'clip-path')).toBe('none');
                expect(await computed(colorOnly, 'background-color'), 'a cor do cartão do tema').not.toBe('rgba(0, 0, 0, 0)');
            });
        });

        test('aperto: o transform inline do botão vence o do estado ativo; sem inline, o padrão aperta', async () => {
            await withScene(undefined, mode, async (page) => {
                const press = async (name: string): Promise<string> => {
                    const target = probe(page, name);
                    await target.hover();
                    await page.mouse.down();
                    // O botão sem estilo anima o aperto na duração rápida do tema: lê o valor assentado, não o do meio da transição
                    // (uma leitura imediata dava 0.991 em vez de 0.98, conforme a carga da máquina).
                    await page.waitForTimeout(PRESS_SETTLE_MS);
                    try {
                        return await computed(target, 'transform');
                    } finally {
                        await page.mouse.up();
                    }
                };
                const free = await press('botao-livre');
                expect(free, 'CONTRAPROVA: o botão sem estilo aperta (escala 0.98)').toMatch(/^matrix\(0\.98/);
                const inline = await press('botao-inline');
                expect(inline, 'o transform inline (escala 0.5), não o aperto').toMatch(/^matrix\(0\.5/);
            });
        });
    });
}

test('o recorte geométrico do cartão vem do token e mora na camada que cede à classe', async () => {
    await withScene('recorte-geometrico', 'app', async (page) => {
        const clip = await computed(probe(page, 'cartao-puro'), 'clip-path');
        expect(clip, 'cardGeometricCut = 20 vira um polígono').toContain('polygon(');
        const layers = await page.evaluate(() => {
            const found: string[] = [];
            const walk = (rules: CSSRuleList, trail: string[]): void => {
                for (const rule of Array.from(rules)) {
                    const grouping = rule as CSSGroupingRule & { name?: string };
                    if (rule instanceof CSSStyleRule) {
                        const declaresClip = rule.style.getPropertyValue('clip-path').includes('--sarak-card-clip-path');
                        if (declaresClip && /(^|,)\s*\.sarak-card\s*(,|$)/.test(rule.selectorText)) found.push(trail.join('.') || '(sem camada)');
                    } else if (grouping.cssRules) {
                        walk(grouping.cssRules, rule.constructor.name === 'CSSLayerBlockRule' ? [...trail, grouping.name ?? ''] : trail);
                    }
                }
            };
            for (const sheet of Array.from(document.styleSheets)) {
                try { walk(sheet.cssRules, []); } catch { /* folha de outra origem */ }
            }
            return found;
        });
        expect(layers.length, 'o recorte do cartão é declarado em alguma camada').toBeGreaterThan(0);
        for (const layer of layers) expect(layer, 'a regra do recorte mora na subcamada que cede à classe').toMatch(/sarak-elements/);
    });
});

test('o CSS publicado não carrega mais a regra morta de data-tabular-nums', async () => {
    await withScene(undefined, 'app', async (page) => {
        const survivors = await page.evaluate(() => {
            const found: string[] = [];
            const walk = (rules: CSSRuleList): void => {
                for (const rule of Array.from(rules)) {
                    if (rule instanceof CSSStyleRule && rule.selectorText.includes('data-tabular-nums')) found.push(rule.selectorText);
                    const grouping = rule as CSSGroupingRule;
                    if (grouping.cssRules) walk(grouping.cssRules);
                }
            };
            for (const sheet of Array.from(document.styleSheets)) {
                try { walk(sheet.cssRules); } catch { /* folha de outra origem */ }
            }
            return found;
        });
        expect(survivors).toEqual([]);
    });
});
