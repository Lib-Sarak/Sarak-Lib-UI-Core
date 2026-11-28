/**
 * Medição, em navegador real, de que a barra de topo não esmaga a navegação: com a busca e os seletores na barra, o item de
 * navegação nunca fica menor que o texto, a partir de 1280 px a lista inteira aparece e, abaixo disso, o que não cabe vai para o botão
 * "Mais", no fim da lista. Medido ANTES da correção, nos quatro
 * temas com cromo de topo, a 1440 px: a lista ficava com 246 de 341 px (`industrial-terminal`: "Configurações" cortada), a
 * 1280 px com 86 px e a 1024 px com 32 px, enquanto a busca (256 px) e o grupo final (740 a 820 px) ficavam inteiros.
 *
 * O que cede, nesta ordem, quando a barra aperta: (1) a busca em barra encolhe e, abaixo de 10rem, vira o ícone que abre a paleta (o slot passa a ter a largura do ícone e devolve o resto à lista); (2) os rótulos dos
 * widgets indisponíveis (usuário, notificações) somem abaixo do breakpoint `2xl` (1536 px) e ficam só os ícones; (3) o item que não cabe
 * sai da lista e vai para o "Mais" (cada item continua inteiro; a lista não rola mais). O grupo final (seletores, idioma, tema, usuário, notificações) é rígido: nunca passa da borda
 * da barra, e a página não ganha largura. O `jsdom` não calcula largura de flex nem o encolhimento da barra.
 *
 * -------------------------------------------------------------------------
 * LIMITES DECLARADOS (R18) — o que esta medição NÃO vê
 * -------------------------------------------------------------------------
 * 1. Só o cromo de fábrica do harness (busca, seletores de fonte e de navegação, idioma, tema, usuário e notificações
 *    indisponíveis), três itens com rótulos longos e o tema embarcado de cada caso; não mede widgets que o consumidor passa
 *    (`user`, `notifications`, `topbarEnd`) nem `searchPositionTopbar` `center`/`right`.
 * 2. Os primeiros casos medem só 1440, 1280 e 1024 px; os de 820 px (os 25 temas) medem o "Mais", o vão da barra e a busca recolhida em ícone, e a
 *    troca de tema em tempo de execução a 820 px. Todos no modo nativo do tema. Abaixo de 820 px o gate do celular é outro.
 * 3. A 1024 px pode haver item no "Mais": a medição prova que o item não encolhe, que nada sai da barra e que o que não coube está no
 *    "Mais"; o desenho do botão e o teclado dele são medidos por `topbar-mais.spec.ts`.
 * 4. Só Chromium headless, contra o artefato que o `globalSetup` montou.
 * -------------------------------------------------------------------------
 */
import { test, expect, chromium, type Browser, type Page } from '@playwright/test';
import { SARAK_ALL_THEMES } from '../src/core/Design/presets/themes/all';

const harnessUrl = process.env.SARAK_CROMO_HARNESS_URL;
if (!harnessUrl) {
    throw new Error('O globalSetup não preparou o harness de CSS para esta execução do Playwright.');
}

const THEMES = ['industrial-terminal', 'neo-brutalism', 'cyber-retro-wave-classic', 'cyberpunk-neon'] as const;
/** A partir daqui a lista de navegação inteira cabe na barra com o cromo de fábrica. */
const FULL_LIST_FROM = 1280;
const WIDTHS = [1440, 1280, 1024] as const;
const TOLERANCE_PX = 1;

let browser: Browser;

test.beforeAll(async () => {
    browser = await chromium.launch();
});

test.afterAll(async () => {
    await browser.close();
});

interface TopbarMeasure {
    labels: Array<{ text: string; truncated: boolean; right: number; hidden: boolean }>;
    navRight: number;
    headerRight: number;
    endGroupRight: number;
    documentOverflow: number;
}

async function openTopbar(theme: string, width: number): Promise<Page> {
    const page = await browser.newPage({ viewport: { width, height: 800 } });
    await page.goto(`${harnessUrl}?chrome=topbar&rotulos=longos&tema-ativo=${theme}`);
    // 'attached', e não 'visible': a 820 px um tema pode mandar todos os itens ao "Mais", e o link de dentro da lista fica invisível.
    await page.locator('header nav a').first().waitFor({ state: 'attached' });
    // O tema embarcado chega sob demanda e a barra se recompõe; mede só depois de assentar.
    await page.waitForTimeout(1500);
    return page;
}

