/**
 * Paletas no painel: escolher uma pronta → criar a partir de uma cor → ajustar um token → "Aplicar" → o `onSave`
 * recebe `colorPalette` (formato de vírgulas) e o token ajustado.
 *
 * Prévia para o dono: com `SARAK_PREVIA_135_DIR` definida, o mesmo caso grava as capturas PNG e um `index.html`
 * (imagens na mesma pasta, caminhos relativos, abre sem servidor). Regenera com:
 *   $env:SARAK_PREVIA_135_DIR='C:\tmp\sarak-rc4-previa\135'
 *   npx playwright test --config=browser-tests/playwright.config.ts browser-tests/plan-135-paletas-no-painel.spec.ts
 *
 * LIMITES DECLARADOS (R18): Chromium headless; o tema `sarak-sovereign`; lê `src/` pelo esbuild do harness
 * (não mede o `dist/`); a prévia ao vivo do criador é conferida pelo nome acessível e pelas amostras, não pelo pixel.
 */
import { test, expect, chromium, type Browser, type Page } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { buildHarness } from './build-harness.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ENTRY = path.join(HERE, 'fixtures', 'plan-135-paletas-entry.tsx');
const PREVIEW_DIR = process.env.SARAK_PREVIA_135_DIR;
const ADJUSTED_SIDEBAR = '#123456';

interface Capture {
    file: string;
    caption: string;
}

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
    const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Plan 135 — paletas no painel</title>
<style>body{font-family:system-ui,sans-serif;margin:24px;background:#10131a;color:#e8ecf4}figure{margin:0 0 32px}
img{max-width:100%;border:1px solid #2b3242;border-radius:8px}figcaption{margin-top:8px;font-size:14px}</style></head>
<body><h1>Plan 135 — paletas no painel e no kit</h1>\n${figures}\n</body></html>`;
    fs.writeFileSync(path.join(directory, 'index.html'), html, 'utf8');
};

const capture = async (page: Page, file: string, caption: string): Promise<void> => {
    if (!PREVIEW_DIR) return;
    fs.mkdirSync(PREVIEW_DIR, { recursive: true });
    await page.screenshot({ path: path.join(PREVIEW_DIR, file) });
    captures.push({ file, caption });
};

test('escolher uma pronta, criar a partir de uma cor, ajustar um token e aplicar leva colorPalette e o ajuste ao onSave', async () => {
    const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
    const pageErrors: string[] = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));
    await page.goto(harnessUrl);

    const gallery = page.getByRole('radiogroup', { name: 'Paletas prontas' });
    await expect(gallery).toBeVisible();
    await capture(page, '1-galeria-por-tipo.png', 'Galeria de paletas agrupada por tipo; cada amostra mostra o modo claro e o escuro.');

    await page.locator('.sarak-device-desktop').getByRole('button', { name: 'Modo Claro' }).click();
    await capture(page, '2-galeria-modo-claro.png', 'A mesma galeria com o painel e a prévia no modo claro.');

    const firstPreset = gallery.getByRole('radio').first();
    await firstPreset.click();
    await expect(firstPreset).toHaveAttribute('aria-checked', 'true');
    await expect(page.getByTestId('saved-payload')).toHaveText('');

    await page.getByRole('button', { name: 'Criar paleta a partir de uma cor' }).click();
    const form = page.getByRole('group', { name: 'Criar paleta' });
    await form.getByLabel('Cor de Cor-base').fill('#aa3366');
    await form.getByLabel('Cor de Cor-base').press('Enter');
    await form.getByLabel('Tipo de paleta').selectOption('triadic');
    await expect(form.getByRole('img', { name: 'Prévia da paleta: Paleta criada' })).toBeVisible();
    await capture(page, '3-criar-paleta.png', 'Criar paleta: cor-base, tipo e a prévia ao vivo dos dois modos.');
    await form.getByRole('button', { name: 'Usar esta paleta' }).click();
    await expect(page.getByTestId('saved-payload')).toHaveText('');

    await page.getByPlaceholder('Buscar token...').fill('Cor da Sidebar');
    const sidebarField = page.getByLabel('Cor de Cor da Sidebar (Fundo)');
    await sidebarField.fill(ADJUSTED_SIDEBAR);
    await sidebarField.press('Enter');
    await capture(page, '4-ajuste-granular.png', 'Ajuste granular por cima da paleta: a cor da sidebar editada à mão.');
    await page.getByPlaceholder('Buscar token...').fill('');

    await gallery.getByRole('radio').first().click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toContainText('Trocar de paleta?');
    await capture(page, '5-troca-com-ajustes.png', 'Trocar de paleta com um ajuste manual: o painel pergunta se o ajuste fica.');
    await dialog.getByRole('button', { name: 'Manter meus ajustes' }).click();

    await page.getByRole('button', { name: /^Aplicar/ }).click();
    const payload = page.getByTestId('saved-payload');
    await expect(payload).toContainText('"colorPalette"');
    const saved = JSON.parse((await payload.textContent()) ?? '{}') as Record<string, unknown>;
    expect(String(saved.colorPalette)).not.toContain(';');
    expect(saved.sidebarColor).toBe(ADJUSTED_SIDEBAR);
    await capture(page, '6-depois-do-aplicar.png', 'Depois do "Aplicar": a tela de amostra com a paleta e o ajuste mantido.');
    expect(pageErrors).toEqual([]);
    await page.close();
});
