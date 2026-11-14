/**
 * Anatomia da barra lateral medida em navegador real, com o conteúdo da foto da barra antiga (marca sem logo, dois
 * grupos, seis itens com ícone, um ativo, usuário, uma notificação, dois idiomas), a 1440×900 no modo escuro: moldura
 * de cartão, cabeçalho da marca com monograma e seta, títulos de seção largos, item ativo com marcador na primária e
 * fundo quase invisível, ícone inativo na cor do rótulo, busca da altura do item, nenhum item atrás do rodapé e a barra
 * recolhida, o vidro do ativo, o respiro abaixo do topo e as sub-abas pela porta `navItems`. O `jsdom` não resolve layout, cor computada nem sobreposição.
 *
 * LIMITES DECLARADOS (R18): lê o código-fonte (`src/index.ts`) com a folha `dist/sarak.css` — classe utilitária nova
 * só aparece depois de `npm run build:css`; não mede pixel, só caixa e cor computadas; o contraste do texto ativo se
 * compõe sobre a cor de fundo computada da barra (gradiente e textura não entram).
 */
import fs from 'node:fs';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { buildHarness } from './build-harness.mjs';

const ENTRY = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures', 'barra-lateral-anatomia-entry.tsx');
const THEMES = ['sarak-sovereign-classic', 'dot-matrix-elegant', 'cyberpunk-neon-classic', 'sarak-sovereign'] as const;
const DESKTOP = { width: 1440, height: 900 };
const SMALL_DESKTOP = { width: 1280, height: 720 };
const MAX_ACTIVE_ALPHA = 0.15;
const MIN_TEXT_CONTRAST = 4.5;
const MIN_CATEGORY_TRACKING_EM = 0.15;
const MAX_NEUTRAL_CHROMA = 48;
const ITEM_HEIGHT_TOLERANCE = 2;
const ICON_LEFT_MAX = 24;
const SUBPIXEL = 1;
const MIN_TOP_BREATH = 8;
/** Os itens de primeiro nível da lista; as sub-abas de um grupo ficam de fora. */
const TOP_ITEMS = 'aside nav a:not([role="group"] a)';

let harnessDirectory: string;
let harnessUrl: string;

test.beforeAll(async () => {
    const harness = await buildHarness(ENTRY, { useSourceLibrary: true });
    harnessDirectory = harness.outDir;
    harnessUrl = pathToFileURL(harness.htmlPath).href;
});

test.afterAll(() => {
    if (harnessDirectory) fs.rmSync(harnessDirectory, { recursive: true, force: true });
});

interface Scene { theme: string; design?: Record<string, unknown>; logo?: boolean; route?: string; viewport?: { width: number; height: number } }

async function open(page: Page, scene: Scene): Promise<void> {
    const query = new URLSearchParams({ theme: scene.theme, design: JSON.stringify(scene.design ?? {}) });
    if (scene.logo) query.set('logo', '1');
    if (scene.route) query.set('route', scene.route);
    await page.setViewportSize(scene.viewport ?? DESKTOP);
    await page.goto(`${harnessUrl}?${query.toString()}`);
    await expect(page.getByTestId('content')).toBeVisible();
    await page.waitForFunction(() => document.querySelector('aside [aria-current="page"]') !== null);
}

/** Instala no documento um leitor de cor que pinta a cor num pixel e devolve `[r, g, b, a]` (a de 0 a 1). */
async function installColorReader(page: Page): Promise<void> {
    await page.evaluate(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        const context = canvas.getContext('2d', { willReadFrequently: true })!;
        (window as unknown as { __rgba: (color: string) => number[] }).__rgba = (color: string): number[] => {
            context.clearRect(0, 0, 1, 1);
            context.fillStyle = '#000';
            context.fillStyle = color;
            context.fillRect(0, 0, 1, 1);
            const [red, green, blue, alpha] = context.getImageData(0, 0, 1, 1).data;
            return [red, green, blue, alpha / 255];
        };
    });
}

