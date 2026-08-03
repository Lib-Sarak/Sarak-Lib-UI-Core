/**
 * Gate ZERO-MARCA (Spec 49 — L2).
 *
 * A lib NUNCA estampa a própria marca ('Sarak Lib'/'Sarak OS'/'Sarak AI') no produto
 * do consumidor. Este gate falha o build se qualquer literal de marca da lib aparecer
 * como TEXTO de saída (JSX text ou string literal) em `src/`, fora da ALLOWLIST
 * explícita dos painéis INTERNOS do Design Engine (ferramenta de autoria da própria
 * lib — Kitchen Sink, abas de customização — não embutidos pelo consumidor).
 *
 * Escaneia por AST (TypeScript compiler API), não por regex de arquivo inteiro, para
 * não acusar falso-positivo em comentário (ex.: notas de migração que DOCUMENTAM a
 * correção citando a string antiga) — só nós `StringLiteral`/`NoSubstitutionTemplateLiteral`/
 * `TemplateLiteral` (partes fixas) e `JsxText` contam.
 *
 * Origem: a Spec 47 fechou a identidade da PÁGINA mas os SINKS hardcoded (`SarakEmptyState`,
 * `SarakSearch`, `ChatHeader`, `SarakChat`, `SarakShell`) ficaram de fora — a Spec 49 fecha
 * os sinks e este gate impede o carimbo de voltar em silêncio.
 *
 * Uso: `node gates/scripts/contrato/check-zero-brand.mjs` (relatório) | `--check` (exit 1 se achar).
 *
 * -------------------------------------------------------------------------
 * LIMITE DECLARADO (R18) — o que este gate NÃO vê
 * -------------------------------------------------------------------------
 * 1. ESCOPO: apenas `src/`. NÃO varre os outros artefatos que chegam ao
 *    consumidor — `sarak-ui/templates/` (o código que o `init` copia para o
 *    projeto dele), `bin/scaffold/generators/` (que gera esse código) e
 *    `docs/` (que viaja no tarball).
 * 2. Dentro de `src/`, ficam de fora `.d.ts`, `__tests__/`, `.test.` e `.spec.`
 *    (ver `isScannableFile`).
 *
 * EXPOSIÇÃO MEDIDA (plan-06, 2026-08-03): **ZERO violações reais**.
 * `sarak-ui/templates/` e `bin/` estão limpos. Os únicos acertos fora de `src/`
 * são 2 arquivos de `docs/` (`identidade-do-host.md`, `migracoes.md`), e neles a
 * marca aparece em PROSA que documenta a própria correção — exatamente o
 * falso-positivo que a varredura por AST existe para evitar dentro de `src/`.
 *
 * Por isso o limite é DECLARADO em vez de fechado: ampliar para markdown
 * exigiria distinguir prosa de texto renderizado, e o ganho medido hoje é zero.
 * O que muda a conta é template `.tsx` novo em `sarak-ui/templates/` — aí o
 * escopo passa a valer, e isso é trabalho da plan-12.
 * -------------------------------------------------------------------------
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const SRC = path.join(ROOT, 'src');

/** Literais de marca da lib proibidos como TEXTO renderizado (Spec 49 §2/§5). */
const BRAND_LITERALS = ['Sarak Lib', 'Sarak OS', 'Sarak AI'];

/**
 * Painéis INTERNOS do Design Engine — ferramenta de autoria da própria lib, nunca
 * embutida pelo consumidor no produto dele (Spec 49 §2 "Fora de escopo"). Caminhos
 * relativos a `src/`, com o motivo de cada exclusão.
 */
const ALLOWLIST = new Set([
    // Kitchen Sink — vitrine interna de todos os componentes/temas, usada só pelo
    // painel de customização do Design Engine dentro da própria lib.
    'features/DesignEngine/Canvas/KitchenSinkPreview.tsx',
    // Abas do CustomizationPanel (interno) — citam "Sarak OS" como texto de exemplo
    // dentro da ferramenta de autoria, não no produto do consumidor.
    'features/DesignEngine/Panels/LanguageTab.tsx',
    'features/DesignEngine/Panels/LayoutTab.tsx',
]);

const isScannableFile = (file) =>
    /\.tsx?$/.test(file) &&
    !file.endsWith('.d.ts') &&
    !file.includes('.test.') &&
    !file.includes('.spec.') &&
    !file.split(path.sep).includes('__tests__');

const walkFiles = (dir, out = []) => {
    for (const entry of fs.readdirSync(dir)) {
        const full = path.join(dir, entry);
        const stat = fs.statSync(full);
        if (stat.isDirectory()) {
            if (entry === 'node_modules' || entry === '__tests__') continue;
            walkFiles(full, out);
        } else if (isScannableFile(full)) {
            out.push(full);
        }
    }
    return out;
};

const literalsIn = (text) => BRAND_LITERALS.filter((literal) => text.includes(literal));

/** Varre um arquivo por AST; devolve as ocorrências (linha + literal achado). */
const scanFile = (file) => {
    const source = ts.createSourceFile(file, fs.readFileSync(file, 'utf-8'), ts.ScriptTarget.Latest, true);
    const hits = [];

    const visit = (node) => {
        let text = null;
        if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
            text = node.text;
        } else if (ts.isJsxText(node)) {
            text = node.getText(source);
        } else if (ts.isTemplateHead(node) || ts.isTemplateMiddle(node) || ts.isTemplateTail(node)) {
            text = node.text;
        }

        if (text) {
            for (const literal of literalsIn(text)) {
                const { line } = source.getLineAndCharacterOfPosition(node.getStart(source));
                hits.push({ literal, line: line + 1 });
            }
        }

        ts.forEachChild(node, visit);
    };

    visit(source);
    return hits;
};

/** Executa a varredura completa. Retorna as violações + exclusões obsoletas. */
export const runZeroBrandCheck = () => {
    const files = walkFiles(SRC);
    const violations = [];
    const seenAllowlist = new Set();

    for (const file of files) {
        const rel = path.relative(SRC, file).split(path.sep).join('/');
        if (ALLOWLIST.has(rel)) {
            seenAllowlist.add(rel);
            continue;
        }
        for (const hit of scanFile(file)) {
            violations.push({ file: rel, line: hit.line, literal: hit.literal });
        }
    }

    const staleAllowlist = [...ALLOWLIST].filter((rel) => !seenAllowlist.has(rel));

    return { violations, staleAllowlist, scannedCount: files.length };
};

const main = () => {
    const isCheck = process.argv.includes('--check');
    const { violations, staleAllowlist, scannedCount } = runZeroBrandCheck();

    if (violations.length) {
        console.error(`\n[zero-brand:check] Marca da lib renderizada como TEXTO em componente consumidor-facing:`);
        for (const v of violations) console.error(`  - ${v.file}:${v.line} — "${v.literal}"`);
    }
    if (staleAllowlist.length) {
        console.error(`\n[zero-brand:check] Entradas da ALLOWLIST obsoletas (arquivo não existe mais): ${staleAllowlist.join(', ')}`);
    }

    const problems = violations.length + staleAllowlist.length;
    if (isCheck && problems > 0) {
        console.error(`\n[zero-brand:check] FALHOU — ${problems} problema(s).\n`);
        process.exit(1);
    }
    console.log(
        `[zero-brand:check] ${scannedCount} arquivo(s) varrido(s); ` +
            `${problems === 0 ? 'zero marca da lib fora da allowlist.' : `${problems} problema(s).`}`,
    );
};

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('check-zero-brand.mjs')) {
    main();
}
