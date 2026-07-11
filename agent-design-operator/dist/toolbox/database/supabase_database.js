import { createClient } from '@supabase/supabase-js';
export class SupabaseDatabase {
    client;
    constructor(url = process.env.SUPABASE_URL || '', key = process.env.SUPABASE_KEY || '', schema = 'public') {
        if (!url || !key) {
            throw new Error('Supabase URL and Key must be provided.');
        }
        this.client = createClient(url, key, {
            db: { schema }
        });
    }
    async saveMessage(tableName, sessionId, agentId, role, content) {
        const { error } = await this.client
            .from(tableName)
            .insert([{ session_id: sessionId, agent_id: agentId, role, content }]);
        if (error)
            throw error;
    }
    async getChatHistory(tableName, sessionId, limit) {
        const { data, error } = await this.client
            .from(tableName)
            .select('*')
            .eq('session_id', sessionId)
            .order('created_at', { ascending: false })
            .limit(limit);
        if (error)
            throw error;
        return data ? data.reverse() : [];
    }
    async saveLead(tableName, agentId, sessionId, leadData) {
        const { error } = await this.client
            .from(tableName)
            .insert([{ agent_id: agentId, session_id: sessionId, lead_data: leadData }]);
        if (error)
            throw error;
    }
    async saveTriggerEvent(tableName, agentId, sessionId, triggerType, data) {
        const { error } = await this.client
            .from(tableName)
            .insert([{ agent_id: agentId, session_id: sessionId, trigger_type: triggerType, event_data: data }]);
        if (error)
            throw error;
    }
    async getSessionState(tableName, sessionId) {
        const { data, error } = await this.client
            .from(tableName)
            .select('state_data')
            .eq('session_id', sessionId)
            .maybeSingle();
        if (error)
            throw error;
        return data?.state_data || {};
    }
    async saveSessionState(tableName, sessionId, stateData) {
        const { error } = await this.client
            .from(tableName)
            .upsert([{ session_id: sessionId, state_data: stateData }], { onConflict: 'session_id' });
        if (error)
            throw error;
    }
}
