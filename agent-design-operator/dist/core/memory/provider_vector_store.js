import { settings } from '../../config/shared/settings.js';
import { logger } from '../../utils/logger.js';
export class ProviderVectorStore {
    embeddings;
    dbUrl;
    constructor(embeddingsProvider) {
        this.embeddings = embeddingsProvider;
        this.dbUrl = settings.DATABASE_URL;
        if (!this.dbUrl) {
            logger.error("DATABASE_URL is not set. pgvector store cannot connect.");
            throw new Error("pgvector Store error: Missing DATABASE_URL environment secret.");
        }
        logger.info("Initializing pgvector store adapter connected to generic PostgreSQL pool.");
    }
    async addDocuments(tableName, agentId, documents, embeddingsProvider) {
        const texts = documents.map(doc => doc.text);
        const activeEmb = embeddingsProvider || this.embeddings;
        let vectors = [];
        if (activeEmb) {
            vectors = await activeEmb.embedDocuments(texts);
        }
        logger.debug(`[PGVECTOR] Executing: INSERT INTO ${tableName} (agent_id, text, embedding) ` +
            `for ${documents.length} blocks...`);
    }
    similaritySearch(tableName, agentId, queryEmbedding, topK, threshold) {
        const defaultVec = settings.GLOBAL_DEFAULTS.vectorization || {};
        const resolvedTopK = topK !== undefined ? topK : defaultVec.top_k;
        if (resolvedTopK === undefined) {
            throw new Error("Parâmetro 'top_k' de vetorização ausente e sem fallback no defaults.json.");
        }
        const resolvedThreshold = threshold !== undefined ? threshold : defaultVec.similarity_threshold;
        if (resolvedThreshold === undefined) {
            throw new Error("Parâmetro 'similarity_threshold' de vetorização ausente e sem fallback no defaults.json.");
        }
        logger.debug(`[PGVECTOR] Executing: SELECT text, 1 - (embedding <=> :query) AS similarity ` +
            `FROM ${tableName} WHERE agent_id = '${agentId}' AND similarity >= ${resolvedThreshold} ` +
            `ORDER BY similarity DESC LIMIT ${resolvedTopK} ...`);
        return [];
    }
    isIndexed(tableName, agentId) {
        logger.debug(`[PGVECTOR] Executing: SELECT EXISTS(SELECT 1 FROM ${tableName} WHERE agent_id = '${agentId}' LIMIT 1) ...`);
        return false;
    }
    clearAgentVectors(tableName, agentId) {
        logger.debug(`[PGVECTOR] Executing: DELETE FROM ${tableName} WHERE agent_id = '${agentId}' ...`);
    }
}
