import { logger } from '../../utils/logger.js';
export class FirebaseDatabase {
    projectId;
    apiKey;
    baseUrl;
    constructor(projectId, apiKey) {
        this.projectId = projectId;
        this.apiKey = apiKey;
        if (!projectId || !apiKey) {
            logger.warn('[FirebaseDatabase] Missing ProjectId or API Key.');
        }
        this.baseUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;
    }
    async postDocument(collection, fields) {
        try {
            const response = await fetch(`${this.baseUrl}/${collection}?key=${this.apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fields })
            });
            if (!response.ok)
                throw new Error(`HTTP ${response.status}`);
        }
        catch (error) {
            logger.error(`[FirebaseDatabase] Error posting to ${collection}: ${error}`);
            throw error;
        }
    }
    async saveMessage(tableName, sessionId, agentId, role, content) {
        await this.postDocument(tableName, {
            session_id: { stringValue: sessionId },
            agent_id: { stringValue: agentId },
            role: { stringValue: role },
            content: { stringValue: content },
            created_at: { timestampValue: new Date().toISOString() }
        });
    }
    async getChatHistory(tableName, sessionId, limit) {
        return [];
    }
    async saveLead(tableName, agentId, sessionId, leadData) {
        await this.postDocument(tableName, {
            agent_id: { stringValue: agentId },
            session_id: { stringValue: sessionId },
            lead_data: { stringValue: JSON.stringify(leadData) }
        });
    }
    async saveTriggerEvent(tableName, agentId, sessionId, triggerType, data) {
        await this.postDocument(tableName, {
            agent_id: { stringValue: agentId },
            session_id: { stringValue: sessionId },
            trigger_type: { stringValue: triggerType },
            event_data: { stringValue: JSON.stringify(data) }
        });
    }
    async getSessionState(tableName, sessionId) {
        return {};
    }
    async saveSessionState(tableName, sessionId, stateData) {
        await this.postDocument(tableName, {
            session_id: { stringValue: sessionId },
            state_data: { stringValue: JSON.stringify(stateData) }
        });
    }
}
