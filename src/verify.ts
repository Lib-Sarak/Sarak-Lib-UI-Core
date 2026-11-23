/**
 * Entrada de build do comando `sarak-ui verify` (porta de comando do kit de verificação). Não é
 * subpath do pacote: o `bin/sarak-ui.mjs` a carrega por caminho relativo, e só quando o comando roda.
 */
export { runVerifyCli } from './verify/cli';
export type { VerifyCliResult } from './verify/cli';
