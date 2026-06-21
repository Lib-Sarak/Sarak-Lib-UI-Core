/**
 * Conferência Funcional do Manifesto — verify_manifest_contract (Spec 34)
 *
 * Análogo funcional do `verify_parity.ts`: garante, de forma DETERMINÍSTICA (AST +
 * leitura de catálogo, nunca inspeção visual), a Paridade Funcional do contrato do
 * Manifesto. É o motor invocado pelo 7º sub-auditor (`auditor_manifesto.mjs`).
 *
 * As 3 Fontes da Verdade (Spec 34, Regra 1) confrontadas nesta onda:
 *   A — Contrato TS:   chaves de diretiva da interface `ManifestNode` (types.ts);
 *                      chaves nativas do `NATIVE_COMPONENTS` (ComponentType deriva delas).
 *   B — Runtime:       catálogo `RESERVED_DIRECTIVES` + donos `DIRECTIVE_OWNERS`;
 *                      cada `type` nativo tem componente importado (resolvível).
 *   C — Catálogo:      `RESERVED_DIRECTIVES` / `DIRECTIVE_OWNERS` (directives.ts).
 *
 * Violações que BLOQUEIAM (Regra 2): diretiva-fantasma, tipo órfão, `any` em arquivo
 * de contrato funcional, capacidade sem teste.
 */

import fs from 'fs';
import path from 'path';
import ts from 'typescript';
import { fileURLToPath } from 'url';
import {
    RESERVED_DIRECTIVES,
    DIRECTIVE_OWNERS,
    STRUCTURAL_KEYS,
} from '../../../../src/core/Manifest/directives';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../../../');
const manifestDir = path.join(rootDir, 'src/core/Manifest');

interface Violation {
    type: 'phantom_directive' | 'orphan_component' | 'any_violation' | 'no_test';
    name: string;
    location?: string;
    message: string;
}

const violations: Violation[] = [];

const readSource = (filePath: string): ts.SourceFile => {
    const content = fs.readFileSync(filePath, 'utf8');
    return ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true);
};

const symmetricDiff = (a: string[], b: string[]): { onlyA: string[]; onlyB: string[] } => {
    const setB = new Set(b);
    const setA = new Set(a);
    return {
        onlyA: a.filter((x) => !setB.has(x)),
        onlyB: b.filter((x) => !setA.has(x)),
    };
};

// ---------------------------------------------------------------------------
// A. Extrair chaves da interface ManifestNode (AST)
// ---------------------------------------------------------------------------

const extractManifestNodeKeys = (): string[] => {
    const source = readSource(path.join(manifestDir, 'types.ts'));
    const keys: string[] = [];

    const visit = (node: ts.Node): void => {
        if (ts.isInterfaceDeclaration(node) && node.name.text === 'ManifestNode') {
            for (const member of node.members) {
                if (ts.isPropertySignature(member) && member.name && ts.isIdentifier(member.name)) {
                    keys.push(member.name.text);
                }
            }
        }
        ts.forEachChild(node, visit);
    };

    visit(source);
    return keys;
};

// ---------------------------------------------------------------------------
// A. Extrair chaves e imports de NATIVE_COMPONENTS (AST)
// ---------------------------------------------------------------------------

const extractNativeComponents = (): { keys: string[]; imported: Set<string> } => {
    const source = readSource(path.join(manifestDir, 'Registry/nativeComponents.ts'));
    const keys: string[] = [];
    const imported = new Set<string>();

    const visit = (node: ts.Node): void => {
        if (ts.isImportDeclaration(node) && node.importClause?.namedBindings && ts.isNamedImports(node.importClause.namedBindings)) {
            for (const el of node.importClause.namedBindings.elements) {
                imported.add(el.name.text);
            }
        }
        if (ts.isVariableDeclaration(node) && node.name.getText() === 'NATIVE_COMPONENTS' && node.initializer) {
            let init: ts.Node = node.initializer;
            if (ts.isAsExpression(init)) init = init.expression;
            if (ts.isObjectLiteralExpression(init)) {
                for (const prop of init.properties) {
                    if (prop.name && ts.isIdentifier(prop.name)) keys.push(prop.name.text);
                }
            }
        }
        ts.forEachChild(node, visit);
    };

    visit(source);
    return { keys, imported };
};

// ---------------------------------------------------------------------------
// Coletar todos os arquivos .ts/.tsx de contrato (exclui __tests__)
// ---------------------------------------------------------------------------

const collectContractFiles = (dir: string, acc: string[] = []): string[] => {
    for (const entry of fs.readdirSync(dir)) {
        const full = path.join(dir, entry);
        if (fs.statSync(full).isDirectory()) {
            if (!full.includes('__tests__')) collectContractFiles(full, acc);
        } else if (['.ts', '.tsx'].includes(path.extname(full))) {
            acc.push(full);
        }
    }
    return acc;
};

