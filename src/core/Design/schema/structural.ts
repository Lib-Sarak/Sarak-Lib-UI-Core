import { ComponentSchema } from '../types';
import { BREAKPOINT_TABLET, BREAKPOINT_DESKTOP } from '../breakpoints';

/**
 * STRUCTURAL SCHEMA (v13.0)
 * Tokens de macro-layout e densidade consumidos pelo hook `useStructuralStyles`
 * (Eixos de Grid, Fluxo Global, Formulários, Header e Switches). Antes eram
 * lidos do payload sem existir no schema (sempre no default) — agora plugados na
 * paridade 1:1:1:1:1.
 */
export const StructuralSchema: ComponentSchema = {
    id: 'structural',
    label: 'Estrutura e Macro-Layout',
    tokens: [
        // --- BREAKPOINTS (Spec 16, Regra 1) ---
        // Limiares de responsividade consumidos pelo gerador de media-queries
        // (useDesignVariables) e pelo detector JS (DeviceProvider). Default/legacy
        // derivam da fonte única em ../breakpoints.ts (coerência CSS↔JS, Regra 4).
        {
            id: 'breakpointTablet',
            label: 'Breakpoint Tablet',
            type: 'slider',
            unit: 'px',
            constraints: { min: 480, max: 1024, step: 1 },
            defaultValue: BREAKPOINT_TABLET,
            legacyValue: BREAKPOINT_TABLET,
            cssVars: ['--sarak-breakpoint-tablet']
        },
        {
            id: 'breakpointDesktop',
            label: 'Breakpoint Desktop',
            type: 'slider',
            unit: 'px',
            constraints: { min: 768, max: 1600, step: 1 },
            defaultValue: BREAKPOINT_DESKTOP,
            legacyValue: BREAKPOINT_DESKTOP,
            cssVars: ['--sarak-breakpoint-desktop']
        },

        // --- MACRO GRID ---
        {
            id: 'layoutGridTemplate',
            label: 'Template de Grid Global',
            type: 'select',
            constraints: {
                options: [
                    { id: 'col-12', value: 'col-12', label: 'Colunas (12)' },
                    { id: 'auto-fit', value: 'auto-fit', label: 'Auto-fit Responsivo' },
                    { id: 'masonry', value: 'masonry', label: 'Masonry (Pinterest)' }
                ]
            },
            defaultValue: 'col-12',
            cssVars: ['--sarak-layout-grid-template'],
            structuralConsumer: ['useStructuralStyles.getGridStyles']
        },
        {
            id: 'globalSectionGap',
            label: 'Espaçamento entre Seções',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 96, step: 2 },
            defaultValue: 24,
            cssVars: ['--sarak-global-section-gap']
        },

        // --- FLUXO GLOBAL ---
        {
            id: 'globalFlowDirection',
            label: 'Direção do Fluxo Global',
            type: 'select',
            constraints: {
                options: [
                    { id: 'column', value: 'column', label: 'Coluna (Vertical)' },
                    { id: 'row', value: 'row', label: 'Linha (Horizontal)' }
                ]
            },
            defaultValue: 'column',
            cssVars: ['--sarak-global-flow-direction'],
            structuralConsumer: ['useStructuralStyles.getContainerStyles']
        },
        {
            id: 'globalFlowAlign',
            label: 'Alinhamento do Fluxo Global',
            type: 'select',
            constraints: {
                options: [
                    { id: 'stretch', value: 'stretch', label: 'Esticar (Stretch)' },
                    { id: 'start', value: 'start', label: 'Início' },
                    { id: 'center', value: 'center', label: 'Centro' },
                    { id: 'end', value: 'end', label: 'Fim' }
                ]
            },
            defaultValue: 'stretch',
            cssVars: ['--sarak-global-flow-align'],
            structuralConsumer: ['useStructuralStyles.getContainerStyles']
        },

        // --- HEADER ---
        {
            id: 'headerAlignment',
            label: 'Alinhamento do Header',
            type: 'select',
            constraints: {
                options: [
                    { id: 'space-between', value: 'space-between', label: 'Espaçado (Between)' },
                    { id: 'center', value: 'center', label: 'Centro' },
                    { id: 'start', value: 'start', label: 'Início' }
                ]
            },
            defaultValue: 'space-between',
            cssVars: ['--sarak-header-alignment'],
            structuralConsumer: ['useStructuralStyles.getHeaderStyles']
        },

        // --- FORMULÁRIOS ---
        {
            id: 'formLabelPosition',
            label: 'Posição do Rótulo (Form)',
            type: 'select',
            constraints: {
                options: [
                    { id: 'top', value: 'top', label: 'Acima' },
                    { id: 'left', value: 'left', label: 'À Esquerda' }
                ]
            },
            defaultValue: 'top',
            cssVars: ['--sarak-form-label-position'],
            structuralConsumer: ['useStructuralStyles.getFormGroupStyles']
        },
        {
            id: 'formFieldDensity',
            label: 'Densidade dos Campos (Form)',
            type: 'select',
            constraints: {
                options: [
                    { id: 'tight', value: 'tight', label: 'Compacta' },
                    { id: 'comfortable', value: 'comfortable', label: 'Confortável' },
                    { id: 'relaxed', value: 'relaxed', label: 'Espaçosa' }
                ]
            },
            defaultValue: 'comfortable',
            cssVars: ['--sarak-form-field-density'],
            structuralConsumer: ['useStructuralStyles.getFormGroupStyles']
        },

        // --- SWITCHES / CHECKBOXES ---
        {
            id: 'switchLabelPosition',
            label: 'Posição do Rótulo (Switch)',
            type: 'select',
            constraints: {
                options: [
                    { id: 'right', value: 'right', label: 'À Direita' },
                    { id: 'left', value: 'left', label: 'À Esquerda' },
                    { id: 'space-between', value: 'space-between', label: 'Espaçado (Between)' }
                ]
            },
            defaultValue: 'right',
            cssVars: ['--sarak-switch-label-position'],
            structuralConsumer: ['useStructuralStyles.getSwitchLayoutStyles']
        },

        // --- SPLIT PANE (Spec 27) ---
        {
            id: 'splitPaneMinWidth',
            label: 'Split Pane: Largura Mínima do Painel Secundário',
            type: 'slider',
            unit: 'px',
            constraints: { min: 40, max: 400 },
            defaultValue: 100,
            cssVars: ['--sarak-split-pane-min-width']
        }
    ]
};
