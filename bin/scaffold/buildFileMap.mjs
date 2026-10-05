/**
 * Combina os geradores puros num `Map<caminhoRelativo, conteúdo>`; o `init`
 * escreve esse mapa em disco de forma idempotente. `package.json` fica fora do
 * mapa e é tratado à parte por `mergePackageJson`.
 */
import { buildViteConfig } from './generators/viteConfig.mjs';
import { buildTsconfig } from './generators/tsconfig.mjs';
import { buildIndexHtml } from './generators/indexHtml.mjs';
import { buildMainTsx } from './generators/mainTsx.mjs';
import { buildAppTsx } from './generators/appTsx.mjs';

const asJson = (value) => `${JSON.stringify(value, null, 4)}\n`;

export function buildFileMap({ answers }) {
    return new Map([
        ['index.html', buildIndexHtml()],
        ['vite.config.ts', buildViteConfig({ answers })],
        ['tsconfig.json', asJson(buildTsconfig())],
        ['src/main.tsx', buildMainTsx({ answers })],
        ['src/App.tsx', buildAppTsx()],
    ]);
}
