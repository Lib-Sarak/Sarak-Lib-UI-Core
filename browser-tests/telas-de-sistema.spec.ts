/**
 * As telas de sistema (configurações, auditoria, diferença, versões, aprovação, execução, conexão, uso, permissões,
 * membros e sessões) medidas em navegador real: teclado, estado que não depende só da cor, contraste do texto de
 * estado e contêiner estreito. O `jsdom` não resolve a cascata, `color-mix` nem a largura de contêiner.
 *
 * LIMITES DECLARADOS (R18): lê o `dist/` (pacote e folha) — sem `npm run build` recente mede o build anterior.
 * Só Chromium headless, o tema padrão e os dois modos. O contraste é o do texto de estado
 * contra o primeiro fundo opaco acima dele; contraste de borda e de glifo não é medido (specs/10 §2.4d).
 */
import fs from 'node:fs';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { buildHarness } from './build-harness.mjs';

const ENTRY = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures', 'telas-de-sistema-entry.tsx');
const WIDE = 960;
const NARROW = 320;
const SUBPIXEL = 1;
const TEXT_MINIMUM_CONTRAST = 4.5;
const MODES = ['dark', 'light'] as const;
const WIDTHS = [WIDE, NARROW] as const;
const PIECES = ['configuracoes', 'auditoria', 'diferenca', 'versoes', 'aprovacao', 'execucao', 'conexao', 'uso', 'permissoes', 'membros', 'sessoes'] as const;

let harnessDirectory: string;
let harnessUrl: string;

test.beforeAll(async () => {
    const harness = await buildHarness(ENTRY);
    harnessDirectory = harness.outDir;
    harnessUrl = pathToFileURL(harness.htmlPath).href;
});

test.afterAll(() => {
    if (harnessDirectory) fs.rmSync(harnessDirectory, { recursive: true, force: true });
});

async function open(page: Page, mode: string, width: number): Promise<void> {
    await page.setViewportSize({ width: width + 64, height: 900 });
    await page.goto(`${harnessUrl}?${new URLSearchParams({ mode, width: String(width) }).toString()}`);
    await expect(page.getByTestId('peca-sessoes')).toBeVisible();
    await expect(page.getByTestId('peca-auditoria').getByText('Pedido 12')).toBeVisible();
}

const piece = (page: Page, id: string) => page.getByTestId(`peca-${id}`);
const log = (page: Page) => page.getByTestId('log');

/** Contraste WCAG do texto do elemento contra o primeiro fundo opaco acima dele. */
async function contrastOf(page: Page, selector: string): Promise<number> {
    return page.locator(selector).first().evaluate((element) => {
        const parse = (value: string): number[] => (value.match(/[\d.]+/g) ?? []).map(Number);
        const channel = (value: number): number => { const unit = value / 255; return unit <= 0.03928 ? unit / 12.92 : ((unit + 0.055) / 1.055) ** 2.4; };
        const luminance = ([red, green, blue]: number[]): number => 0.2126 * channel(red) + 0.7152 * channel(green) + 0.0722 * channel(blue);
        let node: Element | null = element;
        let background = [255, 255, 255];
        while (node) {
            const [red, green, blue, alpha = 1] = parse(getComputedStyle(node).backgroundColor);
            if (alpha > 0.99) { background = [red, green, blue]; break; }
            node = node.parentElement;
        }
        const text = luminance(parse(getComputedStyle(element).color));
        const back = luminance(background);
        return (Math.max(text, back) + 0.05) / (Math.min(text, back) + 0.05);
    });
}

