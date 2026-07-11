import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
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
    API_AUTH_KEYS;
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
        this.API_AUTH_KEYS = (process.env.API_AUTH_KEYS || '').split(',').map(k => k.trim()).filter(k => k.length > 0);
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
export const settings = new Settings();
