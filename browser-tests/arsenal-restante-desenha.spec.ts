/**
 * Medição, em navegador real, do que a `plan-111` deixou na exceção do gate `token-reader:check`
 * e que passou a desenhar: moldura (`borderType`), direção da sombra (`shadowOrientation`) e
 * sombra em camadas (`layeredShadows`), o painel de busca (`--dynamic-shadow`), o desfoque do
 * vidro do cartão, as variantes de hover/active (`colorDepth`/`colorVariation`) e a cor de
 * textura nas famílias de leitor de CSS. O `jsdom` não calcula `color-mix`, `backdrop-filter`
 * nem a cascata de stylesheet, então só se mede aqui.
 *
 * Mesmo harness e mesmo artefato do `token-que-desenha.spec.ts` (`dist/index.js` + `dist/sarak.css`),
 * cenas por `?cena=` e recortes de token por `?tema=` (ver `fixtures/harness-entry.tsx`).
 *
 * -------------------------------------------------------------------------
 * LIMITES DECLARADOS (R18) — o que esta medição NÃO vê
 * -------------------------------------------------------------------------
 * 1. Só valores COMPUTADOS de propriedades nomeadas; nenhum pixel. "A moldura fica bonita" não é
 *    provado — só que a propriedade certa recebe o valor certo.
 * 2. Só Chromium headless e só os recortes nomeados em `TOKEN_VARIANTS` da fixture.
 * 3. Lê o `dist/` — sem `npm run build` recente, mede o build anterior.
 * 4. A direção da sombra é lida nos deslocamentos X/Y da sombra EXTERNA do cartão; a opção
 *    `dynamic` é provada nas duas pontas (sem ponteiro e com o ponteiro num canto), não em
 *    todo o percurso.
 * 5. A cor de textura é provada por canais RGB (a primária e a cor de textura da cena diferem):
 *    prova QUAL cor chega ao leitor, não a opacidade final da textura.
 * 6. A animação `glow-reveal` é pausada a meio ciclo para ler o quadro; mede o quadro do meio, não o
 *    percurso inteiro.
 * -------------------------------------------------------------------------
 */
import fs from 'node:fs';
import path from 'node:path';
import { test, expect, chromium, type Browser, type Locator, type Page } from '@playwright/test';

const DESKTOP = { width: 1280, height: 900 } as const;

const harnessUrl = process.env.SARAK_CROMO_HARNESS_URL;
if (!harnessUrl) {
    throw new Error('O globalSetup não preparou o harness de CSS para esta execução do Playwright.');
}

let browser: Browser;

test.beforeAll(async () => {
    browser = await chromium.launch();
});

test.afterAll(async () => {
    await browser.close();
});

async function openScene(cena: string, tema?: string): Promise<Page> {
    const page = await browser.newPage({ viewport: DESKTOP });
    const searchParams = new URLSearchParams({ cena });
    if (tema) searchParams.set('tema', tema);
    await page.goto(`${harnessUrl}?${searchParams.toString()}`);
    await page.waitForFunction(() => document.body.hasAttribute('data-sx-texture'));
    return page;
}

async function withScene<T>(cena: string, tema: string | undefined, measure: (page: Page) => Promise<T>): Promise<T> {
    const page = await openScene(cena, tema);
    try {
        return await measure(page);
    } finally {
        await page.close();
    }
}

async function readComputed(target: Locator, property: string, pseudo?: string): Promise<string> {
    return target.evaluate((el, { prop, pseudoElement }) => getComputedStyle(el, pseudoElement ?? null).getPropertyValue(prop), {
        prop: property,
        pseudoElement: pseudo,
    });
}

/** O que a expressão produz quando nada disputa a propriedade: um `<i>` irmão com ela em estilo inline. */
async function resolveExpression(target: Locator, property: string, expression: string): Promise<string> {
    return target.evaluate((el, { property, expression }) => {
        const probe = document.createElement('i');
        probe.style.setProperty(property, expression);
        (el.parentElement ?? document.body).appendChild(probe);
        const value = getComputedStyle(probe).getPropertyValue(property);
        probe.remove();
        return value;
    }, { property, expression });
}

