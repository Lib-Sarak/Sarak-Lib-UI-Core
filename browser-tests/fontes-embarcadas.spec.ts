/**
 * As fontes embarcadas no navegador: com `options.fonts.baseUrl` apontando para a pasta `fonts/` do `dist/`, a fonte
 * que o tema declara é a que a página usa, e nenhuma requisição sai da máquina (nem Google Fonts, nem `preconnect`).
 * Sem `baseUrl`, o bundle IIFE do harness (esbuild) não tem `import.meta.url`: o carregador avisa, nomeando a família.
 *
 * O `jsdom` não baixa fonte: se o `@font-face` gerado carrega de fato, e o que vai para a rede, só o navegador mede
 * (specs/specs/11-testes-e-cobertura.md §7). Mesmo harness e mesmo artefato do `cromo-css-real.spec.ts`, cena
 * `?cena=fontes-embarcadas` (Orbitron nos títulos, Lora no corpo).
 *
 * -------------------------------------------------------------------------
 * LIMITES DECLARADOS (R18) — o que esta medição NÃO vê
 * -------------------------------------------------------------------------
 * 1. Só Chromium e só `file://` com `baseUrl`: o caminho `new URL(..., import.meta.url)` dentro do Vite/webpack do
 *    importador não passa por aqui (o harness é esbuild IIFE, que não o reescreve — por isso o caso do aviso).
 * 2. "Sem requisição externa" é o que a página PEDE (`page.on('request')`), em qualquer esquema fora de `file:`/`data:`;
 *    não inspeciona o sistema operacional nem extensões do navegador.
 * 3. A fonte "usada" é a família carregada (`document.fonts`) e a primeira família computada do título; não compara
 *    pixels da renderização.
 * 4. Lê o `dist/` — sem `npm run build` recente, mede o build anterior.
 * -------------------------------------------------------------------------
 */
import { test, expect, chromium, type Browser } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const harnessUrl = process.env.SARAK_CROMO_HARNESS_URL;
if (!harnessUrl) {
    throw new Error('O globalSetup não preparou o harness de CSS para esta execução do Playwright.');
}

/** A pasta `fonts/` do mesmo `dist/` que o harness empacota (ver `build-harness.mjs`). */
const DIST_FONTS = pathToFileURL(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist', 'fonts')).href;
const LOCAL_SCHEMES = /^(file|data|blob):/;

let browser: Browser;

test.beforeAll(async () => {
    browser = await chromium.launch();
});

test.afterAll(async () => {
    await browser.close();
});

test('com `baseUrl`: a fonte do tema é a que a página usa, sem nenhuma requisição externa', async () => {
    const page = await browser.newPage();
    const external: string[] = [];
    page.on('request', (request) => {
        if (!LOCAL_SCHEMES.test(request.url())) external.push(request.url());
    });
    await page.goto(`${harnessUrl}?cena=fontes-embarcadas&fontes=${encodeURIComponent(DIST_FONTS)}`);
    await page.waitForFunction(() => {
        const faces = Array.from(document.fonts);
        return ['Orbitron', 'Lora'].every((family) => faces.some((face) => face.family.replace(/"/g, '') === family && face.status === 'loaded'));
    });

    const probe = await page.evaluate(() => ({
        computed: getComputedStyle(document.querySelector('[data-probe="titulo"]') as Element).fontFamily,
        orbitron: document.fonts.check('700 32px "Orbitron"'),
        loaded: Array.from(document.fonts).filter((face) => face.status === 'loaded').map((face) => face.family.replace(/"/g, '')),
        preconnects: document.querySelectorAll('link[rel="preconnect"]').length,
    }));
    expect(probe.computed.split(',')[0].replace(/['"]/g, '').trim()).toBe('Orbitron');
    expect(probe.orbitron).toBe(true);
    expect(probe.loaded).toEqual(expect.arrayContaining(['Orbitron', 'Lora']));
    expect(probe.loaded).not.toContain('Inter');
    expect(probe.preconnects).toBe(0);
    expect(external).toEqual([]);
    await page.close();
});

test('sem `baseUrl` num bundle sem `import.meta.url`: aviso nomeando a família e a dica de `baseUrl`', async () => {
    const page = await browser.newPage();
    const warnings: string[] = [];
    page.on('console', (message) => {
        if (message.type() === 'warning') warnings.push(message.text());
    });
    await page.goto(`${harnessUrl}?cena=fontes-embarcadas`);
    await expect.poll(() => warnings.some((text) => text.includes('"Orbitron"'))).toBe(true);
    const orbitron = warnings.find((text) => text.includes('"Orbitron"')) ?? '';
    expect(orbitron).toContain('options.fonts.baseUrl');
    expect(warnings.filter((text) => text.includes('"Orbitron"'))).toHaveLength(1);
    await page.close();
});