const measureTopbar = (page: Page): Promise<TopbarMeasure> => page.evaluate(() => {
    const header = document.querySelector('header') as HTMLElement;
    const nav = header.querySelector('nav') as HTMLElement;
    const endGroup = header.querySelector('.ml-auto') as HTMLElement;
    const labels = [...nav.querySelectorAll('a')].map((link) => {
        const label = link.querySelector('span:not([aria-hidden])') as HTMLElement;
        const hidden = getComputedStyle(link.closest('[data-sarak-nav-cell]') as HTMLElement).visibility === 'hidden';
        return { text: label.textContent ?? '', truncated: label.scrollWidth > label.clientWidth, right: label.getBoundingClientRect().right, hidden };
    });
    const endRight = Math.max(...[...endGroup.children].map((child) => child.getBoundingClientRect().right));
    return {
        labels,
        navRight: nav.getBoundingClientRect().right,
        headerRight: header.getBoundingClientRect().right,
        endGroupRight: endRight,
        documentOverflow: document.documentElement.scrollWidth - window.innerWidth,
    };
});

for (const theme of THEMES) {
    for (const width of WIDTHS) {
        test(`${theme} a ${width}px: o item não encolhe, nada passa da barra${width >= FULL_LIST_FROM ? ' e a lista inteira aparece' : ''}`, async () => {
            const page = await openTopbar(theme, width);
            try {
                const measured = await measureTopbar(page);
                expect(measured.labels.map((label) => label.text), 'os três itens estão na lista').toEqual(['Início', 'Relatórios', 'Configurações']);
                for (const label of measured.labels) {
                    expect(label.truncated, `o rótulo "${label.text}" não é truncado dentro do item`).toBe(false);
                }
                expect(measured.endGroupRight, 'o grupo final não passa da borda da barra').toBeLessThanOrEqual(measured.headerRight + TOLERANCE_PX);
                expect(measured.documentOverflow, 'a página não ganha largura').toBeLessThanOrEqual(0);
                const hidden = measured.labels.filter((label) => label.hidden).map((label) => label.text);
                for (const label of measured.labels.filter((entry) => !entry.hidden)) {
                    expect(label.right, `o rótulo "${label.text}" está inteiro na área visível da lista`).toBeLessThanOrEqual(measured.navRight + TOLERANCE_PX);
                }
                if (width >= FULL_LIST_FROM) {
                    expect(hidden, 'a lista inteira aparece, sem "Mais"').toEqual([]);
                } else if (hidden.length > 0) {
                    await page.locator('header nav [data-sarak-nav-more] button').click();
                    const reachable = await page.locator('[data-sarak-nav-flyout]').getByRole('link').allTextContents();
                    expect(reachable.map((text) => text.trim()), 'o que não coube está no "Mais"').toEqual(hidden);
                }
            } finally {
                await page.close();
            }
        });
    }
}

/**
 * D14 e N11. A 820 px a barra mostra os itens que cabem antes de mandar o resto ao "Mais": o botão só aparece quando o próximo item
 * não cabe ao lado do que ficou. E a barra não ganha rolagem por causa do botão invisível: `scrollWidth` igual a `clientWidth`,
 * a 1440 e a 820 px. Os 25 temas, no modo nativo de cada um, com os três itens de rótulo longo.
 */
const ALL_THEME_IDS = SARAK_ALL_THEMES.map((theme) => theme.id);

interface FitMeasure {
    visible: number;
    hidden: number;
    moreVisible: boolean;
    spaceLeft: number;
    nextWidth: number;
    moreWidth: number;
    gap: number;
    scrollWidth: number;
    clientWidth: number;
    /** O que a barra declara e o descendente que passa mais da borda: ajuda a achar quem soma a rolagem. */
    overflowX: string;
    widest: string;
}

