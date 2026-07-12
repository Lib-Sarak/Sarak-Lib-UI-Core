/**
 * Conecta ao banco de dados do sistema e executa a migração nativa do Sarak UI Core.
 * Este script cria a tabela `custom_themes` e aplica o self-healing necessário
 * em esquemas Node.js (ex: Next.js).
 *
 * @param connectionString A URL do PostgreSQL (ex: postgresql://user:pass@localhost:5432/db)
 */
declare function setupUIDatabase(connectionString: string): Promise<void>;

interface DesignApiOptions {
    connectionString: string;
    systemName?: string;
    getUserId?: (req: Request) => Promise<string | null> | string | null;
}
/**
 * Retorna os Handlers (GET/POST) prontos para o App Router do Next.js.
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
declare function createBrandingApiHandler(options: BrandingApiOptions): {
    GET(req: Request): Promise<Response>;
    POST(req: Request): Promise<Response>;
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

export { type DesignApiOptions, type DesignCatalogToken, type DesignScaffoldToken, createBrandingApiHandler, createDesignApiHandler, getDesignCatalog, getDesignScaffold, setupUIDatabase };
