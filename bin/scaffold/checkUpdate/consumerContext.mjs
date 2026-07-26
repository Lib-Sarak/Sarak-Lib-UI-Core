/**
 * Descobre ONDE o consumidor está, subindo a árvore (Spec 51 — L3/D3).
 *
 * Antes, `runCheckUpdate` exigia `package.json` E `package-lock.json` no MESMO
 * diretório. Num monorepo isso nunca acontece: o pacote que declara a dependência
 * é `packages/<algo>/` e o lockfile mora na raiz do workspace — o comando falhava
 * com "não encontrados" mesmo estando tudo certo (achado real, 2026-07-26).
 *
 * Regras da busca:
 *  - o `package.json` relevante é o primeiro, subindo, que DECLARA a dependência
 *    (não o primeiro que existir — num monorepo o de cima quase nunca é o certo);
 *  - o lockfile é o primeiro, subindo a partir daí, de qualquer gerenciador;
 *  - o pacote instalado é procurado em `node_modules/<nome>` subindo (hoisting).
 */
import fs from 'node:fs';
import path from 'node:path';
import { ancestorDirs, detectPackageManager } from '../packageManager.mjs';

export const PKG_NAME = '@sarak/lib-ui-core';

const LOCKFILES = ['pnpm-lock.yaml', 'yarn.lock', 'package-lock.json'];

export const readJsonNoBom = (file) => JSON.parse(fs.readFileSync(file, 'utf8').replace(/^﻿/, ''));

const specFromPackageJson = (pkg, pkgName) =>
    pkg.dependencies?.[pkgName] ?? pkg.devDependencies?.[pkgName] ?? null;

const findDeclaringPackage = ({ startDir, pkgName }) => {
    for (const dir of ancestorDirs(startDir)) {
        const pkgPath = path.join(dir, 'package.json');
        if (!fs.existsSync(pkgPath)) continue;
        let pkg;
        try {
            pkg = readJsonNoBom(pkgPath);
        } catch {
            continue;
        }
        const spec = specFromPackageJson(pkg, pkgName);
        if (spec) return { dir, pkg, spec };
    }
    return null;
};

const findLockfile = (startDir) => {
    for (const dir of ancestorDirs(startDir)) {
        for (const file of LOCKFILES) {
            const full = path.join(dir, file);
            if (fs.existsSync(full)) return { file, full, dir };
        }
    }
    return null;
};

const findInstalledDir = ({ startDir, pkgName }) => {
    for (const dir of ancestorDirs(startDir)) {
        const candidate = path.join(dir, 'node_modules', ...pkgName.split('/'));
        if (fs.existsSync(candidate)) return candidate;
    }
    return null;
};

/**
 * @returns {{ ok: false, message: string } | { ok: true, packageDir, packageJson, spec, lockfile, installedDir, manager }}
 */
export const resolveConsumerContext = ({ startDir = process.cwd(), pkgName = PKG_NAME } = {}) => {
    const declaring = findDeclaringPackage({ startDir, pkgName });
    if (!declaring) {
        return {
            ok: false,
            message:
                `[sarak:check] Não achei nenhum package.json (deste diretório para cima) que declare "${pkgName}". ` +
                'Rode dentro do projeto/pacote que consome a biblioteca.',
        };
    }

    return {
        ok: true,
        packageDir: declaring.dir,
        packageJson: declaring.pkg,
        packageName: declaring.pkg.name ?? null,
        spec: declaring.spec,
        lockfile: findLockfile(declaring.dir),
        installedDir: findInstalledDir({ startDir: declaring.dir, pkgName }),
        manager: detectPackageManager({ startDir: declaring.dir }),
    };
};
