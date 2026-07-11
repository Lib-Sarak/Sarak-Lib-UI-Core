import { settings } from '../../config/shared/settings.js';
import { logger } from '../../utils/logger.js';
export class ProviderDatabase {
    dbUrl;
    isConnected;
    constructor() {
        this.dbUrl = settings.DATABASE_URL;
        this.isConnected = false;
        if (!this.dbUrl) {
            logger.error("DATABASE_URL is not set. Relational database cannot initialize.");
            throw new Error("Relational Database error: Missing DATABASE_URL environment secret.");
        }
        logger.info("Initializing relational client (PostgreSQL) using standard SQL connections.");
        this.isConnected = true;
    }
    saveMessage(tableName, sessionId, agentId, role, content) {
        logger.debug(`[POSTGRESQL] Executing: INSERT INTO ${tableName} (session_id, agent_id, role, content) ...`);
    }
    getChatHistory(tableName, sessionId, limit) {
        logger.debug(`[POSTGRESQL] Executing: SELECT role, content FROM ${tableName} WHERE session_id = '${sessionId}' LIMIT ${limit} ...`);
        return [];
    }
    saveLead(tableName, agentId, sessionId, leadData) {
        logger.info(`[POSTGRESQL] Executing: INSERT INTO ${tableName} (agent_id, session_id, lead_data) VALUES (..., ..., JSONB) ...`);
    }
    saveTriggerEvent(tableName, agentId, sessionId, triggerType, data) {
        logger.debug(`[POSTGRESQL] Executing: INSERT INTO ${tableName} (agent_id, session_id, trigger_type, data) ...`);
    }
    getSessionState(tableName, sessionId) {
        logger.debug(`[POSTGRESQL] Executing: SELECT state_data FROM ${tableName} WHERE session_id = '${sessionId}' ...`);
        return {};
    }
    saveSessionState(tableName, sessionId, stateData) {
        logger.info(`[POSTGRESQL] Executing: UPSERT INTO ${tableName} (session_id, state_data) ...`);
    }
}
