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
 *    aberta por padrão, e só "branco translúcido" (canais 255 com alfa entre 0 e 1). Preto translúcido fixo,
 *    cinza e azul fixos não entram; as abas que não abrem sozinhas e a pré-visualização (mocks) são lidas
 *    pelo `fixed-translucent:check` (texto), não aqui.
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

/** Quantos elementos do painel têm fundo, texto ou borda em BRANCO translúcido (alfa entre 0 e 1). */
async function countTranslucentWhite(page: Page): Promise<number> {
    return page.evaluate(() => {
        // `color-mix` do Tailwind (`bg-white/5`) computa em `oklab(1 0 0 / a)`; rgba() e color(srgb) cobrem os demais.
        const WHITE = /^(?:rgba\(255,\s*255,\s*255,\s*([\d.]+)\)|color\(srgb 1 1 1 \/ ([\d.]+)\)|oklab\(1 0 0 \/ ([\d.]+)\))$/;
        const isTranslucentWhite = (value: string): boolean => {
            const match = value.trim().match(WHITE);
            if (!match) return false;
            const alpha = Number(match[1] ?? match[2] ?? match[3]);
            return alpha > 0 && alpha < 1;
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
    });
}

test('painel sob tema CLARO: nenhum branco translúcido (ele some no claro)', async () => {
    expect(await withOpenPanel('minimalist-airy', countTranslucentWhite)).toBe(0);
});

test('contraprova — painel sob tema ESCURO: o mesmo painel desenha branco translúcido', async () => {
    expect(await withOpenPanel(undefined, countTranslucentWhite)).toBeGreaterThan(0);
});
