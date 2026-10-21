/**
 * Medição, em navegador real, dos tokens que a `plan-113` ligou a um leitor: cartão (cabeçalho,
 * rodapé, hover, botão de ação, busca), campos e sobreposições (padding, tooltip, véu e superfície
 * do modal, tabela), status, marca, atmosfera (camada 2 do fundo, suavização, grão animado) e o
 * movimento unificado. O `jsdom` não calcula cascata, `color-mix` nem `::before`, então só se mede aqui.
 *
 * Mesmo harness e mesmo artefato de `token-que-desenha.spec.ts` (`dist/index.js` + `dist/sarak.css`):
 * a cena `?cena=schema` é a mesma nos dois lados e o recorte `?tema=schema-*` (ver `TOKEN_VARIANTS` em
 * `fixtures/harness-entry.tsx`) é o que muda. Padrão e alterado são lidos na mesma propriedade.
 *
 * -------------------------------------------------------------------------
 * LIMITES DECLARADOS (R18) — o que esta medição NÃO vê
 * -------------------------------------------------------------------------
 * 1. Só valores COMPUTADOS de propriedades nomeadas; nenhum pixel.
 * 2. Só Chromium headless e só os recortes nomeados em `TOKEN_VARIANTS`.
 * 3. Lê o `dist/` — sem `npm run build` recente, mede o build anterior.
 * 4. O `-webkit-font-smoothing` só tem efeito visual no macOS; aqui se lê o valor declarado.
 * 5. A camada 2 do fundo é provada pela DIFERENÇA do `background-image` entre padrão e alterado,
 *    não pela cor da terceira mancha.
 * 6. As saídas animadas por JavaScript (curva `motionEaseIn` do modal) são provadas em unidade
 *    (`useMotionTokens`), não aqui.
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

async function withScene<T>(cena: string | undefined, tema: string | undefined, measure: (page: Page) => Promise<T>): Promise<T> {
    const page = await browser.newPage({ viewport: DESKTOP });
    const searchParams = new URLSearchParams();
    if (cena) searchParams.set('cena', cena);
    if (tema) searchParams.set('tema', tema);
    try {
        await page.goto(`${harnessUrl}?${searchParams.toString()}`);
        await page.waitForFunction(() => document.body.hasAttribute('data-sx-texture'));
        // As transições da hidratação (fundo, cor, entrada dos cartões) terminam antes de medir o hover: com a espera fixa depois do
        // ponteiro, medir no meio delas lê o estado de repouso.
        await page.evaluate(() => Promise.all(document.getAnimations().filter((animation) => animation instanceof CSSTransition).map((animation) => animation.finished.catch(() => undefined))));
        return await measure(page);
    } finally {
        await page.close();
    }
}

const computed = (target: Locator, property: string, pseudo?: string): Promise<string> =>
    target.evaluate((el, { prop, pseudoElement }) => getComputedStyle(el, pseudoElement ?? null).getPropertyValue(prop), {
        prop: property,
        pseudoElement: pseudo,
    });

const probe = (page: Page, name: string): Locator => page.locator(`[data-probe="${name}"]`);

const RED = 'rgb(255, 0, 0)';
const GREEN = 'rgb(0, 255, 0)';
const BLUE = 'rgb(0, 0, 255)';

/** Mede a cena `schema` no padrão e no recorte, com a mesma função, e devolve os dois valores. */
async function padraoEAlterado<T>(tema: string, measure: (page: Page) => Promise<T>): Promise<{ padrao: T; alterado: T }> {
    const padrao = await withScene('schema', undefined, measure);
    const alterado = await withScene('schema', tema, measure);
    return { padrao, alterado };
}

// ── cartão ────────────────────────────────────────────────────────────────────────────────────────

test.describe('cartão: cabeçalho e rodapé', () => {
    test('cardHeaderBg, cardHeaderBorder e cardHeaderPadding', async () => {
        const measure = async (page: Page) => {
            const header = probe(page, 'cartao').locator('header');
            return {
                bg: await computed(header, 'background-color'),
                shadow: await computed(header, 'box-shadow'),
                padding: await computed(header, 'padding-top'),
            };
        };
        const { padrao, alterado } = await padraoEAlterado('schema-cartao', measure);
        // O harness roda `sarak-sovereign`, que declara estes tokens: o "padrão" é o dele, não o do schema.
        expect(padrao.bg).not.toBe(RED);
        expect(alterado.bg).toBe(RED);
        expect(alterado.shadow).toContain(GREEN);
        expect(alterado.padding).toBe('20px');
    });

    test('cardFooterBg e cardFooterBorder', async () => {
        const measure = async (page: Page) => {
            const footer = probe(page, 'cartao').locator('footer');
            return { bg: await computed(footer, 'background-color'), shadow: await computed(footer, 'box-shadow') };
        };
        const { padrao, alterado } = await padraoEAlterado('schema-cartao', measure);
        expect(padrao.bg).not.toBe(BLUE);
        expect(alterado.bg).toBe(BLUE);
        expect(alterado.shadow).toContain('rgb(255, 255, 0)');
    });
});

