/**
 * Medição, em navegador real, de defeitos de CSS que o `jsdom` não enxerga: ele não resolve cascata de
 * stylesheet, não valida valor de CSS e não calcula layout (specs/specs/11-testes-e-cobertura.md §7).
 *
 * Mesmo harness e mesmo artefato do `cromo-css-real.spec.ts` (`dist/index.js` + `dist/sarak.css`), com cenas
 * próprias escolhidas por `?cena=` (ver `fixtures/harness-entry.tsx`). Um caso por defeito, mais a contraprova
 * "NÃO MUDA NADA" de quem pode regredir junto com o conserto.
 *
 * Régua relacional: o elemento medido contra um `<i>` irmão que carrega a expressão pretendida em estilo inline
 * (vence qualquer camada e nenhum padrão de elemento mira `<i>`). Nenhum valor em px escrito à mão.
 *
 * -------------------------------------------------------------------------
 * LIMITES DECLARADOS (R18) — o que esta medição NÃO vê
 * -------------------------------------------------------------------------
 * 1. Só valores COMPUTADOS de propriedades nomeadas e caixas (`getBoundingClientRect`); nenhum pixel.
 * 2. Só Chromium headless, só os recortes de tema nomeados em `TOKEN_VARIANTS` da fixture.
 * 3. Lê o `dist/` — sem `npm run build` recente, mede o build anterior.
 * 4. A fixture é empacotada em IIFE: o `import()` do painel resolve no próprio bundle, sem ida à rede. Mede
 *    a remontagem do painel, não a latência de carregar o chunk.
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

/** Abre uma cena da fixture; `tema` escolhe um recorte de tokens nomeado (`TOKEN_VARIANTS`). */
async function openScene(cena: string, tema?: string): Promise<Page> {
    const page = await browser.newPage({ viewport: DESKTOP });
    const searchParams = new URLSearchParams({ cena });
    if (tema) searchParams.set('tema', tema);
    await page.goto(`${harnessUrl}?${searchParams.toString()}`);
    return page;
}

async function withScene(cena: string, tema: string | undefined, measure: (page: Page) => Promise<void>): Promise<void> {
    const page = await openScene(cena, tema);
    try {
        await measure(page);
    } finally {
        await page.close();
    }
}

async function readComputed(target: Locator, property: string): Promise<string> {
    return target.evaluate((el, prop) => getComputedStyle(el).getPropertyValue(prop), property);
}

/** O que a expressão produz quando nada disputa a propriedade: um `<i>` irmão com ela em estilo inline. */
async function resolveExpression(target: Locator, property: string, expression: string): Promise<string> {
    return target.evaluate((el, { property, expression }) => {
        const probe = document.createElement('i');
        probe.style.setProperty(property, expression);
        (el.parentElement ?? document.body).appendChild(probe);
        const value = getComputedStyle(probe).getPropertyValue(property);
        probe.remove();
        return value;
    }, { property, expression });
}

async function waitForTheme(page: Page): Promise<void> {
    await page.waitForFunction(() => document.body.hasAttribute('data-sx-texture'));
}

// ── Item 1 — seletor que casa pelo NOME da classe ────────────────────────────────────────────────

const CARD_SURFACE_EXPRESSION = 'color-mix(in srgb, var(--sarak-card-bg, #0f172a), transparent calc(100% * (1 - var(--sarak-card-opacity, 0.8))))';

test('item 1: sob textura, utilitária com "card" no nome mantém o fundo que a classe escreve', async () => {
    await withScene('textura', undefined, async (page) => {
        await waitForTheme(page);
        const probe = page.locator('[data-probe="utilitaria-com-card-no-nome"]');
        const classBackground = await resolveExpression(probe, 'background-color', 'var(--sarak-card-bg)');
        const cardSurface = await resolveExpression(probe, 'background-color', CARD_SURFACE_EXPRESSION);
        expect(classBackground, 'o fundo da classe precisa diferir da superfície de cartão, ou o caso não distingue nada').not.toBe(cardSurface);

        await expect(probe, 'bg-[var(--sarak-card-bg)] vence a superfície forçada por nome de classe').toHaveCSS('background-color', classBackground);
    });
});

test('NÃO MUDA NADA: sob a mesma textura, um cartão real da lib computa a superfície de cartão', async () => {
    await withScene('textura', undefined, async (page) => {
        await waitForTheme(page);
        const card = page.locator('.sarak-card').first();
        const cardSurface = await resolveExpression(card, 'background-color', CARD_SURFACE_EXPRESSION);
        expect(cardSurface, 'a superfície de cartão precisa ter transparência, ou não se distingue do fundo cheio').not.toBe(
            await resolveExpression(card, 'background-color', 'var(--sarak-card-bg)'),
        );

        await expect(card, 'o cartão da lib segue com a superfície de cartão sob textura').toHaveCSS('background-color', cardSurface);
    });
});

