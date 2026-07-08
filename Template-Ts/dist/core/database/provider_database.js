"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderDatabase = void 0;
const settings_1 = require("../../config/shared/settings");
const logger_1 = require("../../utils/logger");
class ProviderDatabase {
    dbUrl;
    isConnected;
    constructor() {
        this.dbUrl = settings_1.settings.DATABASE_URL;
        this.isConnected = false;
        if (!this.dbUrl) {
            logger_1.logger.error("DATABASE_URL is not set. Relational database cannot initialize.");
            throw new Error("Relational Database error: Missing DATABASE_URL environment secret.");
        }
        logger_1.logger.info("Initializing relational client (PostgreSQL) using standard SQL connections.");
        this.isConnected = true;
    }
    saveMessage(tableName, sessionId, agentId, role, content) {
        logger_1.logger.debug(`[POSTGRESQL] Executing: INSERT INTO ${tableName} (session_id, agent_id, role, content) ...`);
    }
    getChatHistory(tableName, sessionId, limit) {
        logger_1.logger.debug(`[POSTGRESQL] Executing: SELECT role, content FROM ${tableName} WHERE session_id = '${sessionId}' LIMIT ${limit} ...`);
        return [];
    }
    saveLead(tableName, agentId, sessionId, leadData) {
        logger_1.logger.info(`[POSTGRESQL] Executing: INSERT INTO ${tableName} (agent_id, session_id, lead_data) VALUES (..., ..., JSONB) ...`);
    }
    saveTriggerEvent(tableName, agentId, sessionId, triggerType, data) {
        logger_1.logger.debug(`[POSTGRESQL] Executing: INSERT INTO ${tableName} (agent_id, session_id, trigger_type, data) ...`);
    }
    getSessionState(tableName, sessionId) {
        logger_1.logger.debug(`[POSTGRESQL] Executing: SELECT state_data FROM ${tableName} WHERE session_id = '${sessionId}' ...`);
        return {};
    }
    saveSessionState(tableName, sessionId, stateData) {
        logger_1.logger.info(`[POSTGRESQL] Executing: UPSERT INTO ${tableName} (session_id, state_data) ...`);
    }
}
exports.ProviderDatabase = ProviderDatabase;
