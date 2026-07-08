import { VectorStoreInterface } from './vector_store_interface.js';
import { MemoryVectorStore } from './memory_vector_store.js';
import { ProviderVectorStore } from './provider_vector_store.js';
import { settings } from '../../config/shared/settings.js';
import { logger } from '../../utils/logger.js';

export class VectorStoreFactory {
    static getVectorStore(): VectorStoreInterface {
        const envType = (settings.PERSISTENCE_ENV || '').trim().toLowerCase();
        
        if (envType === "local") {
            return new MemoryVectorStore();
        } else if (envType === "cloud") {
            try {
                return new ProviderVectorStore();
            } catch (error: any) {
                logger.error(`Failed to load pgvector store: ${error.message}. Falling back to in-memory local Vector Store.`);
                return new MemoryVectorStore();
            }
        } else {
            logger.warning(`Unknown PERSISTENCE_ENV '${envType}' provided. Defaulting to local In-Memory Vector Store.`);
            return new MemoryVectorStore();
        }
    }
}

// Singleton Instance resolved at boot
export const vectorStore = VectorStoreFactory.getVectorStore();
