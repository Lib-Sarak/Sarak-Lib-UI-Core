/**
 * Gate de PARIDADE DO BARRIL PÚBLICO (Spec 40.1 — L1).
 *
 * Contraparte INVERSA do `RegistryParity.test.tsx`:
 *  - o RegistryParity cobra que todo export público é ALCANÇÁVEL via manifesto;
 *  - este gate cobra que todo componente CONSUMIDOR-FACING (registrado em
 *    `NATIVE_COMPONENTS`) está EXPORTADO no barril público `src/index.ts` —
 *    o componente E o seu tipo `<Nome>Props`, quando esse tipo existe.
 *
 * Foi a AUSÊNCIA deste gate que deixou o `SarakLink` e depois os 6 inputs básicos
 * (SarakInput/Select/Textarea/Slider/Switch/Search) viverem só no Registry do motor
 * de manifesto sem chegar ao consumidor React — resolvidos a conta-gotas, um por
 * importação prática. Com o gate, remover (ou esquecer) um export consumidor-facing
 * derruba o build.
 *
 * Fonte da verdade: as CHAVES de `NATIVE_COMPONENTS` (todo símbolo consumidor-facing
 * já é registrado ali) menos a ALLOWLIST declarada (`barrelExclusions.mjs`, com motivo).
 *
 * Uso: `node scripts/check-barrel-parity.mjs` (relatório) | `--check` (exit 1 se faltar).
 * Roda no `npm run build` (gate permanente) e é reusado por `BarrelParity.test.ts`.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import {
    BARREL_VALUE_EXCLUSIONS,
    BARREL_PROPS_EXCLUSIONS,
} from './barrelExclusions.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'src');
const INDEX = path.join(SRC, 'index.ts');

const CANDIDATE_SUFFIXES = ['.ts', '.tsx', '/index.ts', '/index.tsx'];

/** Resolve um specifier relativo (`./x`) a um arquivo real do src. Externo → null. */
const resolveModule = (fromFile, specifier) => {
    if (!specifier.startsWith('.')) return null; // pacote externo — fora do barril local
    const base = path.resolve(path.dirname(fromFile), specifier);
    if (fs.existsSync(base) && fs.statSync(base).isFile()) return base;
    for (const suffix of CANDIDATE_SUFFIXES) {
        const candidate = base + suffix;
        if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
    }
    return null;
};

/**
 * Conjunto de TODOS os identificadores exportados por um módulo e sua cadeia de
 * re-exports (`export *`), valores e tipos juntos (basta o nome existir). O `default`
 * NÃO é propagado por `export *` (regra do ES), então é ignorado na recursão de estrela.
 */
const collectExportedNames = (entryFile) => {
    const names = new Set();
    const visited = new Set();

    const walk = (file, viaStar) => {
        if (!file || visited.has(file)) return;
        visited.add(file);
        const source = ts.createSourceFile(
            file,
            fs.readFileSync(file, 'utf-8'),
            ts.ScriptTarget.Latest,
            true,
        );

        for (const node of source.statements) {
            // export * from './x'  |  export * as NS from './x'
            if (ts.isExportDeclaration(node) && !node.exportClause && node.moduleSpecifier) {
                const target = resolveModule(file, node.moduleSpecifier.text);
                walk(target, true);
                continue;
            }
            // export { A, type B, default as C } from './x'  |  export { A } (local)
            if (ts.isExportDeclaration(node) && node.exportClause && ts.isNamedExports(node.exportClause)) {
                for (const el of node.exportClause.elements) names.add(el.name.text);
                continue;
            }
            // export * as NS — namespace binding
            if (ts.isExportDeclaration(node) && node.exportClause && ts.isNamespaceExport(node.exportClause)) {
                names.add(node.exportClause.name.text);
                continue;
            }
            // export const/function/class/interface/type/enum NAME
            const mods = ts.canHaveModifiers(node) ? ts.getModifiers(node) ?? [] : [];
            const isExported = mods.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
            const isDefault = mods.some((m) => m.kind === ts.SyntaxKind.DefaultKeyword);
            if (!isExported || (viaStar && isDefault)) continue;
            if (ts.isVariableStatement(node)) {
                for (const decl of node.declarationList.declarations) {
                    if (ts.isIdentifier(decl.name)) names.add(decl.name.text);
                }
            } else if (
                (ts.isFunctionDeclaration(node) ||
                    ts.isClassDeclaration(node) ||
                    ts.isInterfaceDeclaration(node) ||
                    ts.isTypeAliasDeclaration(node) ||
                    ts.isEnumDeclaration(node)) &&
                node.name
            ) {
                names.add(node.name.text);
            }
        }
    };

    walk(entryFile, false);
    return names;
};

/** Chaves de NATIVE_COMPONENTS (reusa o mesmo AST do gerador de catálogo). */
const collectRegistryKeys = () => {
    const file = path.join(SRC, 'core/Manifest/Registry/nativeComponents.ts');
    const source = ts.createSourceFile(file, fs.readFileSync(file, 'utf-8'), ts.ScriptTarget.Latest, true);
    const keys = [];
    const visit = (node) => {
        if (
            ts.isVariableDeclaration(node) &&
            node.name.getText() === 'NATIVE_COMPONENTS' &&
            node.initializer
        ) {
            let literal = node.initializer;
            while (ts.isAsExpression(literal) || ts.isSatisfiesExpression(literal)) literal = literal.expression;
            if (ts.isObjectLiteralExpression(literal)) {
                for (const prop of literal.properties) {
                    if (ts.isShorthandPropertyAssignment(prop) || ts.isPropertyAssignment(prop)) {
                        keys.push(prop.name.getText());
                    }
                }
            }
        }
        ts.forEachChild(node, visit);
    };
    visit(source);
    return keys;
};

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
    const registryKeys = collectRegistryKeys();
    const existingProps = collectExistingPropsTypes();

    const missingValues = [];
    const missingProps = [];

    for (const key of registryKeys) {
        if (!BARREL_VALUE_EXCLUSIONS[key] && !exported.has(key)) missingValues.push(key);

        const propsName = `${key}Props`;
        const propsExists = existingProps.has(propsName);
        const propsExported = exported.has(propsName);
        if (propsExists && !propsExported && !BARREL_PROPS_EXCLUSIONS[key]) missingProps.push(propsName);
    }

    // Exclusões obsoletas: nome na allowlist que já está exportado (ou não é registrado).
    const registrySet = new Set(registryKeys);
    const staleValueExclusions = Object.keys(BARREL_VALUE_EXCLUSIONS).filter(
        (name) => exported.has(name) || !registrySet.has(name),
    );
    const stalePropsExclusions = Object.keys(BARREL_PROPS_EXCLUSIONS).filter((key) => {
        const propsName = `${key}Props`;
        return !registrySet.has(key) || !existingProps.has(propsName) || exported.has(propsName);
    });

    return { missingValues, missingProps, staleValueExclusions, stalePropsExclusions, registryCount: registryKeys.length };
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
