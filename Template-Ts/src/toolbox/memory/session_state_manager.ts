import { DatabaseInterface } from '../../core/database/database_interface.js';

export class SessionStateManager {
    constructor(private database: DatabaseInterface) {}

    formatState(stateData: Record<string, any> | null | undefined): string {
        if (!stateData) return '';
        if (Object.keys(stateData).length === 0) return '';
        
        return `[PERSISTENT USER MEMORY (STATE)]\n${JSON.stringify(stateData, null, 2)}`;
    }

    async fetchAndFormatState(tableName: string, sessionId: string): Promise<string> {
        const stateData = await this.database.getSessionState(tableName, sessionId);
        return this.formatState(stateData);
    }

    async saveState(tableName: string, sessionId: string, stateData: Record<string, any>): Promise<void> {
        await this.database.saveSessionState(tableName, sessionId, stateData);
    }
}
