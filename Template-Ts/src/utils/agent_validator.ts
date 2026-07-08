import * as fs from 'fs';
import * as path from 'path';
import { logger } from './logger.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


export class AgentValidator {
    /**
     * Agent Validator (Linter) to enforce structural, syntactic and type 
     * integrity on agent directories and configuration files.
     */
    static validateAgentAssets(agentId: string, basePath: string): void {
        logger.debug(`[LINTER] Starting validation for agent: '${agentId}' at path: ${basePath}`);

        // 0. Validate global defaults.json structural and syntactical integrity
        const sharedConfigDir = path.resolve(__dirname, '..', 'config', 'shared');
        const defaultsPath = path.join(sharedConfigDir, 'defaults.json');
        
        if (fs.existsSync(defaultsPath)) {
            let defaults: any;
            try {
                const fileContent = fs.readFileSync(defaultsPath, 'utf-8');
                defaults = JSON.parse(fileContent);
            } catch (e: any) {
                logger.error(`[LINTER] JSON Syntax Error in global defaults.json: ${e.message}`);
                throw new Error(`Syntax error in global shared 'defaults.json': ${e.message}`);
            }
            AgentValidator._validateDefaultsStructure(defaults);
        }

        if (!fs.existsSync(basePath)) {
            throw new Error(`Agent directory not found at: ${basePath}`);
        }

        // 1. Validate config.json syntax and structure
        const configPath = path.join(basePath, 'config.json');
        if (!fs.existsSync(configPath)) {
            throw new Error(`Missing required 'config.json' file for agent '${agentId}'`);
        }

        let config: any;
        try {
            const fileContent = fs.readFileSync(configPath, 'utf-8');
            config = JSON.parse(fileContent);
        } catch (e: any) {
            logger.error(`[LINTER] JSON Syntax Error in config.json for agent '${agentId}': ${e.message}`);
            throw new Error(`Syntax error in 'config.json' for agent '${agentId}': ${e.message}`);
        }

        AgentValidator._validateConfigStructure(config, agentId);

        // 2. Validate manifest.json (if present)
        const manifestPath = path.join(basePath, 'manifest.json');
        if (fs.existsSync(manifestPath)) {
            let manifest: any;
            try {
                const fileContent = fs.readFileSync(manifestPath, 'utf-8');
                manifest = JSON.parse(fileContent);
            } catch (e: any) {
                logger.error(`[LINTER] JSON Syntax Error in manifest.json for agent '${agentId}': ${e.message}`);
                throw new Error(`Syntax error in 'manifest.json' for agent '${agentId}': ${e.message}`);
            }
            AgentValidator._validateManifestStructure(manifest, agentId);
        }

        // 3. Check structural readability of optional markdown files
        for (const mdFile of ['identity.md', 'knowledge.md', 'workflow.md']) {
            const mdPath = path.join(basePath, mdFile);
            if (fs.existsSync(mdPath)) {
                try {
                    fs.readFileSync(mdPath, 'utf-8');
                } catch (e: any) {
                    throw new Error(`Failed to read markdown file '${mdFile}' for agent '${agentId}': ${e.message}`);
                }
            }
        }

        logger.info(`[LINTER] Agent '${agentId}' successfully passed all validation checks.`);
    }

    private static _validateConfigStructure(config: any, agentId: string): void {
        // Required Keys
        for (const reqKey of ['provider', 'model']) {
            if (!(reqKey in config)) {
                throw new Error(`Validation error in config.json for agent '${agentId}': Missing required property '${reqKey}'`);
            }
            if (typeof config[reqKey] !== 'string' || !config[reqKey].trim()) {
                throw new Error(`Validation error in config.json for agent '${agentId}': Property '${reqKey}' must be a non-empty string`);
            }
        }

        if ('temperature' in config) {
            if (typeof config.temperature !== 'number') {
                throw new Error(`Validation error in config.json for agent '${agentId}': 'temperature' must be a number`);
            }
            if (config.temperature < 0.0 || config.temperature > 2.0) {
                throw new Error(`Validation error in config.json for agent '${agentId}': 'temperature' must be between 0.0 and 2.0`);
            }
        }

        if ('max_tokens' in config) {
            if (typeof config.max_tokens !== 'number' || config.max_tokens <= 0) {
                throw new Error(`Validation error in config.json for agent '${agentId}': 'max_tokens' must be a positive integer`);
            }
        }

        if ('vectorization' in config) {
            const vec = config.vectorization;
            if (typeof vec !== 'object' || vec === null) {
                throw new Error(`Validation error in config.json for agent '${agentId}': 'vectorization' must be an object`);
            }
            if ('top_k' in vec && (typeof vec.top_k !== 'number' || vec.top_k <= 0)) {
                throw new Error(`Validation error in config.json for agent '${agentId}': 'vectorization.top_k' must be a positive integer`);
            }
            if ('similarity_threshold' in vec) {
                const thresh = vec.similarity_threshold;
                if (typeof thresh !== 'number' || thresh < 0.0 || thresh > 1.0) {
                    throw new Error(`Validation error in config.json for agent '${agentId}': 'vectorization.similarity_threshold' must be a number between 0.0 and 1.0`);
                }
            }
        }

        if ('database' in config) {
            const db = config.database;
            if (typeof db !== 'object' || db === null) {
                throw new Error(`Validation error in config.json for agent '${agentId}': 'database' must be an object`);
            }
            for (const dbKey of ['table_history', 'table_leads', 'table_triggers', 'table_knowledge']) {
                if (dbKey in db && (typeof db[dbKey] !== 'string' || !db[dbKey].trim())) {
                    throw new Error(`Validation error in config.json for agent '${agentId}': 'database.${dbKey}' must be a non-empty string`);
                }
            }
        }

        if ('triggers' in config) {
            const triggers = config.triggers;
            if (typeof triggers !== 'object' || triggers === null) {
                throw new Error(`Validation error in config.json for agent '${agentId}': 'triggers' must be an object mapping names to rules`);
            }
            for (const [triggerName, rule] of Object.entries(triggers) as [string, any][]) {
                if (typeof rule !== 'object' || rule === null) {
                    throw new Error(`Validation error in config.json for agent '${agentId}': trigger rule '${triggerName}' must be an object`);
                }
                if (!('pattern' in rule)) {
                    throw new Error(`Validation error in config.json for agent '${agentId}': trigger rule '${triggerName}' is missing required property 'pattern'`);
                }
                if (typeof rule.pattern !== 'string' || !rule.pattern.trim()) {
                    throw new Error(`Validation error in config.json for agent '${agentId}': trigger rule '${triggerName}.pattern' must be a non-empty string`);
                }
                if ('fields' in rule) {
                    if (!Array.isArray(rule.fields) || !rule.fields.every((f: any) => typeof f === 'string')) {
                        throw new Error(`Validation error in config.json for agent '${agentId}': trigger rule '${triggerName}.fields' must be a list of strings`);
                    }
                }
            }
        }
    }

