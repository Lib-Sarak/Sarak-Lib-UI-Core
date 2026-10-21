/**
 * O que tinha valor fixo e tinha token passa a ler o token, em navegador real: o pulso do alternador
 * (`motionDurationSlow`), o raio dos nós da matriz (`matrixRadius`), a sombra do marcador (`rgba(var(--x,#hex),a)`
 * era inválida e sumia) e o texto do botão de ajuda (`text-slate-300` fixo, ilegível sob tema claro).
 * O `jsdom` não calcula animação, `color-mix` nem a cascata (specs/specs/11-testes-e-cobertura.md §7).
 *
 * Mesmo harness e mesmo artefato do `cromo-css-real.spec.ts` (`dist/index.js` + `dist/sarak.css`), cena
 * `?cena=valores-fixos`. O recorte `fixos-movimento` (`motionDurationSlow` 0,9, `matrixRadius` 3) é a prova;
 * a cena sem recorte é a contraprova do padrão. `contraste-claro` e `contraste-escuro` medem o texto.
 *
 * -------------------------------------------------------------------------
 * LIMITES DECLARADOS (R18) — o que esta medição NÃO vê
 * -------------------------------------------------------------------------
 * 1. Só valores COMPUTADOS de propriedades nomeadas (`animation-duration`, `border-top-left-radius`, `box-shadow`,
 *    `color`) e o contraste calculado a partir deles; nenhum pixel.
 * 2. Só Chromium headless e os três componentes medidos; os demais valores fixos que passaram a ler token
 *    (raio do chat, atrasos do chat, carregamento do motor, mocks do painel, o texto do filtro — que o próprio
 *    `SarakSelect` pinta por `--sarak-input-text-color`) são lidos pelo `fixed-translucent:check` (duração, paleta,
 *    hex) e pelo `variable-contract:check`, não aqui.
 * 3. Lê o `dist/` — sem `npm run build` recente, mede o build anterior.
 * -------------------------------------------------------------------------
 */
import { test, expect, chromium, type Browser, type Locator, type Page } from '@playwright/test';

const DESKTOP = { width: 1280, height: 900 } as const;
const MIN_RATIO = 4.5;
const PULSE_FACTOR = 2.67;
const DEFAULT_SLOW_SECONDS = 0.6;
const THEMED_SLOW_SECONDS = 0.9;

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

interface Rgba {
    r: number;
    g: number;
    b: number;
    a: number;
}

function parseColor(value: string): Rgba {
    const numbers = (value.match(/-?[\d.]+(?:e-?\d+)?/g) ?? []).map(Number);
    if (value.startsWith('color(')) {
        const [r, g, b, a] = numbers;
        return { r: r * 255, g: g * 255, b: b * 255, a: a ?? 1 };
    }
    const [r, g, b, a] = numbers;
    return { r, g, b, a: a ?? 1 };
}

