import { ComponentSchema } from '../types';

const MODAL_OVERLAY_BLUR_MAX = 40;
const MODAL_OVERLAY_BLUR_DEFAULT = 8;
const MODAL_BORDER_RADIUS_MAX = 40;
const MODAL_BORDER_RADIUS_MOBILE_DEFAULT = 12;
const MODAL_BORDER_RADIUS_TABLET_DEFAULT = 16;
const MODAL_BORDER_RADIUS_DESKTOP_DEFAULT = 16;
const MODAL_WIDTH_SM_MIN = 320;
const MODAL_WIDTH_SM_MAX = 640;
const MODAL_WIDTH_SM_DEFAULT = 384;
const MODAL_WIDTH_MD_MIN = 384;
const MODAL_WIDTH_MD_MAX = 768;
const MODAL_WIDTH_MD_DEFAULT = 448;
const MODAL_WIDTH_LG_MIN = 448;
const MODAL_WIDTH_LG_MAX = 896;
const MODAL_WIDTH_LG_DEFAULT = 512;
const MODAL_WIDTH_XL_MIN = 512;
const MODAL_WIDTH_XL_MAX = 1280;
const MODAL_WIDTH_XL_DEFAULT = 768;
const MODAL_WIDTH_FULL_MIN = 640;
const MODAL_WIDTH_FULL_MAX = 1920;
const MODAL_WIDTH_FULL_DEFAULT = 1280;
const TOOLTIP_RADIUS_MAX = 12;
const TOOLTIP_RADIUS_DEFAULT = 4;
const TOAST_WIDTH_MIN_REM = 8;
const TOAST_MIN_WIDTH_MAX_REM = 30;
const TOAST_MIN_WIDTH_DEFAULT_REM = 15;
const TOAST_MAX_WIDTH_MAX_REM = 40;
const TOAST_MAX_WIDTH_DEFAULT_REM = 22.5;
const TOAST_ACCENT_WIDTH_MAX = 12;
const TOAST_ACCENT_WIDTH_DEFAULT = 4;
const CONTEXT_MENU_WIDTH_MIN_REM = 4;
const CONTEXT_MENU_WIDTH_MAX_REM = 20;
const CONTEXT_MENU_WIDTH_DEFAULT_REM = 10;

/**
 * SCHEMA: MODAIS & OVERLAYS
 * Governa a experiência de elementos flutuantes, diálogos e tooltips.
 */
