/**
 * Personalidade das barras medida em navegador real: grupos recolhíveis nas quatro formas da barra, marca no topo e na
 * base, papel de cor com texto legível, lateral recolhida sem rolagem horizontal e com rodapé fixo, busca estreita,
 * alça de largura e marca sem logo. O `jsdom` não resolve layout, container query nem contraste computado.
 *
 * LIMITES DECLARADOS (R18): lê o `dist/` — sem `npm run build` recente mede o build anterior; o contraste dos 19
 * presets de paleta nos dois modos é do teste de unidade da paleta (`tone-plan.test.ts`), aqui se mede o computado de
 * um preset por papel e por modo; não mede pixel nem animação além de a transição usar o token de movimento.
 */
import fs from 'node:fs';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { buildHarness } from './build-harness.mjs';

const ENTRY = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures', 'plan-149-entry.tsx');
const TOUCH_TARGET_MIN = 44;
const SUBPIXEL = 1;
const MIN_CONTRAST = 4.5;
const ICON_CONTRAST = 3;
const TONES = ['neutral', 'surface', 'primary', 'secondary', 'inverse'] as const;
const MODES = ['light', 'dark'] as const;

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

interface Scene { design?: Record<string, unknown>; query?: Record<string, string>; viewport?: { width: number; height: number } }

async function open(page: Page, scene: Scene = {}): Promise<void> {
    const query = new URLSearchParams({ design: JSON.stringify(scene.design ?? {}), ...(scene.query ?? {}) });
    await page.setViewportSize(scene.viewport ?? { width: 1200, height: 800 });
    await page.goto(`${harnessUrl}?${query.toString()}`);
    await expect(page.getByTestId('content')).toBeVisible();
}

const COLLAPSED = { isNavHidden: true, preferenceNavCollapsePosition: 'pinned' };

test('grupo: abre e fecha por mouse e por teclado, com aria-expanded, na lateral aberta', async ({ page }) => {
    await open(page);
    const vendas = page.getByRole('button', { name: /^Vendas/ });
    await expect(vendas).toHaveAttribute('aria-expanded', 'false');
    await expect(page.getByRole('link', { name: /^Clientes$/ })).toBeHidden();

    await vendas.click();
    await expect(vendas).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByRole('link', { name: /^Clientes$/ })).toBeVisible();
    await vendas.click();
    await expect(vendas).toHaveAttribute('aria-expanded', 'false');

    await vendas.focus();
    await page.keyboard.press('Enter');
    await expect(vendas).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press('Space');
    await expect(vendas).toHaveAttribute('aria-expanded', 'false');
    const controls = await vendas.getAttribute('aria-controls');
    expect(controls && await page.locator(`[id="${controls}"]`).count()).toBe(1);
});

test('grupo: o do item ativo abre sozinho e mais de um fica aberto', async ({ page }) => {
    await open(page, { query: { route: '#vendas/pedidos' } });
    await expect(page.getByRole('button', { name: /^Vendas/ })).toHaveAttribute('aria-expanded', 'true');
    await page.getByRole('button', { name: /^Estoque/ }).click();
    await expect(page.getByRole('button', { name: /^Estoque/ })).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByRole('button', { name: /^Vendas/ })).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByRole('link', { name: /^Pedidos/ })).toHaveAttribute('aria-current', 'page');
});

test('grupo: a animação de recolher usa o token de movimento', async ({ page }) => {
    await open(page);
    const transition = await page.locator('[data-sarak-nav-group] [data-state]').first().evaluate((node) => getComputedStyle(node).transitionDuration);
    expect(transition).not.toBe('0s');
});

test('grupo: com movimento reduzido não anima', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page);
    const transition = await page.locator('[data-sarak-nav-group] [data-state]').first().evaluate((node) => getComputedStyle(node).transitionDuration);
    // O movimento reduzido do cromo zera a duração para um valor desprezível (1e-5 s), não para `0s` exato.
    expect(parseFloat(transition)).toBeLessThan(0.001);
});

