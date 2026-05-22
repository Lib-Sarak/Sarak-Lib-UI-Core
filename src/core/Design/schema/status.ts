import { ComponentSchema } from '../types';

/**
 * SCHEMA: BADGES & STATUS
 * Governa a sinalização de estados (Sucesso, Erro, Alerta) e badges de notificação.
 */
export const StatusSchema: ComponentSchema = {
    id: 'status',
    label: 'Cores Semânticas',
    tokens: [
        {
            id: 'statusSuccessColor',
            label: 'Cor: Sucesso',
            type: 'color',
            defaultValue: '#10b981',
            generateVariants: true,
            cssVars: ['--sarak-status-success-color', '--theme-success']
        },
        {
            id: 'statusErrorColor',
            label: 'Cor: Erro',
            type: 'color',
            defaultValue: '#ef4444',
            generateVariants: true,
            cssVars: ['--sarak-status-error-color', '--theme-error']
        },
        {
            id: 'statusWarningColor',
            label: 'Cor: Alerta',
            type: 'color',
            defaultValue: '#f59e0b',
            generateVariants: true,
            cssVars: ['--sarak-status-warning-color', '--theme-warning']
        },
        {
            id: 'statusInfoColor',
            label: 'Cor: Info',
            type: 'color',
            defaultValue: '#3b82f6',
            generateVariants: true,
            cssVars: ['--sarak-status-info-color', '--theme-info']
        },
        {
            id: 'badgeRadius',
            label: 'Raio das Badges',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 20 },
            defaultValue: 99,
            cssVars: ['--sarak-badge-radius']
        }
    ]
};
