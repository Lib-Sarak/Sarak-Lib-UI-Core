/**
 * A duração e a curva padrão das transições do Tailwind (`transition-colors`, `transition-all`… sem
 * `duration-*` nem `ease-*`) vêm de `motionDurationFast` e `motionEaseMain`: a velocidade do tema chega a toda
 * transição, e a classe com duração própria continua decidindo. O `jsdom` não resolve a cascata nem o
 * `@theme` do Tailwind (specs/specs/11-testes-e-cobertura.md §7).
 *
 * Mesmo harness e mesmo artefato do `cromo-css-real.spec.ts` (`dist/index.js` + `dist/sarak.css`), cena
 * `?cena=transicao`, com o recorte `movimento-padrao` (duração rápida 0,45 s e curva própria) e o padrão do
 * motor como contraprova. Os dois modos de injeção, App e Embarcado: no Embarcado a variável mora na ilha e a
 * folha é a ESCOPADA (`?css=escopado` — o `:root` do tema vira `.sarak-scope`; com a global o padrão do Tailwind
 * resolveria no `html`, onde a ilha não escreve).
 *
 * -------------------------------------------------------------------------
 * LIMITES DECLARADOS (R18) — o que esta medição NÃO vê
 * -------------------------------------------------------------------------
 * 1. Só valores COMPUTADOS de `transition-duration` e `transition-timing-function` em três nós da cena;
 *    nenhuma transição em curso e nenhum componente da lib.
 * 2. Só a classe `transition-colors` (e `transition-all duration-300`): as demais utilitárias de transição
 *    do Tailwind leem a mesma variável, mas não são medidas uma a uma.
 * 3. Só Chromium; o movimento reduzido (que zera a duração em JS) não é medido aqui. No Embarcado a página
 *    carrega só a folha escopada: o que cai fora de `.sarak-scope` fica sem estilo da lib, e não é medido.
 * 4. Lê o `dist/` — sem `npm run build` recente, mede o build anterior.
 * -------------------------------------------------------------------------
 */
import { test, expect, chromium, type Browser, type Locator, type Page } from '@playwright/test';

const DESKTOP = { width: 1280, height: 900 } as const;
const DEFAULT_EASE = 'cubic-bezier(0.4, 0, 0.2, 1)';
const THEME_EASE = 'cubic-bezier(0.1, 0.7, 0.1, 1)';

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
        const searchParams = new URLSearchParams({ cena: 'transicao' });
        if (theme) searchParams.set('tema', theme);
        if (mode === 'embarcado') {
            searchParams.set('modo', 'embarcado');
            searchParams.set('css', 'escopado');
        }
        await page.goto(`${harnessUrl}?${searchParams.toString()}`);
        await page.locator('[data-probe="sem-duracao"]').waitFor();
        await measure(page);
    } finally {
        await page.close();
    }
}

const probe = (page: Page, name: string): Locator => page.locator(`[data-probe="${name}"]`);
const computed = (target: Locator, property: string): Promise<string> =>
    target.evaluate((el, prop) => getComputedStyle(el).getPropertyValue(prop), property);

for (const mode of MODES) {
    test.describe(`modo ${mode}`, () => {
        test('a transição sem duração roda na duração rápida e na curva mestre do tema', async () => {
            await withScene('movimento-padrao', mode, async (page) => {
                for (const name of ['sem-duracao', 'botao-sem-duracao']) {
                    expect(await computed(probe(page, name), 'transition-duration'), `${name}: o motionDurationFast do tema`).toBe('0.45s');
                    expect(await computed(probe(page, name), 'transition-timing-function'), `${name}: o motionEaseMain do tema`).toBe(THEME_EASE);
                }
            });
        });

        test('a classe com duração própria decide: duration-300 vence o token', async () => {
            await withScene('movimento-padrao', mode, async (page) => {
                expect(await computed(probe(page, 'com-duracao'), 'transition-duration')).toBe('0.3s');
            });
        });

        test('CONTRAPROVA: sem tema, o padrão é o do motor (0,2 s e a curva padrão), não os 150 ms do Tailwind', async () => {
            await withScene(undefined, mode, async (page) => {
                expect(await computed(probe(page, 'sem-duracao'), 'transition-duration')).toBe('0.2s');
                expect(await computed(probe(page, 'sem-duracao'), 'transition-timing-function')).toBe(DEFAULT_EASE);
            });
        });
    });
}
