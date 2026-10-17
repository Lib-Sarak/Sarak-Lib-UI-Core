/**
 * A VITRINE de temas — gera, a partir do `dist/` já buildado, uma captura por
 * TEMA × MODO × DISPOSITIVO × CENA, e um arquivo único que reúne todas lado a lado,
 * para o dono aprovar visualmente o catálogo shippado. Roda pelo script do
 * `package.json` (precisa de `npm run build` antes — lê o `dist/`):
 *
 *     npm run themes:showcase
 *     npm run themes:showcase -- --tema=sarak-sovereign,neo-brutalism --dispositivos=mobile
 *
 * A saída vai para `browser-tests/showcase-output/` — dentro do repositório para o
 * dono abrir fácil, mas fora do versionamento (`.gitignore`).
 *
 * Os eixos:
 *   - MODO: `light` e `dark`, sempre os dois.
 *   - DISPOSITIVO: `desktop` (1440 × 960, cromo lateral E de topo) e `mobile` (390 × 844,
 *     toque real — `pointer: coarse` —, só a navegação padrão: a lateral vira gaveta e o
 *     tema não escolhe a orientação ali).
 *   - CENA: `telas` (página inteira: cromo com o item "Início" ATIVO e "Relatórios" em HOVER
 *     na mesma imagem, mais as telas representativas — cartões, tabela, formulário com erro,
 *     status com forma, gráfico, calendário, estado vazio e chat; ver `showcase-entry.tsx`) e
 *     `modal` (o cromo com um modal aberto por cima, só na navegação padrão).
 *
 * `--tema=<id[,id]>` limita aos ids dados (os ids vêm do código, `SARAK_ALL_THEMES`, e um id
 * desconhecido falha cedo); `--dispositivos=<desktop|mobile[,…]>` limita os dispositivos. Sem
 * as duas, a vitrine cobre todo o catálogo nos dois dispositivos.
 *
 * O ids de tema vêm do CÓDIGO-FONTE (`SARAK_ALL_THEMES`), nunca transcritos (R17) —
 * este script só itera o que o dicionário já lista, e o total impresso ao final é
 * o que prova a cobertura, não uma contagem escrita à mão.
 */
import { chromium, type Browser, type BrowserContextOptions, type Page } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildHarness } from './build-harness.mjs';
import { SARAK_ALL_THEMES } from '../src/core/Design/presets/themes/all.ts';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SHOWCASE_ENTRY = path.join(HERE, 'fixtures', 'showcase-entry.tsx');
const OUT_DIR = path.join(HERE, 'showcase-output');
const SCREENS_DIR = path.join(OUT_DIR, 'screens');

const MODES = ['light', 'dark'] as const;
const ORIENTATIONS = ['sidebar', 'topbar'] as const;
const SCENES = ['telas', 'modal'] as const;

type Mode = (typeof MODES)[number];
type Orientation = (typeof ORIENTATIONS)[number];
type Scene = (typeof SCENES)[number];

interface Device {
    name: 'desktop' | 'mobile';
    context: BrowserContextOptions;
    /** As orientações de navegação que o dispositivo tem: no celular a lateral é gaveta e o tema não a escolhe. */
    orientations: readonly Orientation[];
}

const DEVICES: readonly Device[] = [
    { name: 'desktop', context: { viewport: { width: 1440, height: 960 } }, orientations: ORIENTATIONS },
    { name: 'mobile', context: { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true }, orientations: ['sidebar'] },
];

/** Telas que a cena `telas` monta e o gerador espera (`data-showcase` em `showcase-entry.tsx`). */
const SHOWCASE_SCREENS = ['cartoes', 'tabela', 'formulario', 'status', 'grafico', 'calendario', 'estado-vazio', 'chat'] as const;
/** Onde o gráfico (motor lazy) termina de desenhar: canvas do ECharts ou svg do Recharts. */
const CHART_DRAWN = '[data-showcase="grafico"] canvas, [data-showcase="grafico"] svg.recharts-surface';

interface CaptureResult {
    temaId: string;
    modo: Mode;
    nav: Orientation;
    dispositivo: Device['name'];
    cena: Scene;
    fileName: string;
    erro?: string;
}

interface CaptureRequest {
    temaId: string;
    modo: Mode;
    nav: Orientation;
    device: Device;
    cena: Scene;
}

function readListFlag(name: string): string[] | undefined {
    const raw = process.argv.find((arg) => arg.startsWith(`--${name}=`));
    return raw ? raw.slice(name.length + 3).split(',').map((item) => item.trim()).filter(Boolean) : undefined;
}

/** Os pedidos que o catálogo, os eixos e os filtros da linha de comando produzem — a cena `modal` só na navegação padrão. */
function buildRequests(): CaptureRequest[] {
    const known = SARAK_ALL_THEMES.map((theme) => theme.id);
    const onlyThemes = readListFlag('tema');
    const unknown = (onlyThemes ?? []).filter((id) => !known.includes(id as (typeof known)[number]));
    if (unknown.length > 0) throw new Error(`themes:showcase: tema(s) fora do catálogo: ${unknown.join(', ')}. Ids: ${known.join(', ')}`);
    const onlyDevices = readListFlag('dispositivos');
    const devices = DEVICES.filter((device) => !onlyDevices || onlyDevices.includes(device.name));
    if (devices.length === 0) throw new Error(`themes:showcase: --dispositivos precisa citar ${DEVICES.map((device) => device.name).join(' ou ')}`);

    const requests: CaptureRequest[] = [];
    for (const temaId of known.filter((id) => !onlyThemes || onlyThemes.includes(id))) {
        for (const modo of MODES) {
            for (const device of devices) {
                for (const nav of device.orientations) {
                    for (const cena of SCENES) {
                        if (cena === 'modal' && nav !== 'sidebar') continue;
                        requests.push({ temaId, modo, nav, device, cena });
                    }
                }
            }
        }
    }
    return requests;
}

