import { ComponentSchema } from '../types';

/**
 * SCHEMA: BADGES & STATUS
 * Governa a sinalização de estados (Sucesso, Erro, Alerta) e badges de notificação.
 */
export const StatusSchema: ComponentSchema = {
    id: 'status',
    label: 'Cores Semânticas',
    pilar: 'brand',
    subcategory: 'Branding e Cores',
    tokens: [
        {
            id: 'statusSuccessColor',
            label: 'Cor: Sucesso',
            category: 'Estados Semânticos',
            type: 'color',
            defaultValue: '#10b981',
            generateVariants: true,
            cssVars: ['--sarak-status-success-color', '--theme-success']
        },
        {
            id: 'statusErrorColor',
            label: 'Cor: Erro',
            category: 'Estados Semânticos',
            type: 'color',
            defaultValue: '#ef4444',
            generateVariants: true,
            cssVars: ['--sarak-status-error-color', '--theme-error']
        },
        {
            id: 'statusWarningColor',
            label: 'Cor: Alerta',
            category: 'Estados Semânticos',
            type: 'color',
            defaultValue: '#f59e0b',
            generateVariants: true,
            cssVars: ['--sarak-status-warning-color', '--theme-warning']
        },
        {
            id: 'statusInfoColor',
            label: 'Cor: Info',
            category: 'Estados Semânticos',
            type: 'color',
            defaultValue: '#3b82f6',
            generateVariants: true,
            cssVars: ['--sarak-status-info-color', '--theme-info']
        },
        {
            id: 'badgeRadius',
            label: 'Raio das Badges',
            category: 'Anatomia',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 20 },
            defaultValue: 99,
            cssVars: ['--sarak-badge-radius']
        }
    ]
};
