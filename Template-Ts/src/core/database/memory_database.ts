import { DatabaseInterface } from './database_interface.js';
import { logger } from '../../utils/logger.js';

export class MemoryDatabase implements DatabaseInterface {
    private historyStorage: Record<string, Record<string, any[]>> = {};
    private leadsStorage: Record<string, any[]> = {};
    private triggersStorage: Record<string, any[]> = {};
    private statesStorage: Record<string, Record<string, any>> = {};

    constructor() {
        logger.info("Initializing generic In-Memory Database for local development.");
    }

    saveMessage(tableName: string, sessionId: string, agentId: string, role: string, content: string): void {
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
        logger.debug(`[IN-MEMORY DB] Msg saved to table '${tableName}': ${role} -> ${content.substring(0, 30)}...`);
    }

    getChatHistory(tableName: string, sessionId: string, limit: number): any[] {
        const table = this.historyStorage[tableName] || {};
        const history = table[sessionId] || [];
        return history.slice(-limit);
    }

    saveLead(tableName: string, agentId: string, sessionId: string, leadData: Record<string, any>): void {
        if (!this.leadsStorage[tableName]) {
            this.leadsStorage[tableName] = [];
        }

        const leadRecord = {
            agent_id: agentId,
            session_id: sessionId,
            data: leadData
        };
        this.leadsStorage[tableName].push(leadRecord);
        logger.info(`[IN-MEMORY DB] Lead saved to table '${tableName}': ${JSON.stringify(leadRecord)}`);
    }

    saveTriggerEvent(tableName: string, agentId: string, sessionId: string, triggerType: string, data: Record<string, any>): void {
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
        logger.debug(`[IN-MEMORY DB] Trigger saved to table '${tableName}': ${JSON.stringify(eventRecord)}`);
    }

    getSessionState(tableName: string, sessionId: string): Record<string, any> {
        if (!this.statesStorage[tableName]) {
            this.statesStorage[tableName] = {};
        }
        return this.statesStorage[tableName][sessionId] || {};
    }

    saveSessionState(tableName: string, sessionId: string, stateData: Record<string, any>): void {
        if (!this.statesStorage[tableName]) {
            this.statesStorage[tableName] = {};
        }

        const currentState = this.statesStorage[tableName][sessionId] || {};
        const newState = { ...currentState, ...stateData };
        this.statesStorage[tableName][sessionId] = newState;
        logger.info(`[IN-MEMORY DB] Session state updated for '${sessionId}' in table '${tableName}': ${JSON.stringify(stateData)}`);
    }
}
