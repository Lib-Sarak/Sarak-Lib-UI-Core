// Agente não commita nem empurra sem autorização declarada NAQUELE comando. O
// hook de commit e o de push chamam este script como PRIMEIRO passo: se o
// ambiente carrega marcador de sessão de agente e não carrega a variável de
// autorização, o git é bloqueado antes de qualquer outro anel
// (specs/specs/17-contrato-de-operacao-git.md §2.0).
//
// -------------------------------------------------------------------------
// LIMITES DECLARADOS (R18) — o que este gate NÃO vê
// -------------------------------------------------------------------------
// 1. SÓ cobre `commit` e `push`: são os dois únicos comandos de escrita com
//    hook. Não existe hook para `add`, `stash`, `checkout`, `reset` nem
//    `merge` — um agente pode executá-los sem passar por aqui.
// 2. Um agente pode escrever a variável de autorização por conta própria. A
//    trava transforma o acidente em ato deliberado; NÃO impede intenção.
// 3. Agente cujo marcador não está em AGENT_SESSION_MARKERS passa. A lista
//    tem só os marcadores medidos num shell de agente (2026-10-02): os de
//    outros agentes não foram medidos e, por isso, não entram.
// 4. Marcador vazio conta como ausente: o terminal do dono não carrega
//    nenhum, e uma variável definida mas vazia não identifica sessão.
// 5. Não roda na CI: o runner não tem sessão de agente, e a decisão aqui é
//    sobre quem digita o comando, não sobre o que o commit contém.
// -------------------------------------------------------------------------
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Variáveis que o ambiente de um agente carrega e o terminal do dono não.
export const AGENT_SESSION_MARKERS = ['CLAUDECODE', 'AI_AGENT', 'CLAUDE_CODE_SESSION_ID'];

// Escrita na frente do comando (`SARAK_GIT_ESCRITA_AUTORIZADA=1 git commit …`),
// nunca exportada: a autorização vale para aquele comando e para nenhum outro.
export const AUTHORIZATION_VAR = 'SARAK_GIT_ESCRITA_AUTORIZADA';

function isSet(env, name) {
    const value = env[name];
    return typeof value === 'string' && value.trim().length > 0;
}

/**
 * @param {Record<string, string | undefined>} env
 * @returns {{blocked: boolean, markers: string[]}}
 */
export function decideAgentGitWrite(env) {
    const markers = AGENT_SESSION_MARKERS.filter((name) => isSet(env, name));
    const authorized = isSet(env, AUTHORIZATION_VAR);
    return { blocked: markers.length > 0 && !authorized, markers };
}

function printBlock(markers) {
    console.log('');
    console.log('⛔ GIT BLOQUEADO — sessão de agente tentou escrever no Git sem autorização.');
    console.log(`   Regra violada : agente não commita nem empurra sem autorização declarada naquele comando`);
    console.log('                   (specs/specs/17-contrato-de-operacao-git.md §2.0)');
    console.log(`   Motivo        : o ambiente carrega ${markers.join(', ')}, marcador de sessão de agente,`);
    console.log(`                   e não carrega ${AUTHORIZATION_VAR}.`);
    console.log('   Como o dono autoriza: o dono digita o commit/push ele mesmo, no terminal dele — ou pede ao');
    console.log('   agente, naquela conversa, e o agente escreve a variável NA FRENTE do comando, sem exportá-la:');
    console.log(`     bash        : ${AUTHORIZATION_VAR}=1 git commit -m "..."`);
    console.log(`     PowerShell  : $env:${AUTHORIZATION_VAR}='1'; git commit -m "..."; Remove-Item Env:${AUTHORIZATION_VAR}`);
    console.log('   A autorização vale para aquele ato, não para os seguintes.');
}

function main() {
    console.log('--- check-agent-git-write ---');
    const { blocked, markers } = decideAgentGitWrite(process.env);
    if (!blocked) {
        console.log('[OK] Nenhum marcador de sessão de agente sem autorização.');
        process.exit(0);
    }
    printBlock(markers);
    process.exit(1);
}

const isMain = path.resolve(fileURLToPath(import.meta.url)) === path.resolve(process.argv[1] || '');
if (isMain) {
    main();
}
