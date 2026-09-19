/**
 * A VITRINE de temas — gera, a partir do `dist/` já buildado, uma captura por
 * TEMA × MODO × ORIENTAÇÃO, e um arquivo único que reúne todas lado a lado, para
 * o dono aprovar visualmente o catálogo shippado. Roda por COMANDO DIRETO — não
 * há script equivalente em `package.json` ainda:
 *
 *     npx tsx browser-tests/generate-showcase.mts
 *
 * A saída vai para `browser-tests/showcase-output/` — dentro do repositório para o
 * dono abrir fácil, mas fora do versionamento (`.gitignore`).
 *
 * Cada captura mostra o cromo com o item "Início" ATIVO e o item "Relatórios" em
 * HOVER (mouse real, via Playwright) na mesma imagem, mais uma amostra de
 * conteúdo — card, tabela (as duas com a prop `data`, sem rede), botões, campos,
 * tipografia e o `SarakBadge` em todas as variantes (`showcase-entry.tsx`).
 *
 * O ids de tema vêm do CÓDIGO-FONTE (`GLOBAL_THEMES`), nunca transcritos (R17) —
 * este script só itera o que o dicionário já lista, e o total impresso ao final é
 * o que prova a cobertura, não uma contagem escrita à mão.
 */
import { chromium, type Browser } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildHarness } from './build-harness.mjs';
import { GLOBAL_THEMES } from '../src/core/Design/presets/themes/index.ts';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SHOWCASE_ENTRY = path.join(HERE, 'fixtures', 'showcase-entry.tsx');
const OUT_DIR = path.join(HERE, 'showcase-output');
const SCREENS_DIR = path.join(OUT_DIR, 'screens');
const VIEWPORT = { width: 1440, height: 960 };

const MODES = ['light', 'dark'] as const;
const ORIENTATIONS = ['sidebar', 'topbar'] as const;

interface CaptureResult {
    temaId: string;
    modo: (typeof MODES)[number];
    nav: (typeof ORIENTATIONS)[number];
    fileName: string;
    erro?: string;
}

async function captureOne(
    browser: Browser,
    harnessUrl: string,
    temaId: string,
    modo: (typeof MODES)[number],
    nav: (typeof ORIENTATIONS)[number],
): Promise<CaptureResult> {
    const fileName = `${temaId}__${modo}__${nav}.png`;
    const context = await browser.newContext({ viewport: VIEWPORT });
    const page = await context.newPage();
    try {
        await page.goto(`${harnessUrl}?tema=${encodeURIComponent(temaId)}&modo=${modo}&nav=${nav}`);
        // `isAutoHideEnabled` (specs/specs/05-cromo-e-slots.md §2.4) começa a nav OCULTA
        // até o ponteiro tocar o sensor fixo no canto (0,0) — sem isto, temas com o
        // token ligado nunca revelam "Início" (achado, não bug: o sensor é real).
        await page.mouse.move(2, 2);
        await page.mouse.move(4, 4);
        await page.getByRole('button', { name: 'Início' }).waitFor({ state: 'visible' });
        await page.getByRole('button', { name: 'Relatórios' }).hover();
        await page.screenshot({ path: path.join(SCREENS_DIR, fileName), fullPage: true });
        return { temaId, modo, nav, fileName };
    } catch (err) {
        return { temaId, modo, nav, fileName, erro: err instanceof Error ? err.message : String(err) };
    } finally {
        await context.close();
    }
}

function buildAggregatorHtml(results: CaptureResult[]): string {
    const byTheme = new Map<string, CaptureResult[]>();
    for (const r of results) {
        if (!byTheme.has(r.temaId)) byTheme.set(r.temaId, []);
        byTheme.get(r.temaId)!.push(r);
    }

    const rows = [...byTheme.entries()].map(([temaId, caps]) => {
        const cells = caps.map((c) => {
            const label = `${c.modo} / ${c.nav}`;
            const body = c.erro
                ? `<div class="erro">falhou: ${c.erro}</div>`
                : `<img src="screens/${c.fileName}" loading="lazy" alt="${temaId} ${label}" />`;
            return `<figure><figcaption>${label}</figcaption>${body}</figure>`;
        }).join('\n');
        return `<section><h2>${temaId}</h2><div class="grid">${cells}</div></section>`;
    }).join('\n');

    return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<title>Vitrine de temas — Sarak-Lib-UI-Core</title>
<style>
  body { font-family: system-ui, sans-serif; background: #111; color: #eee; margin: 0; padding: 24px; }
  h1 { margin-top: 0; }
  section { margin-bottom: 48px; border-top: 1px solid #333; padding-top: 16px; }
  .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 16px; }
  figure { margin: 0; background: #1b1b1b; border-radius: 8px; padding: 8px; }
  figcaption { font-size: 12px; opacity: 0.7; margin-bottom: 4px; }
  img { width: 100%; border-radius: 4px; display: block; }
  .erro { color: #f66; font-size: 12px; padding: 12px; }
</style>
</head>
<body>
<h1>Vitrine de temas — ${byTheme.size} tema(s), ${results.length} captura(s)</h1>
${rows}
</body>
</html>
`;
}

async function main() {
    fs.rmSync(OUT_DIR, { recursive: true, force: true });
    fs.mkdirSync(SCREENS_DIR, { recursive: true });

    console.log(`--- Vitrine de temas: ${GLOBAL_THEMES.length} tema(s) × ${MODES.length} modo(s) × ${ORIENTATIONS.length} orientação(ões) ---`);

    const { outDir: harnessOutDir, htmlPath } = await buildHarness(SHOWCASE_ENTRY);
    const harnessUrl = 'file://' + htmlPath.split('\\').join('/');
    const browser = await chromium.launch();

    const results: CaptureResult[] = [];
    try {
        for (const theme of GLOBAL_THEMES) {
            for (const modo of MODES) {
                for (const nav of ORIENTATIONS) {
                    const result = await captureOne(browser, harnessUrl, theme.id, modo, nav);
                    results.push(result);
                    console.log(result.erro ? `[FAIL] ${result.fileName}: ${result.erro}` : `[OK]   ${result.fileName}`);
                }
            }
        }
    } finally {
        await browser.close();
        fs.rmSync(harnessOutDir, { recursive: true, force: true });
    }

    const aggregatorPath = path.join(OUT_DIR, 'index.html');
    fs.writeFileSync(aggregatorPath, buildAggregatorHtml(results), 'utf8');

    const falhas = results.filter((r) => r.erro);
    console.log(`\n${results.length} captura(s) geradas, ${falhas.length} falha(s).`);
    console.log(`Abra: ${aggregatorPath}`);
    if (falhas.length > 0) process.exitCode = 1;
}

main();
