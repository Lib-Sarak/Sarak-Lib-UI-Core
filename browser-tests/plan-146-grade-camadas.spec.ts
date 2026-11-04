/**
 * Grade e flex respeitam o espaço nos dois eixos, a confirmação abre acima de gaveta e modal, e a opção
 * selecionada do controle segmentado se distingue das outras — medidos em navegador real (o `jsdom` não
 * resolve `gap`, empilhamento nem contraste).
 *
 * -------------------------------------------------------------------------
 * LIMITES DECLARADOS (R18) — o que esta medição NÃO vê
 * -------------------------------------------------------------------------
 * 1. Só Chromium headless; geometria e cor COMPUTADA, nenhum pixel.
 * 2. O empilhamento é medido por `elementFromPoint` no centro do painel de cima, com `SarakModal` e `SarakDrawer`
 *    montados pelo consumidor e a confirmação vinda do `SarakOverlayProvider`; uma gaveta aberta PELO Provider é
 *    substituída pela confirmação (o Provider mantém um overlay por vez) e não entra nesta medição.
 * 3. Lê `src/` pelo esbuild do harness e o CSS de `dist/` — sem `npm run build` recente, mede a folha anterior.
 * -------------------------------------------------------------------------
 */
import fs from 'node:fs';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { buildHarness } from './build-harness.mjs';
import { SARAK_THEME_CATALOG } from '../src/core/Design/presets/themes/catalog.generated';

const ENTRY = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures', 'plan-146-entry.tsx');
const SUBPIXEL = 0.5;

let harnessDirectory: string;
let harnessUrl: string;

test.beforeAll(async () => {
    const harness = await buildHarness(ENTRY);
    harnessDirectory = harness.outDir;
    harnessUrl = pathToFileURL(harness.htmlPath).href;
});

test.afterAll(() => {
    if (harnessDirectory) fs.rmSync(harnessDirectory, { recursive: true, force: true });
});

async function open(page: Page, query: Record<string, string>): Promise<void> {
    await page.setViewportSize({ width: 1200, height: 900 });
    await page.goto(`${harnessUrl}?${new URLSearchParams(query).toString()}`);
    // Só as animações finitas: um tema com pulso infinito nunca "termina" e travaria a espera.
    await page.evaluate(() => Promise.all(document.getAnimations()
        .filter((animation) => animation.effect?.getComputedTiming().iterations !== Infinity)
        .map((animation) => animation.finished.catch(() => undefined))));
}

/** Os tokens de espaçamento medidos em pixels no próprio tema da página (`spacing-md`, `spacing-xs`, `spacing-xl`). */
async function spacing(page: Page): Promise<{ md: number; xs: number; xl: number }> {
    return page.evaluate(() => {
        const measure = (expression: string): number => {
            const probe = document.createElement('div');
            probe.style.cssText = `position:absolute;visibility:hidden;width:${expression}`;
            document.body.appendChild(probe);
            const width = probe.getBoundingClientRect().width;
            probe.remove();
            return width;
        };
        return {
            md: measure('var(--sarak-layout-gap-md, 16px)'),
            xs: measure('calc(var(--sarak-layout-gap-sm, 8px) * 0.5)'),
            xl: measure('calc(var(--sarak-layout-gap-lg, 24px) * 1.5)'),
        };
    });
}

/** Distância horizontal e vertical entre as células `a`/`b` (lado a lado) e `a`/`c` (uma sob a outra). */
async function gaps(page: Page, a: string, b: string, c: string): Promise<{ columns: number; rows: number }> {
    return page.evaluate(([first, second, third]) => {
        const rect = (id: string) => document.querySelector(`[data-probe="${id}"]`)!.getBoundingClientRect();
        return { columns: rect(second).left - rect(first).right, rows: rect(third).top - rect(first).bottom };
    }, [a, b, c]);
}

