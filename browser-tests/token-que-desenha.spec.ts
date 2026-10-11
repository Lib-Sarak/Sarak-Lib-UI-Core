/**
 * Medição, em navegador real, de que cada token visual que o painel oferece MUDA a tela do jeito que o
 * rótulo diz (R40: todo valor que o motor emite tem leitor). O `jsdom` não resolve cascata de stylesheet
 * nem calcula `color-mix`/`backdrop-filter`, então o efeito dos leitores em CSS só se mede aqui.
 *
 * Mesmo harness e mesmo artefato do `cromo-css-real.spec.ts` (`dist/index.js` + `dist/sarak.css`), com
 * cenas escolhidas por `?cena=` e recortes de token por `?tema=` (ver `fixtures/harness-entry.tsx`).
 * Cada caso lê UMA propriedade computada de UM elemento nomeado e a compara com o valor que o token
 * promete; os casos "NÃO MUDA NADA" provam que o padrão (sem token) continua desenhando o que desenhava.
 *
 * -------------------------------------------------------------------------
 * LIMITES DECLARADOS (R18) — o que esta medição NÃO vê
 * -------------------------------------------------------------------------
 * 1. Só valores COMPUTADOS de propriedades nomeadas (e de pseudoelementos); nenhum pixel. Que o
 *    gradiente "fica bonito" ou que a textura "aparece" a olho nu não é provado — só que a propriedade
 *    certa recebe o valor certo, na cor do tema, em superfície clara.
 * 2. Só Chromium headless, só os recortes de tema nomeados em `TOKEN_VARIANTS` da fixture.
 * 3. Lê o `dist/` — sem `npm run build` recente, mede o build anterior.
 * 4. A cor da sombra é medida na sombra EXTERNA do `box-shadow` computado (a que não é `inset`; os
 *    materiais acrescentam um realce interno branco antes dela), em canais RGB aproximados: prova a
 *    MATIZ (vermelha × preta × derivada do fundo), não o valor exato de cada canal.
 * 5. A cor das texturas de gradiente é provada por régua relacional: o fundo do pseudoelemento contra a
 *    mesma expressão resolvida num `<i>` irmão com `var(--theme-texture-color)`.
 * -------------------------------------------------------------------------
 */
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

async function withScene(cena: string, tema: string | undefined, measure: (page: Page) => Promise<void>): Promise<void> {
    const page = await openScene(cena, tema);
    try {
        await measure(page);
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

const bodyBackground = (page: Page): Promise<string> => readComputed(page.locator('body'), 'background-image');
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

/** Canais 0..255 da cor de uma camada: `rgb()`/`rgba()` ou `color(srgb r g b)` (saída de `color-mix`). */
function layerChannels(layer: string): [number, number, number] {
    const rgb = layer.match(/rgba?\(\s*([\d.]+),\s*([\d.]+),\s*([\d.]+)/);
    if (rgb) return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])];
    const srgb = layer.match(/color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)/);
    if (srgb) return [Number(srgb[1]) * 255, Number(srgb[2]) * 255, Number(srgb[3]) * 255].map(Math.round) as [number, number, number];
    throw new Error(`camada de sombra sem cor legível: ${layer}`);
}

/** Os canais da sombra EXTERNA (a primeira camada que não é `inset`), a que `shadowColorMode` colore. */
function outerShadowChannels(boxShadow: string): [number, number, number] {
    const outer = splitShadowLayers(boxShadow).find((layer) => !layer.includes('inset'));
    if (!outer) throw new Error(`box-shadow sem sombra externa: ${boxShadow}`);
    return layerChannels(outer);
}

const countOf = (haystack: string, needle: string): number => haystack.split(needle).length - 1;

// ── A1 — bgGradientMode / bgGradientAngle ─────────────────────────────────────────────────────────

test('A1: bgGradientMode "none" não pinta gradiente algum no fundo', async () => {
    await withScene('textura', 'fundo-nenhum', async (page) => {
        const image = await bodyBackground(page);

        expect(image).not.toContain('linear-gradient');
        expect(image).not.toContain('radial-gradient');
    });
});

test('A1: "linear" pinta um linear-gradient no ângulo do token', async () => {
    await withScene('textura', 'fundo-linear', async (page) => {
        expect(await bodyBackground(page)).toContain('linear-gradient(90deg');
    });
    await withScene('textura', 'fundo-linear-45', async (page) => {
        expect(await bodyBackground(page)).toContain('linear-gradient(45deg');
    });
});

test('A1: "radial" pinta um radial-gradient e nenhum linear', async () => {
    await withScene('textura', 'fundo-radial', async (page) => {
        const image = await bodyBackground(page);

        expect(countOf(image, 'radial-gradient(')).toBe(1);
        expect(image).not.toContain('linear-gradient');
    });
});

test('A1: "mesh" mistura quatro manchas radiais', async () => {
    await withScene('textura', 'fundo-mesh', async (page) => {
        expect(countOf(await bodyBackground(page), 'radial-gradient(')).toBe(4);
    });
});

