import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NeonDatabase } from '../../../../src/toolbox/database/neon_database.js';
import { FirebaseDatabase } from '../../../../src/toolbox/database/firebase_database.js';
import { DigitalOceanDatabase } from '../../../../src/toolbox/database/digitalocean_database.js';

describe('Toolbox Databases', () => {
    let fetchMock: any;

    beforeEach(() => {
        fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => ({ data: [] })
        });
        global.fetch = fetchMock;
    });

    describe('NeonDatabase', () => {
        it('Should format SQL query via HTTP POST', async () => {
            const db = new NeonDatabase('https://neon.local', 'api_key_123');
            await db.saveMessage('messages', 'sess_123', 'agent_123', 'user', 'Hello');

            expect(fetchMock).toHaveBeenCalledWith('https://neon.local', expect.objectContaining({
                method: 'POST',
                headers: expect.objectContaining({
                    'Authorization': 'Bearer api_key_123'
                }),
                body: expect.stringContaining('INSERT INTO messages')
            }));
        });
    });

    describe('FirebaseDatabase', () => {
        it('Should format NoSQL document via REST API', async () => {
            const db = new FirebaseDatabase('project_123', 'api_key_456');
            await db.saveMessage('messages', 'sess_123', 'agent_123', 'user', 'Hello');

            expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('project_123'), expect.objectContaining({
                method: 'POST',
                body: expect.stringContaining('stringValue')
            }));
        });
    });

    describe('DigitalOceanDatabase', () => {
        it('Should execute query using injected PG Pool', async () => {
            const poolMock = {
                query: vi.fn().mockResolvedValue({ rows: [] })
            };
            const db = new DigitalOceanDatabase(poolMock);
            await db.saveMessage('messages', 'sess_123', 'agent_123', 'user', 'Hello');

            expect(poolMock.query).toHaveBeenCalledWith(
                expect.stringContaining('INSERT INTO messages'),
                ['sess_123', 'agent_123', 'user', 'Hello']
            );
        });
    });
});
