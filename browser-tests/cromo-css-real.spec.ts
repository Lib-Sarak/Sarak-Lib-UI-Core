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
 *   4. Os elementos de PROVA do padrão de elemento ("Prova raio por classe", "Prova hover
 *      por classe"/"sem classe", "Prova família por classe"/"sem classe", "Prova título
 *      por classe"/"sem classe", "Prova borda por classe"/"pelo token") — HTML nativo ao
 *      lado do botão de referência, para medir que a classe utilitária vence o padrão que
 *      a lib dá ao ELEMENTO, e que sem classe ele continua. Dois casos abrem a fixture
 *      com um recorte de tokens nomeado (`?tema=`): `botao-cantos` e `borda-tracejada`.
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
 * 3. Cobre os tokens DEFAULT (`SarakUIProvider` sem `config`) mais três recortes
 *    NOMEADOS de `config`: `?bg=1` (mídia global, item 7) e os dois de `?tema=` —
 *    `botao-cantos` (raio mestre 0, cantos 9999) e `borda-tracejada` (`borderStyle`
 *    dashed). NÃO mede tema que sobrescreva token de CROMO (`--sarak-topbar-*`,
 *    `--sarak-sidebar-*`, hover/ativo do item de navegação) e NÃO varre temas — o
 *    conjunto é deliberadamente pequeno e nomeado.
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
 * 8. Os casos "a classe vence o padrão de ELEMENTO" (raio, hover, família, estilo de
 *    borda) medem só as classes que o `dist/sarak.css` já emite — o `@source` do build
 *    varre `src/`, não a fixture. Cobrem o padrão de elemento em `<button>`, `<span>`,
 *    `<h2>` e na ponte `[class*="border"]`; `input`/`select`/`textarea` moram na mesma
 *    camada, mas não têm elemento de prova próprio aqui. A régua de cada caso é
 *    relacional: um `<i>` irmão (tag que nenhum padrão de elemento mira) com a mesma
 *    classe, ou com a expressão do token em estilo inline — nunca um valor em px escrito
 *    à mão.
 * 9. O que continua na camada final e NÃO cede à classe não é medido aqui: o `body`
 *    (o `line-height` de `_base.css` o prenderia) e o `transform !important` do botão
 *    ativo — `!important` vence a classe utilitária normal em qualquer camada.
 * -------------------------------------------------------------------------
 */
import { test, expect, chromium, type Browser, type Locator, type Page } from '@playwright/test';
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

/** Elementos de prova da fixture (`ElementDefaultProbes`), por nome acessível ou texto. */
const PROBE = {
    radiusByClass: 'Prova raio por classe',
    hoverByClass: 'Prova hover por classe',
    hoverWithoutClass: 'Prova hover sem classe',
    familyByClass: 'Prova família por classe',
    familyWithoutClass: 'Prova família sem classe',
    headingByClass: 'Prova título por classe',
    headingWithoutClass: 'Prova título sem classe',
    borderByClass: 'Prova borda por classe',
    borderFromTheme: 'Prova borda pelo token',
} as const;

/** O que `hover:bg-rose-500`, a classe do elemento de prova de hover, escreve em `background-color`. */
const HOVER_CLASS_EXPRESSION = 'var(--color-rose-500)';

interface ComputedMetric {
    textTransform: string;
    fontWeight: string;
    paddingTop: string;
    paddingLeft: string;
    borderRadius: string;
}

/** Lê as cinco propriedades computadas que distinguem métrica de LISTA/PÍLULA de métrica de AÇÃO. */
async function readComputedMetric(page: Page, accessibleName: string): Promise<ComputedMetric> {
    return page.getByRole('button', { name: accessibleName }).first().evaluate((el) => {
        const computed = getComputedStyle(el);
        return {
            textTransform: computed.textTransform,
            fontWeight: computed.fontWeight,
            paddingTop: computed.paddingTop,
            paddingLeft: computed.paddingLeft,
            borderRadius: computed.borderRadius,
        };
    });
}

interface ReferenceSource {
    className?: string;
    inlineValue?: string;
}

/**
 * Régua independente da cascata sob medição: um `<i>` irmão do elemento medido — tag que
 * nenhum padrão de elemento da lib mira —, com a classe dada ou com a expressão em estilo
 * inline (que vence qualquer camada). O valor computado dele é o que a classe, ou a
 * expressão, produz quando nada disputa a propriedade, no mesmo contexto de variáveis.
 */
async function resolveReference(target: Locator, property: string, source: ReferenceSource): Promise<string> {
    return target.evaluate((el, { property, className, inlineValue }) => {
        const probe = document.createElement('i');
        if (className) probe.className = className;
        if (inlineValue) probe.style.setProperty(property, inlineValue);
        (el.parentElement ?? document.body).appendChild(probe);
        const value = getComputedStyle(probe).getPropertyValue(property);
        probe.remove();
        return value;
    }, { property, ...source });
}

async function readComputed(target: Locator, property: string): Promise<string> {
    return target.evaluate((el, prop) => getComputedStyle(el).getPropertyValue(prop), property);
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

/** `tema` escolhe um recorte de tokens nomeado da fixture (`TOKEN_VARIANTS`); omitido, vale o default. */
async function openHarness(viewport: { width: number; height: number }, tema?: string): Promise<Page> {
    const page = await browser.newPage({ viewport });
    await page.goto(tema ? `${harnessUrl}?tema=${tema}` : harnessUrl);
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

test('tablet (768-1023): item de navegação usa métrica de PÍLULA em caixa normal, e nunca font-black de botão', async () => {
    const page = await openHarness(BREAKPOINTS.tablet);
    const item = await readComputedMetric(page, NAV_ITEM_NAME);
    const reference = await readComputedMetric(page, REFERENCE_BUTTON_NAME);

    expect(item.textTransform, 'aba compacta da topbar usa caixa normal — pílula com corpo legível, nunca a caixa alta de rótulo de seção').toBe('none');
    expect(Number(item.fontWeight), 'aba é font-bold (700), nunca o font-black (900) do botão de ação').toBeLessThan(Number(reference.fontWeight));

    await page.close();
});

test('tablet (768-1023): o raio do item de navegação é o da PÍLULA, distinto do botão de ação', async () => {
    // `05-cromo-e-slots.md` §2.1.1: o ramo horizontal é pílula (`rounded-full`). O padrão
    // de raio de `<button>` da lib mora numa camada que cede à classe utilitária — é isso
    // que deixa a pílula chegar à tela.
    const page = await openHarness(BREAKPOINTS.tablet);
    const item = await readComputedMetric(page, NAV_ITEM_NAME);
    const reference = await readComputedMetric(page, REFERENCE_BUTTON_NAME);

    expect(item.borderRadius, 'o raio do item de navegação (pílula) tem de ser diferente do raio do botão de ação').not.toBe(reference.borderRadius);

    await page.close();
});

test('NÃO MUDA NADA: o SarakButton de referência continua computando os CANTOS do token de botão', async () => {
    // Tema com mestre 0 e cantos 9999: só um tema com canto diferente do mestre prova que
    // os cantos chegam ao botão — com os dois iguais, o caso não distinguiria nada.
    const page = await openHarness(BREAKPOINTS.desktop, 'botao-cantos');
    const reference = page.getByRole('button', { name: REFERENCE_BUTTON_NAME });
    const cornerRadius = await resolveReference(reference, 'border-radius', { inlineValue: 'var(--sarak-btn-radius-tl)' });
    const masterRadius = await resolveReference(reference, 'border-radius', { inlineValue: 'var(--sarak-btn-border-radius)' });
    expect(cornerRadius, 'o canto precisa diferir do mestre, ou o caso não distingue nada').not.toBe(masterRadius);

    expect(await readComputed(reference, 'border-radius'), 'o raio do botão de ação é o dos cantos (btnRadiusTL/TR/BR/BL)').toBe(cornerRadius);

    await page.close();
});

test('<button> com rounded-full computa o raio da CLASSE, não o padrão de botão da lib', async () => {
    const page = await openHarness(BREAKPOINTS.desktop);
    const probe = page.getByRole('button', { name: PROBE.radiusByClass });
    const classRadius = await resolveReference(probe, 'border-radius', { className: 'rounded-full' });
    const reference = await readComputed(page.getByRole('button', { name: REFERENCE_BUTTON_NAME }), 'border-radius');

    expect(classRadius, 'a régua da classe precisa diferir do raio de botão, ou o caso não distingue nada').not.toBe(reference);
    expect(await readComputed(probe, 'border-radius'), 'rounded-full vence o padrão de raio de <button>').toBe(classRadius);

    await page.close();
});

test('sob hover, <button> com hover:bg-* computa o fundo da CLASSE', async () => {
    const page = await openHarness(BREAKPOINTS.desktop);
    const probe = page.getByRole('button', { name: PROBE.hoverByClass });
    const classBackground = await resolveReference(probe, 'background-color', { inlineValue: HOVER_CLASS_EXPRESSION });
    const themeHover = await resolveReference(probe, 'background-color', { inlineValue: 'var(--theme-primary-hover)' });
    expect(classBackground, 'o fundo da classe precisa diferir do hover do tema, ou o caso não distingue nada').not.toBe(themeHover);

    await probe.hover();
    await expect(probe, 'hover:bg-* vence o fundo de hover padrão de <button>').toHaveCSS('background-color', classBackground);

    await page.close();
});

test('NÃO MUDA NADA: sob hover, <button> sem classe de hover computa o fundo de hover do TEMA', async () => {
    const page = await openHarness(BREAKPOINTS.desktop);
    const probe = page.getByRole('button', { name: PROBE.hoverWithoutClass });
    const themeHover = await resolveReference(probe, 'background-color', { inlineValue: 'var(--theme-primary-hover)' });
    expect(themeHover, 'o hover do tema precisa diferir do fundo em repouso, ou o caso não distingue nada').not.toBe(await readComputed(probe, 'background-color'));

    await probe.hover();
    await expect(probe, 'sem classe, vale o fundo de hover do tema').toHaveCSS('background-color', themeHover);

    await page.close();
});

test('<span class="font-mono"> computa a família da CLASSE, não a família de texto da lib', async () => {
    const page = await openHarness(BREAKPOINTS.desktop);
    const probe = page.getByText(PROBE.familyByClass);
    const classFamily = await resolveReference(probe, 'font-family', { className: 'font-mono' });
    const themeFamily = await resolveReference(probe, 'font-family', { inlineValue: 'var(--font-main)' });
    expect(classFamily, 'a família da classe precisa diferir da do tema, ou o caso não distingue nada').not.toBe(themeFamily);

    expect(await readComputed(probe, 'font-family'), 'font-mono vence o padrão de família de <span>').toBe(classFamily);

    await page.close();
});

test('NÃO MUDA NADA: <span> sem classe computa a família do TEMA', async () => {
    const page = await openHarness(BREAKPOINTS.desktop);
    const probe = page.getByText(PROBE.familyWithoutClass);
    const themeFamily = await resolveReference(probe, 'font-family', { inlineValue: 'var(--font-main)' });

    expect(await readComputed(probe, 'font-family'), 'sem classe, vale a família de texto do tema').toBe(themeFamily);

    await page.close();
});

test('<h2 class="font-mono"> computa a família da CLASSE, não a família de título da lib', async () => {
    const page = await openHarness(BREAKPOINTS.desktop);
    const probe = page.getByRole('heading', { name: PROBE.headingByClass });
    const classFamily = await resolveReference(probe, 'font-family', { className: 'font-mono' });
    const headingFamily = await resolveReference(probe, 'font-family', { inlineValue: 'var(--font-heading)' });
    expect(classFamily, 'a família da classe precisa diferir da de título, ou o caso não distingue nada').not.toBe(headingFamily);

    expect(await readComputed(probe, 'font-family'), 'font-mono vence o padrão de família de título').toBe(classFamily);

    await page.close();
});

test('NÃO MUDA NADA: <h2> sem classe computa a família de TÍTULO do tema', async () => {
    const page = await openHarness(BREAKPOINTS.desktop);
    const probe = page.getByRole('heading', { name: PROBE.headingWithoutClass });
    const headingFamily = await resolveReference(probe, 'font-family', { inlineValue: 'var(--font-heading)' });

    expect(await readComputed(probe, 'font-family'), 'sem classe, vale a família de título do tema').toBe(headingFamily);

    await page.close();
});

test('elemento com border border-dashed, sob o token borderStyle solid (default), computa o estilo da CLASSE', async () => {
    const page = await openHarness(BREAKPOINTS.desktop);
    const probe = page.getByText(PROBE.borderByClass);

    expect(await readComputed(probe, 'border-top-style'), 'border-dashed vence o padrão de estilo de borda da lib').toBe('dashed');

    await page.close();
});

test('NÃO MUDA NADA: elemento com border, sob o token borderStyle dashed, computa o estilo do TOKEN', async () => {
    const page = await openHarness(BREAKPOINTS.desktop, 'borda-tracejada');
    const probe = page.getByText(PROBE.borderFromTheme);

    expect(await readComputed(probe, 'border-top-style'), 'a utilitária border segue o token borderStyle').toBe('dashed');

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
