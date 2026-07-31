/**
 * Caça a PONTEIRO MORTO na prosa do `sarak-dev/` — o requisito central da Spec 14.
 *
 * O defeito que este módulo existe para impedir tem nome e histórico: as skills do
 * mantenedor passaram meses mandando registrar componente novo em
 * `src/core/Manifest/Registry/nativeComponents.ts` e rodar `RegistryParity.test.tsx`,
 * dois arquivos REMOVIDOS — e nada acendia, porque documentação escrita à mão não
 * tem gate. Regenerar números resolve metade do problema (o guia para de mentir sobre
 * QUANTOS); a outra metade é esta: o guia não pode citar o que não existe.
 *
 * O que é verificado (só o que dá para verificar sem heurística):
 *  - **caminho** do repositório em crase (`src/…`, `scripts/…`, `specs/…`, …) → existe em disco?
 *  - **gate** na forma `npm run <script>` → o script existe no `package.json`?
 *  - **comando node** na forma `node <caminho>` → o caminho existe em disco?
 *
 * O que NÃO é verificado, de propósito: prosa livre, nome de símbolo, glob (`**`) e
 * qualquer coisa fora de crase. Um verificador que adivinha produz falso-positivo, e
 * gate com falso-positivo é gate que se aprende a contornar.
 */

import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from '../catalogAst.mjs';

/** Raízes reais do repositório. Um token em crase que comece por uma delas É um caminho. */
const PREFIXOS_DE_CAMINHO = [
    'src/',
    'scripts/',
    'specs/',
    'bin/',
    'docs/',
    'sarak-ui/',
    'sarak-dev/',
    '.agents/',
    '.githooks/',
];

const CODE_SPAN = /`([^`\n]+)`/g;
const COMANDO_NPM = /^npm run ([\w:.-]+)$/;
const COMANDO_NODE = /^node\s+([^\s]+)$/;

/** `arquivo.ts:30`, `arquivo.ts:30-45` e a barra final não fazem parte do caminho. */
const normalizarCaminho = (bruto) =>
    bruto
        .replace(/^\.\//, '')
        .replace(/:\d+(-\d+)?$/, '')
        .replace(/\/$/, '');

/**
 * Metavariáveis e globs não são caminhos: `src/components/atomic/<Categoria>` é uma FORMA,
 * não um alvo. `<`/`>` são ilegais em nome de arquivo no Windows e `*` é glob, então
 * ignorá-los não esconde nenhum caminho real — só evita o falso-positivo que faria o
 * autor parar de usar crase, que é justamente o que dá poder a este gate.
 */
const PLACEHOLDER = /[<>*]/;

const pareceCaminho = (token) =>
    PREFIXOS_DE_CAMINHO.some((prefixo) => token.startsWith(prefixo)) &&
    !PLACEHOLDER.test(token) &&
    !token.includes(' ');

/**
 * Todos os ponteiros verificáveis de um markdown, com a linha em que aparecem — a
 * linha é o que torna a mensagem de erro acionável em vez de um "algo está errado".
 */
const comoCaminho = (bruto, token, linha) => {
    const alvo = normalizarCaminho(token);
    return pareceCaminho(alvo) ? { tipo: 'caminho', alvo, bruto, linha } : null;
};

export const collectPointers = (markdown) => {
    const pointers = [];
    markdown.split('\n').forEach((texto, indice) => {
        for (const [, token] of texto.matchAll(CODE_SPAN)) {
            const linha = indice + 1;
            const npm = COMANDO_NPM.exec(token);
            if (npm) {
                pointers.push({ tipo: 'gate', alvo: npm[1], bruto: token, linha });
                continue;
            }
            const node = COMANDO_NODE.exec(token);
            const pointer = node ? comoCaminho(token, node[1], linha) : comoCaminho(token, token, linha);
            if (pointer) pointers.push(pointer);
        }
    });
    return pointers;
};

const estaMorto = ({ tipo, alvo }, { scripts }) =>
    tipo === 'gate' ? !Object.prototype.hasOwnProperty.call(scripts, alvo) : !fs.existsSync(path.join(ROOT, alvo));

/**
 * @returns {Array<{arquivo, linha, tipo, bruto, motivo}>} vazio = nenhum ponteiro morto.
 */
export const findDeadPointers = (arquivos, { scripts } = {}) => {
    const tabela = scripts ?? JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf-8')).scripts;
    const mortos = [];
    for (const [arquivo, conteudo] of Object.entries(arquivos)) {
        for (const pointer of collectPointers(conteudo)) {
            if (!estaMorto(pointer, { scripts: tabela })) continue;
            mortos.push({
                arquivo,
                linha: pointer.linha,
                tipo: pointer.tipo,
                bruto: pointer.bruto,
                motivo:
                    pointer.tipo === 'gate'
                        ? `não existe script "${pointer.alvo}" no package.json`
                        : `não existe no disco: ${pointer.alvo}`,
            });
        }
    }
    return mortos;
};
