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

interface DesignCatalogToken {
    id: string;
    type: TokenValueType;
    options?: {
        value?: string;
        id?: string;
        label: string;
    }[];
    min?: number;
    max?: number;
}
/**
 * Catálogo real de tokens configuráveis (Schema/MasterMap — mesma SSOT da paridade
 * 1:1:1:1:1), para consumo por backends Node externos (ex: agent-design-operator)
 * que precisam garantir que um payload gerado por IA só preenche valores de chaves
 * que já existem no sistema — nunca inventa chave nova (Spec 08 §4, Spec 09).
 */
declare function getDesignCatalog(): DesignCatalogToken[];

export { type DesignApiOptions, type DesignCatalogToken, createBrandingApiHandler, createDesignApiHandler, getDesignCatalog, setupUIDatabase };
