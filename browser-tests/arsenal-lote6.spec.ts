/**
 * Medição, em navegador real, dos achados do lote 6 do arsenal: a busca centrada da barra do topo
 * (`searchPositionTopbar: center`), o raio responsivo do acordeão (`borderRadius` por breakpoint) e a chave
 * `contentAlignment`, que saiu do schema e não pode mais mudar a região de conteúdo.
 *
 * Mesmo harness e mesmo artefato do `token-que-desenha.spec.ts` (`dist/index.js` + `dist/sarak.css`), com o Provider e os
 * componentes REAIS: `?chrome=topbar&itens=3&tema=busca-topo-*`, `?cena=atomos&tema=raio-responsivo`,
 * `?tema=alinhamento-removido` (ver `fixtures/harness-entry.tsx`).
 *
 * -------------------------------------------------------------------------
 * LIMITES DECLARADOS (R18) — o que esta medição NÃO vê
 * -------------------------------------------------------------------------
 * 1. Só geometria computada (caixas e `border-radius`); nenhum pixel. A busca centrada é medida contra o meio do espaço livre
 *    entre a navegação e o grupo final da barra, que é o que o token promete — NÃO contra o centro da janela.
 * 2. Com muitos destinos a navegação ocupa a barra e não há espaço livre: este caso usa 3 destinos de propósito e não prova o
 *    comportamento da busca quando a navegação transborda.
 * 3. O raio responsivo é lido em três larguras de janela (390, 900 e 1280 px) que o `DeviceProvider` mapeia para
 *    celular, tablet e desktop; larguras sobre os limites exatos não são medidas.
 * 4. A retirada de `contentAlignment` é medida pela ausência de efeito no `main`; o aviso de descarte é lido no console.
 * 5. Só Chromium headless. Lê o `dist/` — sem `npm run build` recente, mede o build anterior.
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

async function withPage<T>(query: Record<string, string>, width: number, measure: (page: Page, warnings: string[]) => Promise<T>): Promise<T> {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    const warnings: string[] = [];
    page.on('console', (message) => {
        if (message.type() === 'warning') warnings.push(message.text());
    });
    try {
        await page.goto(`${harnessUrl}?${new URLSearchParams(query).toString()}`);
        await page.waitForFunction(() => document.body.hasAttribute('data-sx-texture'));
        return await measure(page, warnings);
    } finally {
        await page.close();
    }
}

interface TopbarBoxes { searchLeft: number; searchRight: number; navRight: number; endLeft: number; searchWidth: number }

const topbarBoxes = (page: Page): Promise<TopbarBoxes> => page.evaluate(() => {
    const header = document.querySelector('header') as HTMLElement;
    const search = header.querySelector('[data-sarak-slot="search"]') as HTMLElement;
    const nav = header.querySelector('nav') as HTMLElement;
    const end = header.querySelector('.ml-auto') as HTMLElement;
    const box = search.getBoundingClientRect();
    return { searchLeft: box.left, searchRight: box.right, navRight: nav.getBoundingClientRect().right, endLeft: end.getBoundingClientRect().left, searchWidth: box.width };
});

test('P20: center põe a busca no meio do espaço livre entre a navegação e o grupo final; left a deixa colada à marca', async () => {
    const query = { chrome: 'topbar', itens: '3' };
    const left = await withPage({ ...query, tema: 'busca-topo-esquerda' }, 1600, topbarBoxes);
    const center = await withPage({ ...query, tema: 'busca-topo-centro' }, 1600, topbarBoxes);

    expect(left.searchWidth).toBeGreaterThan(0);
    expect(center.searchWidth).toBeGreaterThan(0);
    // `left`: a busca vem antes da navegação; `center`: depois dela.
    expect(left.searchRight).toBeLessThanOrEqual(left.navRight);
    expect(center.searchLeft).toBeGreaterThanOrEqual(center.navRight - 1);
    expect(center.searchLeft - left.searchLeft).toBeGreaterThan(100);

    const gapMiddle = (center.navRight + center.endLeft) / 2;
    const searchMiddle = (center.searchLeft + center.searchRight) / 2;
    expect(Math.abs(searchMiddle - gapMiddle)).toBeLessThan(3);
});

test('P22: borderRadius responsivo { mob, tab, desk } chega ao acordeão: a camada do dispositivo, não uma declaração descartada', async () => {
    const radius = (page: Page): Promise<string> =>
        page.locator('[data-probe="acordeao"] > div').first().evaluate((root) => getComputedStyle(root).borderTopLeftRadius);
    const query = { cena: 'atomos', tema: 'raio-responsivo' };
    expect(await withPage(query, 390, radius)).toBe('3px');
    expect(await withPage(query, 900, radius)).toBe('7px');
    expect(await withPage(query, 1280, radius)).toBe('11px');
});

test('P16: contentAlignment salvo num tema é descartado com aviso e a região de conteúdo não muda', async () => {
    const content = (page: Page) => page.locator('[data-sarak-content]').first().evaluate((main) => ({
        maxWidth: getComputedStyle(main).maxWidth,
        hasCenterClass: main.classList.contains('max-w-7xl'),
    }));
    const base = await withPage({}, 1600, content);
    const saved = await withPage({ tema: 'alinhamento-removido' }, 1600, async (page, warnings) => {
        const measured = await content(page);
        return { ...measured, warned: warnings.some((text) => text.includes('contentAlignment')) };
    });
    expect(saved.hasCenterClass).toBe(false);
    expect(saved.maxWidth).toBe(base.maxWidth);
    expect(saved.warned).toBe(true);
});
