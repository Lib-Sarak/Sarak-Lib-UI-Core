import { describe, it, expect, vi } from 'vitest';
import { TelemetryMiddleware } from '../../../../src/toolbox/telemetry/telemetry_middleware.js';
import { DatabaseInterface } from '../../../../src/core/database/database_interface.js';

describe('TelemetryMiddleware', () => {
    const mockDatabase: DatabaseInterface = {
        saveMessage: vi.fn(),
        getChatHistory: vi.fn(),
        saveLead: vi.fn(),
        saveTriggerEvent: vi.fn(),
        getSessionState: vi.fn(),
        saveSessionState: vi.fn(),
    };

    it('Should extract safe metadata and omit sensitive headers', () => {
        const middleware = new TelemetryMiddleware(mockDatabase);
        const req = {
            ip: '192.168.1.1',
            method: 'POST',
            url: '/api/chat',
            headers: {
                'user-agent': 'Mozilla/5.0',
                'authorization': 'Bearer secret-token',
                'cookie': 'session_id=12345',
                'content-type': 'application/json'
            }
        };

        const metadata = middleware.extractSafeMetadata(req);

        expect(metadata.ip).toBe('192.168.1.1');
        expect(metadata.method).toBe('POST');
        expect(metadata.url).toBe('/api/chat');
        expect(metadata.userAgent).toBe('Mozilla/5.0');
        expect(metadata.headers['content-type']).toBe('application/json');
        
        // Assert sensitive data is removed
        expect(metadata.headers['authorization']).toBeUndefined();
        expect(metadata.headers['cookie']).toBeUndefined();
    });

    it('Should save trigger event using DatabaseInterface', async () => {
        const database = { ...mockDatabase, saveTriggerEvent: vi.fn() };
        const middleware = new TelemetryMiddleware(database);
        
        const req = {
            ip: '127.0.0.1',
            headers: { 'user-agent': 'curl/7.68.0' }
        };

        await middleware.trackRequest(req, 'telemetry_table', 'agent1', 'session1');

        expect(database.saveTriggerEvent).toHaveBeenCalledWith(
            'telemetry_table',
            'agent1',
            'session1',
            'SYSTEM_TELEMETRY',
            expect.objectContaining({ ip: '127.0.0.1' })
        );
    });

    it('Should handle database failures silently without throwing', async () => {
        const database = { 
            ...mockDatabase, 
            saveTriggerEvent: vi.fn().mockRejectedValue(new Error('DatabaseOfflineException')) 
        };
        const middleware = new TelemetryMiddleware(database);
        
        // This should not throw an exception
        await expect(middleware.trackRequest({}, 'telemetry_table', 'agent1', 'session1')).resolves.toBeUndefined();
        
        expect(database.saveTriggerEvent).toHaveBeenCalled();
    });
});
