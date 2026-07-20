/**
 * Combina os geradores puros num `Map<caminhoRelativo, conteúdo>` — o `init`
 * (`runInit.mjs`) só escreve esse mapa em disco (idempotente). `package.json`
 * fica DE FORA do mapa: é tratado à parte via `mergePackageJson` (merge, não
 * sobrescrita direta).
 */
import { buildViteConfig, buildFrontendOnlyViteConfig } from './generators/viteConfig.mjs';
import { buildTsconfig, buildServerTsconfig, buildFrontendOnlyTsconfig } from './generators/tsconfig.mjs';
import { buildIndexHtml } from './generators/indexHtml.mjs';
import { buildMainTsx } from './generators/mainTsx.mjs';
import { buildSarakEngineIndex } from './generators/sarakEngine.mjs';
import { buildServerTs } from './generators/serverTs.mjs';
import {
    buildInstrumentationTs,
    buildDesignRouteTs,
    buildBrandingRouteTs,
    buildThemesRouteTs,
    buildThemesByIdRouteTs,
    buildThemesActivateRouteTs,
} from './generators/nextVariant.mjs';
import { buildContractStubMd } from './generators/frontendOnlyVariant.mjs';

const asJson = (value) => `${JSON.stringify(value, null, 4)}\n`;

function frontFiles({ answers, ctx }) {
    return new Map([
        ['index.html', buildIndexHtml()],
        ['vite.config.ts', buildViteConfig({ answers })],
        ['src/main.tsx', buildMainTsx({ answers })],
        ['src/Sarak-Engine/index.ts', buildSarakEngineIndex()],
        ['src/manifests/app.manifest.json', ctx.starterManifest],
    ]);
}

function viteExpressFileMap({ answers, ctx }) {
    const files = frontFiles({ answers, ctx });
    files.set('tsconfig.json', asJson(buildTsconfig()));
    files.set('tsconfig.server.json', asJson(buildServerTsconfig()));
    files.set('src/server.ts', buildServerTs({ answers }));
    return files;
}

function frontendOnlyFileMap({ answers, ctx }) {
    const files = frontFiles({ answers, ctx });
    files.set('vite.config.ts', buildFrontendOnlyViteConfig({ answers }));
    files.set('tsconfig.json', asJson(buildFrontendOnlyTsconfig()));
    files.set('CONTRATO-BACKEND.md', buildContractStubMd());
    return files;
}

function nextFileMap({ answers }) {
    return new Map([
        ['instrumentation.ts', buildInstrumentationTs({ answers })],
        ['app/api/ui/design/route.ts', buildDesignRouteTs({ answers })],
        ['app/api/ui/branding/route.ts', buildBrandingRouteTs({ answers })],
        ['app/api/ui/themes/route.ts', buildThemesRouteTs({ answers })],
        ['app/api/ui/themes/[id]/route.ts', buildThemesByIdRouteTs({ answers })],
        ['app/api/ui/themes/[id]/activate/route.ts', buildThemesActivateRouteTs({ answers })],
    ]);
}

/** Ponto único: monta o mapa de arquivos completo para o `stack` escolhido. */
export function buildFileMap({ answers, ctx }) {
    if (answers.stack === 'next') return nextFileMap({ answers });
    if (answers.stack === 'frontend-only') return frontendOnlyFileMap({ answers, ctx });
    return viteExpressFileMap({ answers, ctx });
}