for (const mode of MODES) {
    for (const width of WIDTHS) {
        test(`${mode} a ${width}px: nenhuma peça estoura a largura do contêiner`, async ({ page }) => {
            await open(page, mode, width);
            const overflow = await page.evaluate((ids) => {
                const stage = document.querySelector('[data-testid="stage"]') as HTMLElement;
                const stageRight = stage.getBoundingClientRect().right;
                const scrollsInside = (node: Element): boolean => {
                    for (let parent = node.parentElement; parent && parent !== stage; parent = parent.parentElement) {
                        if (getComputedStyle(parent).overflowX === 'auto') return true;
                    }
                    return false;
                };
                const offenders = [...stage.querySelectorAll('*')]
                    .filter((node) => node.getBoundingClientRect().width > 0 && node.getBoundingClientRect().right > stageRight + 1 && !scrollsInside(node))
                    .slice(0, 5)
                    .map((node) => `${node.tagName.toLowerCase()}.${String(node.className).slice(0, 40)} "${(node.textContent ?? '').slice(0, 30)}" +${Math.round(node.getBoundingClientRect().right - stageRight)}px`);
                return {
                    page: document.documentElement.scrollWidth - document.documentElement.clientWidth,
                    offenders,
                    pieces: ids.map((id) => {
                        const node = document.querySelector(`[data-testid="peca-${id}"]`) as HTMLElement;
                        return { id, over: Math.round(node.getBoundingClientRect().right - stage.getBoundingClientRect().right) };
                    }),
                };
            }, [...PIECES]);

            expect(overflow.offenders, 'elementos fora da borda do contêiner').toEqual([]);
            expect(overflow.page, 'a página não ganha rolagem horizontal').toBeLessThanOrEqual(SUBPIXEL);
            overflow.pieces.forEach(({ id, over }) => expect(over, `${id} passa da borda do contêiner`).toBeLessThanOrEqual(SUBPIXEL));
        });

        test(`${mode} a ${width}px: o texto de estado tem contraste de texto`, async ({ page }) => {
            await open(page, mode, width);
            const selectors: Record<string, string> = {
                'live offline': '[data-live-status="offline"] > span:first-child',
                'live connected': '[data-live-status="connected"] > span:first-child',
                'running phase': '[data-phase-status="running"] > div > span:last-child',
                'done phase': '[data-phase-status="done"] > div > span:last-child',
                'pending phase': '[data-phase-status="pending"] > div > span:last-child',
            };
            for (const [name, selector] of Object.entries(selectors)) {
                expect(await contrastOf(page, selector), name).toBeGreaterThanOrEqual(TEXT_MINIMUM_CONTRAST);
            }
        });
    }
}

test('configurações: Tab chega a Salvar e Enter salva; a barra passa a dizer "Tudo salvo"', async ({ page }) => {
    await open(page, 'dark', WIDE);
    const bar = piece(page, 'configuracoes').getByRole('region', { name: 'Ações das configurações' });
    await expect(bar.getByRole('status')).toContainText('Alterações não salvas');

    await bar.getByRole('button', { name: 'Descartar' }).focus();
    await page.keyboard.press('Tab');
    await expect(bar.getByRole('button', { name: 'Salvar' })).toBeFocused();
    await page.keyboard.press('Enter');

    await expect(log(page)).toContainText('salvar');
    await expect(bar.getByRole('status')).toContainText('Tudo salvo');
    await expect(bar.getByRole('button', { name: 'Salvar' })).toBeDisabled();
});

test('configurações: o índice leva o foco à seção e marca a atual', async ({ page }) => {
    await open(page, 'dark', WIDE);
    const link = piece(page, 'configuracoes').getByRole('link', { name: /Avisos/ });
    await link.focus();
    await page.keyboard.press('Enter');

    await expect(link).toHaveAttribute('aria-current', 'location');
    await expect(page.locator('#avisos')).toBeFocused();
});

test('matriz: uma parada de Tab, setas movem, Espaço alterna e a herdada fica quieta', async ({ page }) => {
    await open(page, 'dark', WIDE);
    const grid = piece(page, 'permissoes').getByRole('grid', { name: 'Matriz de permissões' });
    expect(await grid.locator('[role="gridcell"][tabindex="0"]').count()).toBe(1);

    await grid.locator('[data-cell="0:0"]').focus();
    await page.keyboard.press('ArrowRight');
    await expect(grid.locator('[data-cell="0:1"]')).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(grid.locator('[data-cell="1:1"]')).toBeFocused();
    await page.keyboard.press('Space');
    await expect(log(page)).not.toContainText('permissao:editor:editar');

    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Space');
    await expect(log(page)).toContainText('permissao:editor:faturar:true');
    await expect(grid.locator('[data-cell="2:1"]')).toHaveAttribute('data-state', 'direct');
    await expect(grid.locator('[data-cell="1:1"]')).toHaveAttribute('data-state', 'inherited');
});

