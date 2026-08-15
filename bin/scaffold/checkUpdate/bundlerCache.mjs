/**
 * Detecta a SEGUNDA camada de cache entre `dist/` e o navegador (plan-50) — o
 * pré-bundle do bundler (Vite: `node_modules/.vite/deps/`).
 *
 * O incidente medido (2026-08-14/15, três rodadas de investigação queimadas nas plans
 * 47/49): o pacote em disco estava certo, `sarak-ui check` diria "fresh"/"live" — e a
 * tela do consumidor continuava com o build anterior. Causa: o Vite decide re-otimizar
 * dependências por lockfile + versão + config, nunca por conteúdo; com dependência
 * local nenhum dos três muda entre rebuilds, e o `.vite/deps/` cacheado nunca se
 * invalida sozinho.
 *
 * O sinal usado aqui é o mesmo que fechou o diagnóstico real: o `.vite/deps/`
 * congelado referenciava, por NOME, chunks content-hashed da lib
 * (`CustomizationPanelImpl-ZLQMJDZU.js`, `SarakChatEngine-73V474Y4.js`) que o build
 * SEGUINTE já havia apagado do `dist/` instalado. É um sinal de CONTEÚDO, não de tempo
 * — por isso não dispara falso positivo num rebuild que não mudou nada (o hash do
 * chunk seria o MESMO, e a referência continuaria batendo).
 *
 * plan-50 — correção (2026-08-15): a primeira versão só olhava
 * `<process.cwd()>/node_modules/.vite/deps` — e no consumidor real (monorepo pnpm) o
 * pacote que DECLARA a lib (`packages/ui-kit`, onde o `predev` roda o `check`) nunca é
 * o pacote que RODA o Vite (`modulos/<algum>/web`, onde o cache de fato existe). As duas
 * portas ficavam fechadas: rodando de onde o `predev` roda, não achava nada; rodando de
 * onde o cache está, o CLI recusava por não achar a dependência declarada ali. Agora a
 * busca começa na RAIZ DO WORKSPACE (`workspaceRoot` — quem chama passa o diretório do
 * lockfile, achado subindo a árvore a partir de quem declara a lib) e desce, achando
 * QUALQUER `node_modules/.vite/deps` alcançável a partir dali — sem exigir que o
 * consumidor mude onde roda o comando.
 */
import fs from 'node:fs';
import path from 'node:path';

const CHUNK_NAME_RE = /^([A-Za-z][A-Za-z0-9]*)-[A-Za-z0-9_]{6,}\.m?js$/;
/** `chunk`/`vendor` são convenções genéricas de bundler — poderiam colidir com o
 *  chunk de OUTRA dependência qualquer. Só nomes distintivos entram na comparação. */
const GENERIC_PREFIXES = new Set(['chunk', 'vendor']);
const CACHE_TEXT_EXT = new Set(['.js', '.json']);

/** Diretórios que nunca guardam um `node_modules/.vite` de um pacote-fonte, e que são
 *  caros de descer (histórico do git, artefato já gerado). */
const SKIP_DIR_NAMES = new Set(['.git', 'dist', 'build', '.next', '.turbo', '.cache', 'coverage']);

const listInstalledChunks = (distDir) => {
    let entries;
    try {
        entries = fs.readdirSync(distDir);
    } catch {
        return [];
    }
    return entries.filter((name) => CHUNK_NAME_RE.test(name));
};

const chunkPrefixesOf = (chunkNames) => {
    const prefixes = new Set();
    for (const name of chunkNames) {
        const prefix = name.match(CHUNK_NAME_RE)[1];
        if (!GENERIC_PREFIXES.has(prefix)) prefixes.add(prefix);
    }
    return [...prefixes];
};

/**
 * Desce de `root` atrás de todo `node_modules/.vite/deps` alcançável — sem entrar
 * FUNDO em `node_modules` (só olha se `.vite/deps` existe direto nele; não varre o
 * conteúdo de cada dependência instalada, que é onde o custo explodiria). `maxDirs` é
 * um disjuntor: o `predev` do consumidor não pode ficar lento por causa disto.
 */
