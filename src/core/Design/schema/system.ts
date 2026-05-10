import { ComponentSchema } from '../types';

/**
 * SCHEMA: CONFIGURAÇÕES GLOBAIS
 * Controla o comportamento base do sistema, scrollbars e layout.
 */
export const SystemSchema: ComponentSchema = {
    id: 'system',
    label: 'Configurações Globais',
    pilar: 'system',
    tokens: [
        {
            id: 'bgBaseColor',
            label: 'Cor de Fundo Base',
            category: 'Ambiente Global',
            type: 'color',
            defaultValue: '#0a0a0c',
            cssVars: ['--sarak-bg-base']
        },
        {
            id: 'layoutPadding',
            label: 'Respiro do Conteúdo (Padding)',
            category: 'Ambiente Global',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 80 },
            defaultValue: 32,
            cssVars: ['--sarak-layout-padding']
        },
        {
            id: 'scrollbarWidth',
            label: 'Largura da Scrollbar',
            category: 'Scrollbars',
            type: 'slider',
            unit: 'px',
            constraints: { min: 2, max: 12 },
            defaultValue: 6,
            cssVars: ['--sarak-scrollbar-width']
        },
        {
            id: 'scrollbarThumbColor',
            label: 'Cor do Trilho (Thumb)',
            category: 'Scrollbars',
            type: 'color',
            defaultValue: 'rgba(255, 255, 255, 0.1)',
            cssVars: ['--sarak-scrollbar-thumb']
        },
        {
            id: 'industrialRegistry',
            label: 'Modo do Registro Industrial',
            category: 'Core Engineering',
            type: 'boolean',
            defaultValue: true
        }
    ]
};
