export interface DatabaseInterface {
    saveMessage(tableName: string, sessionId: string, agentId: string, role: string, content: string): void | Promise<void>;
    getChatHistory(tableName: string, sessionId: string, limit: number): any[] | Promise<any[]>;
    saveLead(tableName: string, agentId: string, sessionId: string, leadData: Record<string, any>): void | Promise<void>;
    saveTriggerEvent(tableName: string, agentId: string, sessionId: string, triggerType: string, data: Record<string, any>): void | Promise<void>;
    getSessionState(tableName: string, sessionId: string): Record<string, any> | Promise<Record<string, any>>;
    saveSessionState(tableName: string, sessionId: string, stateData: Record<string, any>): void | Promise<void>;
}
