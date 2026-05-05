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
        },

        // --- GRID & SPACING ---
        {
            id: 'gridUnit',
            label: 'Unidade de Grade (Base)',
            category: 'Grade & Espaçamento',
            type: 'slider',
            unit: 'px',
            constraints: { min: 2, max: 12 },
            defaultValue: 4,
            cssVars: ['--sarak-grid-unit']
        },
        {
            id: 'containerMaxWidth',
            label: 'Largura Máxima do Container',
            category: 'Grade & Espaçamento',
            type: 'slider',
            unit: 'px',
            constraints: { min: 800, max: 2000, step: 20 },
            defaultValue: 1440,
            cssVars: ['--sarak-container-max']
        },

        // --- DEPTH (Z-INDEX) ---
        {
            id: 'zIndexModal',
            label: 'Profundidade: Modais',
            category: 'Camadas (Z-Index)',
            type: 'number',
            defaultValue: 1000,
            cssVars: ['--sarak-z-modal']
        },
        {
            id: 'zIndexDropdown',
            label: 'Profundidade: Dropdowns',
            category: 'Camadas (Z-Index)',
            type: 'number',
            defaultValue: 500,
            cssVars: ['--sarak-z-dropdown']
        },
        {
            id: 'zIndexToast',
            label: 'Profundidade: Notificações',
            category: 'Camadas (Z-Index)',
            type: 'number',
            defaultValue: 2000,
            cssVars: ['--sarak-z-toast']
        },

        // --- ACESSIBILIDADE & PERFORMANCE ---
        {
            id: 'reducedMotion',
            label: 'Reduzir Movimento',
            category: 'Performance',
            type: 'boolean',
            defaultValue: false,
            cssVars: ['--sarak-reduced-motion']
        }
    ]
};
