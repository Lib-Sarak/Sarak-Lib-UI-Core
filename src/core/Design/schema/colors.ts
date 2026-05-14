import { ComponentSchema } from '../types';

/**
 * SCHEMA: PALETAS & CORES
 * Gerencia a linguagem cromática e cores semânticas do sistema.
 */
export const ColorsSchema: ComponentSchema = {
    id: 'colors',
    label: 'Paletas & Cores',
    pilar: 'colors',
    tokens: [
        {
            id: 'colorPrimary',
            label: 'Cor Primária (Master)',
            category: 'Paleta Principal',
            type: 'color',
            defaultValue: '#00f2ff',
            generateVariants: true,
            cssVars: ['--theme-primary', '--sarak-color-primary', '--primary-color']
        },
        {
            id: 'colorSecondary',
            label: 'Cor Secundária',
            category: 'Paleta Principal',
            type: 'color',
            defaultValue: '#7000ff',
            cssVars: ['--theme-secondary', '--sarak-secondary-color', '--secondary-color']
        },
        {
            id: 'colorTitle',
            label: 'Cor de Título',
            category: 'Tipografia & Contraste',
            type: 'color',
            defaultValue: '#ffffff',
            cssVars: ['--color-theme-title', '--theme-title']
        },
        {
            id: 'colorMuted',
            label: 'Cor Desativada (Muted)',
            category: 'Tipografia & Contraste',
            type: 'color',
            defaultValue: 'rgba(255, 255, 255, 0.4)',
            cssVars: ['--color-theme-muted', '--theme-muted']
        }
    ]
};
