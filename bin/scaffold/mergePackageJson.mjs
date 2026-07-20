/**
 * Merge puro de package.json (Spec 21 §2.3). Preserva TODO campo já existente do
 * consumidor; só adiciona chaves ausentes em `scripts`/`dependencies`/
 * `devDependencies`. Sem `--force`, uma chave existente com valor divergente é
 * reportada em `skipped` e nunca sobrescrita.
 */
function mergeSection({ existingSection, incoming, sectionName, force }) {
    const merged = { ...(existingSection ?? {}) };
    const skipped = [];
    for (const [key, value] of Object.entries(incoming ?? {})) {
        const hasExisting = Object.prototype.hasOwnProperty.call(merged, key);
        if (hasExisting && !force) {
            if (merged[key] !== value) skipped.push(`${sectionName}.${key}`);
            continue;
        }
        merged[key] = value;
    }
    return { merged, skipped };
}

const BASE_PACKAGE_JSON = {
    name: 'sarak-consumer-app',
    version: '0.1.0',
    private: true,
    type: 'module',
};

/**
 * `Set-Content -Encoding utf8` do PowerShell 5 (shell default do Windows — o
 * ambiente-alvo do Golden Path) grava um BOM UTF-8 (`﻿`) no início do
 * arquivo. `JSON.parse` não tolera isso (`Unexpected token '﻿'`) e
 * derrubava o `init` no meio, com arquivos já escritos e o merge abortado —
 * mesma família de hostilidade do Windows que motivou a Spec 21 (achado real
 * de smoke test). Sempre use esta função para ler um `package.json` existente.
 */
export function parsePackageJson(content) {
    return JSON.parse(content.replace(/^﻿/, ''));
}

export function mergePackageJson({ existing, updates, force = false }) {
    const base = existing ? { ...existing } : { ...BASE_PACKAGE_JSON };
    const skipped = [];

    const scripts = mergeSection({ existingSection: base.scripts, incoming: updates.scripts, sectionName: 'scripts', force });
    const dependencies = mergeSection({ existingSection: base.dependencies, incoming: updates.dependencies, sectionName: 'dependencies', force });
    const devDependencies = mergeSection({
        existingSection: base.devDependencies,
        incoming: updates.devDependencies,
        sectionName: 'devDependencies',
        force,
    });

    skipped.push(...scripts.skipped, ...dependencies.skipped, ...devDependencies.skipped);

    return {
        packageJson: {
            ...base,
            scripts: scripts.merged,
            dependencies: dependencies.merged,
            devDependencies: devDependencies.merged,
        },
        skipped,
    };
}