test.describe('cartão: hover — só o cartão interativo se move ou brilha', () => {
    /** O `transform` computado do cartão (da sonda indicada) depois de o ponteiro pousar nele. */
    const hoverTransform = (probeName: string) => async (page: Page): Promise<string> => {
        const card = probe(page, probeName).locator('.sarak-card');
        await card.hover();
        await page.waitForTimeout(700);
        return computed(card, 'transform');
    };

    test('cardHoverTranslate: o cartão interativo sobe o que o token manda', async () => {
        // O padrão do tema padrão é `glow-only` (o cartão não se move): o caso mede o deslocamento no `lift`, com o padrão do token e com -10.
        const padrao = await withScene('schema', 'schema-hover-lift', hoverTransform('cartao-interativo'));
        const alterado = await withScene('schema', 'schema-cartao', hoverTransform('cartao-interativo'));
        expect(padrao).toMatch(/^matrix\(1, 0, 0, 1, 0, -?\d+(\.\d+)?\)$/);
        expect(padrao).not.toBe('matrix(1, 0, 0, 1, 0, -10)');
        expect(alterado).toBe('matrix(1, 0, 0, 1, 0, -10)');
    });

    test('o cartão contêiner (SarakCard sem interactive) não se move, em lift, expand nem glow-only', async () => {
        for (const tema of [undefined, 'schema-cartao', 'schema-hover-expand', 'schema-hover-brilho']) {
            expect(await withScene('schema', tema, hoverTransform('cartao'))).toBe('none');
        }
    });

    test('cardHoverStyle expand: o cartão interativo cresce; glow-only: não se move', async () => {
        const expand = await withScene('schema', 'schema-hover-expand', hoverTransform('cartao-interativo'));
        expect(expand).toBe('matrix(1.02, 0, 0, 1.02, 0, 0)');
        const glowOnly = await withScene('schema', 'schema-hover-brilho', hoverTransform('cartao-interativo'));
        expect(glowOnly).toBe('none');
    });

    test('cardHoverGlowIncrease: o brilho do cartão interativo sobe no hover; o do contêiner não', async () => {
        const glow = (probeName: string) => async (page: Page): Promise<number> => {
            const card = probe(page, probeName).locator('.sarak-card');
            await card.hover();
            await page.waitForTimeout(700);
            return Number(await computed(card, 'opacity', '::before'));
        };
        // Intensidade base do tema padrão (`cardGlowIntensity` 0,25) + o aumento do token (0,5), em `lift`.
        expect(await withScene('schema', 'schema-cartao', glow('cartao-interativo'))).toBeCloseTo(0.75, 1);
        // O contêiner fica na intensidade base: o aumento de hover não o alcança.
        expect(await withScene('schema', 'schema-cartao', glow('cartao'))).toBeCloseTo(0.25, 1);
    });
});

test.describe('cartão: botão de ação e busca', () => {
    test('cardActionBtn*: fundo, texto, raio e padding do botão do SarakActionCard', async () => {
        const measure = async (page: Page) => {
            const button = probe(page, 'acao').locator('button.sarak-card-action-btn').first();
            return {
                bg: await computed(button, 'background-color'),
                color: await computed(button, 'color'),
                radius: await computed(button, 'border-top-left-radius'),
                padding: await computed(button, 'padding-top'),
            };
        };
        const { padrao, alterado } = await padraoEAlterado('schema-cartao', measure);
        // `sarak-sovereign` declara raio e padding do botão: o padrão da cena é o do tema.
        expect(padrao.padding).not.toBe('24px');
        expect(alterado.bg).toBe(RED);
        expect(alterado.color).toBe(GREEN);
        expect(alterado.radius).toBe('20px');
        expect(alterado.padding).toBe('24px');
    });

    test('cardSearch*: fundo e texto focados e placeholder só dentro do cartão de busca', async () => {
        const measure = async (page: Page) => {
            const input = probe(page, 'busca-cartao').locator('input[placeholder^="Buscar"]');
            await input.focus();
            // O campo transiciona (`transition-all`): lê só depois de a transição assentar.
            await page.waitForTimeout(500);
            const inside = {
                bg: await computed(input, 'background-color'),
                color: await computed(input, 'color'),
                placeholder: await computed(input, 'color', '::placeholder'),
            };
            const outside = probe(page, 'campo-fora').locator('input');
            await outside.focus();
            await page.waitForTimeout(500);
            return { inside, outsideBg: await computed(outside, 'background-color') };
        };
        const { alterado } = await padraoEAlterado('schema-cartao', measure);
        expect(alterado.inside.bg).toBe(RED);
        expect(alterado.inside.color).toBe(GREEN);
        expect(alterado.inside.placeholder).toBe(BLUE);
        expect(alterado.outsideBg).not.toBe(RED);
    });
});

