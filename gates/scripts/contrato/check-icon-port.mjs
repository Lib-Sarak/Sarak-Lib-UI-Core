/**
 * PORTA ÚNICA DE ÍCONES — os componentes da biblioteca usam `SarakIcon` ou
 * recebem elementos do consumidor, sem escolher uma família de terceiros.
 *
 * -------------------------------------------------------------------------
 * LIMITES DECLARADOS (R18) — o que este gate NÃO vê
 * -------------------------------------------------------------------------
 * 1. Analisa apenas arquivos `.ts` e `.tsx` dentro de `src/`. Arquivos `.js`,
 *    `.jsx` e arquivos fora de `src/` ficam fora da verificação.
 * 2. Reconhece caminhos de pacote estaticamente declarados em imports,
 *    reexports, `require()` e `import()`. Um nome de pacote montado em runtime
 *    ou uma dependência indireta através de um módulo local escapa.
 * 3. Exclui `src/components/atomic/Icon/families/**` e
 *    `src/features/DesignEngine/**`: as famílias são a implementação da porta;
 *    o Design Engine é a ferramenta de autoria e mantém seus próprios ícones.
 * 4. Compara o nome exato do pacote ou seu subpath (`lucide-react/...`). Um
 *    pacote alternativo com outro nome não é classificado como família base.
 * -------------------------------------------------------------------------
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const SOURCE_ROOT = path.join(ROOT, 'src');
const ICON_PACKAGES = new Set(['lucide-react', '@phosphor-icons/react', '@tabler/icons-react']);
const ALLOWED_PREFIXES = [
    'components/atomic/Icon/families/',
    'features/DesignEngine/',
];
const SOURCE_FILE_PATTERN = /\.tsx?$/;

function isAllowedSource(relativePath) {
    const normalized = relativePath.replaceAll('\\', '/');
    return ALLOWED_PREFIXES.some((prefix) => normalized.startsWith(prefix));
}

function isOutsideSourceRoot(relativePath) {
    const normalized = relativePath.replaceAll('\\', '/');
    return normalized === '..' || normalized.startsWith('../') || path.isAbsolute(relativePath);
}

function packageNameFromModule(moduleNode) {
    return moduleNode && ts.isStringLiteralLike(moduleNode) ? moduleNode.text : undefined;
}

function isIconFamilyPackage(packageName) {
    return [...ICON_PACKAGES].some((name) => packageName === name || packageName.startsWith(`${name}/`));
}

function findDirectIconImports(sourceText, fileName) {
    const sourceFile = ts.createSourceFile(fileName, sourceText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    const found = [];

    const record = (moduleNode, node) => {
        const packageName = packageNameFromModule(moduleNode);
        if (!packageName || !isIconFamilyPackage(packageName)) return;
        const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
        found.push({ packageName, line: line + 1 });
    };

    const visit = (node) => {
        if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
            record(node.moduleSpecifier, node);
        } else if (ts.isImportEqualsDeclaration(node)
            && ts.isExternalModuleReference(node.moduleReference)) {
            record(node.moduleReference.expression, node);
        } else if (ts.isCallExpression(node)
            && (node.expression.kind === ts.SyntaxKind.ImportKeyword
                || (ts.isIdentifier(node.expression) && node.expression.text === 'require'))
            && node.arguments.length > 0) {
            record(node.arguments[0], node);
        }
        ts.forEachChild(node, visit);
    };

    visit(sourceFile);
    return found;
}

/** Finds statically named family imports in an in-memory or on-disk source map. */
export function findForbiddenIconImports({ files, relativeTo = '.' } = {}) {
    const violations = [];
    for (const [fileName, sourceText] of Object.entries(files ?? {})) {
        const relativePath = path.relative(relativeTo, fileName).replaceAll('\\', '/');
        if (isOutsideSourceRoot(relativePath)
            || !SOURCE_FILE_PATTERN.test(fileName)
            || isAllowedSource(relativePath)) continue;
        for (const found of findDirectIconImports(sourceText, fileName)) {
            violations.push({ file: fileName.replaceAll('\\', '/'), ...found });
        }
    }
    return violations.sort((left, right) => left.file.localeCompare(right.file) || left.line - right.line);
}

function collectSourceFiles(directory, files = {}) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
        const fullPath = path.join(directory, entry.name);
        if (entry.isDirectory()) {
            collectSourceFiles(fullPath, files);
        } else if (SOURCE_FILE_PATTERN.test(entry.name)) {
            files[path.relative(SOURCE_ROOT, fullPath).split(path.sep).join('/')] = fs.readFileSync(fullPath, 'utf8');
        }
    }
    return files;
}

export function runIconPortCheck({ sourceRoot = SOURCE_ROOT } = {}) {
    return findForbiddenIconImports({ files: collectSourceFiles(sourceRoot), relativeTo: '.' });
}

function main() {
    process.stdout.write('--- check-icon-port ---\n');
    const violations = runIconPortCheck();
    if (violations.length === 0) {
        process.stdout.write('[OK] Nenhum pacote de ícones é importado fora da porta e das exceções declaradas.\n');
        return;
    }

    process.stderr.write(`[ERROR] ${violations.length} import(s) direto(s) de família de ícones fora da porta:\n`);
    violations.forEach(({ file, line, packageName }) => process.stderr.write(`  - ${file}:${line} — ${packageName}\n`));
    process.exitCode = 1;
}

const isMain = path.resolve(fileURLToPath(import.meta.url)) === path.resolve(process.argv[1] || '');
if (isMain) main();
