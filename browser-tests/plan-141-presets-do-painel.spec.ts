/**
 * Os presets do painel no navegador: cada grupo de cada decisão mostra de 6 a 8 opções (ou todas, se são menos), o "Ver todas"
 * abre o resto, e a amostra segue o modo que a prévia mostra (Claro/Escuro), nunca o do tema do rascunho.
 *
 * Prévia para o dono: com `SARAK_PREVIA_141_DIR` definida, o mesmo caso grava uma captura PNG por grupo e por modo, em
 * viewport de desktop, e um `index.html` (imagens na mesma pasta, caminhos relativos, abre sem servidor) com o mapa de
 * cobertura. `SARAK_PREVIA_141_ANTES` aponta o texto da cobertura medida antes (saída de `measure-preset-coverage.ts`).
 *   $env:SARAK_PREVIA_141_DIR='C:\tmp\sarak-previa-141'
 *   npx playwright test --config=browser-tests/playwright.config.ts browser-tests/plan-141-presets-do-painel.spec.ts
 *
 * LIMITES DECLARADOS (R18): Chromium headless; o tema `sarak-sovereign`; lê `src/` pelo esbuild do harness (não mede o
 * `dist/`); a conferência de luminosidade da amostra é do fundo do escopo, não de cada pixel.
 */
import { test, expect, chromium, type Browser, type Page } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { buildHarness } from './build-harness.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ENTRY = path.join(HERE, 'fixtures', 'plan-141-presets-entry.tsx');
const PREVIEW_DIR = process.env.SARAK_PREVIA_141_DIR;
const COVERAGE_BEFORE = process.env.SARAK_PREVIA_141_ANTES;
type PresetDecisionId = 'fonts' | 'shape' | 'components' | 'layout';
interface GroupInfo { id: string; decision: PresetDecisionId; count: number; featured: number; featuredIds: string[]; ids: string[] }
interface Registry { presetCount: number; groups: GroupInfo[]; coverage: { covered: number; total: number; ratio: number; families: Array<{ family: string; covered: number; total: number }> } }
let registry: Registry;
const presetGroupsOf = (decision: PresetDecisionId): GroupInfo[] => registry.groups.filter((group) => group.decision === decision);
const DECISIONS: ReadonlyArray<{ id: PresetDecisionId; name: string }> = [
    { id: 'fonts', name: 'Fontes' }, { id: 'shape', name: 'Forma' }, { id: 'components', name: 'Componentes' }, { id: 'layout', name: 'Layout' },
];
/** Os grupos que moram dentro de uma aba de outro grupo, não em seção própria. */
const INSIDE_ANOTHER_GROUP = new Set(['cardTextures', 'textures', 'buttonStyles']);
const MODES = [{ name: 'escuro', query: '' }, { name: 'claro', query: 'claro=1' }] as const;

interface Capture { file: string; caption: string; mode: string }
const captures: Capture[] = [];
let browser: Browser;
let harnessDirectory: string;
let harnessUrl: string;

test.beforeAll(async () => {
    const executablePath = process.env.SARAK_CHROMIUM_EXECUTABLE_PATH;
    browser = await chromium.launch(executablePath ? { executablePath } : {});
    const harness = await buildHarness(ENTRY);
    harnessDirectory = harness.outDir;
    harnessUrl = pathToFileURL(harness.htmlPath).href;
    const probe = await browser.newPage();
    await probe.goto(harnessUrl);
    await probe.waitForFunction(() => Boolean((window as unknown as { __plan141?: unknown }).__plan141));
    registry = await probe.evaluate(() => (window as unknown as { __plan141: Registry }).__plan141);
    await probe.close();
});

test.afterAll(async () => {
    if (browser) await browser.close();
    if (harnessDirectory) fs.rmSync(harnessDirectory, { recursive: true, force: true });
    if (PREVIEW_DIR && captures.length > 0) writePreviewPage(PREVIEW_DIR, captures);
});

