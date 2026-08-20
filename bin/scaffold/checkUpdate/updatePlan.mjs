/**
 * O que `sarak-ui update [--latest]` (plan-10) precisa decidir ANTES de agir: para
 * onde ele vai — dentro da faixa declarada, ou a tag mais nova publicada — e quantos
 * majors o `--latest` atravessaria. Reusa a MESMA leitura de tags/faixa do `check`
 * (`tagComparison.mjs`): duas noções concorrentes de "qual é a versão publicada"
 * seriam a porta para o `check` dizer uma coisa e o `update` fazer outra.
 */
import { greatestTag, parseTagRefs, parseVersion } from './semverTags.mjs';
import { faixaDoConsumidor, filterTagsByFaixa, readInstalledVersion } from './tagComparison.mjs';

/**
 * @returns {{ ok: false, message: string } | {
 *   ok: true, installed: [number,number,number], faixa: object|null,
 *   inRange: {tag,version}|null, latest: {tag,version}, majorsSkipped: number,
 * }}
 */
export const resolveUpdatePlan = ({ context, refsCrus }) => {
    const instalada = parseVersion(readInstalledVersion(context.installedDir) ?? '');
    if (!instalada) {
        return {
            ok: false,
            message: '[sarak:update] Não consegui ler a versão instalada (package.json em node_modules) — rode a instalação primeiro.',
        };
    }

    const todasAsTags = parseTagRefs(refsCrus);
    const maisNova = greatestTag(todasAsTags);
    if (!maisNova) {
        return {
            ok: false,
            message: '[sarak:update] O remoto não publicou nenhuma tag "vX.Y.Z" — não há versão para atualizar (só commit; edite o spec à mão).',
        };
    }

    // O default de `update` (sem `--latest`) NUNCA atravessa major — é a própria razão
    // de existir uma flag separada para isso. Uma faixa declarada (`^`/`~`) já garante
    // isso sozinha; quem NÃO declara faixa (`github:` puro, `#semver:>=1.0.0`) recebe o
    // mesmo piso de segurança, calculado a partir do major hoje instalado — nunca a
    // partir do major da tag mais nova, que é exatamente o que `--latest` existe para
    // liberar.
    const faixa = faixaDoConsumidor(context.spec);
    const faixaEfetiva = faixa ?? { operador: '^', major: instalada[0], minor: instalada[1] };
    const inRange = greatestTag(filterTagsByFaixa(todasAsTags, faixaEfetiva));

    return {
        ok: true,
        installed: instalada,
        faixa,
        inRange,
        latest: maisNova,
        majorsSkipped: Math.max(0, maisNova.version[0] - instalada[0]),
    };
};