// ── campos, sobreposições, tabela e status ───────────────────────────────────────────────────────

test.describe('campos e sobreposições', () => {
    test('inputPadding: o padding vertical do campo', async () => {
        const measure = (page: Page) => computed(probe(page, 'campo-fora').locator('input'), 'padding-top');
        const { padrao, alterado } = await padraoEAlterado('schema-campos', measure);
        expect(padrao).toBe('16px');
        expect(alterado).toBe('24px');
    });

    test('tooltipRadius: o raio do tooltip', async () => {
        const measure = async (page: Page) => {
            await probe(page, 'tooltip').locator('button').focus();
            const tip = page.getByRole('tooltip');
            await tip.waitFor();
            return computed(tip, 'border-top-left-radius');
        };
        const { padrao, alterado } = await padraoEAlterado('schema-campos', measure);
        expect(padrao).not.toBe('12px');
        expect(alterado).toBe('12px');
    });

    test('modalOverlayBlur e colorBgModal: o véu desfoca e o painel tem a superfície do token', async () => {
        const measure = async (page: Page) => {
            const dialog = page.getByRole('dialog');
            const veil = dialog.locator('xpath=preceding-sibling::div[1]');
            return { blur: await computed(veil, 'backdrop-filter'), bg: await computed(dialog, 'background-color') };
        };
        const padrao = await withScene('schema-modal', undefined, measure);
        const alterado = await withScene('schema-modal', 'schema-campos', measure);
        expect(padrao.blur).not.toContain('blur(20px)');
        expect(alterado.blur).toContain('blur(20px)');
        expect(alterado.bg).toBe(RED);
    });

    test('tableZebraStriping e tableBorderRadius', async () => {
        const measure = async (page: Page) => {
            const table = probe(page, 'tabela');
            return {
                zebra: await computed(table.locator('tbody tr').nth(1), 'background-color'),
                radius: await computed(table.locator('.card').first(), 'border-top-left-radius'),
            };
        };
        const { padrao, alterado } = await padraoEAlterado('schema-campos', measure);
        expect(padrao.zebra).toBe('rgba(0, 0, 0, 0)');
        expect(alterado.zebra).not.toBe('rgba(0, 0, 0, 0)');
        expect(padrao.radius).toBe('14px');
        expect(alterado.radius).toBe('0px');
    });

    test('statusGlowBlur: o brilho do badge de status', async () => {
        const measure = (page: Page) => computed(probe(page, 'badge').locator('span').first(), 'box-shadow');
        const { padrao, alterado } = await padraoEAlterado('schema-campos', measure);
        expect(padrao).not.toMatch(/ 12px /);
        expect(alterado).toMatch(/ 12px /);
    });
});

test.describe('tokens que o componente ignorava', () => {
    test('tooltipBg, tooltipTextColor e tooltipBorderColor chegam à caixa do tooltip', async () => {
        const measure = async (page: Page) => {
            await probe(page, 'tooltip').locator('button').focus();
            const tip = page.getByRole('tooltip');
            await tip.waitFor();
            await page.waitForTimeout(400);
            return {
                bg: await computed(tip, 'background-color'),
                color: await computed(tip, 'color'),
                border: await computed(tip, 'border-top-color'),
            };
        };
        const alterado = await withScene('schema', 'schema-tokens-cor', measure);
        expect(alterado).toEqual({ bg: RED, color: GREEN, border: BLUE });
    });

    test('modalOverlayColor pinta o véu do modal', async () => {
        const measure = (page: Page) => computed(page.getByRole('dialog').locator('xpath=preceding-sibling::div[1]'), 'background-color');
        const padrao = await withScene('schema-modal', undefined, measure);
        const alterado = await withScene('schema-modal', 'schema-tokens-cor', measure);
        expect(alterado).toBe('rgba(255, 0, 0, 0.5)');
        expect(padrao).not.toBe(alterado);
    });

    test('borderStyle vale no cartão (a moldura sólida e o escopo de design não fixam "solid")', async () => {
        const measure = (page: Page) => computed(probe(page, 'cartao').locator('.sarak-card'), 'border-top-style');
        expect(await withScene('schema', 'borda-tracejada', measure)).toBe('dashed');
        expect(await withScene('schema', undefined, measure)).toBe('solid');
    });
});

