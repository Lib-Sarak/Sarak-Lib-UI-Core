/**
 * Sarak Discovery Core Types (v11.0)
 */

export type VisualContractType = 
    | 'TABLE' 
    | 'STATS' 
    | 'CARD_GRID' 
    | 'MANAGEMENT_GRID' 
    | 'FORM' 
    | 'CHAT_INTERFACE' 
    | 'CHART' 
    | 'FLOW_DIAGRAM' 
    | 'ELITE_CHART' 
    | 'ADVANCED_CHAT' 
    | 'SECURITY_ORCHESTRATOR' 
    | 'CATALOG_GRID' 
    | 'CUSTOM' 
    | 'AUTH_FLOW';

export interface VisualContract {
    id: string;
    type: VisualContractType;
    label: string;
    endpoint: string;
    tab?: string;
    mapping?: Record<string, string>;
    filters?: any[];
    actions?: Array<{
        label: string;
        endpoint: string;
        method: 'POST' | 'PATCH' | 'DELETE';
        icon?: string;
    }>;
    groupBy?: string;
    ghostGroups?: string[];
    headerActions?: { label: string; action: string }[];
    groupActions?: { label: string; icon: string; action: string }[];
    formMapping?: Record<string, string>;
    role?: 'primary' | 'secondary' | 'neutral' | 'accent';
    density?: 'compact' | 'standard' | 'spacious';
    importance?: 'hero' | 'base' | 'subtle';
    component?: string;
    config?: any;
}

export interface ModuleManifest {
    id: string;
    label: string;
    icon: string;
    category: string;
    version?: string;
    priority: number;
    endpoints?: Record<string, string>;
    visualContracts?: VisualContract[];
}

export interface DiscoveredModule extends ModuleManifest {
    status: 'online' | 'offline';
    baseUrl?: string;
    component?: any;
    error?: string;
}
