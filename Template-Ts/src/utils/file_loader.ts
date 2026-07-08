import * as fs from 'fs';
import * as path from 'path';
import { logger } from './logger.js';
import { AgentValidator } from './agent_validator.js';
import { ConfigurationError, AgentNotFoundError } from './errors.js';

export function loadAgentAssets(agentId: string): [any, string, string, string, string, any] {
    /**
     * Safely resolves the path and loads all files for a given agentId.
     * Prevents path traversal attacks.
     */
    const safeAgentId = path.basename(agentId);
    if (safeAgentId !== agentId || agentId.includes('..')) {
        logger.error(`Unsafe or invalid agentId provided: ${agentId}`);
        throw new ConfigurationError("Invalid agentId format");
    }

    const basePath = path.join(process.cwd(), 'src', 'config', 'agents', safeAgentId);

    // Run agent linter/validator to ensure integrity and locate any syntax errors
    AgentValidator.validateAgentAssets(safeAgentId, basePath);

    // Path helper
    function readFileOrDefault(filename: string, defaultValue: string = ""): string {
        const filepath = path.join(basePath, filename);
        if (fs.existsSync(filepath)) {
            return fs.readFileSync(filepath, 'utf-8');
        }
        return defaultValue;
    }

    // Read configuration (JSON)
    const configPath = path.join(basePath, 'config.json');
    if (!fs.existsSync(configPath)) {
        throw new AgentNotFoundError(`Missing config.json for agent '${safeAgentId}'`);
    }
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

    // Read manifest (JSON)
    const manifestPath = path.join(basePath, 'manifest.json');
    let manifest = {};
    if (fs.existsSync(manifestPath)) {
        manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    }

    const identity = readFileOrDefault('identity.md');
    const knowledge = readFileOrDefault('knowledge.md');
    const workflow = readFileOrDefault('workflow.md');
    const rules = readFileOrDefault('rules.md');

    logger.debug(`Successfully loaded assets for agent: ${safeAgentId}`);
    return [config, identity, knowledge, workflow, rules, manifest];
}
