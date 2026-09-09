/**
 * Medição de CSS RENDERIZADO do cromo (`SarakAppChrome`) num navegador real — o vão que
 * `jsdom` não fecha: ele não tem motor de layout e não resolve cascata de stylesheet
 * (specs/specs/07-responsividade-e-multidispositivo.md §6.1). A suíte `jsdom` já prova
 * que a CLASSE certa está na string; este arquivo prova que o valor COMPUTADO — depois
 * de `dist/sarak.css` cascatear de verdade — é o que a classe promete.
 *
 * Conjunto NOMEADO de elementos medidos, todos alcançados por âncora de contrato
 * (`getByRole` com o nome acessível — nunca seletor de estrutura interna):
 *   1. O item de navegação "Início" (`SarakMenuItem`, dentro de `SarakShellNav`, dentro
 *      de `SarakAppChrome`) — o elemento no centro da regressão que motivou este teste
 *      (ADR-013: item de menu herdando geometria de botão de ação).
 *   2. O toggle do drawer mobile, "Abrir menu de navegação" (`SarakAppChromeMobile`) —
 *      só usado para revelar o item de navegação no modo celular.
 *   3. O botão de referência "Referência" (`SarakButton`, renderizado na mesma página)
 *      — a métrica de AÇÃO que o item de navegação não pode herdar; serve de
 *      contraprova ao vivo, no lugar de números em px calculados à mão.
 *
 * As três faixas de specs/specs/07-responsividade-e-multidispositivo.md §2, medidas
 * contra o comportamento real de `SarakAppChrome.tsx` (device → modo):
 *   <768         → modo mobile (drawer)   → SarakMenuItem orientation="vertical"
 *   768–1023     → modo topbar (tablet)   → SarakMenuItem orientation="horizontal"
 *   ≥1024        → modo sidebar (default) → SarakMenuItem orientation="vertical"
 *
 * -------------------------------------------------------------------------
 * LIMITES DECLARADOS (R18) — o que esta medição NÃO vê
 * -------------------------------------------------------------------------
 * 1. NÃO mede pixel — nenhuma captura de tela, nenhum PNG de referência. Só valores
 *    COMPUTADOS (`getComputedStyle`) de propriedades nomeadas (text-transform,
 *    font-weight, padding). Regressão visual por pixel é escopo deliberadamente
 *    excluído — frágil, cara de manter, e não é o vão que este arquivo fecha.
 * 2. NÃO mede fonte carregada (`@font-face`/web font). O Chromium do harness usa a
 *    stack de fallback do sistema; `font-weight` computado é o que importa aqui, não
 *    o glifo renderizado.
 * 3. Cobre só os temas/tokens DEFAULT (`SarakUIProvider` sem `config`/tema custom). Um
 *    tema que sobrescreva `--sarak-*` de cromo não é medido — o conjunto é
 *    deliberadamente pequeno e nomeado (§2.4 da plan), não uma varredura de temas.
 * 4. NÃO substitui a suíte `jsdom`: não prova estrutura de DOM, não prova
 *    comportamento de evento além do necessário para revelar o drawer, não roda em
 *    `npx vitest run` (arquivo `.spec.ts`, fora do `include` do Vitest — ver
 *    `vitest.config.ts`). É complementar, não substituto.
 * 5. O harness carrega o pacote pelo artefato BUILDADO (`dist/index.js` +
 *    `dist/sarak.css`, via `build-harness.mjs`) — se `dist/` estiver desatualizado
 *    (sem `npm run build` recente), a medição mede o BUILD ANTERIOR, não o `src/`
 *    corrente. É o mesmo risco que specs/specs/07-responsividade-e-multidispositivo.md
 *    §7.1 já registra para qualquer medição sobre artefato publicado.
 * 6. Roda só em Chromium (headless). Não cobre Firefox/WebKit nem viewport mobile REAL
 *    (toque, densidade de pixel) — mede layout CSS, não a stack de renderização de um
 *    aparelho físico.
 * 7. A medição do `background-color` da raiz do cromo (`.sarak-chrome-root`, com/sem
 *    `globalBackgroundImageUrl`) cobre só o viewport DESKTOP — `rootStyle` é o mesmo
 *    objeto nos três modos de geometria (sidebar/topbar/mobile), então um viewport basta
 *    para provar o valor computado; os três modos já são cobertos por
 *    `SarakAppChrome.test.tsx` (jsdom). Também não mede se a IMAGEM em si carrega — só o
 *    `background-color` que a raiz emite (a mídia é resolvida pelo `SarakBackgroundRenderer`
 *    do Provider, atrás da raiz, não pela raiz do cromo).
 * -------------------------------------------------------------------------
 */
import { test, expect, chromium, type Browser, type Page } from '@playwright/test';
import fs from 'node:fs';
import { buildHarness } from './build-harness.mjs';

const BREAKPOINTS = {
    mobile: { width: 375, height: 800 }, // < 768 — specs/specs/07-responsividade-e-multidispositivo.md §2
    tablet: { width: 900, height: 800 }, // 768–1023
    desktop: { width: 1280, height: 900 }, // >= 1024
} as const;

const NAV_ITEM_NAME = 'Início';
const REFERENCE_BUTTON_NAME = 'Referência';
const DRAWER_TOGGLE_NAME = 'Abrir menu de navegação';
const CHROME_ROOT_SELECTOR = '.sarak-chrome-root';