test('lateral aberta: sem rolagem horizontal na barra em nenhuma largura', async ({ page }) => {
    for (const width of [200, 320, 450]) {
        await open(page, { design: { sidebarWidth: width, sidebarMinWidth: 150 }, query: { nav: 'long', route: '#vendas/pedidos' } });
        const overflow = await page.evaluate(() => {
            const aside = document.querySelector('aside')!;
            const nav = aside.querySelector('nav')!;
            return { aside: aside.scrollWidth - aside.clientWidth, nav: nav.scrollWidth - nav.clientWidth };
        });
        expect(overflow.aside, `aside em ${width}px`).toBeLessThanOrEqual(SUBPIXEL);
        expect(overflow.nav, `nav em ${width}px`).toBeLessThanOrEqual(SUBPIXEL);
    }
});

test('lateral recolhida: sem rolagem horizontal, só a lista rola e o rodapé fica fixo', async ({ page }) => {
    await open(page, { design: COLLAPSED, query: { nav: 'long' } });
    const before = await page.evaluate(() => {
        const aside = document.querySelector('aside')!;
        const nav = aside.querySelector('nav')!;
        const footer = aside.querySelector('[data-sarak-sidebar-footer]')!;
        return {
            asideWidth: aside.getBoundingClientRect().width,
            asideOverflowX: aside.scrollWidth - aside.clientWidth,
            asideOverflowY: aside.scrollHeight - aside.clientHeight,
            navScrolls: nav.scrollHeight > nav.clientHeight,
            footerTop: footer.getBoundingClientRect().top,
            footerBottom: footer.getBoundingClientRect().bottom,
            asideBottom: aside.getBoundingClientRect().bottom,
        };
    });
    expect(before.asideWidth).toBeLessThan(120);
    expect(before.asideOverflowX).toBeLessThanOrEqual(SUBPIXEL);
    expect(before.asideOverflowY, 'a barra inteira não rola').toBeLessThanOrEqual(SUBPIXEL);
    expect(before.navScrolls, 'a lista, sim').toBe(true);
    expect(before.footerBottom).toBeLessThanOrEqual(before.asideBottom + SUBPIXEL);

    const afterScroll = await page.evaluate(() => {
        const aside = document.querySelector('aside')!;
        aside.querySelector('nav')!.scrollTop = 400;
        return aside.querySelector('[data-sarak-sidebar-footer]')!.getBoundingClientRect().top;
    });
    expect(afterScroll, 'rolar a lista não leva o rodapé junto').toBeCloseTo(before.footerTop, 0);
});

test('lateral recolhida: o menu de preferências abre inteiro, dentro da janela, sem texto cortado', async ({ page }) => {
    await open(page, { design: { ...COLLAPSED, preferenceFontSizePosition: 'menu', preferenceNavigationStylePosition: 'menu' } });
    await page.getByRole('button', { name: 'Preferências' }).click();
    const menu = page.getByRole('menu', { name: 'Preferências' });
    await expect(menu).toBeVisible();
    const measure = await menu.evaluate((node) => {
        const rect = node.getBoundingClientRect();
        const clipped = [...node.querySelectorAll<HTMLElement>('*')].filter((child) => child.scrollWidth > child.clientWidth + 1 && getComputedStyle(child).overflow !== 'visible');
        return {
            inside: rect.left >= 0 && rect.top >= 0 && rect.right <= window.innerWidth && rect.bottom <= window.innerHeight,
            outsideAside: !document.querySelector('aside')!.contains(node),
            ownOverflow: node.scrollWidth - node.clientWidth,
            clipped: clipped.length,
            text: node.textContent ?? '',
        };
    });
    expect(measure.inside).toBe(true);
    expect(measure.outsideAside, 'o menu não fica preso na barra').toBe(true);
    expect(measure.ownOverflow).toBeLessThanOrEqual(SUBPIXEL);
    expect(measure.clipped).toBe(0);
    expect(measure.text).toContain('Lateral');
});

