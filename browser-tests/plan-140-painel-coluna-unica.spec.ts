/**
 * O painel de coluna única no navegador: seis decisões, a prévia SEMPRE visível ao escolher uma opção, o ajuste fino em
 * níveis, "Usar minha marca" sem gravar nada até o "Aplicar", e o painel estreito (empilhado), nos dois modos de cor e no
 * modo embarcado.
 *
 * Prévia para o dono: com `SARAK_PREVIA_140_DIR` definida, o mesmo caso grava as capturas PNG e um `index.html`
 * (imagens na mesma pasta, caminhos relativos, abre sem servidor). Regenera com:
 *   $env:SARAK_PREVIA_140_DIR='C:\tmp\sarak-previa-140'
 *   npx playwright test --config=browser-tests/playwright.config.ts browser-tests/plan-140-painel-coluna-unica.spec.ts
 *
 * LIMITES DECLARADOS (R18): Chromium headless; o tema `sarak-sovereign`; lê `src/` pelo esbuild do harness (não mede o
 * `dist/`); a cobertura de interseção é geométrica (a caixa da prévia contra a caixa de cada opção), não de pixel.
 */
import { test, expect, chromium, type Browser, type Page, type Locator } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { buildHarness } from './build-harness.mjs';
import { columnContrasts, type TextContrast } from './fixtures/column-contrast';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ENTRY = path.join(HERE, 'fixtures', 'plan-140-coluna-entry.tsx');
const PREVIEW_DIR = process.env.SARAK_PREVIA_140_DIR;
const DECISIONS = ['Tema', 'Cores', 'Fontes', 'Forma', 'Componentes', 'Layout'] as const;

interface Capture { file: string; caption: string }
const captures: Capture[] = [];
let browser: Browser;
let harnessDirectory: string;
let harnessUrl: string;

test.beforeAll(async () => {
    const executablePath = process.env.SARAK_CHROMIUM_EXECUTABLE_PATH;
    browser = await chromium.launch(executablePath ? { executablePath } : {});
    const harness = await buildHarness(ENTRY);
    harnessDirectory = harness.outDir;
    harnessUrl = pathToFileURL(harness.htmlPath).href;
});

test.afterAll(async () => {
    if (browser) await browser.close();
    if (harnessDirectory) fs.rmSync(harnessDirectory, { recursive: true, force: true });
    if (PREVIEW_DIR && captures.length > 0) writePreviewPage(PREVIEW_DIR, captures);
});