interface ComputedMetric {
    textTransform: string;
    fontWeight: string;
    paddingTop: string;
    paddingLeft: string;
}

/** Lê as quatro propriedades computadas que distinguem métrica de LISTA/PÍLULA de métrica de AÇÃO. */
async function readComputedMetric(page: Page, accessibleName: string): Promise<ComputedMetric> {
    return page.getByRole('button', { name: accessibleName }).first().evaluate((el) => {
        const computed = getComputedStyle(el);
        return {
            textTransform: computed.textTransform,
            fontWeight: computed.fontWeight,
            paddingTop: computed.paddingTop,
            paddingLeft: computed.paddingLeft,
        };
    });
}

/** Lê o `background-color` COMPUTADO da raiz do cromo (`.sarak-chrome-root`). */
async function readRootBackgroundColor(page: Page): Promise<string> {
    return page.locator(CHROME_ROOT_SELECTOR).first().evaluate((el) => getComputedStyle(el).backgroundColor);
}

let harnessOutDir: string;
let harnessUrl: string;
let browser: Browser;

test.beforeAll(async () => {
    const { outDir, htmlPath } = await buildHarness();
    harnessOutDir = outDir;
    harnessUrl = 'file://' + htmlPath.split('\\').join('/');
    browser = await chromium.launch();
});

test.afterAll(async () => {
    await browser.close();
    fs.rmSync(harnessOutDir, { recursive: true, force: true });
});

async function openHarness(viewport: { width: number; height: number }): Promise<Page> {
    const page = await browser.newPage({ viewport });
    await page.goto(harnessUrl);
    const drawerToggle = page.getByRole('button', { name: DRAWER_TOGGLE_NAME });
    if (await drawerToggle.count() > 0) {
        await drawerToggle.click();
    }
    return page;
}

test('mobile (<768): item de navegação usa métrica de LISTA, não de botão de ação', async () => {
    const page = await openHarness(BREAKPOINTS.mobile);
    const item = await readComputedMetric(page, NAV_ITEM_NAME);
    const reference = await readComputedMetric(page, REFERENCE_BUTTON_NAME);

    expect(item.textTransform, 'item de navegação não pode ficar em caixa alta no modo lista').toBe('none');
    expect(reference.textTransform).toBe('uppercase'); // contraprova ao vivo: o botão de ação segue caixa alta
    expect(Number(item.fontWeight), 'peso do item não pode alcançar o font-black (900) do botão').toBeLessThan(Number(reference.fontWeight));
    expect(parseFloat(item.paddingTop), 'recuo vertical do item precisa ser menor que o padding do botão').toBeLessThan(parseFloat(reference.paddingTop));
    expect(parseFloat(item.paddingLeft), 'recuo horizontal do item precisa ser menor que o padding do botão').toBeLessThan(parseFloat(reference.paddingLeft));

    await page.close();
});

test('tablet (768-1023): item de navegação usa métrica de PÍLULA, mas nunca font-black de botão', async () => {
    const page = await openHarness(BREAKPOINTS.tablet);
    const item = await readComputedMetric(page, NAV_ITEM_NAME);
    const reference = await readComputedMetric(page, REFERENCE_BUTTON_NAME);

    expect(item.textTransform, 'aba compacta da topbar É caixa alta por desenho (ADR-013)').toBe('uppercase');
    expect(Number(item.fontWeight), 'aba é font-bold (700), nunca o font-black (900) do botão de ação').toBeLessThan(Number(reference.fontWeight));

    await page.close();
});

test('SEM mídia global: a raiz do cromo continua emitindo o fundo de token de hoje', async () => {
    const page = await openHarness(BREAKPOINTS.desktop);
    const backgroundColor = await readRootBackgroundColor(page);

    expect(backgroundColor, 'sem globalBackgroundImageUrl, a raiz continua pintando o token de fundo — não pode virar transparente').not.toBe('rgba(0, 0, 0, 0)');

    await page.close();
});

test('COM mídia global: a raiz do cromo deixa de pintar fundo opaco (SarakBackgroundRenderer aparece atrás)', async () => {
    const page = await browser.newPage({ viewport: BREAKPOINTS.desktop });
    await page.goto(`${harnessUrl}?bg=1`);
    const backgroundColor = await readRootBackgroundColor(page);

    expect(backgroundColor, 'com globalBackgroundImageUrl preenchido, a raiz não pode pintar fundo próprio').toBe('rgba(0, 0, 0, 0)');

    await page.close();
});

test('desktop (>=1024): item de navegação usa métrica de LISTA, não de botão de ação', async () => {
    const page = await openHarness(BREAKPOINTS.desktop);
    const item = await readComputedMetric(page, NAV_ITEM_NAME);
    const reference = await readComputedMetric(page, REFERENCE_BUTTON_NAME);

    expect(item.textTransform, 'item de navegação não pode ficar em caixa alta no modo lista').toBe('none');
    expect(Number(item.fontWeight), 'peso do item não pode alcançar o font-black (900) do botão').toBeLessThan(Number(reference.fontWeight));
    expect(parseFloat(item.paddingTop), 'recuo vertical do item precisa ser menor que o padding do botão').toBeLessThan(parseFloat(reference.paddingTop));
    expect(parseFloat(item.paddingLeft), 'recuo horizontal do item precisa ser menor que o padding do botão').toBeLessThan(parseFloat(reference.paddingLeft));

    await page.close();
});
