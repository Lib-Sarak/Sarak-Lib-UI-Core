import { ComponentSchema } from '../types';

/**
 * Mapeamento 100% Granular: Configurações do Sistema Sarak
 * 
 * Controla o comportamento global da biblioteca, descobertas e blacklist.
 */
export const SystemSchema: ComponentSchema = {
    id: 'system',
    label: 'Configurações de Sistema',
    tokens: [
        {
            id: 'moduleBlacklist',
            label: 'Blacklist de Módulos',
            category: 'Descoberta',
            type: 'select', // No futuro pode ser um array de chips, por enquanto select ou texto
            constraints: {
                options: [
                    { id: 'standard', label: 'Padrão (Filtra Demos)' },
                    { id: 'none', label: 'Exibir Tudo (Debug)' }
                ],
            },
            defaultValue: 'standard'
        },
        {
            id: 'industrialRegistry',
            label: 'Modo do Registro',
            category: 'Core',
            type: 'boolean',
            defaultValue: true // Se false, desativa injeção passiva global
        }
    ]
};
