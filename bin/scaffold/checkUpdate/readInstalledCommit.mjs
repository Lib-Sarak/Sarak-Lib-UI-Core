/**
 * Lê o commit REALMENTE instalado a partir do `package-lock.json` do consumidor
 * — a única fonte exata (Spec 39 follow-up): o `resolved` grava o SHA git que o
 * npm de fato baixou, ao contrário do `BUILD_INFO.json` (que é o commit-base do
 * build, nunca o commit publicado — ver `scripts/generate-build-info.mjs`).
 * Cobre lockfile v2/v3 (`packages["node_modules/<pkg>"]`) e o formato legado v1
 * (`dependencies[<pkg>]`).
 */
export function readInstalledCommit(lockfileContent, pkgName = '@sarak/lib-ui-core') {
    const lock = JSON.parse(lockfileContent);
    const resolved = lock.packages?.[`node_modules/${pkgName}`]?.resolved ?? lock.dependencies?.[pkgName]?.resolved;
    if (!resolved) return null;

    const hashIndex = resolved.indexOf('#');
    return hashIndex === -1 ? null : resolved.slice(hashIndex + 1);
}