test.describe('marca do cromo', () => {
    test('identity*: peso, espaçamento e família do nome da marca', async () => {
        const measure = async (page: Page) => {
            const name = page.getByText('Harness', { exact: true }).first();
            return {
                weight: await computed(name, 'font-weight'),
                tracking: await computed(name, 'letter-spacing'),
                family: await computed(name, 'font-family'),
            };
        };
        const padrao = await withScene(undefined, undefined, measure);
        const alterado = await withScene(undefined, 'schema-campos', measure);
        expect(padrao.weight).toBe('800');
        expect(alterado.weight).toBe('300');
        expect(alterado.tracking).not.toBe(padrao.tracking);
        expect(alterado.family).toContain('Georgia');
    });
});

test.describe('botão fantasma', () => {
    test('btnGhostHoverBg: o fundo do botão ghost no hover', async () => {
        const measure = async (page: Page) => {
            const button = probe(page, 'ghost').locator('button');
            await button.hover();
            await page.waitForTimeout(400);
            return computed(button, 'background-color');
        };
        const padrao = await withScene('schema', undefined, measure);
        expect(padrao).not.toBe('rgba(0, 0, 0, 0)');
    });
});

// ── atmosfera e movimento ────────────────────────────────────────────────────────────────────────

test.describe('atmosfera', () => {
    test('colorBgLayer2: a terceira mancha da malha muda com a camada 2', async () => {
        const measure = (page: Page) => computed(page.locator('body'), 'background-image');
        const padrao = await withScene('schema', 'fundo-mesh', measure);
        const alterado = await withScene('schema', 'schema-atmosfera', measure);
        expect(alterado).not.toBe(padrao);
    });

    test('textSmoothing: ligado antialiased, desligado auto', async () => {
        const measure = (page: Page) => computed(page.locator('body'), '-webkit-font-smoothing');
        expect(await withScene('schema', undefined, measure)).toBe('antialiased');
        expect(await withScene('schema', 'schema-sem-suavizacao', measure)).toBe('auto');
    });

    test('bgNoiseAnimation: o grão fica parado no padrão e anima no valor dado', async () => {
        const measure = async (page: Page) => {
            const target = page.locator('[data-sx-texture="noise"]').first();
            return { name: await computed(target, 'animation-name', '::before'), duration: await computed(target, 'animation-duration', '::before') };
        };
        const alterado = await withScene('schema', 'schema-ruido', measure);
        expect(alterado.name).toBe('sarak-noise-shift');
        expect(alterado.duration).toBe('2s');
    });

    test('bgNoiseAnimation: movimento reduzido para o grão', async () => {
        const page = await browser.newPage({ viewport: DESKTOP, reducedMotion: 'reduce' });
        try {
            await page.goto(`${harnessUrl}?cena=schema&tema=schema-ruido`);
            await page.waitForFunction(() => document.body.hasAttribute('data-sx-texture'));
            const target = page.locator('[data-sx-texture="noise"]').first();
            expect(await computed(target, 'animation-duration', '::before')).toBe('1e-05s');
        } finally {
            await page.close();
        }
    });
});

test.describe('movimento unificado', () => {
    test('motionDurationNormal chega ao corpo da página (antes a variável era inválida e a duração caía a 0s)', async () => {
        const measure = (page: Page) => computed(page.locator('body'), 'transition-duration');
        const padrao = await withScene('schema', undefined, measure);
        const alterado = await withScene('schema', 'schema-movimento', measure);
        expect(padrao).toContain('0.3s');
        expect(alterado).toContain('0.7s');
    });

    test('motionDurationInstant: o aperto do botão dura o que o token manda', async () => {
        const measure = async (page: Page) => {
            const button = probe(page, 'ghost').locator('button');
            await button.hover();
            await page.mouse.down();
            const value = await computed(button, 'transition-duration');
            await page.mouse.up();
            return value;
        };
        const padrao = await withScene('schema', undefined, measure);
        const alterado = await withScene('schema', 'schema-movimento', measure);
        expect(padrao).not.toContain('0.2s');
        expect(alterado).toContain('0.2s');
    });
});