test('lateral recolhida: o nome do item aparece em dica ao focar, e o grupo abre um balão ao lado do ícone', async ({ page }) => {
    await open(page, { design: COLLAPSED });
    await page.getByRole('link', { name: 'Início' }).focus();
    await expect(page.getByRole('tooltip')).toHaveText('Início');

    const vendas = page.getByRole('button', { name: /^Vendas/ });
    await vendas.click();
    const flyout = page.getByRole('group', { name: 'Vendas' });
    await expect(flyout).toBeVisible();
    const placement = await page.evaluate(() => {
        const trigger = document.querySelector('[data-sarak-nav-group] button')!.getBoundingClientRect();
        const fly = document.querySelector('[data-sarak-nav-flyout]')!.getBoundingClientRect();
        return { toTheRight: fly.left >= trigger.right - 1, inside: fly.right <= window.innerWidth };
    });
    expect(placement.toTheRight).toBe(true);
    expect(placement.inside).toBe(true);
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Escape');
    await expect(flyout).toBeHidden();
    await expect(vendas).toBeFocused();
});

test('marca: no topo por padrão, na base quando pedido, e recolhida fica só o símbolo', async ({ page }) => {
    const where = () => page.evaluate(() => ({
        header: Boolean(document.querySelector('[data-sarak-sidebar-header] .sarak-chrome-brand')),
        footer: Boolean(document.querySelector('[data-sarak-sidebar-footer] .sarak-chrome-brand')),
        name: Boolean([...document.querySelectorAll('.sarak-chrome-brand span')].some((node) => node.textContent === 'Sistema')),
        image: Boolean(document.querySelector('.sarak-chrome-brand img')),
        brandTop: document.querySelector('.sarak-chrome-brand')!.getBoundingClientRect().top,
        footerTop: document.querySelector('[data-sarak-slot="sidebarFooter"]')!.getBoundingClientRect().top,
    }));

    await open(page);
    expect(await where()).toMatchObject({ header: true, footer: false, name: true });

    await open(page, { design: { sidebarLogoPlacement: 'bottom' } });
    const bottom = await where();
    expect(bottom).toMatchObject({ header: false, footer: true, name: true });
    expect(bottom.brandTop, 'a marca fica acima do rodapé do host').toBeLessThan(bottom.footerTop);

    await open(page, { design: { sidebarLogoPlacement: 'bottom', isNavHidden: true } });
    expect(await where()).toMatchObject({ footer: true, name: false, image: true });
});

test('marca sem logo: nenhuma caixa colorida, e recolhida o bloco some; com logo, o fundo da marca pinta', async ({ page }) => {
    const brandBackground = () => page.evaluate(() => {
        const block = document.querySelector('.sarak-chrome-brand')?.parentElement;
        return block ? getComputedStyle(block).backgroundColor : null;
    });
    const design = { sidebarBrandBackground: '#ff00ff' };

    await open(page, { design });
    expect(await brandBackground()).toBe('rgb(255, 0, 255)');

    await open(page, { design, query: { logo: 'none' } });
    expect(await brandBackground()).toBe('rgba(0, 0, 0, 0)');

    await open(page, { design: { ...design, isNavHidden: true }, query: { logo: 'none' } });
    expect(await brandBackground(), 'recolhida e sem logo não sobra bloco').toBeNull();
});

test('marca: o topo da lateral tem a altura do topo da área de conteúdo', async ({ page }) => {
    await open(page, { design: { topbarHeight: 72 } });
    const height = await page.evaluate(() => document.querySelector('[data-sarak-sidebar-header]')!.getBoundingClientRect().height);
    expect(height).toBeGreaterThanOrEqual(72 - SUBPIXEL);
});

