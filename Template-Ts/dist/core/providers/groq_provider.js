"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroqProvider = void 0;
const axios_1 = __importDefault(require("axios"));
const settings_1 = require("../../config/shared/settings");
const logger_1 = require("../../utils/logger");
class GroqProvider {
    apiKey;
    endpoint;
    constructor() {
        this.apiKey = settings_1.settings.GROQ_API_KEY;
        this.endpoint = "https://api.groq.com/openai/v1/chat/completions";
    }
    async generateResponse(systemPrompt, history, temperature, maxTokens, model) {
        if (!this.apiKey) {
            logger_1.logger.error("Groq API Key is not set in settings/environment variables.");
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
            logger_1.logger.debug(`Sending payload to Groq API using model '${model}'`);
            const response = await axios_1.default.post(this.endpoint, payload, { headers, timeout: 30000 });
            const content = response.data.choices[0].message.content;
            return content;
        }
        catch (error) {
            if (error.response) {
                logger_1.logger.error(`Groq API returned HTTP error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
                throw new Error(`Groq API request failed: ${JSON.stringify(error.response.data)}`);
            }
            else {
                logger_1.logger.error(`Unexpected error when calling Groq: ${error.message}`);
                throw error;
            }
        }
    }
}
exports.GroqProvider = GroqProvider;
