/**
 * Gate E2E de NÃO-VAZAMENTO BIDIRECIONAL (Spec 24 §2.3) — Chromium real.
 *
 * jsdom não resolve `var()` nem aplica cascata de stylesheet, então a prova de que o
 * Modo Embarcado (a) não repinta o host e (b) continua estilizando a própria ilha só
 * existe num browser de verdade. Este arquivo é essa prova.
 *
 * Direção 1 (host intacto): uma página host com estilos próprios (h1 com margem,
 * botão estilizado, título próprio) tem os computed styles medidos ANTES de qualquer
 * CSS da Sarak, depois de carregar `dist/sarak-scoped.css` e depois de montar a ilha.
 * Os três valores têm de ser idênticos.
 *
 * Direção 2 (ilha estilizada): dentro da ilha, o preflight e os utilities Sarak
 * PRECISAM valer — um escopo que não repinta o host mas também não estiliza a lib
 * seria um falso-verde. Inclui o portal do toast, que sai da árvore da ilha.
 *
 * PRÉ-REQUISITO: `npm run build` (o gate lê o artefato `dist/sarak-scoped.css` real,
 * não uma reprodução). O teste falha com instrução explícita se ele não existir.
 *
 * O harness do playwright-ct importa o CSS GLOBAL (`playwright/index.tsx`), que
 * re-estilizaria o host e mascararia o vazamento — por isso o teste desabilita as
 * folhas pré-existentes antes de medir.
 */

import { test, expect } from '@playwright/experimental-ct-react';
import React from 'react';
import fs from 'node:fs';
import path from 'node:path';
import { IlhaEmbarcada } from './EmbeddedIsland.story';

const SCOPED_CSS = path.resolve('dist/sarak-scoped.css');
const HOST_TITLE = 'App do Host — NÃO pode mudar';
/** Precisa casar com o `systemName` da story: é o que vazaria para o título da aba. */
const SYSTEM_NAME_DA_ILHA = 'Sistema Sarak (ilha)';

/** Monta o front "que já existe" e neutraliza o CSS que o harness ct injeta. */
const montarHost = (titulo: string): void => {
    Array.from(document.styleSheets).forEach((sheet) => {
        try {
            sheet.disabled = true;
        } catch {
            /* folha cross-origin: não há o que desabilitar */
        }
    });
    document.title = titulo;

    const estiloHost = document.createElement('style');
    estiloHost.id = 'estilo-do-host';
    estiloHost.textContent = `
        #host h1 { margin-top: 37px; font-size: 31px; color: rgb(10, 20, 30); }
        #host button { background-color: rgb(0, 128, 0); border-radius: 11px; padding: 7px; }
        #host p { line-height: 29px; }
    `;
    document.head.appendChild(estiloHost);

    const host = document.createElement('section');
    host.id = 'host';
    host.innerHTML = '<h1>Título do host</h1><p>Parágrafo do host</p><button>Botão do host</button>';
    document.body.appendChild(host);
};

/** Computed styles do host que o preflight do Tailwind destruiria se vazasse. */
const medirHost = (): Record<string, string> => {
    const css = (sel: string, prop: string): string =>
        getComputedStyle(document.querySelector(sel) as Element).getPropertyValue(prop);
    return {
        h1MarginTop: css('#host h1', 'margin-top'),
        h1FontSize: css('#host h1', 'font-size'),
        h1Color: css('#host h1', 'color'),
        botaoBg: css('#host button', 'background-color'),
        botaoRadius: css('#host button', 'border-radius'),
        botaoPadding: css('#host button', 'padding-top'),
        paragrafoLineHeight: css('#host p', 'line-height'),
        // Propriedades que o host NÃO declara: são as que o preflight do Tailwind
        // sequestraria. Sem elas o gate passaria mesmo com o CSS global vazando.
        h1BoxSizing: css('#host h1', 'box-sizing'),
        paragrafoMarginTop: css('#host p', 'margin-top'),
        botaoBorda: css('#host button', 'border-top-width'),
        botaoFonte: css('#host button', 'font-family'),
        titulo: document.title,
    };
};

