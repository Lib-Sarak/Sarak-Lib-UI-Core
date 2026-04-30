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

const registeredModules: Map<string, SarakModule> = new Map();
const localComponents: Map<string, React.ComponentType<any>> = new Map();

/**
 * Registers a local component linked to a system ID (v6.5).
 */
export const registerLocalComponent = (id: string, component: React.ComponentType<any>) => {
    console.log(`[Registry] Registering Component: ${id}`);
    localComponents.set(id, component);
};

/**
 * Returns the component associated with an ID, if it exists.
 */
export const getLocalComponent = (id: string): React.ComponentType<any> | undefined => {
    return localComponents.get(id);
};

/**
 * Registers a complete module (legacy external modules).
 */
export const registerSarakModule = (module: SarakModule) => {
    console.log(`[Registry] Registering Module: ${module.id}`);
    registeredModules.set(module.id, module);
};

/**
 * Returns the list of legacy registered modules.
 */
export const getRegisteredModules = (): SarakModule[] => {
    return Array.from(registeredModules.values()).map(mod => ({
        ...mod,
        component: mod.component || localComponents.get(mod.id)
    }));
};

/**
 * Retrieves a specific module by ID.
 */
export const getSarakModule = (id: string): SarakModule | undefined => {
    return registeredModules.get(id);
};

