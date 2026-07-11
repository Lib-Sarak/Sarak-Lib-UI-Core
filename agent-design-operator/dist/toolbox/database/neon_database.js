import { logger } from '../../utils/logger.js';
export class NeonDatabase {
    connectionUrl;
    apiKey;
    constructor(connectionUrl, apiKey) {
        this.connectionUrl = connectionUrl;
        this.apiKey = apiKey;
        if (!connectionUrl || !apiKey) {
            logger.warn('[NeonDatabase] Missing URL or API Key. Ensure configuration is correct.');
        }
    }
    async executeQuery(query, params = []) {
        try {
            const response = await fetch(this.connectionUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({ query, params })
            });
            if (!response.ok)
                throw new Error(`HTTP ${response.status}`);
            return await response.json();
        }
        catch (error) {
            logger.error(`[NeonDatabase] Query Error: ${error}`);
            throw error;
        }
    }
    async saveMessage(tableName, sessionId, agentId, role, content) {
        await this.executeQuery(`INSERT INTO ${tableName} (session_id, agent_id, role, content) VALUES ($1, $2, $3, $4)`, [sessionId, agentId, role, content]);
    }
    async getChatHistory(tableName, sessionId, limit) {
        const res = await this.executeQuery(`SELECT * FROM ${tableName} WHERE session_id = $1 ORDER BY created_at DESC LIMIT $2`, [sessionId, limit]);
        return res?.data?.reverse() || [];
    }
    async saveLead(tableName, agentId, sessionId, leadData) {
        await this.executeQuery(`INSERT INTO ${tableName} (agent_id, session_id, lead_data) VALUES ($1, $2, $3)`, [agentId, sessionId, JSON.stringify(leadData)]);
    }
    async saveTriggerEvent(tableName, agentId, sessionId, triggerType, data) {
        await this.executeQuery(`INSERT INTO ${tableName} (agent_id, session_id, trigger_type, event_data) VALUES ($1, $2, $3, $4)`, [agentId, sessionId, triggerType, JSON.stringify(data)]);
    }
    async getSessionState(tableName, sessionId) {
        const res = await this.executeQuery(`SELECT state_data FROM ${tableName} WHERE session_id = $1 LIMIT 1`, [sessionId]);
        return res?.data?.[0]?.state_data || {};
    }
    async saveSessionState(tableName, sessionId, stateData) {
        await this.executeQuery(`INSERT INTO ${tableName} (session_id, state_data) VALUES ($1, $2) ON CONFLICT (session_id) DO UPDATE SET state_data = EXCLUDED.state_data`, [sessionId, JSON.stringify(stateData)]);
    }
}
