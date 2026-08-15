// @vitest-environment node
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { inspectViteDepsCache } from '../bundlerCache.mjs';

let tmpDir;

const writeFile = (relPath, content = '') => {
    const full = path.join(tmpDir, relPath);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content);
};

beforeEach(() => {
    tmpDir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'sarak-bundler-cache-')));
});

afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
});

// plan-50: cada teste prova só a LÓGICA de comparação (arquivos de fixture escritos à
// mão) — não prova o formato real do `.vite/deps/_metadata.json` de nenhuma versão do
// Vite (isso foi medido por reprodução isolada, fora da suíte, e está no resumo da
// plan-50). O detector é TEXTUAL de propósito (ver LIMITES DECLARADOS do módulo),
// então fixtures de texto puro bastam para exercitar o contrato dele.
describe('inspectViteDepsCache', () => {
    it('sem installedDir -> checked false, nada para comparar', () => {
        const result = inspectViteDepsCache({ rootDir: tmpDir, installedDir: null });
        expect(result.checked).toBe(false);
        expect(result.stale).toBe(false);
    });

    it('installedDir sem dist/, ou dist/ sem chunk nomeado -> checked false', () => {
        const installedDir = path.join(tmpDir, 'node_modules', '@sarak', 'lib-ui-core');
        writeFile('node_modules/@sarak/lib-ui-core/dist/index.js', 'export {}');
        writeFile('node_modules/.vite/deps/_metadata.json', '{}');

        const result = inspectViteDepsCache({ rootDir: tmpDir, installedDir });
        expect(result.checked).toBe(false);
        expect(result.detail).toContain('não tem chunk nomeado');
    });

    it('sem nenhum cache do Vite no rootDir -> checked false (não é Vite, ou dev server nunca rodou)', () => {
        const installedDir = path.join(tmpDir, 'node_modules', '@sarak', 'lib-ui-core');
        writeFile('node_modules/@sarak/lib-ui-core/dist/SarakChatEngine-AAAAAAAA.js', '');

        const result = inspectViteDepsCache({ rootDir: tmpDir, installedDir });
        expect(result.checked).toBe(false);
        expect(result.detail).toContain('nenhum cache de pré-bundle');
    });

    it('cache referencia SÓ chunks que ainda existem no dist/ instalado -> stale false', () => {
        const installedDir = path.join(tmpDir, 'node_modules', '@sarak', 'lib-ui-core');
        writeFile('node_modules/@sarak/lib-ui-core/dist/SarakChatEngine-AAAAAAAA.js', '');
        writeFile('node_modules/.vite/deps/_metadata.json', JSON.stringify({ optimized: { '@sarak/lib-ui-core': { file: 'SarakChatEngine-AAAAAAAA.js' } } }));

        const result = inspectViteDepsCache({ rootDir: tmpDir, installedDir });
        expect(result.checked).toBe(true);
        expect(result.stale).toBe(false);
        expect(result.staleRefs).toEqual([]);
    });

    // O CASO REAL medido: o incidente das plans 47/49 tinha exatamente esta forma —
    // `_metadata.json` citando `CustomizationPanelImpl-ZLQMJDZU`/`SarakChatEngine-73V474Y4`,
    // chunks que o build seguinte já havia apagado do `dist/` instalado.
    it('cache referencia um chunk que NÃO existe mais no dist/ instalado -> stale true, staleRefs nomeia o chunk órfão', () => {
        const installedDir = path.join(tmpDir, 'node_modules', '@sarak', 'lib-ui-core');
        writeFile('node_modules/@sarak/lib-ui-core/dist/SarakChatEngine-HHOE6GZE.js', '');
        writeFile(
            'node_modules/.vite/deps/_metadata.json',
            JSON.stringify({ chunks: { 'chunk-SarakChatEngine-73V474Y4': { file: 'SarakChatEngine-73V474Y4.js' } } }),
        );

        const result = inspectViteDepsCache({ rootDir: tmpDir, installedDir });
        expect(result.checked).toBe(true);
        expect(result.stale).toBe(true);
        expect(result.staleRefs).toEqual(['SarakChatEngine-73V474Y4.js']);
        expect(result.detail).toContain('1 chunk(s)');
    });

    it('prefixo GENÉRICO ("chunk-", "vendor-") não entra na comparação — evita colidir com chunk de outra dependência', () => {
        const installedDir = path.join(tmpDir, 'node_modules', '@sarak', 'lib-ui-core');
        writeFile('node_modules/@sarak/lib-ui-core/dist/chunk-CURRENTHASH.js', '');
        // Referencia um "chunk-" de hash diferente — se o prefixo genérico contasse,
        // isto acusaria falso positivo (poderia ser o chunk de QUALQUER outra lib).
        writeFile('node_modules/.vite/deps/_metadata.json', JSON.stringify({ x: 'chunk-OUTRAHASH123.js' }));

        const result = inspectViteDepsCache({ rootDir: tmpDir, installedDir });
        expect(result.checked).toBe(false);
    });

    it('rastreia múltiplos chunks órfãos distintos', () => {
        const installedDir = path.join(tmpDir, 'node_modules', '@sarak', 'lib-ui-core');
        writeFile('node_modules/@sarak/lib-ui-core/dist/CustomizationPanelImpl-M3L3JTTG.js', '');
        writeFile('node_modules/@sarak/lib-ui-core/dist/SarakChatEngine-HHOE6GZE.js', '');
        writeFile(
            'node_modules/.vite/deps/CustomizationPanelImpl-Cv8Qf5yT.js',
            '// import("./CustomizationPanelImpl-ZLQMJDZU.js")',
        );
        writeFile(
            'node_modules/.vite/deps/SarakChatEngine-x.js',
            '// import("./SarakChatEngine-73V474Y4.js")',
        );

        const result = inspectViteDepsCache({ rootDir: tmpDir, installedDir });
        expect(result.checked).toBe(true);
        expect(result.stale).toBe(true);
        expect(result.staleRefs.sort()).toEqual(['CustomizationPanelImpl-ZLQMJDZU.js', 'SarakChatEngine-73V474Y4.js'].sort());
    });

    // plan-50, CORREÇÃO (o achado que reprovou a primeira rodada): no consumidor real
    // (monorepo pnpm), quem DECLARA a lib (`packages/ui-kit`) nunca é quem RODA o Vite
    // (`modulos/propostas/web`) — são pacotes IRMÃOS, não um acima do outro. `rootDir`
    // (de onde o `predev`/`check` roda) é `packages/ui-kit`; sem `workspaceRoot`, a
    // busca antiga nunca alcançava o cache do irmão. Reproduz a topologia exata medida
    // pelo revisor no veredito da rodada anterior.
    describe('topologia de monorepo — pacote que declara a lib é IRMÃO de quem roda o Vite', () => {
        const setUpErpLikeWorkspace = () => {
            // packages/ui-kit — declara @sarak/lib-ui-core, é onde `rootDir` aponta
            // (onde o predev roda o check). NÃO tem .vite — nunca teve dev server.
            const installedDir = path.join(tmpDir, 'packages', 'ui-kit', 'node_modules', '@sarak', 'lib-ui-core');
            writeFile('packages/ui-kit/node_modules/@sarak/lib-ui-core/dist/CustomizationPanelImpl-M3L3JTTG.js', '');
            writeFile('packages/ui-kit/node_modules/@sarak/lib-ui-core/dist/SarakChatEngine-HHOE6GZE.js', '');
            const rootDir = path.join(tmpDir, 'packages', 'ui-kit');

            // modulos/propostas/web — roda o Vite; o cache órfão vive AQUI, irmão de
            // packages/ui-kit, os dois só compartilham a raiz do workspace (tmpDir).
            writeFile(
                'modulos/propostas/web/node_modules/.vite/deps/_metadata.json',
                JSON.stringify({ x: 'CustomizationPanelImpl-ZLQMJDZU.js y SarakChatEngine-73V474Y4.js' }),
            );

            return { installedDir, rootDir };
        };

        it('SEM workspaceRoot (comportamento antigo): rodando de packages/ui-kit, não acha o cache do irmão — checked false', () => {
            const { installedDir, rootDir } = setUpErpLikeWorkspace();
            const result = inspectViteDepsCache({ rootDir, installedDir });
            expect(result.checked).toBe(false);
        });

        it('COM workspaceRoot = raiz do monorepo: rodando de packages/ui-kit, ACHA o cache em modulos/propostas/web e nomeia os dois chunks órfãos — é a prova que a correção exige', () => {
            const { installedDir, rootDir } = setUpErpLikeWorkspace();
            const result = inspectViteDepsCache({ rootDir, installedDir, workspaceRoot: tmpDir });

            expect(result.checked).toBe(true);
            expect(result.stale).toBe(true);
            expect(result.staleRefs.sort()).toEqual(['CustomizationPanelImpl-ZLQMJDZU.js', 'SarakChatEngine-73V474Y4.js'].sort());
            expect(result.cacheDirs).toEqual([path.join(tmpDir, 'modulos', 'propostas', 'web', 'node_modules', '.vite', 'deps')]);
        });

        it('acha MÚLTIPLOS caches órfãos quando mais de um módulo do workspace tem .vite desatualizado', () => {
            const { installedDir, rootDir } = setUpErpLikeWorkspace();
            writeFile(
                'modulos/conector/web/node_modules/.vite/deps/_metadata.json',
                JSON.stringify({ x: 'SarakChatEngine-73V474Y4.js' }),
            );

            const result = inspectViteDepsCache({ rootDir, installedDir, workspaceRoot: tmpDir });

            expect(result.checked).toBe(true);
            expect(result.cacheDirs.sort()).toEqual(
                [
                    path.join(tmpDir, 'modulos', 'conector', 'web', 'node_modules', '.vite', 'deps'),
                    path.join(tmpDir, 'modulos', 'propostas', 'web', 'node_modules', '.vite', 'deps'),
                ].sort(),
            );
        });

        it('não desce para DENTRO de node_modules além de checar .vite/deps — não varre o conteúdo de cada dependência instalada', () => {
            const { installedDir, rootDir } = setUpErpLikeWorkspace();
            // Um arquivo qualquer, fundo dentro de uma dependência qualquer, citando um
            // nome de chunk — se o walker descesse para dentro de node_modules além do
            // `.vite`, isto acusaria falso positivo.
            writeFile(
                'node_modules/alguma-outra-lib/dist/deep/CustomizationPanelImpl-FAKEHASH1.js',
                '',
            );

            const result = inspectViteDepsCache({ rootDir, installedDir, workspaceRoot: tmpDir });
            expect(result.staleRefs).not.toContain('CustomizationPanelImpl-FAKEHASH1.js');
        });
    });
});
