/**
 * Verifica a convenção de prefixo dos nomes entregues pelo barril público.
 *
 * -------------------------------------------------------------------------
 * LIMITES DECLARADOS (R18) — o que este gate NÃO vê
 * -------------------------------------------------------------------------
 * 1. Lê `dist/index.d.ts`, não o código-fonte. Um `dist/` desatualizado faz a
 *    verificação medir o passado: export novo ainda não construído pode passar
 *    sem ser visto. Por isso este gate roda depois de `public-types:check`, no
 *    ponto em que o build já produziu o `.d.ts` atual.
 * 2. Classifica pelo formato do nome: PascalCase, constante SCREAMING_SNAKE,
 *    hook iniciado por `use` ou função camelCase. Não consulta o tipo declarado
 *    nem decide se o nome é bom; apenas cobra a convenção de cada formato.
 * 3. Lê somente a última linha agrupada `export { ... };` do `.d.ts` gerado e
 *    trata o nome depois de `as` como o nome importável. Se o bundler mudar esse
 *    formato, a análise textual precisa mudar junto.
 * -------------------------------------------------------------------------
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PUBLIC_PREFIX_EXCLUSIONS } from '../../allowlists/publicPrefixExclusions.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const DIST_INDEX_DTS = path.join(ROOT, 'dist', 'index.d.ts');
const EXPORT_BLOCK_RE = /^export \{(.*)\};$/;
const IDENTIFIER_RE = /^[A-Za-z_$][\w$]*$/;

export function parsePublicExportNames(dtsContent) {
    const finalLine = dtsContent.trim().split(/\r?\n/).at(-1) ?? '';
    const exportBlock = EXPORT_BLOCK_RE.exec(finalLine);
    if (!exportBlock) {
        return { names: [], error: 'a última linha não contém o bloco agrupado `export { ... };`.' };
    }

    const names = exportBlock[1]
        .split(',')
        .map((entry) => entry.trim().replace(/^type\s+/, ''))
        .filter(Boolean)
        .map((entry) => {
            const alias = entry.match(/\bas\s+([A-Za-z_$][\w$]*)$/);
            return alias ? alias[1] : entry;
        });

    const invalidName = names.find((name) => !IDENTIFIER_RE.test(name));
    if (invalidName) {
        return { names: [], error: 'o nome exportado `' + invalidName + '` não é um identificador reconhecido.' };
    }

    return { names, error: null };
}

export function classifyPublicName(name) {
    if (/^[A-Z][A-Za-z0-9]*$/.test(name)) {
        return { species: 'PascalCase', conforms: name.startsWith('Sarak') };
    }

    if (/^[A-Z][A-Z0-9_]*$/.test(name)) {
        return { species: 'constante SCREAMING_SNAKE', conforms: name.startsWith('SARAK_') };
    }

    if (name.startsWith('use')) {
        return { species: 'hook', conforms: true };
    }

    if (/^[a-z][A-Za-z0-9]*$/.test(name)) {
        const isNamespaced = name.startsWith('sarak') || name.includes('Sarak');
        return { species: 'função camelCase', conforms: isNamespaced };
    }

    return { species: 'formato de nome não reconhecido', conforms: false };
}

export function runPublicPrefixCheck({ distIndexDts = DIST_INDEX_DTS, dtsContent, exclusions = PUBLIC_PREFIX_EXCLUSIONS } = {}) {
    if (typeof dtsContent !== 'string') {
        if (!fs.existsSync(distIndexDts)) {
            return {
                names: [],
                violations: [],
                staleExclusions: [],
                missingReasons: [],
                error: `${path.relative(ROOT, distIndexDts).split(path.sep).join('/')} não existe — rode \`npm run build\` antes.`,
            };
        }
        dtsContent = fs.readFileSync(distIndexDts, 'utf8');
    }

    const parsed = parsePublicExportNames(dtsContent);
    if (parsed.error) {
        return { names: [], violations: [], staleExclusions: [], missingReasons: [], error: parsed.error };
    }

    const exportedNames = new Set(parsed.names);
    const violations = parsed.names
        .map((name) => ({ name, ...classifyPublicName(name) }))
        .filter(({ name, conforms }) => !conforms && !Object.prototype.hasOwnProperty.call(exclusions, name));
    const staleExclusions = Object.keys(exclusions).filter(
        (name) => !exportedNames.has(name) || classifyPublicName(name).conforms,
    );
    const missingReasons = Object.entries(exclusions)
        .filter(([, reason]) => typeof reason !== 'string' || reason.trim().length === 0)
        .map(([name]) => name);

    return { names: parsed.names, violations, staleExclusions, missingReasons, error: null };
}

function main() {
    console.log('--- check-public-prefix ---');
    const { names, violations, staleExclusions, missingReasons, error } = runPublicPrefixCheck();

    if (error) {
        console.error(`[ERROR] ${error}`);
        process.exit(1);
    }

    for (const { name, species } of violations) {
        console.error(`[ERROR] ${name} (${species}) não segue a convenção de prefixo.`);
    }
    for (const name of staleExclusions) {
        console.error(`[ERROR] Exceção obsoleta em publicPrefixExclusions.mjs: ${name}.`);
    }
    for (const name of missingReasons) {
        console.error(`[ERROR] Exceção sem motivo em publicPrefixExclusions.mjs: ${name}.`);
    }

    const problemCount = violations.length + staleExclusions.length + missingReasons.length;
    if (problemCount > 0) {
        process.exit(1);
    }

    console.log(`[prefix:check] ${names.length} nomes exportados seguem a convenção; allowlist em dia.`);
}

const isMain = path.resolve(fileURLToPath(import.meta.url)) === path.resolve(process.argv[1] || '');
if (isMain) main();
