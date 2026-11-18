import { test, chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { buildHarness } from './build-harness.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = 'C:/tmp/sarak-previa-161';
const LABEL = process.env.LOTE4_LABEL ?? 'lote4-antes';

test('Forma: antes', async () => {
    const executablePath = process.env.SARAK_CHROMIUM_EXECUTABLE_PATH;
    const browser = await chromium.launch(executablePath ? { executablePath } : {});
    const harness = await buildHarness(path.join(HERE, 'fixtures', 'plan-140-coluna-entry.tsx'));
    try {
        const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
        await page.goto(`${pathToFileURL(harness.htmlPath).href}?largura=1440px`);
        await page.getByRole('button', { name: /Usar minha marca/ }).waitFor();
        await page.waitForTimeout(600);
        await page.getByRole('button', { name: /^Forma/ }).click();
        await page.getByRole('heading', { level: 2, name: 'Forma' }).waitFor();
        await page.waitForTimeout(800);
        const scroll = () => page.evaluate(() => {
            let node: HTMLElement | null = document.querySelector('[data-testid^="decision-"]');
            while (node && !/(auto|scroll)/.test(getComputedStyle(node).overflowY)) node = node.parentElement;
            return { scrollHeight: node?.scrollHeight ?? 0, clientHeight: node?.clientHeight ?? 0 };
        });
        const out: Record<string, unknown> = {};
        out.padrao = await scroll();
        await page.screenshot({ path: path.join(OUT, `${LABEL}-forma-padrao.png`) });
        out.headers = await page.locator('[data-group-toggle]').evaluateAll((nodes) => nodes.map((n) => `${n.getAttribute('data-group-toggle')}:${n.getAttribute('aria-expanded')}:${(n.textContent ?? '').trim().slice(0, 40)}`));
        out.tabs = await page.locator('button').evaluateAll((nodes) => nodes.map((n) => (n.textContent ?? '').trim()).filter((t) => /Textura|Curados|Atmosferas/.test(t)));
        fs.writeFileSync(path.join(OUT, `medidas-${LABEL}.json`), JSON.stringify(out, null, 2));
        console.log('[lote4]', JSON.stringify(out));
    } finally {
        await browser.close();
        fs.rmSync(harness.outDir, { recursive: true, force: true });
    }
});
