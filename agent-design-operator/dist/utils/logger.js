import { settings } from '../config/shared/settings.js';
import { AsyncLocalStorage } from 'async_hooks';
export const loggerContext = new AsyncLocalStorage();
export class Logger {
    name;
    constructor(name = "agent-backend") {
        this.name = name;
    }
    formatMessage(level, message) {
        const timestamp = new Date().toISOString();
        const reqId = loggerContext.getStore();
        const reqIdStr = reqId ? ` [${reqId}]` : '';
        return `[${timestamp}] [${level}] [${this.name}]${reqIdStr} - ${message}`;
    }
    info(message) {
        console.log(this.formatMessage('INFO', message));
    }
    debug(message) {
        if (settings.DEBUG) {
            console.debug(this.formatMessage('DEBUG', message));
        }
    }
    warning(message) {
        console.warn(this.formatMessage('WARNING', message));
    }
    error(message, error) {
        console.error(this.formatMessage('ERROR', message));
        if (error) {
            console.error(error);
        }
    }
}
export const logger = new Logger();
