/**
 * Medição, em navegador real, do que a lib entrega ao dedo: área tocável, corpo da fonte do campo, movimento
 * reduzido e ausência de rolagem horizontal a 320 px. O `jsdom` não avalia `@media (pointer: coarse)`,
 * `prefers-reduced-motion` nem caixa de layout (specs/specs/11-testes-e-cobertura.md §7).
 *
 * Mesmo harness e mesmo artefato dos outros casos (`dist/index.js` + `dist/sarak.css`), cenas `?cena=toque`,
 * `toque-estreito` e `movimento` (ver `fixtures/harness-entry.tsx`). O toque é emulado pelo contexto do
 * navegador (`hasTouch` + `isMobile`), que liga `pointer: coarse`; a contraprova de cada caso roda o MESMO cenário
 * com mouse e mostra que o desenho do desktop não mudou.
 *
 * Régua: o alvo mínimo é lido do token (`--sarak-touch-target-min` computado no documento), nunca escrito em px
 * neste arquivo; o corpo do campo é medido contra o piso de 16 px do contrato.
 *
 * -------------------------------------------------------------------------
 * LIMITES DECLARADOS (R18) — o que esta medição NÃO vê
 * -------------------------------------------------------------------------
 * 1. Só caixas (`getBoundingClientRect`) e valores COMPUTADOS; nenhum pixel e nenhum gesto real — o toque
 *    emulado muda a mídia `pointer`, não dispara `touchstart`.
 * 2. Só Chromium headless, só os recortes de tema nomeados em `TOKEN_VARIANTS` da fixture.
 * 3. Os acionáveis medidos são os da cena `toque`. O chip de evento do calendário NÃO entra: ele declara a
 *    própria medida em estilo inline (a caixa é um ponto que deixa o toque passar para a célula do dia), e a
 *    célula é o alvo.
 * 4. Lê o `dist/` — sem `npm run build` recente, mede o build anterior.
 * -------------------------------------------------------------------------
 */
import { test, expect, chromium, type Browser, type BrowserContext, type Locator, type Page } from '@playwright/test';

const PHONE = { width: 390, height: 844 } as const;
const NARROW = { width: 320, height: 640 } as const;
const DESKTOP = { width: 1280, height: 900 } as const;
/** Piso de fonte do campo no contrato; o `font-size` de um campo no celular nunca fica abaixo dele. */
const FIELD_FONT_FLOOR_PX = 16;
/** Tolerância de subpixel da caixa medida. */
const SUBPIXEL = 0.5;

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

type Pointer = 'touch' | 'mouse';

async function openContext(pointer: Pointer, viewport: { width: number; height: number }, reducedMotion?: 'reduce'): Promise<BrowserContext> {
    return browser.newContext(
        pointer === 'touch'
            ? { viewport, hasTouch: true, isMobile: true, reducedMotion }
            : { viewport, reducedMotion },
    );
}

async function openScene(context: BrowserContext, cena: string, tema?: string): Promise<Page> {
    const page = await context.newPage();
    const searchParams = new URLSearchParams({ cena });
    if (tema) searchParams.set('tema', tema);
    await page.goto(`${harnessUrl}?${searchParams.toString()}`);
    return page;
}

async function withScene(
    pointer: Pointer,
    cena: string,
    tema: string | undefined,
    measure: (page: Page) => Promise<void>,
    options: { viewport?: { width: number; height: number }; reducedMotion?: 'reduce' } = {},
): Promise<void> {
    const context = await openContext(pointer, options.viewport ?? (pointer === 'touch' ? PHONE : DESKTOP), options.reducedMotion);
    try {
        const page = await openScene(context, cena, tema);
        await measure(page);
    } finally {
        await context.close();
    }
}

async function readComputed(target: Locator, property: string): Promise<string> {
    return target.evaluate((el, prop) => getComputedStyle(el).getPropertyValue(prop), property);
}

async function box(target: Locator): Promise<{ width: number; height: number }> {
    const rect = await target.evaluate((el) => {
        const { width, height } = el.getBoundingClientRect();
        return { width, height };
    });
    return rect;
}

/** O alvo mínimo que o Design Engine entregou ao documento, em px (o token `touchTargetMin`). */
async function resolveTouchToken(page: Page): Promise<number> {
    const raw = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--sarak-touch-target-min'));
    const value = Number.parseFloat(raw);
    expect(Number.isFinite(value), `--sarak-touch-target-min precisa estar emitido, veio "${raw}"`).toBe(true);
    return value;
}

async function expectCoarsePointer(page: Page, expected: boolean): Promise<void> {
    const matches = await page.evaluate(() => window.matchMedia('(pointer: coarse)').matches);
    expect(matches, `pointer: coarse deveria ${expected ? '' : 'não '}casar neste contexto`).toBe(expected);
}