const coverageBlock = (): string => {
    const after = registry.coverage;
    const before = COVERAGE_BEFORE && fs.existsSync(COVERAGE_BEFORE) ? fs.readFileSync(COVERAGE_BEFORE, 'utf8') : 'não informado';
    const rows = after.families.map((family) => `${family.family.padEnd(14)} ${family.covered}/${family.total}`).join('\n');
    return `<h2>Mapa de cobertura</h2><p>Depois: ${after.covered}/${after.total} (${(after.ratio * 100).toFixed(1)}%) — ${registry.presetCount} presets.</p><div class="cols"><pre>ANTES\n${before.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</pre><pre>DEPOIS\n${rows}</pre></div>`;
};

const writePreviewPage = (directory: string, items: Capture[]): void => {
    const section = (mode: string): string => items.filter((item) => item.mode === mode)
        .map((item) => `<figure><img src="${item.file}" alt="${item.caption}"><figcaption>${item.caption}</figcaption></figure>`).join('\n');
    const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Plan 141 — presets do painel</title>
<style>body{font-family:system-ui,sans-serif;margin:24px;background:#10131a;color:#e8ecf4}figure{margin:0 0 28px}
img{max-width:100%;border:1px solid #2b3242;border-radius:8px}figcaption{margin-top:6px;font-size:14px}
.cols{display:flex;gap:24px;flex-wrap:wrap}pre{background:#171c27;padding:12px;border-radius:8px;font-size:12px}h2{margin-top:40px}</style></head>
<body><h1>Plan 141 — presets que mostram a capacidade da lib</h1>
<p>Uma captura por grupo de opções, em viewport de desktop (1600 px), nos dois modos. Os presets marcados <b>Novo</b> na legenda são os que esta plan acrescenta; os demais já existiam.</p>
${coverageBlock()}
<h2>Modo escuro</h2>${section('escuro')}<h2>Modo claro</h2>${section('claro')}</body></html>`;
    fs.writeFileSync(path.join(directory, 'index.html'), html, 'utf8');
};

const open = async (query: string): Promise<{ page: Page; errors: string[] }> => {
    const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(`${harnessUrl}?alto=9000px${query ? `&${query}` : ''}`);
    await page.getByRole('button', { name: /Usar minha marca/ }).waitFor();
    return { page, errors };
};

const settle = async (page: Page): Promise<void> => {
    // As amostras só desenham ao entrar na área visível: percorre a coluna, mais de uma vez, até nenhuma ficar pendente.
    for (let pass = 0; pass < 12; pass += 1) {
        await page.evaluate(async () => {
            for (const node of Array.from(document.querySelectorAll('[data-sx-lazy="pending"]'))) {
                node.scrollIntoView({ block: 'center' });
                for (let wait = 0; wait < 60 && node.getAttribute('data-sx-lazy') === 'pending'; wait += 1) await new Promise((resolve) => setTimeout(resolve, 50));
            }
        });
        if ((await page.locator('[data-sx-lazy="pending"]').count()) === 0) break;
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(500);
    }
    await page.waitForFunction(() => document.querySelectorAll('[data-sx-lazy="pending"]').length === 0, undefined, { timeout: 90_000 });
    await page.waitForTimeout(600);
};

for (const mode of MODES) {
    for (const decision of DECISIONS) {
        test(`${decision.name}: cada grupo mostra de 6 a 8 opções e o "Ver todas" abre o resto (${mode.name})`, async () => {
            const { page, errors } = await open(mode.query);
            await page.getByRole('button', { name: new RegExp(`^${decision.name}`) }).click();
            await page.getByRole('heading', { level: 2, name: decision.name }).waitFor();
            await settle(page);

            for (const group of presetGroupsOf(decision.id).filter((candidate) => !INSIDE_ANOTHER_GROUP.has(candidate.id))) {
                const section = page.locator(`[data-option-group="${group.id}"]`);
                await expect(section, group.id).toHaveCount(1);
                const count = await section.locator('[data-option-tile]').count();
                const expectedVisible = Math.min(group.count, group.featured);
                expect(count, `${group.id}: opções à vista`).toBe(expectedVisible);
                expect(expectedVisible).toBeLessThanOrEqual(8);
                const toggle = section.locator('[data-preset-toggle]');
                if (group.count > group.featured) {
                    await expect(toggle, `${group.id}: Ver todas`).toHaveCount(1);
                } else {
                    await expect(toggle, `${group.id}: sem Ver todas`).toHaveCount(0);
                }
            }
            await settle(page);
            if (PREVIEW_DIR) {
                fs.mkdirSync(PREVIEW_DIR, { recursive: true });
                for (const group of presetGroupsOf(decision.id).filter((candidate) => !INSIDE_ANOTHER_GROUP.has(candidate.id))) {
                    const file = `${mode.name}-${decision.id}-${group.id}.png`;
                    await page.locator(`[data-option-group="${group.id}"]`).screenshot({ path: path.join(PREVIEW_DIR, file) });
                    const isNew = group.ids.some((id) => !/^(card-glass|btn-industrial|input-floating|bg-none|typo-|tex-|card-tex-|btn-style)/.test(id));
                    captures.push({ file, mode: mode.name, caption: `${decision.name} › ${group.id} (${mode.name})${isNew ? ' — contém opções Novas' : ''}` });
                }
            }
            expect(errors).toEqual([]);
            await page.close();
        });
    }
}

test('a amostra segue o modo que a prévia mostra, mesmo com um tema escuro no rascunho', async () => {
    const { page } = await open('claro=1');
    await page.getByRole('button', { name: /^Forma/ }).click();
    await page.getByRole('heading', { level: 2, name: 'Forma' }).waitFor();
    await settle(page);
    const lightness = await page.evaluate(() => {
        const scope = document.querySelector('[data-option-group="cards"] .sarak-design-scope') as HTMLElement;
        const [red, green, blue] = getComputedStyle(scope).backgroundColor.match(/\d+(\.\d+)?/g)!.slice(0, 3).map(Number);
        return { value: (0.2126 * red + 0.7152 * green + 0.0722 * blue) / 255, cls: scope.className.slice(0, 120), body: getComputedStyle(scope).getPropertyValue('--sarak-bg-body'), prev: document.querySelector('[data-testid="live-preview-frame"] .sarak-design-scope')?.className.slice(0, 120) };
    });
    expect(lightness.value, JSON.stringify(lightness)).toBeGreaterThan(0.5);
    await page.close();
});

test('"Ver todas" abre as demais opções e "Ver menos" devolve as destacadas', async () => {
    const { page } = await open('');
    await page.getByRole('button', { name: /^Componentes/ }).click();
    await page.getByRole('heading', { level: 2, name: 'Componentes' }).waitFor();
    const toggle = page.locator('[data-preset-toggle="icons"], [data-preset-toggle="inputs"]').first();
    const group = (await toggle.getAttribute('data-preset-toggle'))!;
    const total = registry.groups.find((candidate) => candidate.id === group)!.count;
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator(`[data-option-group="${group}"] [data-option-tile]`)).toHaveCount(total);
    await page.close();
});

/** Dois quadros de pixels diferem em quanto da área? Um pixel conta quando a soma da diferença dos canais passa do ruído de serrilhado. */
const DIFFERING_SHARE = (page: Page, first: string, second: string): Promise<number> => page.evaluate(async ([a, b]) => {
    const decode = async (base64: string): Promise<ImageData> => {
        const bitmap = await createImageBitmap(await (await fetch(`data:image/png;base64,${base64}`)).blob());
        const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
        const context = canvas.getContext('2d') as OffscreenCanvasRenderingContext2D;
        context.drawImage(bitmap, 0, 0);
        return context.getImageData(0, 0, bitmap.width, bitmap.height);
    };
    const [one, two] = [await decode(a), await decode(b)];
    const width = Math.max(one.width, two.width);
    const height = Math.max(one.height, two.height);
    let differing = 0;
    for (let y = 0; y < height; y += 1) {
        for (let x = 0; x < width; x += 1) {
            if (x >= one.width || y >= one.height || x >= two.width || y >= two.height) { differing += 1; continue; }
            const i = (y * one.width + x) * 4;
            const j = (y * two.width + x) * 4;
            const delta = Math.abs(one.data[i] - two.data[j]) + Math.abs(one.data[i + 1] - two.data[j + 1]) + Math.abs(one.data[i + 2] - two.data[j + 2]);
            if (delta > 30) differing += 1;
        }
    }
    return differing / (width * height);
}, [first, second] as const);

const MIN_DIFFERING_SHARE = 0.02;
/** Os grupos que só existem dentro da aba de outro grupo não têm seção própria na página: o caso confere os que se veem. */
for (const mode of MODES) {
    for (const decision of DECISIONS) {
        test(`${decision.name}: cada opção destacada se distingue a olho das outras do mesmo grupo (${mode.name})`, async () => {
            test.setTimeout(300_000);
            const { page } = await open(mode.query);
            const indistinct: string[] = [];
            const matrix: string[] = [];
            const collected: Array<{ group: GroupInfo; shots: string[] }> = [];
            await page.getByRole('button', { name: new RegExp(`^${decision.name}`) }).click();
            await page.getByRole('heading', { level: 2, name: decision.name }).waitFor();
            await settle(page);
            for (const group of presetGroupsOf(decision.id).filter((candidate) => !INSIDE_ANOTHER_GROUP.has(candidate.id))) {
                const tiles = page.locator(`[data-option-group="${group.id}"] [data-option-tile]`);
                const count = await tiles.count();
                const shots: string[] = [];
                for (let index = 0; index < count; index += 1) {
                    const sample = tiles.nth(index).locator('> div').first();
                    await sample.scrollIntoViewIfNeeded();
                    await sample.locator('[data-sx-lazy="pending"]').first().waitFor({ state: 'detached', timeout: 30_000 });
                    shots.push((await sample.screenshot({ animations: 'disabled' })).toString('base64'));
                }
                collected.push({ group, shots });
            }
            // A página de comparação só abre depois das capturas: uma aba nova tira a da prévia do primeiro plano, e as amostras lazy param de desenhar.
            const comparer = await browser.newPage();
            for (const { group, shots } of collected) {
                for (let first = 0; first < shots.length; first += 1) {
                    for (let second = first + 1; second < shots.length; second += 1) {
                        const share = await DIFFERING_SHARE(comparer, shots[first], shots[second]);
                        matrix.push(`${mode.name}|${group.id}|${group.featuredIds[first]}|${group.featuredIds[second]}|${share.toFixed(4)}`);
                        if (share < MIN_DIFFERING_SHARE) indistinct.push(`${group.id}: ${group.featuredIds[first]} × ${group.featuredIds[second]} = ${(share * 100).toFixed(2)}%`);
                    }
                }
            }
            if (process.env.SARAK_PLAN141_MATRIX) fs.appendFileSync(process.env.SARAK_PLAN141_MATRIX, `${matrix.join(String.fromCharCode(10))}${String.fromCharCode(10)}`);
            await comparer.close();
            await page.close();
            expect(indistinct, 'duplas destacadas que diferem em menos de 2% dos pixels').toEqual([]);
        });
    }
}

for (const mode of MODES) {
    test(`defeito: a marca e o rótulo da topbar cabem no quadro (${mode.name})`, async () => {
        const { page } = await open(mode.query);
        await page.getByRole('button', { name: /^Layout/ }).click();
        await page.getByRole('heading', { level: 2, name: 'Layout' }).waitFor();
        await settle(page);
        const frames = page.locator('[data-option-group="topbar"] [data-testid="bar-sample"]');
        const total = await frames.count();
        expect(total).toBeGreaterThan(0);
        for (let index = 0; index < total; index += 1) {
            await frames.nth(index).scrollIntoViewIfNeeded();
            await frames.nth(index).locator('.sarak-chrome-brand span.truncate').waitFor({ timeout: 30_000 });
            const overflow = await frames.nth(index).evaluate((frame) => {
                const box = frame.getBoundingClientRect();
                const inside = (element: Element | null): boolean => {
                    if (!element) return false;
                    const rect = element.getBoundingClientRect();
                    return rect.width > 0 && rect.left >= box.left - 1 && rect.right <= box.right + 1 && rect.top >= box.top - 1 && rect.bottom <= box.bottom + 1;
                };
                const brand = frame.querySelector('.sarak-chrome-brand span.truncate');
                const label = Array.from(frame.querySelectorAll('nav a, nav button, nav span')).find((node) => (node.textContent ?? '').trim().length > 0) ?? null;
                const clipped = (element: Element | null): boolean => !element || (element as HTMLElement).scrollWidth > (element as HTMLElement).clientWidth;
                return { frameFits: frame.scrollWidth <= frame.clientWidth, brandInside: inside(brand), labelInside: inside(label), brandClipped: clipped(brand),  };
            });
            expect(overflow, `topbar #${index}`).toMatchObject({ frameFits: true, brandInside: true, labelInside: true, brandClipped: false });
        }
        await page.close();
    });

    test(`defeito: as faixas do SampleCard têm a largura do card (${mode.name})`, async () => {
        const { page } = await open(mode.query);
        await page.getByRole('button', { name: /^Forma/ }).click();
        await page.getByRole('heading', { level: 2, name: 'Forma' }).waitFor();
        await settle(page);
        await page.locator('[data-option-group="cards"] .sarak-card header').first().waitFor({ timeout: 30_000 });
        const widths = await page.locator('[data-option-group="cards"] .sarak-card').evaluateAll((cards) => cards.map((card) => {
            const cardWidth = (card as HTMLElement).clientWidth;
            const band = (selector: string): number => (card.querySelector(selector) as HTMLElement).getBoundingClientRect().width;
            return { card: Math.round(cardWidth), header: Math.round(band('header')), footer: Math.round(band('footer')) };
        }));
        expect(widths.length).toBeGreaterThan(0);
        for (const item of widths) expect(item, JSON.stringify(item)).toEqual({ card: item.card, header: item.card, footer: item.card });
        await page.close();
    });
}

