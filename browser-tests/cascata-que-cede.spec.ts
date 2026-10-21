/**
 * O motor entrega o padrão; o componente decide. Medição, em navegador real, de que o raio, o fundo, a borda,
 * o hover e a transição que o componente escolhe por classe ou por `style` vencem o padrão do cartão e do
 * contêiner de conteúdo — e de que o modo eco e o movimento reduzido continuam vencendo o cartão. O `jsdom` não
 * resolve cascata de stylesheet nem camadas (specs/specs/11-testes-e-cobertura.md §7).
 *
 * Mesmo harness e mesmo artefato do `cromo-css-real.spec.ts` (`dist/index.js` + `dist/sarak.css`), cena
 * `?cena=cascata`. Régua relacional, como `css-que-so-o-navegador-mede.spec.ts`: o elemento medido contra um
 * `<i>` irmão que carrega a expressão pretendida em estilo inline. Nenhum valor em px escrito à mão, e cada
 * caso traz a CONTRAPROVA do padrão (sem a classe, o padrão do motor continua valendo).
 *
 * -------------------------------------------------------------------------
 * LIMITES DECLARADOS (R18) — o que esta medição NÃO vê
 * -------------------------------------------------------------------------
 * 1. Só valores COMPUTADOS de propriedades nomeadas; nenhum pixel e nenhuma sobreposição visual.
 * 2. Só Chromium headless, o tema default e os recortes `cascata-raio-catalogo`/`schema-movimento`.
 * 3. O modo eco é ligado pela classe `sarak-eco-mode` no `<html>`, não por token do painel: mede a
 *    regra de CSS, não o caminho que a escolhe.
 * 4. Lê o `dist/` — sem `npm run build` recente, mede o build anterior.
 * -------------------------------------------------------------------------
 */
import { test, expect, chromium, type Browser, type Locator, type Page } from '@playwright/test';

const DESKTOP = { width: 1280, height: 900 } as const;
const TRANSPARENT = 'rgba(0, 0, 0, 0)';

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

interface SceneOptions {
    tema?: string;
    reducedMotion?: 'reduce';
}

