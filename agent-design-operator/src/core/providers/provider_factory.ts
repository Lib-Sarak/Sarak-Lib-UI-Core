import { ProviderInterface } from './provider_interface.js';
import { GroqProvider } from './groq_provider.js';
import { OpenRouterProvider } from './openrouter_provider.js';
import { logger } from '../../utils/logger.js';

export class ProviderFactory {
    static getProvider(providerName: string): ProviderInterface {
        const nameLower = providerName.trim().toLowerCase();
        if (nameLower === "groq") {
            return new GroqProvider();
        } else if (nameLower === "openrouter") {
            return new OpenRouterProvider();
        } else {
            logger.error(`Unsupported LLM provider requested: '${providerName}'`);
            throw new Error(`Unsupported provider: '${providerName}'. Supported options are 'groq', 'openrouter'.`);
        }
    }
}
