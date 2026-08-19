/**
 * As notas de `docs/migracoes.md` entre a versão instalada e a mais nova — o que o
 * `sarak-ui update --latest` (plan-10) mostra ANTES de pedir confirmação.
 *
 * O arquivo é prosa, mais recente primeiro, sem um índice por versão — a única âncora
 * confiável é a entrada que CITA a versão instalada no próprio título (ex.: "## 3.0.0
 * — …"). Medido nesta plan: as tags `v5.0.0` e `v6.0.0` não têm entrada assim ancorada
 * — sem âncora não há como delimitar o intervalo sem adivinhar, e adivinhar aqui
 * produziria exatamente o que a REGRA DURA proíbe (mandar o consumidor confiar num
 * corte que não foi medido). Por isso `bounded: false` devolve TODAS as entradas em
 * vez de um subconjunto fabricado.
 */
const ENTRY_SEPARATOR = /\n---\n/;

/**
 * O arquivo é lido do disco — Windows/`git config core.autocrlf` pode gravá-lo com
 * CRLF. Normalizar ANTES do split é obrigatório: `\r\n---\r\n` não bate em
 * `ENTRY_SEPARATOR`, e sem isso o arquivo inteiro vira UMA entrada só (achado medido
 * na prova em consumidor real desta plan, contra o `docs/migracoes.md` do próprio
 * repositório, que está em CRLF neste checkout).
 */
const normalizeLineEndings = (text) => text.replace(/\r\n/g, '\n');

/** Cada entrada do arquivo, do próprio "## título" até o separador seguinte. */
export const splitEntries = (migracoesText) =>
    normalizeLineEndings(migracoesText)
        .split(ENTRY_SEPARATOR)
        .map((bloco) => bloco.trim())
        .filter((bloco) => bloco.startsWith('## '));

const titleOf = (entry) => entry.slice(0, entry.indexOf('\n')).replace(/^##\s*/, '').trim();

/** A entrada é a ÂNCORA de um major se o título citar `X.0.0` por extenso. */
const anchorsMajor = (entry, major) => new RegExp(`\\b${major}\\.0\\.0\\b`).test(titleOf(entry));

/**
 * @returns {{ bounded: true, notes: string[] } | { bounded: false, notes: string[] }}
 * `bounded: false` quando a âncora da versão instalada não foi encontrada — as
 * `notes` viram TODAS as entradas do arquivo, e quem chama tem de avisar que o corte
 * não pôde ser feito (nunca finge um intervalo que não mediu).
 */
export const extractMigrationNotes = ({ migracoesText, installedMajor }) => {
    const entries = splitEntries(migracoesText);
    const anchorIndex = entries.findIndex((entry) => anchorsMajor(entry, installedMajor));
    if (anchorIndex === -1) return { bounded: false, notes: entries };
    return { bounded: true, notes: entries.slice(0, anchorIndex) };
};
