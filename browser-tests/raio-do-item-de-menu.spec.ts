/**
 * Medição, em navegador real, de que o token `navItemRadius` governa o raio do item de navegação (o fundo do ativo e do
 * hover) nas três formas do item — lateral, topo e recolhido no topo — e de que o padrão (12) vale nelas. O `jsdom`
 * não resolve `rounded-[var(...)]` contra a variável que o motor emite, então a ligação token → pixel só se mede aqui.
 *
 * Mesmo harness e mesmo artefato do `token-que-desenha.spec.ts` (`dist/index.js` + `dist/sarak.css`), com os recortes
 * `?tema=raio-item-*` (ver `fixtures/harness-entry.tsx`). Cada caso lê o `border-top-left-radius` COMPUTADO do item ativo
 * e de um item inativo (o hover pinta a mesma caixa) e o compara com o valor do token.
 *
 * -------------------------------------------------------------------------
 * LIMITES DECLARADOS (R18) — o que esta medição NÃO vê
 * -------------------------------------------------------------------------
 * 1. Só o raio computado da caixa do item; não vê a cor do fundo do ativo/hover (outro token) nem o desenho do marcador.
 * 2. As três formas são medidas no Chromium, em 1440 px; o item do celular (drawer e barra de base) não tem caso próprio.
 * 3. O recolhido é medido na barra do topo (`isNavHidden`); o recolhido da lateral não tem raio próprio no átomo (herda o
 *    da lateral) e fica coberto pelo caso da lateral.
 * 4. Só Chromium headless. Lê o `dist/` — sem `npm run build` recente, mede o build anterior.
 * -------------------------------------------------------------------------
 */
import { test, expect, chromium, type Browser, type Page } from '@playwright/test';

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

type Form = 'lateral' | 'topo' | 'recolhido';

const QUERY: Record<Form, Record<string, string>> = {
    lateral: {},
    topo: { chrome: 'topbar', itens: '4' },
    recolhido: { chrome: 'topbar', itens: '4' },
};

/** Raios (ativo, inativo) do item de navegação, em px, para a forma e o recorte de token dados. */
async function itemRadii(form: Form, tema?: string): Promise<{ active: string; inactive: string }> {
    const page: Page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    try {
        const query = new URLSearchParams(QUERY[form]);
        if (tema) query.set('tema', tema);
        await page.goto(`${harnessUrl}?${query.toString()}`);
        await page.waitForFunction(() => document.querySelector('nav a[aria-current="page"]') !== null);
        // O cromo pode nascer com a navegação oculta até o ponteiro tocar o canto; garante o item visível e medível.
        await page.mouse.move(2, 2);
        return await page.evaluate(() => {
            const radius = (el: Element | null): string => getComputedStyle(el as Element).borderTopLeftRadius;
            return {
                active: radius(document.querySelector('nav a[aria-current="page"]')),
                inactive: radius(document.querySelector('nav a:not([aria-current="page"])')),
            };
        });
    } finally {
        await page.close();
    }
}

for (const form of ['lateral', 'topo'] as const) {
    test(`navItemRadius na forma "${form}": o padrão é 12px; 0 deixa reto; 20 arredonda — ativo e inativo`, async () => {
        const padrao = await itemRadii(form);
        expect(padrao).toEqual({ active: '12px', inactive: '12px' });
        const reto = await itemRadii(form, 'raio-item-zero');
        expect(reto).toEqual({ active: '0px', inactive: '0px' });
        const redondo = await itemRadii(form, 'raio-item-vinte');
        expect(redondo).toEqual({ active: '20px', inactive: '20px' });
    });
}

test('navItemRadius no item recolhido da barra do topo: segue o token (era o `rounded-lg` fixo)', async () => {
    const recolhido = await itemRadii('recolhido', 'raio-item-recolhido');
    expect(recolhido).toEqual({ active: '20px', inactive: '20px' });
});
