/**
 * Medição, em navegador real, de que a atmosfera da página (gradiente, tom e textura do `body`) aparece ATRÁS do
 * conteúdo do cromo em Modo App: a raiz do `SarakAppChrome` não pinta um fundo opaco por cima dela. O `jsdom` não
 * compõe camadas nem pinta, então a prova de que a textura chega à tela só se faz aqui.
 *
 * Mesmo harness e mesmo artefato do `token-que-desenha.spec.ts` (`dist/index.js` + `dist/sarak.css`). Duas provas por
 * caso: a CAMADA (nenhum elemento entre o conteúdo e o `body` pinta opaco) e o PIXEL (uma região vazia do conteúdo tem
 * mais de uma cor, e não só a cor lisa do corpo). O Modo Embarcado e a mídia de fundo global são as contraprovas: o
 * primeiro mantém a raiz opaca, o segundo a mantém transparente, como já eram.
 *
 * -------------------------------------------------------------------------
 * LIMITES DECLARADOS (R18) — o que esta medição NÃO vê
 * -------------------------------------------------------------------------
 * 1. Só o tema padrão do harness (gradiente radial e textura `constellation`) e a cena `navegacao-celular` (o cromo, em 1440 px); a vitrine de cada tema
 *    embarcado não é medida aqui — a captura do `cyberpunk-neon` antes/depois acompanha o resumo da execução.
 * 2. O pixel conta cores distintas numa região, não que a textura "fica bonita": prova que o fundo deixou de ser liso.
 * 3. A raiz é achada pela altura própria que o cromo lhe dá (`100dvh`); a topbar e o celular herdam a mesma raiz e não
 *    têm caso próprio.
 * 4. Só Chromium headless. Lê o `dist/` — sem `npm run build` recente, mede o build anterior.
 * -------------------------------------------------------------------------
 */
import { test, expect, chromium, type Browser, type Page } from '@playwright/test';

const harnessUrl = process.env.SARAK_CROMO_HARNESS_URL;
if (!harnessUrl) {
    throw new Error('O globalSetup não preparou o harness de CSS para esta execução do Playwright.');
}

/** A cena do cromo que passa pelo `renderScene` do harness (honra `?modo=embarcado` e `?bg=1`); a navegação não é o objeto da medição. */
const CENA = 'navegacao-celular';

let browser: Browser;

test.beforeAll(async () => {
    browser = await chromium.launch();
});

test.afterAll(async () => {
    await browser.close();
});

async function withScene(query: Record<string, string>, measure: (page: Page) => Promise<void>): Promise<void> {
    const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
    try {
        await page.goto(`${harnessUrl}?${new URLSearchParams(query).toString()}`);
        // Em Modo Embarcado os atributos de tema vão para a ilha, não para o `body`: espera a raiz do cromo.
        await page.waitForSelector('[style*="100dvh"]');
        await page.waitForTimeout(500);
        await measure(page);
    } finally {
        await page.close();
    }
}

/** Alfa do `background-color` computado da raiz do cromo (a que carrega `height: 100dvh`). */
const rootBackgroundAlpha = (page: Page): Promise<number> => page.evaluate(() => {
    const root = document.querySelector('[style*="100dvh"]') as HTMLElement;
    const channels = getComputedStyle(root).backgroundColor.match(/[\d.]+/g) ?? [];
    return channels.length === 4 ? Number(channels[3]) : 1;
});

/** Quantos elementos entre a área de conteúdo e o `body` pintam um `background-color` opaco. */
const opaqueLayersAboveBody = (page: Page): Promise<number> => page.evaluate(() => {
    const stack = document.elementsFromPoint(900, 700);
    return stack
        .filter((el) => el !== document.body && el !== document.documentElement)
        .filter((el) => {
            const channels = getComputedStyle(el).backgroundColor.match(/[\d.]+/g) ?? [];
            return channels.length === 3 || (channels.length === 4 && Number(channels[3]) >= 0.99);
        }).length;
});

/** Cores distintas (canais quantizados em 4) numa região vazia do conteúdo — a captura é decodificada na própria página. */
async function distinctColors(page: Page): Promise<number> {
    const shot = await page.screenshot({ clip: { x: 300, y: 350, width: 1100, height: 550 } });
    return page.evaluate(async (base64) => {
        const bitmap = await createImageBitmap(await (await fetch(`data:image/png;base64,${base64}`)).blob());
        const canvas = document.createElement('canvas');
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        const context = canvas.getContext('2d') as CanvasRenderingContext2D;
        context.drawImage(bitmap, 0, 0);
        const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
        const seen = new Set<number>();
        for (let i = 0; i < data.length; i += 4) seen.add(((data[i] >> 2) << 16) | ((data[i + 1] >> 2) << 8) | (data[i + 2] >> 2));
        return seen.size;
    }, shot.toString('base64'));
}

test('P24: em Modo App a raiz do cromo é transparente e a região vazia do conteúdo mostra gradiente e textura', async () => {
    await withScene({ cena: CENA }, async (page) => {
        expect(await rootBackgroundAlpha(page)).toBe(0);
        expect(await opaqueLayersAboveBody(page)).toBe(0);
        // Fundo liso = 1 cor; gradiente + constelação dão muito mais.
        expect(await distinctColors(page)).toBeGreaterThan(8);
    });
});

test('P24: no Modo Embarcado a raiz do cromo continua opaca (o `body` é do host)', async () => {
    await withScene({ cena: CENA, modo: 'embarcado' }, async (page) => {
        expect(await rootBackgroundAlpha(page)).toBe(1);
    });
});

test('P24: com mídia de fundo global a raiz continua transparente', async () => {
    await withScene({ cena: CENA, bg: '1' }, async (page) => {
        expect(await rootBackgroundAlpha(page)).toBe(0);
    });
});
