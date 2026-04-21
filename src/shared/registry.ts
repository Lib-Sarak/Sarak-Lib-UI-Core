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

/**
 * Registra um módulo no ecossistema local.
 */
export const registerSarakModule = (module: SarakModule) => {
    registeredModules.set(module.id, module);
    console.log(`[Sarak:Registry] Módulo registrado localmente: ${module.id}`);
};

/**
 * Retorna a lista de módulos registrados.
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
