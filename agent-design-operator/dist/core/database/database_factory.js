import { MemoryDatabase } from './memory_database.js';
import { ProviderDatabase } from './provider_database.js';
import { settings } from '../../config/shared/settings.js';
import { logger } from '../../utils/logger.js';
export class DatabaseFactory {
    static getDatabase() {
        const envType = (settings.PERSISTENCE_ENV || '').trim().toLowerCase();
        if (envType === "local") {
            return new MemoryDatabase();
        }
        else if (envType === "cloud") {
            return new ProviderDatabase();
        }
        else {
            logger.warning(`Unknown PERSISTENCE_ENV '${envType}' provided. Defaulting to local In-Memory DB.`);
            return new MemoryDatabase();
        }
    }
}
// Singleton Instance Resolved statically at boot
export const databaseClient = DatabaseFactory.getDatabase();
