/**
 * Caminhos, marcadores e injeção de blocos gerados do kit `sarak-ui/` (Spec 50).
 *
 * O kit é HÍBRIDO por desenho: a prosa (regras, topologias, casos de autoria) é
 * estável e editada à mão; as LISTAS são geradas. Para que as duas convivam no
 * mesmo arquivo, o gerador só reescreve o que está entre marcadores — o resto do
 * texto é preservado byte a byte. Isso é o que permite ao `guide:check` acusar
 * "kit defasado" sem nunca sobrescrever a prosa de quem escreveu o guia.
 */

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from '../catalogAst.mjs';

export const KIT_DIR = path.join(ROOT, 'sarak-ui');
export const START_HERE = path.join(KIT_DIR, 'START-HERE.md');
export const GUIDE = path.join(KIT_DIR, 'GUIA-FRONTEND.md');
export const CATALOG = path.join(KIT_DIR, 'catalog.json');
export const VERSION = path.join(KIT_DIR, 'VERSION');
export const SKILL_DIR = path.join(KIT_DIR, 'skill');
export const SKILL_SOURCE = path.join(ROOT, '.agents', 'skills', 'ui-integra-consumidor');

export const APPENDIX_MARKER = 'SARAK-KIT:APENDICE-GERADO';
export const STAMP_MARKER = 'SARAK-KIT:CARIMBO';

const open = (marker) => `<!-- ${marker}:INICIO -->`;
const close = (marker) => `<!-- ${marker}:FIM -->`;

/**
 * Substitui o conteúdo entre `<!-- MARCA:INICIO -->` e `<!-- MARCA:FIM -->`.
 * Falha ALTO se o par não existir: um guia sem marcador nunca poderia ser mantido
 * em dia pelo gate, e um kit que mente sobre estar em dia é pior que nenhum kit.
 */
export const injectBlock = ({ content, marker, body, file }) => {
    const start = content.indexOf(open(marker));
    const end = content.indexOf(close(marker));
    if (start === -1 || end === -1 || end < start) {
        throw new Error(
            `[guide] marcador ${open(marker)} … ${close(marker)} ausente ou invertido em ${file}. ` +
                'O bloco gerado não tem onde entrar — restaure os marcadores.',
        );
    }
    const head = content.slice(0, start + open(marker).length);
    const tail = content.slice(end);
    return `${head}\n\n${body.trim()}\n\n${tail}`;
};

/** Hash de conteúdo (não de commit): estável entre commits, muda quando a API muda. */
export const kitHashOf = (catalogJson) =>
    crypto.createHash('sha256').update(catalogJson).digest('hex').slice(0, 12);

/**
 * Carimbo que o consumidor lê para saber se as cópias que ele MOVEU (guia em
 * `specs/`, skill em `.claude/skills/`) precisam ser re-sincronizadas — é o que o
 * `refreshKit.mjs` compara depois de um `npm run sarak:update`.
 */
export const renderVersionFile = ({ catalog, kitHash }) =>
    [
        '# Carimbo do kit sarak-ui/ — GERADO por `npm run guide` (não edite).',
        '# Compare com o VERSION do kit dentro de node_modules/@sarak/lib-ui-core/sarak-ui/',
        '# para saber se as cópias movidas para specs/ e .claude/skills/ estão velhas.',
        `libVersion=${catalog.lib.version}`,
        `kitSchemaVersion=${catalog.schemaVersion}`,
        `kitHash=${kitHash}`,
        `components=${Object.keys(catalog.components).length}`,
        `designTokens=${catalog.designTokens.count}`,
        `iconNames=${catalog.tokens.iconNames.length}`,
        '',
    ].join('\n');

export const renderStamp = ({ catalog, kitHash }) =>
    [
        `- **Versão da lib:** \`${catalog.lib.version}\``,
        `- **Carimbo do kit (\`kitHash\`):** \`${kitHash}\` — igual ao do arquivo \`VERSION\`.`,
        `- **Superfície desta versão:** ${Object.keys(catalog.components).length} componentes públicos · ` +
            `${catalog.designTokens.count} tokens de tema · ${catalog.tokens.cssVars.length} CSS Variables · ` +
            `${catalog.tokens.iconNames.length} ícones · ${catalog.themes.presetIds.length} temas embutidos.`,
        `- **Guias completos que viajam no pacote:** ${catalog.shippedDocs.map((doc) => `\`${doc.file}\``).join(' · ')}.`,
    ].join('\n');

/** Todos os arquivos de um diretório, recursivo, em caminhos relativos posix. */
export const listFilesRecursive = (dir, base = dir, out = []) => {
    for (const entry of fs.readdirSync(dir).sort()) {
        const full = path.join(dir, entry);
        if (fs.statSync(full).isDirectory()) listFilesRecursive(full, base, out);
        else out.push(path.relative(base, full).split(path.sep).join('/'));
    }
    return out;
};