const firstCard = (page: Page): Locator => page.locator('.sarak-card').first();

/** As camadas de um `box-shadow` computado, separadas pelas vírgulas de nível zero. */
function splitShadowLayers(boxShadow: string): string[] {
    const layers: string[] = [];
    let depth = 0;
    let current = '';
    for (const char of boxShadow) {
        if (char === '(') depth++;
        if (char === ')') depth--;
        if (char === ',' && depth === 0) {
            layers.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    if (current.trim()) layers.push(current.trim());
    return layers;
}

interface ShadowLayer { x: number; y: number; blur: number; alpha: number; inset: boolean }

/** Deslocamentos, desfoque e opacidade da cor de cada camada (`rgb()`/`rgba()` ou `color(srgb r g b / a)`). */
function parseShadow(boxShadow: string): ShadowLayer[] {
    return splitShadowLayers(boxShadow).map((layer) => {
        const lengths = Array.from(layer.matchAll(/(-?[\d.]+)px/g)).map((m) => Number(m[1]));
        const rgba = layer.match(/rgba\(\s*[\d.]+,\s*[\d.]+,\s*[\d.]+,\s*([\d.]+)\)/);
        const srgb = layer.match(/color\(srgb[^/)]*\/\s*([\d.]+)\)/);
        const alpha = rgba ? Number(rgba[1]) : srgb ? Number(srgb[1]) : 1;
        return { x: lengths[0] ?? 0, y: lengths[1] ?? 0, blur: lengths[2] ?? 0, alpha, inset: layer.includes('inset') };
    });
}

const outerLayer = (boxShadow: string): ShadowLayer => {
    const layer = parseShadow(boxShadow).find((candidate) => !candidate.inset);
    if (!layer) throw new Error(`box-shadow sem sombra externa: ${boxShadow}`);
    return layer;
};

/** Canais 0..255 de uma cor computada (`rgb()`/`rgba()` ou `color(srgb …)`). */
function channelsOf(color: string): [number, number, number] {
    const rgb = color.match(/rgba?\(\s*([\d.]+),\s*([\d.]+),\s*([\d.]+)/);
    if (rgb) return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])];
    const srgb = color.match(/color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)/);
    if (srgb) return [Number(srgb[1]) * 255, Number(srgb[2]) * 255, Number(srgb[3]) * 255].map(Math.round) as [number, number, number];
    throw new Error(`cor ilegível: ${color}`);
}

const TEXTURE_RGB = '31, 41, 55';
const PRIMARY_RGB = '25, 227, 240';

// ── borderType ────────────────────────────────────────────────────────────────────────────────────

async function cardBorder(option: string): Promise<{ style: string; color: string; width: string; shadow: string }> {
    return withScene('textura', `moldura-${option}`, async (page) => {
        const card = firstCard(page);
        return {
            style: await readComputed(card, 'border-top-style'),
            color: await readComputed(card, 'border-top-color'),
            width: await readComputed(card, 'border-top-width'),
            shadow: await readComputed(card, 'box-shadow'),
        };
    });
}

test('borderType: solid é um contorno contínuo', async () => {
    expect((await cardBorder('solid')).style).toBe('solid');
});

test('borderType: cyber é um contorno segmentado na cor de textura', async () => {
    const border = await cardBorder('cyber');
    const expected = await withScene('textura', 'moldura-cyber', (page) =>
        resolveExpression(firstCard(page), 'border-top-color', 'color-mix(in srgb, var(--theme-texture-color, var(--theme-primary)) 70%, transparent)'));

    expect(border.style).toBe('dashed');
    expect(border.color).toBe(expected);
});

test('borderType: double é linha dupla, com espessura que a deixa aparecer (≥ 3px)', async () => {
    const border = await cardBorder('double');

    expect(border.style).toBe('double');
    expect(parseFloat(border.width)).toBeGreaterThanOrEqual(3);
});

