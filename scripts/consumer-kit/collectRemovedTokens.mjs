/**
 * Tokens de tema que saíram do schema, em forma de dado (`catalog.json` → `designTokens.removed`).
 *
 * A fonte é a mesma que o `token-release-notes:check` obriga a manter em dia: a lista **Removidos (N)** da entrada
 * de cada versão em `docs/migracoes.md`. Cada linha dela carrega o destino depois de `→` — o nome do token que
 * ficou no lugar, ou `sem substituto`. O servidor do importador que valida o tema por lista de chaves lê daqui o
 * que deixou de aceitar e o que pedir no lugar, sem reconciliar à mão a cada versão.
 */

import fs from 'node:fs';
import { MIGRATIONS_SOURCE } from './kitFiles.mjs';

export const NO_REPLACEMENT = 'sem substituto';

const VERSION_TITLE = /^## (\d+\.\d+\.\d+)\b/;
const REMOVED_HEADING = /^\*\*Removidos \((\d+)\)\*\*\s*$/;
const REMOVED_LINE = /^- `([A-Za-z0-9_]+)` — .*? → (.+)$/;

const destinationOf = (text) => {
    const cleaned = text.trim();
    const named = /^`([A-Za-z0-9_]+)`$/.exec(cleaned);
    return named ? named[1] : cleaned;
};

/** As linhas de lista logo abaixo do título `**Removidos (N)**`, até a primeira linha que não é item. */
const listUnder = (lines, headingIndex) => {
    const items = [];
    for (let index = headingIndex + 1; index < lines.length; index += 1) {
        if (lines[index].trim() === '' && items.length === 0) continue;
        if (!lines[index].startsWith('- ')) break;
        items.push({ text: lines[index], line: index + 1 });
    }
    return items;
};

/**
 * Lê as listas **Removidos (N)** de uma seção `## X.Y.Z — ...` e devolve `{ id, removedIn, destination }` por token.
 * Falha em voz alta quando a contagem do título não bate com as linhas ou quando uma linha não diz o destino:
 * uma lista que cala sobre o que pedir no lugar é a reconciliação manual que este dado existe para acabar.
 */
export const parseRemovedTokens = (migrationsText) => {
    const lines = migrationsText.split('\n').map((line) => line.replace(/\r$/, ''));
    const removed = [];
    let version = null;
    lines.forEach((line, index) => {
        const title = VERSION_TITLE.exec(line);
        if (title) version = title[1];
        const heading = REMOVED_HEADING.exec(line);
        if (!heading || version === null) return;
        const items = listUnder(lines, index);
        if (items.length !== Number(heading[1])) {
            throw new Error(`[guide] docs/migracoes.md:${index + 1}: "Removidos (${heading[1]})" tem ${items.length} linha(s).`);
        }
        for (const item of items) {
            const match = REMOVED_LINE.exec(item.text);
            if (!match) {
                throw new Error(`[guide] docs/migracoes.md:${item.line}: token removido sem destino. Termine a linha com "→ \`nomeNovo\`" ou "→ ${NO_REPLACEMENT}".`);
            }
            removed.push({ id: match[1], removedIn: version, destination: destinationOf(match[2]) });
        }
    });
    return removed;
};

/** Os removidos de todas as versões, lidos de `docs/migracoes.md`. */
export const collectRemovedTokens = () => parseRemovedTokens(fs.readFileSync(MIGRATIONS_SOURCE, 'utf-8'));
