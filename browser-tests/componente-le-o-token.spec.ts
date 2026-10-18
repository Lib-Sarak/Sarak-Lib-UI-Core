/**
 * O componente lê o token que o nomeia. Medição, em navegador real, de que o botão primário e o secundário
 * desenham `btnPrimaryBg`/`btnPrimaryText`/`btnSecondaryBg`, de que `cardShadow` é a sombra do cartão, de que
 * `bg-*` e `hover:bg-*` do componente vencem a superfície do tema, de que `cardSurfaceOpacity` age só no fundo,
 * de que `glow-only` acende o brilho, de que a tabela lê as três cores dela, de que a duração de transição de um
 * átomo é `motionDuration*` e de que o raio do botão do modal é `btnBorderRadius`. O `jsdom` não resolve a
 * cascata nem as camadas (specs/specs/11-testes-e-cobertura.md §7).
 *
 * Mesmo harness e mesmo artefato do `cromo-css-real.spec.ts` (`dist/index.js` + `dist/sarak.css`), cena
 * `?cena=componente`. O padrão de cada caso é o que a cena aplica; o recorte `?tema=componente-*` é o que
 * muda, e cada caso traz a CONTRAPROVA do padrão.
 *
 * -------------------------------------------------------------------------
 * LIMITES DECLARADOS (R18) — o que esta medição NÃO vê
 * -------------------------------------------------------------------------
 * 1. Só valores COMPUTADOS de propriedades nomeadas; nenhum pixel e nenhuma sobreposição visual.
 * 2. Só Chromium headless e os recortes `componente-*`; o tema default é a contraprova.
 * 3. Não mede a sobreposição do `SarakAnalyticalPage`/`SarakSpotlight`, o `AuthForm` nem o polegar do
 *    `PremiumSwitch`: nenhum é montado pela cena. Esses leem a classe com a variável (texto dos fontes e
 *    `componenteQueLeOToken.test.tsx`), que é a mesma ponte que o botão e o cartão provam aqui.
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

async function withScene<T>(cena: string, tema: string | undefined, measure: (page: Page) => Promise<T>): Promise<T> {
    const page = await browser.newPage({ viewport: DESKTOP });
    try {
        const searchParams = new URLSearchParams({ cena });
        if (tema) searchParams.set('tema', tema);
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

const probe = (page: Page, name: string): Locator => page.locator(`[data-probe="${name}"]`);

async function readComputed(target: Locator, property: string): Promise<string> {
    return target.evaluate((el, prop) => getComputedStyle(el).getPropertyValue(prop), property);
}

/** O que a expressão produz quando nada disputa a propriedade: um `<i>` irmão com ela em estilo inline. */
async function resolveExpression(target: Locator, property: string, expression: string): Promise<string> {
    return target.evaluate((el, { property, expression }) => {
        const probeElement = document.createElement('i');
        probeElement.style.setProperty(property, expression);
        (el.parentElement ?? document.body).appendChild(probeElement);
        const value = getComputedStyle(probeElement).getPropertyValue(property);
        probeElement.remove();
        return value;
    }, { property, expression });
}

const CARD_SURFACE = 'color-mix(in srgb, var(--sarak-card-bg, #0f172a), transparent calc(100% * (1 - var(--sarak-card-opacity, 0.8))))';

test.describe('botão', () => {
    test('o primário desenha btnPrimaryBg e btnPrimaryText', async () => {
        await withScene('componente', 'componente-botao', async (page) => {
            const button = probe(page, 'botao-primario').getByRole('button');

            await expect(button).toHaveCSS('background-color', 'rgb(255, 0, 0)');
            await expect(button).toHaveCSS('color', 'rgb(0, 255, 0)');
        });
    });

    test('CONTRAPROVA: sem recorte, o texto do primário é o do token, e não o texto mudo', async () => {
        await withScene('componente', undefined, async (page) => {
            const button = probe(page, 'botao-primario').getByRole('button');
            const tokenText = await resolveExpression(button, 'color', 'var(--sarak-btn-primary-text, #000000)');
            const mutedText = await resolveExpression(button, 'color', 'var(--text-muted, rgba(255,255,255,0.4))');
            expect(tokenText, 'o texto do token precisa diferir do texto mudo, ou o caso não distingue nada').not.toBe(mutedText);

            await expect(button).toHaveCSS('color', tokenText);
        });
    });

    test('o secundário desenha btnSecondaryBg', async () => {
        await withScene('componente', 'componente-botao', async (page) => {
            await expect(probe(page, 'botao-secundario').getByRole('button')).toHaveCSS('background-color', 'rgb(0, 0, 255)');
        });
    });

    test('o secundário sob o estilo neon (fundo por style) desenha btnSecondaryBg', async () => {
        await withScene('componente', 'componente-botao-neon', async (page) => {
            await expect(probe(page, 'botao-secundario').getByRole('button')).toHaveCSS('background-color', 'rgb(0, 0, 255)');
        });
    });
});