/** Espera o que renderiza tarde: o item de navegação (visível no celular só na gaveta) e, na cena de telas, cada tela e o gráfico. */
async function waitForScene(page: Page, request: CaptureRequest): Promise<void> {
    // `isAutoHideEnabled` (specs/specs/05-cromo-e-slots.md §2.4) começa a nav OCULTA
    // até o ponteiro tocar o sensor fixo no canto (0,0) — sem isto, temas com o
    // token ligado nunca revelam "Início" (achado, não bug: o sensor é real).
    if (request.device.name === 'desktop') {
        await page.mouse.move(2, 2);
        await page.mouse.move(4, 4);
        await page.getByRole('link', { name: 'Início' }).waitFor({ state: 'visible' });
    }
    if (request.cena === 'modal') {
        await page.getByRole('dialog').waitFor({ state: 'visible' });
        return;
    }
    for (const screen of SHOWCASE_SCREENS) await page.locator(`[data-showcase="${screen}"]`).waitFor({ state: 'visible' });
    await page.locator(CHART_DRAWN).first().waitFor({ state: 'attached' });
}

/** Teto da altura da captura: uma página mais alta que isto é defeito da cena, não do tema. */
const MAX_CAPTURE_HEIGHT = 8000;

/**
 * O cromo ocupa a janela e rola por dentro (`main`), então `fullPage` não mostra o que está abaixo da dobra.
 * Cresce a janela pela sobra do maior contêiner que rola, para a captura mostrar TODA a cena.
 */
async function growViewportToContent(page: Page): Promise<void> {
    const overflow = await page.evaluate(() => {
        const scrollers = [...document.querySelectorAll<HTMLElement>('*')].filter((el) => {
            const overflowY = getComputedStyle(el).overflowY;
            return (overflowY === 'auto' || overflowY === 'scroll') && el.scrollHeight > el.clientHeight;
        });
        return Math.max(0, ...scrollers.map((el) => el.scrollHeight - el.clientHeight));
    });
    const size = page.viewportSize();
    if (!size || overflow === 0) return;
    await page.setViewportSize({ width: size.width, height: Math.min(size.height + overflow, MAX_CAPTURE_HEIGHT) });
    // O gráfico e o calendário redesenham ao mudar a janela.
    await page.waitForTimeout(600);
}

async function captureOne(browser: Browser, harnessUrl: string, request: CaptureRequest): Promise<CaptureResult> {
    const { temaId, modo, nav, device, cena } = request;
    const fileName = `${temaId}__${modo}__${nav}__${device.name}__${cena}.png`;
    const result = { temaId, modo, nav, dispositivo: device.name, cena, fileName };
    const context = await browser.newContext(device.context);
    const page = await context.newPage();
    try {
        await page.goto(`${harnessUrl}?tema=${encodeURIComponent(temaId)}&modo=${modo}&nav=${nav}&cena=${cena}`);
        await waitForScene(page, request);
        if (device.name === 'desktop' && cena === 'telas') await page.getByRole('link', { name: 'Relatórios' }).hover();
        // Deixa a entrada animada dos componentes (framer-motion) assentar antes da foto.
        await page.waitForTimeout(400);
        if (cena === 'telas') await growViewportToContent(page);
        await page.screenshot({ path: path.join(SCREENS_DIR, fileName), fullPage: cena === 'telas' });
        return result;
    } catch (err) {
        return { ...result, erro: err instanceof Error ? err.message : String(err) };
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
            const label = `${c.modo} / ${c.dispositivo} / ${c.nav} / ${c.cena}`;
            const body = c.erro
                ? `<div class="erro">falhou: ${c.erro}</div>`
                : `<img src="screens/${c.fileName}" loading="lazy" alt="${temaId} ${label}" />`;
            return `<figure class="${c.dispositivo}"><figcaption>${label}</figcaption>${body}</figure>`;
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
  .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 16px; align-items: start; }
  figure { margin: 0; background: #1b1b1b; border-radius: 8px; padding: 8px; }
  figure.mobile img { max-width: 390px; margin-inline: auto; }
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
    const requests = buildRequests();
    fs.rmSync(OUT_DIR, { recursive: true, force: true });
    fs.mkdirSync(SCREENS_DIR, { recursive: true });

    console.log(`--- Vitrine de temas: ${new Set(requests.map((r) => r.temaId)).size} tema(s), ${requests.length} captura(s) ---`);

    const { outDir: harnessOutDir, htmlPath } = await buildHarness(SHOWCASE_ENTRY);
    const harnessUrl = 'file://' + htmlPath.split('\\').join('/');
    const browser = await chromium.launch();

    const results: CaptureResult[] = [];
    try {
        for (const request of requests) {
            const result = await captureOne(browser, harnessUrl, request);
            results.push(result);
            console.log(result.erro ? `[FAIL] ${result.fileName}: ${result.erro}` : `[OK]   ${result.fileName}`);
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