test('borderType: glow acende o contorno e acrescenta um halo na cor de textura', async () => {
    const border = await cardBorder('glow');
    const expected = await withScene('textura', 'moldura-glow', (page) =>
        resolveExpression(firstCard(page), 'border-top-color', 'color-mix(in srgb, var(--theme-texture-color, var(--theme-primary)) 50%, transparent)'));

    expect(border.color).toBe(expected);
    expect(parseShadow(border.shadow).some((layer) => !layer.inset && layer.blur === 10)).toBe(true);
});

test('borderType: none apaga o contorno sem mexer na espessura da caixa', async () => {
    const none = await cardBorder('none');
    const solid = await cardBorder('solid');

    expect(none.color).toMatch(/rgba\(0, 0, 0, 0\)/);
    expect(none.width).toBe(solid.width);
});

test('borderType: as quatro opções com desenho produzem molduras diferentes entre si', async () => {
    const skins = await Promise.all(['solid', 'cyber', 'double', 'glow'].map(async (option) => {
        const { style, color, width, shadow } = await cardBorder(option);
        return `${style}|${color}|${width}|${shadow}`;
    }));

    expect(new Set(skins).size).toBe(4);
});

// ── shadowOrientation ─────────────────────────────────────────────────────────────────────────────

async function cardShadow(tema: string): Promise<string> {
    return withScene('textura', tema, (page) => readComputed(firstCard(page), 'box-shadow'));
}

test('shadowOrientation: bottom é o desenho de sempre — 0 20px 50px -12px', async () => {
    const layer = outerLayer(await cardShadow('orientacao-bottom'));

    expect([layer.x, layer.y, layer.blur]).toEqual([0, 20, 50]);
});

test('shadowOrientation: center centra a sombra no cartão', async () => {
    const layer = outerLayer(await cardShadow('orientacao-center'));

    expect([layer.x, layer.y]).toEqual([0, 0]);
});

test('shadowOrientation: top inverte o deslocamento vertical', async () => {
    const layer = outerLayer(await cardShadow('orientacao-top'));

    expect([layer.x, layer.y]).toEqual([0, -20]);
});

test('shadowOrientation: bottom-right desloca para a direita e para baixo', async () => {
    const layer = outerLayer(await cardShadow('orientacao-diagonal'));

    expect(layer.x).toBeGreaterThan(0);
    expect(layer.y).toBe(20);
});

test('shadowOrientation: dynamic cai em "bottom" sem ponteiro e segue a luz com o ponteiro num canto', async () => {
    await withScene('textura', 'orientacao-dinamica', async (page) => {
        const card = firstCard(page);
        const rest = outerLayer(await readComputed(card, 'box-shadow'));
        expect([rest.x, rest.y]).toEqual([0, 20]);

        // Ponteiro no canto inferior esquerdo: a luz vem de lá, a sombra cai para cima e para a direita.
        await page.mouse.move(0, DESKTOP.height - 1);
        await expect.poll(async () => outerLayer(await readComputed(card, 'box-shadow')).y).toBeLessThan(0);
        const moved = outerLayer(await readComputed(card, 'box-shadow'));
        expect(moved.x).toBeGreaterThan(0);
    });
});

// ── layeredShadows e --dynamic-shadow ─────────────────────────────────────────────────────────────

/** A sombra em camadas como o painel de busca e os utilitários a leem: `box-shadow: var(--dynamic-shadow)`. */
async function dynamicShadow(tema?: string): Promise<ShadowLayer[]> {
    return withScene('textura', tema, async (page) =>
        parseShadow(await resolveExpression(firstCard(page), 'box-shadow', 'var(--dynamic-shadow)')));
}

test('--dynamic-shadow existe e tem duas camadas (contato e projeção)', async () => {
    const layers = await dynamicShadow();

    expect(layers).toHaveLength(2);
    expect(layers[0].y).toBe(2);
    expect(layers[1].y).toBe(40);
});