test.describe('cartão', () => {
    test('cardShadow declarada é a sombra do cartão', async () => {
        await withScene('componente', 'componente-sombra', async (page) => {
            const shadow = await readComputed(probe(page, 'cartao-puro').locator('.sarak-card'), 'box-shadow');

            expect(shadow).toContain('rgb(255, 0, 0) 10px 10px 0px 0px');
        });
    });

    test('CONTRAPROVA: sem cardShadow, a sombra é a composta pelos tokens cardShadow*', async () => {
        await withScene('componente', undefined, async (page) => {
            const card = probe(page, 'cartao-puro').locator('.sarak-card');
            const shadow = await readComputed(card, 'box-shadow');

            expect(shadow).not.toContain('rgb(255, 0, 0) 10px 10px 0px 0px');
            expect(shadow).not.toBe('none');
        });
    });

    test('bg-* do componente vence a superfície do tema (cartão e contêiner)', async () => {
        await withScene('componente', undefined, async (page) => {
            const withClass = probe(page, 'cartao-classe-fundo').locator('.sarak-card');
            const container = probe(page, 'conteiner-classe-fundo').locator('.card');
            const fromClass = await resolveExpression(withClass, 'background-color', 'var(--color-theme-card, #101622)');
            const surface = await resolveExpression(withClass, 'background-color', CARD_SURFACE);
            expect(fromClass, 'o fundo da classe precisa diferir da superfície do tema, ou o caso não distingue nada').not.toBe(surface);

            await expect(withClass).toHaveCSS('background-color', fromClass);
            await expect(container).toHaveCSS('background-color', fromClass);
        });
    });

    test('CONTRAPROVA: sem classe de fundo, o cartão computa a superfície do tema', async () => {
        await withScene('componente', undefined, async (page) => {
            const card = probe(page, 'cartao-puro').locator('.sarak-card');
            const surface = await resolveExpression(card, 'background-color', CARD_SURFACE);

            await expect(card).toHaveCSS('background-color', surface);
        });
    });

    test('hover:bg-* do componente vence a superfície do tema no hover', async () => {
        await withScene('componente', undefined, async (page) => {
            const card = probe(page, 'cartao-classe-hover').locator('.sarak-card');
            const hover = await resolveExpression(card, 'background-color', 'var(--sarak-btn-primary-bg, #19e3f0)');
            expect(hover, 'o fundo do hover precisa diferir do repouso, ou o caso não distingue nada').not.toBe(await readComputed(card, 'background-color'));

            await card.hover();
            await expect(card).toHaveCSS('background-color', hover);
        });
    });

    test('hover:border-* do componente vence a borda de hover do cartão', async () => {
        await withScene('componente', undefined, async (page) => {
            const card = probe(page, 'cartao-borda-hover').locator('.sarak-card');
            const fromClass = await resolveExpression(card, 'border-top-color', 'color-mix(in srgb, var(--sarak-primary-color, #19e3f0) 30%, transparent)');
            const themeHover = await resolveExpression(card, 'border-top-color', 'rgba(var(--theme-primary-rgb), 0.4)');
            expect(fromClass, 'a borda da classe precisa diferir da de hover do tema, ou o caso não distingue nada').not.toBe(themeHover);

            await card.hover();
            await expect(card).toHaveCSS('border-top-color', fromClass);
        });
    });

    test('CONTRAPROVA: sem classe de borda, o hover do cartão computa a borda de hover do tema', async () => {
        await withScene('componente', undefined, async (page) => {
            const card = probe(page, 'cartao-puro').locator('.sarak-card');
            const themeHover = await resolveExpression(card, 'border-top-color', 'rgba(var(--theme-primary-rgb), 0.4)');

            await card.hover();
            await expect(card).toHaveCSS('border-top-color', themeHover);
        });
    });

    test('cardSurfaceOpacity age só na superfície: o cartão fica opaco e o fundo translúcido', async () => {
        await withScene('componente', 'componente-superficie', async (page) => {
            const card = probe(page, 'cartao-puro').locator('.sarak-card');
            const surface = await resolveExpression(card, 'background-color', CARD_SURFACE);
            const solid = await resolveExpression(card, 'background-color', 'var(--sarak-card-bg)');
            expect(surface, 'a superfície precisa ter transparência, ou o caso não distingue nada').not.toBe(solid);

            await expect(card, 'a opacidade do cartão inteiro apagava o texto').toHaveCSS('opacity', '1');
            await expect(card).toHaveCSS('background-color', surface);
        });
    });

    test('CONTRAPROVA: com o padrão do tema, o cartão também é opaco (a opacidade nunca foi do cartão inteiro)', async () => {
        await withScene('componente', undefined, async (page) => {
            await expect(probe(page, 'cartao-puro').locator('.sarak-card')).toHaveCSS('opacity', '1');
        });
    });

    test('glow-only acende o brilho no hover do cartão interativo', async () => {
        const measure = async (page: Page) => {
            const card = probe(page, 'cartao-interativo').locator('.sarak-card');
            const rest = await readComputed(card, 'box-shadow');
            await card.hover();
            await page.waitForTimeout(900); // a camada de brilho transiciona em `--duration-slow` (0,6 s)
            return card.evaluate((el, restShadow) => ({
                glow: getComputedStyle(el, '::before').opacity,
                shadow: getComputedStyle(el).boxShadow,
                changed: getComputedStyle(el).boxShadow !== restShadow,
            }), rest);
        };
        const glowOnly = await withScene('componente', 'componente-brilho', measure);
        const lift = await withScene('componente', 'componente-lift', measure);

        expect(glowOnly.glow, 'glow-only leva a camada de brilho à opacidade plena').toBe('1');
        expect(glowOnly.changed, 'o cartão ganha o halo no hover').toBe(true);
        expect(lift.glow, 'CONTRAPROVA: lift sem intensidade de brilho não acende a camada').not.toBe('1');
    });
});

