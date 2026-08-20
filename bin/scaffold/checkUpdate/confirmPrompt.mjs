/**
 * O "sim/não" do `sarak-ui update --latest` antes de reescrever a faixa (plan-10).
 * Mesma classe de guard de TTY do `init` (`prompts.mjs`): sem terminal e sem `--yes`,
 * falha em voz alta em vez de ficar pendurado esperando uma linha que nunca chega.
 */
import readline from 'node:readline';

const RESPOSTA_AFIRMATIVA_RE = /^s(im)?$/i;

export function assertConfirmationIsPossible({ isTTY, yes }) {
    if (isTTY || yes) return;
    throw new Error(
        '[sarak-ui update --latest] Terminal não interativo (sem TTY) e falta "--yes". ' +
            'Atravessar um major sem confirmação não é seguro — rode num terminal, ou passe ' +
            '"--yes" depois de já ter lido as notas de migração.',
    );
}

/** `yes: true` pula a pergunta (usado por automação que já confirmou fora daqui). */
export async function confirm({ question, input = process.stdin, output = process.stdout, yes = false }) {
    assertConfirmationIsPossible({ isTTY: Boolean(input.isTTY), yes });
    if (yes) return true;

    const rl = readline.createInterface({ input, output });
    try {
        const resposta = await new Promise((resolve) => rl.question(`${question} [s/N]: `, resolve));
        return RESPOSTA_AFIRMATIVA_RE.test(resposta.trim());
    } finally {
        rl.close();
    }
}
