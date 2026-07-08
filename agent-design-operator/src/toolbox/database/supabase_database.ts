import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { DatabaseInterface } from '../../core/database/database_interface.js';

export class SupabaseDatabase implements DatabaseInterface {
    private client: SupabaseClient;

    constructor(
        url: string = process.env.SUPABASE_URL || '',
        key: string = process.env.SUPABASE_KEY || '',
        schema: string = 'public'
    ) {
        if (!url || !key) {
            throw new Error('Supabase URL and Key must be provided.');
        }
        this.client = createClient(url, key, {
            db: { schema }
        });
    }

    async saveMessage(tableName: string, sessionId: string, agentId: string, role: string, content: string): Promise<void> {
        const { error } = await this.client
            .from(tableName)
            .insert([{ session_id: sessionId, agent_id: agentId, role, content }]);
        if (error) throw error;
    }

    async getChatHistory(tableName: string, sessionId: string, limit: number): Promise<any[]> {
        const { data, error } = await this.client
            .from(tableName)
            .select('*')
            .eq('session_id', sessionId)
            .order('created_at', { ascending: false })
            .limit(limit);
        if (error) throw error;
        return data ? data.reverse() : [];
    }

    async saveLead(tableName: string, agentId: string, sessionId: string, leadData: Record<string, any>): Promise<void> {
        const { error } = await this.client
            .from(tableName)
            .insert([{ agent_id: agentId, session_id: sessionId, lead_data: leadData }]);
        if (error) throw error;
    }

    async saveTriggerEvent(tableName: string, agentId: string, sessionId: string, triggerType: string, data: Record<string, any>): Promise<void> {
        const { error } = await this.client
            .from(tableName)
            .insert([{ agent_id: agentId, session_id: sessionId, trigger_type: triggerType, event_data: data }]);
        if (error) throw error;
    }

    async getSessionState(tableName: string, sessionId: string): Promise<Record<string, any>> {
        const { data, error } = await this.client
            .from(tableName)
            .select('state_data')
            .eq('session_id', sessionId)
            .maybeSingle();
        if (error) throw error;
        return data?.state_data || {};
    }

    async saveSessionState(tableName: string, sessionId: string, stateData: Record<string, any>): Promise<void> {
        const { error } = await this.client
            .from(tableName)
            .upsert([{ session_id: sessionId, state_data: stateData }], { onConflict: 'session_id' });
        if (error) throw error;
    }
}
