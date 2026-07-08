import { EmbeddingsInterface } from './embeddings_interface.js';

export interface VectorStoreInterface {
    addDocuments(
        tableName: string, 
        agentId: string, 
        documents: Record<string, any>[], 
        embeddingsProvider?: EmbeddingsInterface
    ): void | Promise<void>;

    similaritySearch(
        tableName: string, 
        agentId: string, 
        queryEmbedding: number[], 
        topK?: number, 
        threshold?: number
    ): Record<string, any>[] | Promise<Record<string, any>[]>;

    isIndexed(tableName: string, agentId: string): boolean | Promise<boolean>;

    clearAgentVectors(tableName: string, agentId: string): void | Promise<void>;
}
