/**
 * Escrita idempotente em disco (Spec 21 §2.1): nunca sobrescreve arquivo
 * existente sem `--force`; toda chamada relata em `skipped` (relativo a
 * `rootDir`) o que foi pulado, para o resumo final do `init`.
 */
import fs from 'node:fs';
import path from 'node:path';

export function writeFileIdempotent({ rootDir, relPath, content, force, skipped }) {
    const absPath = path.join(rootDir, relPath);
    if (fs.existsSync(absPath) && !force) {
        skipped.push(relPath);
        return false;
    }
    fs.mkdirSync(path.dirname(absPath), { recursive: true });
    fs.writeFileSync(absPath, content);
    return true;
}

export function writeFileMap({ rootDir, fileMap, force }) {
    const skipped = [];
    const written = [];
    for (const [relPath, content] of fileMap.entries()) {
        const ok = writeFileIdempotent({ rootDir, relPath, content, force, skipped });
        if (ok) written.push(relPath);
    }
    return { written, skipped };
}

function copyEntry({ srcPath, rootDir, relPath, force, skipped, written }) {
    const isDirectory = fs.statSync(srcPath).isDirectory();
    if (isDirectory) {
        copyDirRecursive({ srcDir: srcPath, rootDir, relDir: relPath, force, skipped, written });
        return;
    }
    const content = fs.readFileSync(srcPath);
    const ok = writeFileIdempotent({ rootDir, relPath, content, force, skipped });
    if (ok) written.push(relPath);
}

/** Copia `srcDir` inteiro para `rootDir/relDir`, arquivo a arquivo, respeitando idempotência. */
export function copyDirRecursive({ srcDir, rootDir, relDir, force, skipped, written }) {
    for (const entry of fs.readdirSync(srcDir)) {
        copyEntry({
            srcPath: path.join(srcDir, entry),
            rootDir,
            // Posix explícito (nunca `path.join`, que usa `\` no Windows) — mantém os
            // caminhos de `written`/`skipped` consistentes com as chaves de `buildFileMap`.
            relPath: `${relDir}/${entry}`,
            force,
            skipped,
            written,
        });
    }
}
