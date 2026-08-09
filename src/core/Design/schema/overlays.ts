import { ComponentSchema } from '../types';

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
            constraints: { min: 0, max: 40 },
            defaultValue: 8,
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
            constraints: { min: 0, max: 40 },
            defaultValue: { mob: 12, tab: 16, desk: 16 },
            cssVars: ['--sarak-modal-border-radius']
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
            constraints: { min: 0, max: 12 },
            defaultValue: 4,
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
            constraints: { min: 8, max: 30 },
            defaultValue: 15,
            cssVars: ['--sarak-toast-min-width']
        },
        {
            id: 'toastMaxWidth',
            label: 'Toast: Largura Máxima',
            type: 'slider',
            description: 'Largura máxima, em `rem`, de uma notificação toast — acima desse limite o texto quebra em múltiplas linhas em vez de alargar o toast indefinidamente.',
            axis: 'geometry',
            unit: 'rem',
            constraints: { min: 8, max: 40 },
            defaultValue: 22.5,
            cssVars: ['--sarak-toast-max-width']
        },
        {
            id: 'toastAccentWidth',
            label: 'Toast: Largura da Borda de Destaque',
            type: 'slider',
            description: 'Espessura, em pixels, da faixa colorida de destaque na lateral do toast (geralmente colorida conforme o tipo: sucesso/erro/alerta/info) — 0 remove a faixa.',
            axis: 'geometry',
            unit: 'px',
            constraints: { min: 0, max: 12 },
            defaultValue: 4,
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
            constraints: { min: 4, max: 20 },
            defaultValue: 10,
            cssVars: ['--sarak-context-menu-min-width']
        }
    ]
};
