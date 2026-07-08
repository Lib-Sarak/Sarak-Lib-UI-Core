import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SupabaseDatabase } from '../../../../src/toolbox/database/supabase_database.js';

// Mock the createClient from @supabase/supabase-js
vi.mock('@supabase/supabase-js', () => {
    return {
        createClient: vi.fn(() => ({
            from: vi.fn(() => ({
                insert: vi.fn(() => ({ error: null })),
                select: vi.fn(() => ({
                    eq: vi.fn(() => ({
                        order: vi.fn(() => ({
                            limit: vi.fn(() => ({ data: [{ session_id: '123' }], error: null }))
                        })),
                        single: vi.fn(() => ({ data: { state_data: { foo: 'bar' } }, error: null })),
                        maybeSingle: vi.fn(() => ({ data: { state_data: { foo: 'bar' } }, error: null }))
                    }))
                })),
                upsert: vi.fn(() => ({ error: null }))
            }))
        }))
    };
});

describe('SupabaseDatabase', () => {
    let originalEnv: NodeJS.ProcessEnv;

    beforeEach(() => {
        originalEnv = process.env;
        process.env = { ...originalEnv, SUPABASE_URL: 'http://localhost', SUPABASE_KEY: 'test_key' };
    });

    it('should instantiate properly with schema injection', () => {
        const db = new SupabaseDatabase(process.env.SUPABASE_URL, process.env.SUPABASE_KEY, 'my_schema');
        expect(db).toBeInstanceOf(SupabaseDatabase);
    });

    it('should throw an error if missing URL or KEY', () => {
        expect(() => new SupabaseDatabase('', '')).toThrow('Supabase URL and Key must be provided.');
    });

    it('should save a message without error', async () => {
        const db = new SupabaseDatabase();
        await expect(db.saveMessage('chat_history', 'session1', 'agent1', 'user', 'hello')).resolves.toBeUndefined();
    });

    it('should retrieve chat history without error', async () => {
        const db = new SupabaseDatabase();
        const history = await db.getChatHistory('chat_history', 'session1', 10);
        expect(history.length).toBe(1);
    });
    
    it('should save session state without error', async () => {
        const db = new SupabaseDatabase();
        await expect(db.saveSessionState('states', 'session1', { step: 1 })).resolves.toBeUndefined();
    });

    it('should get session state without error', async () => {
        const db = new SupabaseDatabase();
        const state = await db.getSessionState('states', 'session1');
        expect(state).toHaveProperty('foo', 'bar');
    });
});