const scanAnyInContracts = (): void => {
    const files = collectContractFiles(manifestDir);
    for (const file of files) {
        const source = readSource(file);
        const visit = (node: ts.Node): void => {
            if (node.kind === ts.SyntaxKind.AnyKeyword) {
                const { line } = source.getLineAndCharacterOfPosition(node.getStart());
                violations.push({
                    type: 'any_violation',
                    name: 'any',
                    location: `${path.relative(rootDir, file)}:${line + 1}`,
                    message: `'any' proibido em arquivo de contrato funcional.`,
                });
            }
            ts.forEachChild(node, visit);
        };
        visit(source);
    }
};

// ---------------------------------------------------------------------------
// Cobertura: cada peça de contrato precisa de um teste correspondente
// ---------------------------------------------------------------------------

const REQUIRED_TESTS = [
    // Fundação (Onda 0)
    'validateNode.test.ts',
    'SarakDataStore.test.ts',
    'ComponentRegistry.test.tsx',
    'SarakManifestRenderer.test.tsx',
    // Motor de Dados Vivo (Onda 1)
    'interpolate.test.ts', // Spec 24 — data-binding e pipes
    'expandRenderFor.test.ts', // Spec 23 — motor de repetição
    'useDataSource.test.tsx', // Spec 31 — fonte de dados declarativa
];

const checkTestCoverage = (): void => {
    const testsDir = path.join(manifestDir, '__tests__');
    const existing = fs.existsSync(testsDir) ? fs.readdirSync(testsDir) : [];
    for (const required of REQUIRED_TESTS) {
        if (!existing.includes(required)) {
            violations.push({
                type: 'no_test',
                name: required,
                message: `Capacidade sem teste: faltando __tests__/${required}.`,
            });
        }
    }
};

// ---------------------------------------------------------------------------
// Execução
// ---------------------------------------------------------------------------

const run = (): void => {
    console.log('--- Conferência Funcional do Manifesto (Paridade Funcional) ---\n');

    // 1. Diretivas: ManifestNode (Contrato) ↔ RESERVED_DIRECTIVES (Catálogo)
    const nodeKeys = extractManifestNodeKeys();
    const structural = new Set<string>(STRUCTURAL_KEYS);
    const nodeDirectives = nodeKeys.filter((k) => !structural.has(k));
    const catalog = [...RESERVED_DIRECTIVES];

    const dirDiff = symmetricDiff(nodeDirectives, catalog);
    for (const ghost of dirDiff.onlyA) {
        violations.push({
            type: 'phantom_directive',
            name: ghost,
            location: 'src/core/Manifest/types.ts',
            message: `Diretiva-fantasma: "${ghost}" existe em ManifestNode mas não está no catálogo RESERVED_DIRECTIVES.`,
        });
    }
    for (const missing of dirDiff.onlyB) {
        violations.push({
            type: 'phantom_directive',
            name: missing,
            location: 'src/core/Manifest/directives.ts',
            message: `Diretiva no catálogo sem campo tipado em ManifestNode: "${missing}".`,
        });
    }

    // 2. Catálogo ↔ Donos: toda diretiva reservada tem um dono declarado.
    const owners = Object.keys(DIRECTIVE_OWNERS);
    const ownerDiff = symmetricDiff(catalog, owners);
    for (const name of [...ownerDiff.onlyA, ...ownerDiff.onlyB]) {
        violations.push({
            type: 'phantom_directive',
            name,
            location: 'src/core/Manifest/directives.ts',
            message: `Catálogo e DIRECTIVE_OWNERS divergem para a diretiva "${name}".`,
        });
    }

    // 3. Componentes: NATIVE_COMPONENTS (Contrato/Runtime) — sem tipo órfão.
    const { keys: nativeKeys, imported } = extractNativeComponents();
    if (nativeKeys.length === 0) {
        violations.push({
            type: 'orphan_component',
            name: 'NATIVE_COMPONENTS',
            message: 'Nenhum componente nativo registrado — ComponentType ficaria vazio.',
        });
    }
    for (const key of nativeKeys) {
        if (!imported.has(key)) {
            violations.push({
                type: 'orphan_component',
                name: key,
                location: 'src/core/Manifest/Registry/nativeComponents.ts',
                message: `Tipo órfão: "${key}" está em NATIVE_COMPONENTS mas não foi importado (sem componente real).`,
            });
        }
    }

    // 4. Zero `any` nos arquivos de contrato.
    scanAnyInContracts();

    // 5. Cobertura de testes por capacidade.
    checkTestCoverage();

    // Relatório
    console.log(`  🧩 Diretivas (ManifestNode): ${nodeDirectives.length}`);
    console.log(`  📖 Catálogo (RESERVED_DIRECTIVES): ${catalog.length}`);
    console.log(`  🧱 Componentes nativos (ComponentType): ${nativeKeys.length}\n`);

    if (violations.length === 0) {
        console.log(`✅ SUCESSO: Paridade Funcional garantida! ${nodeDirectives.length} diretivas e ${nativeKeys.length} componentes nativos validados nas 3 fontes da verdade (Contrato TS ↔ Runtime ↔ Catálogo).`);
        process.exit(0);
    }

    for (const v of violations) {
        console.error(`❌ [${v.type}] ${v.message}${v.location ? `  (${v.location})` : ''}`);
    }
    console.error(`\n❌ Conferência Funcional Falhou: ${violations.length} violação(ões) de paridade funcional.`);
    process.exit(1);
};

run();