/** Os acionáveis da cena `toque` que a lib desenha como botão, aba ou item de menu. */
const ACTIONABLES = [
    { name: 'Botão xs', locator: (p: Page) => p.getByRole('button', { name: 'Botão xs' }), both: true },
    { name: 'Botão sm', locator: (p: Page) => p.getByRole('button', { name: 'Botão sm' }), both: true },
    { name: 'Botão md', locator: (p: Page) => p.getByRole('button', { name: 'Botão md' }), both: true },
    { name: 'Ícone xs', locator: (p: Page) => p.getByRole('button', { name: 'Ícone xs' }), both: true },
    { name: 'Ícone sm', locator: (p: Page) => p.getByRole('button', { name: 'Ícone sm' }), both: true },
    { name: 'Item vertical', locator: (p: Page) => p.getByRole('button', { name: 'Item vertical' }), both: false },
    { name: 'Item horizontal', locator: (p: Page) => p.getByRole('button', { name: 'Item horizontal' }), both: true },
    { name: 'Item recolhido', locator: (p: Page) => p.getByRole('button', { name: 'Item recolhido' }), both: true },
    { name: 'Calendário: anterior', locator: (p: Page) => p.locator('[data-probe="calendario"]').getByRole('button', { name: 'Mês anterior' }), both: true },
    { name: 'Calendário: próximo', locator: (p: Page) => p.locator('[data-probe="calendario"]').getByRole('button', { name: 'Próximo mês' }), both: true },
    { name: 'Calendário: hoje', locator: (p: Page) => p.locator('[data-probe="calendario"]').getByRole('button', { name: 'Hoje' }), both: true },
    { name: 'Gantt: barra', locator: (p: Page) => p.locator('[data-probe="gantt"] [data-gantt-bar="t0"]'), both: true },
] as const;

test.describe('alvo de toque — ponteiro de dedo', () => {
    test('todo acionável da cena tem caixa tocável de pelo menos o token', async () => {
        await withScene('touch', 'toque', undefined, async (page) => {
            await expectCoarsePointer(page, true);
            const token = await resolveTouchToken(page);
            for (const item of ACTIONABLES) {
                const size = await box(item.locator(page));
                expect(size.height, `${item.name}: altura`).toBeGreaterThanOrEqual(token - SUBPIXEL);
                if (item.both) expect(size.width, `${item.name}: largura`).toBeGreaterThanOrEqual(token - SUBPIXEL);
            }
        });
    });

    test('o campo de seleção e o seletor de horário também chegam ao token em altura', async () => {
        await withScene('touch', 'toque', undefined, async (page) => {
            const token = await resolveTouchToken(page);
            for (const name of ['Campo de seleção', 'Hora', 'Minuto']) {
                const size = await box(page.getByLabel(name, { exact: true }));
                expect(size.height, name).toBeGreaterThanOrEqual(token - SUBPIXEL);
            }
        });
    });

    test('o alvo segue o token: com touchTargetMin = 56, os acionáveis chegam a 56', async () => {
        await withScene('touch', 'toque', 'toque-alvo-largo', async (page) => {
            const token = await resolveTouchToken(page);
            expect(token, 'a variante precisa mover o token, ou o caso não distingue nada').toBe(56);
            for (const item of ACTIONABLES.filter((candidate) => candidate.both)) {
                const size = await box(item.locator(page));
                expect(size.height, `${item.name}: altura`).toBeGreaterThanOrEqual(token - SUBPIXEL);
                expect(size.width, `${item.name}: largura`).toBeGreaterThanOrEqual(token - SUBPIXEL);
            }
        });
    });

    test('NÃO MUDA NADA com mouse: o botão-ícone continua do tamanho da classe, abaixo do token', async () => {
        await withScene('mouse', 'toque', undefined, async (page) => {
            await expectCoarsePointer(page, false);
            const token = await resolveTouchToken(page);
            const xs = await box(page.getByRole('button', { name: 'Ícone xs' }));
            const sm = await box(page.getByRole('button', { name: 'Ícone sm' }));
            expect(xs.width, 'o tamanho xs é o da classe').toBe(await resolveExpressionPx(page, '1.5rem'));
            expect(xs.width, 'o caso só distingue algo se o xs for menor que o token').toBeLessThan(token);
            expect(sm.width, 'o tamanho sm é o da classe').toBe(await resolveExpressionPx(page, '2rem'));
        });
    });

    test('NÃO MUDA NADA com mouse: a barra do Gantt segue com 60% da linha', async () => {
        await withScene('mouse', 'toque', undefined, async (page) => {
            const bar = await box(page.locator('[data-probe="gantt"] [data-gantt-bar="t0"]'));
            const row = await box(page.locator('[data-probe="gantt"] [data-gantt-row="t0"]'));
            expect(bar.height / row.height).toBeCloseTo(0.6, 1);
        });
    });
});

