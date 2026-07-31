/**
 * Plano de saída do kit do mantenedor: `Map<caminhoAbsoluto, conteúdo>`.
 *
 * Uma função só para os DOIS modos (`npm run dev-kit` e `npm run dev-kit:check`),
 * pelo mesmo motivo do kit do consumidor: o check compara exatamente o que a geração
 * escreveria, sem regra paralela. Regra paralela é como um gate passa a dizer "em dia"
 * sobre um arquivo que ninguém mais gera.
 */

import fs from 'node:fs';
import { buildDevState } from './buildDevState.mjs';
import { renderDevAppendix } from './renderDevAppendix.mjs';
import {
    DEV_APPENDIX_MARKER,
    DEV_GUIDE,
    DEV_STAMP_MARKER,
    DEV_START_HERE,
    DEV_STATE,
    injectBlock,
    kitHashOf,
    renderDevStamp,
} from './devKitFiles.mjs';

const readOrFail = (file, what) => {
    if (!fs.existsSync(file)) {
        throw new Error(
            `[dev-kit] ${what} não encontrado: ${file}. O kit do mantenedor precisa da prosa estável ` +
                'para injetar o gerado — restaure o arquivo antes de gerar.',
        );
    }
    return fs.readFileSync(file, 'utf-8');
};

export const buildDevKitOutputs = () => {
    const state = buildDevState();
    const stateJson = `${JSON.stringify(state, null, 2)}\n`;
    const devKitHash = kitHashOf(stateJson);

    const outputs = new Map();
    outputs.set(DEV_STATE, stateJson);
    outputs.set(
        DEV_GUIDE,
        injectBlock({
            content: readOrFail(DEV_GUIDE, 'GUIA-MANUTENCAO.md'),
            marker: DEV_APPENDIX_MARKER,
            body: renderDevAppendix(state),
            file: 'sarak-dev/GUIA-MANUTENCAO.md',
        }),
    );
    outputs.set(
        DEV_START_HERE,
        injectBlock({
            content: readOrFail(DEV_START_HERE, 'START-HERE.md'),
            marker: DEV_STAMP_MARKER,
            body: renderDevStamp({ state, devKitHash }),
            file: 'sarak-dev/START-HERE.md',
        }),
    );

    return { state, devKitHash, outputs };
};
