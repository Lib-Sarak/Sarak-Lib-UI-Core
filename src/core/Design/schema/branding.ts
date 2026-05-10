import { ComponentSchema } from '../types';

/**
 * SCHEMA: MARCA & BRANDING
 * Identidade visual da marca do usuário e customização de logos.
 */
export const BrandingSchema: ComponentSchema = {
    id: 'branding',
    label: 'Marca & Identidade',
    pilar: 'branding',
    tokens: [
        {
            id: 'systemName',
            label: 'Nome do Sistema',
            category: 'Identidade',
            type: 'text',
            defaultValue: 'Sarak OS',
            cssVars: ['--sarak-system-name']
        },
        {
            id: 'logoUrl',
            label: 'Logo (Light Mode)',
            category: 'Assets Visuais',
            type: 'text',
            defaultValue: '',
            cssVars: ['--sarak-logo-light']
        },
        {
            id: 'logoDarkUrl',
            label: 'Logo (Dark Mode)',
            category: 'Assets Visuais',
            type: 'text',
            defaultValue: '',
            cssVars: ['--sarak-logo-dark']
        }
    ]
};
