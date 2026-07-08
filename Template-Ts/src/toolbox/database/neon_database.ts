import { DatabaseInterface } from '../../core/database/database_interface.js';
import { logger } from '../../utils/logger.js';

export class NeonDatabase implements DatabaseInterface {
    constructor(
        private connectionUrl: string,
        private apiKey: string
    ) {
        if (!connectionUrl || !apiKey) {
            logger.warn('[NeonDatabase] Missing URL or API Key. Ensure configuration is correct.');
        }
    }

    private async executeQuery(query: string, params: any[] = []): Promise<any> {
        try {
            const response = await fetch(this.connectionUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({ query, params })
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (error) {
            logger.error(`[NeonDatabase] Query Error: ${error}`);
            throw error;
        }
    }

    async saveMessage(tableName: string, sessionId: string, agentId: string, role: string, content: string): Promise<void> {
        await this.executeQuery(
            `INSERT INTO ${tableName} (session_id, agent_id, role, content) VALUES ($1, $2, $3, $4)`,
            [sessionId, agentId, role, content]
        );
    }

    async getChatHistory(tableName: string, sessionId: string, limit: number): Promise<any[]> {
        const res = await this.executeQuery(
            `SELECT * FROM ${tableName} WHERE session_id = $1 ORDER BY created_at DESC LIMIT $2`,
            [sessionId, limit]
        );
        return res?.data?.reverse() || [];
    }

    async saveLead(tableName: string, agentId: string, sessionId: string, leadData: Record<string, any>): Promise<void> {
        await this.executeQuery(
            `INSERT INTO ${tableName} (agent_id, session_id, lead_data) VALUES ($1, $2, $3)`,
            [agentId, sessionId, JSON.stringify(leadData)]
        );
    }

    async saveTriggerEvent(tableName: string, agentId: string, sessionId: string, triggerType: string, data: Record<string, any>): Promise<void> {
        await this.executeQuery(
            `INSERT INTO ${tableName} (agent_id, session_id, trigger_type, event_data) VALUES ($1, $2, $3, $4)`,
            [agentId, sessionId, triggerType, JSON.stringify(data)]
        );
    }

    async getSessionState(tableName: string, sessionId: string): Promise<Record<string, any>> {
        const res = await this.executeQuery(
            `SELECT state_data FROM ${tableName} WHERE session_id = $1 LIMIT 1`,
            [sessionId]
        );
        return res?.data?.[0]?.state_data || {};
    }

    async saveSessionState(tableName: string, sessionId: string, stateData: Record<string, any>): Promise<void> {
        await this.executeQuery(
            `INSERT INTO ${tableName} (session_id, state_data) VALUES ($1, $2) ON CONFLICT (session_id) DO UPDATE SET state_data = EXCLUDED.state_data`,
            [sessionId, JSON.stringify(stateData)]
        );
    }
}
