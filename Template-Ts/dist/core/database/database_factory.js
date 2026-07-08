"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.databaseClient = exports.DatabaseFactory = void 0;
const memory_database_1 = require("./memory_database");
const provider_database_1 = require("./provider_database");
const settings_1 = require("../../config/shared/settings");
const logger_1 = require("../../utils/logger");
class DatabaseFactory {
    static getDatabase() {
        const envType = (settings_1.settings.PERSISTENCE_ENV || '').trim().toLowerCase();
        if (envType === "local") {
            return new memory_database_1.MemoryDatabase();
        }
        else if (envType === "cloud") {
            return new provider_database_1.ProviderDatabase();
        }
        else {
            logger_1.logger.warning(`Unknown PERSISTENCE_ENV '${envType}' provided. Defaulting to local In-Memory DB.`);
            return new memory_database_1.MemoryDatabase();
        }
    }
}
exports.DatabaseFactory = DatabaseFactory;
// Singleton Instance Resolved statically at boot
exports.databaseClient = DatabaseFactory.getDatabase();
