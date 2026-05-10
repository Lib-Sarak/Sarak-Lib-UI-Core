import { ComponentSchema } from '../types';

/**
 * SCHEMA: BOTÕES & AÇÕES
 * Governa a anatomia, estados e estilos de todos os elementos clicáveis.
 */
export const ButtonsSchema: ComponentSchema = {
    id: 'buttons',
    label: 'Botões & Ações',
    pilar: 'buttons',
    tokens: [
        {
            id: 'btnBorderRadius',
            label: 'Arredondamento (Botão)',
            category: 'Anatomia',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 40 },
            defaultValue: 8,
            cssVars: ['--sarak-btn-radius']
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
