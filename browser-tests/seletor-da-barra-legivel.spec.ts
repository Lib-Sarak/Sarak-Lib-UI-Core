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
 * 1. Só os botões selecionados dos dois seletores dentro do menu de preferências do harness, no modo nativo do tema.
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
const CHROMIUM_EXECUTABLE_PATH = process.env.SARAK_PLAN124_CHROMIUM_PATH;

/** A query do harness que monta o caso: um tema embarcado inteiro ou uma cor sintética do item ativo. */
const CASES: Array<{ name: string; query: string }> = [
    { name: 'item ativo escuro com primária clara', query: 'tema=nav-ativo-escuro' },
    { name: 'item ativo claro com primária escura', query: 'tema=nav-ativo-claro' },
    { name: 'neo-brutalism', query: 'tema-ativo=neo-brutalism' },
    { name: 'industrial-terminal', query: 'tema-ativo=industrial-terminal' },
    { name: 'synthwave-retro', query: 'tema-ativo=synthwave-retro' },
    { name: 'nebula-space', query: 'tema-ativo=nebula-space' },
];

let browser: Browser;

test.beforeAll(async () => {
    browser = await chromium.launch(CHROMIUM_EXECUTABLE_PATH ? { executablePath: CHROMIUM_EXECUTABLE_PATH } : undefined);
});

test.afterAll(async () => {
    await browser.close();
});

interface PressedMeasure {
    group: string;
    label: string;
    color: string;
    background: string;
    ratio: number;
}

/** Os botões selecionados dos grupos de preferência: cor do texto, fundo e a razão de contraste computada no menu. */
const measurePressed = (menu: Locator): Promise<PressedMeasure[]> => menu.evaluate((menuElement) => {
    const channels = (value: string): number[] => (value.match(/[\d.]+/g) ?? []).map(Number);
    const luminance = ([r, g, b]: number[]): number => {
        const linear = (channel: number): number => {
            const unit = channel / 255;
            return unit <= 0.03928 ? unit / 12.92 : ((unit + 0.055) / 1.055) ** 2.4;
        };
        return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
    };
    return [...menuElement.querySelectorAll('[role="group"] button[aria-pressed="true"]')].map((button) => {
        const style = getComputedStyle(button);
        const [light, dark] = [luminance(channels(style.color)), luminance(channels(style.backgroundColor))].sort((a, b) => b - a);
        return {
            group: button.closest('[role="group"]')?.getAttribute('aria-label') ?? '',
            label: button.textContent ?? '',
            color: style.color,
            background: style.backgroundColor,
            ratio: (light + 0.05) / (dark + 0.05),
        };
    });
});

for (const { name, query } of CASES) {
    test(`o botão selecionado dos seletores da barra tem ${MIN_CONTRAST}:1 contra o próprio fundo: ${name}`, async () => {
        const page = await browser.newPage({ viewport: { width: 1440, height: 800 } });
        try {
            await page.goto(`${harnessUrl}?chrome=topbar&${query}`);
            await page.getByRole('link', { name: 'Início' }).waitFor({ state: 'visible' });
            await page.getByRole('button', { name: 'Preferências', exact: true }).click();
            const preferencesMenu = page.getByRole('menu', { name: 'Preferências', exact: true });
            await expect(preferencesMenu).toBeVisible();
            // As transições de hidratação do tema terminam antes de a cor computada valer.
            await page.waitForTimeout(1500);
            const pressed = await measurePressed(preferencesMenu);
            expect(pressed.length, 'os dois seletores têm um botão selecionado').toBe(2);
            for (const item of pressed) {
                expect(item.ratio, `${item.group} "${item.label}": texto ${item.color} sobre ${item.background}`).toBeGreaterThanOrEqual(MIN_CONTRAST);
            }
        } finally {
            await page.close();
        }
    });
}
