import { DatabaseInterface } from '../../core/database/database_interface.js';
import { NotifierInterface } from './notifier.interface.js';

export class LeadManager {
    constructor(
        private database: DatabaseInterface,
        private notifiers: NotifierInterface[] = []
    ) {}

    async saveLead(tableName: string, agentId: string, sessionId: string, leadData: Record<string, any>): Promise<void> {
        // Step 1: Save the lead in the database
        await this.database.saveLead(tableName, agentId, sessionId, leadData);

        // Step 2: Fire all notifiers silently
        for (const notifier of this.notifiers) {
            try {
                await notifier.notifyAdmin('lead_captured', { agentId, sessionId, leadData });
            } catch (error) {
                // Silently swallow error to prevent crashing API
                console.error(`[LeadManager] Failed to notify admin via a notifier.`, error);
            }
        }
    }
}
