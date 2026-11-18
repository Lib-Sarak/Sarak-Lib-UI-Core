/**
 * Escolher uma opção no painel responde sem atraso. No ERP (lib 8.0.0), escolher uma opção da Sidebar levava de 0,9 a 1,5 s até o
 * painel responder: cada escolha reescrevia os `<style>` de cada escopo de prévia e de amostra, e a troca de tema remontava o
 * escopo da prévia ao vivo várias vezes, cada remontagem com classe nova e ≈529 variáveis escritas como estilo inline.
 *
 * Três medidas, na decisão Barras (escolha de uma opção da Barra lateral) e na decisão Tema (troca de tema):
 *   1. O tempo do clique até o quadro seguinte ao `Aplicar` habilitado (`performance.now()` na página), e os recálculos de estilo.
 *   2. Quantos `<style>` a escolha insere, remove ou reescreve: uma escolha que não muda valor responsivo não reescreve nenhum.
 *   3. Quantas vezes um escopo `.sarak-design-scope` é montado de novo durante a troca de tema.
 *
 * -------------------------------------------------------------------------
 * LIMITES DECLARADOS (R18) — o que esta medição NÃO vê
 * -------------------------------------------------------------------------
 * 1. Só Chromium headless a 1440×900, a cena de `troca-de-tema-entry.tsx` (o painel inteiro com o tema padrão); não mede o ERP.
 * 2. O tempo varia com a máquina e com a carga. O teto de 250 ms vale para o harness com o React de PRODUÇÃO (o que o usuário
 *    roda; o de desenvolvimento faz trabalho de checagem que o usuário não paga); as contagens (recálculos, `<style>`,
 *    remontagens) são o que não varia e o que segura a regressão.
 * 3. A primeira escolha da página paga o carregamento preguiçoso das amostras; a medida é a MEDIANA de quinze escolhas
 *    alternadas, depois de uma de aquecimento: uma escolha atrasada por outro processo da máquina não decide a mediana.
 * 4. Lê `src/` pelo esbuild do harness e o CSS de `dist/` — sem `npm run build` recente, mede a folha anterior.
 * -------------------------------------------------------------------------
 */
import { test, expect, chromium, type Browser, type CDPSession, type Page } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { buildHarness } from './build-harness.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ENTRY = path.join(HERE, 'fixtures', 'troca-de-tema-entry.tsx');
const VIEWPORT = { width: 1440, height: 900 };

/** A meta: escolher uma opção responde em menos de 250 ms no harness, com o React de produção. */
const CHOICE_RESPONSE_BUDGET_MS = 250;
/** Quantas escolhas medidas (a mediana delas vale), depois de uma de aquecimento. */
const MEASURED_CHOICES = 15;
/** Uma opção da Barra lateral não muda valor responsivo: nenhum `<style>` precisa ser inserido, removido ou reescrito. */
const STYLE_WRITES_BUDGET = 0;
/** Uma troca de tema não remonta escopo de prévia: o escopo troca as variáveis, não nasce de novo. */
const SCOPE_REMOUNT_BUDGET = 0;
/** As duas opções alternadas da Barra lateral (a primeira de cada nome é a da Barra lateral). */
const SIDEBAR_OPTIONS = ['Contornada', 'Flutuante'] as const;
const THEME_CARD = /Cyberpunk Neon(?! Classic)/;
/** A mesma folga com que a amostra decide se está visível (`useValueWhileVisible`): logo abaixo da dobra ela já se atualiza. */
const VISIBILITY_MARGIN = '25%';

let browser: Browser;
let harnessDirectory: string;
let harnessUrl: string;

test.beforeAll(async () => {
    const executablePath = process.env.SARAK_CHROMIUM_EXECUTABLE_PATH;
    browser = await chromium.launch(executablePath ? { executablePath } : {});
    const harness = await buildHarness(ENTRY, { production: true });
    harnessDirectory = harness.outDir;
    harnessUrl = pathToFileURL(harness.htmlPath).href;
});

test.afterAll(async () => {
    if (browser) await browser.close();
    if (harnessDirectory) fs.rmSync(harnessDirectory, { recursive: true, force: true });
});

declare global {
    interface Window {
        /** `<style>` inseridos, removidos ou com o texto trocado desde o último `__watchStyles()`. */
        __styleWrites: number;
        /** Escopos `.sarak-design-scope` inseridos desde o último `__watchStyles()`. */
        __scopeMounts: number;
        __watchStyles: () => void;
    }
}

const recalcStyleCount = async (cdp: CDPSession): Promise<number> => {
    const { metrics } = await cdp.send('Performance.getMetrics');
    return metrics.find((metric) => metric.name === 'RecalcStyleCount')?.value ?? 0;
};

