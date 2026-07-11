import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// Load environmental variables from .env
dotenv.config();

class Settings {
    public readonly DEBUG: boolean;
    public readonly PORT: number;
    public readonly HOST: string;
    
    // Infrastructure Environment Toggles
    public readonly PERSISTENCE_ENV: string;
    
    // Credentials & Sensitive Connection Strings
    public readonly DATABASE_URL: string;
    public readonly GROQ_API_KEY: string;
    public readonly OPENROUTER_API_KEY: string;
    public readonly OPENROUTER_REFERER: string;
    public readonly OPENROUTER_TITLE: string;
    public readonly EMBEDDINGS_API_KEY: string;
    public readonly API_AUTH_KEYS: string[];

    // Escolha de Provider/Modelo do Design Agent: SEMPRE do sistema importador.
    // O módulo (agent-design-operator) nunca decide isso por conta própria — sem
    // fallback aqui de propósito; a rota falha explicitamente se não vier definido.
    public readonly DESIGN_AGENT_LLM_PROVIDER: string;
    public readonly DESIGN_AGENT_LLM_MODEL: string;
    public readonly DESIGN_AGENT_LLM_TEMPERATURE: number;
    public readonly DESIGN_AGENT_LLM_MAX_TOKENS: number;

    // Dynamic Fallback Defaults (Zero Hardcoding)
    public readonly GLOBAL_DEFAULTS: Record<string, any>;

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

        this.DESIGN_AGENT_LLM_PROVIDER = process.env.DESIGN_AGENT_LLM_PROVIDER || '';
        this.DESIGN_AGENT_LLM_MODEL = process.env.DESIGN_AGENT_LLM_MODEL || '';
        this.DESIGN_AGENT_LLM_TEMPERATURE = process.env.DESIGN_AGENT_LLM_TEMPERATURE ? parseFloat(process.env.DESIGN_AGENT_LLM_TEMPERATURE) : 0.2;
        this.DESIGN_AGENT_LLM_MAX_TOKENS = process.env.DESIGN_AGENT_LLM_MAX_TOKENS ? parseInt(process.env.DESIGN_AGENT_LLM_MAX_TOKENS, 10) : 2000;

        // Dynamic Fallback Defaults (Zero Hardcoding)
        this.GLOBAL_DEFAULTS = this._loadGlobalDefaults();
    }

    private _loadGlobalDefaults(): Record<string, any> {
        const defaultsPath = path.join(__dirname, 'defaults.json');
        if (fs.existsSync(defaultsPath)) {
            try {
                const fileContent = fs.readFileSync(defaultsPath, 'utf-8');
                return JSON.parse(fileContent);
            } catch (error) {
                // Return empty object on error
            }
        }
        return {};
    }
}

// Global Settings Instance
export const settings = new Settings();
