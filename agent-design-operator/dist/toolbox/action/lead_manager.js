export class LeadManager {
    database;
    notifiers;
    constructor(database, notifiers = []) {
        this.database = database;
        this.notifiers = notifiers;
    }
    async saveLead(tableName, agentId, sessionId, leadData) {
        // Step 1: Save the lead in the database
        await this.database.saveLead(tableName, agentId, sessionId, leadData);
        // Step 2: Fire all notifiers silently
        for (const notifier of this.notifiers) {
            try {
                await notifier.notifyAdmin('lead_captured', { agentId, sessionId, leadData });
            }
            catch (error) {
                // Silently swallow error to prevent crashing API
                console.error(`[LeadManager] Failed to notify admin via a notifier.`, error);
            }
        }
    }
}
