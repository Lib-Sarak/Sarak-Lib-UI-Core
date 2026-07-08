import { describe, it, expect, vi } from 'vitest';
import { LeadManager } from '../../../../src/toolbox/action/lead_manager.js';
import { DatabaseInterface } from '../../../../src/core/database/database_interface.js';
import { NotifierInterface } from '../../../../src/toolbox/action/notifier.interface.js';

describe('LeadManager', () => {
    it('Should save a lead to the database and notify admin', async () => {
        const mockDatabase: DatabaseInterface = {
            saveMessage: vi.fn(),
            getChatHistory: vi.fn(),
            saveLead: vi.fn(),
            saveTriggerEvent: vi.fn(),
            getSessionState: vi.fn(),
            saveSessionState: vi.fn(),
        };

        const mockNotifier: NotifierInterface = {
            notifyAdmin: vi.fn(),
        };

        const manager = new LeadManager(mockDatabase, [mockNotifier]);

        await manager.saveLead('leads', 'agent1', 'session1', { email: 'test@test.com' });

        expect(mockDatabase.saveLead).toHaveBeenCalledWith('leads', 'agent1', 'session1', { email: 'test@test.com' });
        expect(mockNotifier.notifyAdmin).toHaveBeenCalledWith('lead_captured', {
            agentId: 'agent1',
            sessionId: 'session1',
            leadData: { email: 'test@test.com' }
        });
    });

    it('Should gracefully handle notifier failures without throwing', async () => {
        const mockDatabase: DatabaseInterface = {
            saveMessage: vi.fn(),
            getChatHistory: vi.fn(),
            saveLead: vi.fn(),
            saveTriggerEvent: vi.fn(),
            getSessionState: vi.fn(),
            saveSessionState: vi.fn(),
        };

        const mockNotifierFailing: NotifierInterface = {
            notifyAdmin: vi.fn().mockRejectedValue(new Error('Network error')),
        };

        const mockNotifierSuccess: NotifierInterface = {
            notifyAdmin: vi.fn(),
        };

        const manager = new LeadManager(mockDatabase, [mockNotifierFailing, mockNotifierSuccess]);

        // Should not throw
        await expect(manager.saveLead('leads', 'agent1', 'session1', { email: 'test@test.com' })).resolves.toBeUndefined();

        expect(mockDatabase.saveLead).toHaveBeenCalled();
        expect(mockNotifierFailing.notifyAdmin).toHaveBeenCalled();
        expect(mockNotifierSuccess.notifyAdmin).toHaveBeenCalled();
    });
});
