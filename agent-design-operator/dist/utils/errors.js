export class ConfigurationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ConfigurationError';
    }
}
export class AgentNotFoundError extends Error {
    constructor(message) {
        super(message);
        this.name = 'AgentNotFoundError';
    }
}
