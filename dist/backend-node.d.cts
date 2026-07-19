interface SetupUIDatabaseOptions {
    /** Schema Postgres a inicializar (default `'ui_core'`). Ignorado em SQLite. */
    schema?: string;
    /** Prefixo das tabelas SQLite (default `'ui_core_'`). Ignorado em Postgres. */
    tablePrefix?: string;
}
/**
 * Conecta ao banco de dados do sistema e executa a migração nativa do Sarak UI Core.
 * Cria a tabela `custom_themes` (+ demais) e aplica o self-healing necessário em
 * esquemas Node.js (ex: Next.js). Detecta o dialeto pela própria `connectionString`
 * (Regra "zero-config" — Spec 08 §2): prefixo `postgres://`/`postgresql://` usa
 * PostgreSQL via `pg`; qualquer outro valor (caminho de arquivo, `:memory:`) usa
 * SQLite via `better-sqlite3`.
 *
 * `options.schema`/`options.tablePrefix` (Spec 19) tiram o `"ui_core"` fixo do
 * caminho: consumidores com regra de schema/prefixo próprio configuram sem
 * precisar patchear `node_modules`.
 *
 * @param connectionString URL do PostgreSQL (ex: postgresql://localhost:5432/meubanco)
 *   ou caminho de arquivo/`:memory:` para SQLite (ex: `./database.sqlite`).
 */
declare function setupUIDatabase(connectionString: string, options?: SetupUIDatabaseOptions): Promise<void>;

/**
 * Porta de Persistência de UI (Spec 19). A lib declara APENAS esta interface —
 * quem/onde os dados vivem é decisão do consumidor. `pg`/`sqlite` (pasta
 * `adapters/`) são implementações de REFERÊNCIA; Supabase/Firebase/AWS/etc.
 * são exemplos documentados (`docs/examples/`), nunca dependência da lib.
 */
interface UIStorageScope {
    system: string;
    userId: string | null;
}
interface UITheme {
    id: string;
    name: string;
    description: string | null;
    system: string;
    ownerId: string | null;
    isPublic: boolean;
    isActive: boolean;
    design: Record<string, unknown>;
}
interface UIThemeCreateInput {
    name: string;
    design: Record<string, unknown>;
    isActive: boolean;
}
interface UIThemeUpdateInput {
    name?: string;
    design?: Record<string, unknown>;
    isActive?: boolean;
}
interface UIBranding {
    companyName: string;
    loginName: string;
    tabName: string;
    logoBase64: string | null;
}
interface UIStorageAdapter {
    /** Tema ativo do escopo; cai para o ativo global (`userId: null`) se o do usuário não existir. */
    getActiveTheme(scope: UIStorageScope): Promise<UITheme | null>;
    /** Cria (se não houver tema ativo no escopo) ou atualiza o design do tema ativo. */
    saveActiveDesign(scope: UIStorageScope, design: Record<string, unknown>): Promise<UITheme>;
    createTheme(scope: UIStorageScope, input: UIThemeCreateInput): Promise<UITheme>;
    /** `null` se `themeId` não existir. */
    updateTheme(scope: UIStorageScope, themeId: string, input: UIThemeUpdateInput): Promise<UITheme | null>;
    /** Ativa `themeId` e desativa os demais temas do escopo; `null` se não existir. */
    activateTheme(scope: UIStorageScope, themeId: string): Promise<UITheme | null>;
    getBranding(scope: UIStorageScope): Promise<UIBranding | null>;
    saveBranding(scope: UIStorageScope, branding: Record<string, unknown>): Promise<UIBranding>;
}

interface UIPersistenceOptions {
    /** Connection string usada para instanciar o adapter de referência (pg ou sqlite). Ignorada se `storage` for informado. */
    connectionString?: string;
    /** Adapter próprio (Supabase/Firebase/API própria/…) — bypassa completamente pg/sqlite. */
    storage?: UIStorageAdapter;
    /** Schema Postgres do adapter de referência (default `'ui_core'`). Ignorado com `storage` ou dialeto SQLite. */
    schema?: string;
    /** Prefixo de tabela SQLite do adapter de referência (default `'ui_core_'`). Ignorado com `storage` ou dialeto Postgres. */
    tablePrefix?: string;
    systemName?: string;
    getUserId?: (req: Request) => Promise<string | null> | string | null;
}
/** Alias mantido pelo nome histórico — mesmo shape de `UIPersistenceOptions`. */
type DesignApiOptions = UIPersistenceOptions;

