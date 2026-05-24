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

export { type DesignApiOptions, createBrandingApiHandler, createDesignApiHandler, setupUIDatabase };
