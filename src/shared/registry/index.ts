/**
 * Sarak Atomic Module Registry (v5.5 - Sovereign)
 */
import { SarakModule } from '../types';

const _registeredModules: SarakModule[] = [];

/**
 * Registra um novo módulo ou ferramenta no ecossistema Sarak.
 */
export function registerSarakModule(module: SarakModule): void {
    if (!_registeredModules.find(m => m.id === module.id)) {
        _registeredModules.push({
            ...module,
            icon: module.icon || 'Box',
            category: module.category || 'Outros',
            priority: module.priority ?? 99,
            subItems: module.subItems || [],
        });
    }
}

/**
 * Retorna a lista de módulos já capturados.
 */
export function getRegisteredModules(): SarakModule[] {
    return _registeredModules;
}
