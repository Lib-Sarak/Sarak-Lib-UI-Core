"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.Logger = void 0;
const settings_1 = require("../config/shared/settings");
class Logger {
    name;
    constructor(name = "agent-backend") {
        this.name = name;
    }
    formatMessage(level, message) {
        const timestamp = new Date().toISOString();
        return `[${timestamp}] [${level}] [${this.name}] - ${message}`;
    }
    info(message) {
        console.log(this.formatMessage('INFO', message));
    }
    debug(message) {
        if (settings_1.settings.DEBUG) {
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
exports.Logger = Logger;
exports.logger = new Logger();