const findViteDepsDirs = (root, { maxDirs = 4000 } = {}) => {
    const found = [];
    const stack = [root];
    let visited = 0;
    while (stack.length > 0 && visited < maxDirs) {
        const dir = stack.pop();
        visited += 1;
        let entries;
        try {
            entries = fs.readdirSync(dir, { withFileTypes: true });
        } catch {
            continue;
        }
        for (const entry of entries) {
            if (!entry.isDirectory()) continue;
            if (entry.name === 'node_modules') {
                const depsDir = path.join(dir, 'node_modules', '.vite', 'deps');
                if (fs.existsSync(depsDir)) found.push(depsDir);
                continue; // nunca desce dentro de node_modules além de checar .vite/deps
            }
            if (entry.name.startsWith('.') || SKIP_DIR_NAMES.has(entry.name)) continue;
            stack.push(path.join(dir, entry.name));
        }
    }
    return found;
};

const readCacheDirText = (cacheDir) => {
    let entries;
    try {
        entries = fs.readdirSync(cacheDir, { withFileTypes: true });
    } catch {
        return null;
    }
    const chunks = [];
    for (const entry of entries) {
        if (!entry.isFile() || !CACHE_TEXT_EXT.has(path.extname(entry.name))) continue;
        try {
            chunks.push(fs.readFileSync(path.join(cacheDir, entry.name), 'utf8'));
        } catch {
            // arquivo sumiu entre o readdir e o read (corrida com o próprio Vite) — ignora.
        }
    }
    return chunks.length > 0 ? chunks.join('\n') : null;
};

const staleRefsIn = (cacheText, prefixes, installedSet) => {
    const staleRefs = new Set();
    for (const prefix of prefixes) {
        const re = new RegExp(`${prefix}-[A-Za-z0-9_]{6,}\\.m?js`, 'g');
        for (const match of cacheText.matchAll(re)) {
            if (!installedSet.has(match[0])) staleRefs.add(match[0]);
        }
    }
    return staleRefs;
};

/**
 * @param {{ rootDir: string, installedDir: string|null, workspaceRoot?: string }} args
 *   `rootDir` é onde o `sarak-ui check`/`predev` roda. `workspaceRoot` é de onde a busca
 *   por `.vite/deps` começa a DESCER — normalmente o diretório do lockfile (acima de
 *   `rootDir`, achado por `resolveConsumerContext`), porque é dali que qualquer pacote
 *   do monorepo é alcançável. Sem `workspaceRoot`, cai em `rootDir` (comportamento de
 *   projeto único, sem monorepo). `installedDir` é o pacote da lib já resolvido.
 * @returns {{ checked: boolean, stale: boolean, staleRefs: string[], cacheDirs: string[], detail: string }}
 *   `cacheDirs` lista os `.vite/deps` que continham referência quebrada — não todos os
 *   que foram varridos (ver LIMITES DECLARADOS item 6 para essa distinção).
 *
 * -------------------------------------------------------------------------
 * LIMITES DECLARADOS (R18) — o que este detector NÃO vê
 * -------------------------------------------------------------------------
 * 1. Só Vite, e só `cacheDir` PADRÃO por pacote (`<algum pacote do workspace>/
 *    node_modules/.vite/deps/`) — não honra `cacheDir` customizado no `vite.config`
 *    (a busca é pelo NOME da pasta, `.vite`; um projeto que renomeie isso via config
 *    fica invisível). Webpack, Next.js (webpack), Rollup e Parcel têm mecanismos de
 *    cache inteiramente diferentes e não são cobertos.
 * 2. A busca desce de `workspaceRoot` (ou `rootDir`, sem ele) — nunca SOBE. Se o
 *    consumidor rodar o comando de um diretório que não é ancestral de nenhum pacote
 *    com `.vite/deps` (workspace mal formado, ou `workspaceRoot` não resolvido porque
 *    não há lockfile em lugar nenhum), o detector não encontra nada e fica em silêncio
 *    — não é falso "tudo certo": é "não sei alcançar dali".
 * 3. Só enxerga staleness se o `dist/` instalado tiver PELO MENOS um chunk nomeado
 *    content-hashed (`<Nome>-<hash>.js`) — hoje sempre tem (os `React.lazy` da lib).
 *    Se isso mudar, o detector fica silencioso (não é falso "tudo certo": é "nada para
 *    comparar").
 * 4. Dependência LINKADA (não copiada) nunca aparece em `.vite/deps/` — medido por
 *    reprodução isolada (não no ERP): o Vite exclui pacote linkado da otimização por
 *    padrão, então o detector não encontra nenhuma referência e fica em silêncio. Isso
 *    é correto (o defeito que esta plan persegue só existe sob cópia — pnpm — não sob
 *    link), mas significa que o detector nunca vai "confirmar" que um link está OK:
 *    ele só fala quando encontra uma referência QUEBRADA.
 * 5. É busca TEXTUAL (regex sobre o conteúdo bruto de `.vite/deps/*.js`/`*.json`), não
 *    um parser do formato interno do Vite (`_metadata.json` não tem contrato público
 *    de schema, e mudou entre majors). Textual é mais pobre, mas sobrevive a mudança
 *    de schema — o preço é não distinguir "chunk realmente carregado" de "nome citado
 *    à toa" (nenhum caso assim foi observado).
 * 6. **Nunca afirma "cache em dia".** Só tem dois estados úteis: encontrou referência
 *    quebrada em pelo menos um `.vite/deps` (`stale: true`) ou não encontrou nada para
 *    checar (`checked: false`). Um `.vite/deps` **sem** referência quebrada não entra
 *    em `cacheDirs` — silêncio sobre ele não é garantia, é a mesma política de ruído
 *    do `--notify` (R18 espírito: declarar o vão é melhor que inventar certeza que o
 *    mecanismo não tem).
 * 7. A descida usa um teto de diretórios visitados (`maxDirs`, hoje 4000) como
 *    disjuntor de custo — um workspace com mais de ~4000 diretórios de FONTE (fora
 *    `node_modules`) pode ter parte da árvore não varrida. Não mede tempo, só conta;
 *    nenhum caso real bateu nesse teto até hoje.
 * -------------------------------------------------------------------------
 */