export const OverlaysSchema: ComponentSchema = {
    id: 'overlays',
    label: 'Sobreposições (Overlays)',
    tokens: [
        {
            id: 'modalActionAlignment',
            label: 'Alinhamento das Ações',
            type: 'select',
            description: 'Alinhamento horizontal dos botões de ação (ex. "Cancelar"/"Confirmar") no rodapé do modal — Direita é a convenção mais comum; Largura Total faz os botões ocuparem toda a largura disponível (bom para mobile).',
            axis: 'geometry',
            constraints: {
                options: [
                    { id: 'left', value: 'left', label: 'Esquerda' },
                    { id: 'center', value: 'center', label: 'Centro' },
                    { id: 'right', value: 'right', label: 'Direita' },
                    { id: 'stretch', value: 'stretch', label: 'Largura Total' }
                ]
            },
            defaultValue: 'right',
            structuralConsumer: ['useModalLayoutStyles']
        },
        {
            id: 'modalHeaderStyle',
            label: 'Estilo do Cabeçalho',
            type: 'select',
            description: 'Arranjo do cabeçalho do modal: Na mesma linha (título e botão de fechar lado a lado), Empilhado (título acima, ações abaixo) ou Flutuante (botão de fechar fora do card, sobreposto). Muda a estrutura, não a cor.',
            axis: 'geometry',
            constraints: {
                options: [
                    { id: 'inline', value: 'inline', label: 'Na mesma linha' },
                    { id: 'stacked', value: 'stacked', label: 'Empilhado' },
                    { id: 'floating', value: 'floating', label: 'Flutuante (X fora)' }
                ]
            },
            defaultValue: 'inline',
            structuralConsumer: ['useModalLayoutStyles']
        },
        {
            id: 'modalOverlayColor',
            label: 'Cor do Overlay',
            type: 'color',
            description: 'Cor da camada escura (scrim) exibida atrás de um modal aberto, cobrindo o resto da tela — normalmente preto translúcido, para focar a atenção no conteúdo do modal.',
            axis: 'color',
            defaultValue: 'rgba(0, 0, 0, 0.4)',
            cssVars: ['--sarak-modal-overlay']
        },
        {
            id: 'modalOverlayBlur',
            label: 'Blur do Overlay',
            type: 'slider',
            description: 'Intensidade do desfoque aplicado ao conteúdo atrás de um modal aberto — reforça a separação visual entre o modal (foco) e o restante da tela (fundo).',
            axis: 'elevation',
            unit: 'px',
            constraints: { min: 0, max: MODAL_OVERLAY_BLUR_MAX },
            defaultValue: MODAL_OVERLAY_BLUR_DEFAULT,
            cssVars: ['--sarak-modal-blur']
        },
        {
            id: 'modalBorderRadius',
            label: 'Arredondamento (Modal)',
            type: 'slider',
            description: 'Raio de borda do painel do modal, em pixels, com valores independentes por breakpoint. Costuma acompanhar o mesmo clima visual (anguloso vs. arredondado) do restante do sistema.',
            axis: 'geometry',
            isResponsive: true,
            unit: 'px',
            constraints: { min: 0, max: MODAL_BORDER_RADIUS_MAX },
            defaultValue: {
                mob: MODAL_BORDER_RADIUS_MOBILE_DEFAULT,
                tab: MODAL_BORDER_RADIUS_TABLET_DEFAULT,
                desk: MODAL_BORDER_RADIUS_DESKTOP_DEFAULT,
            },
            cssVars: ['--sarak-modal-border-radius']
        },
        {
            id: 'modalWidthSm',
            label: 'Largura do Modal: Pequena',
            type: 'slider',
            description: 'Largura máxima do modal pequeno, em pixels.',
            axis: 'geometry',
            unit: 'px',
            constraints: { min: MODAL_WIDTH_SM_MIN, max: MODAL_WIDTH_SM_MAX },
            defaultValue: MODAL_WIDTH_SM_DEFAULT,
            cssVars: ['--sarak-modal-width-sm']
        },
        {
            id: 'modalWidthMd',
            label: 'Largura do Modal: Média',
            type: 'slider',
            description: 'Largura máxima do modal médio, em pixels.',
            axis: 'geometry',
            unit: 'px',
            constraints: { min: MODAL_WIDTH_MD_MIN, max: MODAL_WIDTH_MD_MAX },
            defaultValue: MODAL_WIDTH_MD_DEFAULT,
            cssVars: ['--sarak-modal-width-md']
        },
        {
            id: 'modalWidthLg',
            label: 'Largura do Modal: Grande',
            type: 'slider',
            description: 'Largura máxima do modal grande, em pixels; mantém o padrão atual de 32rem.',
            axis: 'geometry',
            unit: 'px',
            constraints: { min: MODAL_WIDTH_LG_MIN, max: MODAL_WIDTH_LG_MAX },
            defaultValue: MODAL_WIDTH_LG_DEFAULT,
            cssVars: ['--sarak-modal-width-lg']
        },
        {
            id: 'modalWidthXl',
            label: 'Largura do Modal: Extra Grande',
            type: 'slider',
            description: 'Largura máxima do modal extra grande, em pixels.',
            axis: 'geometry',
            unit: 'px',
            constraints: { min: MODAL_WIDTH_XL_MIN, max: MODAL_WIDTH_XL_MAX },
            defaultValue: MODAL_WIDTH_XL_DEFAULT,
            cssVars: ['--sarak-modal-width-xl']
        },
        {
            id: 'modalWidthFull',
            label: 'Largura do Modal: Ampla',
            type: 'slider',
            description: 'Largura máxima do modal amplo, em pixels, limitada pelas margens da tela.',
            axis: 'geometry',
            unit: 'px',
            constraints: { min: MODAL_WIDTH_FULL_MIN, max: MODAL_WIDTH_FULL_MAX },
            defaultValue: MODAL_WIDTH_FULL_DEFAULT,
            cssVars: ['--sarak-modal-width-full']
        },
        {
            id: 'tooltipBg',
            label: 'Fundo do Tooltip',
            type: 'color',
            description: 'Cor de fundo da caixa de tooltip (dica contextual) — normalmente escura/opaca mesmo em temas claros, para garantir legibilidade e destacar-se como um elemento flutuante temporário.',
            axis: 'color',
            defaultValue: '#0f172a',
            cssVars: ['--sarak-tooltip-bg']
        },
        {
            id: 'tooltipRadius',
            label: 'Raio do Tooltip',
            type: 'slider',
            description: 'Raio de borda da caixa de tooltip, em pixels — valores baixos mantêm o tooltip discreto/técnico; valores mais altos o deixam mais suave.',
            axis: 'geometry',
            unit: 'px',
            constraints: { min: 0, max: TOOLTIP_RADIUS_MAX },
            defaultValue: TOOLTIP_RADIUS_DEFAULT,
            cssVars: ['--sarak-tooltip-radius']
        },
        {
            id: 'tooltipTextColor',
            label: 'Texto do Tooltip',
            type: 'color',
            description: 'Cor do texto exibido dentro da caixa de tooltip — deve manter contraste alto contra `tooltipBg`.',
            axis: 'color',
            defaultValue: '#0f172a',
            cssVars: ['--sarak-tooltip-text']
        },
        {
            id: 'tooltipBorderColor',
            label: 'Borda do Tooltip',
            type: 'color',
            description: 'Cor da borda da caixa de tooltip — costuma ser sutil, só para separar o tooltip visualmente do que está atrás dele.',
            axis: 'color',
            defaultValue: '#cbd5e1',
            cssVars: ['--sarak-tooltip-border']
        },

        // --- TOAST (Spec 27) ---
        {
            id: 'toastMinWidth',
            label: 'Toast: Largura Mínima',
            type: 'slider',
            description: 'Largura mínima, em `rem`, de uma notificação toast — evita que toasts com mensagens curtas fiquem visualmente "espremidos".',
            axis: 'geometry',
            unit: 'rem',
            constraints: { min: TOAST_WIDTH_MIN_REM, max: TOAST_MIN_WIDTH_MAX_REM },
            defaultValue: TOAST_MIN_WIDTH_DEFAULT_REM,
            cssVars: ['--sarak-toast-min-width']
        },
        {
            id: 'toastMaxWidth',
            label: 'Toast: Largura Máxima',
            type: 'slider',
            description: 'Largura máxima, em `rem`, de uma notificação toast — acima desse limite o texto quebra em múltiplas linhas em vez de alargar o toast indefinidamente.',
            axis: 'geometry',
            unit: 'rem',
            constraints: { min: TOAST_WIDTH_MIN_REM, max: TOAST_MAX_WIDTH_MAX_REM },
            defaultValue: TOAST_MAX_WIDTH_DEFAULT_REM,
            cssVars: ['--sarak-toast-max-width']
        },
        {
            id: 'toastAccentWidth',
            label: 'Toast: Largura da Borda de Destaque',
            type: 'slider',
            description: 'Espessura, em pixels, da faixa colorida de destaque na lateral do toast (geralmente colorida conforme o tipo: sucesso/erro/alerta/info) — 0 remove a faixa.',
            axis: 'geometry',
            unit: 'px',
            constraints: { min: 0, max: TOAST_ACCENT_WIDTH_MAX },
            defaultValue: TOAST_ACCENT_WIDTH_DEFAULT,
            cssVars: ['--sarak-toast-accent-width']
        },

        // --- CONTEXT MENU (Spec 27) ---
        {
            id: 'contextMenuMinWidth',
            label: 'Context Menu: Largura Mínima',
            type: 'slider',
            description: 'Largura mínima, em `rem`, de um menu de contexto (clique direito) — evita que menus com poucos itens/texto curto fiquem estreitos demais para o toque/clique confortável.',
            axis: 'geometry',
            unit: 'rem',
            constraints: { min: CONTEXT_MENU_WIDTH_MIN_REM, max: CONTEXT_MENU_WIDTH_MAX_REM },
            defaultValue: CONTEXT_MENU_WIDTH_DEFAULT_REM,
            cssVars: ['--sarak-context-menu-min-width']
        }
    ]
};
