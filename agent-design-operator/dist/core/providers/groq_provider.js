import axios from 'axios';
import { settings } from '../../config/shared/settings.js';
import { logger } from '../../utils/logger.js';
export class GroqProvider {
    apiKey;
    endpoint;
    constructor() {
        this.apiKey = settings.GROQ_API_KEY;
        this.endpoint = "https://api.groq.com/openai/v1/chat/completions";
    }
    async generateResponse(systemPrompt, history, temperature, maxTokens, model) {
        if (!this.apiKey) {
            logger.error("Groq API Key is not set in settings/environment variables.");
            throw new Error("GROQ_API_KEY is not configured.");
        }
        const headers = {
            "Authorization": `Bearer ${this.apiKey}`,
            "Content-Type": "application/json"
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
            logger.debug(`Sending payload to Groq API using model '${model}'`);
            const response = await axios.post(this.endpoint, payload, { headers, timeout: 30000 });
            const content = response.data.choices[0].message.content;
            return content;
        }
        catch (error) {
            if (error.response) {
                logger.error(`Groq API returned HTTP error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
                throw new Error(`Groq API request failed: ${JSON.stringify(error.response.data)}`);
            }
            else {
                logger.error(`Unexpected error when calling Groq: ${error.message}`);
                throw error;
            }
        }
    }
}
