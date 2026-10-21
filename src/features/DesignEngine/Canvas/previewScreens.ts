export const MORE_PREVIEW_SCREEN_ID = 'more-screens';

export const MAIN_PREVIEW_SCREENS = [
    { id: 'dashboard', label: 'Painel' },
    { id: 'forms', label: 'Formulário' },
    { id: 'tabela', label: 'Tabela' },
    { id: 'caixas-texto', label: 'Texto' },
    { id: 'graficos', label: 'Gráficos' },
    { id: 'typography', label: 'Tipografia' },
] as const;

export const ADDITIONAL_PREVIEW_SCREENS = [
    { id: 'components', label: 'Componentes' },
    { id: 'auth', label: 'Entrar' },
    { id: 'chat', label: 'Chat' },
    { id: 'logs', label: 'Registros' },
    { id: 'settings', label: 'Configurações' },
    { id: 'documentos', label: 'Documentos' },
    { id: 'matrix', label: 'Matriz' },
    { id: 'kitchen-sink', label: 'Todos os componentes' },
] as const;

export const isAdditionalPreviewScreen = (appId: string): boolean =>
    ADDITIONAL_PREVIEW_SCREENS.some(({ id }) => id === appId);
