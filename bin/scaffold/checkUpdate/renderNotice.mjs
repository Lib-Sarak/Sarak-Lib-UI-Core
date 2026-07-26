/**
 * O AVISO no terminal do consumidor (Spec 51 — L1).
 *
 * Contrato de ruído: em dia → **nenhuma linha**. Aviso que aparece sempre vira aviso
 * que ninguém lê. Só fala quando há ação a tomar, e a linha mais importante é o
 * COMANDO — no gerenciador daquele projeto, porque foi copiar um comando npm para um
 * workspace pnpm que quebrou o repositório do consumidor (a origem desta spec).
 *
 * Sem moldura fechada de propósito: caixa com borda à direita desalinha com acento e
 * com caminho longo do Windows. Separadores horizontais dão o mesmo destaque e nunca
 * quebram.
 */
const LARGURA = 74;
const linha = (char) => '  ' + char.repeat(LARGURA);

/** Instrução genérica honesta para gerenciador cujo comando não foi validado (§ regra dura). */
const FALLBACK =
    'Reinstale a dependência com o gerenciador de pacotes deste projeto ' +
    '(o comando exato não foi validado para ele).';

export const renderNotice = ({ titulo, linhas, comando, comandoValidado = true }) => {
    const out = ['', linha('─'), `  ${titulo}`, ''];
    for (const item of linhas) out.push(`  ${item}`);
    out.push('', '  Para atualizar:', `      ${comando ?? FALLBACK}`);
    if (comando && !comandoValidado) {
        out.push('', '  (comando não validado para este gerenciador — confira antes de rodar)');
    }
    out.push(linha('─'), '');
    return out.join('\n');
};
