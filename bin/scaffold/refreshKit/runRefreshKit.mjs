/**
 * Re-sincroniza o kit `sarak-ui/` do consumidor depois de atualizar a lib (Spec 50 §7).
 *
 * O problema que ele resolve: o `START-HERE.md` manda o importador MOVER o guia para
 * `specs/` e a skill para `.claude/skills/`. Sem este passo, um `sarak:update` traria a
 * lib nova e deixaria as cópias movidas descrevendo a API velha — o pior estado
 * possível para um kit cuja premissa é "nunca desatualiza".
 *
 * Regras:
 *  - a pasta `sarak-ui/` da raiz é conteúdo GERADO: sempre sobrescrita;
 *  - as cópias movidas só são tocadas se JÁ existirem (quem não moveu não recebe nada);
 *  - nenhum arquivo do consumidor fora desses caminhos é lido ou escrito.
 */
import fs from 'node:fs';
import path from 'node:path';
import { KIT_DIR, MOVED_COPIES } from '../kitTargets.mjs';

const copyFile = (source, target) => {
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(source, target);
};

const copyTree = (sourceDir, targetDir) => {
    fs.mkdirSync(targetDir, { recursive: true });
    for (const entry of fs.readdirSync(sourceDir)) {
        const source = path.join(sourceDir, entry);
        const target = path.join(targetDir, entry);
        if (fs.statSync(source).isDirectory()) copyTree(source, target);
        else copyFile(source, target);
    }
};

const readVersion = (kitDir) => {
    const file = path.join(kitDir, 'VERSION');
    return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null;
};

const refreshMovedCopies = ({ kitSource, rootDir, refreshed }) => {
    for (const copy of MOVED_COPIES) {
        const target = path.join(rootDir, copy.to);
        if (!fs.existsSync(target)) continue;
        const source = path.join(kitSource, copy.from);
        if (!fs.existsSync(source)) continue;
        if (copy.kind === 'dir') copyTree(source, target);
        else copyFile(source, target);
        refreshed.push(copy.to);
    }
};

/**
 * @returns {{ status: 'ok'|'sem-kit', refreshed: string[], wasUpToDate: boolean }}
 */
export function runRefreshKit({ rootDir, packageRoot }) {
    const kitSource = path.join(packageRoot, KIT_DIR);
    if (!fs.existsSync(kitSource)) {
        return { status: 'sem-kit', refreshed: [], wasUpToDate: false };
    }

    const localKit = path.join(rootDir, KIT_DIR);
    const wasUpToDate = readVersion(kitSource) !== null && readVersion(kitSource) === readVersion(localKit);

    const refreshed = [];
    copyTree(kitSource, localKit);
    refreshed.push(`${KIT_DIR}/`);
    refreshMovedCopies({ kitSource, rootDir, refreshed });

    return { status: 'ok', refreshed, wasUpToDate };
}
