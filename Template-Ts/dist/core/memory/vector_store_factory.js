"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vectorStore = exports.VectorStoreFactory = void 0;
const memory_vector_store_1 = require("./memory_vector_store");
const provider_vector_store_1 = require("./provider_vector_store");
const settings_1 = require("../../config/shared/settings");
const logger_1 = require("../../utils/logger");
class VectorStoreFactory {
    static getVectorStore() {
        const envType = (settings_1.settings.PERSISTENCE_ENV || '').trim().toLowerCase();
        if (envType === "local") {
            return new memory_vector_store_1.MemoryVectorStore();
        }
        else if (envType === "cloud") {
            try {
                return new provider_vector_store_1.ProviderVectorStore();
            }
            catch (error) {
                logger_1.logger.error(`Failed to load pgvector store: ${error.message}. Falling back to in-memory local Vector Store.`);
                return new memory_vector_store_1.MemoryVectorStore();
            }
        }
        else {
            logger_1.logger.warning(`Unknown PERSISTENCE_ENV '${envType}' provided. Defaulting to local In-Memory Vector Store.`);
            return new memory_vector_store_1.MemoryVectorStore();
        }
    }
}
exports.VectorStoreFactory = VectorStoreFactory;
// Singleton Instance resolved at boot
exports.vectorStore = VectorStoreFactory.getVectorStore();
