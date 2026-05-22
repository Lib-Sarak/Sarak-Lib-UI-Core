import { ComponentSchema } from '../types';

export const GlobalSchema: ComponentSchema = {
    id: 'global',
    label: '0. Configurações Globais',
    tokens: [
        {
            id: 'mode',
            label: 'Tema do Sistema',
            type: 'select',
            constraints: {
                options: [
                    { value: 'dark', label: 'Dark Mode (Padrão)' },
                    { value: 'light', label: 'Light Mode' }
                ]
            },
            defaultValue: 'dark'
        },
        {
            id: 'navigationStyle',
            label: 'Estrutura de Navegação',
            type: 'select',
            constraints: {
                options: [
                    { value: 'sidebar', label: 'Sidebar (Esquerda)' },
                    { value: 'topbar', label: 'Topbar (Cabeçalho)' },
                    { value: 'dock', label: 'Doca Flutuante (Híbrida)' }
                ]
            },
            defaultValue: 'sidebar',
            cssVars: ['--sarak-navigation-style', '--sarak-nav-style', '--nav-style']
        },
        {
            id: 'bodySize',
            label: 'Tamanho Global das Fontes',
            type: 'select',
            constraints: {
                options: [
                    { value: '12px', label: 'PP (Mini - 12px)' },
                    { value: '14px', label: 'P (Pequeno - 14px)' },
                    { value: '16px', label: 'M (Médio - 16px)' },
                    { value: '18px', label: 'G (Grande - 18px)' },
                    { value: '20px', label: 'GG (Gigante - 20px)' }
                ]
            },
            defaultValue: '14px',
            cssVars: ['--sarak-body-size', '--theme-font-size-base']
        }
    ]
};