test.describe('grade e flex: espaço entre colunas', () => {
    test('só `gap`: os dois eixos valem o token (vermelho antes: zero entre colunas)', async ({ page }) => {
        await open(page, { cena: 'grade' });
        const { md } = await spacing(page);
        const grid = await gaps(page, 'g1', 'g2', 'g3');
        expect(Math.abs(grid.columns - md)).toBeLessThan(SUBPIXEL);
        expect(Math.abs(grid.rows - md)).toBeLessThan(SUBPIXEL);
        const computed = await page.locator('[data-probe="grade-gap"]').evaluate((el) => {
            const style = getComputedStyle(el);
            return { column: style.columnGap, row: style.rowGap };
        });
        expect(computed).toEqual({ column: `${md}px`, row: `${md}px` });
    });

    test('`rowGap` e `columnGap` vencem `gap` no eixo deles', async ({ page }) => {
        await open(page, { cena: 'grade' });
        const { xs, xl } = await spacing(page);
        const both = await gaps(page, 'e1', 'e2', 'e3');
        expect(Math.abs(both.columns - xs)).toBeLessThan(SUBPIXEL);
        expect(Math.abs(both.rows - xl)).toBeLessThan(SUBPIXEL);
    });

    test('só `rowGap`: a linha muda e a coluna continua no `gap`', async ({ page }) => {
        await open(page, { cena: 'grade' });
        const { md, xl } = await spacing(page);
        const rowOnly = await gaps(page, 'l1', 'l2', 'l3');
        expect(Math.abs(rowOnly.columns - md)).toBeLessThan(SUBPIXEL);
        expect(Math.abs(rowOnly.rows - xl)).toBeLessThan(SUBPIXEL);
    });

    test('flex: `gap` vale nos dois eixos e `columnGap` vence no eixo dele', async ({ page }) => {
        await open(page, { cena: 'grade' });
        const { md, xs, xl } = await spacing(page);
        const plain = await gaps(page, 'f1', 'f2', 'f2');
        expect(Math.abs(plain.columns - md)).toBeLessThan(SUBPIXEL);
        const axes = await gaps(page, 'x1', 'x2', 'x2');
        expect(Math.abs(axes.columns - xs)).toBeLessThan(SUBPIXEL);
        const rowGap = await page.locator('[data-probe="flex-eixos"]').evaluate((el) => getComputedStyle(el).rowGap);
        expect(rowGap).toBe(`${xl}px`);
    });
});

const MINIMUM_NON_TEXT_CONTRAST = 3;
const MODES = ['dark', 'light'] as const;

/** Cor efetiva do botão: o fundo dele composto sobre os fundos dos ancestrais, até o `html`. */
interface Fill { selected: [number, number, number]; others: [number, number, number][] }

async function readFills(page: Page): Promise<Fill> {
    return page.evaluate(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        const context = canvas.getContext('2d', { willReadFrequently: true })!;
        const toRgba = (css: string): [number, number, number, number] => {
            context.clearRect(0, 0, 1, 1);
            context.fillStyle = '#000';
            context.fillStyle = css;
            context.fillRect(0, 0, 1, 1);
            const [r, g, b, a] = context.getImageData(0, 0, 1, 1).data;
            return [r, g, b, a / 255];
        };
        const effective = (element: Element): [number, number, number] => {
            const layers: [number, number, number, number][] = [];
            for (let node: Element | null = element; node; node = node.parentElement) {
                layers.push(toRgba(getComputedStyle(node).backgroundColor));
            }
            let color: [number, number, number] = [255, 255, 255];
            for (const [r, g, b, a] of layers.reverse()) {
                color = [r * a + color[0] * (1 - a), g * a + color[1] * (1 - a), b * a + color[2] * (1 - a)];
            }
            return color;
        };
        const buttons = [...document.querySelectorAll<HTMLElement>('[data-probe="segmentado"] [role="radio"]')];
        const checked = buttons.find((button) => button.getAttribute('aria-checked') === 'true')!;
        return { selected: effective(checked), others: buttons.filter((button) => button !== checked).map(effective) };
    });
}

function luminance([red, green, blue]: readonly number[]): number {
    const linear = (channel: number): number => {
        const value = channel / 255;
        return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * linear(red) + 0.7152 * linear(green) + 0.0722 * linear(blue);
}

function contrast(first: readonly number[], second: readonly number[]): number {
    const [lighter, darker] = [luminance(first), luminance(second)].sort((a, b) => b - a);
    return (lighter + 0.05) / (darker + 0.05);
}

test.describe('controle segmentado: a opção selecionada se distingue das outras', () => {
    test.setTimeout(600_000);

    test(`${SARAK_THEME_CATALOG.length} temas × 2 modos: contraste não textual de 3:1 entre a selecionada e cada outra`, async ({ page }) => {
        const failures: string[] = [];
        let lowest = Infinity;
        for (const theme of SARAK_THEME_CATALOG) {
            for (const mode of MODES) {
                await open(page, { cena: 'segmentado', tema: theme.id, modo: mode });
                await page.waitForTimeout(400);
                const fills = await readFills(page);
                const worst = Math.min(...fills.others.map((other) => contrast(fills.selected, other)));
                lowest = Math.min(lowest, worst);
                if (worst < MINIMUM_NON_TEXT_CONTRAST) failures.push(`${theme.id}/${mode}: ${worst.toFixed(2)}:1`);
            }
        }
        test.info().annotations.push({ type: 'menor contraste medido', description: `${lowest.toFixed(2)}:1` });
        expect(failures, `reprovados: ${failures.join(' | ')}`).toEqual([]);
    });
});

const DRAWER = '[role="dialog"][tabindex="-1"]:not([aria-labelledby]):not([aria-label])';
const MODES_OF_INJECTION = [
    { name: 'app', query: {} },
    { name: 'embarcado', query: { embarcado: '1' } },
] as const;

/** `true` quando o elemento no centro do painel pertence ao próprio painel (nada o cobre). */
async function isOnTop(page: Page, selector: string): Promise<boolean> {
    return page.locator(selector).first().evaluate((panel) => {
        const box = panel.getBoundingClientRect();
        const hit = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2);
        return hit !== null && panel.contains(hit);
    });
}

