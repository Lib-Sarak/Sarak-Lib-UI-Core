/**
 * Gate de MERGE DE CLASSE no átomo.
 *
 * `SarakButton`/`SarakIconButton` CONCATENAVAM `className` (`${...} ${className}`).
 * Em Tailwind, duas utilitárias que escrevem a mesma propriedade têm a MESMA
 * especificidade — quem vence é a que aparece DEPOIS no stylesheet emitido, não a que
 * aparece depois no atributo `class`. Concatenar não sobrescreve nada, só empilha, e o
 * vencedor passa a depender da ordem de emissão do Tailwind — que é acidental. Medido no
 * `dist/sarak.css` publicado: de seis pares de utilitárias conflitantes entre um átomo
 * e um chamador típico, três resolviam contra a intenção do chamador (`normal-case` ×
 * `uppercase`, `tracking-normal` × `tracking-widest`, `w-full` × `w-max`).
 *
 * Este gate cobra que nenhum átomo de `src/components/atomic/` componha `className`
 * por concatenação de template literal — a porta correta é o helper
 * `mergeSarakClasses` (`src/components/atomic/hooks/mergeSarakClasses.ts`), que usa
 * `tailwind-merge` para que a classe do chamador VENÇA a do átomo.
 *
 * A allowlist (`gates/allowlists/classMergeExclusions.mjs`) declara, com motivo, os
 * átomos que HOJE ainda concatenam `className` — convertê-los é trabalho futuro, fora
 * do escopo deste gate.
 *
 * Uso: `node gates/scripts/contrato/check-class-merge.mjs` — toda violação é bloqueio;
 * não há modo "relatório" separado (mesmo idioma de `check-container-query-boundary.mjs`).
 *
 * -------------------------------------------------------------------------
 * LIMITES DECLARADOS (R18) — o que este gate NÃO vê
 * -------------------------------------------------------------------------
 * 1. É TEXTUAL, não por AST: procura o token `${className}` (a interpolação da prop
 *    `className` recebida) em qualquer template literal do arquivo. Um átomo que
 *    renomeie a prop na desestruturação (ex.: `className: cls`) e concatene `${cls}`
 *    escapa do detector.
 * 2. NÃO verifica ORDEM. Um arquivo que passe a usar `mergeSarakClasses`/`twMerge` mas
 *    com a `className` do chamador em posição diferente da ÚLTIMA (a regra do
 *    contrato — R10-adjacent) fica CONFORME para este gate: ele só distingue
 *    "concatena por template literal" de "usa merge", não confere qual argumento
 *    vence dentro da chamada de merge.
 * 3. Escopo é só `src/components/atomic/**` (o que esta base chama de "átomo").
 *    `src/components/Layout/`, `src/core/` e `src/features/` podem ter o mesmo
 *    defeito e não são varridos.
 * 4. `${className}` dentro de um COMENTÁRIO (não código) seria falso positivo — não
 *    ocorre hoje nos arquivos varridos (conferido manualmente), mas o detector não
 *    distingue comentário de código em texto puro.
 * -------------------------------------------------------------------------
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { CLASS_MERGE_EXCLUSIONS } from '../../allowlists/classMergeExclusions.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const ATOMIC_ROOT = path.join(ROOT, 'src', 'components', 'atomic');

const RAW_CONCAT_RE = /\$\{className\}/;

function walkAtomicFiles(dir, out = []) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (entry.name === '__tests__') continue;
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            walkAtomicFiles(full, out);
        } else if (entry.name.endsWith('.tsx')) {
            out.push(full);
        }
    }
    return out;
}

/** Todo arquivo de `src/components/atomic/` que concatena `${className}` cru. */
export function findRawClassNameConcatenation({ root = ATOMIC_ROOT, relativeTo = ROOT } = {}) {
    const found = [];
    for (const file of walkAtomicFiles(root)) {
        const content = fs.readFileSync(file, 'utf8');
        if (RAW_CONCAT_RE.test(content)) {
            found.push(path.relative(relativeTo, file).split(path.sep).join('/'));
        }
    }
    return found.sort();
}

/** Compara os violadores medidos contra a allowlist. Listas vazias = verde. */
export function runClassMergeCheck({ root = ATOMIC_ROOT, relativeTo = ROOT, exclusions = CLASS_MERGE_EXCLUSIONS } = {}) {
    const violations = findRawClassNameConcatenation({ root, relativeTo });
    const naoDeclarados = violations.filter((f) => !exclusions[f]);
    const obsoletas = Object.keys(exclusions).filter((f) => !violations.includes(f));
    return { naoDeclarados: naoDeclarados.sort(), obsoletas: obsoletas.sort() };
}

function main() {
    console.log('--- check-class-merge ---');
    const { naoDeclarados, obsoletas } = runClassMergeCheck();

    if (naoDeclarados.length > 0) {
        console.log(`[ERROR] ${naoDeclarados.length} átomo(s) concatenam className SEM allowlist:`);
        naoDeclarados.forEach((f) => console.log(`  - ${f}`));
        console.log('  Conserto: componha por mergeSarakClasses (src/components/atomic/hooks/mergeSarakClasses.ts), ou declare em gates/allowlists/classMergeExclusions.mjs com motivo.');
    }

    if (obsoletas.length > 0) {
        console.log(`[ERROR] ${obsoletas.length} exclusão(ões) OBSOLETA(S) em classMergeExclusions.mjs (o arquivo já usa merge, ou não existe mais):`);
        obsoletas.forEach((f) => console.log(`  - ${f}`));
    }

    const problems = naoDeclarados.length + obsoletas.length;
    if (problems === 0) {
        console.log(`[OK] Nenhum átomo concatena className fora da allowlist (${Object.keys(CLASS_MERGE_EXCLUSIONS).length} declarados, com motivo).`);
    } else {
        process.exit(1);
    }
}

const isMain = path.resolve(fileURLToPath(import.meta.url)) === path.resolve(process.argv[1] || '');
if (isMain) {
    main();
}