// ── Item 2 — custom property cíclica no `body` ───────────────────────────────────────────────────

test('item 2: sem SarakUIProvider, o botão computa um fundo de hover diferente do repouso', async () => {
    await withScene('sem-provider', undefined, async (page) => {
        const button = page.getByRole('button', { name: 'Prova hover sem Provider' });
        const rest = await readComputed(button, 'background-color');

        await button.hover();
        await expect(button, 'sem Provider, a reserva do hover precisa valer').not.toHaveCSS('background-color', rest);
    });
});

test('NÃO MUDA NADA: com Provider, o hover do botão continua sendo o do tema', async () => {
    const page = await browser.newPage({ viewport: DESKTOP });
    try {
        await page.goto(harnessUrl);
        const button = page.getByRole('button', { name: 'Prova hover sem classe' });
        const themeHover = await resolveExpression(button, 'background-color', 'var(--theme-primary-hover)');
        expect(themeHover, 'o hover do tema precisa diferir do repouso, ou o caso não distingue nada').not.toBe(await readComputed(button, 'background-color'));

        await button.hover();
        await expect(button).toHaveCSS('background-color', themeHover);
    } finally {
        await page.close();
    }
});

// ── Item 3 — o `body` não cede à classe utilitária ───────────────────────────────────────────────

/** `<i>` dentro do `body` (herda o corpo de texto dele), com a classe ou a expressão dada. */
async function resolveBodyLineHeight(page: Page, source: { className?: string; expression?: string }): Promise<string> {
    return page.evaluate(({ className, expression }) => {
        const probe = document.createElement('i');
        if (className) probe.className = className;
        if (expression) probe.style.lineHeight = expression;
        document.body.appendChild(probe);
        const value = getComputedStyle(probe).lineHeight;
        probe.remove();
        return value;
    }, source);
}

test('item 3: body com classe utilitária de entrelinha computa a entrelinha da classe', async () => {
    const page = await browser.newPage({ viewport: DESKTOP });
    try {
        await page.goto(harnessUrl);
        const classLineHeight = await resolveBodyLineHeight(page, { className: 'leading-none' });
        const tokenLineHeight = await resolveBodyLineHeight(page, { expression: 'var(--sarak-body-lh, 1.6)' });
        expect(classLineHeight, 'a entrelinha da classe precisa diferir da do token, ou o caso não distingue nada').not.toBe(tokenLineHeight);

        await page.evaluate(() => document.body.classList.add('leading-none'));
        expect(await page.evaluate(() => getComputedStyle(document.body).lineHeight), 'leading-none vence o padrão do body').toBe(classLineHeight);
    } finally {
        await page.close();
    }
});

test('NÃO MUDA NADA: body sem classe de entrelinha computa a entrelinha do token', async () => {
    const page = await browser.newPage({ viewport: DESKTOP });
    try {
        await page.goto(harnessUrl);
        const tokenLineHeight = await resolveBodyLineHeight(page, { expression: 'var(--sarak-body-lh, 1.6)' });

        expect(await page.evaluate(() => getComputedStyle(document.body).lineHeight), 'sem classe, vale o token --sarak-body-lh').toBe(tokenLineHeight);
    } finally {
        await page.close();
    }
});

// ── Item 4 — valor de CSS malformado em estilo inline ────────────────────────────────────────────

const THEME_BORDER_EXPRESSION = 'var(--color-theme-border, rgba(255,255,255,0.1))';
const THEME_CARD_EXPRESSION = 'var(--color-theme-card, rgba(255,255,255,0.1))';
const THEME_PRIMARY_EXPRESSION = 'var(--color-theme-primary, #3b82f6)';
const FROSTED_SHADOW_EXPRESSION = 'var(--sarak-dynamic-shadow, 0 4px 12px rgba(0,0,0,0.1))';

/**
 * Espera a transição do `box-shadow` (`transition: all`) assentar e devolve o valor computado: o
 * primeiro que não é `none`, casa com o padrão e se repete na leitura seguinte (o primeiro quadro
 * de uma transição é o início interpolado, não o destino), ou o último lido se o prazo vence.
 */
