import { themeValidator } from './toolbox/validator.js';
import { agentRepository } from './database/repository.js';
import { routes } from './api/routes.js';
export async function initDesignAgent() {
    console.log('[Design Operator] Inicializando como módulo acoplado...');
    // Inicializa a camada de persistência (Cria tabelas se não existirem)
    await agentRepository.initDatabase();
    // Passos de Qualidade Críticos: Carregar o Dicionário Dinâmico
    await themeValidator.loadDynamicCatalog();
    return routes;
}