    private static _validateManifestStructure(manifest: any, agentId: string): void {
        if ('agentId' in manifest && manifest.agentId !== agentId) {
            throw new Error(`Validation error in manifest.json for agent '${agentId}': 'agentId' in manifest ('${manifest.agentId}') does not match directory ID ('${agentId}')`);
        }
        if ('theme' in manifest) {
            const theme = manifest.theme;
            if (typeof theme !== 'object' || theme === null) {
                throw new Error(`Validation error in manifest.json for agent '${agentId}': 'theme' must be an object`);
            }
            for (const col of ['primaryColor', 'secondaryColor']) {
                if (col in theme && (typeof theme[col] !== 'string' || !theme[col].trim())) {
                    throw new Error(`Validation error in manifest.json for agent '${agentId}': 'theme.${col}' must be a non-empty string`);
                }
            }
        }
    }

    private static _validateDefaultsStructure(defaults: any): void {
        if ('llm' in defaults) {
            const llm = defaults.llm;
            if (typeof llm !== 'object' || llm === null) {
                throw new Error(`Validation error in defaults.json: 'llm' must be an object`);
            }
            for (const reqKey of ['provider', 'model']) {
                if (!(reqKey in llm) || typeof llm[reqKey] !== 'string' || !llm[reqKey].trim()) {
                    throw new Error(`Validation error in defaults.json: 'llm.${reqKey}' must be a non-empty string`);
                }
            }
            if ('temperature' in llm && typeof llm.temperature !== 'number') {
                throw new Error(`Validation error in defaults.json: 'llm.temperature' must be a number`);
            }
            if ('max_tokens' in llm && (typeof llm.max_tokens !== 'number' || llm.max_tokens <= 0)) {
                throw new Error(`Validation error in defaults.json: 'llm.max_tokens' must be a positive integer`);
            }
        }

        if ('vectorization' in defaults) {
            const vec = defaults.vectorization;
            if (typeof vec !== 'object' || vec === null) {
                throw new Error(`Validation error in defaults.json: 'vectorization' must be an object`);
            }
            if ('top_k' in vec && (typeof vec.top_k !== 'number' || vec.top_k <= 0)) {
                throw new Error(`Validation error in defaults.json: 'vectorization.top_k' must be a positive integer`);
            }
            if ('similarity_threshold' in vec) {
                const thresh = vec.similarity_threshold;
                if (typeof thresh !== 'number' || thresh < 0.0 || thresh > 1.0) {
                    throw new Error(`Validation error in defaults.json: 'vectorization.similarity_threshold' must be a number between 0.0 and 1.0`);
                }
            }
        }

        if ('database' in defaults) {
            const db = defaults.database;
            if (typeof db !== 'object' || db === null) {
                throw new Error(`Validation error in defaults.json: 'database' must be an object`);
            }
            for (const dbKey of ['table_history', 'table_leads', 'table_triggers', 'table_knowledge']) {
                if (dbKey in db && (typeof db[dbKey] !== 'string' || !db[dbKey].trim())) {
                    throw new Error(`Validation error in defaults.json: 'database.${dbKey}' must be a non-empty string`);
                }
            }
        }

        if ('embeddings_provider' in defaults) {
            if (typeof defaults.embeddings_provider !== 'string' || !defaults.embeddings_provider.trim()) {
                throw new Error(`Validation error in defaults.json: 'embeddings_provider' must be a non-empty string`);
            }
        }
    }
}
