"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenRouterProvider = void 0;
const axios_1 = __importDefault(require("axios"));
const settings_1 = require("../../config/shared/settings");
const logger_1 = require("../../utils/logger");
class OpenRouterProvider {
    apiKey;
    referer;
    title;
    endpoint;
    constructor() {
        this.apiKey = settings_1.settings.OPENROUTER_API_KEY;
        this.referer = settings_1.settings.OPENROUTER_REFERER;
        this.title = settings_1.settings.OPENROUTER_TITLE;
        this.endpoint = "https://openrouter.ai/api/v1/chat/completions";
    }
    async generateResponse(systemPrompt, history, temperature, maxTokens, model) {
        if (!this.apiKey) {
            logger_1.logger.error("OpenRouter API Key is not set in settings/environment variables.");
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
            logger_1.logger.debug(`Sending payload to OpenRouter API using model '${model}'`);
            const response = await axios_1.default.post(this.endpoint, payload, { headers, timeout: 30000 });
            const content = response.data.choices[0].message.content;
            return content;
        }
        catch (error) {
            if (error.response) {
                logger_1.logger.error(`OpenRouter API returned HTTP error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
                throw new Error(`OpenRouter API request failed: ${JSON.stringify(error.response.data)}`);
            }
            else {
                logger_1.logger.error(`Unexpected error when calling OpenRouter: ${error.message}`);
                throw error;
            }
        }
    }
}
exports.OpenRouterProvider = OpenRouterProvider;
