/**
 * Gerador do KIT DO MANTENEDOR — `sarak-dev/` na raiz do repositório (Spec 14).
 *
 * Existe um kit excelente para quem CONSOME a lib (`sarak-ui/`) e, até esta spec, nada
 * equivalente para quem a EDITA. A consequência foi medida, não suposta: as skills do
 * mantenedor mandavam registrar componente novo num arquivo removido meses antes, e
 * nenhum gate acendia — documentação escrita à mão não tem quem a cobre.
 *
 * Mesmo princípio do kit do consumidor: **nunca escrever à mão o que muda.** A prosa
 * (`START-HERE.md`, `GUIA-MANUTENCAO.md`) descreve FLUXOS e é editada à mão; o estado
 * (`state.json` + os dois blocos injetados) é derivado do repositório.
 *
 * E uma verificação a mais, que o kit do consumidor não precisa ter: **ponteiro morto**.
 * Regenerar números impede o guia de mentir sobre QUANTOS; a caça a ponteiro morto
 * impede que ele cite caminho, gate ou script que não existe.
 *
 * Uso: `npm run dev-kit` (gera) | `npm run dev-kit:check` (falha se defasado ou com
 * ponteiro morto). ⚠️ `sarak-dev/` é INTERNO — não vai no tarball.
 */

import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './catalogAst.mjs';
import { buildDevKitOutputs } from './dev-kit/buildDevKitOutputs.mjs';
import { findDeadPointers } from './dev-kit/deadPointers.mjs';

const relative = (file) => path.relative(ROOT, file).split(path.sep).join('/');

const staleFiles = (outputs) =>
    [...outputs.entries()]
        .filter(([file, content]) => !fs.existsSync(file) || fs.readFileSync(file, 'utf-8') !== content)
        .map(([file]) => relative(file));

/** A prosa a auditar é o conteúdo do PLANO — não o do disco: assim o check e a geração vêem o mesmo texto. */
const prosaDe = (outputs) =>
    Object.fromEntries(
        [...outputs.entries()]
            .filter(([file]) => file.endsWith('.md'))
            .map(([file, content]) => [relative(file), content]),
    );

const reportarPonteirosMortos = (mortos) => {
    console.error(`[dev-kit] ${mortos.length} PONTEIRO(S) MORTO(S) na prosa do kit:`);
    for (const morto of mortos) {
        console.error(`  - ${morto.arquivo}:${morto.linha} — ${morto.bruto} (${morto.motivo})`);
    }
    console.error(
        'Um guia que cita o que não existe é pior que guia nenhum: ele manda o agente seguir\n' +
            'um caminho que já foi removido. Corrija a citação ou o alvo.',
    );
};

const runCheck = ({ outputs }) => {
    const stale = staleFiles(outputs);
    const mortos = findDeadPointers(prosaDe(outputs));

    if (stale.length > 0) {
        console.error(`[dev-kit:check] kit do mantenedor DEFASADO em ${stale.length} arquivo(s):`);
        for (const file of stale) console.error(`  - ${file}`);
        console.error('Rode `npm run dev-kit` e commite o resultado.');
    }
    if (mortos.length > 0) reportarPonteirosMortos(mortos);

    if (stale.length > 0 || mortos.length > 0) process.exit(1);
    console.log(`[dev-kit:check] kit em dia (${outputs.size} arquivos, 0 ponteiros mortos).`);
};

const runWrite = ({ outputs, state, devKitHash }) => {
    for (const [file, content] of outputs.entries()) {
        fs.mkdirSync(path.dirname(file), { recursive: true });
        fs.writeFileSync(file, content);
    }
    console.log(
        `[dev-kit] sarak-dev/ gerado — ${state.componentes.publicos.count} componentes públicos, ` +
            `${state.design.tokens.mapeamento.idsUnicos} tokens, ${state.gates.length} gates ` +
            `(devKitHash ${devKitHash}).`,
    );

    // Escreve primeiro e reclama depois: quem está editando o guia quer o arquivo
    // regenerado E a lista do que ficou morto, não uma coisa ou outra.
    const mortos = findDeadPointers(prosaDe(outputs));
    if (mortos.length > 0) {
        reportarPonteirosMortos(mortos);
        process.exit(1);
    }
};

const main = () => {
    const isCheck = process.argv.includes('--check');
    let plan;
    try {
        plan = buildDevKitOutputs();
    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }
    if (isCheck) runCheck(plan);
    else runWrite(plan);
};

main();
