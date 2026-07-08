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
exports.loadAgentAssets = loadAgentAssets;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const logger_1 = require("./logger");
const agent_validator_1 = require("./agent_validator");
function loadAgentAssets(agentId) {
    /**
     * Safely resolves the path and loads all files for a given agentId.
     * Prevents path traversal attacks.
     */
    const safeAgentId = path.basename(agentId);
    if (safeAgentId !== agentId || agentId.includes('..')) {
        logger_1.logger.error(`Unsafe or invalid agentId provided: ${agentId}`);
        throw new Error("Invalid agentId format");
    }
    const basePath = path.join(process.cwd(), 'src', 'config', 'agents', safeAgentId);
    // Run agent linter/validator to ensure integrity and locate any syntax errors
    agent_validator_1.AgentValidator.validateAgentAssets(safeAgentId, basePath);
    // Path helper
    function readFileOrDefault(filename, defaultValue = "") {
        const filepath = path.join(basePath, filename);
        if (fs.existsSync(filepath)) {
            return fs.readFileSync(filepath, 'utf-8');
        }
        return defaultValue;
    }
    // Read configuration (JSON)
    const configPath = path.join(basePath, 'config.json');
    if (!fs.existsSync(configPath)) {
        throw new Error(`Missing config.json for agent '${safeAgentId}'`);
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
    logger_1.logger.debug(`Successfully loaded assets for agent: ${safeAgentId}`);
    return [config, identity, knowledge, workflow, manifest];
}