/**
 * Handler HTTP (`GET`/`POST` `{base}/design`) — ORQUESTRADOR sobre a porta
 * `UIStorageAdapter` (Spec 19). Não fala mais SQL diretamente: resolve o adapter
 * (custom via `storage` ou de referência pg/sqlite via `connectionString`) e traduz
 * Request/Response Web ↔ chamadas da porta. `jsonResponse`/`resolveUserId` seguem
 * exportados daqui por compatibilidade histórica (reusados por `themes.ts`).
 */

/**
 * Retorna os Handlers (GET/POST) prontos para o App Router do Next.js.
 * `options.storage` (adapter custom) OU `options.connectionString` (adapter de
 * referência, dialeto auto-detectado — Spec 08 §2 zero-config) — nunca os dois.
 */
declare function createDesignApiHandler(options: DesignApiOptions): {
    GET(req: Request): Promise<Response>;
    POST(req: Request): Promise<Response>;
};

/**
 * Handler HTTP (`GET`/`POST` `{base}/branding`) — ORQUESTRADOR sobre a porta
 * `UIStorageAdapter` (Spec 19). Ver `api.ts` para a mesma lógica no design.
 */

type BrandingApiOptions = DesignApiOptions;
/**
 * Retorna os Handlers (GET/POST) prontos para o App Router do Next.js.
 * `options.storage` (adapter custom) OU `options.connectionString` (adapter de
 * referência, dialeto auto-detectado — Spec 08 §2 zero-config) — nunca os dois.
 */
declare function createBrandingApiHandler(options: BrandingApiOptions): {
    GET(req: Request): Promise<Response>;
    POST(req: Request): Promise<Response>;
};

/**
 * Adaptador Express/Connect da persistência de UI (Spec 08 §3.1 — Instalação Completa).
 *
 * Os handlers oficiais (`createDesignApiHandler`/`createBrandingApiHandler`) falam o
 * padrão Web (`Request`/`Response`, formato App Router do Next.js). Consumidores
 * Express/Fastify/Node puro usam ESTE adaptador — uma linha:
 *
 *   app.use(createSarakUIExpressMiddleware({ connectionString: './database.sqlite' }));
 *
 * Ele atende `GET/POST <basePath>/design` e `GET/POST <basePath>/branding`
 * (default `/api/ui` — o mesmo `DEFAULT_UI_BASE_URL` que o SarakUIProvider chama),
 * sem depender do pacote `express` (assinatura connect-style estrutural).
 */

/** Forma mínima do request Node/Express (estrutural — sem dependência de tipos). */
interface NodeRequestLike {
    method?: string;
    url?: string;
    originalUrl?: string;
    headers: Record<string, string | string[] | undefined>;
    /** Corpo já parseado por `express.json()`; ausente em GET. */
    body?: unknown;
}
/** Forma mínima do response Node/Express. */
interface NodeResponseLike {
    statusCode: number;
    setHeader(name: string, value: string): void;
    end(chunk?: string): void;
}
interface SarakUIMiddlewareOptions extends DesignApiOptions {
    /** Prefixo dos endpoints de UI (default: `/api/ui` — o que o Provider chama). */
    basePath?: string;
}
declare function createSarakUIExpressMiddleware(options: SarakUIMiddlewareOptions): (req: NodeRequestLike, res: NodeResponseLike, next: () => void) => Promise<void>;

/**
 * API de Temas Nomeados do Design Engine (Spec 01 ↔ Spec 08 §3.1) — ORQUESTRADOR
 * sobre a porta `UIStorageAdapter` (Spec 19). O frontend (`useThemeActions`) fala
 * com TRÊS rotas:
 *   POST {base}/themes                → cria tema nomeado ({ design, name, is_active })
 *   PUT  {base}/themes/:id            → atualiza design/nome/ativação do tema
 *   PUT  {base}/themes/:id/activate   → ativa o tema (desativa os demais do escopo)
 */

