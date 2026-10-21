/**
 * O resíduo da re-auditoria de fechamento, medido em navegador real (o `jsdom` não calcula cascata, camada nem `@theme`):
 *   L4.1  a classe arbitrária sem espaço chega: o tooltip `fixed` tem o z-index do token;
 *   L4.2  `.transition-sarak` cede ao `duration-*` da classe (antes era `!important`);
 *   L4.3  `body[data-sarak-has-media]` apaga o fundo do contêiner de PÁGINA, não o do componente com `bg-theme-body`;
 *   L4.4  o `rounded-xl` do chamador vence o `rounded-btn` do botão (o `mergeSarakClasses` conhece as três classes de raio);
 *   L4.5  a sobreposição lê a sombra do tema (`--dynamic-shadow`), que segue a direção do tema;
 *   L4.6  a escada de camadas: lightbox acima do modal;
 *   L4.7  `text-theme-title` é o `titleColor` (e não o `topbarTitleColor` nem o `textColorMaster`);
 *   L4.8  sem Provider, o cartão é a cor do token (não a da superfície);
 *   L4.9  o `SarakDesignScope` (a prévia do painel) mostra o RASCUNHO também nos nomes do `@theme`: `rounded-btn`,
 *         `bg-theme-primary`, `--duration-fast`;
 *   L4.A  a vinheta e o ruído (atmosfera decorativa) ficam abaixo da notificação e do tooltip, acima do conteúdo;
 *   L4.13 desmontar o Provider devolve o `html`/`body` ao que eram.
 *
 * Mesmo harness e artefato do `cromo-css-real.spec.ts` (`dist/index.js` + `dist/sarak.css`), cenas `?cena=residuo`,
 * `escopo-rascunho` e `desmontar`; cada caso traz a contraprova do padrão.
 *
 * -------------------------------------------------------------------------
 * LIMITES DECLARADOS (R18) — o que esta medição NÃO vê
 * -------------------------------------------------------------------------
 * 1. Só valores COMPUTADOS de propriedades nomeadas em nós da cena; nenhum pixel.
 * 2. Só Chromium headless. O `SarakDesignScope` é medido com `?css=` global; o escopado (Modo Embarcado) não tem
 *    `:root` — o `.sarak-design-scope` da folha escopada não é medido aqui.
 * 3. A escada é medida no lightbox × token do modal; o toast e o menu da barra são lidos pelo teste de unidade
 *    (`SarakToast.layerToken.test.tsx`) e pelo texto da classe, não por abertura de cada um.
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

async function withScene<T>(params: Record<string, string>, measure: (page: Page) => Promise<T>, ready = '[data-sx-texture]'): Promise<T> {
    const page = await browser.newPage({ viewport: DESKTOP });
    try {
        await page.goto(`${harnessUrl}?${new URLSearchParams(params).toString()}`);
        await page.waitForSelector(ready, { state: 'attached' });
        return await measure(page);
    } finally {
        await page.close();
    }
}

const probe = (page: Page, name: string): Locator => page.locator(`[data-probe="${name}"]`);
const computed = (target: Locator, property: string): Promise<string> =>
    target.evaluate((el, prop) => getComputedStyle(el).getPropertyValue(prop), property);

test.describe('cascata: a classe do host vence a regra da lib', () => {
    test('L4.2 — `transition-sarak` roda na duração normal do tema, e o `duration-*` da classe decide', async () => {
        await withScene({ cena: 'residuo' }, async (page) => {
            expect(await computed(probe(page, 'transicao-padrao'), 'transition-duration'), 'o padrão: motionDurationNormal').toBe('0.3s');
            expect(await computed(probe(page, 'transicao-classe'), 'transition-duration'), 'a classe: 0,6 s').toBe('0.6s');
        });
    });

    test('L4.4 — o botão tem o raio do tema; o `rounded-xl` do chamador vence', async () => {
        await withScene({ cena: 'residuo', tema: 'botao-cantos' }, async (page) => {
            const system = await computed(probe(page, 'raio-sistema').getByRole('button'), 'border-top-left-radius');
            const reference = await computed(probe(page, 'raio-referencia'), 'border-top-left-radius');
            expect(system, 'CONTRAPROVA: sem classe do chamador, o raio do tema').not.toBe(reference);
            expect(await computed(probe(page, 'raio-classe').getByRole('button'), 'border-top-left-radius'), 'o rounded-xl do chamador').toBe(reference);
        });
    });
});

test.describe('mídia de fundo, título e cartão', () => {
    test('L4.3 — com mídia de fundo, o contêiner de página fica transparente e o componente com `bg-theme-body` mantém o fundo', async () => {
        await withScene({ cena: 'residuo', bg: '1' }, async (page) => {
            expect(await computed(probe(page, 'fundo-pagina'), 'background-color'), 'a página deixa a mídia aparecer').toBe('rgba(0, 0, 0, 0)');
            expect(await computed(probe(page, 'fundo-componente'), 'background-color'), 'o componente mantém o fundo').not.toBe('rgba(0, 0, 0, 0)');
        });
    });

    test('L4.3 — CONTRAPROVA: sem mídia, o contêiner de página tem o fundo do tema', async () => {
        await withScene({ cena: 'residuo' }, async (page) => {
            expect(await computed(probe(page, 'fundo-pagina'), 'background-color')).not.toBe('rgba(0, 0, 0, 0)');
        });
    });

    test('L4.7 — `text-theme-title` é o `titleColor` do tema, não a cor do título da barra nem o texto principal', async () => {
        await withScene({ cena: 'residuo', tema: 'titulo-proprio' }, async (page) => {
            await expect(probe(page, 'titulo')).toHaveCSS('color', 'rgb(255, 0, 0)');
        });
    });

    test('L4.8 — sem Provider, o cartão é a cor do token (`--theme-card`, sem a opacidade da superfície)', async () => {
        await withScene({ cena: 'sem-provider' }, async (page) => {
            expect(await computed(probe(page, 'cartao-sem-provider'), 'background-color')).toBe('rgb(16, 22, 34)');
        }, '[data-probe="cartao-sem-provider"]');
    });
});

test.describe('sobreposições: camada e sombra do tema', () => {
    test('L4.1 — o tooltip `fixed` tem o z-index do token (a classe com espaço nunca era gerada)', async () => {
        await withScene({ cena: 'residuo' }, async (page) => {
            await probe(page, 'dica').getByRole('button').hover();
            const tip = page.locator('[data-sarak-tooltip="true"]');
            await expect(tip).toBeVisible();

            expect(await computed(tip, 'z-index')).toBe('9000');
        });
    });

    test('L4.5 — o popup de ajuda lê a sombra do tema: a direção do tema chega a ele', async () => {
        for (const tema of ['sobreposicao-direcao', '']) {
            await withScene({ cena: 'residuo', ...(tema ? { tema } : {}) }, async (page) => {
                await probe(page, 'ajuda').getByRole('button').click();
                const popup = page.getByText('Texto de ajuda de prova').locator('xpath=ancestor::div[contains(@class,"card")][1]');
                const popupShadow = await computed(popup, 'box-shadow');
                const themeShadow = await computed(probe(page, 'sombra-tema'), 'box-shadow');

                expect(popupShadow.endsWith(themeShadow), `tema "${tema || 'padrão'}": a sombra do popup termina na do tema (antes dela só o reset das sombras do Tailwind)`).toBe(true);
                expect(themeShadow).not.toBe('none');
            });
        }
    });

    test('L4.5 — a direção muda a sombra do tema (a prova de que há o que seguir)', async () => {
        const shadows: string[] = [];
        for (const tema of ['sobreposicao-direcao', '']) {
            await withScene({ cena: 'residuo', ...(tema ? { tema } : {}) }, async (page) => {
                shadows.push(await computed(probe(page, 'sombra-tema'), 'box-shadow'));
            });
        }

        expect(shadows[0]).not.toBe(shadows[1]);
    });

    test('L4.6 — o lightbox fica acima do modal (a escada não tem empate nem inversão)', async () => {
        await withScene({ cena: 'lightbox' }, async (page) => {
            const lightbox = page.locator('.fixed.inset-0[class*="bg-black/90"]').first();
            const modalLayer = Number(await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--sarak-z-modal')));

            expect(Number(await computed(lightbox, 'z-index'))).toBeGreaterThan(modalLayer);
        });
    });
});

test.describe('a atmosfera decorativa fica abaixo da escada de sobreposições', () => {
    test('a vinheta tem camada acima da barra e abaixo de menu, modal, tooltip e notificação', async () => {
        await withScene({ cena: 'atmosfera' }, async (page) => {
            const toastStack = page.locator('[data-sarak-toast-stack="true"]');
            await expect(toastStack).toBeVisible();
            const vignette = Number(await computed(probe(page, 'vinheta'), 'z-index'));
            const toast = Number(await computed(toastStack, 'z-index'));
            const root = (name: string): Promise<number> =>
                page.evaluate((prop) => Number(getComputedStyle(document.documentElement).getPropertyValue(prop)), name);

            expect(vignette, 'acima da barra lateral (a atmosfera cobre o cromo)').toBeGreaterThan(await root('--sarak-z-sidebar'));
            expect(vignette, 'abaixo do modal').toBeLessThan(await root('--sarak-z-modal'));
            expect(vignette, 'abaixo do tooltip').toBeLessThan(await root('--sarak-z-tooltip'));
            expect(vignette, 'abaixo da notificação aberta').toBeLessThan(toast);
        });
    });
});

test.describe('medida: o brilho do marcador da navegação', () => {
    test('--sarak-nav-marker-glow sai SEM unidade, então o calc(var(…) * 1px) do SarakShellNav é válido', async () => {
        await withScene({ cena: 'residuo' }, async (page) => {
            const glow = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--sarak-nav-marker-glow').trim());
            const probeValid = await page.evaluate((value) => {
                const el = document.createElement('i');
                el.style.boxShadow = `0 0 calc(${value} * 1px) red`;
                return el.style.boxShadow !== '';
            }, glow);

            expect(glow).toMatch(/^[0-9.]+$/);
            expect(probeValid).toBe(true);
        });
    });
});

test.describe('o escopo do rascunho (a prévia do painel)', () => {
    test('L4.9 — dentro do `SarakDesignScope`, `rounded-btn`, `bg-theme-primary` e `--duration-fast` mostram o RASCUNHO', async () => {
        await withScene({ cena: 'escopo-rascunho' }, async (page) => {
            expect(await computed(probe(page, 'dentro-raio'), 'border-top-left-radius'), 'o raio do rascunho').toBe('30px');
            await expect(probe(page, 'dentro-cor')).toHaveCSS('background-color', 'rgb(255, 0, 0)');
            expect(await computed(probe(page, 'dentro-duracao'), 'transition-duration'), 'a duração rápida do rascunho').toBe('0.9s');
        });
    });

    test('L4.9 — CONTRAPROVA: fora do escopo, a página segue o tema aplicado', async () => {
        await withScene({ cena: 'escopo-rascunho' }, async (page) => {
            expect(await computed(probe(page, 'fora-raio'), 'border-top-left-radius')).not.toBe('30px');
            expect(await computed(probe(page, 'fora-cor'), 'background-color')).not.toBe('rgb(255, 0, 0)');
            expect(await computed(probe(page, 'fora-duracao'), 'transition-duration')).not.toBe('0.9s');
        });
    });
});

test.describe('o Provider sai e o host fica como estava', () => {
    test('L4.13 — depois de desmontar, o `html` e o `body` não carregam variável, classe de modo nem atributo de mídia', async () => {
        await withScene({ cena: 'desmontar' }, async (page) => {
            const snapshot = (): Promise<{ htmlVars: number; bodyVars: number; modeClass: boolean; media: boolean; tag: boolean }> =>
                page.evaluate(() => ({
                    htmlVars: Array.from(document.documentElement.style).filter((name) => name.startsWith('--')).length,
                    bodyVars: Array.from(document.body.style).filter((name) => name.startsWith('--')).length,
                    modeClass: document.body.classList.contains('light') || document.body.classList.contains('dark'),
                    media: document.body.hasAttribute('data-sarak-has-media'),
                    tag: document.getElementById('sarak-responsive-vars') !== null,
                }));

            const before = await snapshot();
            expect(before.htmlVars, 'montado: o tema está escrito').toBeGreaterThan(50);
            expect(before.modeClass).toBe(true);
            expect(before.media).toBe(true);

            await probe(page, 'desmontar').click();
            await expect(probe(page, 'dentro-provider')).toHaveCount(0);

            expect(await snapshot()).toEqual({ htmlVars: 0, bodyVars: 0, modeClass: false, media: false, tag: false });
        }, '[data-probe="desmontar"]');
    });
});
