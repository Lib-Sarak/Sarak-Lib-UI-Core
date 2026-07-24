/**
 * Combina os geradores puros num `Map<caminhoRelativo, conteúdo>` — o `init`
 * (`runInit.mjs`) só escreve esse mapa em disco (idempotente). `package.json`
 * fica DE FORA do mapa: é tratado à parte via `mergePackageJson` (merge, não
 * sobrescrita direta).
 *
 * Starter padrão (Spec 45): um único mapa de arquivos — front Vite puro no
 * modelo módulos-plugin (`SarakUIProvider`+`SarakShell`+módulo de exemplo),
 * sem backend. Substitui as 3 variantes por stack (vite-express/next/
 * frontend-only) da Spec 21, que existiam só para gerar servidor — sem
 * backend, a distinção deixou de fazer sentido.
 */
import { buildViteConfig } from './generators/viteConfig.mjs';
import { buildTsconfig } from './generators/tsconfig.mjs';
import { buildIndexHtml } from './generators/indexHtml.mjs';
import { buildMainTsx } from './generators/mainTsx.mjs';
import { buildExampleModuleTsx } from './generators/exampleModule.mjs';

const asJson = (value) => `${JSON.stringify(value, null, 4)}\n`;

/** Ponto único: monta o mapa de arquivos completo do starter padrão. */
export function buildFileMap({ answers }) {
    return new Map([
        ['index.html', buildIndexHtml()],
        ['vite.config.ts', buildViteConfig({ answers })],
        ['tsconfig.json', asJson(buildTsconfig())],
        ['src/main.tsx', buildMainTsx({ answers })],
        ['src/modules/ExampleModule.tsx', buildExampleModuleTsx()],
    ]);
}
