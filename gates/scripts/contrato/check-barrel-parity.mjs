/**
 * Gate de PARIDADE DO BARRIL PÚBLICO (Spec 40.1 — L1; re-apontado na Spec 46 §3.1) —
 * resolução por TYPE CHECKER, não só presença sintática.
 *
 * Cobra que todo componente CONSUMIDOR-FACING está EXPORTADO no barril público
 * `src/index.ts` **e que o nome RESOLVE para o componente** — o componente E o seu
 * tipo `<Nome>Props`, quando esse tipo existe.
 *
 * Foi a AUSÊNCIA deste gate que deixou o `SarakLink` e depois os 6 inputs básicos
 * (SarakInput/Select/Textarea/Slider/Switch/Search) viverem só no Registry do antigo
 * motor de manifesto (#2, removido — Spec 46) sem chegar ao consumidor React —
 * resolvidos a conta-gotas, um por importação prática. Com o gate, remover (ou
 * esquecer) um export consumidor-facing derruba o build.
 *
 * **O modo de falha que a verificação por type checker fecha:** nome registrado no
 * barril não é prova de que o consumidor alcança o componente. Um átomo entrou em
 * `Navigation/`, foi exportado por `export *` do barril de categoria, e a versão
 * anterior deste gate (que só perguntava "o nome aparece em algum `export` de
 * `src/index.ts`?", por AST sintática) fechava verde — mas `src/index.ts` já tinha um
 * `export type { … SarakNavItem }` de outro módulo, e em ES/TS **export explícito
 * sombreia `export *`**: o nome resolvia só para o TIPO, e o componente ficava
 * inalcançável pelo barril público. Medido pela API do compilador
 * (`getExportsOfModule`/`getAliasedSymbol`) em 2026-09-08 — o `src/` foi consertado por
 * rename direto (ver `docs/migracoes.md`); este gate fecha a VERIFICAÇÃO, para o mesmo
 * defeito não voltar a passar em silêncio.
 *
 * Fonte da verdade dos NOMES (pós-Spec 46): `scripts/publicComponents.mjs`, que deriva
 * por AST diretamente do código-fonte de `src/components/atomic/**` +
 * `src/components/engines/**` + `src/components/Layout/**`. Fonte da verdade da
 * RESOLUÇÃO: o *type checker* do TypeScript sobre `src/index.ts` —
 * `resolveIndexExports()` segue todo alias (`export *`, `export type {}`, `export {}`)
 * até o símbolo final e diz se ele é VALOR ou só TIPO, e onde foi declarado. Exceções
 * declaradas (`barrelExclusions.mjs`, com motivo).
 *
 * Uso: `node gates/scripts/contrato/check-barrel-parity.mjs` (relatório) | `--check` (exit 1 se faltar).
 * Roda no `npm run build` (gate permanente) e é reusado por `BarrelParity.test.ts`.
 *
 * -------------------------------------------------------------------------
 * LIMITES DECLARADOS (R18) — o que este gate NÃO vê
 * -------------------------------------------------------------------------
 * 1. Categoria SEM barril de categoria só tem os `.tsx` de RAIZ varridos
 *    (`scripts/publicComponents.mjs`) — componente colocado em subpasta escapa
 *    do gate e do catálogo. Deliberado para as peças internas de `Layout/chrome/`.
 * 2. **A verificação de "o valor É o componente" (`resolvesToComponentValue`) é por
 *    PREFIXO DE CAMINHO**, não por identidade de declaração contra o arquivo exato
 *    que `publicComponents.mjs` encontrou (esse cruzamento exigiria `publicComponents.mjs`
 *    passar a expor caminho por nome, o que este gate não faz). Um valor que resolva
 *    para QUALQUER declaração dentro de `src/components/{atomic,engines,Layout}/` é
 *    aceito como "é o componente" — dois componentes de categorias diferentes com o
 *    MESMO nome exportado ainda passariam um pelo outro. Continua sendo um cruzamento
 *    muito mais fundo que o anterior (que aceitava QUALQUER declaração, componente ou
 *    não), mas não é identidade de arquivo.
 * 3. **Só a resolução do VALOR do componente passou a ser por type checker.** A
 *    checagem de `<Nome>Props` (`missingProps`) continua por AST sintática
 *    (`collectExportedNames`) — Props não tem o mesmo histórico de colisão medido, e
 *    ampliar também essa metade é escopo maior que o defeito registrado.
 * 4. `resolveIndexExports` monta um `ts.Program` real a partir do `tsconfig.json` do
 *    repositório — herda as MESMAS limitações de resolução de módulo do `tsc` (paths,
 *    `resolveJsonModule` etc.). Um `tsconfig.json` que não alcance um arquivo também
 *    tira esse arquivo da visão deste gate, exatamente como tiraria da compilação.
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

const toPosix = (p) => p.split(path.sep).join('/');

/** Opções de compilador do `tsconfig.json` do repositório — lidas uma vez, no load. */
const readRepoCompilerOptions = () => {
    const configPath = path.join(ROOT, 'tsconfig.json');
    const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
    const parsed = ts.parseJsonConfigFileContent(configFile.config, ts.sys, ROOT);
    return parsed.options;
};

