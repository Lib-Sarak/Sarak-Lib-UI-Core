/**
 * Medição, em navegador real, de que a barra de topo não esmaga a navegação: com a busca e os seletores na barra, o item de
 * navegação nunca fica menor que o texto e, a partir de 1280 px, a lista inteira aparece. Medido ANTES da correção, nos quatro
 * temas com cromo de topo, a 1440 px: a lista ficava com 246 de 341 px (`industrial-terminal`: "Configurações" cortada), a
 * 1280 px com 86 px e a 1024 px com 32 px, enquanto a busca (256 px) e o grupo final (740 a 820 px) ficavam inteiros.
 *
 * O que cede, nesta ordem, quando a barra aperta: (1) a busca em barra encolhe e some abaixo de 10rem; (2) os rótulos dos
 * widgets indisponíveis (usuário, notificações) somem abaixo do breakpoint `2xl` (1536 px) e ficam só os ícones; (3) a lista de navegação rola
 * (cada item continua inteiro). O grupo final (seletores, idioma, tema, usuário, notificações) é rígido: nunca passa da borda
 * da barra, e a página não ganha largura. O `jsdom` não calcula largura de flex nem o encolhimento da barra.
 *
 * -------------------------------------------------------------------------
 * LIMITES DECLARADOS (R18) — o que esta medição NÃO vê
 * -------------------------------------------------------------------------
 * 1. Só o cromo de fábrica do harness (busca, seletores de fonte e de navegação, idioma, tema, usuário e notificações
 *    indisponíveis), três itens com rótulos longos e o tema embarcado de cada caso; não mede widgets que o consumidor passa
 *    (`user`, `notifications`, `topbarEnd`) nem `searchPositionTopbar` `center`/`right`.
 * 2. Só 1440, 1280 e 1024 px, no modo nativo do tema. Abaixo de 1024 px a lista rola mais e o gate do celular é outro.
 * 3. A 1024 px a lista rola: a medição prova que o item não encolhe e que nada sai da barra, não que os três cabem.
 * 4. Só Chromium headless, contra o artefato que o `globalSetup` montou.
 * -------------------------------------------------------------------------
 */
import { test, expect, chromium, type Browser, type Page } from '@playwright/test';

const harnessUrl = process.env.SARAK_CROMO_HARNESS_URL;
if (!harnessUrl) {
    throw new Error('O globalSetup não preparou o harness de CSS para esta execução do Playwright.');
}

const THEMES = ['industrial-terminal', 'neo-brutalism', 'synthwave-retro', 'cyberpunk-neon'] as const;
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
    labels: Array<{ text: string; truncated: boolean; right: number }>;
    navRight: number;
    headerRight: number;
    endGroupRight: number;
    documentOverflow: number;
}

async function openTopbar(theme: string, width: number): Promise<Page> {
    const page = await browser.newPage({ viewport: { width, height: 800 } });
    await page.goto(`${harnessUrl}?chrome=topbar&rotulos=longos&tema-ativo=${theme}`);
    await page.getByRole('link', { name: 'Início' }).waitFor({ state: 'visible' });
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
        return { text: label.textContent ?? '', truncated: label.scrollWidth > label.clientWidth, right: label.getBoundingClientRect().right };
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
                expect(measured.labels.map((label) => label.text), 'os três itens estão na barra').toEqual(['Início', 'Relatórios', 'Configurações']);
                for (const label of measured.labels) {
                    expect(label.truncated, `o rótulo "${label.text}" não é truncado dentro do item`).toBe(false);
                }
                expect(measured.endGroupRight, 'o grupo final não passa da borda da barra').toBeLessThanOrEqual(measured.headerRight + TOLERANCE_PX);
                expect(measured.documentOverflow, 'a página não ganha largura').toBeLessThanOrEqual(0);
                if (width >= FULL_LIST_FROM) {
                    for (const label of measured.labels) {
                        expect(label.right, `o rótulo "${label.text}" está inteiro na área visível da lista`).toBeLessThanOrEqual(measured.navRight + TOLERANCE_PX);
                    }
                }
            } finally {
                await page.close();
            }
        });
    }
}