/** Espera a tela assentar: nenhum recálculo novo por meio segundo. */
const settle = async (page: Page, cdp: CDPSession): Promise<void> => {
    let previous = -1;
    for (let attempt = 0; attempt < 40; attempt += 1) {
        const current = await recalcStyleCount(cdp);
        if (current === previous) return;
        previous = current;
        await page.waitForTimeout(500);
    }
};

/** Conta, a partir de agora, os `<style>` escritos e os escopos montados (MutationObserver no documento inteiro). */
const installWatchers = (page: Page): Promise<void> => page.evaluate(() => {
    const isStyle = (node: Node): boolean => node.nodeName === 'STYLE';
    const isScope = (node: Node): boolean => node instanceof Element && node.classList.contains('sarak-design-scope');
    const scopesIn = (node: Node): number => (node instanceof Element
        ? (isScope(node) ? 1 : 0) + node.querySelectorAll('.sarak-design-scope').length
        : 0);
    const stylesIn = (node: Node): number => (node instanceof Element
        ? (isStyle(node) ? 1 : 0) + node.querySelectorAll('style').length
        : 0);
    window.__styleWrites = 0;
    window.__scopeMounts = 0;
    window.__watchStyles = () => { window.__styleWrites = 0; window.__scopeMounts = 0; };
    new MutationObserver((records) => records.forEach((record) => {
        if (record.type === 'characterData') {
            if (record.target.parentNode && isStyle(record.target.parentNode)) window.__styleWrites += 1;
            return;
        }
        if (isStyle(record.target)) {
            window.__styleWrites += 1;
            return;
        }
        record.addedNodes.forEach((node) => {
            window.__styleWrites += stylesIn(node);
            window.__scopeMounts += scopesIn(node);
        });
        record.removedNodes.forEach((node) => { window.__styleWrites += stylesIn(node); });
    })).observe(document, { subtree: true, childList: true, characterData: true });
});

/**
 * Clica a opção e devolve o tempo até o quadro seguinte ao `Aplicar` habilitado: o clique, o React, o recálculo de estilo, o
 * layout e a pintura desse quadro. Medido na página para não somar o protocolo do Playwright.
 */
const timeChoice = (page: Page, optionName: string): Promise<number> => page.evaluate((name) => new Promise<number>((resolve, reject) => {
    // O botão da opção é transparente e só tem o nome acessível (`OptionTile`); o primeiro com o nome é o da Barra lateral.
    const option = [...document.querySelectorAll<HTMLElement>('button')].find((button) => button.getAttribute('aria-label') === name);
    const apply = [...document.querySelectorAll<HTMLButtonElement>('button')].find((button) => button.textContent?.trim().startsWith('Aplicar'));
    if (!option || !apply) {
        reject(new Error(`opção "${name}" ou Aplicar ausente`));
        return;
    }
    const start = performance.now();
    option.click();
    const waitEnabled = (): void => {
        if (apply.disabled || apply.getAttribute('aria-disabled') === 'true') {
            requestAnimationFrame(waitEnabled);
            return;
        }
        requestAnimationFrame(() => setTimeout(() => resolve(performance.now() - start), 0));
    };
    waitEnabled();
}), optionName);

const median = (values: number[]): number => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];

const openDecision = async (page: Page, name: RegExp, heading: string): Promise<void> => {
    await page.getByRole('button', { name }).first().click();
    await expect(page.getByRole('heading', { level: 2, name: heading })).toBeVisible();
};

/** Os grupos de opção abrem recolhidos (só o em uso aberto): o caso abre o grupo que vai medir. */
const openGroup = async (page: Page, group: string): Promise<void> => {
    const toggle = page.locator(`[data-group-toggle="${group}"]`);
    if ((await toggle.getAttribute('aria-expanded')) === 'false') await toggle.click();
};

