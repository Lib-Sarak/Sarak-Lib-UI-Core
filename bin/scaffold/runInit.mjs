/**
 * Orquestrador do `init` (Spec 21): entrevista → contexto do pacote → gera o
 * mapa de arquivos → escreve idempotente → copia as skills de consumo →
 * resumo. Sem dependência nova (só `node:*`).
 */
import fs from 'node:fs';
import path from 'node:path';
import { collectAnswers } from './prompts.mjs';
import { validateAnswers } from './validateAnswers.mjs';
import { loadInitContext } from './context.mjs';
import { buildFileMap } from './buildFileMap.mjs';
import { buildPackageJsonUpdates } from './generators/packageJsonFields.mjs';
import { mergePackageJson, parsePackageJson } from './mergePackageJson.mjs';
import { writeFileMap, copyDirRecursive } from './fsWrite.mjs';
import { SKILLS_TO_COPY, DEFAULT_LIB_GIT_SPEC } from './constants.mjs';

function readExistingPackageJson({ rootDir }) {
    const pkgPath = path.join(rootDir, 'package.json');
    if (!fs.existsSync(pkgPath)) return null;
    return parsePackageJson(fs.readFileSync(pkgPath, 'utf8'));
}

/**
 * O `sarak:update` (Spec 39 §2.1) precisa reinstalar do MESMO spec git que o
 * consumidor já usa — nunca assumir o repositório oficial se o projeto já
 * aponta para outro (fork, mirror interno). Só cai no default na 1ª instalação
 * (`existing` ainda não tem a dependência gravada).
 */
function resolveLibGitSpec({ existing }) {
    return existing?.dependencies?.['@sarak/lib-ui-core'] ?? DEFAULT_LIB_GIT_SPEC;
}

function writePackageJson({ rootDir, ctx, force }) {
    const existing = readExistingPackageJson({ rootDir });
    const libGitSpec = resolveLibGitSpec({ existing });
    const updates = buildPackageJsonUpdates({ ctx: { ...ctx, libGitSpec } });
    const { packageJson, skipped } = mergePackageJson({ existing, updates, force });
    fs.writeFileSync(path.join(rootDir, 'package.json'), `${JSON.stringify(packageJson, null, 4)}\n`);
    return skipped;
}

function copySkills({ rootDir, ctx, force }) {
    const written = [];
    const skipped = [];
    for (const skillName of SKILLS_TO_COPY) {
        const srcDir = path.join(ctx.skillsSourceDir, skillName);
        if (!fs.existsSync(srcDir)) continue;
        for (const targetBase of ['.agents/skills', '.claude/skills']) {
            copyDirRecursive({
                srcDir,
                rootDir,
                relDir: `${targetBase}/${skillName}`,
                force,
                skipped,
                written,
            });
        }
    }
    return { written, skipped };
}

/**
 * Executa o `init` completo. `overrideAnswers` (uso em testes/smoke) pula a
 * entrevista por completo — nenhuma pergunta é feita se já vier tudo resolvido.
 */
export async function runInit({ rootDir = process.cwd(), flags = {}, overrideAnswers = null } = {}) {
    const answers = validateAnswers(overrideAnswers ?? (await collectAnswers({ flags })));
    const ctx = loadInitContext();
    const force = Boolean(flags.force);

    const fileMap = buildFileMap({ answers });
    const { written, skipped } = writeFileMap({ rootDir, fileMap, force });
    const packageJsonSkipped = writePackageJson({ rootDir, ctx, force });
    const skills = copySkills({ rootDir, ctx, force });

    return {
        answers,
        written: [...written, ...skills.written],
        skipped: [...skipped, ...packageJsonSkipped.map((key) => `package.json:${key}`), ...skills.skipped],
    };
}