export const DEFAULT_COMPILER_OPTIONS = readRepoCompilerOptions();

export const DEFAULT_COMPONENT_ROOTS = [
    path.join(SRC, 'components', 'atomic'),
    path.join(SRC, 'components', 'engines'),
    path.join(SRC, 'components', 'Layout'),
];

/**
 * Resolve, via TYPE CHECKER (não texto), a que cada export de `entryFile` aponta.
 * Segue alias — `export *`, `export type {}`, `export {}` — até o SÍMBOLO FINAL e
 * devolve, por nome, se ele é VALOR (`ts.SymbolFlags.Value`) e onde foi declarado.
 *
 * É o mecanismo que distingue export explícito sombreando `export *`:
 * `collectExportedNames` (AST sintática, `scripts/publicComponents.mjs`) só registra
 * QUE o nome apareceu num `export` — nunca PARA O QUÊ ele resolve quando dois
 * `export` declaram o mesmo nome (ES/TS: o explícito vence o `export *` em silêncio).
 */
export function resolveIndexExports(entryFile, compilerOptions = DEFAULT_COMPILER_OPTIONS) {
    const resolved = new Map();
    const program = ts.createProgram({ rootNames: [entryFile], options: compilerOptions });
    const sourceFile = program.getSourceFile(entryFile);
    if (!sourceFile) return resolved;

    const checker = program.getTypeChecker();
    const moduleSymbol = checker.getSymbolAtLocation(sourceFile);
    if (!moduleSymbol) return resolved;

    for (const symbol of checker.getExportsOfModule(moduleSymbol)) {
        const aliased = (symbol.flags & ts.SymbolFlags.Alias) !== 0 ? checker.getAliasedSymbol(symbol) : symbol;
        const isValue = (aliased.flags & ts.SymbolFlags.Value) !== 0;
        const declarationFile = aliased.declarations?.[0]?.getSourceFile().fileName ?? null;
        resolved.set(symbol.getName(), { isValue, declarationFile });
    }
    return resolved;
}

/**
 * `name` resolve, no barril, para um VALOR declarado dentro de uma das raízes de
 * componente — não só "é um export que existe" (isso um `export type` sombreando já
 * satisfaria) e não só "é um valor" (poderia ser um valor de outro lugar, sem relação
 * com o componente — a classe de defeito do `SarakTabs` duplicado, [[03-superficie-publica]] §8.1).
 */
export function resolvesToComponentValue(name, resolvedExports, componentRoots = DEFAULT_COMPONENT_ROOTS) {
    const info = resolvedExports.get(name);
    if (!info || !info.isValue || !info.declarationFile) return false;
    const declaration = toPosix(info.declarationFile);
    return componentRoots.some((root) => declaration.startsWith(`${toPosix(root)}/`));
}

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

/**
 * Executa a análise de paridade. Retorna listas de faltas (vazias = verde).
 *
 * `resolvedExports` é injetável para quem já pagou o custo de `resolveIndexExports`
 * (monta um `ts.Program` real — o item mais caro desta função) e não quer pagá-lo de
 * novo — é o caso do próprio teste do gate, que cruza o mesmo resultado contra mais de
 * uma asserção.
 */
export const runBarrelParityCheck = ({
    indexFile = INDEX,
    compilerOptions = DEFAULT_COMPILER_OPTIONS,
    componentRoots = DEFAULT_COMPONENT_ROOTS,
    resolvedExports = resolveIndexExports(indexFile, compilerOptions),
} = {}) => {
    const exported = collectExportedNames(indexFile);
    const sourceNames = collectPublicComponentNames();
    const existingProps = collectExistingPropsTypes();

    const missingValues = [];
    const missingProps = [];

    for (const key of sourceNames) {
        const resolves = resolvesToComponentValue(key, resolvedExports, componentRoots);
        if (!BARREL_VALUE_EXCLUSIONS[key] && !resolves) missingValues.push(key);

        const propsName = `${key}Props`;
        const propsExists = existingProps.has(propsName);
        const propsExported = exported.has(propsName);
        if (propsExists && !propsExported && !BARREL_PROPS_EXCLUSIONS[key]) missingProps.push(propsName);
    }

    // Exclusões obsoletas: nome na allowlist que já resolve para o componente (ou não existe mais na fonte).
    const sourceSet = new Set(sourceNames);
    const staleValueExclusions = Object.keys(BARREL_VALUE_EXCLUSIONS).filter(
        (name) => resolvesToComponentValue(name, resolvedExports, componentRoots) || !sourceSet.has(name),
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
        console.error(`\n[barrel:check] Componentes consumidor-facing cujo nome NÃO resolve para o valor em src/index.ts (ausente, sombreado por export explícito, ou resolve só para tipo):`);
        for (const n of r.missingValues) console.error(`  - ${n}  (exporte como valor, ou declare em barrelExclusions.mjs com motivo)`);
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
