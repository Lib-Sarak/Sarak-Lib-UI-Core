/**
 * O painel de customização segue o MODO do tema que mostra: sob um tema claro ele não desenha branco
 * translúcido (que some no claro), e sob um tema escuro desenha — a contraprova de que a medição enxerga o
 * efeito. O `jsdom` não resolve `color-mix` nem a cascata (specs/specs/11-testes-e-cobertura.md §7).
 *
 * Mesmo harness e mesmo artefato do `cromo-css-real.spec.ts` (`dist/index.js` + `dist/sarak.css`), cena
 * `?cena=painel` (abre o `SarakCustomizationPanel`) sob um tema de referência INTEIRO — `?tema-ativo=minimalist-airy`
 * (claro) e o tema padrão (escuro). Um recorte parcial (`?tema=legivel-*`) não serve: ele não redefine borda e texto
 * suave, que ficariam no padrão escuro e seriam medidos como se fossem do painel.
 *
 * -------------------------------------------------------------------------
 * LIMITES DECLARADOS (R18) — o que esta medição NÃO vê
 * -------------------------------------------------------------------------
 * 1. Só valores COMPUTADOS de `background-color`, `color` e cor de borda dos elementos do painel na aba
 *    aberta por padrão, e só "branco translúcido" (alfa entre 0 e 1), reconhecido de forma diferente em cada caso:
 *    - tema CLARO: só o 255 puro (`255, 255, 255`, com tolerância de 1 por canal);
 *    - tema ESCURO: o 255 puro e a tinta clara do tema escuro (a `textColorMaster` dele, calculada pela paleta e lida
 *      da sonda da página) — é por essa cor que o CSS da lib remapeia `bg-white/10` e afins.
 *    Preto translúcido fixo, cinza e azul fixos não entram; as abas que não abrem sozinhas e a pré-visualização (mocks)
 *    são lidas pelo `fixed-translucent:check` (texto), não aqui.
 *    CONSEQUÊNCIA: a contraprova escura passa pela tinta, não pelo 255, então ela deixou de exercitar o detector só-255
 *    do caso claro. A guarda do 255 no claro não tem controle positivo dentro deste spec; quem cobre o 255 fixo é o
 *    `fixed-translucent:check`.
 * 2. Só Chromium headless, o tema `minimalist-airy` (claro) e o padrão (escuro).
 * 3. Lê o `dist/` — sem `npm run build` recente, mede o build anterior.
 * 4. NÃO falha no `HEAD` anterior: medido, `bg-white/10` já computava branco opaco e `text-white` o texto escuro sob
 *    tema claro, porque o CSS da lib remapeia essas utilitárias por modo. É guarda de regressão do computado, não
 *    prova do conserto — o conserto (a classe deixar de ser fixa) é do `fixed-translucent:check`, que falha no `HEAD`.
 * -------------------------------------------------------------------------
 */
import { test, expect, chromium, type Browser, type Page } from '@playwright/test';

const DESKTOP = { width: 1440, height: 900 } as const;

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

async function withOpenPanel<T>(activeTheme: string | undefined, measure: (page: Page) => Promise<T>): Promise<T> {
    const page = await browser.newPage({ viewport: DESKTOP });
    try {
        const params = new URLSearchParams({ cena: 'painel' });
        if (activeTheme) params.set('tema-ativo', activeTheme);
        await page.goto(`${harnessUrl}?${params.toString()}`);
        await page.getByRole('button', { name: 'Abrir painel' }).click();
        await page.getByPlaceholder('Buscar token...').waitFor();
        return await measure(page);
    } finally {
        await page.close();
    }
}

/**
 * Quantos elementos do painel têm fundo, texto ou borda em BRANCO translúcido (alfa entre 0 e 1). O "branco" é o 255 puro
 * e, sob o tema escuro, a tinta clara dele (a do texto, calculada pela paleta e lida da página): é por essa cor que o CSS
 * da lib remapeia `bg-white/10` e afins. Sob o tema claro só vale o 255 puro: a tinta clara da paleta é a superfície do
 * próprio tema claro, que ele pode pintar translúcida sem ser um branco fixo.
 */
async function countTranslucentWhite(page: Page, includeThemeInk = true): Promise<number> {
    return page.evaluate((withThemeInk) => {
        const probe = (window as unknown as { __sarakThemeProbe: { colorOf: (id: string, token: string, mode: 'light' | 'dark') => string } }).__sarakThemeProbe;
        const canvas = document.createElement('canvas').getContext('2d', { willReadFrequently: true })!;
        const opaqueChannels = (value: string): number[] => {
            canvas.clearRect(0, 0, 1, 1);
            canvas.fillStyle = '#000';
            canvas.fillStyle = value;
            canvas.fillRect(0, 0, 1, 1);
            return Array.from(canvas.getImageData(0, 0, 1, 1).data).slice(0, 3);
        };
        const whites = withThemeInk ? [[255, 255, 255], opaqueChannels(probe.colorOf('sarak-sovereign', 'textColorMaster', 'dark'))] : [[255, 255, 255]];
        // `color-mix` do Tailwind (`bg-white/5`) computa em `oklab(L a b / a)`; rgba() e color(srgb …) cobrem os demais.
        const SPLIT = /^(?:rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)|(.+?)\s*\/\s*([\d.]+)\))$/;
        const isTranslucentWhite = (value: string): boolean => {
            const match = value.trim().match(SPLIT);
            if (!match) return false;
            const alpha = Number(match[4] ?? match[6]);
            if (!(alpha > 0 && alpha < 1)) return false;
            const channels = match[1] !== undefined ? [Number(match[1]), Number(match[2]), Number(match[3])] : opaqueChannels(`${match[5]})`);
            return whites.some((white) => white.every((channel, index) => Math.abs(channel - channels[index]) <= 1));
        };
        const root = document.querySelector('button + div');
        if (!root) throw new Error('o painel não abriu');
        let count = 0;
        root.querySelectorAll('*').forEach((el) => {
            const style = getComputedStyle(el);
            const painted = [style.backgroundColor, style.color, style.borderTopColor, style.borderBottomColor];
            if (painted.some(isTranslucentWhite)) count += 1;
        });
        return count;
    }, includeThemeInk);
}

test('painel sob tema CLARO: nenhum branco translúcido (ele some no claro)', async () => {
    expect(await withOpenPanel('minimalist-airy', (page) => countTranslucentWhite(page, false))).toBe(0);
});

test('contraprova — painel sob tema ESCURO: o mesmo painel desenha branco translúcido', async () => {
    expect(await withOpenPanel(undefined, countTranslucentWhite)).toBeGreaterThan(0);
});
