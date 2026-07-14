/**
 * Conecta ao banco de dados do sistema e executa a migração nativa do Sarak UI Core.
 * Este script cria a tabela `custom_themes` e aplica o self-healing necessário
 * em esquemas Node.js (ex: Next.js). Detecta o dialeto pela própria `connectionString`
 * (Regra "zero-config" — Spec 08 §2): prefixo `postgres://`/`postgresql://` usa
 * PostgreSQL via `pg`; qualquer outro valor (caminho de arquivo, `:memory:`) usa
 * SQLite via `better-sqlite3`.
 *
 * @param connectionString URL do PostgreSQL (ex: postgresql://localhost:5432/meubanco)
 *   ou caminho de arquivo/`:memory:` para SQLite (ex: `./database.sqlite`).
 */
declare function setupUIDatabase(connectionString: string): Promise<void>;

interface DesignApiOptions {
    connectionString: string;
    systemName?: string;
    getUserId?: (req: Request) => Promise<string | null> | string | null;
}
/**
 * Retorna os Handlers (GET/POST) prontos para o App Router do Next.js. Detecta o
 * dialeto (Postgres/SQLite) pela `connectionString` (Spec 08 Â§2 â€” zero-config).
 */
declare function createDesignApiHandler(options: DesignApiOptions): {
    GET(req: Request): Promise<Response>;
    POST(req: Request): Promise<Response>;
};

interface BrandingApiOptions {
    connectionString: string;
    systemName?: string;
    getUserId?: (req: Request) => Promise<string | null> | string | null;
}
/**
 * Retorna os Handlers (GET/POST) prontos para o App Router do Next.js. Detecta o
 * dialeto (Postgres/SQLite) pela `connectionString` (Spec 08 §2 — zero-config).
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
 * API de Temas Nomeados do Design Engine (Spec 01 ↔ Spec 08 §3.1).
 *
 * O frontend (`useThemeActions`) fala com TRÊS rotas que até aqui nunca tiveram
 * implementação na ponte Node (salvar tema novo no painel dava 404 silencioso):
 *   POST {base}/themes                → cria tema nomeado ({ design, name, is_active })
 *   PUT  {base}/themes/:id            → atualiza design/nome/ativação do tema
 *   PUT  {base}/themes/:id/activate   → ativa o tema (desativa os demais do escopo)
 *
 * Mesma tabela `custom_themes` do handler de design (Postgres/SQLite auto-detectado);
 * reusa os helpers oficiais de `api.ts` (merge granular + normalização + shape).
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

export { type DesignApiOptions, type DesignCatalogToken, type DesignScaffoldToken, type SarakUIMiddlewareOptions, createBrandingApiHandler, createDesignApiHandler, createSarakUIExpressMiddleware, createThemesApiHandler, getDesignCatalog, getDesignScaffold, setupUIDatabase };
