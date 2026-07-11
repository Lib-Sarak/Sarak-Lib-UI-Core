import rateLimit from 'express-rate-limit';
import crypto from 'crypto';
import { logger, loggerContext } from '../utils/logger.js';
import { settings } from '../config/shared/settings.js';
export function loggingMiddleware(req, res, next) {
    const startTime = Date.now();
    const requestId = crypto.randomUUID();
    // Inject request ID into response header
    res.setHeader('x-request-id', requestId);
    loggerContext.run(requestId, () => {
        logger.info(`Incoming Request: ${req.method} ${req.path}`);
        // Intercept response finish to log duration
        res.on('finish', () => {
            const processTime = (Date.now() - startTime) / 1000;
            logger.info(`Completed Request: ${req.method} ${req.path} ` +
                `| Status: ${res.statusCode} | Duration: ${processTime.toFixed(4)}s`);
        });
        next();
    });
}
export function authMiddleware(req, res, next) {
    const securityConfig = settings.GLOBAL_DEFAULTS.security;
    const authEnabled = securityConfig?.api_auth?.enabled ?? false;
    if (!authEnabled) {
        return next();
    }
    const authHeader = req.headers['x-api-key'];
    if (!authHeader) {
        logger.warning('Unauthorized request missing x-api-key');
        return res.status(401).json({ detail: "Unauthorized: Missing API Key" });
    }
    if (!settings.API_AUTH_KEYS.includes(authHeader)) {
        logger.warning('Unauthorized request with invalid x-api-key');
        return res.status(401).json({ detail: "Unauthorized: Invalid API Key" });
    }
    next();
}
const securityConfig = settings.GLOBAL_DEFAULTS.security;
const rlEnabled = securityConfig?.rate_limit?.enabled ?? false;
const rlWindowMs = (securityConfig?.rate_limit?.window_seconds ?? 60) * 1000;
const rlMax = securityConfig?.rate_limit?.max_requests ?? 15;
export const rateLimiter = rateLimit({
    windowMs: rlWindowMs,
    max: rlMax,
    message: { detail: "Too Many Requests. Rate limit exceeded." },
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => !rlEnabled // Skip entirely if disabled in config
});
