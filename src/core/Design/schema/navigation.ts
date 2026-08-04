import { ComponentSchema } from '../types';

/**
 * SCHEMA: NAVEGAÇÃO & SHELL
 * Governa a arquitetura de menus, barras e a estrutura de navegação do sistema.
 */
export const NavigationSchema: ComponentSchema = {
    id: 'navigation',
    label: 'Container de Nav',
    tokens: [

        {
            id: 'isNavHidden',
            label: 'Ocultar Navegação',
            type: 'boolean',
            description: 'Quando ativo, remove completamente a navegação (sidebar/topbar/dock) da tela — usado para telas de foco total (ex. apresentação, modo tela cheia de um editor).',
            defaultValue: false,
            cssVars: ['--is-nav-hidden']
        },
        // --- SIDEBAR CONFIGURATIONS ---
        {
            id: 'sidebarPosition',
            label: 'Posição da Sidebar',
            type: 'select',
            description: 'Lado da tela onde a sidebar é ancorada quando `navigationStyle` é \'sidebar\' — Esquerda é a convenção ocidental padrão; Flutuante a destaca do restante do layout com espaçamento ao redor.',
            axis: 'geometry',
            constraints: {
                options: [
                    { id: 'left', value: 'left', label: 'Esquerda' },
                    { id: 'right', value: 'right', label: 'Direita' },
                    { id: 'floating', value: 'floating', label: 'Flutuante' }
                ]
            },
            defaultValue: 'left'
        },
        {
            id: 'sidebarWidth',
            label: 'Largura da Sidebar',
            type: 'slider',
            description: 'Largura padrão da sidebar, em pixels, com valores independentes por breakpoint. Sidebars mais largas cabem mais texto/hierarquia; mais estreitas favorecem espaço para o conteúdo principal.',
            axis: 'geometry',
            isResponsive: true,
            unit: 'px',
            constraints: { min: 200, max: 400 },
            defaultValue: { mob: 200, tab: 220, desk: 240 },
            cssVars: ['--sidebar-width', '--sarak-sidebar-width']
        },
        {
            id: 'shellBrandLogoSize',
            label: 'Altura do Logo da Marca',
            type: 'slider',
            description: 'Altura, em pixels, do logo da marca no cabeçalho do shell. Logos maiores dominam a navegação; menores cedem espaço ao nome do sistema e aos itens de menu.',
            axis: 'geometry',
            unit: 'px',
            constraints: { min: 16, max: 64 },
            defaultValue: 28,
            cssVars: ['--sarak-shell-brand-logo-size']
        },
        {
            id: 'sidebarMinWidth',
            label: 'Largura Mínima da Sidebar',
            type: 'slider',
            description: 'Largura mínima, em pixels, que a sidebar pode atingir quando redimensionável pelo usuário — evita que ela colapse a ponto de truncar o conteúdo de forma ilegível.',
            axis: 'geometry',
            isResponsive: true,
            unit: 'px',
            constraints: { min: 150, max: 300 },
            defaultValue: { mob: 150, tab: 180, desk: 200 },
            cssVars: ['--sidebar-min-width']
        },
        {
            id: 'sidebarMaxWidth',
            label: 'Largura Máxima da Sidebar',
            type: 'slider',
            description: 'Largura máxima, em pixels, que a sidebar pode atingir quando redimensionável pelo usuário.',
            axis: 'geometry',
            isResponsive: true,
            unit: 'px',
            constraints: { min: 300, max: 600 },
            defaultValue: { mob: 280, tab: 350, desk: 450 },
            cssVars: ['--sidebar-max-width']
        },
        {
            id: 'sidebarColor',
            label: 'Cor da Sidebar (Fundo)',
            type: 'color',
            description: 'Cor de fundo da sidebar — costuma diferenciar-se levemente do fundo geral da aplicação para demarcar a área de navegação.',
            axis: 'color',
            defaultValue: '#000000',
            cssVars: ['--theme-sidebar-bg', '--sarak-sidebar-bg']
        },
        {
            id: 'sidebarHoverColor',
            label: 'Hover da Sidebar',
            type: 'color',
            description: 'Cor de fundo de um item de menu da sidebar ao passar o mouse — sinaliza que o item é clicável antes de ser selecionado.',
            axis: 'color',
            defaultValue: 'transparent',
            cssVars: ['--sarak-sidebar-hover-color']
        },
        {
            id: 'sidebarActiveColor',
            label: 'Ativo da Sidebar',
            type: 'color',
            description: 'Cor de fundo do item de menu atualmente selecionado na sidebar — deve ter contraste claro em relação a `sidebarHoverColor` e ao restante dos itens, para indicar a localização atual do usuário.',
            axis: 'color',
            defaultValue: 'transparent',
            cssVars: ['--sarak-sidebar-active-color']
        },
        {
            id: 'sidebarNoiseOpacity',
            label: 'Opacidade do Ruído (Sidebar)',
            type: 'slider',
            description: 'Opacidade de uma textura de ruído/grão sobreposta ao fundo da sidebar — em 0 fica imperceptível; valores altos dão um clima mais texturizado/analógico à navegação.',
            axis: 'texture',
            constraints: { min: 0, max: 1, step: 0.05 },
            defaultValue: 0,
            cssVars: ['--sarak-sidebar-noise-opacity']
        },
        // --- TOPBAR CONFIGURATIONS ---
        {
            id: 'navbarLayout',
            label: 'Comportamento da Topbar',
            type: 'select',
            description: 'Comportamento de scroll da topbar quando `navigationStyle` é \'topbar\': Fixo no Topo (sempre visível), Rola com o conteúdo (some ao rolar) ou Oculta (nunca exibida).',
            axis: 'geometry',
            constraints: {
                options: [
                    { id: 'sticky', value: 'sticky', label: 'Fixo no Topo' },
                    { id: 'inline', value: 'inline', label: 'Rola com o conteúdo' },
                    { id: 'hidden', value: 'hidden', label: 'Oculta' }
                ]
            },
            defaultValue: 'sticky'
        },
        {
            id: 'topbarHeight',
            label: 'Altura da Topbar',
            type: 'slider',
            description: 'Altura da barra de navegação superior, em pixels, com valores independentes por breakpoint. Alturas maiores dão mais espaço para itens de menu/busca; menores maximizam a área útil de conteúdo.',
            axis: 'geometry',
            isResponsive: true,
            unit: 'px',
            constraints: { min: 48, max: 100 },
            defaultValue: { mob: 56, tab: 60, desk: 64 },
            cssVars: ['--topbar-height', '--sarak-topbar-height', '--theme-topbar-height']
        },
        {
            id: 'topbarColor',
            label: 'Cor da Topbar (Fundo)',
            type: 'color',
            description: 'Cor de fundo da barra de navegação superior — costuma diferenciar-se levemente do fundo geral da aplicação.',
            axis: 'color',
            defaultValue: '#000000',
            cssVars: ['--theme-topbar-bg', '--sarak-topbar-bg']
        },
        {
            id: 'topbarHoverColor',
            label: 'Hover da Topbar',
            type: 'color',
            description: 'Cor de fundo de um item de menu da topbar ao passar o mouse.',
            axis: 'color',
            defaultValue: 'transparent',
            cssVars: ['--sarak-topbar-hover-color']
        },
        {
            id: 'topbarActiveColor',
            label: 'Ativo da Topbar',
            type: 'color',
            description: 'Cor de fundo do item de menu atualmente selecionado na topbar — deve ter contraste claro em relação a `topbarHoverColor`.',
            axis: 'color',
            defaultValue: 'transparent',
            cssVars: ['--sarak-topbar-active-color']
        },
        {
            id: 'topbarNoiseOpacity',
            label: 'Opacidade do Ruído (Topbar)',
            type: 'slider',
            description: 'Opacidade de uma textura de ruído/grão sobreposta ao fundo da topbar — mesmo conceito de `sidebarNoiseOpacity`, aplicado à barra superior.',
            axis: 'texture',
            constraints: { min: 0, max: 1, step: 0.05 },
            defaultValue: 0,
            cssVars: ['--sarak-topbar-noise-opacity']
        },
        {
            id: 'topbarTitleColor',
            label: 'Cor do Título (Topbar)',
            type: 'color',
            description: 'Cor do texto de título/breadcrumb exibido na topbar — deve manter contraste alto contra `topbarColor`.',
            axis: 'color',
            defaultValue: '#ffffff',
            cssVars: ['--sarak-topbar-title-color']
        },
        // --- SEÇÕES E TABS ---
        {
            id: 'contentAlignment',
            label: 'Alinhamento do Conteúdo',
            type: 'select',
            description: 'Alinhamento horizontal do conteúdo principal em relação à largura da tela — Largura Total ocupa todo o espaço disponível; Centralizado limita e centraliza o conteúdo (útil com `maxContentWidth`).',
            axis: 'geometry',
            constraints: {
                options: [
                    { id: 'stretch', value: 'stretch', label: 'Largura Total' },
                    { id: 'center', value: 'center', label: 'Centralizado' }
                ]
            },
            defaultValue: 'stretch'
        },
        {
            id: 'tabGap',
            label: 'Espaço entre Abas',
            type: 'slider',
            description: 'Espaçamento, em pixels, entre abas de navegação (ex. dentro da topbar ou de um grupo de tabs), com valores independentes por breakpoint.',
            axis: 'geometry',
            isResponsive: true,
            unit: 'px',
            constraints: { min: 0, max: 24 },
            defaultValue: { mob: 4, tab: 6, desk: 8 },
            cssVars: ['--tab-gap', '--sarak-tab-gap', '--theme-tab-gap']
        },
        {
            id: 'tabSectionMargin',
            label: 'Margem da Seção de Abas',
            type: 'slider',
            description: 'Margem externa da seção de abas em relação aos elementos vizinhos, em pixels, com valores independentes por breakpoint — também usada como referência de área segura (`--safe-area-padding`) em dispositivos com notch/gestos.',
            axis: 'geometry',
            isResponsive: true,
            unit: 'px',
            constraints: { min: 0, max: 48 },
            defaultValue: { mob: 8, tab: 12, desk: 16 },
            cssVars: ['--tab-section-margin', '--sarak-tab-section-margin', '--theme-tab-section-margin', '--safe-area-padding']
        },
        // --- ITENS DE MENU ---
        {
            id: 'navItemActiveColor',
            label: 'Cor do Item Ativo',
            type: 'color',
            description: 'Cor de texto/ícone do item de menu atualmente selecionado — normalmente espelha a cor primária do sistema para reforçar onde o usuário está.',
            axis: 'color',
            defaultValue: '#00f2ff',
            cssVars: ['--sarak-nav-active-color', '--theme-primary']
        },
        {
            id: 'navActiveMarkerColor',
            label: 'Cor do Marcador Ativo',
            type: 'color',
            description: 'Cor do indicador visual (barra/ponto) que marca qual item de menu está ativo — separado da cor do texto do item para permitir combinações independentes.',
            axis: 'color',
            defaultValue: '#00f2ff',
            cssVars: ['--sarak-nav-marker-color']
        },
        {
            id: 'navActiveMarkerGlow',
            label: 'Brilho do Marcador',
            type: 'slider',
            description: 'Intensidade do brilho (glow) ao redor do marcador de item ativo — 0 remove o efeito; valores altos dão mais destaque ao indicador de seleção.',
            axis: 'elevation',
            constraints: { min: 0, max: 20 },
            defaultValue: 10,
            cssVars: ['--sarak-nav-marker-glow']
        },
        // --- ESTÉTICA AVANÇADA DO SHELL ---
        {
            id: 'sidebarBlur',
            label: 'Backdrop Blur (Sidebar)',
            type: 'slider',
            description: 'Intensidade do desfoque de fundo da sidebar — só produz efeito visível quando a sidebar tem fundo translúcido, criando um clima de vidro fosco sobre o conteúdo atrás dela.',
            axis: 'elevation',
            unit: 'px',
            constraints: { min: 0, max: 50 },
            defaultValue: 10,
            cssVars: ['--sarak-sidebar-blur']
        },
        {
            id: 'sidebarShadow',
            label: 'Sombra da Sidebar',
            type: 'text',
            description: 'Definição CSS completa de `box-shadow` da sidebar — separa visualmente a navegação do conteúdo principal com uma sombra projetada lateralmente.',
            axis: 'elevation',
            defaultValue: '10px 0 30px rgba(0,0,0,0.5)',
        },
        // --- PESQUISA (SEARCH BAR) ---
        {
            id: 'searchPositionTopbar',
            label: 'Posição Pesquisa (Topbar)',
            type: 'select',
            description: 'Posição do campo de busca dentro da topbar — Esquerda/Centro/Direita posicionam o campo, Oculta remove a busca da topbar (pode ainda existir via atalho de teclado/paleta de comando).',
            axis: 'geometry',
            constraints: {
                options: [
                    { id: 'left', value: 'left', label: 'Esquerda' },
                    { id: 'center', value: 'center', label: 'Centro' },
                    { id: 'right', value: 'right', label: 'Direita' },
                    { id: 'hidden', value: 'hidden', label: 'Oculta' }
                ]
            },
            defaultValue: 'left'
        },
        {
            id: 'searchPositionSidebar',
            label: 'Posição Pesquisa (Sidebar)',
            type: 'select',
            description: 'Posição do campo de busca dentro da sidebar — Topo/Rodapé posicionam o campo, Oculta remove a busca da sidebar.',
            axis: 'geometry',
            constraints: {
                options: [
                    { id: 'top', value: 'top', label: 'Topo' },
                    { id: 'bottom', value: 'bottom', label: 'Rodapé' },
                    { id: 'hidden', value: 'hidden', label: 'Oculta' }
                ]
            },
            defaultValue: 'top'
        }
    ]
};
