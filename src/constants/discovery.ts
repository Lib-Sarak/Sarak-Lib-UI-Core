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

export type VisualContractType = 'TABLE' | 'STATS' | 'CARD_GRID' | 'MANAGEMENT_GRID' | 'FORM' | 'CHAT_INTERFACE' | 'CHART' | 'FLOW_DIAGRAM' | 'ELITE_CHART' | 'ADVANCED_CHAT' | 'SECURITY_ORCHESTRATOR';

export interface VisualContract {
    id: string;
    type: VisualContractType;
    label: string;
    endpoint: string;
    tab?: string; // Propriedade para agrupar contratos em abas (v6.1)
    mapping?: Record<string, string>;
    filters?: any[]; // Configurações de filtro (v6.4)
    actions?: Array<{
        label: string;
        endpoint: string;
        method: 'POST' | 'PATCH' | 'DELETE';
        icon?: string;
    }>;
    groupBy?: string; // Campo para agrupamento no MANAGEMENT_GRID (v6.4)
    ghostGroups?: string[]; // Sarak v6.5
    headerActions?: { label: string; action: string }[]; // Sarak v6.5
    groupActions?: { label: string; icon: string; action: string }[]; // Sarak v6.5
    formMapping?: Record<string, string>; // Mapeamento de campos para formulários de ação (v6.5)
    
    // Propriedades Abstratas (v9.0 - Plug & Play)
    role?: 'primary' | 'secondary' | 'neutral' | 'accent';
    density?: 'compact' | 'standard' | 'spacious';
    importance?: 'hero' | 'base' | 'subtle';
}

export interface ModuleManifest {
    id: string;
    label: string;
    icon: string;
    category: string;
    version: string;
    priority: number;
    endpoints: Record<string, string>;
    visualContracts?: VisualContract[];
}

export interface DiscoveredModule extends ModuleManifest {
    status: 'online' | 'offline';
    baseUrl: string;
    component?: any;
    error?: string;
}
