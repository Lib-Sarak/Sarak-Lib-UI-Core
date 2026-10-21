import { ComponentSchema } from '../types';

export const GlobalSchema: ComponentSchema = {
    id: 'global',
    label: '0. Configurações Globais',
    tokens: [
        {
            id: 'mode',
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Declara o modo nativo do tema: define o ícone do alternador e a mistura da vinheta. A paleta só inverte pela preferência de modo do usuário (`colorMode`), que aplica a contraparte; sozinho, o valor não repinta a tela.",
            interactsWith: ['vignetteOpacity'],
            label: 'Tema do Sistema',
            type: 'select',
            description: 'Modo nativo do tema (claro ou escuro). A paleta inverte pela preferência de modo do usuário, que aplica a contraparte do tema; o valor sozinho decide o ícone do alternador e a mistura da vinheta. Vários tokens de cor têm defaults distintos por modo.',
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
            kind: 'functional',
            modeDependent: false,
            usage: "Escolhe onde fica a navegação: Sidebar (coluna lateral) ou Topbar (cabeçalho). Troca a estrutura inteira do cromo; a preferência do usuário, quando oferecida, vence o valor do tema.",
            interactsWith: ['sidebarPosition', 'mobileNavigationStyle'],
            label: 'Estrutura de Navegação',
            type: 'select',
            description: 'Define onde a navegação principal do sistema é renderizada: Sidebar (coluna fixa à esquerda, ideal para apps densos com muitos itens de menu) ou Topbar (cabeçalho horizontal, mais compacto verticalmente). Muda a estrutura de layout inteira, não só cor. No celular o cromo tem a própria escolha (Navegação no Celular).',
            constraints: {
                options: [
                    { value: 'sidebar', label: 'Sidebar (Esquerda)' },
                    { value: 'topbar', label: 'Topbar (Cabeçalho)' }
                ]
            },
            defaultValue: 'sidebar',
            cssVars: ['--sarak-navigation-style', '--sarak-nav-style', '--nav-style']
        },
        {
            id: 'mobileNavigationStyle',
            kind: 'functional',
            modeDependent: false,
            usage: "Onde a navegação fica no celular: barra na base, gaveta atrás do hambúrguer ou automático (barra com até 5 destinos, gaveta acima disso). Tablet e desktop não mudam.",
            interactsWith: ['navigationStyle'],
            label: 'Navegação no Celular',
            type: 'select',
            description: 'Onde a navegação fica no celular: Barra na base (ícone e rótulo na zona do polegar, sempre visível), Gaveta (atrás do hambúrguer, indicada para muitos destinos) ou Automático — barra na base quando há até 5 destinos e gaveta acima disso. Tablet e desktop não mudam.',
            axis: 'geometry',
            constraints: {
                options: [
                    { id: 'auto', value: 'auto', label: 'Automático (até 5 itens na base)' },
                    { id: 'bottom', value: 'bottom', label: 'Barra na base' },
                    { id: 'drawer', value: 'drawer', label: 'Gaveta' }
                ]
            },
            defaultValue: 'auto'
        },
        {
            id: 'bodySize',
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Tamanho da fonte do `body` (12 a 20 px): todo texto que herda dele muda, e as alturas do cromo acompanham. A preferência de tamanho do usuário (P/M/G) soma-se a este valor.",
            label: 'Tamanho Global das Fontes',
            type: 'select',
            description: 'Tamanho da fonte do corpo (`body`): o texto que herda dele muda de tamanho. Componentes com tamanho próprio — a escala tipográfica `typeScale*` em px e as classes `text-*` em rem — não escalam. Valores menores (12-14px) favorecem densidade (dashboards, tabelas); maiores (18-20px), legibilidade.',
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