const measureFit = (page: Page): Promise<FitMeasure> => page.evaluate(() => {
    const nav = document.querySelector('header nav') as HTMLElement;
    const style = getComputedStyle(nav);
    const cells = [...nav.querySelectorAll<HTMLElement>('[data-sarak-nav-cell]')];
    const more = nav.querySelector<HTMLElement>('[data-sarak-nav-more]') as HTMLElement;
    const shown = cells.filter((cell) => getComputedStyle(cell).visibility !== 'hidden');
    const hiddenCells = cells.filter((cell) => getComputedStyle(cell).visibility === 'hidden');
    const navRect = nav.getBoundingClientRect();
    const usableRight = navRect.right - parseFloat(style.paddingRight);
    const lastRight = shown.length ? Math.max(...shown.map((cell) => cell.getBoundingClientRect().right)) : navRect.left + parseFloat(style.paddingLeft);
    return {
        visible: shown.length,
        hidden: hiddenCells.length,
        moreVisible: getComputedStyle(more).visibility !== 'hidden',
        spaceLeft: usableRight - lastRight,
        nextWidth: hiddenCells[0]?.getBoundingClientRect().width ?? 0,
        moreWidth: more.getBoundingClientRect().width,
        gap: parseFloat(style.columnGap) || 0,
        scrollWidth: nav.scrollWidth,
        clientWidth: nav.clientWidth,
        overflowX: style.overflowX,
        widest: (() => {
            const all = [...nav.querySelectorAll<HTMLElement>('*')];
            const top = all.sort((a, b) => b.getBoundingClientRect().right - a.getBoundingClientRect().right)[0];
            return top ? `${top.tagName}.${String(top.className).slice(0, 60)} right=${Math.round(top.getBoundingClientRect().right)} nav.right=${Math.round(navRect.right)}` : '';
        })(),
    };
});

for (const theme of ALL_THEME_IDS) {
    for (const width of [1440, 820] as const) {
        test(`${theme} a ${width}px: o "Mais" só aparece sem espaço para o próximo item e a barra não ganha rolagem`, async () => {
            const page = await openTopbar(theme, width);
            try {
                const fit = await measureFit(page);
                expect(fit.scrollWidth, `a barra não rola: o botão invisível do "Mais" não soma largura ${JSON.stringify(fit)}`).toBeLessThanOrEqual(fit.clientWidth);
                if (width === 820 && fit.hidden > 0) {
                    const needed = fit.gap + fit.nextWidth + (fit.hidden > 1 ? fit.gap + fit.moreWidth : 0);
                    expect(fit.moreVisible, 'o "Mais" aparece quando há item de fora').toBe(true);
                    expect(fit.spaceLeft, `o próximo item (${fit.nextWidth}px) não cabe ao lado do que ficou: ${JSON.stringify(fit)}`).toBeLessThan(needed);
                }
            } finally {
                await page.close();
            }
        });
    }
}

/**
 * B4. A 820 px a busca em barra recolhe a 0 px (o contêiner dela fica abaixo de 10rem), e ela não pode deixar vão próprio: entre o que
 * vem antes dela e a lista de navegação sobra um vão só, o da barra. Antes, a busca recolhida somava os dois vãos (24 px cada no
 * `dot-matrix-elegant`) e esse espaço faltava à lista.
 */
interface CollapsedSearchMeasure {
    searchWidth: number;
    /** Da borda direita do que vem antes da busca (recolhida) ou da caixa visível da busca até a lista. */
    spanBeforeNav: number;
    barGap: number;
    /** O contêiner da busca ficou abaixo do mínimo útil do campo e o conteúdo some (`display: none`). */
    contentHidden: boolean;
}

const measureCollapsedSearch = (page: Page): Promise<CollapsedSearchMeasure | null> => page.evaluate(() => {
    const header = document.querySelector('header') as HTMLElement;
    const slot = header.querySelector<HTMLElement>('[data-sarak-slot="search"]');
    const navSlot = header.querySelector<HTMLElement>('[data-sarak-slot="nav"]');
    const before = slot?.previousElementSibling as HTMLElement | null;
    if (!slot || !navSlot || !before) return null;
    const searchWidth = slot.getBoundingClientRect().width;
    const content = slot.firstElementChild as HTMLElement | null;
    // Visível: o que se vê é a caixa do campo, e o vão que importa é o dela até a lista (a margem do slot não aparece).
    const contentHidden = content ? getComputedStyle(content).display === 'none' : true;
    const edge = searchWidth >= 1 && content ? content.getBoundingClientRect().right : before.getBoundingClientRect().right;
    return {
        searchWidth,
        contentHidden,
        spanBeforeNav: navSlot.getBoundingClientRect().left - edge,
        barGap: parseFloat(getComputedStyle(header).columnGap) || 0,
    };
});