/** Quanto vale uma medida CSS em px nesta página, medida por um `<i>` de prova. */
async function resolveExpressionPx(page: Page, expression: string): Promise<number> {
    return page.evaluate((value) => {
        const probe = document.createElement('i');
        probe.style.display = 'block';
        probe.style.width = value;
        document.body.appendChild(probe);
        const width = probe.getBoundingClientRect().width;
        probe.remove();
        return width;
    }, expression);
}

test.describe('campo — corpo da fonte com ponteiro de dedo', () => {
    const FIELDS = ['Campo de texto', 'Campo de seleção', 'Campo de texto longo', 'Hora', 'Minuto'] as const;

    test('com o corpo de 12px, nenhum campo computa menos de 16px', async () => {
        await withScene('touch', 'toque', 'corpo-pequeno', async (page) => {
            const body = Number.parseFloat(await readComputed(page.locator('body'), 'font-size'));
            expect(body, 'o corpo do texto precisa estar abaixo do piso, ou o caso não distingue nada').toBeLessThan(FIELD_FONT_FLOOR_PX);
            for (const name of FIELDS) {
                const size = Number.parseFloat(await readComputed(page.getByLabel(name, { exact: true }), 'font-size'));
                expect(size, name).toBeGreaterThanOrEqual(FIELD_FONT_FLOOR_PX);
            }
        });
    });

    test('NÃO MUDA NADA com mouse: o campo segue com o corpo do tema, abaixo de 16px', async () => {
        await withScene('mouse', 'toque', 'corpo-pequeno', async (page) => {
            const input = page.getByLabel('Campo de texto', { exact: true });
            const size = Number.parseFloat(await readComputed(input, 'font-size'));
            expect(size).toBeLessThan(FIELD_FONT_FLOOR_PX);
        });
    });
});

test.describe('movimento reduzido', () => {
    const LONG_TRANSITION = '5s';
    const TRANSITION_PROBE = '[data-probe="transicao"]';
    const ANIMATION_PROBE = '[data-probe="animacao"]';

    test('prefers-reduced-motion: reduce derruba a transição e a animação para o mínimo', async () => {
        await withScene('mouse', 'movimento', undefined, async (page) => {
            const transition = Number.parseFloat(await readComputed(page.locator(TRANSITION_PROBE), 'transition-duration'));
            const animation = Number.parseFloat(await readComputed(page.locator(ANIMATION_PROBE), 'animation-duration'));
            expect(transition, 'transição reduzida').toBeLessThan(0.001);
            expect(animation, 'animação reduzida').toBeLessThan(0.001);
        }, { reducedMotion: 'reduce' });
    });

    test('o token reducedMotion faz o mesmo, sem a preferência do sistema', async () => {
        await withScene('mouse', 'movimento', 'movimento-reduzido', async (page) => {
            const transition = Number.parseFloat(await readComputed(page.locator(TRANSITION_PROBE), 'transition-duration'));
            const animation = Number.parseFloat(await readComputed(page.locator(ANIMATION_PROBE), 'animation-duration'));
            expect(transition, 'transição reduzida').toBeLessThan(0.001);
            expect(animation, 'animação reduzida').toBeLessThan(0.001);
        });
    });

    test('NÃO MUDA NADA sem token e sem preferência: a transição e a animação seguem longas', async () => {
        await withScene('mouse', 'movimento', undefined, async (page) => {
            await expect(page.locator(TRANSITION_PROBE)).toHaveCSS('transition-duration', LONG_TRANSITION);
            const animation = Number.parseFloat(await readComputed(page.locator(ANIMATION_PROBE), 'animation-duration'));
            expect(animation).toBeGreaterThan(0.1);
        });
    });
});

test.describe('largura mínima de 320 px (WCAG 1.4.10)', () => {
    for (const pointer of ['touch', 'mouse'] as const) {
        test(`calendário e Gantt a 320 px não rolam a página na horizontal (${pointer})`, async () => {
            await withScene(pointer, 'toque-estreito', undefined, async (page) => {
                await page.locator('[data-probe="calendario-320"] [role="grid"]').waitFor();
                await page.locator('[data-probe="gantt-320"] [data-gantt-bar]').first().waitFor();
                const { scrollWidth, clientWidth } = await page.evaluate(() => ({
                    scrollWidth: document.documentElement.scrollWidth,
                    clientWidth: document.documentElement.clientWidth,
                }));
                expect(scrollWidth, 'a página inteira cabe na largura do viewport').toBeLessThanOrEqual(clientWidth);
                for (const probe of ['calendario-320', 'gantt-320']) {
                    const size = await box(page.locator(`[data-probe="${probe}"]`));
                    expect(size.width, probe).toBeLessThanOrEqual(NARROW.width);
                }
            }, { viewport: NARROW });
        });
    }
});