function luminance({ r, g, b }: Rgba): number {
    const channel = (c: number): number => (c / 255 <= 0.03928 ? c / 255 / 12.92 : Math.pow((c / 255 + 0.055) / 1.055, 2.4));
    return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function ratio(foreground: Rgba, background: Rgba): number {
    const [a, b] = [luminance(foreground), luminance(background)];
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

function flatten(layers: string[]): Rgba {
    let base: Rgba = { r: 255, g: 255, b: 255, a: 1 };
    for (const layer of layers) {
        const top = parseColor(layer);
        base = {
            r: top.a * top.r + (1 - top.a) * base.r,
            g: top.a * top.g + (1 - top.a) * base.g,
            b: top.a * top.b + (1 - top.a) * base.b,
            a: 1,
        };
    }
    return base;
}

async function textContrast(target: Locator): Promise<number> {
    const color = await target.evaluate((el) => getComputedStyle(el).color);
    const layers = await target.evaluate((el) => {
        const out: string[] = [];
        for (let node: Element | null = el; node; node = node.parentElement) out.unshift(getComputedStyle(node).backgroundColor);
        return out;
    });
    return ratio(parseColor(color), flatten(layers));
}

async function withScene<T>(params: Record<string, string>, measure: (page: Page) => Promise<T>): Promise<T> {
    const page = await browser.newPage({ viewport: DESKTOP });
    try {
        await page.goto(`${harnessUrl}?${new URLSearchParams({ cena: 'valores-fixos', ...params }).toString()}`);
        await page.waitForFunction(() => document.body.hasAttribute('data-sx-texture'));
        return await measure(page);
    } finally {
        await page.close();
    }
}

const probe = (page: Page, name: string): Locator => page.locator(`[data-probe="${name}"]`);

/** Abre o item da matriz: os nós (e o marcador) só existem depois da expansão. */
async function expandMatrix(page: Page): Promise<void> {
    await probe(page, 'matriz').getByText('Papel de prova').click();
    await page.waitForTimeout(400);
}

/** O `animation-duration` (segundos) do primeiro descendente que anima `sarak-switch-pulse`. */
async function pulseSeconds(page: Page): Promise<number> {
    const raw = await probe(page, 'pulso').evaluate((root) => {
        for (const el of Array.from(root.querySelectorAll('*'))) {
            const style = getComputedStyle(el);
            if (style.animationName.includes('sarak-switch-pulse')) return style.animationDuration;
        }
        return '';
    });
    return parseFloat(raw);
}

test.describe('movimento e raio: o valor fixo leu o token', () => {
    test('alternador pulsante: o pulso é um múltiplo de `motionDurationSlow`', async () => {
        await withScene({ tema: 'fixos-movimento' }, async (page) => {
            expect(await pulseSeconds(page)).toBeCloseTo(THEMED_SLOW_SECONDS * PULSE_FACTOR, 1);
        });
    });

    test('CONTRAPROVA: com o padrão do token o pulso é ≈ 1,6 s', async () => {
        await withScene({ tema: 'fixos-pulso-padrao' }, async (page) => {
            expect(await pulseSeconds(page)).toBeCloseTo(DEFAULT_SLOW_SECONDS * PULSE_FACTOR, 1);
        });
    });

    test('matriz expansível: o raio dos nós é `matrixRadius`', async () => {
        await withScene({ tema: 'fixos-movimento' }, async (page) => {
            await expandMatrix(page);
            const node = probe(page, 'matriz').locator('[class*="rounded-[var(--sarak-matrix-radius"]').first();

            await expect(node).toHaveCSS('border-top-left-radius', '3px');
        });
    });

    test('CONTRAPROVA: sem recorte o raio dos nós é o padrão do token (12 px)', async () => {
        await withScene({}, async (page) => {
            await expandMatrix(page);
            const node = probe(page, 'matriz').locator('[class*="rounded-[var(--sarak-matrix-radius"]').first();

            await expect(node).toHaveCSS('border-top-left-radius', '12px');
        });
    });

    test('marcador ativo da matriz: a sombra existe (a antiga, `rgba(var(--x,#hex),a)`, era inválida)', async () => {
        await withScene({}, async (page) => {
            await expandMatrix(page);
            const marker = probe(page, 'matriz').locator('[class*="shadow-[0_0_10px_color-mix"]').first();

            await expect(marker).toHaveCount(1);
            expect(await marker.evaluate((el) => getComputedStyle(el).boxShadow)).not.toBe('none');
        });
    });
});

for (const theme of ['contraste-claro', 'contraste-escuro'] as const) {
    test.describe(`texto legível sob ${theme}`, () => {
        test('o texto do botão de ajuda aberto passa de 4,5:1 sobre o cartão', async () => {
            await withScene({ tema: theme }, async (page) => {
                await probe(page, 'ajuda').getByRole('button').click();
                const text = page.getByText('Texto de ajuda de prova');

                expect(await textContrast(text), `${theme}: ajuda`).toBeGreaterThanOrEqual(MIN_RATIO);
            });
        });
    });
}
