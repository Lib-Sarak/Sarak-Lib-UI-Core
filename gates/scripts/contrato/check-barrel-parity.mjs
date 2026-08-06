/**
 * Gate de PARIDADE DO BARRIL PÚBLICO (Spec 40.1 — L1; re-apontado na Spec 46 §3.1).
 *
 * Cobra que todo componente CONSUMIDOR-FACING está EXPORTADO no barril público
 * `src/index.ts` — o componente E o seu tipo `<Nome>Props`, quando esse tipo existe.
 *
 * Foi a AUSÊNCIA deste gate que deixou o `SarakLink` e depois os 6 inputs básicos
 * (SarakInput/Select/Textarea/Slider/Switch/Search) viverem só no Registry do antigo
 * motor de manifesto (#2, removido — Spec 46) sem chegar ao consumidor React —
 * resolvidos a conta-gotas, um por importação prática. Com o gate, remover (ou
 * esquecer) um export consumidor-facing derruba o build.
 *
 * Fonte da verdade (pós-Spec 46): `scripts/publicComponents.mjs`, que deriva os nomes
 * por AST diretamente do código-fonte de `src/components/atomic/**` +
 * `src/components/Layout/**` — não mais do Registry do motor de manifesto (removido).
 * Exceções declaradas (`barrelExclusions.mjs`, com motivo).
 *
 * Uso: `node gates/scripts/contrato/check-barrel-parity.mjs` (relatório) | `--check` (exit 1 se faltar).
 * Roda no `npm run build` (gate permanente) e é reusado por `BarrelParity.test.ts`.
 *
 * -------------------------------------------------------------------------
 * LIMITES DECLARADOS (R18) — o que este gate NÃO vê
 * -------------------------------------------------------------------------
 * Categoria SEM barril de categoria só tem os `.tsx` de RAIZ varridos
 * (`scripts/publicComponents.mjs`) — componente colocado em subpasta escapa
 * do gate e do catálogo. Deliberado para as peças internas de `Layout/chrome/`.
 * -------------------------------------------------------------------------
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import fs from 'node:fs';
import {
    BARREL_VALUE_EXCLUSIONS,
    BARREL_PROPS_EXCLUSIONS,
} from '../../allowlists/barrelExclusions.mjs';
import { collectExportedNames, collectPublicComponentNames } from '../../../scripts/publicComponents.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const SRC = path.join(ROOT, 'src');
const INDEX = path.join(SRC, 'index.ts');

/** Nomes de interfaces/type-aliases `<X>Props` existentes em qualquer lugar do src. */
const collectExistingPropsTypes = () => {
    const found = new Set();
    const walk = (dir) => {
        for (const entry of fs.readdirSync(dir)) {
            const full = path.join(dir, entry);
            if (fs.statSync(full).isDirectory()) {
                if (entry !== '__tests__' && entry !== 'node_modules') walk(full);
            } else if (/\.tsx?$/.test(entry) && !entry.includes('.test.')) {
                const text = fs.readFileSync(full, 'utf-8');
                for (const m of text.matchAll(/(?:interface|type)\s+([A-Z]\w*Props)\b/g)) found.add(m[1]);
            }
        }
    };
    walk(SRC);
    return found;
};

/** Executa a análise de paridade. Retorna listas de faltas (vazias = verde). */
export const runBarrelParityCheck = () => {
    const exported = collectExportedNames(INDEX);
    const sourceNames = collectPublicComponentNames();
    const existingProps = collectExistingPropsTypes();

    const missingValues = [];
    const missingProps = [];

    for (const key of sourceNames) {
        if (!BARREL_VALUE_EXCLUSIONS[key] && !exported.has(key)) missingValues.push(key);

        const propsName = `${key}Props`;
        const propsExists = existingProps.has(propsName);
        const propsExported = exported.has(propsName);
        if (propsExists && !propsExported && !BARREL_PROPS_EXCLUSIONS[key]) missingProps.push(propsName);
    }

    // Exclusões obsoletas: nome na allowlist que já está exportado (ou não existe mais na fonte).
    const sourceSet = new Set(sourceNames);
    const staleValueExclusions = Object.keys(BARREL_VALUE_EXCLUSIONS).filter(
        (name) => exported.has(name) || !sourceSet.has(name),
    );
    const stalePropsExclusions = Object.keys(BARREL_PROPS_EXCLUSIONS).filter((key) => {
        const propsName = `${key}Props`;
        return !sourceSet.has(key) || !existingProps.has(propsName) || exported.has(propsName);
    });

    return { missingValues, missingProps, staleValueExclusions, stalePropsExclusions, registryCount: sourceNames.length };
};

const main = () => {
    const isCheck = process.argv.includes('--check');
    const r = runBarrelParityCheck();
    const problems =
        r.missingValues.length + r.missingProps.length + r.staleValueExclusions.length + r.stalePropsExclusions.length;

    if (r.missingValues.length) {
        console.error(`\n[barrel:check] Componentes consumidor-facing NÃO exportados em src/index.ts:`);
        for (const n of r.missingValues) console.error(`  - ${n}  (exporte, ou declare em barrelExclusions.mjs com motivo)`);
    }
    if (r.missingProps.length) {
        console.error(`\n[barrel:check] Tipos Props existentes mas NÃO exportados:`);
        for (const n of r.missingProps) console.error(`  - ${n}`);
    }
    if (r.staleValueExclusions.length) {
        console.error(`\n[barrel:check] Exclusões de valor OBSOLETAS (já exportadas ou não registradas): ${r.staleValueExclusions.join(', ')}`);
    }
    if (r.stalePropsExclusions.length) {
        console.error(`\n[barrel:check] Exclusões de Props OBSOLETAS: ${r.stalePropsExclusions.join(', ')}`);
    }

    if (isCheck && problems > 0) {
        console.error(`\n[barrel:check] FALHOU — ${problems} problema(s) de paridade de barril público.\n`);
        process.exit(1);
    }
    console.log(
        `[barrel:check] ${r.registryCount} componentes registrados; ` +
            `${problems === 0 ? 'barril em dia (0 faltas).' : `${problems} problema(s).`}`,
    );
};

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('check-barrel-parity.mjs')) {
    main();
}
