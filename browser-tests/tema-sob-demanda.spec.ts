/**
 * O tema embarcado chega sob demanda e a tela nunca mostra um tema trocado: o primeiro quadro que mostra a aplicação já
 * é o tema pedido, a troca por código mantém o tema atual até o novo chegar, e o tema salvo pinta direto, sem esperar.
 *
 * O `jsdom` não vê quadros: a ordem do que a página mostra, frame a frame, é o que só o navegador mede
 * (specs/specs/11-testes-e-cobertura.md §7). Mesmo harness e mesmo artefato do `cromo-css-real.spec.ts`
 * (`dist/index.js` + `dist/sarak.css`), cena `?cena=tema-sob-demanda`; um gravador anota a cada animation frame, desde
 * antes do primeiro render, se a aplicação está na página, a cor da primária que ela mostra e se o fallback está na tela.
 *
 * -------------------------------------------------------------------------
 * LIMITES DECLARADOS (R18) — o que esta medição NÃO vê
 * -------------------------------------------------------------------------
 * 1. Só a cor da PRIMÁRIA computada de uma probe: "tema errado" é "primária do outro tema". Dois temas com a mesma
 *    primária passariam; os três usados aqui têm primárias distintas (conferido no primeiro caso de cada bloco).
 * 2. O gravador roda em `requestAnimationFrame`: um estado que dure menos de um quadro não aparece. É o que o
 *    usuário vê, não o que o React renderizou.
 * 3. Só Chromium, só o Modo App, e o `import()` resolve de `file://` (sem rede): a latência real de um chunk em rede
 *    lenta não é medida — só a ORDEM do que a página mostra.
 * 4. Lê o `dist/` — sem `npm run build` recente, mede o build anterior.
 * -------------------------------------------------------------------------
 */
import { test, expect, chromium, type Browser, type Page } from '@playwright/test';
import { SARAK_ALL_THEMES } from '../src/core/Design/presets/themes/all';

const DESKTOP = { width: 1280, height: 900 } as const;
const SAVED_KEY = 'sarak-ui-design-v9.0';

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

interface Frame { appPresent: boolean; color: string; fallback: boolean }

const primaryOf = (id: string): string => String(SARAK_ALL_THEMES.find((theme) => theme.id === id)?.design.primaryColor);

/** A cor `#rrggbb` na forma que o navegador computa (`rgb(r, g, b)`). */
const asComputed = (page: Page, color: string): Promise<string> =>
    page.evaluate((value) => {
        const el = document.createElement('div');
        el.style.backgroundColor = value;
        document.body.appendChild(el);
        const computed = getComputedStyle(el).backgroundColor;
        el.remove();
        return computed;
    }, color);

async function openScene(query: string, init?: () => void): Promise<Page> {
    const page = await browser.newPage({ viewport: DESKTOP });
    if (init) await page.addInitScript(init);
    await page.goto(`${harnessUrl}?cena=tema-sob-demanda&${query}`);
    return page;
}

const frames = (page: Page): Promise<Frame[]> => page.evaluate(() => (window as unknown as { __frames: Frame[] }).__frames);
const settle = (page: Page): Promise<void> => page.waitForTimeout(600);

test.describe('tema embarcado pedido por código, fora do boot', () => {
    test('nenhum quadro mostra outro tema: o primeiro com a aplicação já é o tema pedido', async () => {
        const page = await openScene('pedido=neo-brutalism');
        try {
            await page.locator('[data-probe="cor-do-tema"]').waitFor();
            await settle(page);
            const expected = await asComputed(page, primaryOf('neo-brutalism'));
            const standard = await asComputed(page, primaryOf('sarak-sovereign'));
            expect(expected, 'a prova só vale com primárias distintas').not.toBe(standard);

            const withApp = (await frames(page)).filter((frame) => frame.appPresent);
            expect(withApp.length).toBeGreaterThan(0);
            expect(withApp.every((frame) => frame.color === expected), `quadros com a aplicação: ${JSON.stringify([...new Set(withApp.map((f) => f.color))])}`).toBe(true);
        } finally {
            await page.close();
        }
    });

    test('o fallback fica na tela até o tema chegar, e a aplicação nunca aparece junto dele', async () => {
        const page = await openScene('pedido=neo-brutalism');
        try {
            await page.locator('[data-probe="cor-do-tema"]').waitFor();
            await settle(page);
            const all = await frames(page);
            expect(all.some((frame) => frame.fallback && !frame.appPresent), 'houve um quadro só com o fallback').toBe(true);
            expect(all.some((frame) => frame.fallback && frame.appPresent), 'fallback e aplicação juntos').toBe(false);
            // Depois que a aplicação aparece, o fallback não volta.
            const firstApp = all.findIndex((frame) => frame.appPresent);
            expect(all.slice(firstApp).some((frame) => frame.fallback)).toBe(false);
        } finally {
            await page.close();
        }
    });
});

test.describe('escolher outro tema em tempo de execução', () => {
    test('o tema atual continua na tela até o novo chegar — nunca tela vazia, nunca um terceiro tema', async () => {
        const page = await openScene('controlado=1&pedido=sarak-sovereign&alvo=cyberpunk-neon');
        try {
            await page.locator('[data-probe="cor-do-tema"]').waitFor();
            await settle(page);
            const before = await asComputed(page, primaryOf('sarak-sovereign'));
            const after = await asComputed(page, primaryOf('cyberpunk-neon'));
            expect(after, 'a prova só vale com primárias distintas').not.toBe(before);

            const mark = (await frames(page)).length;
            await page.locator('[data-probe="escolher"]').click();
            await expect.poll(async () => (await frames(page)).at(-1)?.color, { timeout: 5000 }).toBe(after);
            await settle(page);

            const between = (await frames(page)).slice(mark);
            expect(between.every((frame) => frame.appPresent), 'a aplicação nunca saiu da tela').toBe(true);
            expect(between.every((frame) => frame.color === before || frame.color === after), `cores vistas: ${JSON.stringify([...new Set(between.map((f) => f.color))])}`).toBe(true);
            expect(between.at(-1)?.color).toBe(after);
        } finally {
            await page.close();
        }
    });
});

test.describe('tema salvo', () => {
    test('pinta direto do design guardado: o primeiro quadro já é a aplicação, sem fallback e sem o padrão', async () => {
        const saved = JSON.stringify({ ...SARAK_ALL_THEMES[0].design, primaryColor: '#12ab34' });
        const withStorage = await browser.newPage({ viewport: DESKTOP });
        try {
            await withStorage.addInitScript(([key, value]) => window.localStorage.setItem(key, value), [SAVED_KEY, saved] as const);
            await withStorage.goto(`${harnessUrl}?cena=tema-sob-demanda&pedido=golden-hour`);
            await withStorage.locator('[data-probe="cor-do-tema"]').waitFor();
            await settle(withStorage);

            const expected = await asComputed(withStorage, '#12ab34');
            const all = await frames(withStorage);
            const firstApp = all.findIndex((frame) => frame.appPresent);
            expect(firstApp, 'a aplicação apareceu').toBeGreaterThanOrEqual(0);
            expect(all.some((frame) => frame.fallback), 'nenhum quadro de fallback').toBe(false);
            expect(all.filter((frame) => frame.appPresent).every((frame) => frame.color === expected)).toBe(true);
        } finally {
            await withStorage.close();
        }
    });
});
