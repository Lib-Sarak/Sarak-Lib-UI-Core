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
exports.settings = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const dotenv = __importStar(require("dotenv"));
// Load environmental variables from .env
dotenv.config();
class Settings {
    DEBUG;
    PORT;
    HOST;
    // Infrastructure Environment Toggles
    PERSISTENCE_ENV;
    // Credentials & Sensitive Connection Strings
    DATABASE_URL;
    GROQ_API_KEY;
    OPENROUTER_API_KEY;
    OPENROUTER_REFERER;
    OPENROUTER_TITLE;
    EMBEDDINGS_API_KEY;
    // Dynamic Fallback Defaults (Zero Hardcoding)
    GLOBAL_DEFAULTS;
    constructor() {
        this.DEBUG = (process.env.DEBUG || 'false').toLowerCase() === 'true';
        this.PORT = parseInt(process.env.PORT || '8000', 10);
        this.HOST = process.env.HOST || '0.0.0.0';
        // Infrastructure Environment Toggles
        this.PERSISTENCE_ENV = (process.env.PERSISTENCE_ENV || 'local').toLowerCase(); // "local" | "cloud"
        // Credentials & Sensitive Connection Strings
        this.DATABASE_URL = process.env.DATABASE_URL || '';
        this.GROQ_API_KEY = process.env.GROQ_API_KEY || '';
        this.OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
        this.OPENROUTER_REFERER = process.env.OPENROUTER_REFERER || 'https://github.com/agent-factory';
        this.OPENROUTER_TITLE = process.env.OPENROUTER_TITLE || 'AI Agent Factory';
        this.EMBEDDINGS_API_KEY = process.env.EMBEDDINGS_API_KEY || '';
        // Dynamic Fallback Defaults (Zero Hardcoding)
        this.GLOBAL_DEFAULTS = this._loadGlobalDefaults();
    }
    _loadGlobalDefaults() {
        const defaultsPath = path.join(__dirname, 'defaults.json');
        if (fs.existsSync(defaultsPath)) {
            try {
                const fileContent = fs.readFileSync(defaultsPath, 'utf-8');
                return JSON.parse(fileContent);
            }
            catch (error) {
                // Return empty object on error
            }
        }
        return {};
    }
}
// Global Settings Instance
exports.settings = new Settings();
