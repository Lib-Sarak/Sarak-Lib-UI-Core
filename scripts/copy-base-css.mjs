// Postbuild (Spec 40 §2.4): copia `src/styles/` (o Tailwind cru — `sarak-base.css`
// + os `_*.css` que ele importa via caminho relativo) para `dist/styles/`, para que
// o export público "./sarak-base.css" resolva DENTRO de `dist/` — zero pasta `src/`
// no pacote publicado (fecha o M9 PARCIAL do re-Selo: nenhum consumidor deveria ver
// `node_modules/@sarak/lib-ui-core/src/`). Copia a pasta inteira (não só o arquivo
// de entrada) porque `sarak-base.css` importa os parciais por caminho relativo —
// copiar só ele quebraria a cadeia de `@import`.
import { cpSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const SRC_DIR = path.join(ROOT, 'src', 'styles');
const DEST_DIR = path.join(ROOT, 'dist', 'styles');

function main() {
    if (!existsSync(SRC_DIR)) {
        console.error('[copy-base-css] src/styles/ não encontrado.');
        process.exitCode = 1;
        return;
    }

    cpSync(SRC_DIR, DEST_DIR, { recursive: true });
    console.log('[copy-base-css] src/styles/ copiado para dist/styles/ (export público "./sarak-base.css").');
}

main();
