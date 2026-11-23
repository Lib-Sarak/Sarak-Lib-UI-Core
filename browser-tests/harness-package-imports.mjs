/**
 * Resolve um especificador `#interno` (campo `imports` do `package.json` do pacote dono do importador)
 * com as condições de um bundler de NAVEGADOR (`browser`, `import`, `module`, `default`) — a condição `node`
 * fica de fora. O `require.resolve` do Node escolhe a variante `node`; por isso o `vfile` (dentro do
 * react-markdown) entrava no bundle do harness com `process.cwd()`, que o harness não tem, e um consumidor
 * real com Vite resolve a variante de navegador e não tem o problema.
 */
import fs from 'node:fs';
import path from 'node:path';

const BROWSER_CONDITIONS = new Set(['browser', 'import', 'module', 'default']);

function owningPackage(importerFile) {
    let directory = path.dirname(importerFile);
    while (directory !== path.dirname(directory)) {
        const manifest = path.join(directory, 'package.json');
        if (fs.existsSync(manifest)) return { directory, manifest: JSON.parse(fs.readFileSync(manifest, 'utf8')) };
        directory = path.dirname(directory);
    }
    return undefined;
}

/** Primeiro alvo, na ordem do objeto, cuja condição um navegador aceita; recursivo para condições aninhadas. */
function pickTarget(target) {
    if (typeof target === 'string') return target;
    if (!target || typeof target !== 'object') return undefined;
    for (const [condition, nested] of Object.entries(target)) {
        if (!BROWSER_CONDITIONS.has(condition)) continue;
        const picked = pickTarget(nested);
        if (picked) return picked;
    }
    return undefined;
}

/** Caminho absoluto do alvo de `#specifier` para um navegador; `undefined` quando o pacote não o declara. */
export function resolvePackageImport(specifier, importerFile) {
    if (!specifier.startsWith('#')) return undefined;
    const owner = owningPackage(importerFile);
    const target = owner ? pickTarget(owner.manifest.imports?.[specifier]) : undefined;
    return target ? path.resolve(owner.directory, target) : undefined;
}
