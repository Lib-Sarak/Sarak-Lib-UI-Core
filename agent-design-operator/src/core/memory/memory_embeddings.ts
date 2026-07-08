import * as crypto from 'crypto';
import { EmbeddingsInterface } from './embeddings_interface.js';

export class MemoryEmbeddings implements EmbeddingsInterface {
    private dimensions: number;

    constructor(dimensions: number = 128) {
        this.dimensions = dimensions;
    }

    private _textToVector(text: string): number[] {
        const tokens = text.toLowerCase().trim().split(/\s+/);
        if (!tokens || tokens.length === 0 || tokens[0] === "") {
            return new Array(this.dimensions).fill(0.0);
        }

        const vector = new Array(this.dimensions).fill(0.0);

        for (const word of tokens) {
            const hashVal = this.md5HashToInt(word);
            const index = hashVal % this.dimensions;
            vector[index] += 1.0;
        }

        const charTokens: string[] = [];
        for (let i = 0; i < text.length - 2; i++) {
            charTokens.push(text.substring(i, i + 3));
        }

        for (const gram of charTokens) {
            const hashVal = this.md5HashToInt(gram);
            const index = hashVal % this.dimensions;
            vector[index] += 0.25;
        }

        let squaredSum = 0;
        for (const v of vector) {
            squaredSum += v * v;
        }
        const norm = Math.sqrt(squaredSum);

        if (norm > 0) {
            return vector.map(v => v / norm);
        }
        return new Array(this.dimensions).fill(0.0);
    }

    private md5HashToInt(str: string): number {
        const hash = crypto.createHash('md5').update(str, 'utf8').digest('hex');
        // Taking first 8 hex characters for a reliable integer modulo
        return parseInt(hash.substring(0, 8), 16);
    }

    embedQuery(text: string): number[] {
        return this._textToVector(text);
    }

    embedDocuments(texts: string[]): number[][] {
        return texts.map(t => this._textToVector(t));
    }
}
