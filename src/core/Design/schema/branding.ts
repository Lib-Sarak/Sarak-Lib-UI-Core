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
        // --- LOGOTIPO AVANÇADO ---
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
        },
        {
            id: 'logoScale',
            label: 'Escala do Logo',
            category: 'Assets Visuais',
            type: 'slider',
            constraints: { min: 0.5, max: 3, step: 0.1 },
            defaultValue: 1,
            cssVars: ['--sarak-logo-scale']
        },
        {
            id: 'logoRotation',
            label: 'Rotação do Logo',
            category: 'Assets Visuais',
            type: 'slider',
            unit: 'deg',
            constraints: { min: -180, max: 180, step: 1 },
            defaultValue: 0,
            cssVars: ['--sarak-logo-rotation']
        },
        {
            id: 'logoAnimationType',
            label: 'Animação do Logo',
            category: 'Assets Visuais',
            type: 'select',
            constraints: {
                options: [
                    { id: 'none', label: 'Nenhuma' },
                    { id: 'pulse', label: 'Pulse' },
                    { id: 'float', label: 'Float' },
                    { id: 'glow', label: 'Glow' }
                ]
            },
            defaultValue: 'none',
            cssVars: ['--sarak-logo-animation']
        },
        // --- SÍMBOLO DA MARCA ---
        {
            id: 'identitySymbolSize',
            label: 'Tamanho do Símbolo',
            category: 'Símbolo & Ícone',
            type: 'slider',
            unit: 'px',
            constraints: { min: 16, max: 128, step: 1 },
            defaultValue: 32,
            cssVars: ['--sarak-symbol-size']
        },
        {
            id: 'identitySymbolGlow',
            label: 'Brilho do Símbolo',
            category: 'Símbolo & Ícone',
            type: 'slider',
            constraints: { min: 0, max: 20, step: 1 },
            defaultValue: 0,
            cssVars: ['--sarak-symbol-glow']
        }
    ]
};
