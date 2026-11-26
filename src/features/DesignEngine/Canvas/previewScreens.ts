import type { LibraryTextKey } from '../../../core/i18n/catalog';

export const MORE_PREVIEW_SCREEN_ID = 'more-screens';

/** `label` é o português; `labelKey` é a chave do catálogo que a tela mostra no idioma que vale. */
export interface PreviewScreen { id: string; label: string; labelKey: LibraryTextKey }

export const MAIN_PREVIEW_SCREENS: readonly PreviewScreen[] = [
    { id: 'dashboard', label: 'Painel', labelKey: 'previewScreenDashboard' },
    { id: 'forms', label: 'Formulário', labelKey: 'previewScreenForms' },
    { id: 'tabela', label: 'Tabela', labelKey: 'previewScreenTable' },
    { id: 'caixas-texto', label: 'Texto', labelKey: 'previewScreenTextBoxes' },
    { id: 'graficos', label: 'Gráficos', labelKey: 'previewScreenCharts' },
    { id: 'typography', label: 'Tipografia', labelKey: 'previewScreenTypography' },
];

export const ADDITIONAL_PREVIEW_SCREENS: readonly PreviewScreen[] = [
    { id: 'components', label: 'Componentes', labelKey: 'previewScreenComponents' },
    { id: 'auth', label: 'Entrar', labelKey: 'previewScreenAuth' },
    { id: 'chat', label: 'Chat', labelKey: 'previewScreenChat' },
    { id: 'logs', label: 'Registros', labelKey: 'previewScreenLogs' },
    { id: 'settings', label: 'Configurações', labelKey: 'previewScreenSettings' },
    { id: 'documentos', label: 'Documentos', labelKey: 'previewScreenDocuments' },
    { id: 'matrix', label: 'Matriz', labelKey: 'previewScreenMatrix' },
    { id: 'kitchen-sink', label: 'Todos os componentes', labelKey: 'previewScreenKitchenSink' },
];

export const isAdditionalPreviewScreen = (appId: string): boolean =>
    ADDITIONAL_PREVIEW_SCREENS.some(({ id }) => id === appId);