test('layeredShadows: 0 apaga as duas camadas e 2 dobra a opacidade de cada uma', async () => {
    const base = await dynamicShadow();
    const zero = await dynamicShadow('camadas-zero');
    const double = await dynamicShadow('camadas-dobro');

    expect(zero.map((layer) => layer.alpha)).toEqual([0, 0]);
    expect(double[0].alpha).toBeCloseTo(base[0].alpha * 2, 2);
    expect(double[1].alpha).toBeCloseTo(base[1].alpha * 2, 2);
});

test('shadowOrientation também vira a sombra em camadas', async () => {
    const top = await dynamicShadow('orientacao-top');

    expect(top[0].y).toBe(-2);
    expect(top[1].y).toBe(-40);
});

test('SarakSearch: o painel da paleta tem a sombra do tema, não nenhuma', async () => {
    await withScene('busca', undefined, async (page) => {
        const panel = page.locator('[data-probe="busca"] div.relative.w-full.overflow-hidden').first();
        const layers = parseShadow(await readComputed(panel, 'box-shadow')).filter((layer) => !layer.inset);

        expect(layers.length).toBeGreaterThanOrEqual(2);
        expect(layers.some((layer) => layer.y === 40)).toBe(true);
    });
    await withScene('busca', 'orientacao-top', async (page) => {
        const panel = page.locator('[data-probe="busca"] div.relative.w-full.overflow-hidden').first();
        const layers = parseShadow(await readComputed(panel, 'box-shadow')).filter((layer) => !layer.inset);

        expect(layers.some((layer) => layer.y === -40)).toBe(true);
    });
});

// ── vidro do cartão ───────────────────────────────────────────────────────────────────────────────

test('cardBackdropBlur: sob um material sem desfoque próprio, o cartão desfoca exatamente o valor do token', async () => {
    await withScene('textura', 'vidro-cartao', async (page) => {
        expect(await readComputed(firstCard(page), 'backdrop-filter')).toBe('blur(24px)');
    });
});

test('cardBackdropBlur: sob o frosted, o token é a base e a intensidade soma (24 + 0,5 × 24 = 36px)', async () => {
    await withScene('textura', 'vidro-cartao-fosco', async (page) => {
        expect(await readComputed(firstCard(page), 'backdrop-filter')).toBe('blur(36px) saturate(1.6)');
    });
});

test('NÃO MUDA NADA: no padrão (frosted, 12px, intensidade 0,5) o cartão segue desfocando 24px', async () => {
    await withScene('textura', undefined, async (page) => {
        expect(await readComputed(firstCard(page), 'backdrop-filter')).toBe('blur(24px) saturate(1.6)');
    });
});

