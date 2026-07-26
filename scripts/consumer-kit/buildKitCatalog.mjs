/**
 * Monta o `sarak-ui/catalog.json` — a VERDADE da versão instalada (Spec 50 §3).
 *
 * Regra nº 1 do kit: o consumidor LÊ este arquivo, nunca assume de memória. Por isso
 * ele é 100% derivado das fontes vivas: o `buildCatalog()` do pipeline de AST já
 * existente (componentes/props/tokens/ícones) + os coletores de `collectKitSources`.
 */

import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from '../catalogAst.mjs';
import { buildCatalog } from '../componentCatalog.mjs';
import {
    collectBarrelExports,
    collectBreakpoints,
    collectChromeSlots,
    collectDesignTokens,
    collectDeviceAwareComponents,
    collectExtraPublicApi,
    collectReferenceThemeIds,
    collectResponsiveProps,
    collectThemePresetIds,
} from './collectKitSources.mjs';

/** Guias de autoria que viajam no pacote — título lido do próprio arquivo (nunca à mão). */
const collectShippedDocs = () => {
    const docsDir = path.join(ROOT, 'docs');
    return fs
        .readdirSync(docsDir)
        .filter((file) => file.endsWith('.md'))
        .sort()
        .map((file) => {
            const content = fs.readFileSync(path.join(docsDir, file), 'utf-8');
            const heading = content.split('\n').find((line) => line.startsWith('# '));
            return { file: `docs/${file}`, title: heading ? heading.slice(2).trim() : file };
        });
};

const readLibVersion = () =>
    JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf-8')).version;

/** Catálogo de componentes + a API de `core/` que ele não varre, em ordem estável. */
const buildComponentSurface = (catalog, barrelExports) => {
    const extra = collectExtraPublicApi({
        barrelExports,
        known: new Set(Object.keys(catalog.components)),
    });
    const merged = { ...catalog.components, ...extra };
    return Object.fromEntries(Object.keys(merged).sort().map((name) => [name, merged[name]]));
};

export const buildKitCatalog = () => {
    const catalog = buildCatalog();
    const barrelExports = collectBarrelExports();
    const components = buildComponentSurface(catalog, barrelExports);
    const designTokens = collectDesignTokens();

    return {
        $comment:
            'GERADO por scripts/generate-consumer-kit.mjs (npm run guide) — NÃO edite à mão. ' +
            'É a verdade da versão INSTALADA da @sarak/lib-ui-core: leia daqui, nunca de memória.',
        schemaVersion: 1,
        lib: {
            name: '@sarak/lib-ui-core',
            version: readLibVersion(),
            entry: '@sarak/lib-ui-core',
            css: {
                app: 'injetado automaticamente pelo import do pacote (Modo App)',
                embedded: '@sarak/lib-ui-core/sarak-scoped.css',
            },
        },
        barrelExports,
        components,
        tokens: catalog.tokens,
        designTokens: {
            note:
                'Chaves válidas de `design` num ThemePreset. Chave/valor fora do contrato é ' +
                'descartado com console.warn pelo Design Engine — nunca vira CSS cru.',
            count: designTokens.length,
            responsiveCapable: designTokens.filter((token) => token.responsive).map((token) => token.id),
            ids: designTokens,
        },
        themes: {
            presetIds: collectThemePresetIds(),
            referenceThemeIds: collectReferenceThemeIds(),
        },
        responsive: {
            note:
                'Contrato de responsividade (Spec 40.3): zero-config. `autoAdapting` são os ' +
                'componentes que leem o dispositivo sozinhos; `responsiveProps` é o refino opcional.',
            breakpoints: collectBreakpoints(),
            autoAdapting: collectDeviceAwareComponents(Object.keys(components)),
            responsiveProps: collectResponsiveProps(components),
        },
        chromeSlots: collectChromeSlots(components),
        shippedDocs: collectShippedDocs(),
    };
};
