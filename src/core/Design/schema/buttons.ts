import { ComponentSchema } from '../types';

/**
 * SCHEMA: BOTÕES & AÇÕES
 * Governa a anatomia, estados e estilos de todos os elementos clicáveis.
 */
export const ButtonsSchema: ComponentSchema = {
    id: 'buttons',
    label: 'Botão de Ação',
    tokens: [
        {
            id: 'btnBorderRadius',
            label: 'Arredondamento (Master)',
            type: 'slider',
            isResponsive: true,
            unit: 'px',
            constraints: { min: 0, max: 120 },
            defaultValue: { mob: 6, tab: 8, desk: 8 },
            cssVars: ['--sarak-btn-border-radius', '--sarak-btn-radius-tl', '--sarak-btn-radius-tr', '--sarak-btn-radius-bl', '--sarak-btn-radius-br']
        },
        {
            id: 'btnRadiusTL',
            label: 'Canto: Superior Esquerdo',
            type: 'slider',
            isResponsive: true,
            unit: 'px',
            constraints: { min: 0, max: 120 },
            defaultValue: { mob: 6, tab: 8, desk: 8 },
            cssVars: ['--sarak-btn-radius-tl']
        },
        {
            id: 'btnRadiusTR',
            label: 'Canto: Superior Direito',
            type: 'slider',
            isResponsive: true,
            unit: 'px',
            constraints: { min: 0, max: 120 },
            defaultValue: { mob: 6, tab: 8, desk: 8 },
            cssVars: ['--sarak-btn-radius-tr']
        },
        {
            id: 'btnRadiusBL',
            label: 'Canto: Inferior Esquerdo',
            type: 'slider',
            isResponsive: true,
            unit: 'px',
            constraints: { min: 0, max: 120 },
            defaultValue: { mob: 6, tab: 8, desk: 8 },
            cssVars: ['--sarak-btn-radius-bl']
        },
        {
            id: 'btnRadiusBR',
            label: 'Canto: Inferior Direito',
            type: 'slider',
            isResponsive: true,
            unit: 'px',
            constraints: { min: 0, max: 120 },
            defaultValue: { mob: 6, tab: 8, desk: 8 },
            cssVars: ['--sarak-btn-radius-br']
        },

        // --- INTERAÇÃO ---
        {
            id: 'btnHoverScale',
            label: 'Escala no Hover',
            type: 'slider',
            constraints: { min: 0.8, max: 1.2, step: 0.01 },
            defaultValue: 1.02,
            cssVars: ['--sarak-btn-hover-scale']
        },
        {
            id: 'btnActiveScale',
            label: 'Escala no Clique',
            type: 'slider',
            constraints: { min: 0.8, max: 1.2, step: 0.01 },
            defaultValue: 0.98,
            cssVars: ['--sarak-btn-active-scale']
        },
        {
            id: 'btnPrimaryBg',
            label: 'Fundo Primário',
            type: 'color',
            defaultValue: '#00f2ff',
            generateVariants: true,
            cssVars: ['--sarak-btn-primary-bg']
        },
        {
            id: 'btnPrimaryText',
            label: 'Texto Primário',
            type: 'color',
            defaultValue: '#000000',
            cssVars: ['--sarak-btn-primary-text']
        },
        {
            id: 'btnSecondaryBg',
            label: 'Fundo Secundário',
            type: 'color',
            defaultValue: 'rgba(255, 255, 255, 0.05)',
            generateVariants: true,
            cssVars: ['--sarak-btn-secondary-bg']
        },
        {
            id: 'btnGhostHoverBg',
            label: 'Hover (Ghost)',
            type: 'color',
            defaultValue: 'rgba(255, 255, 255, 0.05)',
            cssVars: ['--sarak-btn-ghost-hover']
        },

        // --- ESTILOS AVANÇADOS (SELEÇÃO DO USUÁRIO) ---
        {
            id: 'btnStyleType',
            label: 'Estilo do Botão',
            type: 'select',
            constraints: {
                options: [
                    { id: 'matte', value: 'matte', label: 'Industrial Matte' },
                    { id: 'neon', value: 'neon', label: 'Cyber Neon Glow' },
                    { id: 'frosted', value: 'frosted', label: 'Glassmorphism Frosted' },
                    { id: 'borderline', value: 'borderline', label: 'Minimalist Borderline' },
                    { id: 'cyberpunk', value: 'cyberpunk', label: 'Cyberpunk Wireframe' },
                    { id: 'neumorphism', value: 'neumorphism', label: 'Neumorphism Soft' }
                ]
            },
            defaultValue: 'matte',
            cssVars: ['--sarak-btn-style-type']
        },
        {
            id: 'btnNeonGlowColor',
            label: 'Cor do Brilho (Neon)',
            type: 'color',
            defaultValue: 'rgba(0, 242, 255, 0.4)',
            cssVars: ['--sarak-btn-neon-glow-color']
        },
        {
            id: 'btnNeonPulseSpeed',
            label: 'Velocidade de Pulso (s)',
            type: 'slider',
            unit: 's',
            constraints: { min: 0.5, max: 4, step: 0.1 },
            defaultValue: 1.5,
            cssVars: ['--sarak-btn-neon-pulse-speed']
        },
        {
            id: 'btnBackdropBlur',
            label: 'Desfoque de Vidro (Backdrop Blur)',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 30 },
            defaultValue: 8,
            cssVars: ['--sarak-btn-backdrop-blur']
        }
    ]
};