test('A1: os três modos pintam fundos diferentes entre si', async () => {
    const images: string[] = [];
    for (const tema of ['fundo-linear', 'fundo-radial', 'fundo-mesh']) {
        await withScene('textura', tema, async (page) => {
            images.push(await bodyBackground(page));
        });
    }

    expect(new Set(images).size).toBe(3);
});

// ── A2 — surfaceMaterial ──────────────────────────────────────────────────────────────────────────

async function cardMaterial(material: string): Promise<{ filter: string; image: string; shadow: string }> {
    let measured = { filter: '', image: '', shadow: '' };
    await withScene('textura', `material-${material}`, async (page) => {
        const card = firstCard(page);
        measured = {
            filter: await readComputed(card, 'backdrop-filter'),
            image: await readComputed(card, 'background-image'),
            shadow: await readComputed(card, 'box-shadow'),
        };
    });
    return measured;
}

test('A2: frosted desfoca e satura o que está atrás do cartão', async () => {
    const { filter } = await cardMaterial('frosted');

    expect(filter).toContain('blur(');
    expect(filter).toContain('saturate(1.6)');
});

test('A2: sleek desenha um reflexo diagonal e uma quina de luz', async () => {
    const { image, shadow } = await cardMaterial('sleek');

    expect(image).toContain('linear-gradient(115deg');
    expect(shadow).toContain('inset');
});

test('A2: industrial desenha o veio da chapa e o bisel', async () => {
    const { image, shadow } = await cardMaterial('industrial');

    expect(image).toContain('repeating-linear-gradient(90deg');
    expect(countOf(shadow, 'inset')).toBeGreaterThanOrEqual(2);
});

test('A2: organic é fosco — sem desfoque, só uma sombra interna suave', async () => {
    const { filter, image } = await cardMaterial('organic');

    expect(filter).toBe('none');
    expect(image).toContain('radial-gradient(');
});

test('A2: os quatro materiais desenham cartões diferentes entre si', async () => {
    const skins = await Promise.all(['frosted', 'sleek', 'industrial', 'organic'].map(async (material) => {
        const { filter, image, shadow } = await cardMaterial(material);
        return `${filter}|${image}|${shadow}`;
    }));

    expect(new Set(skins).size).toBe(4);
});

// ── A3 / A10 — shadowColorMode e a geometria da sombra do cartão ──────────────────────────────────

async function cardShadow(tema?: string): Promise<string> {
    let shadow = '';
    await withScene('textura', tema, async (page) => {
        shadow = await readComputed(firstCard(page), 'box-shadow');
    });
    return shadow;
}

test('A3: "neutral" é uma sombra preta', async () => {
    const [r, g, b] = outerShadowChannels(await cardShadow('sombra-neutra'));

    expect([r, g, b]).toEqual([0, 0, 0]);
});

test('A3: "colored" tinge a sombra com a cor primária (vermelha)', async () => {
    const [r, g, b] = outerShadowChannels(await cardShadow('sombra-colorida'));

    expect(r).toBeGreaterThan(g + 40);
    expect(r).toBeGreaterThan(b + 40);
});

test('A3: "ambient" deriva a sombra do fundo — nem preta, nem a cor da marca', async () => {
    const neutral = outerShadowChannels(await cardShadow('sombra-neutra'));
    const colored = outerShadowChannels(await cardShadow('sombra-colorida'));
    const ambient = outerShadowChannels(await cardShadow('sombra-ambiente'));

    expect(ambient).not.toEqual(neutral);
    expect(ambient).not.toEqual(colored);
    expect(Math.abs(ambient[0] - ambient[2])).toBeLessThan(40);
});

test('A10: a sombra dura deslocada vem dos tokens de geometria', async () => {
    const shadow = await cardShadow('sombra-dura');

    expect(shadow).toContain('8px 8px 0px 0px');
});

test('NÃO MUDA NADA: sem os tokens de geometria, a sombra do cartão segue 0 20px 50px -12px', async () => {
    const shadow = await cardShadow();

    expect(shadow).toContain('0px 20px 50px -12px');
});

// ── A4 — systemTone ───────────────────────────────────────────────────────────────────────────────

test('A4: "none" não acrescenta camada de tom ao fundo', async () => {
    await withScene('textura', 'tom-neutro', async (page) => {
        const image = await bodyBackground(page);

        expect(image).not.toContain('linear-gradient(rgba');
    });
});

test('A4: "cyber" e "tactical" desenham, cada um, uma grade de HUD diferente', async () => {
    const images: Record<string, string> = {};
    for (const tema of ['tom-neutro', 'tom-cyber', 'tom-tatico']) {
        await withScene('textura', tema, async (page) => {
            images[tema] = await bodyBackground(page);
        });
    }

    expect(countOf(images['tom-cyber'], 'linear-gradient(')).toBeGreaterThanOrEqual(2);
    expect(countOf(images['tom-tatico'], 'linear-gradient(')).toBeGreaterThanOrEqual(2);
    expect(new Set(Object.values(images)).size).toBe(3);
});

