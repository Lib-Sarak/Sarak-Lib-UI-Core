/**
 * Nenhum controle do painel passa da borda da linha dele, em nenhuma decisão, nos seis idiomas, com e sem as fontes do tema.
 * A opção traduzida é maior que a em português ("Automático (até 5 itens na base)" → "Automatic (up to 5 items at the bottom)"):
 * se o `<select>` tem a largura da opção mais longa, ele estoura a coluna e a borda corta o texto.
 *
 * Também reprova o texto de qualquer opção mais largo que a área útil do seletor: caber na caixa não basta, o valor selecionado
 * aparece cortado quando o texto não cabe dentro dela.
 *
 * LIMITES DECLARADOS (R18): Chromium headless; o tema padrão do harness; lê `src/` pelo esbuild do harness e o CSS de `dist/sarak.css`;
 * mede a caixa de cada controle contra a da linha (`data-token-row`) e o texto da opção por `measureText` na fonte do seletor
 * (a área útil é a caixa menos o padding), não o pixel desenhado.
 */
import { test, expect, chromium, type Browser } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { buildHarness } from './build-harness.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ENTRY = path.join(HERE, 'fixtures', 'plan-141-presets-entry.tsx');
const LANGUAGES = ['pt', 'en', 'es', 'fr', 'de', 'it'] as const;
const DECISIONS = ['theme', 'colors', 'fonts', 'shape', 'components', 'bars', 'layout'] as const;
const TOLERANCE_PX = 1;

let browser: Browser;
let harnessDirectory: string;
let harnessUrl: string;

test.beforeAll(async () => {
    const executablePath = process.env.SARAK_CHROMIUM_EXECUTABLE_PATH;
    browser = await chromium.launch(executablePath ? { executablePath } : {});
    const harness = await buildHarness(ENTRY);
    harnessDirectory = harness.outDir;
    harnessUrl = pathToFileURL(harness.htmlPath).href;
});

test.afterAll(async () => {
    if (browser) await browser.close();
    if (harnessDirectory) fs.rmSync(harnessDirectory, { recursive: true, force: true });
});

interface Overflow { row: string; element: string; over: number }

for (const language of LANGUAGES) {
    for (const themeFonts of [true, false]) {
        test(`os controles cabem na linha, em ${language}, ${themeFonts ? 'com' : 'sem'} as fontes do tema`, async () => {
            const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
            const offenders: string[] = [];
            let rowsSeen = 0;
            for (const decision of DECISIONS) {
                await page.goto(`${harnessUrl}?alto=1000px&idioma=${language}${themeFonts ? '' : '&fontes=none'}`);
                await page.locator(`[data-decision-row="${decision}"]`).click();
                await page.waitForTimeout(400);
                const closed = page.locator('[data-group-toggle][aria-expanded="false"]');
                for (let round = 0; round < 60 && (await closed.count()) > 0; round += 1) await closed.first().click();
                await page.evaluate(() => document.fonts.ready);
                const found = await page.evaluate((tolerance): { rows: number; overflows: Overflow[] } => {
                    const rows = Array.from(document.querySelectorAll('[data-token-row]'));
                    const canvas = document.createElement('canvas').getContext('2d');
                    /** Quanto o texto da opção passa da área útil do seletor (caixa menos o respiro das bordas, que já reserva a seta). */
                    const optionOverflow = (select: HTMLSelectElement): { text: string; over: number } | null => {
                        if (!canvas) return null;
                        const style = getComputedStyle(select);
                        canvas.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
                        const usable = select.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
                        const widest = Array.from(select.options)
                            .map((option) => ({ text: option.text, over: canvas.measureText(option.text).width - usable }))
                            .sort((a, b) => b.over - a.over)[0];
                        return widest && widest.over > tolerance ? { text: widest.text, over: Math.round(widest.over) } : null;
                    };
                    const overflows = rows.flatMap((row): Overflow[] => {
                        const edge = row.getBoundingClientRect().right;
                        return Array.from(row.querySelectorAll('select, input, [role="slider"]')).flatMap((element) => {
                            const name = row.getAttribute('data-token-row') ?? '';
                            const over = element.getBoundingClientRect().right - edge;
                            const found: Overflow[] = over > tolerance ? [{ row: name, element: element.tagName.toLowerCase(), over: Math.round(over) }] : [];
                            const clipped = element instanceof HTMLSelectElement ? optionOverflow(element) : null;
                            if (clipped) found.push({ row: name, element: `option "${clipped.text}"`, over: clipped.over });
                            return found;
                        });
                    });
                    return { rows: rows.length, overflows };
                }, TOLERANCE_PX);
                rowsSeen += found.rows;
                found.overflows.forEach((item) => offenders.push(`${decision}/${item.row} <${item.element}> +${item.over}px`));
            }
            await page.close();
            expect(rowsSeen, 'linhas de token medidas').toBeGreaterThanOrEqual(60);
            expect(offenders).toEqual([]);
        });
    }
}
