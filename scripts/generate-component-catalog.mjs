/**
 * Gerador do Catálogo de Componentes — fonte da verdade DERIVADA do código-fonte.
 *
 * Sucessor do antigo `generate-manifest-catalog.mjs` (Spec 46 — remoção do motor de
 * manifesto/#2). O catálogo deixou de documentar a superfície de AUTORIA DE JSON
 * (actions do Dispatcher, pipes de binding, diretivas reservadas, regras de
 * `validation`) — esses conceitos eram exclusivos do motor removido. Passa a
 * documentar a API PÚBLICA REACT do modelo oficial (#1/#3): componentes + props,
 * tokens de espaçamento semânticos e as CSS Variables públicas do Design Engine.
 *
 * Extrai por AST (compilador TypeScript):
 *  - os componentes consumidor-facing (`scripts/publicComponents.mjs`);
 *  - as props reais de cada componente (interface/type `<Nome>Props`);
 *  - os tokens de espaçamento semânticos (`core/Design/resolveToken.ts`);
 *  - as CSS Variables públicas (namespace `--sarak-*`) do Design Engine.
 *
 * Saídas: docs/component-catalog.json (máquina) e docs/component-catalog.md (humano/IA).
 *
 * Uso: `node scripts/generate-component-catalog.mjs` (gera) | `--check` (falha se defasado).
 * O `--check` roda no `npm run build` — catálogo defasado = build vermelho.
 *
 * Desde a Spec 50 a montagem vive em `componentCatalog.mjs` (e os coletores de AST em
 * `catalogAst.mjs`), para que o gerador do kit do consumidor (`sarak-ui/`) reuse o MESMO
 * pipeline em vez de reimplementar a travessia. Este arquivo é só a CLI.
 */

import fs from 'node:fs';
import { DOCS_DIR, JSON_OUT, MD_OUT, buildCatalog, renderMarkdown } from './componentCatalog.mjs';

const main = () => {
    const isCheck = process.argv.includes('--check');
    const catalog = buildCatalog();
    const json = `${JSON.stringify(catalog, null, 2)}\n`;
    const markdown = renderMarkdown(catalog);

    if (isCheck) {
        const current = (file) => (fs.existsSync(file) ? fs.readFileSync(file, 'utf-8') : '');
        if (current(JSON_OUT) !== json || current(MD_OUT) !== markdown) {
            console.error(
                '[catalog:check] docs/component-catalog.{json,md} DEFASADOS em relação ao código. ' +
                    'Rode `npm run catalog` e commite o resultado.',
            );
            process.exit(1);
        }
        console.log('[catalog:check] catálogo em dia.');
        return;
    }

    fs.mkdirSync(DOCS_DIR, { recursive: true });
    fs.writeFileSync(JSON_OUT, json);
    fs.writeFileSync(MD_OUT, markdown);
    console.log(`[catalog] ${Object.keys(catalog.components).length} componentes → docs/component-catalog.{json,md}`);
};

main();
