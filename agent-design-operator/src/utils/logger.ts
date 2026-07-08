import { settings } from '../config/shared/settings.js';
import { AsyncLocalStorage } from 'async_hooks';

export const loggerContext = new AsyncLocalStorage<string>();

export class Logger {
    private name: string;

    constructor(name: string = "agent-backend") {
        this.name = name;
    }

    private formatMessage(level: string, message: string): string {
        const timestamp = new Date().toISOString();
        const reqId = loggerContext.getStore();
        const reqIdStr = reqId ? ` [${reqId}]` : '';
        return `[${timestamp}] [${level}] [${this.name}]${reqIdStr} - ${message}`;
    }

    info(message: string): void {
        console.log(this.formatMessage('INFO', message));
    }

    debug(message: string): void {
        if (settings.DEBUG) {
            console.debug(this.formatMessage('DEBUG', message));
        }
    }

    warning(message: string): void {
        console.warn(this.formatMessage('WARNING', message));
    }

    error(message: string, error?: any): void {
        console.error(this.formatMessage('ERROR', message));
        if (error) {
            console.error(error);
        }
    }
}

export const logger = new Logger();
