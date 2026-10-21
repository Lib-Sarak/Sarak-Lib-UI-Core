/**
 * Medição, em navegador real, de três coisas do SarakGantt que só aparecem fora de um host sem altura e fora do
 * tema escuro (specs/specs/11-testes-e-cobertura.md §7):
 *   - MARCADOR DE HOJE: espessura computada > 0 também num tema que zera `--sarak-border-width`.
 *   - ALTURA: num host de altura definida, a raiz e a área que rola ocupam a altura do host e rolam por dentro;
 *     sem altura no host, vale o teto do componente.
 *   - CONTRASTE: o título da barra contra o que está atrás dele, ≥ 4,5:1 (WCAG AA, texto normal), no tema
 *     escuro padrão e no `minimalist-airy` (claro), ligado por `?tema-ativo=`.
 *
 * Mesmo harness e mesmo artefato dos outros casos (`dist/index.js` + `dist/sarak.css`); cenas `?cena=gantt` e
 * `?cena=gantt-altura` (ver `fixtures/harness-entry.tsx`).
 *
 * Régua do contraste: em cinco pontos ao longo do rótulo, a pilha de elementos sob o ponto
 * (`document.elementsFromPoint`) é composta de cima para baixo pelo `background-color` COMPUTADO de cada um, até
 * ficar opaca (o fundo do `body` fecha a conta); a razão sai da luminância relativa da WCAG 2.x entre essa cor e
 * a `color` computada do rótulo. Vale o PIOR dos cinco pontos.
 *
 * -------------------------------------------------------------------------
 * LIMITES DECLARADOS (R18) — o que esta medição NÃO vê
 * -------------------------------------------------------------------------
 * 1. Só `background-color` entra na composição: imagem de fundo, gradiente e textura de tema são ignorados
 *    (nenhum deles fica atrás das barras na cena medida). Não lê pixel nenhum.
 * 2. Só as barras cujo rótulo está inteiro dentro da área visível da rolagem, na posição inicial.
 * 3. Só Chromium headless, só os dois temas nomeados, só os hosts da cena.
 * 4. Lê o `dist/` — sem `npm run build` recente, mede o build anterior.
 * -------------------------------------------------------------------------
 */
import { test, expect, chromium, type Browser, type Page } from '@playwright/test';

const DESKTOP = { width: 1280, height: 900 } as const;
const SUBPIXEL = 1;
const ASYNC_THEME_TIMEOUT_MS = 5000;
/** WCAG 2.x, nível AA, texto de tamanho normal. */
const AA_NORMAL_TEXT = 4.5;

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

async function openScene(params: Record<string, string>): Promise<Page> {
    const page = await browser.newPage({ viewport: DESKTOP });
    await page.goto(`${harnessUrl}?${new URLSearchParams(params).toString()}`);
    await page.locator('[data-gantt-scroll]').first().waitFor();
    return page;
}

test.describe('SarakGantt — altura do host', () => {
    test('num host de altura definida, a raiz e a área que rola ocupam a altura do host e rolam por dentro', async () => {
        const page = await openScene({ cena: 'gantt-altura' });
        try {
            for (const probe of ['gantt-host-largo', 'gantt-host-estreito']) {
                const sizes = await page.locator(`[data-probe="${probe}"]`).evaluate((host) => {
                    const root = host.firstElementChild as HTMLElement;
                    const region = host.querySelector('[data-gantt-scroll]') as HTMLElement;
                    return {
                        host: host.getBoundingClientRect().height,
                        root: root.getBoundingClientRect().height,
                        region: region.getBoundingClientRect().height,
                        scrollHeight: region.scrollHeight,
                        clientHeight: region.clientHeight,
                    };
                });
                expect(Math.abs(sizes.root - sizes.host), probe).toBeLessThanOrEqual(SUBPIXEL);
                expect(sizes.region, probe).toBeLessThanOrEqual(sizes.host + SUBPIXEL);
                expect(sizes.scrollHeight, probe).toBeGreaterThan(sizes.clientHeight);
            }
        } finally {
            await page.close();
        }
    });

    test('sem altura no host, o teto do componente continua valendo e a área rola por dentro', async () => {
        const page = await openScene({ cena: 'gantt' });
        try {
            const region = page.locator('[data-probe="gantt-largo"] [data-gantt-scroll]');
            const { scrollHeight, clientHeight } = await region.evaluate((el) => ({ scrollHeight: el.scrollHeight, clientHeight: el.clientHeight }));
            expect(scrollHeight).toBeGreaterThan(clientHeight);
        } finally {
            await page.close();
        }
    });
});

