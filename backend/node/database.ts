import { Client } from 'pg';
import { INIT_UI_SCHEMA_SQL } from './schema';

/**
 * Conecta ao banco de dados do sistema e executa a migração nativa do Sarak UI Core.
 * Este script cria a tabela `custom_themes` e aplica o self-healing necessário 
 * em esquemas Node.js (ex: Next.js).
 * 
 * @param connectionString A URL do PostgreSQL (ex: postgresql://user:pass@localhost:5432/db)
 */
export async function setupUIDatabase(connectionString: string): Promise<void> {
    if (!connectionString) {
        console.warn('⚠️ [Sarak-UI-Core/bridge-node] URL de conexão não fornecida. Inicialização ignorada.');
        return;
    }

    const client = new Client({ connectionString });

    try {
        await client.connect();

        console.log('🔄 [Sarak-UI-Core/bridge-node] Iniciando migração de UI no PostgreSQL...');
        // Executa o script importado diretamente da constante TypeScript
        await client.query(INIT_UI_SCHEMA_SQL);
        console.log('✅ [Sarak-UI-Core/bridge-node] Schema ui_core inicializado com sucesso.');

    } catch (error) {
        console.error('❌ [Sarak-UI-Core/bridge-node] Falha ao inicializar banco de dados UI:', error);
    } finally {
        await client.end();
    }
}
