import { ComponentSchema } from '../types';

/**
 * Mapeamento 100% Granular: Branding & Identidade
 */
export const IdentitySchema: ComponentSchema = {
    id: 'identity',
    label: 'Branding & Identidade',
    tokens: [
        {
            id: 'systemName',
            label: 'Nome do Sistema',
            category: 'Identidade',
            type: 'string',
            defaultValue: 'SARAK SOVEREIGN'
        },
        {
            id: 'logoUrl',
            label: 'URL do Logo (Light)',
            category: 'Logo',
            type: 'string',
            defaultValue: ''
        },
        {
            id: 'logoDarkUrl',
            label: 'URL do Logo (Dark)',
            category: 'Logo',
            type: 'string',
            defaultValue: ''
        },
        {
            id: 'logoScale',
            label: 'Escala do Logo',
            category: 'Logo',
            type: 'slider',
            min: 0.5,
            max: 2,
            step: 0.1,
            defaultValue: 1,
            cssVars: ['--logo-scale']
        },
        {
            id: 'logoPosition',
            label: 'Posição do Logo',
            category: 'Logo',
            type: 'select',
            options: [
                { id: 'left', label: 'Esquerda' },
                { id: 'center', label: 'Centro' },
                { id: 'right', label: 'Direita' }
            ],
            defaultValue: 'left'
        }
    ]
};