test.use({ viewport: { width: 1200, height: 800 } });

test('Modo Embarcado não vaza para o host e ainda estiliza a ilha', async ({ page, mount }) => {
    expect(
        fs.existsSync(SCOPED_CSS),
        'dist/sarak-scoped.css não existe — rode "npm run build" antes deste gate.',
    ).toBe(true);

    // 1. Monta a ilha embarcada. `mount` navega a página, então tudo que depende do
    //    documento vem DEPOIS dele (o ct permite um único mount por teste).
    const ilha = await mount(<IlhaEmbarcada />);
    // O container de escopo é a PRÓPRIA raiz do componente montado.
    const escopo = page.locator('.sarak-scope').first();
    await expect(escopo).toBeAttached();

    // 2. Vazamento #2 (título): o `systemName` da ilha não pode ter virado o título da
    //    aba. Aqui o título ainda é o da página host (index.html do harness).
    expect(await page.title()).not.toBe(SYSTEM_NAME_DA_ILHA);

    // 3. Front do host, com TODO CSS da Sarak desligado — é a régua de comparação.
    await page.evaluate(montarHost, HOST_TITLE);
    const baseline = await page.evaluate(medirHost);

    // Sanidade: o host realmente tem estilo próprio (senão o gate seria vazio).
    expect(baseline.h1MarginTop).toBe('37px');
    expect(baseline.botaoBg).toBe('rgb(0, 128, 0)');
    expect(baseline.h1BoxSizing).toBe('content-box');

    // 4. O stylesheet ESCOPADO entra em cena — e nada do host pode se mexer.
    //    (Com o `dist/sarak.css` global no lugar deste, o preflight zeraria a margem
    //    do h1 e o fundo do botão: é exatamente o vazamento #1 da spec.)
    await page.addStyleTag({ path: SCOPED_CSS });
    expect(await page.evaluate(medirHost)).toEqual(baseline);
    expect(await page.title()).toBe(HOST_TITLE);

    // 5. Direção inversa: dentro da ilha o CSS da Sarak PRECISA valer. Um escopo que
    //    não vaza mas também não estiliza a lib seria um falso-verde.
    await expect(escopo).toBeVisible();

    // O CSS escopado alcança a ilha (marcador declarado em `_base.css`).
    const marcador = await escopo.evaluate((el) =>
        getComputedStyle(el).getPropertyValue('--sarak-ui-core-css-loaded').trim(),
    );
    expect(marcador).toBe('1');

    // Preflight, nos DOIS sentidos: `border-box` dentro da ilha e `content-box` no
    // host. É a mesma regra do Tailwind (`*{box-sizing:border-box}`) — a que
    // re-estilizava a página inteira antes desta spec.
    const boxSizingIlha = await ilha
        .getByTestId('ilha-h1')
        .evaluate((el) => getComputedStyle(el).boxSizing);
    expect(boxSizingIlha).toBe('border-box');
    const boxSizingHost = await page
        .locator('#host h1')
        .evaluate((el) => getComputedStyle(el).boxSizing);
    expect(boxSizingHost).toBe('content-box');

    // Design tokens resolvidos: o átomo Sarak está pintado com o tema, não com o
    // estilo cru do browser (raio e cor primária vêm de `var(--sarak-*)`).
    const botaoIlha = await ilha.getByTestId('ilha-btn').evaluate((el) => {
        const cs = getComputedStyle(el);
        return { radius: cs.borderRadius, bg: cs.backgroundColor };
    });
    expect(botaoIlha.radius).not.toBe('0px');
    expect(botaoIlha.bg).not.toBe('rgba(0, 0, 0, 0)');

    // 6. O portal do toast sai da ilha — e mesmo assim renderiza estilizado.
    await ilha.getByTestId('fire-toast').click();
    const toast = page.locator('[data-sarak-toast-stack="true"]');
    await expect(toast).toBeVisible();
    expect(await toast.evaluate((el) => getComputedStyle(el).position)).toBe('fixed');
    await expect(page.locator('[data-sarak-portal-scope="true"]').first()).toBeAttached();
});
