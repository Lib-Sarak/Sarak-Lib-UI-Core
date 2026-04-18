/**
 * Sarak Atomic Discovery (v5.5)
 * 
 * Lista de endpoints base para escaneamento de manifestos.
 * Em produção, isso pode ser alimentado por um Service Registry ou Config Map.
 */
export const DISCOVERY_ENDPOINTS = [
    '/api/catalog',
    '/api/orchestrator',
    '/api/selector',
    '/api/usage',
    '/api/translator',
    '/api/worker',
    '/api/auth'
];

export interface ModuleManifest {
    id: string;
    label: string;
    icon: string;
    category: string;
    version: string;
    priority: number;
    endpoints: Record<string, string>;
    visualContracts?: Record<string, string>;
}

export interface DiscoveredModule extends ModuleManifest {
    status: 'online' | 'offline';
    baseUrl: string;
    component?: any;
    error?: string;
}