export const inspectViteDepsCache = ({ rootDir, installedDir, workspaceRoot }) => {
    const searchRoot = workspaceRoot ?? rootDir;

    if (!installedDir) {
        return { checked: false, stale: false, staleRefs: [], cacheDirs: [], detail: 'pacote da lib não resolvido — nada para comparar.' };
    }

    const installedChunks = listInstalledChunks(path.join(installedDir, 'dist'));
    const prefixes = chunkPrefixesOf(installedChunks);
    if (prefixes.length === 0) {
        return { checked: false, stale: false, staleRefs: [], cacheDirs: [], detail: 'o dist/ instalado não tem chunk nomeado content-hashed — nada para comparar.' };
    }

    const candidateDirs = findViteDepsDirs(searchRoot);
    if (candidateDirs.length === 0) {
        return {
            checked: false,
            stale: false,
            staleRefs: [],
            cacheDirs: [],
            detail: `nenhum cache de pré-bundle do Vite encontrado a partir de ${searchRoot} — dev server nunca rodou em nenhum pacote deste workspace, ou não é Vite.`,
        };
    }

    const installedSet = new Set(installedChunks);
    const staleByDir = [];
    for (const cacheDir of candidateDirs) {
        const cacheText = readCacheDirText(cacheDir);
        if (!cacheText) continue;
        const staleRefs = staleRefsIn(cacheText, prefixes, installedSet);
        if (staleRefs.size > 0) staleByDir.push({ cacheDir, staleRefs: [...staleRefs] });
    }

    const staleRefs = [...new Set(staleByDir.flatMap((entry) => entry.staleRefs))];
    return {
        checked: true,
        stale: staleByDir.length > 0,
        staleRefs,
        cacheDirs: staleByDir.map((entry) => entry.cacheDir),
        detail:
            staleByDir.length > 0
                ? `${staleByDir.length} cache(s) de pré-bundle do Vite referenciam ${staleRefs.length} chunk(s) que não existem mais no dist/ instalado — o(s) dev server(s) ainda serve(m) o build anterior.`
                : `nenhuma referência quebrada encontrada nos ${candidateDirs.length} cache(s) do Vite varrido(s) (não é garantia de que estão em dia — ver LIMITES DECLARADOS).`,
    };
};
