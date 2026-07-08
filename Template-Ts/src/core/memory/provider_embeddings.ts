import axios from 'axios';
import { EmbeddingsInterface } from './embeddings_interface.js';
import { settings } from '../../config/shared/settings.js';
import { logger } from '../../utils/logger.js';

export class ProviderEmbeddings implements EmbeddingsInterface {
    private model: string;
    private apiKey: string;
    private apiUrl: string;

    constructor(model: string = "text-embedding-3-small") {
        this.model = model;
        this.apiKey = settings.EMBEDDINGS_API_KEY || process.env.OPENAI_API_KEY || "";
        this.apiUrl = "https://api.openai.com/v1/embeddings";

        if (!this.apiKey) {
            logger.warning("EMBEDDINGS_API_KEY or OPENAI_API_KEY is not set. OpenAI Embeddings calls will fail.");
        }
    }

    async embedQuery(text: string): Promise<number[]> {
        try {
            const res = await this.embedDocuments([text]);
            return res[0];
        } catch (error: any) {
            logger.error(`OpenAI embed_query failed: ${error.message}`);
            return new Array(1536).fill(0.0);
        }
    }

    async embedDocuments(texts: string[]): Promise<number[][]> {
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
            logger.debug(`Requesting OpenAI Embeddings for ${texts.length} texts...`);
            const response = await axios.post(this.apiUrl, payload, { headers, timeout: 15000 });
            
            const embeddingsData = response.data.data || [];
            embeddingsData.sort((a: any, b: any) => (a.index || 0) - (b.index || 0));
            
            return embeddingsData.map((item: any) => item.embedding);
        } catch (error: any) {
            logger.error(`OpenAI Embeddings call failed: ${error.message}`);
            throw new Error(`OpenAI Embeddings error: ${error.message}`);
        }
    }
}
