import { ComponentSchema } from '../types';

export interface SpecializedDesign {
    chatBubbleStyle?: string;
    flowGridStyle?: string;
    flowNodeRadius?: number;
    securityShieldGlow?: number;
    securityPulseSpeed?: number;
    noiseIntensity?: number;
    performanceMode?: string;
    // Auth
    authDensity?: 'compact' | 'standard' | 'spacious';
    authNoiseEnabled?: boolean;
    authNoiseUrl?: string;
    // Security
    qrSize?: number;
    securityBorderRadius?: number;
    // Stats
    statsVariant?: 'default' | 'compact' | 'industrial';
}

/**
 * Mapeamento 100% Granular: Componentes Especializados
 */
export const SpecializedSchema: ComponentSchema = {
    id: 'specialized',
    label: 'Componentes Avançados',
    tokens: [
        {
            id: 'chatBubbleStyle',
            label: 'Estilo do Chat',
            category: 'Chat',
            type: 'select',
            constraints: {
                options: [
                    { id: 'glass', label: 'Glass' },
                    { id: 'flat', label: 'Flat' },
                    { id: 'industrial', label: 'Industrial' }
                ],
            },
            defaultValue: 'glass',
            cssVars: ['--chat-bubble-style']
        },
        {
            id: 'flowGridStyle',
            label: 'Estilo do Grid (Diagramas)',
            category: 'Diagramas & Fluxo',
            type: 'select',
            constraints: {
                options: [
                    { id: 'dots', label: 'Pontos' },
                    { id: 'lines', label: 'Linhas' },
                    { id: 'cross', label: 'Cruzes' },
                    { id: 'none', label: 'Nenhum' }
                ],
            },
            defaultValue: 'dots',
            cssVars: ['--sarak-flow-grid']
        },
        {
            id: 'flowNodeRadius',
            label: 'Raio do Nó',
            category: 'Diagramas & Fluxo',
            type: 'slider',
            unit: 'px',
            constraints: {
                min: 4,
                max: 32,
            },
            defaultValue: 12,
            cssVars: ['--sarak-flow-radius']
        },
        {
            id: 'securityShieldGlow',
            label: 'Brilho do Escudo',
            category: 'Segurança',
            type: 'slider',
            unit: 'px',
            constraints: {
                min: 0,
                max: 50,
            },
            defaultValue: 15,
            cssVars: ['--sarak-security-glow']
        },
        {
            id: 'securityPulseSpeed',
            label: 'Velocidade do Pulso',
            category: 'Segurança',
            type: 'slider',
            unit: 's',
            constraints: {
                min: 0.5,
                max: 5,
                step: 0.1
            },
            defaultValue: 2,
            cssVars: ['--sarak-security-pulse']
        },
        {
            id: 'noiseIntensity',
            label: 'Intensidade do Ruído',
            category: 'Atmosfera (Efeitos)',
            type: 'slider',
            constraints: {
                min: 0,
                max: 100,
            },
            defaultValue: 5,
            cssVars: ['--sarak-noise-opacity']
        },
        {
            id: 'performanceMode',
            label: 'Modo de Performance',
            category: 'Sistema',
            type: 'select',
            constraints: {
                options: [
                    { id: 'high', label: 'Alta Fidelidade (Animações ON)' },
                    { id: 'eco', label: 'Economia (Animações OFF)' }
                ],
            },
            defaultValue: 'high'
        },
        // ─── Auth Screen ──────────────────────────────────────────────────────────
        {
            id: 'authDensity',
            label: 'Densidade do Auth Screen',
            category: 'Autenticação',
            type: 'select',
            constraints: {
                options: [
                    { id: 'compact', label: 'Compacto' },
                    { id: 'standard', label: 'Padrão' },
                    { id: 'spacious', label: 'Espaçoso' }
                ],
            },
            defaultValue: 'standard',
            cssVars: ['--sarak-auth-density']
        },
        {
            id: 'authNoiseEnabled',
            label: 'Efeito Grain/Noise (Auth)',
            category: 'Autenticação',
            type: 'boolean',
            defaultValue: true
        },
        // ─── Security Orchestrator ────────────────────────────────────────────────
        {
            id: 'qrSize',
            label: 'Tamanho do QR Code (MFA)',
            category: 'Segurança',
            type: 'slider',
            unit: 'px',
            constraints: {
                min: 100,
                max: 300,
                step: 10
            },
            defaultValue: 200,
            cssVars: ['--sarak-qr-size']
        },
        {
            id: 'authNoiseUrl',
            label: 'Textura de Ruído (Auth)',
            category: 'Autenticação',
            type: 'text',
            defaultValue: "url('https://grainy-gradients.vercel.app/noise.svg')",
            cssVars: ['--sarak-auth-noise-url']
        },
        {
            id: 'securityBorderRadius',
            label: 'Arredondamento do Orchestrator',
            category: 'Segurança',
            type: 'slider',
            unit: 'px',
            constraints: {
                min: 0,
                max: 40,
            },
            defaultValue: 16,
            cssVars: ['--sarak-security-radius']
        },
        {
            id: 'statsVariant',
            label: 'Variante do Stats',
            category: 'Dados',
            type: 'select',
            constraints: {
                options: [
                    { id: 'default', label: 'Default' },
                    { id: 'compact', label: 'Compacto' },
                    { id: 'industrial', label: 'Industrial' }
                ],
            },
            defaultValue: 'default',
            cssVars: ['--sarak-stats-variant']
        }
    ]
};
