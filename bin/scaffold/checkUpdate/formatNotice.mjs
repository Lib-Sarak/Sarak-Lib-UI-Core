/**
 * Extraído de `runCheckUpdate.mjs` (SRP — decidir o veredito é uma coisa, formatar o
 * aviso do `predev` é outra) para o arquivo não crescer sem fronteira.
 *
 * Modo `--notify` (o pedido do dono): a saída que o `predev` do consumidor imprime.
 * **Silêncio absoluto** quando está em dia, quando é link vivo, quando a verificação
 * não pôde ser feita (offline, sem git, sem lockfile) — qualquer coisa que não seja
 * "existe versão nova E há um comando a rodar" **ou** (plan-50) "o cache do bundler
 * está órfão". Devolve `null` para "não imprima nada".
 */
import { renderNotice } from './renderNotice.mjs';

/**
 * plan-50: notícia do cache do bundler é INDEPENDENTE da do pacote — dispara mesmo
 * com `upToDate: true` (é exatamente o cenário do incidente: pacote em dia, cache
 * do dev server desatualizado). Rótulo próprio, nunca combinado com o de atualização
 * de pacote — misturar os dois sinais cria um terceiro veredito ambíguo.
 */
const formatCacheNotice = (bundlerCache) => {
    if (!bundlerCache?.stale) return null;
    return renderNotice({
        titulo: '@sarak/lib-ui-core — cache do bundler pode estar servindo o build anterior',
        linhas: [bundlerCache.detail, ...bundlerCache.cacheDirs.map((dir) => `  ${dir}`)],
        comando: 'derrube o(s) dev server(s) acima, apague a(s) pasta(s), prove que apagou (Test-Path ⇒ False), suba de novo',
        comandoValidado: false,
    });
};

export function formatNotice(result) {
    if (!result) return null;

    const cacheNotice = formatCacheNotice(result.bundlerCache);
    if (result.upToDate !== false) return cacheNotice;

    // Uma informação por linha: caminho do Windows é longo e estoura qualquer coluna.
    const linhas =
        result.mode === 'local'
            ? [
                  'A biblioteca em disco mudou desde a sua última instalação:',
                  `  ${result.sourceDir}`,
                  '',
                  `  instalado: ${result.installedLabel}`,
                  `  em disco:  ${result.remoteLabel}`,
              ]
            : [
                  'Há uma versão nova da biblioteca.',
                  '',
                  `  instalado:   ${result.installedLabel}`,
                  `  disponível:  ${result.remoteLabel}`,
              ];

    const updateNotice = renderNotice({
        titulo: `@sarak/lib-ui-core — atualização disponível`,
        linhas,
        comando: result.command,
        comandoValidado: result.commandValidated !== false,
    });

    return cacheNotice ? `${updateNotice}\n${cacheNotice}` : updateNotice;
}
