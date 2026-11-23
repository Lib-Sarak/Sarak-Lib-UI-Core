/**
 * Medição, em navegador real, de que a barra de topo não esconde item de navegação sem sinal: com a composição que o ERP grava
 * (busca, P/M/G, Lateral/Topo e modo fixos na barra) e sete itens, todo item de navegação está visível inteiro ou dentro do
 * botão "Mais", no fim da lista, que abre os que não couberam. O harness é montado a partir do código-fonte (não do `dist/`).
 *
 * -------------------------------------------------------------------------
 * LIMITES DECLARADOS (R18) — o que esta medição NÃO vê
 * -------------------------------------------------------------------------
 * 1. Só o tema padrão do harness e a composição `pinned` do ERP; não mede tema embarcado com fonte diferente.
 * 2. Só 1440, 1280 e 1024 px, em Chromium headless; o celular tem outro cromo.
 * 3. Os itens são sete rótulos curtos; um item de rótulo muito longo não é exercitado.
 * 4. O leitor de tela não é executado: a medição lê os atributos (`aria-expanded`, `aria-haspopup`) e o teclado.
 * -------------------------------------------------------------------------
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { expect, test, type Locator, type Page } from '@playwright/test';
import { buildHarness } from './build-harness.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ENTRY = path.join(ROOT, 'browser-tests', 'fixtures', 'topbar-mais-entry.tsx');
const TAILWIND_CLI = path.join(ROOT, 'node_modules', '@tailwindcss', 'cli', 'dist', 'index.mjs');
const TOLERANCE_PX = 1;
const WIDTHS = [1440, 1280, 1024] as const;
const ITEM_LABELS = ['Início', 'Comercial', 'Financeiro', 'Projetos', 'Propostas', 'Contratos', 'Configurações'];

let harnessDirectory: string | undefined;
let harnessUrl = '';

test.beforeAll(async () => {
    const harness = await buildHarness(ENTRY);
    harnessDirectory = harness.outDir;
    harnessUrl = pathToFileURL(harness.htmlPath).href;
    execFileSync(process.execPath, [
        TAILWIND_CLI, '--input', path.join(ROOT, 'src', 'styles', 'sarak-base.css'),
        '--output', path.join(harnessDirectory, 'sarak.css'), '--minify',
    ], { cwd: ROOT, stdio: 'pipe' });
});

test.afterAll(() => {
    if (harnessDirectory) fs.rmSync(harnessDirectory, { recursive: true, force: true });
});

async function open(page: Page, width: number, query = ''): Promise<void> {
    await page.setViewportSize({ width, height: 800 });
    await page.goto(`${harnessUrl}${query}`);
    await page.locator('header nav').waitFor({ state: 'visible' });
    await page.waitForTimeout(400);
}

interface ItemState { label: string; inView: boolean }

/** Cada item de navegação da barra: visível (acessível e dentro da área útil da barra) ou não. */
const readItems = (page: Page): Promise<{ items: ItemState[]; moreVisible: boolean; headerRight: number; endRight: number }> => page.evaluate(() => {
    const nav = document.querySelector('header nav') as HTMLElement;
    const navRect = nav.getBoundingClientRect();
    const more = nav.querySelector('[data-sarak-nav-more]') as HTMLElement;
    const moreVisible = getComputedStyle(more).visibility !== 'hidden';
    const items = [...nav.querySelectorAll('[data-sarak-nav-cell] a')].map((link) => {
        const cell = link.closest('[data-sarak-nav-cell]') as HTMLElement;
        const rect = link.getBoundingClientRect();
        const hidden = getComputedStyle(cell).visibility === 'hidden';
        return { label: (link.textContent ?? '').trim(), inView: !hidden && rect.right <= navRect.right + 1 && rect.left >= navRect.left - 1 };
    });
    const header = document.querySelector('header') as HTMLElement;
    const endGroup = header.querySelector('.ml-auto') as HTMLElement;
    return {
        items, moreVisible,
        headerRight: header.getBoundingClientRect().right,
        endRight: Math.max(...[...endGroup.children].map((child) => child.getBoundingClientRect().right)),
    };
});

const moreButton = (page: Page): Locator => page.locator('header nav [data-sarak-nav-more] button');

