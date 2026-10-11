/**
 * Medição, em navegador real, da navegação na base do celular: onde a barra fica, que caixa os itens têm e se o
 * conteúdo passa por baixo dela. O `jsdom` não tem motor de layout (specs/specs/11-testes-e-cobertura.md §7).
 *
 * Mesmo harness e mesmo artefato dos outros casos (`dist/index.js` + `dist/sarak.css`), cenas
 * `?cena=navegacao-celular` (4 destinos) e `navegacao-celular-7` (7 destinos), ver `fixtures/harness-entry.tsx`.
 * O toque é emulado pelo contexto do navegador (`hasTouch` + `isMobile`), que liga `pointer: coarse`.
 *
 * Régua: o alvo mínimo é lido do token (`--sarak-touch-target-min` computado no documento), nunca escrito em px
 * neste arquivo; a posição é comparada com a janela e com o painel de conteúdo medidos na mesma página.
 *
 * -------------------------------------------------------------------------
 * LIMITES DECLARADOS (R18) — o que esta medição NÃO vê
 * -------------------------------------------------------------------------
 * 1. Só caixas (`getBoundingClientRect`) e valores COMPUTADOS; nenhum pixel e nenhum gesto real.
 * 2. A ÁREA SEGURA não é emulada: o Chromium headless não tem entalhe, então `env(safe-area-inset-bottom)` vale
 *    0 aqui. O caso mede que o respiro de base existe e que a barra não corta o item; o inset em si é provado
 *    pelo teste de componente (a declaração do `padding-bottom`) e só num aparelho real.
 * 3. Só Chromium headless, só os recortes de tema nomeados em `TOKEN_VARIANTS` da fixture.
 * 4. Lê o `dist/` — sem `npm run build` recente, mede o build anterior.
 * -------------------------------------------------------------------------
 */
import { test, expect, chromium, type Browser, type BrowserContext, type Locator, type Page } from '@playwright/test';

const PHONE = { width: 390, height: 844 } as const;
const DESKTOP = { width: 1280, height: 900 } as const;
/** Tolerância de subpixel da caixa medida. */
const SUBPIXEL = 0.5;

const BAR = 'nav[data-sarak-bottom-nav]';
const CONTENT = '[data-sarak-content]';
const LAST_ITEM = '[data-probe="ultimo-item"]';

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

async function withScene(
    pointer: Pointer,
    cena: string,
    tema: string | undefined,
    measure: (page: Page) => Promise<void>,
    viewport: { width: number; height: number } = pointer === 'touch' ? PHONE : DESKTOP,
): Promise<void> {
    const context: BrowserContext = await browser.newContext(
        pointer === 'touch' ? { viewport, hasTouch: true, isMobile: true } : { viewport },
    );
    try {
        const page = await context.newPage();
        const searchParams = new URLSearchParams({ cena });
        if (tema) searchParams.set('tema', tema);
        await page.goto(`${harnessUrl}?${searchParams.toString()}`);
        await measure(page);
    } finally {
        await context.close();
    }
}

interface Rect { top: number; bottom: number; left: number; right: number; width: number; height: number }

async function rect(target: Locator): Promise<Rect> {
    return target.evaluate((el) => {
        const { top, bottom, left, right, width, height } = el.getBoundingClientRect();
        return { top, bottom, left, right, width, height };
    });
}

async function viewportSize(page: Page): Promise<{ width: number; height: number }> {
    return page.evaluate(() => ({ width: window.innerWidth, height: window.innerHeight }));
}

/** O alvo mínimo que o Design Engine entregou ao documento, em px (o token `touchTargetMin`). */
async function resolveTouchToken(page: Page): Promise<number> {
    const raw = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--sarak-touch-target-min'));
    const value = Number.parseFloat(raw);
    expect(Number.isFinite(value), `--sarak-touch-target-min precisa estar emitido, veio "${raw}"`).toBe(true);
    return value;
}

