// Gate de contrato (plan-43): os identificadores de API que
// `docs/persistencia-de-tema.md` cita — `persistence.onSave`, `persistence.onLoad`,
// `theme.onSave`, `customThemes`, `saveTheme` — continuam (a) existindo na
// superfície pública da lib e (b) citados no documento. Sem este gate, uma
// refatoração que renomeie qualquer um deles deixa o documento mentindo em
// silêncio — foi exatamente a ausência desse tipo de amarração que motivou a
// plan-43 (§2.1 dela: tipos existem, a receita não, e nada prendia os dois).
//
// -------------------------------------------------------------------------
// LIMITES DECLARADOS (R18) — o que este gate NÃO vê
// -------------------------------------------------------------------------
// 1. NÃO verifica o DDL (`docs/schema/*.sql`) contra o payload — e não pode:
//    a coluna que guarda `design`/`state_design` é jsonb/TEXT opaco, e o
//    conteúdo dela é justamente o que a coluna não descreve
//    (docs/persistencia-de-tema.md §2). O DDL só se prova executando-o.
// 2. É TEXTUAL, não semântico. Confirma que o NOME do identificador aparece
//    dentro do bloco certo (`persistence?: {…}`, `theme?: {…}`, a interface
//    do contexto) — não confere assinatura, tipo de retorno nem JSDoc. Uma
//    assinatura que mudasse de forma incompatível sem renomear o campo
//    passaria batido aqui; é o `tsc --noEmit` quem pega isso.
// 3. A extração de bloco conta chaves `{`/`}` de forma ingênua (não é um
//    parser de TypeScript) — assume que toda chave aberta dentro de um
//    comentário/string do arquivo aparece em par balanceado. Vale para o
//    estado atual de `types.ts` (as únicas chaves em JSDoc ali são de
//    template `${...}`, sempre balanceadas); uma chave desbalanceada
//    quebraria a extração e o gate falharia ABERTO — acusaria identificador
//    ausente — nunca fechado (nunca deixaria passar em silêncio).
// 4. Escopo fixo: só os 5 identificadores desta plan, hardcoded na lista
//    abaixo. Não generaliza para "todo identificador citado em qualquer
//    doc" — cada par documento↔API novo precisa da própria entrada.
// -------------------------------------------------------------------------
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const DOC_FILE = path.join(ROOT, 'docs', 'persistencia-de-tema.md');

export const IDENTIFIERS = [
    {
        label: 'persistence.onSave',
        file: 'src/core/Provider/types.ts',
        blockStart: /persistence\?:\s*\{/,
        memberRe: /\bonSave\?:/,
    },
    {
        label: 'persistence.onLoad',
        file: 'src/core/Provider/types.ts',
        blockStart: /persistence\?:\s*\{/,
        memberRe: /\bonLoad\?:/,
    },
    {
        label: 'theme.onSave',
        file: 'src/core/Provider/types.ts',
        blockStart: /\btheme\?:\s*\{/,
        memberRe: /\bonSave\?:/,
    },
    {
        label: 'saveTheme',
        file: 'src/core/Provider/types.ts',
        blockStart: /interface\s+SarakUIContextType\s*\{/,
        memberRe: /\bsaveTheme:/,
    },
    {
        label: 'customThemes',
        file: 'src/core/Provider/providerProps.ts',
        blockStart: null,
        memberRe: /\bcustomThemes\?:/,
    },
];

/** Extrai o bloco `{ … }` que começa no primeiro `{` após `startRe`, contando
 *  chaves. Devolve `null` se `startRe` não casar ou se o bloco nunca fechar. */
export function extractBlock(content, startRe) {
    const match = startRe.exec(content);
    if (!match) return null;
    const openIdx = content.indexOf('{', match.index);
    if (openIdx === -1) return null;

    let depth = 0;
    for (let i = openIdx; i < content.length; i++) {
        if (content[i] === '{') depth++;
        else if (content[i] === '}') {
            depth--;
            if (depth === 0) return content.slice(openIdx, i + 1);
        }
    }
    return null;
}

/** Os 5 identificadores existem, cada um dentro do bloco esperado, na fonte. */
export function checkSourceDeclares({ root = ROOT, identifiers = IDENTIFIERS } = {}) {
    const problems = [];
    for (const id of identifiers) {
        const file = path.join(root, id.file);
        if (!fs.existsSync(file)) {
            problems.push(`${id.label}: ${id.file} não existe.`);
            continue;
        }
        const content = fs.readFileSync(file, 'utf8');
        const scope = id.blockStart ? extractBlock(content, id.blockStart) : content;
        if (id.blockStart && scope === null) {
            problems.push(`${id.label}: bloco não encontrado em ${id.file} — a abertura do bloco mudou de forma?`);
            continue;
        }
        if (!id.memberRe.test(scope)) {
            problems.push(`${id.label}: identificador não encontrado em ${id.file} — foi renomeado ou removido?`);
        }
    }
    return problems;
}

/** Os 5 identificadores continuam citados no documento — o documento não parou
 *  de descrever nenhuma das portas que promete descrever. */
export function checkDocMentionsIdentifiers({ docFile = DOC_FILE, identifiers = IDENTIFIERS, root = ROOT } = {}) {
    const relDoc = path.relative(root, docFile).split(path.sep).join('/');
    if (!fs.existsSync(docFile)) {
        return [`${relDoc} não existe — o contrato do dado não está documentado.`];
    }
    const doc = fs.readFileSync(docFile, 'utf8');
    const problems = [];
    for (const id of identifiers) {
        if (!doc.includes(id.label)) {
            problems.push(`${id.label}: não citado em ${relDoc}.`);
        }
    }
    return problems;
}

function main() {
    console.log('--- check-persistence-doc-identifiers (plan-43) ---');
    const problems = [...checkSourceDeclares(), ...checkDocMentionsIdentifiers()];

    if (problems.length === 0) {
        console.log(`[OK] Os ${IDENTIFIERS.length} identificadores citados em docs/persistencia-de-tema.md existem na superfície pública e continuam documentados.`);
        process.exit(0);
    }

    console.log(`[ERROR] ${problems.length} problema(s):`);
    problems.forEach((p) => console.log(`  - ${p}`));
    process.exit(1);
}

const isMain = path.resolve(fileURLToPath(import.meta.url)) === path.resolve(process.argv[1] || '');
if (isMain) {
    main();
}
