/**
 * Sarak Registry (v5.5)
 * 
 * Local manager for registered modules to avoid dependency on lib-shared.
 */

export interface SarakModule {
    id: string;
    label: string;
    icon?: string;
    category?: string;
    component?: React.ComponentType<any>;
    components?: Record<string, React.ComponentType<any>>;
    priority?: number;
    description?: string;
}

// --- INSTANCE SOVEREIGNTY (v9.1) ---
// Garantimos que, mesmo se houver múltiplas instâncias da biblioteca (ex: link local + node_modules),
// elas compartilhem o mesmo registro global no objeto window.
const _global = (typeof window !== 'undefined' ? window : {}) as any;

const registeredModules: Map<string, SarakModule> = _global.__SARAK_REGISTRY_MODS__ || new Map();
_global.__SARAK_REGISTRY_MODS__ = registeredModules;

const localComponents: Map<string, React.ComponentType<any>> = _global.__SARAK_REGISTRY_COMPS__ || new Map();
_global.__SARAK_REGISTRY_COMPS__ = localComponents;

const listeners: Set<() => void> = _global.__SARAK_REGISTRY_LISTENERS__ || new Set();
_global.__SARAK_REGISTRY_LISTENERS__ = listeners;

const notifyListeners = () => {
    listeners.forEach(listener => listener());
};

/**
 * Subscribes to registry changes (v9.0 Passive Discovery).
 */
export const subscribeToRegistry = (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
};

/**
 * Registers a local component linked to a system ID (v6.5).
 */
export const registerLocalComponent = (id: string, component: React.ComponentType<any>) => {
    console.log(`[Registry] Registering Component: ${id}`);
    localComponents.set(id, component);
    notifyListeners();
};

/**
 * Returns the component associated with an ID, if it exists.
 */
export const getLocalComponent = (id: string): React.ComponentType<any> | undefined => {
    return localComponents.get(id);
};

/**
 * Registers or updates a Sarak module in the system (v9.1 - Merging Support).
 */
export const registerSarakModule = (manifest: SarakModule) => {
    const existing = _global.__SARAK_REGISTRY_MODS__.get(manifest.id);
    const mod = { ...existing, ...manifest, isLocal: true };
    _global.__SARAK_REGISTRY_MODS__.set(manifest.id, mod);
    
    console.log(`[Registry] Registered/Updated module: ${manifest.id}. Total: ${_global.__SARAK_REGISTRY_MODS__.size}`);
    
    // Notificar assinantes
    notifyListeners();
};

/**
 * Returns the list of registered modules with resolved components (v9.1).
 */
export const getRegisteredModules = (): SarakModule[] => {
    const modules = Array.from(registeredModules.values()).map(mod => {
        // Resolução Estrita (v9.2): ID do Módulo === Chave do Componente
        const resolvedComponent = mod.component || localComponents.get(mod.id);
        
        return {
            ...mod,
            component: resolvedComponent
        };
    });
    
    console.log(`[Registry] Returning ${modules.length} modules:`, modules.map(m => `${m.id} (${m.component ? 'READY' : 'JSON-ONLY'})`));
    return modules;
};

/**
 * Retrieves a specific module by ID.
 */
export const getSarakModule = (id: string): SarakModule | undefined => {
    return registeredModules.get(id);
};