test('escolher uma opção da Barra lateral responde em menos de 250 ms, sem reescrever <style>', async () => {
    const page = await browser.newPage({ viewport: VIEWPORT });
    const pageErrors: string[] = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));
    await page.goto(harnessUrl);
    await openDecision(page, /^Barras/, 'Barras');
    await openGroup(page, 'sidebar');
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Performance.enable');
    await settle(page, cdp);
    await installWatchers(page);

    await timeChoice(page, SIDEBAR_OPTIONS[1]);
    await settle(page, cdp);

    const times: number[] = [];
    const recalcs: number[] = [];
    const styleWrites: number[] = [];
    for (let step = 0; step < MEASURED_CHOICES; step += 1) {
        await page.evaluate(() => window.__watchStyles());
        const before = await recalcStyleCount(cdp);
        times.push(await timeChoice(page, SIDEBAR_OPTIONS[step % 2]));
        await settle(page, cdp);
        recalcs.push((await recalcStyleCount(cdp)) - before);
        styleWrites.push(await page.evaluate(() => window.__styleWrites));
    }

    const elements = await page.evaluate(() => document.querySelectorAll('*').length);
    test.info().annotations.push({
        type: 'medido',
        description: `tempo até o quadro com Aplicar habilitado: ${times.map((time) => time.toFixed(0)).join(', ')} ms (mediana ${median(times).toFixed(0)}); recálculos de estilo por escolha: ${recalcs.join(', ')}; <style> escritos por escolha: ${styleWrites.join(', ')}; ${elements} elementos`,
    });
    expect(Math.max(...styleWrites), '<style> inseridos, removidos ou reescritos por uma escolha').toBeLessThanOrEqual(STYLE_WRITES_BUDGET);
    expect(median(times), 'mediana do tempo de resposta de uma escolha (ms)').toBeLessThan(CHOICE_RESPONSE_BUDGET_MS);
    expect(pageErrors).toEqual([]);
    await page.close();
});

/**
 * Por escopo de amostra: se está na área visível antes da troca e quantas vezes o estilo inline dele foi reescrito. "Visível"
 * é o que o `IntersectionObserver` diz, com o recorte das colunas roláveis do painel: uma amostra dentro da janela mas recortada
 * pela coluna não é vista por ninguém.
 */
const watchScopeStyles = (page: Page): Promise<void> => page.evaluate((margin) => new Promise<void>((resolve) => {
    const scopeClass = (element: Element): string | undefined => [...element.classList].find((name) => name.startsWith('sarak-scope-'));
    const records: Record<string, { visible: boolean; writes: number }> = {};
    const elements = [...document.querySelectorAll('[data-option-tile] .sarak-design-scope')];
    (window as unknown as { __scopeStyles: typeof records }).__scopeStyles = records;
    const visibility = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            const name = scopeClass(entry.target);
            if (name) records[name] = { visible: entry.isIntersecting, writes: 0 };
        });
        visibility.disconnect();
        new MutationObserver((mutations) => mutations.forEach((mutation) => {
            const name = mutation.target instanceof Element ? scopeClass(mutation.target) : undefined;
            if (name && records[name]) records[name].writes += 1;
        })).observe(document, { subtree: true, attributes: true, attributeFilter: ['style'] });
        resolve();
    }, { rootMargin: margin });
    elements.forEach((element) => visibility.observe(element));
}), VISIBILITY_MARGIN);

test('trocar o tema não remonta escopo, e a amostra fora da área visível não reescreve o estilo', async () => {
    // A grade compacta cabe quase inteira numa tela alta: a janela baixa deixa parte das Personalidades fora da área visível.
    const page = await browser.newPage({ viewport: { ...VIEWPORT, height: 520 } });
    await page.goto(harnessUrl);
    await openDecision(page, /^Tema/, 'Tema');
    await openGroup(page, 'themes');
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Performance.enable');
    await settle(page, cdp);
    await installWatchers(page);
    await watchScopeStyles(page);

    await page.getByRole('button', { name: THEME_CARD }).click();
    await settle(page, cdp);
    const { mounts, writes, scopes } = await page.evaluate(() => ({
        mounts: window.__scopeMounts,
        writes: window.__styleWrites,
        scopes: (window as unknown as { __scopeStyles: Record<string, { visible: boolean; writes: number }> }).__scopeStyles,
    }));
    const hidden = Object.values(scopes).filter((scope) => !scope.visible);
    const visible = Object.values(scopes).filter((scope) => scope.visible);
    test.info().annotations.push({
        type: 'medido',
        description: `troca de tema: ${mounts} escopos montados de novo; ${writes} <style> escritos; amostras visíveis: ${visible.map((scope) => scope.writes).join(', ')} propriedades reescritas; fora da área visível: ${hidden.map((scope) => scope.writes).join(', ')}`,
    });
    expect(mounts, 'escopos .sarak-design-scope montados de novo na troca de tema').toBeLessThanOrEqual(SCOPE_REMOUNT_BUDGET);
    expect(hidden.length, 'a cena tem amostra fora da área visível').toBeGreaterThan(0);
    expect(hidden.map((scope) => scope.writes), 'estilo reescrito em amostra fora da área visível').toEqual(hidden.map(() => 0));
    expect(visible.every((scope) => scope.writes > 0), 'a amostra visível acompanha o tema novo').toBe(true);
    await page.close();
});