const writePreviewPage = (directory: string, items: Capture[]): void => {
    const figures = items
        .map((item, index) => `<figure><img src="${item.file}" alt="${item.caption}"><figcaption>${index + 1}. ${item.caption}</figcaption></figure>`)
        .join('\n');
    const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Plan 140 — painel de coluna única</title>
<style>body{font-family:system-ui,sans-serif;margin:24px;background:#10131a;color:#e8ecf4}figure{margin:0 0 32px}
img{max-width:100%;border:1px solid #2b3242;border-radius:8px}figcaption{margin-top:8px;font-size:14px}</style></head>
<body><h1>Plan 140 — painel de coluna única</h1>\n${figures}\n</body></html>`;
    fs.writeFileSync(path.join(directory, 'index.html'), html, 'utf8');
};

const capture = async (page: Page, file: string, caption: string): Promise<void> => {
    if (!PREVIEW_DIR) return;
    // As amostras só desenham ao entrar na área visível (a da coluna, não a da janela): espera as que estão à vista.
    await page.waitForFunction(() => Array.from(document.querySelectorAll('[data-sx-lazy="pending"]')).every((node) => {
        const rect = node.getBoundingClientRect();
        return rect.width === 0 || rect.bottom < 0 || rect.top > window.innerHeight;
    }));
    await page.waitForTimeout(250);
    fs.mkdirSync(PREVIEW_DIR, { recursive: true });
    await page.screenshot({ path: path.join(PREVIEW_DIR, file) });
    captures.push({ file, caption });
};

const open = async (query: string, viewport = { width: 1600, height: 900 }): Promise<{ page: Page; errors: string[] }> => {
    const page = await browser.newPage({ viewport });
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(`${harnessUrl}${query}`);
    await page.getByRole('button', { name: /Usar minha marca/ }).waitFor();
    return { page, errors };
};

const box = async (locator: Locator) => (await locator.boundingBox()) ?? { x: 0, y: 0, width: 0, height: 0 };
const overlaps = (a: { x: number; y: number; width: number; height: number }, b: typeof a): boolean =>
    a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;

for (const mode of [{ name: 'escuro', query: '' }, { name: 'claro', query: '?claro=1' }]) {
    test(`todo texto da coluna passa de 4,5:1 na lista e numa decisão (${mode.name})`, async () => {
        const { page } = await open(mode.query);
        const failures = (items: TextContrast[]): TextContrast[] => items.filter((item) => item.ratio < 4.5);

        // O tema anima a cor (`transition: all`): mede com as transições assentadas, não no meio delas.
        await page.waitForTimeout(1200);
        const home = await columnContrasts(page);
        expect(home.some((item) => item.text.startsWith('Design '))).toBe(true);
        expect(failures(home)).toEqual([]);

        for (const decisionName of ['Cores', 'Fontes', 'Forma', 'Componentes', 'Layout']) {
            await page.getByRole('button', { name: new RegExp(`^${decisionName}`) }).click();
            await page.getByRole('heading', { level: 2, name: decisionName }).waitFor();
            await page.waitForTimeout(1200);
            const decision = await columnContrasts(page);
            expect(decision.length, decisionName).toBeGreaterThan(3);
            expect(failures(decision), decisionName).toEqual([]);
            await page.keyboard.press('Escape');
        }
        await page.close();
    });
}

for (const mode of [{ name: 'escuro', query: '' }, { name: 'claro', query: '?claro=1' }]) {
    test(`cada decisão abre na própria coluna e a prévia nunca fica coberta (${mode.name})`, async () => {
        const { page, errors } = await open(mode.query);
        await capture(page, `${mode.name}-0-lista.png`, `A lista de decisões (${mode.name}): o atalho de marca primeiro e as seis decisões, cada uma com o valor que vale agora.`);
        const preview = page.getByTestId('live-preview-frame');

        for (const [index, decision] of DECISIONS.entries()) {
            await page.getByRole('button', { name: new RegExp(`^${decision}`) }).click();
            await expect(page.getByRole('heading', { level: 2, name: decision })).toBeFocused();
            const previewBox = await box(preview);
            expect(previewBox.width).toBeGreaterThan(400);
            const option = page.locator('[data-option-group] button, [data-option-group] [role="radio"]').first();
            if (await option.count()) {
                await option.hover();
                const hovered = await box(option);
                expect(overlaps(previewBox, hovered), `a opção de ${decision} não pode estar sobre a prévia`).toBe(false);
                expect(await preview.isVisible()).toBe(true);
            }
            await capture(page, `${mode.name}-${index + 1}-${decision.toLowerCase()}.png`, `Decisão ${decision} (${mode.name}): opções na coluna e a prévia ao lado, sempre visível.`);
            await page.keyboard.press('Escape');
            await expect(page.getByRole('button', { name: new RegExp(`^${decision}`) })).toBeFocused();
        }
        expect(errors).toEqual([]);
        await page.close();
    });
}

test('ajuste fino recolhido, com a contagem, e a barra da prévia troca modo, tela e dispositivo', async () => {
    const { page, errors } = await open('');
    await page.getByRole('button', { name: /^Forma/ }).click();
    const toggle = page.getByRole('button', { name: /Ajuste fino/ });
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await toggle.click();
    await capture(page, 'ajuste-fino.png', 'O ajuste fino aberto: primeiro os principais, com "Mostrar todos" com a contagem real.');

    await page.getByRole('group', { name: 'Modo de cor da prévia' }).getByRole('button', { name: 'Claro' }).click();
    await page.getByRole('combobox', { name: 'Tela de amostra' }).selectOption('tabela');
    await page.getByRole('button', { name: 'Tablet' }).click();
    await capture(page, 'barra-da-previa.png', 'A barra da prévia: modo claro/escuro, tela de amostra e dispositivo.');
    expect(errors).toEqual([]);
    await page.close();
});

test('Usar minha marca: nome, cor e fonte reagem na prévia e nada é gravado até o "Aplicar"', async () => {
    const { page, errors } = await open('');
    await page.getByRole('button', { name: /Usar minha marca/ }).click();
    await capture(page, 'marca-0-vazio.png', 'Usar minha marca: o formulário vazio.');
    await page.getByLabel('Nome da empresa').fill('Acme Ltda');
    await page.getByLabel('Estilo das fontes').selectOption({ index: 3 });
    await expect(page.getByText('Prévia: nada foi gravado')).toBeVisible();
    await capture(page, 'marca-1-reagindo.png', 'A prévia reage ao nome, à cor e à fonte, sem gravar nada.');

    await page.getByRole('button', { name: 'Gerar meu tema' }).click();
    await page.getByRole('button', { name: /Usar minha marca/ }).waitFor();
    await expect(page.getByTestId('branding-payload')).toHaveText('');
    await expect(page.getByTestId('saved-payload')).toHaveText('');
    await capture(page, 'marca-2-gerado.png', 'Tema gerado no rascunho: o "Aplicar" está habilitado e nada foi gravado.');

    await page.getByRole('button', { name: 'Aplicar' }).click();
    await expect(page.getByTestId('branding-payload')).toContainText('Acme Ltda');
    await expect(page.getByTestId('saved-payload')).toContainText('colorPalette');
    expect(errors).toEqual([]);
    await page.close();
});

for (const scene of [{ name: 'estreito', query: '?largura=520px' }, { name: 'estreito-embarcado', query: '?largura=520px&modo=embarcado' }]) {
    test(`painel estreito (${scene.name}): coluna e prévia empilham e a prévia fica ao alcance`, async () => {
        const { page, errors } = await open(scene.query);
        const host = page.getByTestId('plan-140-panel-host');
        const preview = page.getByTestId('live-preview-frame');
        const column = page.locator('.sarak-panel-column');

        const columnBox = await box(column);
        expect((await box(preview)).y).toBeGreaterThan(columnBox.y);
        await capture(page, `${scene.name}-0-coluna.png`, `Painel estreito (${scene.name}): a coluna em cima.`);
        await preview.scrollIntoViewIfNeeded();
        const hostBox = await box(host);
        const reached = await box(preview);
        expect(reached.y).toBeGreaterThanOrEqual(hostBox.y - 1);
        expect(reached.y).toBeLessThan(hostBox.y + hostBox.height);
        expect(reached.width).toBeGreaterThan(300);
        await capture(page, `${scene.name}-1-previa.png`, `Painel estreito (${scene.name}): rolando, a prévia fica ao alcance.`);
        expect(errors).toEqual([]);
        await page.close();
    });
}