test('defeito: o trilho do interruptor tem contraste de 3:1 com o fundo da amostra, no claro', async () => {
    const { page } = await open('claro=1');
    await page.getByRole('button', { name: /^Componentes/ }).click();
    await page.getByRole('heading', { level: 2, name: 'Componentes' }).waitFor();
    await settle(page);
    const rails = page.locator('[data-option-group="switch"] input[role="switch"]');
    await page.locator('[data-option-group="switch"]').scrollIntoViewIfNeeded();
    await rails.first().waitFor({ state: 'attached', timeout: 30_000 });
    const ratios = await page.locator('[data-option-group="switch"] .sarak-design-scope').evaluateAll((scopes) => scopes.map((scope) => {
        const pixel = document.createElement('canvas').getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
        /** Qualquer sintaxe de cor computada (rgb, color(srgb…), oklab…) vira rgba por um pixel de canvas. */
        const parse = (color: string): [number, number, number, number] => {
            pixel.clearRect(0, 0, 1, 1);
            pixel.fillStyle = color;
            pixel.fillRect(0, 0, 1, 1);
            const [red, green, blue, alpha] = pixel.getImageData(0, 0, 1, 1).data;
            return [red, green, blue, alpha / 255];
        };
        const luminance = ([red, green, blue]: number[]): number => {
            const channel = (value: number): number => { const unit = value / 255; return unit <= 0.03928 ? unit / 12.92 : ((unit + 0.055) / 1.055) ** 2.4; };
            return 0.2126 * channel(red) + 0.7152 * channel(green) + 0.0722 * channel(blue);
        };
        return Array.from(scope.querySelectorAll('input[role="switch"] + div')).map((rail) => {
            let behind: Element | null = rail.parentElement;
            while (behind && parse(getComputedStyle(behind).backgroundColor)[3] === 0) behind = behind.parentElement;
            const background = parse(getComputedStyle(behind ?? scope).backgroundColor);
            const [red, green, blue, alpha] = parse(getComputedStyle(rail).backgroundColor);
            const over = [0, 1, 2].map((channel) => [red, green, blue][channel] * alpha + background[channel] * (1 - alpha));
            const [light, dark] = [luminance(over), luminance(background)].sort((a, b) => b - a);
            return (light + 0.05) / (dark + 0.05);
        });
    }).flat());
    expect(ratios.length).toBeGreaterThan(0);
    for (const ratio of ratios) expect(ratio).toBeGreaterThanOrEqual(3);
    await page.close();
});

