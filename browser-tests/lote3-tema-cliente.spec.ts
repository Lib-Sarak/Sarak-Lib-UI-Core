import { test, expect, chromium, type Browser, type Page } from '@playwright/test';

const harnessUrl = process.env.SARAK_CROMO_HARNESS_URL;
if (!harnessUrl) {
    throw new Error('O globalSetup não preparou o harness de CSS para esta execução do Playwright.');
}

let browser: Browser;

test.beforeAll(async () => {
    browser = await chromium.launch({ executablePath: process.env.SARAK_PLAYWRIGHT_CHROMIUM_PATH || undefined });
});

test.afterAll(async () => {
    if (browser) await browser.close();
});

const openPage = async (query: string): Promise<Page> => {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await page.goto(`${harnessUrl}?${query}`, { waitUntil: 'domcontentloaded' });
    return page;
};

test('as faixas novas mantêm o anel de foco visível e permitem aumentá-lo', async () => {
    for (const [query, expectedWidth] of [
        ['cena=focus-ring', '2px'],
        ['cena=focus-ring&tema=focus-ring-largo', '4px'],
    ]) {
        const page = await openPage(query);
        try {
            await page.keyboard.press('Tab');
            const button = page.locator('[data-probe="focus-ring"]');
            await expect(button).toBeFocused();
            await expect.poll(() => button.evaluate((element) => getComputedStyle(element).outlineWidth)).toBe(expectedWidth);
        } finally {
            await page.close();
        }
    }
});

test('o modal acompanha a largura, o traço, a cor e a sombra do cartão em dois temas', async () => {
    const readSurface = async (theme: string) => {
        const page = await openPage(`cena=schema-modal&tema=${theme}`);
        try {
            const panel = page.getByRole('dialog', { name: 'Diálogo' });
            await expect(panel).toBeVisible();
            return await panel.evaluate((element) => {
                const style = getComputedStyle(element);
                return {
                    borderWidth: style.borderTopWidth,
                    borderStyle: style.borderTopStyle,
                    borderColor: style.borderTopColor,
                    boxShadow: style.boxShadow,
                };
            });
        } finally {
            await page.close();
        }
    };

    const red = await readSurface('modal-cartao-vermelho');
    const blue = await readSurface('modal-cartao-azul');

    expect(red.borderWidth).toBe('3px');
    expect(red.borderStyle).toBe('dashed');
    expect(blue.borderWidth).toBe('6px');
    expect(blue.borderStyle).toBe('dotted');
    expect(red.borderColor).not.toBe(blue.borderColor);
    expect(red.boxShadow).not.toBe(blue.boxShadow);
});

test('o body pinta direto no primeiro quadro e só depois anima a troca de tema', async () => {
    const page = await openPage('cena=body-theme-transition');
    try {
        await page.locator('[data-probe="body-theme-app"]').waitFor();
        const frames = () => page.evaluate(() => (window as unknown as { __bodyFrames: Array<{
            appPresent: boolean;
            backgroundColor: string;
            transitionProperty: string;
            ready: boolean;
        }> }).__bodyFrames);
        await expect.poll(async () => (await frames()).some((frame) => frame.ready)).toBe(true);

        const firstPaintedAppFrame = (await frames()).find((frame) => frame.appPresent);
        expect(firstPaintedAppFrame?.backgroundColor).toBe('rgb(18, 52, 86)');
        expect(firstPaintedAppFrame?.transitionProperty).not.toContain('background-color');

        const readyFrame = (await frames()).find((frame) => frame.ready);
        expect(readyFrame?.transitionProperty).toContain('background-color');

        await page.locator('[data-probe="trocar-fundo"]').click();
        await expect.poll(() => page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe('rgb(254, 220, 186)');
    } finally {
        await page.close();
    }
});

test('a arte global rola por padrão e pode ficar fixa pelo token do tema', async () => {
    for (const [theme, expectedPosition] of [
        ['fundo-rola', 'absolute'],
        ['fundo-fixo', 'fixed'],
    ]) {
        const page = await openPage(`bg=1&tema=${theme}`);
        try {
            const renderer = page.locator('.sarak-global-background-renderer');
            await renderer.waitFor();
            expect(await renderer.evaluate((element) => getComputedStyle(element).position)).toBe(expectedPosition);
        } finally {
            await page.close();
        }
    }
});
