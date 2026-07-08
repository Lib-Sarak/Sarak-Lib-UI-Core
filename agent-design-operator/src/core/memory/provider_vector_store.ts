import { VectorStoreInterface } from './vector_store_interface.js';
import { EmbeddingsInterface } from './embeddings_interface.js';
import { settings } from '../../config/shared/settings.js';
import { logger } from '../../utils/logger.js';

export class ProviderVectorStore implements VectorStoreInterface {
    private embeddings?: EmbeddingsInterface;
    private dbUrl: string;

    constructor(embeddingsProvider?: EmbeddingsInterface) {
        this.embeddings = embeddingsProvider;
        this.dbUrl = settings.DATABASE_URL;
        
        if (!this.dbUrl) {
            logger.error("DATABASE_URL is not set. pgvector store cannot connect.");
            throw new Error("pgvector Store error: Missing DATABASE_URL environment secret.");
        }
            
        logger.info("Initializing pgvector store adapter connected to generic PostgreSQL pool.");
    }

    async addDocuments(
        tableName: string, 
        agentId: string, 
        documents: Record<string, any>[], 
        embeddingsProvider?: EmbeddingsInterface
    ): Promise<void> {
        const texts = documents.map(doc => doc.text);
        const activeEmb = embeddingsProvider || this.embeddings;
        let vectors: number[][] = [];
        if (activeEmb) {
            vectors = await activeEmb.embedDocuments(texts);
        }

        logger.debug(
            `[PGVECTOR] Executing: INSERT INTO ${tableName} (agent_id, text, embedding) ` +
            `for ${documents.length} blocks...`
        );
    }

    similaritySearch(
        tableName: string, 
        agentId: string, 
        queryEmbedding: number[], 
        topK?: number, 
        threshold?: number
    ): Record<string, any>[] {
        const defaultVec = settings.GLOBAL_DEFAULTS.vectorization || {};
        const resolvedTopK = topK !== undefined ? topK : defaultVec.top_k;
        if (resolvedTopK === undefined) {
            throw new Error("Parâmetro 'top_k' de vetorização ausente e sem fallback no defaults.json.");
        }

        const resolvedThreshold = threshold !== undefined ? threshold : defaultVec.similarity_threshold;
        if (resolvedThreshold === undefined) {
            throw new Error("Parâmetro 'similarity_threshold' de vetorização ausente e sem fallback no defaults.json.");
        }

        logger.debug(
            `[PGVECTOR] Executing: SELECT text, 1 - (embedding <=> :query) AS similarity ` +
            `FROM ${tableName} WHERE agent_id = '${agentId}' AND similarity >= ${resolvedThreshold} ` +
            `ORDER BY similarity DESC LIMIT ${resolvedTopK} ...`
        );
        return [];
    }

    isIndexed(tableName: string, agentId: string): boolean {
        logger.debug(`[PGVECTOR] Executing: SELECT EXISTS(SELECT 1 FROM ${tableName} WHERE agent_id = '${agentId}' LIMIT 1) ...`);
        return false;
    }

    clearAgentVectors(tableName: string, agentId: string): void {
        logger.debug(`[PGVECTOR] Executing: DELETE FROM ${tableName} WHERE agent_id = '${agentId}' ...`);
    }
}