test('A4: "tactical" é monocromo — não usa a cor da marca', async () => {
    await withScene('textura', 'tom-tatico', async (page) => {
        const primary = await readComputed(page.locator('body'), '--sarak-primary-color');
        const image = await bodyBackground(page);

        expect(primary.trim().length).toBeGreaterThan(0);
        expect(image).not.toContain(primary.trim());
    });
});

// ── A5 — switchStyleType ──────────────────────────────────────────────────────────────────────────

const track = (page: Page, probe: string): Locator => page.locator(`[data-probe="${probe}"] div.block`);
const thumb = (page: Page, probe: string): Locator => page.locator(`[data-probe="${probe}"] div.absolute`);

test('A5: asymmetric desenha cantos desiguais no trilho', async () => {
    await withScene('alternadores', 'atomo-switch-assimetrico', async (page) => {
        const target = track(page, 'alternador-desligado');
        const topLeft = await readComputed(target, 'border-top-left-radius');
        const topRight = await readComputed(target, 'border-top-right-radius');

        expect(topLeft).not.toBe(topRight);
    });
});

test('A5: pulsing anima o ponto quando ligado e o deixa quieto quando desligado', async () => {
    await withScene('alternadores', 'atomo-switch-pulso', async (page) => {
        expect(await readComputed(thumb(page, 'alternador-ligado'), 'animation-name')).toBe('sarak-switch-pulse');
        expect(await readComputed(thumb(page, 'alternador-desligado'), 'animation-name')).toBe('none');
    });
});

test('A5: glass desfoca o fundo do trilho', async () => {
    await withScene('alternadores', 'atomo-glass', async (page) => {
        expect(await readComputed(track(page, 'alternador-ligado'), 'backdrop-filter')).toContain('blur(');
    });
});

test('NÃO MUDA NADA: tactile não desfoca nem anima', async () => {
    await withScene('alternadores', undefined, async (page) => {
        expect(await readComputed(track(page, 'alternador-ligado'), 'backdrop-filter')).toBe('none');
        expect(await readComputed(thumb(page, 'alternador-ligado'), 'animation-name')).toBe('none');
    });
});

// ── A7 — texturas de branco fixo, em superfície clara ─────────────────────────────────────────────

const FIXED_WHITE_TEXTURES = ['brushed', 'frosted', 'topo-deep', 'prism-mesh', 'blueprint-pro', 'wave-pulse'];
const WHITE_CHANNELS = 'rgba(255, 255, 255';

/** Cor de textura do tema com a reserva da primária, como o CSS a escreve. */
const textureMix = (percent: number): string => `color-mix(in srgb, var(--theme-texture-color, var(--theme-primary)) ${percent}%, transparent)`;

/** As três texturas que pintam por gradiente: a expressão que o CSS declara para o `background-image`. */
const GRADIENT_TEXTURES: Record<string, string> = {
    brushed: `repeating-linear-gradient(90deg, ${textureMix(22)} 0px, ${textureMix(22)} 1px, transparent 1px, transparent 2px)`,
    frosted: `linear-gradient(135deg, ${textureMix(20)}, ${textureMix(5)})`,
    'blueprint-pro': `linear-gradient(${textureMix(25)} 1px, transparent 1px), linear-gradient(90deg, ${textureMix(25)} 1px, transparent 1px), radial-gradient(circle at 100px 100px, transparent 50px, ${textureMix(15)} 50.5px, transparent 51px)`,
};

for (const texture of FIXED_WHITE_TEXTURES) {
    test(`A7: a textura ${texture} pinta com a cor de textura do tema, não em branco fixo nem na primária, no tema claro`, async () => {
        await withScene('texturas-claras', 'tema-claro', async (page) => {
            const card = page.locator(`[data-probe="textura-${texture}"] .sarak-card`);
            const image = await readComputed(card, 'background-image', '::after');
            const color = await readComputed(card, 'background-color', '::after');
            const mask = await readComputed(card, 'mask-image', '::after');
            expect(`${image}|${color}|${mask}`).not.toContain(WHITE_CHANNELS);

            const gradient = GRADIENT_TEXTURES[texture];
            if (gradient) {
                const expected = await resolveExpression(card, 'background-image', gradient);
                const onPrimary = await resolveExpression(card, 'background-image', gradient.split('var(--theme-texture-color, var(--theme-primary))').join('var(--theme-primary)'));
                expect(expected, 'a cor de textura da cena precisa diferir da primária, ou o caso não distingue nada').not.toBe(onPrimary);
                expect(image, `${texture}: o gradiente tem de sair da cor de textura do tema`).toBe(expected);
                return;
            }
            const textureFill = await resolveExpression(card, 'background-color', 'var(--theme-texture-color)');
            expect(color, `${texture}: a máscara é preenchida com a cor de textura do tema`).toBe(textureFill);
            expect(mask, `${texture}: a máscara precisa existir`).not.toBe('none');
        });
    });
}
