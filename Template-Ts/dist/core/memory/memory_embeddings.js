"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryEmbeddings = void 0;
const crypto = __importStar(require("crypto"));
class MemoryEmbeddings {
    dimensions;
    constructor(dimensions = 128) {
        this.dimensions = dimensions;
    }
    _textToVector(text) {
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
        const charTokens = [];
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
    md5HashToInt(str) {
        const hash = crypto.createHash('md5').update(str, 'utf8').digest('hex');
        // Taking first 8 hex characters for a reliable integer modulo
        return parseInt(hash.substring(0, 8), 16);
    }
    embedQuery(text) {
        return this._textToVector(text);
    }
    embedDocuments(texts) {
        return texts.map(t => this._textToVector(t));
    }
}
exports.MemoryEmbeddings = MemoryEmbeddings;
