import { settings } from '../../config/shared/settings.js';
import { logger } from '../../utils/logger.js';
export class SecurityViolationError extends Error {
    constructor(message) {
        super(message);
        this.name = "SecurityViolationError";
    }
}
export class InputValidator {
    /**
     * Sanitizes user input based on the prompt injection configuration.
     * Raises an error if malicious intent is detected.
     */
    static sanitizeInput(message) {
        const securityConfig = settings.GLOBAL_DEFAULTS.security;
        if (!securityConfig || !securityConfig.prompt_injection || !securityConfig.prompt_injection.enabled) {
            return;
        }
        const blockedKeywords = securityConfig.prompt_injection.blocked_keywords || [];
        const normalizedMessage = message.toLowerCase();
        for (const keyword of blockedKeywords) {
            if (normalizedMessage.includes(keyword.toLowerCase())) {
                logger.warn(`Security Violation: Blocked keyword detected in user input - '${keyword}'`);
                throw new SecurityViolationError("The provided input violates our safety and security policies.");
            }
        }
    }
}