async function waitForShadow(target: Locator, pattern: RegExp): Promise<string> {
    let previous = '';
    let shadow = await readComputed(target, 'box-shadow');
    for (let attempt = 0; attempt < 30; attempt += 1) {
        if (shadow !== 'none' && pattern.test(shadow) && shadow === previous) break;
        previous = shadow;
        await target.page().waitForTimeout(100);
        shadow = await readComputed(target, 'box-shadow');
    }
    return shadow;
}

/** A cor da borda precisa vir do tema, e não do `currentColor` que o navegador usa sem declaração. */
async function expectBorderColorFromExpression(target: Locator, expression: string, message: string): Promise<void> {
    const expected = await resolveExpression(target, 'border-top-color', expression);
    expect(expected, 'a cor pretendida precisa diferir da cor do texto, ou o caso não distingue nada').not.toBe(await readComputed(target, 'color'));

    await expect(target, message).toHaveCSS('border-top-color', expected);
}

test('item 4: botão frosted computa a cor de borda do tema', async () => {
    await withScene('atomos', 'atomo-frosted', async (page) => {
        await expectBorderColorFromExpression(page.locator('[data-probe="botao"] button'), THEME_BORDER_EXPRESSION, 'useAtomicStyles.ts:58 — border do frosted');
    });
});

test('item 4: botão frosted primário computa a sombra pretendida, e não a inicial do navegador', async () => {
    await withScene('atomos', 'atomo-frosted', async (page) => {
        const button = page.locator('[data-probe="botao"] button');
        const expected = await resolveExpression(button, 'box-shadow', FROSTED_SHADOW_EXPRESSION);
        expect(expected, 'a sombra pretendida precisa existir, ou o caso não distingue nada').not.toBe('none');

        await expect(button, 'useAtomicStyles.ts:61 — boxShadow do frosted').toHaveCSS('box-shadow', expected);
    });
});

test('item 4: campo em foco computa uma sombra que carrega a cor primária', async () => {
    await withScene('atomos', undefined, async (page) => {
        const input = page.getByRole('textbox', { name: 'Campo de prova' });
        const primary = await resolveExpression(input, 'color', THEME_PRIMARY_EXPRESSION);

        await input.focus();
        const shadow = await waitForShadow(input, /./);
        expect(shadow, 'useAtomicStyles.ts:105 — boxShadow de foco, hoje só uma cor').toContain(primary);
    });
});

test('item 4: campo neumorphism em repouso computa as duas sombras internas', async () => {
    await withScene('atomos', 'atomo-neumorphism', async (page) => {
        const input = page.getByRole('textbox', { name: 'Campo de prova' });

        await expect(input, 'useAtomicStyles.ts:110 — neumorphism em repouso').toHaveCSS('box-shadow', /inset[\s\S]*inset/);
    });
});

test('item 4: campo neumorphism em foco computa o anel primário e a sombra interna', async () => {
    await withScene('atomos', 'atomo-neumorphism', async (page) => {
        const input = page.getByRole('textbox', { name: 'Campo de prova' });
        const primary = await resolveExpression(input, 'color', THEME_PRIMARY_EXPRESSION);

        await input.focus();
        const shadow = await waitForShadow(input, /inset/);
        expect(shadow, 'useAtomicStyles.ts:112 — neumorphism em foco').toContain(primary);
    });
});

test('item 4: trilho do switch desligado computa o fundo de cartão do tema', async () => {
    await withScene('atomos', undefined, async (page) => {
        const track = page.locator('[data-probe="alternador"] .relative > div').first();
        const expected = await resolveExpression(track, 'background-color', THEME_CARD_EXPRESSION);
        expect(expected, 'o fundo pretendido precisa diferir do transparente, ou o caso não distingue nada').not.toBe('rgba(0, 0, 0, 0)');

        await expect(track, 'useAtomicStyles.ts:138 — fundo do trilho').toHaveCSS('background-color', expected);
    });
});

test('item 4: trilho do switch glass computa a cor de borda do tema', async () => {
    await withScene('atomos', 'atomo-glass', async (page) => {
        const track = page.locator('[data-probe="alternador"] .relative > div').first();

        await expectBorderColorFromExpression(track, THEME_BORDER_EXPRESSION, 'useAtomicStyles.ts:148 — border do glass');
    });
});

const THEME_PRIMARY_RANGE_EXPRESSION = 'var(--color-theme-primary, #19e3f0)';

