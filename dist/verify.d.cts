/**
 * `sarak-ui verify` — a porta de comando do kit. Liga as regras que o ESLint do importador não lê
 * (`.css`, `package.json`, o carimbo do kit) e roda fora do ESLint, na CI ou num gate próprio.
 * Sem regra ligada ele não faz nada além de dizer quais existem: nenhuma regra nasce ligada.
 */
interface VerifyCliResult {
    output: string;
    exitCode: number;
}
declare const runVerifyCli: ({ argv, cwd }: {
    argv: string[];
    cwd?: string;
}) => VerifyCliResult;

export { type VerifyCliResult, runVerifyCli };