/**
 * Handlers dos temas nomeados. `POST` cria; `PUT` atualiza; `ACTIVATE` ativa —
 * os dois últimos recebem o `themeId` extraído da rota pelo host (Next.js dynamic
 * route ou o middleware Express oficial).
 */
declare function createThemesApiHandler(options: DesignApiOptions): {
    POST(req: Request): Promise<Response>;
    PUT(req: Request, themeId: string): Promise<Response>;
    ACTIVATE(req: Request, themeId: string): Promise<Response>;
};

/**
 * Sarak Industrial Design Schema (v11.0)
 *
 * Define o contrato para mapeamento de 100% das funcionalidades e componentes.
 */
type TokenValueType = 'number' | 'color' | 'string' | 'boolean' | 'select' | 'slider' | 'font' | 'text' | 'image' | 'file';
type ResponsiveValue<T> = {
    desk: T;
    tab: T;
    mob: T;
};
/** Espaço de valores que um token pode assumir (espelha SarakDesignTokens). */
type SarakTokenValue = string | number | boolean | ResponsiveValue<string | number>;

interface DesignCatalogToken {
    id: string;
    label: string;
    type: TokenValueType;
    description?: string;
    axis?: 'color' | 'geometry' | 'elevation' | 'texture' | 'density' | 'motion';
    options?: {
        value?: string;
        id?: string;
        label: string;
    }[];
    min?: number;
    max?: number;
}
interface DesignScaffoldToken extends DesignCatalogToken {
    /** id do `ComponentSchema` de origem (ex: 'buttons', 'cards') — a "família" do token. */
    schemaId: string;
    /** Valor padrão real do gabarito (mesma fonte de `getScaffold()`), usado no modo `create`. */
    defaultValue: SarakTokenValue;
}
/**
 * Catálogo real de tokens configuráveis (Schema/MasterMap — mesma SSOT da paridade
 * 1:1:1:1:1), para consumo por backends Node externos (ex: agent-design-operator)
 * que precisam garantir que um payload gerado por IA só preenche valores de chaves
 * que já existem no sistema — nunca inventa chave nova (Spec 08 §4, Spec 09).
 *
 * A partir da Spec 02, também expõe `label`/`description`/`axis` — insumo do
 * pipeline de indexação semântica (RAG) do Design Agent, que precisa do texto
 * humano de cada token para gerar embeddings, não só o formato do valor.
 */
declare function getDesignCatalog(): DesignCatalogToken[];
/**
 * Gabarito completo do tema (Spec 02, revisão pós-incidente de produção) — mesma
 * SSOT de `getScaffold()` (`src/core/Design/master-map.ts`), mas com a metadata
 * humana (`label`/`description`/`axis`) e o `schemaId` (família de origem) que o
 * pipeline de preenchimento fatiado do `agent-design-operator` precisa pra
 * agrupar as ~416 chaves em fatias por família sem duplicar a lista em nenhum
 * outro lugar (paridade 1:1:1:1:1 — a família é sempre lida de `MASTER_DESIGN_MAP`,
 * nunca hardcoded no consumidor).
 */
declare function getDesignScaffold(): DesignScaffoldToken[];

interface PostgresStorageAdapterOptions {
    connectionString: string;
    schema?: string;
}
declare function createPostgresStorageAdapter(options: PostgresStorageAdapterOptions): UIStorageAdapter;

interface SqliteStorageAdapterOptions {
    connectionString: string;
    tablePrefix?: string;
}
declare function createSqliteStorageAdapter(options: SqliteStorageAdapterOptions): UIStorageAdapter;

export { type BrandingApiOptions, type DesignApiOptions, type DesignCatalogToken, type DesignScaffoldToken, type PostgresStorageAdapterOptions, type SarakUIMiddlewareOptions, type SetupUIDatabaseOptions, type SqliteStorageAdapterOptions, type UIBranding, type UIPersistenceOptions, type UIStorageAdapter, type UIStorageScope, type UITheme, type UIThemeCreateInput, type UIThemeUpdateInput, createBrandingApiHandler, createDesignApiHandler, createPostgresStorageAdapter, createSarakUIExpressMiddleware, createSqliteStorageAdapter, createThemesApiHandler, getDesignCatalog, getDesignScaffold, setupUIDatabase };