test.describe('tabela', () => {
    test('cabeçalho, linha em hover e divisória leem tableHeaderBg, tableRowHoverBg e tableBorderColor', async () => {
        await withScene('componente', 'componente-tabela', async (page) => {
            const table = probe(page, 'tabela');
            const row = table.locator('tbody tr').first();

            await expect(table.locator('thead tr').first()).toHaveCSS('background-color', 'rgb(1, 2, 3)');
            await expect(row).toHaveCSS('border-bottom-color', 'rgb(7, 8, 9)');
            await row.hover();
            await expect(row).toHaveCSS('background-color', 'rgb(4, 5, 6)');
        });
    });

    test('CONTRAPROVA: sem recorte, o cabeçalho computa o padrão do token', async () => {
        await withScene('componente', undefined, async (page) => {
            const header = probe(page, 'tabela').locator('thead tr').first();
            const tokenDefault = await resolveExpression(header, 'background-color', 'var(--sarak-table-header-bg, rgba(255, 255, 255, 0.03))');

            await expect(header).toHaveCSS('background-color', tokenDefault);
        });
    });
});

test.describe('movimento e modal', () => {
    test('a transição do alternador dura motionDurationNormal', async () => {
        const measure = async (page: Page) => readComputed(
            probe(page, 'alternador').locator('[class*="duration-[var(--duration-normal"]').first(),
            'transition-duration',
        );

        expect(await withScene('componente', 'componente-duracao', measure)).toBe('0.9s');
        expect(await withScene('componente', undefined, measure), 'CONTRAPROVA: o padrão do token').toBe('0.3s');
    });

    test('o botão de fechar do modal desenha o raio de btnBorderRadius, e não rounded-md', async () => {
        await withScene('schema-modal', undefined, async (page) => {
            const close = page.getByRole('dialog').getByRole('button').first();
            const fromToken = await resolveExpression(close, 'border-top-left-radius', 'var(--sarak-btn-radius-tl, var(--radius-btn))');
            const roundedMd = await resolveExpression(close, 'border-top-left-radius', '0.375rem');
            expect(fromToken, 'o raio do botão precisa diferir de rounded-md, ou o caso não distingue nada').not.toBe(roundedMd);

            await expect(close).toHaveCSS('border-top-left-radius', fromToken);
        });
    });
});
