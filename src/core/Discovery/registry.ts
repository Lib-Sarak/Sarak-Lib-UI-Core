/**
 * Sarak Registry (v5.5)
 * 
 * Local manager for registered modules to avoid dependency on lib-shared.
 */

/**
 * Props que um componente registrado pode receber (heterogêneo, sem `any`).
 * Espelha o padrão canônico de `ManifestComponentProps` (Spec 22).
 */
export interface SarakComponentProps {
    children?: React.ReactNode;
    [prop: string]: unknown;
}

/** Tipo uniforme sob o qual qualquer componente é guardado no registro. */
export type SarakComponent = React.ComponentType<SarakComponentProps>;

const toSarakComponent = <P extends object>(
    component: React.ComponentType<P>,
): SarakComponent => component as unknown as SarakComponent;

export interface SarakModule {
    id: string;
    label: string;
    icon?: string;
    category?: string;
    component?: SarakComponent;
    components?: Record<string, SarakComponent>;
    priority?: number;
    description?: string;
    isLocal?: boolean;
}

/** Forma das janelas que carregam o registro soberano por instância. */
interface SarakRegistryGlobal {
    __SARAK_REGISTRY_MODS__?: Map<string, SarakModule>;
    __SARAK_REGISTRY_COMPS__?: Map<string, SarakComponent>;
    __SARAK_REGISTRY_LISTENERS__?: Set<() => void>;
}

// --- INSTANCE SOVEREIGNTY (v9.1) ---
// Garantimos que, mesmo se houver múltiplas instâncias da biblioteca (ex: link local + node_modules),
// elas compartilhem o mesmo registro global no objeto window.
const _global = (typeof window !== 'undefined' ? window : {}) as unknown as SarakRegistryGlobal;

const registeredModules: Map<string, SarakModule> = _global.__SARAK_REGISTRY_MODS__ || new Map();
_global.__SARAK_REGISTRY_MODS__ = registeredModules;

const localComponents: Map<string, SarakComponent> = _global.__SARAK_REGISTRY_COMPS__ || new Map();
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
export const registerLocalComponent = <P extends object>(id: string, component: React.ComponentType<P>) => {
    localComponents.set(id, toSarakComponent(component));
    notifyListeners();
};

/**
 * Returns the component associated with an ID, if it exists.
 */
export const getLocalComponent = (id: string): SarakComponent | undefined => {
    return localComponents.get(id);
};

/**
 * Validates a Sarak module manifest for industrial standards (v9.5).
 */
const validateSarakModule = (manifest: SarakModule) => {
    const warnings: string[] = [];
    
    if (!manifest.id) {
        console.error("[Sarak:Registry] CRITICAL: Module registration failed. Missing 'id'.");
        return false;
    }
    
    if (!manifest.label) warnings.push("Missing 'label' (The display name in the menu).");
    if (!manifest.icon) warnings.push("Missing 'icon' (Used for visual identification).");
    
    // Verificação de Componente (v9.5 Industrial)
    const hasComponent = !!manifest.component || !!localComponents.get(manifest.id);
    if (!hasComponent) {
        warnings.push(`No component found for module '${manifest.id}'. Ensure you call registerLocalComponent('${manifest.id}', ...) before or alongside.`);
    }

    if (warnings.length > 0) {
        console.warn(`[Sarak:Registry] Warning for module '${manifest.id}':\n- ${warnings.join('\n- ')}`);
    }

    return true;
};

/**
 * Registers or updates a Sarak module in the system (v9.1 - Merging Support).
 */
export const registerSarakModule = (manifest: SarakModule) => {
    if (!validateSarakModule(manifest)) return;

    const existing = registeredModules.get(manifest.id);
    const mod: SarakModule = { ...existing, ...manifest, isLocal: true };
    registeredModules.set(manifest.id, mod);
    
    // Notificar assinantes
    notifyListeners();
};

/**
 * Returns the list of registered modules with resolved components (v9.1).
 */
export const getRegisteredModules = (): SarakModule[] => {
    return Array.from(registeredModules.values()).map(mod => {
        // Resolução Estrita (v9.2): ID do Módulo === Chave do Componente
        const resolvedComponent = mod.component || localComponents.get(mod.id);
        
        return {
            ...mod,
            component: resolvedComponent
        };
    });
};

/**
 * Retrieves a specific module by ID.
 */
export const getSarakModule = (id: string): SarakModule | undefined => {
    return registeredModules.get(id);
};