const probe = (page: Page, name: string) => page.locator(`[data-probe="${name}"]`);

for (const injection of MODES_OF_INJECTION) {
    test.describe(`pilha de camadas (${injection.name})`, () => {
        test('modal aberto sobre a gaveta fica no topo, e Escape fecha só o modal', async ({ page }) => {
            await open(page, { cena: 'gaveta-e-modal', ...injection.query });
            await probe(page, 'abre-gaveta').click();
            await expect(page.locator(DRAWER)).toBeVisible();
            await probe(page, 'abre-modal').click();
            const modal = page.getByRole('dialog', { name: 'Modal sobre a gaveta' });
            await expect(modal).toBeVisible();
            expect(await isOnTop(page, '[role="dialog"][aria-labelledby]'), 'o centro do modal pertence ao modal').toBe(true);
            await probe(page, 'dentro-do-modal').focus();
            await page.keyboard.press('Escape');
            await expect(modal).toBeHidden();
            await expect(page.locator(DRAWER), 'a gaveta continua aberta').toBeVisible();
        });

        test('confirmação do Provider sobre a gaveta: o clique no centro cai nela e o foco volta à gaveta', async ({ page }) => {
            await open(page, { cena: 'gaveta-e-modal', ...injection.query });
            await probe(page, 'abre-gaveta').click();
            await probe(page, 'abre-confirmacao').click();
            const confirmation = page.getByRole('dialog', { name: 'Confirmar?' });
            await expect(confirmation).toBeVisible();
            expect(await isOnTop(page, '[role="dialog"][aria-labelledby]'), 'o centro da confirmação pertence a ela').toBe(true);
            const focusedInside = await confirmation.evaluate((panel) => panel.contains(document.activeElement));
            expect(focusedInside, 'o foco entra na confirmação').toBe(true);
            await page.getByRole('button', { name: /cancelar/i }).click();
            await expect(confirmation).toBeHidden();
            await expect(page.locator(DRAWER)).toBeVisible();
            const focusBack = await page.locator(DRAWER).evaluate((drawer) => drawer.contains(document.activeElement));
            expect(focusBack, 'o foco volta para dentro da gaveta').toBe(true);
        });

        test('a rolagem da página só destrava quando a última camada fecha', async ({ page }) => {
            await open(page, { cena: 'gaveta-e-modal', ...injection.query });
            const bodyOverflow = (): Promise<string> => page.evaluate(() => getComputedStyle(document.body).overflow);
            await probe(page, 'abre-gaveta').click();
            await probe(page, 'abre-confirmacao').click();
            await expect(page.getByRole('dialog', { name: 'Confirmar?' })).toBeVisible();
            expect(await bodyOverflow()).toBe('hidden');
            await page.getByRole('button', { name: /cancelar/i }).click();
            await expect(page.getByRole('dialog', { name: 'Confirmar?' })).toBeHidden();
            expect(await bodyOverflow(), 'a gaveta ainda está aberta: a rolagem segue travada').toBe('hidden');
            await page.keyboard.press('Escape');
            await expect(page.locator(DRAWER)).toBeHidden();
            expect(await bodyOverflow(), 'sem camada aberta a rolagem volta').not.toBe('hidden');
        });

        test('gaveta aberta sobre o modal fica no topo', async ({ page }) => {
            await open(page, { cena: 'modal-e-gaveta', ...injection.query });
            await probe(page, 'abre-modal').click();
            await expect(page.getByRole('dialog', { name: 'Modal base' })).toBeVisible();
            await probe(page, 'abre-gaveta').click();
            await expect(page.locator(DRAWER)).toBeVisible();
            await page.evaluate(() => Promise.all(document.getAnimations().map((animation) => animation.finished.catch(() => undefined))));
            expect(await isOnTop(page, DRAWER), 'o centro da gaveta pertence a ela').toBe(true);
            await probe(page, 'dentro-da-gaveta').click();
        });
    });
}
