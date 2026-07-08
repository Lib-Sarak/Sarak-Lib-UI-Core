"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmbeddingsFactory = void 0;
const memory_embeddings_1 = require("./memory_embeddings");
const provider_embeddings_1 = require("./provider_embeddings");
const logger_1 = require("../../utils/logger");
class EmbeddingsFactory {
    static getEmbeddingsProvider(providerName = "local") {
        const nameLower = providerName ? providerName.trim().toLowerCase() : "local";
        if (["local", "in_memory", "in-memory"].includes(nameLower)) {
            logger_1.logger.info("Using local in-memory embeddings vectorizer.");
            return new memory_embeddings_1.MemoryEmbeddings();
        }
        else if (nameLower === "openai") {
            try {
                logger_1.logger.info("Instantiating Provider Embeddings API adapter.");
                return new provider_embeddings_1.ProviderEmbeddings();
            }
            catch (error) {
                logger_1.logger.error(`Failed to load provider embeddings adapter: ${error.message}. Falling back to local in-memory embeddings.`);
                return new memory_embeddings_1.MemoryEmbeddings();
            }
        }
        else {
            logger_1.logger.warning(`Unsupported embeddings provider '${providerName}' requested. Falling back to local in-memory embeddings.`);
            return new memory_embeddings_1.MemoryEmbeddings();
        }
    }
}
exports.EmbeddingsFactory = EmbeddingsFactory;
