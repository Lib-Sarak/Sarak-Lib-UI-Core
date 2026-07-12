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
            description: 'Cor semântica usada em toda a aplicação para indicar sucesso/confirmação (ex. "Salvo com sucesso", badge de status ativo). Convencionalmente verde — mudar essa convenção pode confundir o usuário, use com cautela. Gera variantes automáticas de fundo/borda.',
            axis: 'color',
            defaultValue: '#10b981',
            generateVariants: true,
            cssVars: ['--sarak-status-success-color', '--theme-success']
        },
        {
            id: 'statusErrorColor',
            label: 'Cor: Erro',
            type: 'color',
            description: 'Cor semântica usada para indicar erro/falha (ex. validação de formulário, badge de status crítico). Convencionalmente vermelho. Gera variantes automáticas de fundo/borda.',
            axis: 'color',
            defaultValue: '#ef4444',
            generateVariants: true,
            cssVars: ['--sarak-status-error-color', '--theme-error']
        },
        {
            id: 'statusWarningColor',
            label: 'Cor: Alerta',
            type: 'color',
            description: 'Cor semântica usada para indicar alerta/atenção (algo que não é erro, mas merece cuidado). Convencionalmente amarelo/laranja. Gera variantes automáticas de fundo/borda.',
            axis: 'color',
            defaultValue: '#f59e0b',
            generateVariants: true,
            cssVars: ['--sarak-status-warning-color', '--theme-warning']
        },
        {
            id: 'statusInfoColor',
            label: 'Cor: Info',
            type: 'color',
            description: 'Cor semântica usada para indicar informação neutra (dicas, avisos não-críticos). Convencionalmente azul. Gera variantes automáticas de fundo/borda.',
            axis: 'color',
            defaultValue: '#3b82f6',
            generateVariants: true,
            cssVars: ['--sarak-status-info-color', '--theme-info']
        },
        {
            id: 'badgeRadius',
            label: 'Raio das Badges',
            type: 'slider',
            description: 'Raio de borda das badges de status, em pixels. Valores altos (perto de 99) = formato pílula/totalmente arredondado (padrão mais comum); valores baixos = badge retangular com cantos levemente suavizados.',
            axis: 'geometry',
            unit: 'px',
            constraints: { min: 0, max: 100 },
            defaultValue: 99,
            cssVars: ['--sarak-badge-radius']
        },
        {
            id: 'statusGlowBlur',
            label: 'Desfoque do Glow de Status',
            type: 'slider',
            description: 'Raio de desfoque do brilho (glow) que pode acompanhar um indicador de status para chamar mais atenção (ex. status crítico piscando) — quanto maior, mais suave/espalhado o brilho.',
            axis: 'elevation',
            unit: 'px',
            constraints: { min: 0, max: 24 },
            defaultValue: 8,
            cssVars: ['--sarak-status-glow-blur']
        }
    ]
};
