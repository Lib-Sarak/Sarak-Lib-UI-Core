import { ComponentSchema } from '../types';

/**
 * SCHEMA: BOTÕES & AÇÕES
 * Governa a anatomia, estados e estilos de todos os elementos clicáveis.
 */
export const ButtonsSchema: ComponentSchema = {
    id: 'buttons',
    label: 'Anatomia do Botão',
    pilar: 'interaction',
    subcategory: 'Botões e Interação',
    tokens: [
        {
            id: 'btnBorderRadius',
            label: 'Arredondamento (Master)',
            category: 'Geometria',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 120 },
            defaultValue: 8,
            cssVars: ['--sarak-btn-border-radius', '--sarak-btn-radius-tl', '--sarak-btn-radius-tr', '--sarak-btn-radius-bl', '--sarak-btn-radius-br']
        },
        {
            id: 'btnRadiusTL',
            label: 'Canto: Superior Esquerdo',
            category: 'Geometria: Avançado',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 120 },
            defaultValue: 8,
            cssVars: ['--sarak-btn-radius-tl']
        },
        {
            id: 'btnRadiusTR',
            label: 'Canto: Superior Direito',
            category: 'Geometria: Avançado',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 120 },
            defaultValue: 8,
            cssVars: ['--sarak-btn-radius-tr']
        },
        {
            id: 'btnRadiusBL',
            label: 'Canto: Inferior Esquerdo',
            category: 'Geometria: Avançado',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 120 },
            defaultValue: 8,
            cssVars: ['--sarak-btn-radius-bl']
        },
        {
            id: 'btnRadiusBR',
            label: 'Canto: Inferior Direito',
            category: 'Geometria: Avançado',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 120 },
            defaultValue: 8,
            cssVars: ['--sarak-btn-radius-br']
        },

        // --- INTERAÇÃO ---
        {
            id: 'btnHoverScale',
            label: 'Escala no Hover',
            category: 'Interação',
            type: 'slider',
            constraints: { min: 0.8, max: 1.2, step: 0.01 },
            defaultValue: 1.02,
            cssVars: ['--sarak-btn-hover-scale']
        },
        {
            id: 'btnActiveScale',
            label: 'Escala no Clique',
            category: 'Interação',
            type: 'slider',
            constraints: { min: 0.8, max: 1.2, step: 0.01 },
            defaultValue: 0.98,
            cssVars: ['--sarak-btn-active-scale']
        },
        {
            id: 'btnPrimaryBg',
            label: 'Fundo Primário',
            category: 'Estilo: Primário',
            type: 'color',
            defaultValue: '#00f2ff',
            generateVariants: true,
            cssVars: ['--sarak-btn-primary-bg', '--theme-primary']
        },
        {
            id: 'btnPrimaryText',
            label: 'Texto Primário',
            category: 'Estilo: Primário',
            type: 'color',
            defaultValue: '#000000',
            cssVars: ['--sarak-btn-primary-text']
        },
        {
            id: 'btnSecondaryBg',
            label: 'Fundo Secundário',
            category: 'Estilo: Secundário',
            type: 'color',
            defaultValue: 'rgba(255, 255, 255, 0.05)',
            generateVariants: true,
            cssVars: ['--sarak-btn-secondary-bg']
        },
        {
            id: 'btnGhostHoverBg',
            label: 'Hover (Ghost)',
            category: 'Estilo: Ghost',
            type: 'color',
            defaultValue: 'rgba(255, 255, 255, 0.05)',
            cssVars: ['--sarak-btn-ghost-hover']
        }
    ]
};