for (const mode of MODES) {
    for (const tone of TONES) {
        test(`papel de cor ${tone} no modo ${mode}: texto da barra legível sobre o fundo dela`, async ({ page }) => {
            await open(page, { design: { colorPalette: 'oceano', mode, sidebarTone: tone, navigationStyle: 'sidebar' }, query: { route: '#vendas/pedidos' } });
            const measure = await page.evaluate(() => {
                const parse = (value: string): [number, number, number, number] => {
                    const m = value.match(/rgba?\(([^)]+)\)/)![1].split(/[ ,/]+/).filter(Boolean).map(Number);
                    return [m[0], m[1], m[2], m[3] ?? 1];
                };
                const luminance = ([r, g, b]: number[]): number => {
                    const lin = (v: number): number => { const c = v / 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
                    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
                };
                const ratio = (a: number[], b: number[]): number => {
                    const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
                    return (hi + 0.05) / (lo + 0.05);
                };
                const aside = document.querySelector('aside') as HTMLElement;
                const asideBg = parse(getComputedStyle(aside).backgroundColor);
                const body = parse(getComputedStyle(document.body).backgroundColor);
                const flat = asideBg[3] < 1 ? asideBg.slice(0, 3).map((c, i) => c * asideBg[3] + body[i] * (1 - asideBg[3])) : asideBg.slice(0, 3);
                const textOf = (selector: string): number[] => parse(getComputedStyle(aside.querySelector(selector) as HTMLElement).color);
                return {
                    background: flat.map(Math.round).join(','),
                    idle: ratio(textOf('a[href="#home"]'), flat),
                    brand: ratio(textOf('.sarak-chrome-brand span'), flat),
                    group: ratio(textOf('[data-sarak-nav-group] button'), flat),
                };
            });
            expect(measure.idle, 'item comum').toBeGreaterThanOrEqual(MIN_CONTRAST);
            expect(measure.brand, 'nome da marca').toBeGreaterThanOrEqual(MIN_CONTRAST);
            expect(measure.group, 'pai do grupo').toBeGreaterThanOrEqual(MIN_CONTRAST);
        });
    }
}

