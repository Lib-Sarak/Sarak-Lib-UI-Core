/**
 * A ponte do modo claro (`SovereignThemeInjector`) repinta o Tailwind absoluto do HOSPEDEIRO (`text-white`,
 * `bg-white/10`…) para o tema — sem `!important` — e NÃO repinta o componente da lib que desenha sobre fundo
 * próprio: o lightbox é branco sobre preto em qualquer modo. O `jsdom` não resolve a cascata
 * (specs/specs/11-testes-e-cobertura.md §7).
 *
 * Mesmo harness e mesmo artefato do `cromo-css-real.spec.ts` (`dist/index.js` + `dist/sarak.css`), cena
 * `?cena=lightbox`, com o recorte `legivel-claro` (a ponte atua) e o padrão escuro (a contraprova: o mesmo
 * lightbox, que tem de computar igual). Os dois modos de injeção, App e Embarcado: no Embarcado a âncora da
 * ponte é `.sarak-scope`, e o lightbox sai por portal para dentro da ilha.
 *
 * -------------------------------------------------------------------------
 * LIMITES DECLARADOS (R18) — o que esta medição NÃO vê
 * -------------------------------------------------------------------------
 * 1. Só valores COMPUTADOS de três nós do lightbox (o contador, o botão de fechar, o botão seguinte) e do
 *    elemento do hospedeiro; nenhum pixel e nenhum outro componente que use `text-white`.
 * 2. Só Chromium e o recorte `legivel-claro`; a ponte do modo escuro (`bg-zinc-950` → cartão) não é medida aqui.
 * 3. O texto do `<style>` da ponte é lido como está: que nenhum `!important` o contenha é prova do texto, que o
 *    `style` inline do componente vença é consequência da cascata, não medida num caso próprio.
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

type Mode = 'app' | 'embarcado';
const MODES: Mode[] = ['app', 'embarcado'];

async function withScene<T>(theme: string | undefined, mode: Mode, measure: (page: Page) => Promise<T>): Promise<T> {
    const page = await browser.newPage({ viewport: DESKTOP });
    try {
        const searchParams = new URLSearchParams({ cena: 'lightbox' });
        if (theme) searchParams.set('tema', theme);
        if (mode === 'embarcado') searchParams.set('modo', 'embarcado');
        await page.goto(`${harnessUrl}?${searchParams.toString()}`);
        await page.getByRole('dialog').waitFor();
        return await measure(page);
    } finally {
        await page.close();
    }
}

const computed = (target: Locator, property: string): Promise<string> =>
    target.evaluate((el, prop) => getComputedStyle(el).getPropertyValue(prop), property);

/** Qualquer cor computada (`oklab()`, `color-mix`…) → `[r, g, b, a]`, pelo canvas, que a normaliza para sRGB. */
const toRgba = (page: Page, color: string): Promise<number[]> =>
    page.evaluate((value) => {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        const context = canvas.getContext('2d', { willReadFrequently: true });
        if (!context) return [0, 0, 0, 0];
        context.clearRect(0, 0, 1, 1);
        context.fillStyle = value;
        context.fillRect(0, 0, 1, 1);
        return Array.from(context.getImageData(0, 0, 1, 1).data);
    }, color);

/** O tema claro com texto ESCURO (o título do tema não é branco): `legivel-claro` define o texto mestre. */
const LIGHT_THEME = 'legivel-claro';

interface LightboxColors {
    counter: string;
    closeText: string;
    closeBackground: string;
    nextBackground: string;
}

async function readLightbox(page: Page): Promise<LightboxColors> {
    const dialog = page.getByRole('dialog');
    return {
        counter: await computed(dialog.getByText('1 / 2'), 'color'),
        closeText: await computed(page.getByLabel('Fechar galeria'), 'color'),
        closeBackground: await computed(page.getByLabel('Fechar galeria'), 'background-color'),
        nextBackground: await computed(page.getByLabel('Próxima imagem'), 'background-color'),
    };
}

for (const mode of MODES) {
    test.describe(`modo ${mode}`, () => {
        test('o lightbox sob o tema claro computa igual ao do escuro: nada dentro dele é repintado', async () => {
            const dark = await withScene(undefined, mode, readLightbox);
            const light = await withScene(LIGHT_THEME, mode, readLightbox);
            expect(light).toEqual(dark);
        });

        test('o contador do lightbox é claro (legível sobre o preto), e os botões seguem translúcidos', async () => {
            await withScene(LIGHT_THEME, mode, async (page) => {
                const light = await readLightbox(page);
                const [red, green, blue] = await toRgba(page, light.counter);
                expect(Math.min(red, green, blue), `o contador ${light.counter} é branco, não o título escuro do tema`).toBeGreaterThanOrEqual(200);
                const [, , , alpha] = await toRgba(page, light.closeBackground);
                expect(alpha, `o fundo do botão ${light.closeBackground} é o branco translúcido (10%), não o cartão claro opaco`).toBeLessThan(80);
                expect(light.nextBackground).toBe(light.closeBackground);
            });
        });

        test('CONTRAPROVA: o texto do hospedeiro com text-white é repintado para o texto principal do tema', async () => {
            await withScene(LIGHT_THEME, mode, async (page) => {
                const host = page.locator('[data-probe="hospedeiro"]');
                const expected = await host.evaluate((el) => {
                    const probe = document.createElement('i');
                    probe.style.color = 'var(--theme-text-primary,var(--sarak-text-main,#f2f6fb))';
                    el.parentElement?.appendChild(probe);
                    const value = getComputedStyle(probe).color;
                    probe.remove();
                    return value;
                });
                expect(await computed(host, 'color')).toBe(expected);
                const [red, green, blue] = await toRgba(page, expected);
                expect(Math.max(red, green, blue), `o texto principal do tema claro (${expected}) não é branco`).toBeLessThan(128);
            });
        });

        test('a folha da ponte não tem !important', async () => {
            await withScene(LIGHT_THEME, mode, async (page) => {
                const text = await page.evaluate(() => document.getElementById('sarak-sovereign-bridge')?.textContent ?? '');
                expect(text.length, 'a ponte do modo claro está montada').toBeGreaterThan(0);
                expect(text).not.toContain('!important');
            });
        });
    });
}