/** Pior razão de contraste de cada barra visível: o título contra a pilha de fundos atrás dele. */
async function worstBarContrasts(page: Page): Promise<{ bar: string; ratio: number }[]> {
    return page.locator('[data-probe="gantt-largo"]').evaluate((probe) => {
        type Rgba = [number, number, number, number];
        const parse = (value: string): Rgba => {
            const srgb = value.match(/color\(srgb ([\d.e-]+) ([\d.e-]+) ([\d.e-]+)(?: \/ ([\d.e-]+))?\)/);
            if (srgb) return [Number(srgb[1]) * 255, Number(srgb[2]) * 255, Number(srgb[3]) * 255, srgb[4] === undefined ? 1 : Number(srgb[4])];
            const rgb = value.match(/rgba?\(([^)]+)\)/);
            if (!rgb) return [0, 0, 0, 0];
            const parts = rgb[1].split(/[\s,/]+/).filter(Boolean).map(Number);
            return [parts[0], parts[1], parts[2], parts[3] ?? 1];
        };
        const over = (top: Rgba, below: Rgba): Rgba => {
            const alpha = top[3] + below[3] * (1 - top[3]);
            if (alpha === 0) return [0, 0, 0, 0];
            const mix = (index: number) => (top[index] * top[3] + below[index] * below[3] * (1 - top[3])) / alpha;
            return [mix(0), mix(1), mix(2), alpha];
        };
        const luminance = ([r, g, b]: Rgba) => {
            const channel = (value: number) => {
                const s = value / 255;
                return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
            };
            return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
        };
        const ratio = (a: Rgba, b: Rgba) => {
            const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
            return (hi + 0.05) / (lo + 0.05);
        };
        const backdropAt = (x: number, y: number, label: Element): Rgba => {
            let color: Rgba = [0, 0, 0, 0];
            for (const el of document.elementsFromPoint(x, y)) {
                if (el === label || label.contains(el)) continue;
                color = over(color, parse(getComputedStyle(el).backgroundColor));
                if (color[3] >= 0.999) return color;
            }
            return over(color, [255, 255, 255, 1]);
        };

        const region = probe.querySelector('[data-gantt-scroll]')!.getBoundingClientRect();
        return [...probe.querySelectorAll<HTMLElement>('[data-gantt-bar]')].flatMap((bar) => {
            const label = [...bar.querySelectorAll('span')].find((span) => span.textContent && span.children.length === 0)!;
            const box = label.getBoundingClientRect();
            if (box.left < region.left || box.right > region.right || box.top < region.top || box.bottom > region.bottom) return [];
            const text = parse(getComputedStyle(label).color);
            const y = box.top + box.height / 2;
            const ratios = [0.1, 0.3, 0.5, 0.7, 0.9].map((f) => ratio(text, backdropAt(box.left + box.width * f, y, label)));
            return [{ bar: bar.dataset.ganttBar ?? '', ratio: Math.min(...ratios) }];
        });
    });
}

for (const theme of [{ name: 'escuro (padrão)', params: {} }, { name: 'claro (minimalist-airy)', params: { 'tema-ativo': 'minimalist-airy' } }]) {
    test(`SarakGantt — tema ${theme.name}: o título de toda barra visível contrasta ≥ 4,5:1 com o que está atrás dele`, async () => {
        const page = await openScene({ cena: 'gantt', ...theme.params });
        try {
            const results = await worstBarContrasts(page);
            expect(results.length).toBeGreaterThanOrEqual(5);
            expect(results.filter((result) => result.ratio < AA_NORMAL_TEXT)).toEqual([]);
        } finally {
            await page.close();
        }
    });
}

test('o harness liga mesmo o tema claro (pré-condição do caso de contraste)', async () => {
    const page = await openScene({ cena: 'gantt', 'tema-ativo': 'minimalist-airy' });
    try {
        // O scroll do Gantt monta antes do import lazy do tema; esperar a cor clara evita ler o tema padrão sob carga.
        await page.waitForFunction(() => {
            const channels = (getComputedStyle(document.body).backgroundColor.match(/\d+(\.\d+)?/g) ?? []).map(Number);
            return channels.length >= 3 && (channels[0] + channels[1] + channels[2]) / 3 > 200;
        }, undefined, { timeout: ASYNC_THEME_TIMEOUT_MS });
        const bodyIsLight = await page.evaluate(() => {
            const [r, g, b] = (getComputedStyle(document.body).backgroundColor.match(/\d+(\.\d+)?/g) ?? []).map(Number);
            return (r + g + b) / 3 > 200;
        });
        expect(bodyIsLight).toBe(true);
    } finally {
        await page.close();
    }
});

// O marcador de hoje é informação: um tema que zera `--sarak-border-width` (o `minimalist-airy`) não pode apagá-lo.
for (const theme of [{ name: 'claro (minimalist-airy)', params: { 'tema-ativo': 'minimalist-airy' } }, { name: 'escuro (padrão)', params: {} }]) {
    test(`SarakGantt — tema ${theme.name}: o marcador de hoje tem espessura computada > 0, dentro da linha do tempo`, async () => {
        const page = await openScene({ cena: 'gantt', ...theme.params });
        try {
            const marker = await page.locator('[data-probe="gantt-largo"]').evaluate((probe) => {
                const today = probe.querySelector('[data-gantt-today]') as HTMLElement;
                const timeline = probe.querySelector('[data-gantt-timeline]')!.getBoundingClientRect();
                const box = today.getBoundingClientRect();
                return {
                    thickness: parseFloat(getComputedStyle(today).borderInlineStartWidth),
                    width: box.width,
                    inside: box.left >= timeline.left && box.right <= timeline.right,
                };
            });
            expect(marker.thickness).toBeGreaterThan(0);
            expect(marker.width).toBeGreaterThan(0);
            expect(marker.inside).toBe(true);
        } finally {
            await page.close();
        }
    });
}
