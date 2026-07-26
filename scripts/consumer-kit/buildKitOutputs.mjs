/**
 * Plano de saída do kit: `Map<caminhoAbsoluto, conteúdo>`.
 *
 * Uma função só, usada pelos DOIS modos do gerador — escrever (`npm run guide`) e
 * conferir (`npm run guide:check`). É essa unicidade que torna o gate honesto: o
 * check compara exatamente o que a geração escreveria, sem regra paralela.
 */

import fs from 'node:fs';
import path from 'node:path';
import { buildKitCatalog } from './buildKitCatalog.mjs';
import { renderAppendix } from './renderAppendix.mjs';
import {
    APPENDIX_MARKER,
    CATALOG,
    GUIDE,
    SKILL_DIR,
    SKILL_SOURCE,
    STAMP_MARKER,
    START_HERE,
    VERSION,
    injectBlock,
    kitHashOf,
    listFilesRecursive,
    renderStamp,
    renderVersionFile,
} from './kitFiles.mjs';

const readOrFail = (file, what) => {
    if (!fs.existsSync(file)) {
        throw new Error(`[guide] ${what} não encontrado: ${file}. O kit precisa da prosa estável para injetar o gerado.`);
    }
    return fs.readFileSync(file, 'utf-8');
};

/**
 * A skill do consumidor é ESPELHO da fonte autoritativa em `.agents/skills/` — nunca
 * uma segunda cópia editável. Espelhar aqui é o que impede o kit de shippar uma skill
 * defasada: qualquer edição na fonte sem `npm run guide` deixa o `guide:check` vermelho.
 */
const skillMirror = (outputs) => {
    for (const relative of listFilesRecursive(SKILL_SOURCE)) {
        outputs.set(path.join(SKILL_DIR, relative), fs.readFileSync(path.join(SKILL_SOURCE, relative), 'utf-8'));
    }
};

export const buildKitOutputs = () => {
    const catalog = buildKitCatalog();
    const catalogJson = `${JSON.stringify(catalog, null, 2)}\n`;
    const kitHash = kitHashOf(catalogJson);

    const outputs = new Map();
    outputs.set(CATALOG, catalogJson);
    outputs.set(VERSION, renderVersionFile({ catalog, kitHash }));
    outputs.set(
        GUIDE,
        injectBlock({
            content: readOrFail(GUIDE, 'GUIA-FRONTEND.md'),
            marker: APPENDIX_MARKER,
            body: renderAppendix(catalog),
            file: 'sarak-ui/GUIA-FRONTEND.md',
        }),
    );
    outputs.set(
        START_HERE,
        injectBlock({
            content: readOrFail(START_HERE, 'START-HERE.md'),
            marker: STAMP_MARKER,
            body: renderStamp({ catalog, kitHash }),
            file: 'sarak-ui/START-HERE.md',
        }),
    );
    skillMirror(outputs);

    return { catalog, kitHash, outputs };
};