interface ListFitMeasure {
    firstItemVisible: boolean;
    /** Área útil da lista menos o que o primeiro item e o "Mais" pedem juntos: não negativo quer dizer que o primeiro item cabe. */
    roomForFirstItem: number;
    /** O respiro lateral da própria lista: a barra já dá o vão, e a lista não o repete. */
    navPaddingInline: number;
}

const measureListFit = (page: Page): Promise<ListFitMeasure | null> => page.evaluate(() => {
    const nav = document.querySelector<HTMLElement>('header [data-sarak-slot="nav"] nav');
    const more = nav?.querySelector<HTMLElement>('[data-sarak-nav-more]');
    const firstCell = nav?.querySelector<HTMLElement>('[data-sarak-nav-cell]');
    if (!nav || !more || !firstCell) return null;
    const navStyle = getComputedStyle(nav);
    const paddingInline = parseFloat(navStyle.paddingLeft) + parseFloat(navStyle.paddingRight);
    const usable = nav.getBoundingClientRect().width - paddingInline;
    const gap = parseFloat(navStyle.columnGap) || 0;
    return {
        firstItemVisible: getComputedStyle(firstCell).visibility !== 'hidden',
        navPaddingInline: paddingInline,
        roomForFirstItem: usable - (firstCell.getBoundingClientRect().width + gap + more.getBoundingClientRect().width),
    };
});

for (const theme of ALL_THEME_IDS) {
    test(`${theme} a 820px: entre a busca e a lista fica o vão da barra, visível ou recolhida`, async () => {
        const page = await openTopbar(theme, 820);
        try {
            const measured = await measureCollapsedSearch(page);
            expect(measured, 'a barra tem o slot da busca e o item anterior a ela').not.toBeNull();
            if (!measured) return;
            // Recolhida (0 px): só o vão da barra separa a lista do que vem antes. Visível: o vão da barra separa a caixa do campo da lista.
            expect(Math.abs(measured.spanBeforeNav - measured.barGap), `um vão da barra, nem mais nem menos: ${JSON.stringify(measured)}`).toBeLessThanOrEqual(TOLERANCE_PX);
        } finally {
            await page.close();
        }
    });

    test(`${theme} a 820px: a lista não repete o vão da barra e o primeiro item aparece quando ele e o "Mais" cabem`, async () => {
        const page = await openTopbar(theme, 820);
        try {
            const measured = await measureListFit(page);
            expect(measured, 'a barra tem a lista, o "Mais" e o primeiro item').not.toBeNull();
            if (!measured) return;
            expect(measured.navPaddingInline, `a lista horizontal não repete o vão que a barra já dá: ${JSON.stringify(measured)}`).toBe(0);
            if (measured.roomForFirstItem >= 0) {
                expect(measured.firstItemVisible, `o primeiro item cabe com o "Mais" e aparece: ${JSON.stringify(measured)}`).toBe(true);
            }
        } finally {
            await page.close();
        }
    });
}

/**
 * Plan 191. Sem espaço para o campo, a busca vira o ícone (Spec 05 §2.1.3) e o slot não guarda a largura do campo: a 820 px não sobra
 * slot de busca com largura e sem nada visível dentro, e a busca segue alcançável pelo ícone, com nome acessível.
 */
interface SearchSlotMeasure {
    slotWidth: number;
    fieldVisible: boolean;
    iconVisible: boolean;
    iconWidth: number;
    iconHeight: number;
    iconName: string;
}

const measureSearchSlot = (page: Page): Promise<SearchSlotMeasure | null> => page.evaluate(() => {
    const slot = document.querySelector<HTMLElement>('header [data-sarak-slot="search"]');
    if (!slot) return null;
    const shown = (el: Element | null): boolean => {
        if (!el) return false;
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && getComputedStyle(el).visibility !== 'hidden';
    };
    const icon = slot.querySelector<HTMLElement>('button');
    return {
        slotWidth: slot.getBoundingClientRect().width,
        fieldVisible: shown(slot.querySelector('input')),
        iconVisible: shown(icon),
        iconWidth: icon?.getBoundingClientRect().width ?? 0,
        iconHeight: icon?.getBoundingClientRect().height ?? 0,
        iconName: (icon?.getAttribute('aria-label') ?? icon?.getAttribute('title') ?? icon?.textContent ?? '').trim(),
    };
});

