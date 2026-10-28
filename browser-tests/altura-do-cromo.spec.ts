/**
 * Medição, em navegador real, da altura do cromo sem a cadeia `height: 100%` em `html/body/#root` no host: com uma página bem
 * mais alta que a janela, a topbar continua parada onde estava e a rolagem fica só no `<main>` — a janela não rola sob a barra.
 * O `jsdom` não tem motor de layout e não calcula altura nem rolagem.
 *
 * -------------------------------------------------------------------------
 * LIMITES DECLARADOS (R18) — o que esta medição NÃO vê
 * -------------------------------------------------------------------------
 * 1. Só a topbar em 1280x600 (desktop); a sidebar e o cromo do celular usam o mesmo `<main>`, mas não são medidos aqui.
 * 2. Só o `<main>` como região de rolagem; não mede o filho com `fillHeight`/`sarak-fill-height` (ele só vira altura dentro do `<main>`).
 * 3. Só Chromium headless, contra o artefato de `dist/` que existia, com o harness montado sem cadeia de altura nem folha de estilo do host.
 * -------------------------------------------------------------------------
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { expect, test } from '@playwright/test';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { buildHarness } from './build-harness.mjs';

const HARNESS_ENTRY = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures', 'altura-do-cromo-entry.tsx');
const FILL_ENTRY = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures', 'altura-do-cromo-filho-entry.tsx');
const TOLERANCE_PX = 1;

let harnessDirectory: string;
let harnessUrl: string;

test.beforeAll(async () => {
    const harness = await buildHarness(HARNESS_ENTRY);
    harnessDirectory = harness.outDir;
    harnessUrl = pathToFileURL(harness.htmlPath).href;
});

test.afterAll(() => {
    if (harnessDirectory) {
        fs.rmSync(harnessDirectory, { recursive: true, force: true });
    }
});

test('página mais alta que a janela: a rolagem fica no main e a topbar não sai do topo', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 600 });
    await page.goto(harnessUrl);
    await expect(page.getByTestId('tall-page')).toBeVisible();

    const measurement = await page.evaluate(async () => {
        const main = document.querySelector<HTMLElement>('main[data-sarak-content]');
        const header = document.querySelector<HTMLElement>('header');
        if (!main || !header) {
            throw new Error('O cromo de topbar não foi montado.');
        }
        const headerTopBefore = header.getBoundingClientRect().top;
        main.scrollTop = 800;
        await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
        return {
            mainScrolls: main.scrollHeight > main.clientHeight,
            mainScrollTop: main.scrollTop,
            windowScrollY: window.scrollY,
            documentOverflow: document.documentElement.scrollHeight - window.innerHeight,
            headerTopBefore,
            headerTopAfter: header.getBoundingClientRect().top,
        };
    });

    expect(measurement.mainScrolls, 'o conteúdo alto deve rolar dentro do main').toBe(true);
    expect(measurement.mainScrollTop).toBeGreaterThan(0);
    expect(measurement.windowScrollY, 'a janela não pode rolar').toBe(0);
    expect(measurement.documentOverflow, 'o documento não pode passar da janela').toBeLessThanOrEqual(TOLERANCE_PX);
    expect(Math.abs(measurement.headerTopAfter - measurement.headerTopBefore), 'a topbar não se move com a rolagem').toBeLessThanOrEqual(TOLERANCE_PX);
});

/**
 * O `<main>` segue em bloco: o filho com `max-width` e `margin: 0 auto` mantém a largura máxima (em coluna flexível ele
 * encolhia ao conteúdo), e o filho com `sarak-fill-height` tem a altura do `<main>`. Usa o código-fonte e o CSS gerado
 * agora (a classe é nova; o `dist/` da rc.3 não a tem), numa pasta temporária.
 */
test('main em bloco: filho centralizado mantém a largura e sarak-fill-height enche a altura', async ({ page }) => {
    const harness = await buildHarness(FILL_ENTRY, { useSourceLibrary: true });
    try {
        execFileSync('npx', ['tailwindcss', '-i', './src/styles/sarak-base.css', '-o', path.join(harness.outDir, 'sarak.css'), '--minify'], { shell: true, stdio: 'pipe' });
        await page.setViewportSize({ width: 1440, height: 800 });
        await page.goto(pathToFileURL(harness.htmlPath).href);
        await expect(page.getByTestId('fill')).toBeVisible();

        const m = await page.evaluate(() => {
            const main = document.querySelector<HTMLElement>('main[data-sarak-content]')!;
            const cs = getComputedStyle(main);
            const box = (id: string) => document.querySelector<HTMLElement>(`[data-testid="${id}"]`)!.getBoundingClientRect();
            return {
                display: cs.display,
                mainContentHeight: main.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom),
                mainContentWidth: main.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight),
                centeredWidth: box('centered').width,
                fillHeight: box('fill').height,
            };
        });
        console.log(`MEDIDO ${JSON.stringify(m)}`);

        expect(m.display, 'o main segue em bloco').toBe('block');
        expect(m.mainContentWidth).toBeGreaterThan(1000);
        expect(m.centeredWidth, 'o filho centralizado mantém o max-width').toBeCloseTo(1000, 0);
        expect(m.fillHeight, 'o filho enche a altura do main').toBeCloseTo(m.mainContentHeight, 0);
    } finally {
        fs.rmSync(harness.outDir, { recursive: true, force: true });
    }
});