for (const mode of MODES) {
    test(`o rótulo do item ativo de toda barra lateral e topbar tem contraste de 4,5:1 com o fundo do item (${mode.name})`, async () => {
        test.setTimeout(240_000);
        const { page } = await open(mode.query);
        await page.getByRole('button', { name: /^Layout/ }).click();
        await page.getByRole('heading', { level: 2, name: 'Layout' }).waitFor();
        await settle(page);
        const failures: string[] = [];
        for (const groupId of ['sidebar', 'topbar']) {
            await page.locator(`[data-preset-toggle="${groupId}"]`).click();
            await settle(page);
            const tiles = page.locator(`[data-option-group="${groupId}"] [data-option-tile]`);
            const total = await tiles.count();
            expect(total, groupId).toBe(registry.groups.find((group) => group.id === groupId)!.count);
            for (let index = 0; index < total; index += 1) {
                const tile = tiles.nth(index);
                await tile.scrollIntoViewIfNeeded();
                await tile.locator('[aria-current="page"]').first().waitFor({ timeout: 30_000 });
                const result = await tile.evaluate((element) => {
                    const pixel = document.createElement('canvas').getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
                    const parse = (color: string): [number, number, number, number] => {
                        pixel.clearRect(0, 0, 1, 1);
                        pixel.fillStyle = color;
                        pixel.fillRect(0, 0, 1, 1);
                        const [red, green, blue, alpha] = pixel.getImageData(0, 0, 1, 1).data;
                        return [red, green, blue, alpha / 255];
                    };
                    const luminance = ([red, green, blue]: number[]): number => {
                        const channel = (value: number): number => { const unit = value / 255; return unit <= 0.03928 ? unit / 12.92 : ((unit + 0.055) / 1.055) ** 2.4; };
                        return 0.2126 * channel(red) + 0.7152 * channel(green) + 0.0722 * channel(blue);
                    };
                    const active = element.querySelector('[aria-current="page"]') as HTMLElement;
                    const label = Array.from(active.querySelectorAll('*')).reverse().find((node) => node.children.length === 0 && (node.textContent ?? '').trim().length > 0) ?? active;
                    // O fundo do item: as camadas de baixo para cima, da mais externa à do próprio item. Cor lisa compõe sobre cada
                    // candidato; degradê vira um candidato por parada de cor, e vale o pior contraste entre eles.
                    const layers: Element[] = [];
                    for (let node: Element | null = active; node && node !== element.parentElement; node = node.parentElement) layers.unshift(node);
                    const over = (top: [number, number, number, number], base: number[]): number[] => [top[0] * top[3] + base[0] * (1 - top[3]), top[1] * top[3] + base[1] * (1 - top[3]), top[2] * top[3] + base[2] * (1 - top[3])];
                    let candidates: number[][] = [[255, 255, 255]];
                    for (const layer of layers) {
                        const style = getComputedStyle(layer);
                        const stops = style.backgroundImage.includes('gradient') ? (style.backgroundImage.match(/(?:rgba?|color)\([^)]*\)/g) ?? []) : [];
                        if (stops.length > 0) candidates = stops.flatMap((stop) => candidates.map((base) => over(parse(stop), base)));
                        const [red, green, blue, alpha] = parse(style.backgroundColor);
                        if (alpha > 0) candidates = candidates.map((base) => over([red, green, blue, alpha], base));
                    }
                    const [textRed, textGreen, textBlue, textAlpha] = parse(getComputedStyle(label).color);
                    const ratio = Math.min(...candidates.map((base) => {
                        const text = over([textRed, textGreen, textBlue, textAlpha], base);
                        const [light, dark] = [luminance(text), luminance(base)].sort((x, y) => y - x);
                        return (light + 0.05) / (dark + 0.05);
                    }));
                    return { ratio, name: element.querySelector('h3')?.textContent ?? '' };
                });
                if (result.ratio < 4.5) failures.push(`${groupId}: ${result.name} = ${result.ratio.toFixed(2)}:1`);
            }
        }
        await page.close();
        expect(failures, 'rótulo do item ativo com contraste abaixo de 4,5:1').toEqual([]);
    });
}
