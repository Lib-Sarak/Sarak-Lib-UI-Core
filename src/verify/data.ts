import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { VerificationCatalog, VerificationData } from './types';

/**
 * Os dados que as regras leem saem do `sarak-ui/catalog.json` do PACOTE INSTALADO — o mesmo
 * arquivo que o `npm run guide` gera e o `guide:check` trava. Nenhuma lista de nome da lib mora
 * no código do kit. O caminho se acha subindo a partir deste arquivo até o `package.json` da lib,
 * e por isso funciona tanto em `dist/` (importador) quanto em `src/verify/` (testes da própria lib).
 */

const LIB_PACKAGE_NAME = '@sarak/lib-ui-core';
const SPACING_TYPE = /\bSarakLayoutGap\b/;
/** Chaves do Provider que carregam o id de um tema; um teste confere que o catálogo as declara. */
export const THEME_ID_KEYS = ['activeThemeId', 'initialTheme'] as const;

const findPackageRoot = (from: string): string => {
    let current = from;
    for (;;) {
        const candidate = path.join(current, 'package.json');
        if (fs.existsSync(candidate)) {
            const { name } = JSON.parse(fs.readFileSync(candidate, 'utf-8')) as { name?: string };
            if (name === LIB_PACKAGE_NAME) return current;
        }
        const parent = path.dirname(current);
        if (parent === current) throw new Error(`[sarak verify] não achei o pacote ${LIB_PACKAGE_NAME} a partir de ${from}.`);
        current = parent;
    }
};

const propsWithType = (
    catalog: VerificationCatalog,
    matches: (prop: { name: string; type: string }) => boolean,
): Map<string, Set<string>> => {
    const found = new Map<string, Set<string>>();
    for (const [component, info] of Object.entries(catalog.components)) {
        const names = (info.props ?? []).filter(matches).map((prop) => prop.name);
        if (names.length > 0) found.set(component, new Set(names));
    }
    return found;
};

const baseName = (name: string): string => name.replace(/^sarak/i, '').toLowerCase();

const indexBarrel = (names: string[]): Map<string, string> => {
    const byBase = new Map<string, string>();
    for (const name of names) {
        const base = baseName(name);
        if (base && !byBase.has(base)) byBase.set(base, name);
    }
    return byBase;
};

export const deriveVerificationData = (
    catalog: VerificationCatalog,
    exportKeys: string[],
): VerificationData => ({
    libName: catalog.lib.name,
    catalog,
    exportKeys,
    cssVars: new Set(catalog.tokens.cssVars),
    iconNames: new Set(catalog.tokens.iconNames),
    themeIds: new Set(catalog.themes.presetIds),
    paletteIds: new Set(catalog.verification.paletteIds),
    spacingTokens: Object.keys(catalog.tokens.spacing),
    spacingProps: propsWithType(catalog, (prop) => SPACING_TYPE.test(prop.type)),
    themeIdProps: propsWithType(catalog, (prop) => (THEME_ID_KEYS as readonly string[]).includes(prop.name)),
    barrelByBase: indexBarrel(catalog.barrelExports),
});

let cached: VerificationData | undefined;

/** Carrega (uma vez) o catálogo e o `exports` do pacote da lib. */
export const loadVerificationData = (): VerificationData => {
    if (cached) return cached;
    const root = findPackageRoot(path.dirname(fileURLToPath(import.meta.url)));
    const catalog = JSON.parse(fs.readFileSync(path.join(root, 'sarak-ui', 'catalog.json'), 'utf-8')) as VerificationCatalog;
    const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf-8')) as { exports?: Record<string, unknown> };
    cached = deriveVerificationData(catalog, Object.keys(pkg.exports ?? {}));
    return cached;
};

export { baseName };
