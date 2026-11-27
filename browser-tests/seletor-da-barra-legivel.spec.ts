/**
 * Medição, em navegador real, de que o botão selecionado dos seletores da barra (tamanho da fonte e navegação lateral/topo)
 * é legível qualquer que seja a cor do item ativo: o texto dele tem pelo menos 4,5:1 contra o fundo que o PRÓPRIO botão usa.
 * O fundo do botão é a cor do item ativo (`--sarak-nav-active-color`); o texto saía da cor sobre a PRIMÁRIA
 * (`--color-theme-on-primary`), então um tema com item ativo de cor diferente da primária deixava o seletor ilegível (medido
 * antes da correção, `neo-brutalism` escuro: fundo `rgb(17, 17, 17)` com texto `rgb(2, 6, 23)`, 1,1:1). O texto agora é o
 * `--sarak-on-nav-active`, escolhido pelo motor contra a cor do item ativo. O `jsdom` não calcula cor computada.
 *
 * -------------------------------------------------------------------------
 * LIMITES DECLARADOS (R18) — o que esta medição NÃO vê
 * -------------------------------------------------------------------------
 * 1. Só a opção selecionada de tamanho e navegação, no menu e no grupo compacto fixado à barra.
 * 2. Os temas embarcados (quatro com item ativo diferente da primária ou não) e duas cores sintéticas, uma escura e uma clara,
 *    que reproduzem o caso: item ativo escuro com primária clara, e o inverso.
 * 3. Cor do item ativo que não é literal (`var()`, `color-mix`) não recebe `--sarak-on-nav-active`: vale a reserva do
 *    componente (a cor sobre a primária) e esta medição não a cobre.
 * 4. Só Chromium headless, contra o artefato que o `globalSetup` montou.
 * -------------------------------------------------------------------------
 */
import { test, expect, chromium, type Browser, type Locator, type Page } from '@playwright/test';

const harnessUrl = process.env.SARAK_CROMO_HARNESS_URL;
if (!harnessUrl) {
    throw new Error('O globalSetup não preparou o harness de CSS para esta execução do Playwright.');
}

const MIN_CONTRAST = 4.5;
const CHROMIUM_EXECUTABLE_PATH = process.env.SARAK_CHROMIUM_EXECUTABLE_PATH;

/** A query do harness que monta o caso: um tema embarcado inteiro ou uma cor sintética do item ativo. */
const CASES: Array<{ name: string; query: string }> = [
    { name: 'item ativo escuro com primária clara', query: 'tema=nav-ativo-escuro' },
    { name: 'item ativo claro com primária escura', query: 'tema=nav-ativo-claro' },
    { name: 'neo-brutalism', query: 'tema-ativo=neo-brutalism' },
    { name: 'industrial-terminal', query: 'tema-ativo=industrial-terminal' },
    { name: 'cyber-retro-wave-classic', query: 'tema-ativo=cyber-retro-wave-classic' },
    { name: 'nebula-space', query: 'tema-ativo=nebula-space' },
];

let browser: Browser;

test.beforeAll(async () => {
    browser = await chromium.launch(CHROMIUM_EXECUTABLE_PATH ? { executablePath: CHROMIUM_EXECUTABLE_PATH } : undefined);
});

test.afterAll(async () => {
    await browser.close();
});

interface SelectedMeasure {
    group: string;
    label: string;
    color: string;
    background: string;
    ratio: number;
}

/** Mede o texto selecionado sobre o fundo; as linhas do menu usam a superfície quando não pintam fundo próprio. */
const measureSelected = (items: Locator): Promise<SelectedMeasure[]> => items.evaluateAll((elements) => {
    const channels = (value: string): number[] => (value.match(/[\d.]+/g) ?? []).map(Number);
    const luminance = ([r, g, b]: number[]): number => {
        const linear = (channel: number): number => {
            const unit = channel / 255;
            return unit <= 0.03928 ? unit / 12.92 : ((unit + 0.055) / 1.055) ** 2.4;
        };
        return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
    };
    return elements.map((element) => {
        const style = getComputedStyle(element);
        const parentMenu = element.closest('[role="menu"]');
        const itemBackground = style.backgroundColor === 'rgba(0, 0, 0, 0)' && parentMenu
            ? getComputedStyle(parentMenu).backgroundColor
            : style.backgroundColor;
        const [light, dark] = [luminance(channels(style.color)), luminance(channels(itemBackground))].sort((a, b) => b - a);
        return {
            group: element.closest('[role="group"]')?.getAttribute('aria-label') ?? '',
            label: element.textContent ?? '',
            color: style.color,
            background: itemBackground,
            ratio: (light + 0.05) / (dark + 0.05),
        };
    });
});

for (const { name, query } of CASES) {
    test(`a opção selecionada no menu tem ${MIN_CONTRAST}:1 contra a superfície: ${name}`, async () => {
        const page = await browser.newPage({ viewport: { width: 1440, height: 800 } });
        try {
            await page.goto(`${harnessUrl}?chrome=topbar&${query}`);
            await page.getByRole('link', { name: 'Início' }).waitFor({ state: 'visible' });
            await page.getByRole('button', { name: 'Preferências', exact: true }).click();
            const preferencesMenu = page.getByRole('menu', { name: 'Preferências', exact: true });
            await expect(preferencesMenu).toBeVisible();
            // As transições de hidratação do tema terminam antes de a cor computada valer.
            await page.waitForTimeout(1500);
            const selected = await measureSelected(preferencesMenu.locator('[role="group"] [role="menuitemradio"][aria-checked="true"]'));
            expect(selected.length, 'os dois seletores têm uma opção selecionada no menu').toBe(2);
            for (const item of selected) {
                expect(item.ratio, `${item.group} "${item.label}": texto ${item.color} sobre ${item.background}`).toBeGreaterThanOrEqual(MIN_CONTRAST);
            }
        } finally {
            await page.close();
        }
    });

    test(`a opção selecionada na barra tem ${MIN_CONTRAST}:1 contra o item ativo: ${name}`, async () => {
        const page = await browser.newPage({ viewport: { width: 1440, height: 800 } });
        try {
            await page.goto(`${harnessUrl}?chrome=topbar&seletores=barra&${query}`);
            await page.getByRole('link', { name: 'Início' }).waitFor({ state: 'visible' });
            const selectedButtons = page.locator('[role="group"] button[aria-pressed="true"]');
            await expect(selectedButtons).toHaveCount(2);
            await page.waitForTimeout(1500);
            const selected = await measureSelected(selectedButtons);
            for (const item of selected) {
                expect(item.ratio, `${item.group} "${item.label}": texto ${item.color} sobre ${item.background}`).toBeGreaterThanOrEqual(MIN_CONTRAST);
            }
        } finally {
            await page.close();
        }
    });
}