for (const width of WIDTHS) {
    test(`a ${width}px todo item está visível inteiro ou no "Mais"`, async ({ page }) => {
        await open(page, width);
        const state = await readItems(page);
        expect(state.items.map((item) => item.label), 'os sete itens estão na lista').toEqual(ITEM_LABELS);
        const hidden = state.items.filter((item) => !item.inView).map((item) => item.label);
        expect(state.endRight, 'o grupo final não passa da borda da barra').toBeLessThanOrEqual(state.headerRight + TOLERANCE_PX);
        if (hidden.length === 0) {
            expect(state.moreVisible, 'tudo cabe: não há "Mais"').toBe(false);
            return;
        }
        expect(state.moreVisible, 'algo não coube: o "Mais" aparece').toBe(true);
        // Os que ficam são os primeiros, em ordem: o "Mais" só leva o fim da lista.
        expect(state.items.map((item) => item.inView)).toEqual(state.items.map((_, index) => index < state.items.length - hidden.length));
        await moreButton(page).click();
        const flyout = page.locator('[data-sarak-nav-flyout]');
        await expect(flyout).toBeVisible();
        const reachable = await flyout.getByRole('link').allTextContents();
        expect(reachable.map((text) => text.trim()), 'o "Mais" abre exatamente os que não couberam').toEqual(hidden);
    });
}

for (const width of WIDTHS) {
    test(`a ${width}px o "Mais" começa a um vão de item do último item visível, só com texto e seta`, async ({ page }) => {
        await open(page, width);
        const measured = await page.evaluate(() => {
            const nav = document.querySelector('header nav') as HTMLElement;
            const more = nav.querySelector('[data-sarak-nav-more]') as HTMLElement;
            const visible = [...nav.querySelectorAll<HTMLElement>('[data-sarak-nav-cell]')].filter((cell) => getComputedStyle(cell).visibility !== 'hidden');
            return {
                moreVisible: getComputedStyle(more).visibility !== 'hidden',
                gap: Number.parseFloat(getComputedStyle(nav).columnGap),
                lastRight: visible.length ? visible[visible.length - 1].getBoundingClientRect().right : 0,
                moreLeft: more.getBoundingClientRect().left,
                icons: more.querySelectorAll('svg').length,
            };
        });
        test.skip(!measured.moreVisible, 'tudo cabe: não há "Mais" para medir');
        expect(measured.gap, 'o vão de item é um valor medido, não zero').toBeGreaterThan(0);
        expect(Math.abs(measured.moreLeft - measured.lastRight - measured.gap), 'vão entre o último item visível e o "Mais"').toBeLessThanOrEqual(TOLERANCE_PX);
        expect(measured.icons, 'só a seta; o ícone de reticências saiu').toBe(1);
    });
}

test('a 1024px o "Mais" é botão com aria-expanded, abre por teclado e Esc devolve o foco', async ({ page }) => {
    await open(page, 1024);
    const button = moreButton(page);
    await expect(button).toBeVisible();
    await expect(button).toHaveAttribute('aria-haspopup', 'true');
    await expect(button).toHaveAttribute('aria-expanded', 'false');
    await button.focus();
    await page.keyboard.press('Enter');
    await expect(button).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('[data-sarak-nav-flyout] a').first()).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-sarak-nav-flyout]')).toHaveCount(0);
    await expect(button).toBeFocused();
});

test('item ativo escondido marca o "Mais" como ativo', async ({ page }) => {
    await open(page, 1024, '?ativo=6');
    const state = await readItems(page);
    expect(state.items[6].inView, 'o item ativo não coube').toBe(false);
    await expect(moreButton(page)).toHaveAttribute('data-sarak-nav-group-active', 'true');
});

test('itens escondidos não recebem foco por Tab', async ({ page }) => {
    await open(page, 1024);
    const state = await readItems(page);
    const hidden = state.items.filter((item) => !item.inView).map((item) => item.label);
    expect(hidden.length).toBeGreaterThan(0);
    const focusable = await page.evaluate(() => {
        const nav = document.querySelector('header nav') as HTMLElement;
        return [...nav.querySelectorAll<HTMLElement>('a[href], button')]
            .filter((element) => getComputedStyle(element).visibility !== 'hidden')
            .map((element) => (element.textContent ?? '').trim());
    });
    for (const label of hidden) expect(focusable).not.toContain(label);
});
