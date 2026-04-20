import axios from 'axios';

const AUTH_BASE_URL = (import.meta as any).env?.VITE_API_URL_AUTH || 'http://localhost:8001';
const LLM_BASE_URL = (import.meta as any).env?.VITE_API_URL_LLM || 'http://localhost:8002';

// Instância base padrão
const api = axios.create({
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config: any) => {
    // Mantemos a baseURL unificada '/api' para que o Vite Proxy gerencie.
    // Se o sistema estiver em modo legado multiserviço, as variáveis env cuidariam disso,
    // mas no Sarak Matrix Full, tudo flui pelo Gateway.
    config.baseURL = '/api';
    
    const token = localStorage.getItem('sarak_token') || localStorage.getItem('auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response: any) => response,
    (error: any) => {
        if (error.response?.status === 401) {
            // 401 Unauthorized detected. Wiping token.
            localStorage.removeItem('sarak_token');
            sessionStorage.removeItem('auth_token');
        }
        return Promise.reject(error);
    }
);

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
        [category: string]: any[];
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

    delete: async (id: string): Promise<any> => {
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
    models: any[];
    daily_usage: any[];
    period_days: number;
}

export const usageApi = {
    getStats: async (service?: string, days: number = 30): Promise<UsageStatsResponse> => {
        const params: any = { days };
        if (service) params.service = service;
        const response = await api.get<UsageStatsResponse>('/usage/stats', { params });
        return response.data;
    },
};

export interface UserProfile {
    id: string;
    email: string;
    username: string;
    model_preferences?: any;
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

    updatePreferences: async (preferences: any): Promise<any> => {
        const response = await api.put('/auth/user/preferences/', preferences);
        return response.data;
    },

    changePassword: async (new_password: string): Promise<any> => {
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

    sync: async (): Promise<any> => {
        // Silent skip in standalone mode
        return;
    },

    listModels: async (): Promise<{ total: number; models: any[] }> => {
        const response = await api.get<any[]>('/catalog/models');
        const data = response.data || [];
        return { total: data.length, models: data };
    },

};

export default api;
