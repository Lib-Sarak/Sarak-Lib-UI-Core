export class SessionStateManager {
    database;
    constructor(database) {
        this.database = database;
    }
    formatState(stateData) {
        if (!stateData)
            return '';
        if (Object.keys(stateData).length === 0)
            return '';
        return `[PERSISTENT USER MEMORY (STATE)]\n${JSON.stringify(stateData, null, 2)}`;
    }
    async fetchAndFormatState(tableName, sessionId) {
        const stateData = await this.database.getSessionState(tableName, sessionId);
        return this.formatState(stateData);
    }
    async saveState(tableName, sessionId, stateData) {
        await this.database.saveSessionState(tableName, sessionId, stateData);
    }
}
