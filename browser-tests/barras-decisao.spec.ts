/**
 * A decisão "Barras", em navegador real: o lugar onde se configura a barra (entre Componentes e Layout), o papel de cor que vale para
 * as duas barras e o interruptor da troca lateral/topo pelo usuário. O harness monta, do código-fonte, o painel de customização e,
 * ao lado, o cromo real do mesmo Provider (lateral, topo e um cromo sem a orientação fixada, o que o consumidor vê).
 *
 * -------------------------------------------------------------------------
 * LIMITES DECLARADOS (R18) — o que esta medição NÃO vê
 * -------------------------------------------------------------------------
 * 1. O papel de cor é medido pelo `background-color` de `aside` (lateral) e `header` (topo), o primeiro não transparente subindo
 *    pelos ancestrais; fundo em degradê ou com textura tem a cor-base lida, não o degradê.
 * 2. Só o tema `sarak-sovereign-classic` (declara tons e cores diferentes nas duas barras), nos dois modos, a 2440×1000 em Chromium
 *    headless; os outros 25 temas não entram.
 * 3. O interruptor é medido com a preferência `{"navigationStyle":"sidebar"}` já gravada no navegador; a preferência que chega por
 *    `onLoad` do host usa o mesmo caminho do Provider e não é exercitada aqui.
 * 4. "Invertida" vale também na lateral do Sovereign Classic, que já declara esse papel: com os dois tons iguais e um escolhido, as duas
 *    barras contam como escolhidas e a cor declarada não volta.
 * -------------------------------------------------------------------------
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { expect, test, type Page } from '@playwright/test';
import { buildHarness } from './build-harness.mjs';

const ENTRY = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures', 'barras-entry.tsx');
const CAPTURE_DIRECTORY = process.env.SARAK_PREVIA_PAINEL_DIR;
const STORAGE_KEY = 'sarak-ui-preferences-v1';

let harnessDirectory: string;
let harnessUrl: string;

test.beforeAll(async () => {
    const harness = await buildHarness(ENTRY, { useSourceLibrary: true });
    harnessDirectory = harness.outDir;
    harnessUrl = pathToFileURL(harness.htmlPath).href;
});

test.afterAll(() => {
    if (harnessDirectory) fs.rmSync(harnessDirectory, { recursive: true, force: true });
});

async function open(page: Page, query: Record<string, string> = {}, stored?: Record<string, unknown>): Promise<void> {
    await page.addInitScript(([key, value]) => {
        localStorage.clear();
        if (value) localStorage.setItem(key as string, value as string);
    }, [STORAGE_KEY, stored ? JSON.stringify(stored) : '']);
    await page.setViewportSize({ width: 2440, height: 1000 });
    await page.goto(`${harnessUrl}?${new URLSearchParams(query).toString()}`);
    await page.getByTestId(query.so === 'painel' ? 'panel-host' : 'chrome-sidebar').waitFor({ state: 'visible' });
    await page.waitForTimeout(500);
}

async function capture(page: Page, name: string, testId = 'panel-host'): Promise<void> {
    if (CAPTURE_DIRECTORY) await page.getByTestId(testId).screenshot({ path: path.join(CAPTURE_DIRECTORY, `l4-${name}.png`) });
}

const openDecision = async (page: Page, name: RegExp, heading: string): Promise<void> => {
    await page.getByRole('button', { name }).first().click();
    await page.getByRole('heading', { level: 2, name: heading }).waitFor();
    await page.locator('[data-decision-question], [data-option-group]').first().waitFor();
};

/** Abre a pergunta recolhida da decisão (o interruptor mora em "Onde fica a barra"). */
const openQuestion = async (page: Page, id: string): Promise<void> => {
    const section = page.locator(`[data-decision-question="${id}"]`);
    await section.getByRole('button').first().click();
};

/** A cor de fundo da barra: a do próprio elemento ou, se ele é transparente, a do primeiro ancestral que pinta. */
const barBackground = (page: Page, frame: string, selector: string): Promise<string> => page.evaluate(([id, sel]) => {
    let element = document.querySelector(`[data-testid="${id}"] ${sel}`) as HTMLElement | null;
    while (element) {
        const color = getComputedStyle(element).backgroundColor;
        if (!/^rgba\(\s*0,\s*0,\s*0,\s*0\s*\)$|^transparent$/.test(color)) return color;
        element = element.parentElement;
    }
    return '';
}, [frame, selector]);

const sidebarBackground = (page: Page): Promise<string> => barBackground(page, 'chrome-sidebar', 'aside');
const topbarBackground = (page: Page): Promise<string> => barBackground(page, 'chrome-topbar', 'header');

const applyChanges = async (page: Page): Promise<void> => {
    const apply = page.getByRole('button', { name: /^Aplicar/ });
    await expect(apply).toBeEnabled();
    await apply.click();
    await page.waitForTimeout(600);
};

