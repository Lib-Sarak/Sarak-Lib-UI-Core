import { ComponentSchema } from '../types';

export const GlobalSchema: ComponentSchema = {
    id: 'global',
    label: '0. Configurações Globais',
    tokens: [
        {
            id: 'mode',
            label: 'Tema do Sistema',
            type: 'select',
            description: 'Raiz cromática global do sistema — alterna a aplicação inteira entre claro e escuro, invertendo os contrastes primários (fundo, texto, superfícies). É o primeiro token a decidir antes de ajustar qualquer cor individual, pois vários outros tokens de cor têm defaults distintos por modo.',
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
            description: 'Define onde a navegação principal do sistema é renderizada: Sidebar (coluna fixa à esquerda, ideal para apps densos com muitos itens de menu), Topbar (cabeçalho horizontal, mais compacto verticalmente) ou Doca Flutuante (barra inferior estilo mobile/dock, híbrida). Muda a estrutura de layout inteira, não só cor.',
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
            description: 'Tamanho base da fonte para todo o corpo de texto da aplicação — escala todos os textos proporcionalmente. Valores menores (12-14px) favorecem densidade de informação (dashboards, tabelas); valores maiores (18-20px) favorecem legibilidade/acessibilidade.',
            axis: 'density',
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