async function withCascade(options: SceneOptions, measure: (page: Page) => Promise<void>): Promise<void> {
    const page = await browser.newPage({ viewport: DESKTOP, reducedMotion: options.reducedMotion ?? 'no-preference' });
    try {
        const searchParams = new URLSearchParams({ cena: 'cascata' });
        if (options.tema) searchParams.set('tema', options.tema);
        await page.goto(`${harnessUrl}?${searchParams.toString()}`);
        await page.waitForFunction(() => document.body.hasAttribute('data-sx-texture'));
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

const CARD_RADIUS_TL = 'var(--sarak-card-radius-tl, 10px)';

// ── Raio: o que o componente lê por token vence o raio do cartão ─────────────────────────────────

test('raio: a seção do catálogo computa catalogSectionRadius, e não o raio do cartão', async () => {
    await withCascade({ tema: 'cascata-raio-catalogo' }, async (page) => {
        const section = page.locator('[data-probe="catalogo"] section').first();
        const fromToken = await resolveExpression(section, 'border-top-left-radius', 'var(--sarak-catalog-section-radius, 3rem)');
        const cardRadius = await resolveExpression(section, 'border-top-left-radius', CARD_RADIUS_TL);
        expect(fromToken, 'o raio do token precisa diferir do raio do cartão, ou o caso não distingue nada').not.toBe(cardRadius);

        await expect(section, 'rounded-[var(--sarak-catalog-section-radius)] vence o padrão de .card').toHaveCSS('border-top-left-radius', fromToken);
    });
});

test('CONTRAPROVA: o contêiner .card sem classe de raio computa o raio do cartão', async () => {
    await withCascade({ tema: 'cascata-raio-catalogo' }, async (page) => {
        const container = page.locator('[data-probe="cartao-conteiner"] .card');
        const cardRadius = await resolveExpression(container, 'border-top-left-radius', CARD_RADIUS_TL);

        await expect(container, 'sem classe de raio, o padrão do motor continua valendo').toHaveCSS('border-top-left-radius', cardRadius);
    });
});

test('raio por classe: .sarak-card com rounded-full computa o raio da classe, e o puro computa o do cartão', async () => {
    await withCascade({}, async (page) => {
        const rounded = page.locator('[data-probe="cartao-raio-por-classe"] .sarak-card');
        const plain = page.locator('[data-probe="cartao-puro"] .sarak-card');
        const cardRadius = await resolveExpression(plain, 'border-top-left-radius', CARD_RADIUS_TL);

        await expect(plain, 'CONTRAPROVA: sem classe, o raio do cartão').toHaveCSS('border-top-left-radius', cardRadius);
        expect(parseFloat(await readComputed(rounded, 'border-top-left-radius')), 'rounded-full vence o raio do cartão').toBeGreaterThan(1000);
    });
});

// ── Hover: a borda do cartão e o fundo por classe ────────────────────────────────────────────────

test('hover: o .sarak-card computa a borda de hover do motor', async () => {
    await withCascade({}, async (page) => {
        const card = page.locator('[data-probe="cartao-puro"] .sarak-card');
        const rest = await readComputed(card, 'border-top-color');
        const hover = await resolveExpression(card, 'border-top-color', 'rgba(var(--theme-primary-rgb), 0.4)');
        expect(hover, 'a borda de hover precisa diferir da de repouso, ou o caso não distingue nada').not.toBe(rest);

        await card.hover();
        await expect(card, '.sarak-card:hover { border-color } não é mais vencido por !important').toHaveCSS('border-top-color', hover);
    });
});

const CARD_SURFACE_EXPRESSION = 'color-mix(in srgb, var(--sarak-card-bg, #0f172a), transparent calc(100% * (1 - var(--sarak-card-opacity, 0.8))))';

test('superfície: o cartão sob o tema continua computando o fundo translúcido do tema, sem o atalho background', async () => {
    await withCascade({}, async (page) => {
        const card = page.locator('[data-probe="cartao-puro"] .sarak-card');
        const surface = await resolveExpression(card, 'background-color', CARD_SURFACE_EXPRESSION);
        expect(surface, 'a superfície precisa ser translúcida, ou não se distingue do fundo cheio').not.toBe(
            await resolveExpression(card, 'background-color', 'var(--sarak-card-bg)'),
        );

        await expect(card, 'a superfície do cartão chega sem !important').toHaveCSS('background-color', surface);
    });
});

// ── Fundo: o reset de main/section/article não apaga o fundo do componente ───────────────────────

test('fundo: a coluna e o cartão do Kanban computam o fundo que o componente escreve', async () => {
    await withCascade({}, async (page) => {
        const column = page.locator('[data-probe="kanban"] section[data-column-id]');
        await column.waitFor();
        const expected = await resolveExpression(column, 'background-color', 'var(--color-theme-card, var(--sarak-surface-color, transparent))');
        expect(expected, 'o fundo pretendido precisa diferir do transparente, ou o caso não distingue nada').not.toBe(TRANSPARENT);

        await expect(column, 'background inline em <section> vence o reset transparente').toHaveCSS('background-color', expected);
        await expect(page.locator('[data-probe="kanban"] article').first(), 'background inline em <article>').toHaveCSS('background-color', expected);
    });
});

test('CONTRAPROVA: um <section> sem fundo próprio continua transparente', async () => {
    await withCascade({}, async (page) => {
        await expect(page.locator('[data-probe="secao-solta"] section')).toHaveCSS('background-color', TRANSPARENT);
    });
});

// ── Eco e movimento reduzido: continuam vencendo o cartão ────────────────────────────────────────

test('eco: o .sarak-card perde o desfoque e encurta a transição; sem eco, ele desfoca', async () => {
    await withCascade({}, async (page) => {
        const card = page.locator('[data-probe="cartao-puro"] .sarak-card');
        expect(await readComputed(card, 'backdrop-filter'), 'CONTRAPROVA: fora do eco o cartão desfoca').not.toBe('none');

        await page.evaluate(() => document.documentElement.classList.add('sarak-eco-mode'));
        await expect(card, 'o modo eco vence o desfoque do material do cartão').toHaveCSS('backdrop-filter', 'none');
        await expect(card, 'o modo eco vence a transição do cartão').toHaveCSS('transition-duration', '0.1s');
    });
});

test('movimento reduzido: a preferência do sistema vence a transição do cartão', async () => {
    await withCascade({ reducedMotion: 'reduce' }, async (page) => {
        const card = page.locator('[data-probe="cartao-puro"] .sarak-card');

        const seconds = parseFloat(await readComputed(card, 'transition-duration'));
        expect(seconds, 'prefers-reduced-motion corta a transição (0,01 ms)').toBeLessThan(0.001);
    });
});

// ── Transição: a duração é a do token ────────────────────────────────────────────────────────────

test('transição: o cartão computa motionDurationNormal', async () => {
    await withCascade({ tema: 'schema-movimento' }, async (page) => {
        const card = page.locator('[data-probe="cartao-puro"] .sarak-card');
        await expect(card, 'transition: all var(--duration-normal) lê o token').toHaveCSS('transition-duration', '0.7s');
    });
});

test('CONTRAPROVA: sem o token alterado, a transição do cartão é o padrão do motor', async () => {
    await withCascade({}, async (page) => {
        const card = page.locator('[data-probe="cartao-puro"] .sarak-card');
        const normal = await resolveExpression(card, 'transition-duration', 'var(--duration-normal, 0.3s)');
        await expect(card).toHaveCSS('transition-duration', normal);
    });
});
