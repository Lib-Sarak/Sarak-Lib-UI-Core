"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryVectorStore = void 0;
const memory_embeddings_1 = require("./memory_embeddings");
const settings_1 = require("../../config/shared/settings");
const logger_1 = require("../../utils/logger");
class MemoryVectorStore {
    embeddings;
    storage;
    constructor(embeddingsProvider = new memory_embeddings_1.MemoryEmbeddings()) {
        this.embeddings = embeddingsProvider;
        this.storage = {};
        logger_1.logger.info("Initializing Local In-Memory Vector Store.");
    }
    async addDocuments(tableName, agentId, documents, embeddingsProvider) {
        if (!this.storage[tableName])
            this.storage[tableName] = {};
        if (!this.storage[tableName][agentId])
            this.storage[tableName][agentId] = [];
        const texts = documents.map(doc => doc.text);
        const activeEmb = embeddingsProvider || this.embeddings;
        const vectors = await activeEmb.embedDocuments(texts);
        for (let i = 0; i < documents.length; i++) {
            this.storage[tableName][agentId].push({
                text: documents[i].text,
                vector: vectors[i],
                metadata: documents[i].metadata || {}
            });
        }
        logger_1.logger.info(`[IN-MEMORY VECTOR DB] Successfully indexed ${documents.length} document blocks for agent: '${agentId}' under collection '${tableName}'`);
    }
    async similaritySearch(tableName, agentId, queryEmbedding, topK, threshold) {
        const table = this.storage[tableName] || {};
        const agentDocs = table[agentId] || [];
        if (agentDocs.length === 0) {
            logger_1.logger.debug(`[IN-MEMORY VECTOR DB] No indexed documents found for agent '${agentId}' under '${tableName}'`);
            return [];
        }
        const defaultVec = settings_1.settings.GLOBAL_DEFAULTS.vectorization || {};
        const resolvedTopK = topK !== undefined ? topK : defaultVec.top_k;
        if (resolvedTopK === undefined) {
            throw new Error("Parâmetro 'top_k' de vetorização ausente e sem fallback no defaults.json.");
        }
        const resolvedThreshold = threshold !== undefined ? threshold : defaultVec.similarity_threshold;
        if (resolvedThreshold === undefined) {
            throw new Error("Parâmetro 'similarity_threshold' de vetorização ausente e sem fallback no defaults.json.");
        }
        const results = [];
        for (const doc of agentDocs) {
            let score = 0;
            for (let i = 0; i < queryEmbedding.length; i++) {
                score += queryEmbedding[i] * (doc.vector[i] || 0);
            }
            if (score >= resolvedThreshold) {
                results.push({
                    text: doc.text,
                    score: score,
                    metadata: doc.metadata
                });
            }
        }
        results.sort((a, b) => b.score - a.score);
        return results.slice(0, resolvedTopK);
    }
    isIndexed(tableName, agentId) {
        const table = this.storage[tableName] || {};
        return (table[agentId] || []).length > 0;
    }
}
exports.MemoryVectorStore = MemoryVectorStore;
