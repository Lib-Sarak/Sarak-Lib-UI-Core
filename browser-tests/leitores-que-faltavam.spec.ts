/**
 * Os tokens que o painel oferecia sem que nada os lesse passam a desenhar — e as faixas que o CSS satura
 * deixam de ter metade morta. Medição, em navegador real: alinhamento e hover da marca do cromo
 * (`identityAlignment`, `identityHoverEffect`), rugosidade e brilho do vidro (`glassRoughness`,
 * `glassSpecularity`), camada da sidebar (`zIndexSidebar`), raio do selo (`badgeRadius`), suavidade da
 * vinheta (`vignetteSoftness`, a mesma régua nos três leitores), peso e caixa de títulos e corpo, e o
 * estilo `neumorphism` do botão. O `jsdom` não calcula `justify-content` por atributo nem `:hover`
 * (specs/specs/11-testes-e-cobertura.md §7).
 *
 * Mesmo harness e mesmo artefato do `cromo-css-real.spec.ts` (`dist/index.js` + `dist/sarak.css`). Cada token
 * traz a CONTRAPROVA (sem o recorte, o padrão do motor) e roda nos dois modos de injeção, App e Embarcado
 * (com a folha ESCOPADA no Embarcado: o `:root` do tema vira `.sarak-scope`).
 *
 * -------------------------------------------------------------------------
 * LIMITES DECLARADOS (R18) — o que esta medição NÃO vê
 * -------------------------------------------------------------------------
 * 1. Só valores COMPUTADOS de propriedades nomeadas num nó de cada cena; nenhum pixel. "O brilho fica bonito" não
 *    é medido: mede-se que o filtro tem `drop-shadow`.
 * 2. Só Chromium e as opções nomeadas nos recortes `identidade-*`, `vidro-rugoso`, `vinheta-*`, `sidebar-camada`,
 *    `selo-quadrado`, `peso-leve` e `botao-neumorphism` — não toda opção de cada token.
 * 3. A vinheta é lida no primeiro `::after` da página que desenha o gradiente radial transparente→escuro; a
 *    `--sarak-vignette` (`.sarak-vignette-layer`) usa a mesma expressão e o mesmo fator, conferidos por teste de
 *    texto (`atmosferaEBotoesQueDesenham.test.ts`), não aqui.
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

async function withScene(
    scene: string | undefined,
    theme: string | undefined,
    mode: Mode,
    measure: (page: Page) => Promise<void>,
): Promise<void> {
    const page = await browser.newPage({ viewport: DESKTOP });
    try {
        const searchParams = new URLSearchParams();
        if (scene) searchParams.set('cena', scene);
        if (theme) searchParams.set('tema', theme);
        if (mode === 'embarcado') {
            searchParams.set('modo', 'embarcado');
            searchParams.set('css', 'escopado');
        }
        await page.goto(`${harnessUrl}?${searchParams.toString()}`);
        await page.waitForFunction(() => document.querySelector('[data-sx-texture]') !== null);
        await measure(page);
    } finally {
        await page.close();
    }
}

const computed = (target: Locator, property: string, pseudo?: string): Promise<string> =>
    target.evaluate((el, args) => getComputedStyle(el, args.pseudo).getPropertyValue(args.property), { property, pseudo: pseudo ?? null });

const brand = (page: Page): Locator => page.locator('.sarak-chrome-brand').first();

for (const mode of MODES) {
    test.describe(`modo ${mode}`, () => {
        test('identityAlignment: a marca do cromo se alinha (esquerda é o padrão)', async () => {
            const expected: Array<[string, string]> = [['identidade-esquerda', 'flex-start'], ['identidade-centro', 'center'], ['identidade-direita', 'flex-end']];
            for (const [theme, justify] of expected) {
                await withScene(undefined, theme, mode, async (page) => {
                    await expect(brand(page), theme).toHaveCSS('justify-content', justify);
                });
            }
            await withScene(undefined, undefined, mode, async (page) => {
                await expect(brand(page), 'CONTRAPROVA: sem recorte a marca fica à esquerda').toHaveCSS('justify-content', 'flex-start');
            });
        });

        test('identityHoverEffect: a marca reage ao ponteiro na opção escolhida, e não reage em none', async () => {
            const hovered = async (theme: string, property: string): Promise<string> => {
                let value = '';
                await withScene(undefined, theme, mode, async (page) => {
                    await brand(page).hover();
                    await page.waitForTimeout(400); // a transição de `--duration-fast` (0,2 s) termina
                    value = await computed(brand(page), property);
                });
                return value;
            };
            expect(Number(await hovered('identidade-hover-opacidade', 'opacity')), 'opacity').toBeLessThan(1);
            expect(await hovered('identidade-hover-escala', 'transform'), 'scale').toMatch(/^matrix\(1\.0/);
            expect(await hovered('identidade-hover-brilho', 'filter'), 'glow').toContain('drop-shadow');
            expect(Number(await hovered('identidade-hover-nenhum', 'opacity')), 'CONTRAPROVA: none').toBe(1);
            expect(await hovered('identidade-hover-nenhum', 'filter'), 'CONTRAPROVA: none, sem filtro').toBe('none');
        });

        test('glassRoughness e glassSpecularity: o vidro fosqueia e ganha o brilho da quina; o padrão é sutil', async () => {
            await withScene('cartao-cede', 'vidro-rugoso', mode, async (page) => {
                const glass = page.locator('[data-probe="vidro"] > .sarak-glass');
                expect(await computed(glass, 'backdrop-filter'), 'contrast(1 - 0,5)').toContain('contrast(0.5)');
                expect(await computed(glass, 'box-shadow'), 'brilho a 40%').toMatch(/rgba\(255, 255, 255, 0\.4\)/);
            });
            await withScene('cartao-cede', undefined, mode, async (page) => {
                const glass = page.locator('[data-probe="vidro"] > .sarak-glass');
                expect(await computed(glass, 'backdrop-filter'), 'CONTRAPROVA: o padrão (0,05)').toContain('contrast(0.95)');
                expect(await computed(glass, 'box-shadow')).toMatch(/rgba\(255, 255, 255, 0\.1\)/);
            });
        });

        test('zIndexSidebar: a sidebar do cromo empilha pelo token (500 no padrão)', async () => {
            await withScene(undefined, 'sidebar-camada', mode, async (page) => {
                await expect(page.locator('aside').first()).toHaveCSS('z-index', '300');
            });
            await withScene(undefined, undefined, mode, async (page) => {
                await expect(page.locator('aside').first(), 'CONTRAPROVA: o padrão').toHaveCSS('z-index', '500');
            });
        });

        test('badgeRadius: o selo segue o raio do tema; o padrão é a pílula', async () => {
            await withScene('legivel', 'selo-quadrado', mode, async (page) => {
                const badge = page.locator('[data-probe="badge-suave-sucesso"] > span').first();
                await expect(badge).toHaveCSS('border-top-left-radius', '4px');
            });
            await withScene('legivel', undefined, mode, async (page) => {
                const badge = page.locator('[data-probe="badge-suave-sucesso"] > span').first();
                await expect(badge, 'CONTRAPROVA: 99 px no padrão').toHaveCSS('border-top-left-radius', '99px');
            });
        });

        test('vignetteSoftness: a parada transparente da vinheta anda 1,6% por ponto e a faixa acaba onde ela satura', async () => {
            const stop = async (theme: string | undefined): Promise<string> => {
                let value = '';
                await withScene(undefined, theme, mode, async (page) => {
                    // A vinheta é o `::after` de quem leva a atmosfera (a camada do cromo, ou o corpo com textura).
                    value = await page.evaluate(() => {
                        for (const el of Array.from(document.querySelectorAll('*'))) {
                            const image = getComputedStyle(el, '::after').backgroundImage;
                            const stop = image.match(/radial-gradient\(circle,\s*(?:rgba\(0, 0, 0, 0\)|transparent)\s+([\d.]+%)/);
                            if (stop) return stop[1];
                        }
                        return 'sem vinheta';
                    });
                });
                return value;
            };
            expect(await stop('vinheta-suave'), 'softness 60 → 100 − 96 = 4%').toBe('4%');
            expect(await stop('vinheta-padrao'), 'CONTRAPROVA: o padrão 50 → 20%').toBe('20%');
            expect(await stop('vinheta-seca'), 'softness 0 → o teto de 95%').toBe('95%');
        });

        test('peso e caixa: h2Weight, bodyWeight e headingTransform chegam ao elemento', async () => {
            await withScene(undefined, 'peso-leve', mode, async (page) => {
                const title = page.locator('h2').filter({ hasText: 'Prova título sem classe' });
                await expect(title).toHaveCSS('font-weight', '300');
                await expect(title).toHaveCSS('text-transform', 'uppercase');
                await expect(page.locator('body')).toHaveCSS('font-weight', '300');
            });
            await withScene(undefined, undefined, mode, async (page) => {
                const title = page.locator('h2').filter({ hasText: 'Prova título sem classe' });
                await expect(title, 'CONTRAPROVA: o padrão').toHaveCSS('font-weight', '700');
                await expect(title).toHaveCSS('text-transform', 'none');
            });
        });

        test('btnStyleType neumorphism: o botão ganha o relevo e perde a borda; matte não tem', async () => {
            await withScene('atomos', 'botao-neumorphism', mode, async (page) => {
                const button = page.locator('[data-probe="botao"] button');
                expect(await computed(button, 'box-shadow')).toMatch(/\) 5px 5px 10px/);
                await expect(button).toHaveCSS('border-top-style', 'none');
            });
            await withScene('atomos', undefined, mode, async (page) => {
                const button = page.locator('[data-probe="botao"] button');
                expect(await computed(button, 'box-shadow'), 'CONTRAPROVA: matte sem relevo').not.toMatch(/-5px -5px 10px/);
            });
        });
    });
}
