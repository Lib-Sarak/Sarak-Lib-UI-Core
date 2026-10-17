import { ComponentSchema } from '../types';

const BADGE_RADIUS_MAX = 100;
const BADGE_RADIUS_DEFAULT = 99;
const STATUS_GLOW_BLUR_MAX = 24;
const STATUS_GLOW_BLUR_DEFAULT = 0;
const PROGRESS_BAR_HEIGHT_MAX = 32;
const PROGRESS_BAR_HEIGHT_DEFAULT = 8;
const PROGRESS_BAR_RADIUS_MAX = 32;
const PROGRESS_BAR_RADIUS_DEFAULT = 8;

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
            kind: 'aesthetic',
            modeDependent: true,
            usage: "Pinta badges e outros estados de confirmação e sucesso.",
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
            kind: 'aesthetic',
            modeDependent: true,
            usage: "Pinta erros de validação, badges de falha e estados críticos.",
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
            kind: 'aesthetic',
            modeDependent: true,
            usage: "Pinta avisos e estados que pedem atenção sem indicar falha.",
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
            kind: 'aesthetic',
            modeDependent: true,
            usage: "Pinta badges e mensagens de informação neutra.",
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
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Arredonda as bordas das badges de status; valores altos formam uma pílula.",
            label: 'Raio das Badges',
            type: 'slider',
            description: 'Raio de borda das badges de status, em pixels. Valores altos (perto de 99) = formato pílula/totalmente arredondado (padrão mais comum); valores baixos = badge retangular com cantos levemente suavizados.',
            axis: 'geometry',
            unit: 'px',
            constraints: { min: 0, max: BADGE_RADIUS_MAX },
            defaultValue: BADGE_RADIUS_DEFAULT,
            cssVars: ['--sarak-badge-radius']
        },
        {
            id: 'statusGlowBlur',
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Controla o espalhamento do brilho das badges na cor do status; zero desliga o efeito.",
            label: 'Desfoque do Glow de Status',
            type: 'slider',
            description: 'Raio de desfoque do brilho (glow) em volta do SarakBadge nas variantes de status (sucesso, perigo, aviso, info), na cor do próprio status — quanto maior, mais suave/espalhado o brilho. 0 (padrão) = sem brilho.',
            axis: 'elevation',
            unit: 'px',
            constraints: { min: 0, max: STATUS_GLOW_BLUR_MAX },
            defaultValue: STATUS_GLOW_BLUR_DEFAULT,
            cssVars: ['--sarak-status-glow-blur']
        },
        {
            id: 'progressBarHeight',
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Define a altura das barras de progresso.",
            label: 'Altura da Barra de Progresso',
            type: 'slider',
            description: 'Altura das barras de progresso, em pixels.',
            axis: 'geometry',
            unit: 'px',
            constraints: { min: 2, max: PROGRESS_BAR_HEIGHT_MAX },
            defaultValue: PROGRESS_BAR_HEIGHT_DEFAULT,
            cssVars: ['--sarak-progress-bar-height']
        },
        {
            id: 'progressBarRadius',
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Arredonda os cantos das barras de progresso.",
            label: 'Arredondamento da Barra de Progresso',
            type: 'slider',
            description: 'Raio dos cantos da barra de progresso, em pixels.',
            axis: 'geometry',
            unit: 'px',
            constraints: { min: 0, max: PROGRESS_BAR_RADIUS_MAX },
            defaultValue: PROGRESS_BAR_RADIUS_DEFAULT,
            cssVars: ['--sarak-progress-bar-radius']
        }
    ]
};
