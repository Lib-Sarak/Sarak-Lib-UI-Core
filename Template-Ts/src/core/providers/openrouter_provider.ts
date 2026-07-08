import axios from 'axios';
import { ProviderInterface } from './provider_interface.js';
import { settings } from '../../config/shared/settings.js';
import { logger } from '../../utils/logger.js';

export class OpenRouterProvider implements ProviderInterface {
    private apiKey: string;
    private referer: string;
    private title: string;
    private endpoint: string;

    constructor() {
        this.apiKey = settings.OPENROUTER_API_KEY;
        this.referer = settings.OPENROUTER_REFERER;
        this.title = settings.OPENROUTER_TITLE;
        this.endpoint = "https://openrouter.ai/api/v1/chat/completions";
    }

    async generateResponse(
        systemPrompt: string, 
        history: { role: string, content: string }[], 
        temperature: number, 
        maxTokens: number,
        model: string
    ): Promise<string> {
        if (!this.apiKey) {
            logger.error("OpenRouter API Key is not set in settings/environment variables.");
            throw new Error("OPENROUTER_API_KEY is not configured.");
        }

        const headers = {
            "Authorization": `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": this.referer,
            "X-Title": this.title
        };

        const messages = [{ role: "system", content: systemPrompt }];
        for (const msg of history) {
            messages.push({ role: msg.role, content: msg.content });
        }

        const payload = {
            model: model,
            messages: messages,
            temperature: temperature,
            max_tokens: maxTokens
        };

        try {
            logger.debug(`Sending payload to OpenRouter API using model '${model}'`);
            const response = await axios.post(this.endpoint, payload, { headers, timeout: 30000 });
            const content = response.data.choices[0].message.content;
            return content;
        } catch (error: any) {
            if (error.response) {
                logger.error(`OpenRouter API returned HTTP error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
                throw new Error(`OpenRouter API request failed: ${JSON.stringify(error.response.data)}`);
            } else {
                logger.error(`Unexpected error when calling OpenRouter: ${error.message}`);
                throw error;
            }
        }
    }
}