test.describe('navegação na base — celular com toque', () => {
    test('auto com 4 destinos: a barra está colada na base da janela e ocupa a largura toda', async () => {
        await withScene('touch', 'navegacao-celular', undefined, async (page) => {
            const view = await viewportSize(page);
            const bar = await rect(page.locator(BAR));
            expect(Math.abs(bar.bottom - view.height), 'a borda de baixo da barra é a da janela').toBeLessThanOrEqual(SUBPIXEL);
            expect(bar.top, 'a barra fica na metade de baixo da tela').toBeGreaterThan(view.height / 2);
            expect(Math.abs(bar.width - view.width), 'a barra ocupa a largura da janela').toBeLessThanOrEqual(SUBPIXEL);
        });
    });

    test('cada item tem ícone e rótulo, e os quatro destinos estão na barra', async () => {
        await withScene('touch', 'navegacao-celular', undefined, async (page) => {
            const items = page.locator(`${BAR} a`);
            await expect(items).toHaveCount(4);
            for (const label of ['Início', 'Pedidos', 'Contas', 'Ajustes']) {
                const item = page.locator(BAR).getByRole('link', { name: label });
                await expect(item, label).toBeVisible();
                await expect(item.locator('svg'), `${label}: ícone`).toHaveCount(1);
            }
            await expect(page.locator(BAR).getByRole('link', { name: 'Pedidos' })).toHaveAttribute('aria-current', 'page');
        });
    });

    test('todo item tem caixa tocável de pelo menos o token, nos dois eixos', async () => {
        await withScene('touch', 'navegacao-celular', undefined, async (page) => {
            const token = await resolveTouchToken(page);
            const count = await page.locator(`${BAR} a`).count();
            for (let index = 0; index < count; index += 1) {
                const size = await rect(page.locator(`${BAR} a`).nth(index));
                expect(size.height, `item ${index + 1}: altura`).toBeGreaterThanOrEqual(token - SUBPIXEL);
                expect(size.width, `item ${index + 1}: largura`).toBeGreaterThanOrEqual(token - SUBPIXEL);
            }
        });
    });

    test('o painel de conteúdo termina onde a barra começa — nada passa por baixo dela', async () => {
        await withScene('touch', 'navegacao-celular', undefined, async (page) => {
            const bar = await rect(page.locator(BAR));
            const content = await rect(page.locator(CONTENT));
            expect(content.bottom, 'o painel não invade a barra').toBeLessThanOrEqual(bar.top + SUBPIXEL);
        });
    });

    test('rolando o painel até o fim, o último item do conteúdo fica visível acima da barra', async () => {
        await withScene('touch', 'navegacao-celular', undefined, async (page) => {
            await page.locator(CONTENT).evaluate((el) => { el.scrollTop = el.scrollHeight; });
            const bar = await rect(page.locator(BAR));
            const last = await rect(page.locator(LAST_ITEM));
            expect(last.height, 'o último item precisa ter caixa').toBeGreaterThan(0);
            expect(last.bottom, 'o último item termina acima da barra').toBeLessThanOrEqual(bar.top + SUBPIXEL);
            expect(last.top, 'e está dentro da janela').toBeGreaterThanOrEqual(0);
        });
    });

    test('a barra não rola com o conteúdo: a posição é a mesma antes e depois da rolagem', async () => {
        await withScene('touch', 'navegacao-celular', undefined, async (page) => {
            const before = await rect(page.locator(BAR));
            await page.locator(CONTENT).evaluate((el) => { el.scrollTop = el.scrollHeight; });
            const after = await rect(page.locator(BAR));
            expect(after.top).toBeCloseTo(before.top, 0);
        });
    });

    test('há respiro de base na barra (a área segura soma-se a ele, ver limite 2)', async () => {
        await withScene('touch', 'navegacao-celular', undefined, async (page) => {
            const paddingBottom = Number.parseFloat(await page.locator(BAR).evaluate((el) => getComputedStyle(el).paddingBottom));
            expect(paddingBottom).toBeGreaterThan(0);
        });
    });

    test('o drawer continua no hambúrguer e não repete a navegação', async () => {
        await withScene('touch', 'navegacao-celular', undefined, async (page) => {
            await page.getByRole('button', { name: /Abrir menu/ }).first().click();
            await expect(page.locator('#sarak-chrome-drawer')).toBeVisible();
            await expect(page.locator('#sarak-chrome-drawer nav')).toHaveCount(0);
        });
    });
});

test.describe('navegação na base — a escolha pelo token', () => {
    test('auto com 7 destinos: sem barra, a navegação vive na gaveta', async () => {
        await withScene('touch', 'navegacao-celular-7', undefined, async (page) => {
            await expect(page.locator(BAR)).toHaveCount(0);
            await page.getByRole('button', { name: /Abrir menu/ }).first().click();
            await expect(page.locator('#sarak-chrome-drawer nav')).toHaveCount(1);
        });
    });

    test('bottom força a barra com 7 destinos', async () => {
        await withScene('touch', 'navegacao-celular-7', 'navegacao-celular-base', async (page) => {
            await expect(page.locator(`${BAR} a`)).toHaveCount(7);
        });
    });

    test('drawer força a gaveta com 4 destinos', async () => {
        await withScene('touch', 'navegacao-celular', 'navegacao-celular-gaveta', async (page) => {
            await expect(page.locator(BAR)).toHaveCount(0);
        });
    });
});

test.describe('navegação na base — NÃO MUDA NADA fora do celular', () => {
    test('no desktop, nem com o token em bottom, a barra aparece', async () => {
        await withScene('mouse', 'navegacao-celular', 'navegacao-celular-base', async (page) => {
            await expect(page.locator('aside')).toBeVisible();
            await expect(page.locator(BAR)).toHaveCount(0);
        });
    });
});
