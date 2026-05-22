import { ComponentSchema } from '../types';

/**
 * SCHEMA: MARCA & BRANDING
 * Identidade visual da marca do usuário e customização de logos.
 */
export const BrandingSchema: ComponentSchema = {
    id: 'branding',
    label: 'Identidade Visual',
    tokens: [
        {
            id: 'systemName',
            label: 'Nome da Marca',
            type: 'text',
            defaultValue: 'Sarak OS',
            cssVars: ['--sarak-system-name']
        },
        // --- LOGOTIPO AVANÇADO ---
        {
            id: 'logoUrl',
            label: 'Logo Principal (SVG/PNG)',
            type: 'text',
            defaultValue: '',
            cssVars: ['--sarak-logo-main']
        },
        {
            id: 'logoMinimalUrl',
            label: 'Logo Minimalista (Favicon)',
            type: 'text',
            defaultValue: '',
            cssVars: ['--sarak-logo-minimal']
        },
        {
            id: 'logoScale',
            label: 'Escala do Logo (%)',
            type: 'slider',
            constraints: { min: 10, max: 200, step: 5 },
            defaultValue: 100,
            cssVars: ['--sarak-logo-scale']
        },
        {
            id: 'identityAlignment',
            label: 'Alinhamento',
            type: 'select',
            constraints: {
                options: [
                    { id: 'left', label: 'Esquerda' },
                    { id: 'center', label: 'Centro' },
                    { id: 'right', label: 'Direita' }
                ]
            },
            defaultValue: 'left',
            cssVars: ['--sarak-identity-align']
        },
        {
            id: 'identityPadding',
            label: 'Padding do Container',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 64 },
            defaultValue: 16,
            cssVars: ['--sarak-identity-padding']
        },

        // --- TIPOGRAFIA DA MARCA ---
        {
            id: 'identityFontFamily',
            label: 'Fonte do Logo',
            type: 'font',
            defaultValue: 'Inter',
            cssVars: ['--sarak-identity-font']
        },
        {
            id: 'identityFontWeight',
            label: 'Peso da Fonte',
            type: 'slider',
            constraints: { min: 100, max: 900, step: 100 },
            defaultValue: 700,
            cssVars: ['--sarak-identity-weight']
        },
        {
            id: 'identityTracking',
            label: 'Espaçamento (Tracking)',
            type: 'slider',
            unit: 'em',
            constraints: { min: -0.1, max: 0.5, step: 0.01 },
            defaultValue: 0,
            cssVars: ['--sarak-identity-tracking']
        },

        // --- COMPORTAMENTO ---
        {
            id: 'identityRedirectUrl',
            label: 'Link de Redirecionamento',
            type: 'text',
            defaultValue: '/',
            cssVars: ['--sarak-identity-link']
        },
        {
            id: 'identityHoverEffect',
            label: 'Efeito ao Hover',
            type: 'select',
            constraints: {
                options: [
                    { id: 'none', label: 'Nenhum' },
                    { id: 'glow', label: 'Brilho' },
                    { id: 'opacity', label: 'Opacidade' },
                    { id: 'scale', label: 'Escala' }
                ]
            },
            defaultValue: 'opacity',
            cssVars: ['--sarak-identity-hover']
        }
    ]
};