test('a lista traz Barras entre Componentes e Layout, e cada token está numa das duas decisões', async ({ page }) => {
    await open(page, { so: 'painel' });
    const names = await page.locator('[data-decision-row]:not([data-decision-row="brand"])').evaluateAll((rows) => rows.map((row) => row.getAttribute('data-decision-row')));
    expect(names).toEqual(['theme', 'colors', 'fonts', 'shape', 'components', 'bars', 'layout']);
    await expect(page.locator('[data-decision-row="bars"]')).toContainText(/Lateral|No topo/i);
    await capture(page, 'lista');

    await openDecision(page, /^Barras/, 'Barras');
    const groups = await page.locator('[data-option-group]').evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-option-group')));
    expect(groups).toEqual(['barTone', 'sidebar', 'topbar']);
    const questions = await page.locator('[data-decision-question]').evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-decision-question')));
    expect(questions).toEqual(['where', 'how', 'what', 'brand', 'behavior']);
    for (const id of questions) await openQuestion(page, id!);
    await expect(page.getByTestId('bar-switch')).toBeVisible();
    const barTokens = await page.locator('[data-token-row]').evaluateAll((rows) => rows.map((row) => row.getAttribute('data-token-row')));

    await page.getByRole('button', { name: 'Voltar para a lista de decisões' }).click();
    await openDecision(page, /^Layout/, 'Layout');
    const layoutGroups = await page.locator('[data-option-group]').evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-option-group')));
    expect(layoutGroups).toEqual(['contentWidth', 'globalBlock']);
    expect(await page.locator('[data-decision-question]').count()).toBe(0);
    await capture(page, 'layout-magro');
    const layoutTokens = await page.locator('[data-token-row]').evaluateAll((rows) => rows.map((row) => row.getAttribute('data-token-row')));
    expect(barTokens.filter((id) => layoutTokens.includes(id!))).toEqual([]);
    expect(barTokens).toEqual(expect.arrayContaining(['sidebarTone', 'topbarTone', 'navigationStyle', 'preferenceNavigationStylePosition']));
});

for (const mode of [{ name: 'escuro', query: {} }, { name: 'claro', query: { claro: '1' } }]) {
    test(`um papel de cor escolhido na decisão pinta a lateral e o topo do cromo real do mesmo jeito, num tema que declara cores diferentes (${mode.name})`, async ({ page }) => {
        await open(page, { ...mode.query });
        const before = { sidebar: await sidebarBackground(page), topbar: await topbarBackground(page) };
        if (mode.name === 'claro') expect(before.sidebar, 'o tema declara cores diferentes nas duas barras').not.toBe(before.topbar);
        await capture(page, `tom-antes-${mode.name}`, 'chrome-sidebar');

        await openDecision(page, /^Barras/, 'Barras');
        await page.locator('[data-option-group="barTone"] [data-option-tile]').first().waitFor();
        await page.locator('[data-option-group="barTone"]').getByRole('button', { name: 'Cor da marca', exact: true }).click();
        await applyChanges(page);

        const after = { sidebar: await sidebarBackground(page), topbar: await topbarBackground(page) };
        expect(after.sidebar, 'a lateral mudou').not.toBe(before.sidebar);
        expect(after.topbar, 'o topo mudou').not.toBe(before.topbar);
        expect(after.sidebar, 'as duas barras ficaram iguais').toBe(after.topbar);
        await capture(page, `tom-depois-${mode.name}`, 'chrome-sidebar');
        await capture(page, `tom-topo-depois-${mode.name}`, 'chrome-topbar');

        await page.locator('[data-option-group="barTone"]').getByRole('button', { name: 'Secundária', exact: true }).click();
        await applyChanges(page);
        const secondary = { sidebar: await sidebarBackground(page), topbar: await topbarBackground(page) };
        expect(secondary.sidebar).not.toBe(after.sidebar);
        expect(secondary.sidebar).toBe(secondary.topbar);

        // O tema já declara "Invertida" para a lateral: o papel igual ao do tema também vence a cor declarada.
        await page.locator('[data-option-group="barTone"]').getByRole('button', { name: 'Invertida', exact: true }).click();
        await applyChanges(page);
        const inverse = { sidebar: await sidebarBackground(page), topbar: await topbarBackground(page) };
        expect(inverse.sidebar, 'Invertida: a lateral não fica com a cor que o tema declara').not.toBe(before.sidebar);
        expect(inverse.sidebar, 'Invertida: as duas barras ficam iguais').toBe(inverse.topbar);
        await capture(page, `tom-invertida-${mode.name}`, 'chrome-sidebar');
        await capture(page, `tom-invertida-topo-${mode.name}`, 'chrome-topbar');
    });
}

test('interruptor da troca lateral/topo: ligado a preferência gravada vence; desligado, a orientação do administrador vale', async ({ page }) => {
    await open(
        page,
        { design: JSON.stringify({ navigationStyle: 'topbar', preferenceNavigationStylePosition: 'menu' }), theme: 'sarak-sovereign' },
        { navigationStyle: 'sidebar' },
    );
    const auto = page.getByTestId('chrome-auto');
    await expect(auto.locator('aside')).toHaveCount(1);
    await expect(auto.locator('header')).toHaveCount(0);

    await openDecision(page, /^Barras/, 'Barras');
    await openQuestion(page, 'where');
    const toggle = page.getByTestId('bar-switch').getByRole('switch');
    await expect(toggle).toBeChecked();
    await capture(page, 'interruptor-ligado');
    await toggle.click({ force: true });
    await expect(toggle).not.toBeChecked();
    await capture(page, 'interruptor-desligado');
    await applyChanges(page);

    await expect(auto.locator('header')).toHaveCount(1);
    await expect(auto.locator('aside')).toHaveCount(0);
    expect(await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY)).toContain('"navigationStyle":"sidebar"');

    // A escolha lateral/topo não está na barra nem no menu ⚙ (o menu pode nem existir se nada mais sobra nele).
    const choice = auto.getByText(/^(Lateral|Topo|No topo)$/);
    await expect(choice).toHaveCount(0);
    const settings = auto.getByRole('button', { name: 'Preferências' });
    if (await settings.count() > 0) {
        await settings.click();
        await expect(page.getByRole('menu')).toBeVisible();
        await expect(page.getByRole('menuitemradio', { name: /^(Lateral|Topo|No topo)$/ })).toHaveCount(0);
        await expect(page.getByRole('menu').getByText(/^(Lateral|Topo|No topo)$/)).toHaveCount(0);
    }
});
