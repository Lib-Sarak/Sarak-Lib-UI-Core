"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderFactory = void 0;
const groq_provider_1 = require("./groq_provider");
const openrouter_provider_1 = require("./openrouter_provider");
const logger_1 = require("../../utils/logger");
class ProviderFactory {
    static getProvider(providerName) {
        const nameLower = providerName.trim().toLowerCase();
        if (nameLower === "groq") {
            return new groq_provider_1.GroqProvider();
        }
        else if (nameLower === "openrouter") {
            return new openrouter_provider_1.OpenRouterProvider();
        }
        else {
            logger_1.logger.error(`Unsupported LLM provider requested: '${providerName}'`);
            throw new Error(`Unsupported provider: '${providerName}'. Supported options are 'groq', 'openrouter'.`);
        }
    }
}
exports.ProviderFactory = ProviderFactory;