test('build: nenhuma regra do dist/sarak.css traz só a forma -webkit- de backdrop-filter', async () => {
    const css = fs.readFileSync(path.join(process.cwd(), 'dist', 'sarak.css'), 'utf-8');
    const onlyPrefixed = css
        .split('}')
        .filter((rule) => /-webkit-backdrop-filter\s*:/.test(rule))
        .filter((rule) => !/(^|[;{\s])backdrop-filter\s*:/.test(rule));

    expect(onlyPrefixed, `regras só com -webkit-: ${onlyPrefixed.slice(0, 3).join(' | ')}`).toEqual([]);
});

// ── colorDepth e colorVariation ───────────────────────────────────────────────────────────────────

const primaryVariants = (tema: string): Promise<{ hover: string; active: string }> =>
    withScene('textura', tema, async (page) => ({
        hover: (await readComputed(page.locator('body'), '--theme-primary-hover')).trim(),
        active: (await readComputed(page.locator('body'), '--theme-primary-active')).trim(),
    }));

test('colorDepth: um valor alto afasta hover e active da cor base', async () => {
    const base = await primaryVariants('cor-base');
    const deep = await primaryVariants('cor-profunda');

    expect(base).toEqual({ hover: '#8d8d46', active: '#73733a' });
    expect(deep).toEqual({ hover: '#a6a653', active: '#5a5a2d' });
});

test('colorVariation: um valor alto abre o matiz entre hover e active', async () => {
    const base = await primaryVariants('cor-base');
    const varied = await primaryVariants('cor-variada');

    expect(varied.hover).not.toBe(base.hover);
    expect(varied.active).not.toBe(base.active);
});

// ── cor de textura nas famílias de leitor ─────────────────────────────────────────────────────────

test('cor de textura: o canal --theme-texture-color-rgb é emitido e difere da primária', async () => {
    await withScene('texturas-cor', 'tema-claro-textura-limpa', async (page) => {
        const texture = (await readComputed(page.locator('body'), '--theme-texture-color-rgb')).trim();
        const primary = (await readComputed(page.locator('body'), '--theme-primary-rgb')).trim();

        expect(texture).toBe(TEXTURE_RGB);
        expect(primary).toBe(PRIMARY_RGB);
    });
});

test('cor de textura (_atmosphere, gradiente): stripes pinta na cor de textura, não na primária', async () => {
    await withScene('texturas-cor', 'tema-claro-textura-limpa', async (page) => {
        const image = await readComputed(page.locator('[data-probe="textura-stripes"] .sarak-card'), 'background-image', '::after');

        expect(image).toContain(`rgba(${TEXTURE_RGB}`);
        expect(image).not.toContain(`rgba(${PRIMARY_RGB}`);
    });
});

test('cor de textura (_atmosphere, SVG): waves é uma máscara preenchida com a cor de textura', async () => {
    await withScene('texturas-cor', 'tema-claro-textura-limpa', async (page) => {
        const card = page.locator('[data-probe="textura-waves"] .sarak-card');
        const color = await readComputed(card, 'background-color', '::after');
        const mask = await readComputed(card, 'mask-image', '::after');

        expect(color).toBe(await resolveExpression(card, 'background-color', 'var(--theme-texture-color)'));
        expect(mask).not.toBe('none');
    });
});

test('cor de textura (_atmosphere, tecido): carbon acompanha a cor de textura e mantém tons distintos', async () => {
    const [light, dark] = await Promise.all([
        withScene('texturas-cor', 'tema-claro-textura-limpa', (page) =>
            readComputed(page.locator('[data-probe="textura-carbon"] .sarak-card'), 'background-image', '::after')),
        withScene('texturas-cor', 'textura-limpa', (page) =>
            readComputed(page.locator('[data-probe="textura-carbon"] .sarak-card'), 'background-image', '::after')),
    ]);

    expect(light).not.toBe('none');
    expect(light).not.toBe(dark);
    expect(new Set(light.match(/rgba?\([^)]*\)|color\([^)]*\)/g)).size).toBeGreaterThan(2);
});

test('cor de textura (_animations): o brilho animado usa a cor de textura no quadro do meio', async () => {
    await withScene('texturas-cor', 'tema-claro-textura-limpa', async (page) => {
        const glow = page.locator('[data-probe="brilho-animado"]');
        const frame = await glow.evaluate((el) => {
            const animation = el.getAnimations()[0];
            animation.pause();
            animation.currentTime = 1000; // metade de 2s: o quadro de 50%
            return getComputedStyle(el).getPropertyValue('box-shadow');
        });

        expect(frame).toContain(`rgba(${TEXTURE_RGB}`);
        expect(frame).not.toContain(`rgba(${PRIMARY_RGB}`);
    });
});

test('cor de textura (_surfaces): a moldura glow nasce da cor de textura, não da primária', async () => {
    const { color } = await cardBorder('glow');

    const [r, g, b] = channelsOf(color);
    expect(Math.abs(r - 31) + Math.abs(g - 41) + Math.abs(b - 55)).toBeLessThan(12);
});

test('cor de textura (_base): o anel de foco continua da primária, não vira a cor de textura', async () => {
    await withScene('texturas-cor', 'tema-claro-textura-limpa', async (page) => {
        const focus = (await readComputed(page.locator('body'), '--theme-primary-focus')).replace(/\s+/g, ' ');

        expect(focus).toContain(PRIMARY_RGB);
        expect(focus).not.toContain(TEXTURE_RGB);
    });
});
