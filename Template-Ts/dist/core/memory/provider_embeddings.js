"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderEmbeddings = void 0;
const axios_1 = __importDefault(require("axios"));
const settings_1 = require("../../config/shared/settings");
const logger_1 = require("../../utils/logger");
class ProviderEmbeddings {
    model;
    apiKey;
    apiUrl;
    constructor(model = "text-embedding-3-small") {
        this.model = model;
        this.apiKey = settings_1.settings.EMBEDDINGS_API_KEY || process.env.OPENAI_API_KEY || "";
        this.apiUrl = "https://api.openai.com/v1/embeddings";
        if (!this.apiKey) {
            logger_1.logger.warning("EMBEDDINGS_API_KEY or OPENAI_API_KEY is not set. OpenAI Embeddings calls will fail.");
        }
    }
    async embedQuery(text) {
        try {
            const res = await this.embedDocuments([text]);
            return res[0];
        }
        catch (error) {
            logger_1.logger.error(`OpenAI embed_query failed: ${error.message}`);
            return new Array(1536).fill(0.0);
        }
    }
    async embedDocuments(texts) {
        if (!this.apiKey) {
            throw new Error("Missing OpenAI API Key for embeddings generation.");
        }
        const headers = {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${this.apiKey}`
        };
        const payload = {
            input: texts,
            model: this.model
        };
        try {
            logger_1.logger.debug(`Requesting OpenAI Embeddings for ${texts.length} texts...`);
            const response = await axios_1.default.post(this.apiUrl, payload, { headers, timeout: 15000 });
            const embeddingsData = response.data.data || [];
            embeddingsData.sort((a, b) => (a.index || 0) - (b.index || 0));
            return embeddingsData.map((item) => item.embedding);
        }
        catch (error) {
            logger_1.logger.error(`OpenAI Embeddings call failed: ${error.message}`);
            throw new Error(`OpenAI Embeddings error: ${error.message}`);
        }
    }
}
exports.ProviderEmbeddings = ProviderEmbeddings;
