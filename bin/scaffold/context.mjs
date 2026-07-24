/**
 * Contexto derivado do próprio pacote instalado (nunca do usuário): a versão da
 * lib e as `peerDependencies` (fonte única — nunca reescritas à mão aqui).
 * `bin/scaffold/context.mjs` vive em `<pacote>/bin/scaffold/`, então a raiz do
 * pacote é 2 níveis acima.
 *
 * O starter padrão (Spec 45) não usa mais `templates/app-starter.manifest.json`
 * (o Shell nasce dos módulos registrados, não de um manifesto) — o template
 * segue publicado (`SARAK_STARTER_MANIFEST`) para quem quiser usar o motor de
 * manifesto (Spec 11) como recurso opcional, só não é mais lido aqui.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PACKAGE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

export function loadInitContext({ packageRoot = PACKAGE_ROOT } = {}) {
    const libPackageJson = JSON.parse(fs.readFileSync(path.join(packageRoot, 'package.json'), 'utf8'));
    const skillsSourceDir = path.join(packageRoot, '.agents', 'skills');

    return {
        libVersion: libPackageJson.version,
        peerDependencies: libPackageJson.peerDependencies ?? {},
        skillsSourceDir,
    };
}
