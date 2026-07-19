import axios, { InternalAxiosRequestConfig } from 'axios';

/**
 * Instância base para os hooks de dados dos templates pesados (SarakTable/SarakChart/
 * SarakForm/SarakManagementGrid/SarakSecurityOrchestrator — ver `hooks/useXxxData.ts`).
 *
 * Fronteira de Confiança (Spec 08 §6.2 / Spec 20 §2.1): a Sarak NUNCA lê nem escreve
 * token de autenticação — só o host sabe onde ele vive. Este cliente não injeta
 * `Authorization` sozinho; se o host precisa de requisições autenticadas aqui, deve
 * compor o cabeçalho no ponto de chamada (fora desta lib) ou, no caminho declarativo
 * (manifesto), usar `networkInterceptor` — o único canal de rede que recebe auth do
 * importador (Regra 5).
 */
const api = axios.create({
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    // Mantemos a baseURL unificada '/api' para que o Vite Proxy gerencie.
    config.baseURL = '/api';
    return config;
});

export interface ApiKeyStatus {
    service: string;
    is_valid: boolean;
    models_status: Array<{
        name: string;
        available: boolean;
        blocked: boolean;
        status: string;
        category?: string;
        tier?: string;
        elo_rating?: number;
        performance_score?: number;
        win_rate?: number;
        total_votes?: number;
        organization?: string;
        license_type?: string;
        tier_reason?: string;
        quota_used?: number;
        quota_limit?: number;
        cost_last_24h?: number;
        input_price?: number;
        output_price?: number;
    }>;
    available_models: string[];
    blocked_models: string[];
    error: string | null;
    models_by_category?: {
        [category: string]: unknown[];
    };
    credits?: string | number | null;
}

export interface ApiKeyResponse {
    id: string;
    service: string;
    created_at?: string;
    updated_at?: string;
}

export interface ApiKeyCreate {
    service: string;
    api_key: string;
}

export const apiKeysApi = {
    list: async (): Promise<{ api_keys: ApiKeyResponse[]; total: number }> => {
        const response = await api.get('/orchestrator/keys');
        const data = response.data || [];
        return { api_keys: data, total: data.length };
    },

    create: async (keyData: ApiKeyCreate): Promise<ApiKeyResponse> => {
        const response = await api.post<ApiKeyResponse>('/orchestrator/keys', {
            service: keyData.service,
            key: keyData.api_key,
            name: "Principal"
        });
        return response.data;
    },

    delete: async (id: string): Promise<unknown> => {
        const response = await api.delete(`/orchestrator/keys/${id}`);
        return response.data;
    },

    checkSavedStatus: async (service: string): Promise<ApiKeyStatus> => {
        const response = await api.post<ApiKeyStatus>(`/orchestrator/keys/check/${service}/saved`);
        return response.data;
    },

};

export interface UsageStatsResponse {
    total_tokens: number;
    input_tokens: number;
    output_tokens: number;
    requests: number;
    models: Record<string, unknown>[];
    daily_usage: Record<string, unknown>[];
    period_days: number;
}

export const usageApi = {
    getStats: async (service?: string, days: number = 30): Promise<UsageStatsResponse> => {
        const params: Record<string, string | number> = { days };
        if (service) params.service = service;
        const response = await api.get<UsageStatsResponse>('/usage/stats', { params });
        return response.data;
    },
};

export interface UserProfile {
    id: string;
    email: string;
    username: string;
    model_preferences?: Record<string, unknown>;
}

export interface LoginRequest {
    email: string;
    password?: string;
}

export interface TokenResponse {
    access_token: string;
    token_type: string;
    user_id: string;
    username: string;
}

export const authApi = {
    login: async (data: LoginRequest): Promise<TokenResponse> => {
        const response = await api.post<TokenResponse>('/auth/login', data);
        return response.data;
    },

    getProfile: async (): Promise<UserProfile> => {
        const response = await api.get<UserProfile>('/auth/me');
        return response.data;
    },

    updatePreferences: async (preferences: Record<string, unknown>): Promise<unknown> => {
        const response = await api.put('/auth/user/preferences/', preferences);
        return response.data;
    },

    changePassword: async (new_password: string): Promise<unknown> => {
        const response = await api.post('/auth/change-password', null, { params: { new_password } });
        return response.data;
    },
};

export interface CatalogStatusResponse {
    is_populated: boolean;
    total_models: number;
    last_updated: string | null;
    source: string | null;
    api_available: boolean;
    api_error: string | null;
    using_mock_data: boolean;
}

export const modelCatalogApi = {
    getStatus: async (): Promise<CatalogStatusResponse> => {
        const response = await api.get<CatalogStatusResponse>('/catalog/status');
        return response.data;
    },

    sync: async (): Promise<void> => {
        // Silent skip in standalone mode
        return;
    },

    listModels: async (): Promise<{ total: number; models: Record<string, unknown>[] }> => {
        const response = await api.get<Record<string, unknown>[]>('/catalog/models');
        const data = response.data || [];
        return { total: data.length, models: data };
    },

};

export default api;
