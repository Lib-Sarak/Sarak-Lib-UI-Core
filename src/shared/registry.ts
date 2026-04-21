/**
 * Sarak Atomic Registry (v5.5)
 * 
 * Gerenciador local de módulos registrados para evitar dependência da lib-shared.
 */

export interface SarakModule {
    id: string;
    label: string;
    icon?: string;
    category?: string;
    component: React.ComponentType<any>;
    priority?: number;
    description?: string;
}

const registeredModules: Map<string, SarakModule> = new Map();
const localComponents: Map<string, React.ComponentType<any>> = new Map();

/**
 * Registra um componente local vinculado a um ID de sistema (v6.5).
 */
export const registerLocalComponent = (id: string, component: React.ComponentType<any>) => {
    localComponents.set(id, component);
};

/**
 * Retorna o componente associado a um ID, se existir.
 */
export const getLocalComponent = (id: string): React.ComponentType<any> | undefined => {
    return localComponents.get(id);
};

/**
 * Registra um módulo completo (módulos externos legados).
 */
export const registerSarakModule = (module: SarakModule) => {
    registeredModules.set(module.id, module);
};

/**
 * Retorna a lista de módulos registrados legado.
 */
export const getRegisteredModules = (): SarakModule[] => {
    return Array.from(registeredModules.values());
};

/**
 * Busca um módulo específico por ID.
 */
export const getSarakModule = (id: string): SarakModule | undefined => {
    return registeredModules.get(id);
};