const luminance = ([red, green, blue]: number[]): number => {
    const linear = (channel: number): number => {
        const value = channel / 255;
        return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * linear(red) + 0.7152 * linear(green) + 0.0722 * linear(blue);
};

const contrast = (first: number[], second: number[]): number => {
    const [high, low] = [luminance(first), luminance(second)].sort((a, b) => b - a);
    return (high + 0.05) / (low + 0.05);
};

const over = (top: number[], bottom: number[]): number[] =>
    [0, 1, 2].map((index) => top[index] * top[3] + bottom[index] * (1 - top[3]));

const chroma = ([red, green, blue]: number[]): number => Math.max(red, green, blue) - Math.min(red, green, blue);

const sameColor = (first: number[], second: number[]): boolean =>
    [0, 1, 2].every((index) => Math.abs(first[index] - second[index]) <= 2);

/** Cor computada de uma variável de tema, lida por um elemento-sonda dentro da barra. */
async function themeColor(page: Page, variable: string): Promise<number[]> {
    return page.evaluate((name) => {
        const probe = document.createElement('span');
        probe.style.color = `var(${name})`;
        document.querySelector('aside')!.appendChild(probe);
        const color = getComputedStyle(probe).color;
        probe.remove();
        return (window as unknown as { __rgba: (color: string) => number[] }).__rgba(color);
    }, variable);
}

interface ActiveMeasure { marker: number[] | null; background: number[]; text: number[]; asideBackground: number[] }

async function measureActive(page: Page): Promise<ActiveMeasure> {
    return page.evaluate(() => {
        const rgba = (window as unknown as { __rgba: (color: string) => number[] }).__rgba;
        const aside = document.querySelector('aside')!;
        const active = aside.querySelector<HTMLElement>('nav [aria-current="page"]')!;
        const marker = Array.from(active.children).find((child) => child.getAttribute('aria-hidden') === 'true' && getComputedStyle(child).position === 'absolute');
        const label = Array.from(active.querySelectorAll('span')).find((span) => span.textContent === 'Sessões TCE-SP')!;
        return {
            marker: marker ? rgba(getComputedStyle(marker).backgroundColor) : null,
            background: rgba(getComputedStyle(active).backgroundColor),
            text: rgba(getComputedStyle(label).color),
            asideBackground: rgba(getComputedStyle(aside).backgroundColor),
        };
    });
}

for (const theme of THEMES) {
    test.describe(`anatomia da barra — ${theme}`, () => {
        test('item ativo: marcador na cor da primária', async ({ page }) => {
            await open(page, { theme });
            await installColorReader(page);
            const { marker } = await measureActive(page);
            expect(marker, 'o ativo tem marcador').not.toBeNull();
            // A primária do tema é a semente da paleta, a cor exata da superfície primária (`btnPrimaryBg`); o
            // `--theme-primary` é a primária de TEXTO, que a paleta anda até ter contraste e pode sair quase branca.
            expect(sameColor(marker!, await themeColor(page, '--sarak-btn-primary-bg')), `marcador ${marker} × primária`).toBe(true);
        });

        test('item ativo: fundo com alfa de no máximo 0,15', async ({ page }) => {
            await open(page, { theme });
            await installColorReader(page);
            const { background } = await measureActive(page);
            expect(background[3]).toBeLessThanOrEqual(MAX_ACTIVE_ALPHA);
        });

        test('item ativo: texto a 4,5:1 contra o fundo da barra', async ({ page }) => {
            await open(page, { theme });
            await installColorReader(page);
            const { background, text, asideBackground } = await measureActive(page);
            const surface = over(background, asideBackground);
            expect(contrast(text, surface)).toBeGreaterThanOrEqual(MIN_TEXT_CONTRAST);
        });

        test('ícone inativo na cor do rótulo inativo', async ({ page }) => {
            await open(page, { theme });
            await installColorReader(page);
            const pairs = await page.evaluate((selector) => {
                const rgba = (window as unknown as { __rgba: (color: string) => number[] }).__rgba;
                return Array.from(document.querySelectorAll<HTMLElement>(`${selector}:not([aria-current])`)).map((item) => {
                    const icon = item.querySelector<HTMLElement>('span[aria-hidden="true"]')!;
                    return { label: item.textContent, icon: rgba(getComputedStyle(icon).color), text: rgba(getComputedStyle(item).color) };
                });
            }, TOP_ITEMS);
            expect(pairs.length).toBe(5);
            for (const pair of pairs) expect(sameColor(pair.icon, pair.text), `${pair.label}: ícone ${pair.icon} × rótulo ${pair.text}`).toBe(true);
        });

        test('moldura: cartão com o raio do tema e borda de 1 px', async ({ page }) => {
            await open(page, { theme });
            const frame = await page.evaluate(() => {
                const aside = document.querySelector('aside')!;
                const style = getComputedStyle(aside);
                const probe = document.createElement('div');
                probe.style.borderTopLeftRadius = 'var(--sarak-border-radius)';
                aside.appendChild(probe);
                const themeRadius = parseFloat(getComputedStyle(probe).borderTopLeftRadius);
                probe.remove();
                return {
                    margin: parseFloat(style.marginTop),
                    radius: parseFloat(style.borderTopLeftRadius),
                    themeRadius,
                    borders: [style.borderTopWidth, style.borderRightWidth, style.borderBottomWidth, style.borderLeftWidth].map(parseFloat),
                };
            });
            expect(frame.margin, 'a barra destacada da borda da tela').toBeGreaterThan(0);
            expect(frame.radius).toBeGreaterThan(0);
            expect(frame.radius).toBeCloseTo(frame.themeRadius, 0);
            expect(frame.borders).toEqual([1, 1, 1, 1]);
        });

        test('cabeçalho: faixa da altura do topo, linha embaixo, monograma e seta à direita', async ({ page }) => {
            await open(page, { theme, design: { sidebarLogoPlacement: 'top' } });
            const header = await page.evaluate(() => {
                const aside = document.querySelector('aside')!;
                const band = aside.querySelector<HTMLElement>('[data-sarak-sidebar-header]')!;
                const probe = document.createElement('div');
                probe.style.height = 'var(--sarak-topbar-height)';
                aside.appendChild(probe);
                const topbarHeight = probe.getBoundingClientRect().height;
                probe.remove();
                const box = band.getBoundingClientRect();
                const monogram = band.querySelector<HTMLElement>('[data-sarak-brand-monogram]');
                const collapse = band.querySelector<HTMLElement>('[data-sarak-widget="collapse"]');
                return {
                    height: box.height,
                    topbarHeight,
                    borderBottom: parseFloat(getComputedStyle(band).borderBottomWidth),
                    monogram: monogram?.textContent ?? null,
                    collapseRightGap: collapse ? box.right - collapse.getBoundingClientRect().right : null,
                    collapseCenterGap: collapse ? box.left + box.width / 2 - collapse.getBoundingClientRect().left : null,
                };
            });
            expect(header.height).toBeCloseTo(header.topbarHeight, 0);
            expect(header.borderBottom).toBeGreaterThanOrEqual(1);
            expect(header.monogram).toBe('S');
            expect(header.collapseRightGap, 'a seta mora no cabeçalho').not.toBeNull();
            expect(header.collapseCenterGap!, 'a seta fica na metade direita').toBeLessThan(0);
        });

        test('cabeçalho com logo: o fundo da marca ocupa a faixa inteira, sem corte', async ({ page }) => {
            await open(page, { theme, logo: true, design: { sidebarLogoPlacement: 'top' } });
            const band = await page.evaluate(() => {
                const aside = document.querySelector('aside')!;
                const header = aside.querySelector<HTMLElement>('[data-sarak-sidebar-header]')!;
                const painted = [header, ...Array.from(header.querySelectorAll<HTMLElement>('*'))]
                    .filter((node) => getComputedStyle(node).backgroundColor !== 'rgba(0, 0, 0, 0)' && !node.closest('button'));
                const asideBox = aside.getBoundingClientRect();
                const borderLeft = parseFloat(getComputedStyle(aside).borderLeftWidth);
                const borderRight = parseFloat(getComputedStyle(aside).borderRightWidth);
                return {
                    innerWidth: asideBox.width - borderLeft - borderRight,
                    asideTop: asideBox.top,
                    painted: painted.map((node) => ({ width: node.getBoundingClientRect().width, top: node.getBoundingClientRect().top })),
                };
            });
            for (const node of band.painted) {
                expect(node.width, 'fundo da marca mais estreito que a faixa').toBeGreaterThanOrEqual(band.innerWidth - SUBPIXEL);
                expect(node.top, 'fundo da marca cortado no topo').toBeGreaterThanOrEqual(band.asideTop);
            }
        });

        test('marca embaixo: o topo fica só com a seta, sem faixa vazia', async ({ page }) => {
            await open(page, { theme, design: { sidebarLogoPlacement: 'bottom' } });
            const top = await page.evaluate(() => {
                const header = document.querySelector<HTMLElement>('aside [data-sarak-sidebar-header]');
                const collapse = header?.querySelector<HTMLElement>('[data-sarak-widget="collapse"]');
                return { header: header?.getBoundingClientRect().height ?? 0, collapse: collapse?.getBoundingClientRect().height ?? null };
            });
            expect(top.collapse, 'a seta continua no topo').not.toBeNull();
            expect(top.header).toBeLessThanOrEqual(top.collapse! + 16);
        });

        test('títulos de seção: caixa alta, negrito, espaçamento largo e na cor do texto', async ({ page }) => {
            await open(page, { theme });
            await installColorReader(page);
            const titles = await page.evaluate(() => {
                const rgba = (window as unknown as { __rgba: (color: string) => number[] }).__rgba;
                return Array.from(document.querySelectorAll<HTMLElement>('aside nav *'))
                    .filter((node) => node.children.length === 0 && ['Personalização', 'Relatórios', 'Comercial'].includes(node.textContent ?? ''))
                    .map((node) => {
                        const style = getComputedStyle(node);
                        return {
                            text: node.textContent,
                            transform: style.textTransform,
                            weight: Number(style.fontWeight),
                            trackingEm: parseFloat(style.letterSpacing) / parseFloat(style.fontSize),
                            color: rgba(style.color),
                        };
                    });
            });
            expect(titles.map((title) => title.text)).toEqual(['Personalização', 'Relatórios', 'Comercial']);
            for (const title of titles) {
                expect(title.transform).toBe('uppercase');
                expect(title.weight).toBeGreaterThanOrEqual(700);
                expect(title.trackingEm, `${title.text}: espaçamento em em`).toBeGreaterThanOrEqual(MIN_CATEGORY_TRACKING_EM);
                expect(chroma(title.color), `${title.text}: cor ${title.color} não é a do texto (neutra)`).toBeLessThanOrEqual(MAX_NEUTRAL_CHROMA);
            }
        });

        test('busca compacta: a altura de um item de menu', async ({ page }) => {
            await open(page, { theme });
            const heights = await page.evaluate((selector) => {
                const search = document.querySelector<HTMLElement>('aside [data-sarak-slot="search"]');
                // O campo à vista: o gatilho de ícone mora no mesmo bloco, escondido enquanto a caixa cabe.
                const field = Array.from(search?.querySelectorAll<HTMLElement>('input, button, a') ?? []).find((node) => node.getBoundingClientRect().height > 0);
                const item = document.querySelector<HTMLElement>(selector)!;
                return { search: field?.getBoundingClientRect().height ?? null, item: item.getBoundingClientRect().height };
            }, TOP_ITEMS);
            expect(heights.search, 'a busca aparece na barra').not.toBeNull();
            expect(Math.abs(heights.search! - heights.item)).toBeLessThanOrEqual(ITEM_HEIGHT_TOLERANCE);
        });

        test('itens alinhados à esquerda e o ativo sem truncar', async ({ page }) => {
            await open(page, { theme });
            const items = await page.evaluate(({ subpixel, selector }) => Array.from(document.querySelectorAll<HTMLElement>(selector)).map((item) => {
                const icon = item.querySelector<HTMLElement>('span[aria-hidden="true"]:not([class*="absolute"])')!;
                const label = Array.from(item.querySelectorAll('span')).find((span) => span.children.length === 0 && span.textContent === item.textContent)!;
                return {
                    text: item.textContent,
                    active: item.getAttribute('aria-current') === 'page',
                    iconOffset: icon.getBoundingClientRect().left - item.getBoundingClientRect().left,
                    truncated: label.scrollWidth > label.clientWidth + subpixel,
                };
            }), { subpixel: SUBPIXEL, selector: TOP_ITEMS });
            for (const item of items) expect(item.iconOffset, `${item.text}: ícone afastado da borda`).toBeLessThanOrEqual(ICON_LEFT_MAX);
            const active = items.find((item) => item.active)!;
            expect(active.truncated, `${active.text} truncado`).toBe(false);
        });

        for (const viewport of [DESKTOP, SMALL_DESKTOP]) {
            test(`nenhum item atrás do rodapé a ${viewport.width}×${viewport.height}`, async ({ page }) => {
                await open(page, { theme, viewport });
                const hidden = await page.evaluate(() => {
                    const aside = document.querySelector('aside')!;
                    const nav = aside.querySelector<HTMLElement>('nav')!;
                    const footer = aside.querySelector<HTMLElement>('[data-sarak-sidebar-footer]');
                    const limit = Math.min(nav.getBoundingClientRect().bottom, footer?.getBoundingClientRect().top ?? Infinity);
                    return Array.from(nav.querySelectorAll<HTMLElement>('a:not([role="group"] a), button[aria-expanded]')).filter((item) => {
                        item.scrollIntoView({ block: 'nearest' });
                        const box = item.getBoundingClientRect();
                        const navTop = nav.getBoundingClientRect().top;
                        return box.bottom > limit + 1 || box.top < navTop - 1;
                    }).map((item) => item.textContent);
                });
                expect(hidden, 'itens que nem rolando saem de trás do rodapé').toEqual([]);
            });
        }

        for (const glass of ['on', 'off'] as const) {
            test(`vidro ${glass}: brilho interno do ativo ${glass === 'on' ? 'presente' : 'ausente'}`, async ({ page }) => {
                await open(page, { theme, design: { sidebarActiveGlass: glass } });
                const shadow = await page.evaluate(() => getComputedStyle(document.querySelector<HTMLElement>('aside nav [aria-current="page"]')!).boxShadow);
                if (glass === 'on') expect(shadow, 'o ativo tem brilho interno').toContain('inset');
                else expect(shadow.includes('inset'), `sem vidro, sombra ${shadow}`).toBe(false);
            });
        }

        test('item inativo apagado: menos contraste que o ativo e ainda 4,5:1', async ({ page }) => {
            await open(page, { theme });
            await installColorReader(page);
            const { background, text, asideBackground } = await measureActive(page);
            const inactive = await page.evaluate((selector) => {
                const rgba = (window as unknown as { __rgba: (color: string) => number[] }).__rgba;
                return Array.from(document.querySelectorAll<HTMLElement>(`${selector}:not([aria-current])`)).map((item) => rgba(getComputedStyle(item).color));
            }, TOP_ITEMS);
            const activeContrast = contrast(text, over(background, asideBackground));
            for (const color of inactive) {
                const ratio = contrast(over(color, asideBackground), asideBackground);
                expect(ratio, 'inativo legível').toBeGreaterThanOrEqual(MIN_TEXT_CONTRAST);
                expect(ratio, `inativo ${ratio.toFixed(2)} × ativo ${activeContrast.toFixed(2)}`).toBeLessThan(activeContrast);
            }
        });

        for (const placement of ['top', 'bottom'] as const) {
            test(`respiro abaixo do topo e busca na coluna dos itens (marca ${placement === 'top' ? 'no topo' : 'embaixo'})`, async ({ page }) => {
                await open(page, { theme, design: { sidebarLogoPlacement: placement } });
                const box = await page.evaluate((selector) => {
                    const aside = document.querySelector('aside')!;
                    const header = aside.querySelector<HTMLElement>('[data-sarak-sidebar-header]');
                    const search = aside.querySelector<HTMLElement>('[data-sarak-slot="search"]')!;
                    const field = Array.from(search.querySelectorAll<HTMLElement>('input, button, a')).find((node) => node.getBoundingClientRect().height > 0)!;
                    // A borda esquerda do campo é a da caixa que desenha a borda dele.
                    let frame: HTMLElement = field;
                    for (let node: HTMLElement | null = field; node && node !== search; node = node.parentElement) {
                        if (parseFloat(getComputedStyle(node).borderLeftWidth) > 0) { frame = node; break; }
                    }
                    const fieldBox = frame.getBoundingClientRect();
                    const items = Array.from(document.querySelectorAll<HTMLElement>(selector));
                    const firstSectionItem = items.find((item) => item.textContent === 'Design Engine')!;
                    const reportsTitle = Array.from(aside.querySelectorAll<HTMLElement>('nav *')).find((node) => node.children.length === 0 && node.textContent === 'Relatórios')!;
                    return {
                        topToSearch: fieldBox.top - (header ? header.getBoundingClientRect().bottom : aside.getBoundingClientRect().top),
                        sectionGap: reportsTitle.getBoundingClientRect().top - firstSectionItem.getBoundingClientRect().bottom,
                        searchLeft: fieldBox.left,
                        itemLeft: items[0].getBoundingClientRect().left,
                    };
                }, TOP_ITEMS);
                expect(box.topToSearch, 'respiro topo→busca').toBeGreaterThanOrEqual(MIN_TOP_BREATH);
                expect(Math.abs(box.topToSearch - box.sectionGap), `topo→busca ${box.topToSearch} × vão entre seções ${box.sectionGap}`).toBeLessThanOrEqual(SUBPIXEL);
                expect(Math.abs(box.searchLeft - box.itemLeft), `busca ${box.searchLeft} × itens ${box.itemLeft}`).toBeLessThanOrEqual(SUBPIXEL);
            });
        }

        test('sub-abas: o grupo abre e fecha pela seta, com mouse e teclado', async ({ page }) => {
            await open(page, { theme });
            const parent = page.locator('aside nav button[aria-expanded]', { hasText: 'Vendas' });
            await expect(parent).toHaveAttribute('aria-expanded', 'false');
            await parent.click();
            await expect(parent).toHaveAttribute('aria-expanded', 'true');
            await expect(page.locator('aside nav [role="group"] a', { hasText: 'Pedidos' })).toBeVisible();
            await parent.click();
            await expect(parent).toHaveAttribute('aria-expanded', 'false');
            await parent.focus();
            await page.keyboard.press('Enter');
            await expect(parent).toHaveAttribute('aria-expanded', 'true');
            await page.keyboard.press('Space');
            await expect(parent).toHaveAttribute('aria-expanded', 'false');
        });

        test('sub-abas: filho ativo abre o grupo, recua e tem a anatomia do ativo; o selo cabe', async ({ page }) => {
            await open(page, { theme, route: '#vendas-pedidos' });
            await installColorReader(page);
            const parent = page.locator('aside nav button[aria-expanded]', { hasText: 'Vendas' });
            await expect(parent).toHaveAttribute('aria-expanded', 'true');
            const measure = await page.evaluate(() => {
                const rgba = (window as unknown as { __rgba: (color: string) => number[] }).__rgba;
                const aside = document.querySelector('aside')!;
                const parentButton = Array.from(aside.querySelectorAll<HTMLElement>('nav button[aria-expanded]')).find((node) => node.textContent?.includes('Vendas'))!;
                const children = Array.from(aside.querySelectorAll<HTMLElement>('nav [role="group"] a'));
                const active = children.find((child) => child.getAttribute('aria-current') === 'page')!;
                const iconLeft = (node: HTMLElement): number => node.querySelector<HTMLElement>('span[aria-hidden="true"]:not([class*="absolute"])')!.getBoundingClientRect().left;
                const marker = Array.from(active.children).find((child) => child.getAttribute('aria-hidden') === 'true' && getComputedStyle(child).position === 'absolute');
                const withBadge = children.find((child) => child.textContent?.includes('Orçamentos'))!;
                const badgeLabel = Array.from(withBadge.querySelectorAll('span')).find((span) => span.textContent === 'Orçamentos')!;
                return {
                    activeLabel: active.textContent,
                    indent: iconLeft(active) - iconLeft(parentButton),
                    marker: marker ? rgba(getComputedStyle(marker).backgroundColor) : null,
                    background: rgba(getComputedStyle(active).backgroundColor),
                    shadow: getComputedStyle(active).boxShadow,
                    badgeTruncated: badgeLabel.scrollWidth > badgeLabel.clientWidth + 1,
                };
            });
            expect(measure.activeLabel).toBe('Pedidos');
            expect(measure.indent, 'o filho recua em relação ao pai').toBeGreaterThan(8);
            expect(measure.marker, 'o filho ativo tem marcador').not.toBeNull();
            expect(sameColor(measure.marker!, await themeColor(page, '--sarak-btn-primary-bg')), `marcador ${measure.marker} × primária`).toBe(true);
            expect(measure.background[3]).toBeLessThanOrEqual(MAX_ACTIVE_ALPHA);
            expect(measure.shadow).toContain('inset');
            expect(measure.badgeTruncated, 'o selo trunca "Orçamentos"').toBe(false);
        });

        test('recolhida: monograma, ícones centrados e marcador no ativo', async ({ page }) => {
            await open(page, { theme, design: { isNavHidden: true, sidebarLogoPlacement: 'top' } });
            await installColorReader(page);
            const collapsed = await page.evaluate(() => {
                const aside = document.querySelector('aside')!;
                const items = Array.from(aside.querySelectorAll<HTMLElement>('nav a, nav button[aria-expanded]')).map((item) => {
                    const icon = item.querySelector<HTMLElement>('span[aria-hidden="true"]:not([class*="absolute"])')!.getBoundingClientRect();
                    const box = item.getBoundingClientRect();
                    return Math.abs(icon.left + icon.width / 2 - (box.left + box.width / 2));
                });
                const active = aside.querySelector<HTMLElement>('nav [aria-current="page"]')!;
                const marker = Array.from(active.children).find((child) => child.getAttribute('aria-hidden') === 'true' && getComputedStyle(child).position === 'absolute');
                return {
                    width: aside.getBoundingClientRect().width,
                    monogram: aside.querySelector('[data-sarak-brand-monogram]')?.textContent ?? null,
                    offsets: items,
                    markerVisible: marker ? marker.getBoundingClientRect().width > 0 && marker.getBoundingClientRect().height > 0 : false,
                };
            });
            expect(collapsed.width).toBeLessThan(120);
            expect(collapsed.monogram).toBe('S');
            for (const offset of collapsed.offsets) expect(offset).toBeLessThanOrEqual(2);
            expect(collapsed.markerVisible).toBe(true);
        });
    });
}
