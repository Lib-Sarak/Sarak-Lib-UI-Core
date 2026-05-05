import { ComponentSchema } from '../types';

/**
 * Mapeamento 100% Granular: Branding & Identidade (v12.0)
 */
export const IdentitySchema: ComponentSchema = {
    id: 'identity',
    label: 'Branding & Identidade',
    tokens: [
        // --- LOGOTIPO ---
        {
            id: 'logoScale',
            label: 'Escala do Logo',
            category: 'Assets de Marca',
            type: 'slider',
            constraints: { min: 0.5, max: 3, step: 0.1 },
            defaultValue: 1,
            cssVars: ['--sarak-logo-scale']
        },
        {
            id: 'logoOpacity',
            label: 'Opacidade do Logo',
            category: 'Assets de Marca',
            type: 'slider',
            constraints: { min: 0, max: 1, step: 0.01 },
            defaultValue: 1,
            cssVars: ['--sarak-logo-opacity']
        },
        {
            id: 'logoDropShadow',
            label: 'Sombra do Logo (Drop Shadow)',
            category: 'Assets de Marca',
            type: 'text',
            defaultValue: '0px 4px 10px rgba(0,0,0,0.5)',
            cssVars: ['--sarak-logo-shadow']
        },
        {
            id: 'logoColorOverlay',
            label: 'Sobreposição de Cor (SVG)',
            category: 'Assets de Marca',
            type: 'color',
            defaultValue: 'transparent',
            cssVars: ['--sarak-logo-color']
        },
        {
            id: 'logoAnimationType',
            label: 'Tipo de Animação',
            category: 'Assets de Marca',
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
        {
            id: 'logoRotation',
            label: 'Rotação do Logo',
            category: 'Assets de Marca',
            type: 'slider',
            unit: 'deg',
            constraints: { min: -180, max: 180, step: 1 },
            defaultValue: 0,
            cssVars: ['--sarak-logo-rotation']
        },

        // --- SÍMBOLO ---
        {
            id: 'identitySymbolSize',
            label: 'Tamanho do Símbolo',
            category: 'Assets de Marca',
            type: 'slider',
            unit: 'px',
            constraints: { min: 16, max: 128, step: 1 },
            defaultValue: 32,
            cssVars: ['--sarak-symbol-size']
        },
        {
            id: 'identitySymbolGlow',
            label: 'Intensidade de Brilho',
            category: 'Assets de Marca',
            type: 'slider',
            constraints: { min: 0, max: 20, step: 1 },
            defaultValue: 0,
            cssVars: ['--sarak-symbol-glow']
        },

        // --- PALETA DE SOBERANIA ---
        {
            id: 'colorPrimary',
            label: 'Cor Primária (Action)',
            category: 'Paleta de Soberania',
            type: 'color',
            defaultValue: '#00f2ff',
            generateVariants: true,
            cssVars: ['--theme-primary', '--sarak-color-primary']
        },
        {
            id: 'primaryLuminosity',
            label: 'Controle de Luminosidade',
            category: 'Paleta de Soberania',
            type: 'slider',
            constraints: { min: 0, max: 2, step: 0.1 },
            defaultValue: 1,
            cssVars: ['--sarak-primary-luminosity']
        },
        {
            id: 'primaryAlpha',
            label: 'Canal Alpha (Opacidade)',
            category: 'Paleta de Soberania',
            type: 'slider',
            constraints: { min: 0, max: 1, step: 0.01 },
            defaultValue: 1,
            cssVars: ['--sarak-primary-alpha']
        },
        {
            id: 'colorSecondary',
            label: 'Cor Secundária (Accent)',
            category: 'Paleta de Soberania',
            type: 'color',
            defaultValue: '#ff00d4',
            generateVariants: true,
            cssVars: ['--theme-secondary', '--sarak-color-secondary']
        },
        
        {
            id: 'colorSuccess',
            label: 'Cor de Sucesso',
            category: 'Cores Semânticas',
            type: 'color',
            defaultValue: '#00ff88',
            generateVariants: true,
            cssVars: ['--theme-success', '--sarak-color-success']
        },
        {
            id: 'colorWarning',
            label: 'Cor de Alerta',
            category: 'Cores Semânticas',
            type: 'color',
            defaultValue: '#ffcc00',
            generateVariants: true,
            cssVars: ['--theme-warning', '--sarak-color-warning']
        },
        {
            id: 'colorError',
            label: 'Cor de Erro',
            category: 'Cores Semânticas',
            type: 'color',
            defaultValue: '#ff3366',
            generateVariants: true,
            cssVars: ['--theme-error', '--sarak-color-error']
        },

        // --- SUPERFÍCIES (Backdrops) ---
        {
            id: 'bgMain',
            label: 'Fundo Principal (App)',
            category: 'Superfícies & Fundos',
            type: 'color',
            defaultValue: '#020617',
            cssVars: ['--sarak-bg-main']
        },
        {
            id: 'bgSurface',
            label: 'Fundo de Superfície',
            category: 'Superfícies & Fundos',
            type: 'color',
            defaultValue: '#0f172a',
            cssVars: ['--sarak-bg-surface']
        },
        {
            id: 'bgOverlay',
            label: 'Fundo de Overlay / Modal',
            category: 'Superfícies & Fundos',
            type: 'color',
            defaultValue: '#1e293b',
            cssVars: ['--sarak-bg-overlay']
        },

        // --- BORDAS & LINHAS ---
        {
            id: 'borderSubtle',
            label: 'Borda Sutil',
            category: 'Linhas & Divisores',
            type: 'color',
            defaultValue: 'rgba(255, 255, 255, 0.05)',
            cssVars: ['--sarak-border-subtle']
        },
        {
            id: 'borderDefault',
            label: 'Borda Padrão',
            category: 'Linhas & Divisores',
            type: 'color',
            defaultValue: 'rgba(255, 255, 255, 0.1)',
            cssVars: ['--sarak-border-default']
        },
        {
            id: 'borderStrong',
            label: 'Borda Forte',
            category: 'Linhas & Divisores',
            type: 'color',
            defaultValue: 'rgba(255, 255, 255, 0.2)',
            cssVars: ['--sarak-border-strong']
        },

        // --- PALETA NEUTRA (Grays) ---
        {
            id: 'neutralGray',
            label: 'Base Neutra (Grayscale)',
            category: 'Paleta Neutra',
            type: 'color',
            defaultValue: '#64748b',
            generateVariants: true,
            cssVars: ['--sarak-neutral-base']
        }
    ]
};
