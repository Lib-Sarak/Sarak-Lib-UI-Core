"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryDatabase = void 0;
const logger_1 = require("../../utils/logger");
class MemoryDatabase {
    historyStorage = {};
    leadsStorage = {};
    triggersStorage = {};
    statesStorage = {};
    constructor() {
        logger_1.logger.info("Initializing generic In-Memory Database for local development.");
    }
    saveMessage(tableName, sessionId, agentId, role, content) {
        if (!this.historyStorage[tableName]) {
            this.historyStorage[tableName] = {};
        }
        if (!this.historyStorage[tableName][sessionId]) {
            this.historyStorage[tableName][sessionId] = [];
        }
        this.historyStorage[tableName][sessionId].push({
            agent_id: agentId,
            role: role,
            content: content
        });
        logger_1.logger.debug(`[IN-MEMORY DB] Msg saved to table '${tableName}': ${role} -> ${content.substring(0, 30)}...`);
    }
    getChatHistory(tableName, sessionId, limit) {
        const table = this.historyStorage[tableName] || {};
        const history = table[sessionId] || [];
        return history.slice(-limit);
    }
    saveLead(tableName, agentId, sessionId, leadData) {
        if (!this.leadsStorage[tableName]) {
            this.leadsStorage[tableName] = [];
        }
        const leadRecord = {
            agent_id: agentId,
            session_id: sessionId,
            data: leadData
        };
        this.leadsStorage[tableName].push(leadRecord);
        logger_1.logger.info(`[IN-MEMORY DB] Lead saved to table '${tableName}': ${JSON.stringify(leadRecord)}`);
    }
    saveTriggerEvent(tableName, agentId, sessionId, triggerType, data) {
        if (!this.triggersStorage[tableName]) {
            this.triggersStorage[tableName] = [];
        }
        const eventRecord = {
            agent_id: agentId,
            session_id: sessionId,
            trigger_type: triggerType,
            data: data
        };
        this.triggersStorage[tableName].push(eventRecord);
        logger_1.logger.debug(`[IN-MEMORY DB] Trigger saved to table '${tableName}': ${JSON.stringify(eventRecord)}`);
    }
    getSessionState(tableName, sessionId) {
        if (!this.statesStorage[tableName]) {
            this.statesStorage[tableName] = {};
        }
        return this.statesStorage[tableName][sessionId] || {};
    }
    saveSessionState(tableName, sessionId, stateData) {
        if (!this.statesStorage[tableName]) {
            this.statesStorage[tableName] = {};
        }
        const currentState = this.statesStorage[tableName][sessionId] || {};
        const newState = { ...currentState, ...stateData };
        this.statesStorage[tableName][sessionId] = newState;
        logger_1.logger.info(`[IN-MEMORY DB] Session state updated for '${sessionId}' in table '${tableName}': ${JSON.stringify(stateData)}`);
    }
}
exports.MemoryDatabase = MemoryDatabase;