for (const theme of ALL_THEME_IDS) {
    test(`${theme} a 820px: a busca é o campo ou o ícone, nunca um slot vazio com largura`, async () => {
        const page = await openTopbar(theme, 820);
        try {
            const measured = await measureSearchSlot(page);
            expect(measured, 'a barra tem o slot da busca').not.toBeNull();
            if (!measured) return;
            const blank = measured.slotWidth >= 1 && !measured.fieldVisible && !measured.iconVisible;
            expect(blank, `slot de busca com largura e sem conteúdo visível: ${JSON.stringify(measured)}`).toBe(false);
            if (!measured.fieldVisible) {
                expect(measured.iconVisible, `sem o campo, o ícone de busca está visível: ${JSON.stringify(measured)}`).toBe(true);
                expect(measured.iconName, 'o ícone tem nome acessível').not.toBe('');
                // O ícone compacto é quase quadrado (48 x 41 px medidos): esticado pelo slot ele passa de 2 x (83 x 41 px).
                expect(measured.iconWidth, `o ícone não é esticado pelo slot: ${JSON.stringify(measured)}`).toBeLessThanOrEqual(measured.iconHeight * 1.5);
                // O slot é o ícone: não guarda a largura do campo.
                expect(measured.slotWidth, `o slot da busca tem a largura do ícone: ${JSON.stringify(measured)}`).toBeLessThanOrEqual(measured.iconWidth + TOLERANCE_PX);
            }
        } finally {
            await page.close();
        }
    });
}

for (const width of [1024, 1440] as const) {
    test(`a ${width}px: a busca não alterna entre campo e ícone`, async () => {
        const page = await openTopbar(ALL_THEME_IDS[0], width);
        try {
            const first = await measureSearchSlot(page);
            await page.waitForTimeout(600);
            const second = await measureSearchSlot(page);
            expect(second?.fieldVisible, 'o estado é o mesmo depois de assentar').toBe(first?.fieldVisible);
            expect(second?.slotWidth).toBe(first?.slotWidth);
        } finally {
            await page.close();
        }
    });
}

/**
 * Plan 191, achado 2. O campo volta quando cabe, qualquer que seja a causa: a 820 px, `aurora-veil` não comporta o campo e
 * `cyberpunk-neon` comporta. A troca de um pelo outro em tempo de execução leva o estado junto, nos dois sentidos.
 */
const switchThemeAt820 = async (from: string, to: string): Promise<{ before: SearchSlotMeasure | null; after: SearchSlotMeasure | null }> => {
    const page = await browser.newPage({ viewport: { width: 820, height: 800 } });
    try {
        await page.goto(`${harnessUrl}?chrome=topbar&rotulos=longos&tema-ativo=${from}&trocar-tema=${to}`);
        await page.locator('header nav a').first().waitFor({ state: 'attached' });
        await page.waitForTimeout(1500);
        const before = await measureSearchSlot(page);
        await page.locator('[data-probe="trocar-tema"]').click();
        await page.waitForTimeout(2000);
        return { before, after: await measureSearchSlot(page) };
    } finally {
        await page.close();
    }
};

test('a 820px: trocar de aurora-veil (ícone) para cyberpunk-neon (campo) devolve o campo', async () => {
    const { before, after } = await switchThemeAt820('aurora-veil', 'cyberpunk-neon');
    expect(before?.fieldVisible, `aurora-veil começa com o ícone: ${JSON.stringify(before)}`).toBe(false);
    expect(after?.fieldVisible, `cyberpunk-neon cabe o campo: ${JSON.stringify(after)}`).toBe(true);
});

test('a 820px: trocar de cyberpunk-neon (campo) para aurora-veil (ícone) recolhe em ícone', async () => {
    const { before, after } = await switchThemeAt820('cyberpunk-neon', 'aurora-veil');
    expect(before?.fieldVisible, `cyberpunk-neon começa com o campo: ${JSON.stringify(before)}`).toBe(true);
    expect(after?.fieldVisible, `aurora-veil recolhe: ${JSON.stringify(after)}`).toBe(false);
    expect(after?.iconVisible, 'o ícone aparece').toBe(true);
});
