import { describe, it, expect, vi } from 'vitest';
import { SessionStateManager } from '../../../../src/toolbox/memory/session_state_manager.js';
import { DatabaseInterface } from '../../../../src/core/database/database_interface.js';

describe('SessionStateManager', () => {
    it('Should format valid state correctly', () => {
        const mockDatabase = {} as DatabaseInterface;
        const manager = new SessionStateManager(mockDatabase);
        
        const stateData = { user_name: 'John', language: 'pt' };
        const formatted = manager.formatState(stateData);
        
        expect(formatted).toContain('[PERSISTENT USER MEMORY (STATE)]');
        expect(formatted).toContain('"user_name": "John"');
    });

    it('Should return empty string for null or empty object', () => {
        const mockDatabase = {} as DatabaseInterface;
        const manager = new SessionStateManager(mockDatabase);
        
        expect(manager.formatState(null)).toBe('');
        expect(manager.formatState(undefined)).toBe('');
        expect(manager.formatState({})).toBe('');
    });

    it('Should fetch and format state from database', async () => {
        const mockDatabase: DatabaseInterface = {
            saveMessage: vi.fn(),
            getChatHistory: vi.fn(),
            saveLead: vi.fn(),
            saveTriggerEvent: vi.fn(),
            getSessionState: vi.fn().mockResolvedValue({ status: 'active' }),
            saveSessionState: vi.fn(),
        };
        const manager = new SessionStateManager(mockDatabase);
        
        const formatted = await manager.fetchAndFormatState('states', 'session1');
        expect(mockDatabase.getSessionState).toHaveBeenCalledWith('states', 'session1');
        expect(formatted).toContain('[PERSISTENT USER MEMORY (STATE)]');
        expect(formatted).toContain('"status": "active"');
    });

    it('Should save state to database', async () => {
        const mockDatabase: DatabaseInterface = {
            saveMessage: vi.fn(),
            getChatHistory: vi.fn(),
            saveLead: vi.fn(),
            saveTriggerEvent: vi.fn(),
            getSessionState: vi.fn(),
            saveSessionState: vi.fn(),
        };
        const manager = new SessionStateManager(mockDatabase);
        
        await manager.saveState('states', 'session1', { key: 'value' });
        expect(mockDatabase.saveSessionState).toHaveBeenCalledWith('states', 'session1', { key: 'value' });
    });
});
