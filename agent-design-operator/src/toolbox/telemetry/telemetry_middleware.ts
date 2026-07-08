import { DatabaseInterface } from '../../core/database/database_interface.js';

export class TelemetryMiddleware {
    constructor(private database: DatabaseInterface) {}

    /**
     * Extracts safe metadata from a generic HTTP request object.
     * Omits sensitive data like authorization headers and cookies.
     */
    extractSafeMetadata(req: any): Record<string, any> {
        if (!req) return {};

        const headers = req.headers || {};
        const safeHeaders: Record<string, string> = {};
        
        // Copy headers safely, omitting sensitive ones
        for (const [key, value] of Object.entries(headers)) {
            const lowerKey = key.toLowerCase();
            if (lowerKey !== 'authorization' && lowerKey !== 'cookie') {
                safeHeaders[lowerKey] = String(value);
            }
        }

        return {
            ip: req.ip || req.socket?.remoteAddress || 'unknown',
            method: req.method || 'unknown',
            url: req.url || req.originalUrl || 'unknown',
            headers: safeHeaders,
            userAgent: headers['user-agent'] || 'unknown',
            language: headers['accept-language'] || 'unknown',
        };
    }

    /**
     * Asynchronously tracks the request metadata by saving a trigger event.
     * Swallows any exceptions to prevent breaking the main LLM flow.
     */
    async trackRequest(req: any, tableName: string, agentId: string, sessionId: string): Promise<void> {
        try {
            const safeData = this.extractSafeMetadata(req);
            await this.database.saveTriggerEvent(tableName, agentId, sessionId, 'SYSTEM_TELEMETRY', safeData);
        } catch (error) {
            console.error('[TelemetryMiddleware] Failed to save telemetry event:', error);
        }
    }
}