test('rodapé nas barras contrastantes: nome, avatar, idioma e engrenagem legíveis (3:1 ícone, 4.5:1 texto) nos dois modos', async ({ page }) => {
    for (const mode of MODES) {
        for (const tone of ['primary', 'secondary', 'inverse'] as const) {
            await open(page, { design: { colorPalette: 'oceano', mode, sidebarTone: tone }, query: { route: '#vendas/pedidos' } });
            const m = await page.evaluate(() => {
                // `color-mix`/`color()` voltam do computed em formatos que a regex não lê: o canvas normaliza para RGBA.
                const canvas = document.createElement('canvas').getContext('2d', { willReadFrequently: true })!;
                const parse = (value: string): number[] => { canvas.clearRect(0, 0, 1, 1); canvas.fillStyle = '#000'; canvas.fillStyle = value; canvas.fillRect(0, 0, 1, 1); const [r, g, b, a] = canvas.getImageData(0, 0, 1, 1).data; return [r, g, b, a / 255]; };
                const lin = (v: number): number => { const c = v / 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
                const lum = ([r, g, b]: number[]): number => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
                const ratio = (a: number[], b: number[]): number => { const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x); return (hi + 0.05) / (lo + 0.05); };
                const aside = document.querySelector('aside') as HTMLElement;
                const bg = parse(getComputedStyle(aside).backgroundColor);
                const body = parse(getComputedStyle(document.body).backgroundColor);
                const flat = bg[3] !== undefined && bg[3] < 1 ? bg.slice(0, 3).map((c, i) => c * bg[3] + body[i] * (1 - bg[3])) : bg.slice(0, 3);
                const colorOf = (node: Element | undefined): number[] => parse(getComputedStyle(node as HTMLElement).color);
                const byText = (text: string): Element | undefined => [...aside.querySelectorAll('*')].find((node) => node.children.length === 0 && node.textContent?.trim().toUpperCase() === text.toUpperCase());
                const gear = aside.querySelector('[data-sarak-widget="preferences-menu"] button svg') ?? aside.querySelector('[data-sarak-widget="preferences-menu"] button');
                return {
                    name: byText('Ana') ? ratio(colorOf(byText('Ana')), flat) : null,
                    avatar: byText('A') ? ratio(colorOf(byText('A')), flat) : null,
                    language: byText('PT') ? ratio(colorOf(byText('PT')), flat) : null,
                    gear: gear ? ratio(colorOf(gear), flat) : null,
                };
            });
            const where = `${tone} / ${mode}`;
            expect(m.name, `nome (${where})`).toBeGreaterThanOrEqual(MIN_CONTRAST);
            expect(m.language, `idioma (${where})`).toBeGreaterThanOrEqual(MIN_CONTRAST);
            expect(m.avatar, `avatar (${where})`).toBeGreaterThanOrEqual(ICON_CONTRAST);
            expect(m.gear, `engrenagem (${where})`).toBeGreaterThanOrEqual(ICON_CONTRAST);
            // O botão de sair na variante mini: lateral recolhida e topbar.
            for (const scene of [
                { name: 'lateral recolhida', bar: 'aside', design: { isNavHidden: true, sidebarTone: tone } },
                { name: 'topbar', bar: 'header', design: { navigationStyle: 'topbar', topbarTone: tone } },
            ]) {
                await open(page, { design: { colorPalette: 'oceano', mode, ...scene.design } });
                const logout = await page.evaluate((barSelector) => {
                    const canvas = document.createElement('canvas').getContext('2d', { willReadFrequently: true })!;
                    const parse = (value: string): number[] => { canvas.clearRect(0, 0, 1, 1); canvas.fillStyle = '#000'; canvas.fillStyle = value; canvas.fillRect(0, 0, 1, 1); const [r, g, b, a] = canvas.getImageData(0, 0, 1, 1).data; return [r, g, b, a / 255]; };
                    const lin = (v: number): number => { const c = v / 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
                    const lum = ([r, g, b]: number[]): number => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
                    const bar = document.querySelector(barSelector) as HTMLElement;
                    const bg = parse(getComputedStyle(bar).backgroundColor);
                    const body = parse(getComputedStyle(document.body).backgroundColor);
                    const flat = bg[3] < 1 ? bg.slice(0, 3).map((c, i) => c * bg[3] + body[i] * (1 - bg[3])) : bg.slice(0, 3);
                    const buttons = [...bar.querySelectorAll('[data-sarak-widget="user-theme"] button')].filter((node) => node.querySelector('svg'));
                    const icon = buttons[buttons.length - 1];
                    if (!icon) return null;
                    const [hi, lo] = [lum(parse(getComputedStyle(icon).color)), lum(flat)].sort((x, y) => y - x);
                    return (hi + 0.05) / (lo + 0.05);
                }, scene.bar);
                expect(logout, `botão de sair, ${scene.name} (${where})`).toBeGreaterThanOrEqual(ICON_CONTRAST);
            }
        }
    }
});

test('papel de cor: cada papel pinta um fundo diferente de lateral no mesmo modo', async ({ page }) => {
    const backgrounds = new Set<string>();
    for (const tone of TONES) {
        await open(page, { design: { colorPalette: 'oceano', mode: 'light', sidebarTone: tone } });
        backgrounds.add(await page.evaluate(() => getComputedStyle(document.querySelector('aside')!).backgroundColor));
    }
    expect(backgrounds.size).toBe(TONES.length);
});

test('busca: sem o texto do atalho; o atalho segue declarado e abre a busca; estreita, vira ícone', async ({ page }) => {
    await open(page);
    await expect(page.locator('aside kbd')).toHaveCount(0);
    const text = await page.locator('aside').innerText();
    expect(text).not.toMatch(/Ctrl|⌘/);
    await expect(page.locator('aside [role="combobox"]')).toHaveAttribute('aria-keyshortcuts', /Control\+K|Meta\+K/);
    await page.keyboard.press('Control+k');
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');

    const fits = await page.evaluate(() => {
        const aside = document.querySelector('aside')!.getBoundingClientRect();
        const input = document.querySelector<HTMLElement>('aside [role="combobox"]')!;
        const rect = input.getBoundingClientRect();
        return { inside: rect.left >= aside.left && rect.right <= aside.right + 1, clipped: input.scrollWidth > input.clientWidth + 1 };
    });
    expect(fits.inside).toBe(true);
    expect(fits.clipped).toBe(false);

    const icon = await page.evaluate(() => {
        const input = document.querySelector<HTMLElement>('aside [role="combobox"]')!.getBoundingClientRect();
        const svg = document.querySelector<SVGElement>('aside [role="combobox"]')!.parentElement!.querySelector('svg')!.getBoundingClientRect();
        return { insideBox: svg.left >= input.left && svg.right <= input.right && svg.top >= input.top && svg.bottom <= input.bottom, centered: Math.abs((svg.top + svg.bottom) / 2 - (input.top + input.bottom) / 2) <= 2 };
    });
    expect(icon.insideBox, 'o ícone da busca fica dentro da caixa').toBe(true);
    expect(icon.centered, 'e centrado na vertical').toBe(true);

    await open(page, { design: { sidebarResizable: true, sidebarMinWidth: 150 } });
    await page.locator('[role="separator"]').focus();
    await page.keyboard.press('Home');
    await expect.poll(() => page.evaluate(() => Math.round(document.querySelector('aside')!.getBoundingClientRect().width))).toBeLessThanOrEqual(152);
    const narrow = await page.evaluate(() => {
        const aside = document.querySelector('aside')!.getBoundingClientRect();
        const bar = document.querySelector<HTMLElement>('aside [role="combobox"]');
        const trigger = [...document.querySelectorAll<HTMLElement>('aside [data-sarak-slot="search"] button')].find((node) => node.getAttribute('aria-keyshortcuts'));
        const visible = (node: HTMLElement | null | undefined): boolean => Boolean(node) && node!.getBoundingClientRect().width > 0;
        const triggerRect = trigger?.getBoundingClientRect();
        return {
            barVisible: visible(bar),
            triggerVisible: visible(trigger),
            triggerInside: triggerRect ? triggerRect.left >= aside.left && triggerRect.right <= aside.right + 1 : false,
        };
    });
    expect(narrow.barVisible, 'sem espaço, a caixa some').toBe(false);
    expect(narrow.triggerVisible).toBe(true);
    expect(narrow.triggerInside).toBe(true);
});

test('largura: a alça ajusta por teclado e por arrasto, dentro da faixa, e o valor sobrevive ao recarregar sem entrar no tema', async ({ page }) => {
    await open(page, { design: { sidebarResizable: true } });
    const width = () => page.evaluate(() => Math.round(document.querySelector('aside')!.getBoundingClientRect().width));
    const handle = page.getByRole('separator');
    await expect(handle).toHaveAttribute('aria-orientation', 'vertical');
    const [min, max] = [Number(await handle.getAttribute('aria-valuemin')), Number(await handle.getAttribute('aria-valuemax'))];
    const initial = await width();

    await handle.focus();
    await page.keyboard.press('ArrowRight');
    await expect.poll(width).toBe(initial + 16);
    await page.keyboard.press('End');
    await expect.poll(width).toBe(max);
    await page.keyboard.press('Home');
    await expect.poll(width).toBe(min);

    const box = (await handle.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 + 60, box.y + box.height / 2, { steps: 6 });
    await page.mouse.up();
    const dragged = await width();
    expect(dragged).toBeGreaterThan(min + 40);
    expect(dragged).toBeLessThanOrEqual(max);

    const stored = await page.evaluate(() => Object.fromEntries(Object.keys(localStorage).map((key) => [key, localStorage.getItem(key)])));
    const holders = Object.entries(stored).filter(([, value]) => value?.includes('"sidebarWidth"'));
    expect(holders, 'a largura é guardada em um lugar só: a preferência do usuário').toHaveLength(1);
    expect(holders[0][0].toLowerCase()).toContain('pref');

    await page.reload();
    await expect(page.getByTestId('content')).toBeVisible();
    await expect.poll(width).toBe(dragged);

    await page.getByRole('separator').dblclick();
    await expect.poll(width).toBe(initial);
});

test('largura: sem sidebarResizable não há alça, e recolhida ela some', async ({ page }) => {
    await open(page);
    await expect(page.getByRole('separator')).toHaveCount(0);
    await open(page, { design: { sidebarResizable: true, isNavHidden: true } });
    await expect(page.getByRole('separator')).toHaveCount(0);
});

test('topbar: o grupo abre um menu suspenso abaixo do item, com teclado e Esc', async ({ page }) => {
    await open(page, { design: { navigationStyle: 'topbar' } });
    const vendas = page.getByRole('button', { name: /^Vendas/ });
    await expect(vendas).toHaveAttribute('aria-expanded', 'false');
    await vendas.click();
    await expect(vendas).toHaveAttribute('aria-expanded', 'true');
    const flyout = page.getByRole('group', { name: 'Vendas' });
    await expect(flyout).toBeVisible();
    const placement = await page.evaluate(() => {
        const trigger = document.querySelector('header [data-sarak-nav-group] button')!.getBoundingClientRect();
        const fly = document.querySelector('[data-sarak-nav-flyout]')!.getBoundingClientRect();
        return { below: fly.top >= trigger.bottom - 1, inside: fly.right <= window.innerWidth && fly.bottom <= window.innerHeight };
    });
    expect(placement).toEqual({ below: true, inside: true });
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Escape');
    await expect(flyout).toBeHidden();
    await expect(vendas).toBeFocused();
});

test('topbar: o papel de cor pinta a barra e mantém o texto legível', async ({ page }) => {
    await open(page, { design: { colorPalette: 'oceano', mode: 'light', navigationStyle: 'topbar', topbarTone: 'primary' } });
    const ratio = await page.evaluate(() => {
        const parse = (value: string): number[] => value.match(/rgba?\(([^)]+)\)/)![1].split(/[ ,/]+/).filter(Boolean).map(Number);
        const lin = (v: number): number => { const c = v / 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
        const lum = ([r, g, b]: number[]): number => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
        const header = document.querySelector('header') as HTMLElement;
        const bg = parse(getComputedStyle(header).backgroundColor);
        const fg = parse(getComputedStyle(header.querySelector('a[href="#home"]') as HTMLElement).color);
        const [hi, lo] = [lum(fg), lum(bg)].sort((x, y) => y - x);
        return (hi + 0.05) / (lo + 0.05);
    });
    expect(ratio).toBeGreaterThanOrEqual(MIN_CONTRAST);
});

test('celular: a gaveta abre o grupo como a lateral, com alvo de 44 px e sem rolagem horizontal', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 390, height: 800 }, hasTouch: true, isMobile: true });
    const page = await context.newPage();
    try {
        await page.goto(`${harnessUrl}?design=${encodeURIComponent('{}')}`);
        await page.getByRole('button', { name: 'Abrir menu de navegação' }).click();
        const vendas = page.getByRole('button', { name: /^Vendas/ });
        await vendas.click();
        await expect(vendas).toHaveAttribute('aria-expanded', 'true');
        const child = page.getByRole('link', { name: /^Clientes$/ });
        await expect(child).toBeVisible();
        const measure = await page.evaluate(() => {
            const drawer = document.querySelector('aside')!;
            const heights = ['[data-sarak-nav-group] button', '[data-sarak-nav-group] a'].map((selector) => document.querySelector<HTMLElement>(selector)!.getBoundingClientRect().height);
            return { heights, overflow: drawer.scrollWidth - drawer.clientWidth };
        });
        measure.heights.forEach((height) => expect(height).toBeGreaterThanOrEqual(TOUCH_TARGET_MIN - SUBPIXEL));
        expect(measure.overflow).toBeLessThanOrEqual(SUBPIXEL);
    } finally {
        await context.close();
    }
});

test('item sem filhos: continua um link direto, sem botão nem painel (itens planos)', async ({ page }) => {
    await open(page, { query: { items: 'flat' } });
    await expect(page.locator('aside [data-sarak-nav-group]')).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'Pedidos' })).toBeVisible();
});