test('item 4: trilho do SarakRangeSlider computa a cor de borda do tema', async () => {
    await withScene('atomos', undefined, async (page) => {
        const track = page.locator('[data-probe="intervalo"] [data-testid="sarak-range"] > div').nth(0);
        const expected = await resolveExpression(track, 'background-color', THEME_BORDER_EXPRESSION);
        expect(expected, 'o fundo pretendido precisa diferir do transparente, ou o caso não distingue nada').not.toBe('rgba(0, 0, 0, 0)');

        await expect(track, 'SarakRangeSlider.tsx — constante TRACK').toHaveCSS('background-color', expected);
    });
});

test('item 4: faixa ativa e tooltip do SarakRangeSlider computam a cor primária do tema', async () => {
    await withScene('atomos', undefined, async (page) => {
        const range = page.locator('[data-probe="intervalo"] [data-testid="sarak-range"]');
        const active = range.locator('> div').nth(1);
        const tooltip = range.locator('> span').first();
        const expectedBackground = await resolveExpression(active, 'background-color', THEME_PRIMARY_RANGE_EXPRESSION);
        const expectedColor = await resolveExpression(tooltip, 'color', THEME_PRIMARY_RANGE_EXPRESSION);
        expect(expectedBackground, 'a faixa pretendida precisa diferir do transparente').not.toBe('rgba(0, 0, 0, 0)');
        expect(expectedColor, 'a cor pretendida precisa diferir da herdada').not.toBe(await readComputed(range, 'color'));

        await expect(active, 'SarakRangeSlider.tsx — constante ACTIVE na faixa').toHaveCSS('background-color', expectedBackground);
        await expect(tooltip, 'SarakRangeSlider.tsx — constante ACTIVE no tooltip').toHaveCSS('color', expectedColor);
    });
});

test('item 4: SarakAccordion computa a cor de borda do tema', async () => {
    await withScene('atomos', undefined, async (page) => {
        const root = page.locator('[data-probe="acordeao"] > div');

        await expectBorderColorFromExpression(root, 'var(--border-color,rgba(255,255,255,0.1))', 'SarakAccordion.tsx — borderColor');
    });
});

// ── Item 5 — a seta do SarakSelect flutua ────────────────────────────────────────────────────────

interface Horizontal {
    left: number;
    right: number;
}

async function readHorizontal(target: Locator): Promise<Horizontal> {
    return target.evaluate((el) => {
        const { left, right } = el.getBoundingClientRect();
        return { left, right };
    });
}

async function expectCaretInsideSelect(page: Page, probe: string): Promise<void> {
    const select = page.locator(`[data-probe="${probe}"] select`);
    const caret = page.locator(`[data-probe="${probe}"] svg`);
    const [selectBox, caretBox] = await Promise.all([readHorizontal(select), readHorizontal(caret)]);

    expect(caretBox.left, 'a seta começa dentro da caixa do campo').toBeGreaterThanOrEqual(selectBox.left);
    expect(caretBox.right, 'a seta termina dentro da caixa do campo').toBeLessThanOrEqual(selectBox.right);
}

test('item 5: SarakSelect sem fullWidth, em célula de grade que estica, mantém a seta dentro do campo', async () => {
    await withScene('select-grade', undefined, (page) => expectCaretInsideSelect(page, 'select-sem-largura-total'));
});

test('NÃO MUDA NADA: SarakSelect com fullWidth mantém a seta dentro do campo', async () => {
    await withScene('select-grade', undefined, (page) => expectCaretInsideSelect(page, 'select-largura-total'));
});

// ── Item 6 — a busca de token do painel perde a primeira digitação (relato não reproduzido) ──────

const PANEL_ATTEMPTS = 20;
const TYPED_TEXT = 'primario';

test(`item 6: a busca de token recebe a digitação inteira em ${PANEL_ATTEMPTS} aberturas seguidas do painel`, async () => {
    const intact: boolean[] = [];

    for (let attempt = 1; attempt <= PANEL_ATTEMPTS; attempt += 1) {
        await withScene('painel', undefined, async (page) => {
            await page.getByRole('button', { name: 'Abrir painel' }).click();
            const field = page.getByPlaceholder('Buscar token...');
            await field.waitFor();
            await field.focus();
            await page.keyboard.type(TYPED_TEXT);
            intact.push(await page.getByPlaceholder('Buscar token...').inputValue() === TYPED_TEXT);
        });
    }

    const reached = intact.filter(Boolean).length;
    console.log(`[item 6] digitação inteira em ${reached} de ${PANEL_ATTEMPTS} tentativas`);
    expect(reached, 'tentativas em que a digitação chegou inteira ao campo').toBe(PANEL_ATTEMPTS);
});
