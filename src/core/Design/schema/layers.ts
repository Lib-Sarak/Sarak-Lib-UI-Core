import { ComponentSchema } from '../types';

/**
 * LAYERS SCHEMA (v13.0)
 * Controla a arquitetura de profundidade e empilhamento.
 * Gerencia Z-Index e a opacidade de camadas de fundo.
 */
export const LayersSchema: ComponentSchema = {
    id: 'layers',
    label: 'Camadas e Profundidade',
    tokens: [
        // --- ARQUITETURA DE Z-INDEX ---
        {
            id: 'zIndexBase',
            kind: 'functional',
            modeDependent: false,
            usage: "Camada mínima do sistema; a lista do autocompletar abre nela, acima do conteúdo comum.",
            label: 'Base Z-Index',
            type: 'slider',
            description: 'Índice de empilhamento (z-index) mínimo do sistema — a camada mais baixa da arquitetura de profundidade, abaixo de sidebar/modal/tooltip. Serve de piso para o restante da escala de z-index.',
            axis: 'elevation',
            constraints: { min: 0, max: 100, step: 1 },
            defaultValue: 1,
            cssVars: ['--sarak-z-base']
        },
        {
            id: 'zIndexSidebar',
            kind: 'functional',
            modeDependent: false,
            usage: "Camada da barra de navegação; menus e busca derivam dela por deslocamentos fixos (a camada do grão de filme fica 50 acima). Deve ficar sobre o conteúdo e sob modais.",
            label: 'Sidebar Z-Index',
            type: 'slider',
            description: 'Índice de empilhamento (z-index) da navegação (sidebar/topbar) — deve ficar acima do conteúdo comum da tela, mas abaixo de modais e tooltips, para que overlays sempre cubram a navegação quando abertos.',
            axis: 'elevation',
            constraints: { min: 10, max: 1000, step: 10 },
            defaultValue: 500,
            cssVars: ['--sarak-z-sidebar']
        },
        {
            id: 'zIndexModal',
            kind: 'functional',
            modeDependent: false,
            usage: "Camada de modais e do véu deles; as gavetas e o cartão expandido derivam dela por deslocamentos fixos.",
            label: 'Modal Z-Index',
            type: 'slider',
            description: 'Índice de empilhamento (z-index) de modais/diálogos — deve ficar acima da navegação, mas abaixo de tooltips.',
            axis: 'elevation',
            constraints: { min: 1000, max: 5000, step: 100 },
            defaultValue: 2000,
            cssVars: ['--sarak-z-modal']
        },
        {
            id: 'zIndexTooltip',
            kind: 'functional',
            modeDependent: false,
            usage: "Camada dos tooltips e do menu de contexto, logo abaixo das notificações.",
            label: 'Tooltip Z-Index',
            type: 'slider',
            description: 'Índice de empilhamento (z-index) de tooltips — logo abaixo das notificações (`zIndexToast`), garantindo que uma dica contextual apareça por cima de qualquer modal ou sobreposição já aberta.',
            axis: 'elevation',
            constraints: { min: 5000, max: 9900, step: 100 },
            defaultValue: 9000,
            cssVars: ['--sarak-z-tooltip']
        },

        // --- BACKDROPS ---

        // --- ELEVAÇÃO DINÂMICA ---
    ]
};