test('matriz estreita: rola dentro do próprio contêiner e a coluna de permissões fica à vista', async ({ page }) => {
    await open(page, 'dark', NARROW);
    const measure = await piece(page, 'permissoes').getByRole('grid').evaluate((grid) => {
        const scroller = grid.parentElement as HTMLElement;
        const first = grid.querySelector('tbody tr:nth-child(2) th') as HTMLElement;
        scroller.scrollLeft = scroller.scrollWidth;
        return { scrolls: scroller.scrollWidth > scroller.clientWidth, headLeft: first.getBoundingClientRect().left, scrollerLeft: scroller.getBoundingClientRect().left };
    });

    expect(measure.scrolls, 'a grade larga rola por dentro').toBe(true);
    expect(Math.abs(measure.headLeft - measure.scrollerLeft), 'a coluna de permissões fica fixa à esquerda').toBeLessThanOrEqual(SUBPIXEL + 2);
});

test('aprovação: rejeitar pede o motivo, e o lote usa os ids marcados', async ({ page }) => {
    await open(page, 'light', WIDE);
    const queue = piece(page, 'aprovacao');
    await queue.getByRole('button', { name: 'Rejeitar' }).first().click();
    await queue.getByRole('button', { name: 'Confirmar rejeição' }).click();
    await expect(queue.getByText('Informe o motivo.')).toBeVisible();
    await queue.getByLabel('Motivo da rejeição').fill('Fora da política');
    await queue.getByRole('button', { name: 'Confirmar rejeição' }).click();
    await expect(log(page)).toContainText('rejeitar:a:Fora da política');

    await queue.getByRole('checkbox', { name: 'Selecionar todos os itens' }).focus();
    await page.keyboard.press('Space');
    await queue.getByRole('button', { name: 'Aprovar 2 selecionados' }).click();
    await expect(log(page)).toContainText('aprovar:a,b');
});

test('diferença e estado: cada mudança tem palavra e símbolo além da cor', async ({ page }) => {
    await open(page, 'light', WIDE);
    const diff = piece(page, 'diferenca');

    await expect(diff.locator('[data-diff-field="changed"]')).toContainText('Alterado');
    await expect(diff.locator('[data-diff-field="added"]')).toContainText('Adicionado');
    await expect(diff.locator('[data-diff-field="removed"]')).toContainText('Removido');
    await expect(piece(page, 'uso')).toContainText('Limite excedido');
    await expect(piece(page, 'uso')).toContainText('Perto do limite');
    await expect(piece(page, 'conexao').getByRole('status').first()).toContainText('◆');
});

test('auditoria: o detalhe expande pelo teclado e a busca devolve o filtro', async ({ page }) => {
    await open(page, 'dark', WIDE);
    const audit = piece(page, 'auditoria');
    await audit.getByRole('button', { name: 'Expandir linha' }).first().focus();
    await page.keyboard.press('Enter');
    await expect(audit.getByText('IP 10.0.0.1')).toBeVisible();

    await audit.getByLabel('Buscar na auditoria').fill('x');
    await expect(log(page)).toContainText('filtro:x');
});

test('versões, execução, membros e sessões: as ações chegam ao host com o id certo', async ({ page }) => {
    await open(page, 'dark', WIDE);
    await piece(page, 'versoes').getByRole('button', { name: 'Restaurar Versão 1' }).click();
    await piece(page, 'execucao').getByRole('button', { name: 'Cancelar execução' }).click();
    await piece(page, 'conexao').getByRole('button', { name: 'Tentar agora' }).click();
    await piece(page, 'membros').getByRole('button', { name: /^Remover Ana Souza/ }).click();
    await piece(page, 'membros').getByRole('button', { name: /^Revogar convite de carla/ }).click();
    await piece(page, 'sessoes').getByRole('button', { name: 'Encerrar sessão em Safari no iPhone' }).click();
    await piece(page, 'sessoes').getByRole('button', { name: 'Encerrar as outras sessões' }).click();

    await expect(log(page)).toHaveText('restaurar:v1|cancelar|tentar|remover:m1|revogar:i1|encerrar:s2|encerrar-outras');
});

test('versões: abrir a comparação mostra a diferença sem estourar em contêiner estreito', async ({ page }) => {
    await open(page, 'light', NARROW);
    const versions = piece(page, 'versoes');
    await versions.getByRole('button', { name: 'Comparar com a anterior' }).click();

    await expect(versions.getByRole('button', { name: 'Ocultar comparação' })).toHaveAttribute('aria-expanded', 'true');
    await expect(versions.getByText('15 dias')).toBeVisible();
    const over = await versions.evaluate((node) => node.scrollWidth - node.clientWidth);
    expect(over).toBeLessThanOrEqual(SUBPIXEL);
});
