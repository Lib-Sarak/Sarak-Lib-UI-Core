import { DatabaseInterface } from '../../core/database/database_interface.js';
import { logger } from '../../utils/logger.js';

export class FirebaseDatabase implements DatabaseInterface {
    private baseUrl: string;

    constructor(
        private projectId: string,
        private apiKey: string
    ) {
        if (!projectId || !apiKey) {
            logger.warn('[FirebaseDatabase] Missing ProjectId or API Key.');
        }
        this.baseUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;
    }

    private async postDocument(collection: string, fields: any): Promise<void> {
        try {
            const response = await fetch(`${this.baseUrl}/${collection}?key=${this.apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fields })
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
        } catch (error) {
            logger.error(`[FirebaseDatabase] Error posting to ${collection}: ${error}`);
            throw error;
        }
    }

    async saveMessage(tableName: string, sessionId: string, agentId: string, role: string, content: string): Promise<void> {
        await this.postDocument(tableName, {
            session_id: { stringValue: sessionId },
            agent_id: { stringValue: agentId },
            role: { stringValue: role },
            content: { stringValue: content },
            created_at: { timestampValue: new Date().toISOString() }
        });
    }

    async getChatHistory(tableName: string, sessionId: string, limit: number): Promise<any[]> {
        return [];
    }

    async saveLead(tableName: string, agentId: string, sessionId: string, leadData: Record<string, any>): Promise<void> {
        await this.postDocument(tableName, {
            agent_id: { stringValue: agentId },
            session_id: { stringValue: sessionId },
            lead_data: { stringValue: JSON.stringify(leadData) }
        });
    }

    async saveTriggerEvent(tableName: string, agentId: string, sessionId: string, triggerType: string, data: Record<string, any>): Promise<void> {
        await this.postDocument(tableName, {
            agent_id: { stringValue: agentId },
            session_id: { stringValue: sessionId },
            trigger_type: { stringValue: triggerType },
            event_data: { stringValue: JSON.stringify(data) }
        });
    }

    async getSessionState(tableName: string, sessionId: string): Promise<Record<string, any>> {
        return {};
    }

    async saveSessionState(tableName: string, sessionId: string, stateData: Record<string, any>): Promise<void> {
        await this.postDocument(tableName, {
            session_id: { stringValue: sessionId },
            state_data: { stringValue: JSON.stringify(stateData) }
        });
    }
}
