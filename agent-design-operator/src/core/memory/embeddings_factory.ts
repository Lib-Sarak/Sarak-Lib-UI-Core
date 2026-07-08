import { EmbeddingsInterface } from './embeddings_interface.js';
import { MemoryEmbeddings } from './memory_embeddings.js';
import { ProviderEmbeddings } from './provider_embeddings.js';
import { logger } from '../../utils/logger.js';

export class EmbeddingsFactory {
    static getEmbeddingsProvider(providerName: string = "local"): EmbeddingsInterface {
        const nameLower = providerName ? providerName.trim().toLowerCase() : "local";
        
        if (["local", "in_memory", "in-memory"].includes(nameLower)) {
            logger.info("Using local in-memory embeddings vectorizer.");
            return new MemoryEmbeddings();
        } else if (nameLower === "openai") {
            try {
                logger.info("Instantiating Provider Embeddings API adapter.");
                return new ProviderEmbeddings();
            } catch (error: any) {
                logger.error(`Failed to load provider embeddings adapter: ${error.message}. Falling back to local in-memory embeddings.`);
                return new MemoryEmbeddings();
            }
        } else {
            logger.warning(`Unsupported embeddings provider '${providerName}' requested. Falling back to local in-memory embeddings.`);
            return new MemoryEmbeddings();
        }
    }
}
