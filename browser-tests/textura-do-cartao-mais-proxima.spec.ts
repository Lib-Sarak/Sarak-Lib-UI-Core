/**
 * Com mais de um `data-sx-card-texture-type` no caminho do cartão, vale o do ancestral MAIS PRÓXIMO, e não o da regra
 * declarada por último em `_atmosphere.css`. O `jsdom` não resolve cascata de stylesheet (specs/specs/11-testes-e-cobertura.md §7).
 *
 * LIMITES DECLARADOS (R18): lê `src/styles/_atmosphere.css` solto, sem o resto do CSS; mede só o `background-size` do
 * `::after` do cartão (32px = grade, 8px = micro-pontos, auto = sem textura). O caso X > Y > X (o mesmo tipo repetido
 * em volta de outro) não é coberto: a regra de X o descarta.
 */
import fs from 'node:fs';
import path from 'node:path';
import { test, expect, chromium, type Browser } from '@playwright/test';

const CHROMIUM_EXECUTABLE_PATH = process.env.SARAK_CHROMIUM_EXECUTABLE_PATH;
const CSS = fs.readFileSync(path.resolve('src/styles/_atmosphere.css'), 'utf8');
const ATTR = 'data-sx-card-texture-type';
const GRADE = '32px 32px';
const PONTOS = '8px 8px';
const NENHUMA = 'auto';

const tipo = (t: string) => `${ATTR}="${t}"`;
const escopo = (t: string, filho: string) => `<div class="sarak-design-scope" ${tipo(t)}>${filho}</div>`;
const caixa = (t: string, filho: string) => `<div ${tipo(t)}>${filho}</div>`;
const cartao = '<div class="sarak-card" id="c"></div>';

const CASOS: Array<[string, string, string]> = [
    ['escopo(pontos) > escopo(grade) > cartão', escopo('micro-dots', escopo('grid', cartao)), GRADE],
    ['caixa(pontos) > escopo(grade) > cartão', caixa('micro-dots', escopo('grid', cartao)), GRADE],
    ['escopo(pontos) > caixa(grade) > cartão', escopo('micro-dots', caixa('grid', cartao)), GRADE],
    ['caixa(pontos) > caixa(grade) > cartão', caixa('micro-dots', caixa('grid', cartao)), GRADE],
    ['caixa(grade) > caixa(pontos) > cartão', caixa('grid', caixa('micro-dots', cartao)), PONTOS],
    ['escopo(grade) > escopo(pontos) > cartão', escopo('grid', escopo('micro-dots', cartao)), PONTOS],
    ['um só ancestral (pontos)', caixa('micro-dots', cartao), PONTOS],
    ['sem textura no caminho', '<div>' + cartao + '</div>', NENHUMA],
];

let browser: Browser;
test.beforeAll(async () => {
    browser = await chromium.launch(CHROMIUM_EXECUTABLE_PATH ? { executablePath: CHROMIUM_EXECUTABLE_PATH } : undefined);
});
test.afterAll(async () => {
    await browser.close();
});

for (const [nome, html, esperado] of CASOS) {
    test(`o ancestral mais próximo manda: ${nome}`, async () => {
        const page = await browser.newPage();
        await page.setContent(`<style>${CSS}</style>${html}`);
        const tamanho = await page.evaluate(() => getComputedStyle(document.getElementById('c')!, '::after').backgroundSize);
        await page.close();
        expect(tamanho).toBe(esperado);
    });
}
