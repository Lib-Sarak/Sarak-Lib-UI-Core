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
            kind: 'functional',
            modeDependent: false,
            usage: "Recolhe a navegação: a lateral estreita para o piso de largura e esconde rótulos; o topo encolhe para a altura recolhida. É o mesmo estado que o usuário alterna pelo botão de recolher.",
            interactsWith: ['sidebarMinWidth', 'topbarCollapsedHeight', 'brandLogoSizeCollapsed'],
            label: 'Ocultar Navegação',
            type: 'boolean',
            description: 'Quando ativo, recolhe a navegação: a barra lateral fica no trilho estreito (74 px) e a barra do topo na geometria compacta — o conteúdo ganha o espaço, e o menu continua alcançável. Não a remove da tela.',
            defaultValue: false,
            cssVars: ['--is-nav-hidden']
        },
        // --- SIDEBAR CONFIGURATIONS ---
        {
            id: 'sidebarPosition',
            kind: 'functional',
            modeDependent: false,
            usage: "Lado da navegação lateral: esquerda, direita (inverte a ordem) ou flutuante (cartão arredondado com margem). Só vale com navegação lateral.",
            interactsWith: ['navigationStyle'],
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
            kind: 'functional',
            modeDependent: false,
            usage: "Largura da navegação lateral (um valor por breakpoint), dentro do piso e do teto de `sidebarMinWidth` e `sidebarMaxWidth`.",
            interactsWith: ['sidebarMinWidth', 'sidebarMaxWidth'],
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
            kind: 'functional',
            modeDependent: false,
            usage: "Lado da imagem do logo na navegação lateral; aumenta a altura do bloco da marca.",
            interactsWith: ['navigationStyle'],
            label: 'Altura do Logo da Marca',
            type: 'slider',
            description: 'Altura, em pixels, do logo da marca no cabeçalho do shell. Logos maiores dominam a navegação; menores cedem espaço ao nome do sistema e aos itens de menu.',
            axis: 'geometry',
            unit: 'px',
            constraints: { min: 16, max: 64 },
            defaultValue: 32,
            cssVars: ['--sarak-shell-brand-logo-size']
        },
        {
            id: 'sidebarCollapsedWidth',
            kind: 'functional',
            modeDependent: false,
            usage: "Largura da navegação lateral recolhida (só ícones); vale sem o piso de `sidebarMinWidth`, que é da lateral aberta.",
            interactsWith: ['isNavHidden'],
            label: 'Largura da Sidebar (Recolhida)',
            type: 'slider',
            description: 'Largura, em pixels, da sidebar quando está no modo recolhido (só ícones, sem rótulo de texto) — independente de `sidebarWidth`, que só vale no modo expandido.',
            axis: 'geometry',
            unit: 'px',
            constraints: { min: 48, max: 100 },
            defaultValue: 74,
            cssVars: ['--sarak-sidebar-collapsed-width']
        },
        {
            id: 'sidebarLabelMaxWidth',
            kind: 'functional',
            modeDependent: false,
            usage: "Largura máxima do rótulo da marca na navegação lateral; acima dela o texto é cortado.",
            interactsWith: ['navigationStyle'],
            label: 'Largura Máxima do Rótulo (Sidebar)',
            type: 'slider',
            description: 'Largura máxima, em pixels, do texto de nome do sistema exibido no cabeçalho da sidebar — acima desse limite o texto trunca com reticências, para não invadir o botão de recolher.',
            axis: 'geometry',
            unit: 'px',
            constraints: { min: 60, max: 240 },
            defaultValue: 120,
            cssVars: ['--sarak-sidebar-label-max-width']
        },
        {
            id: 'sidebarMinWidth',
            kind: 'functional',
            modeDependent: false,
            usage: "Piso de largura da navegação lateral aberta; o valor também limita `sidebarWidth`. Recolhida, a largura é a de `sidebarCollapsedWidth`, sem este piso.",
            interactsWith: ['sidebarWidth', 'sidebarCollapsedWidth'],
            label: 'Largura Mínima da Sidebar',
            type: 'slider',
            description: 'Largura mínima, em pixels, que a sidebar pode atingir quando redimensionável pelo usuário — evita que ela colapse a ponto de truncar o conteúdo de forma ilegível.',
            axis: 'geometry',
            isResponsive: true,
            unit: 'px',
            constraints: { min: 150, max: 400 },
            defaultValue: { mob: 150, tab: 180, desk: 200 },
            cssVars: ['--sidebar-min-width']
        },
        {
            id: 'sidebarMaxWidth',
            kind: 'functional',
            modeDependent: false,
            usage: "Teto de largura da navegação lateral; `sidebarWidth` acima dele é cortado.",
            interactsWith: ['sidebarWidth'],
            label: 'Largura Máxima da Sidebar',
            type: 'slider',
            description: 'Largura máxima, em pixels, que a sidebar pode atingir quando redimensionável pelo usuário.',
            axis: 'geometry',
            isResponsive: true,
            unit: 'px',
            constraints: { min: 240, max: 600 },
            defaultValue: { mob: 280, tab: 350, desk: 450 },
            cssVars: ['--sidebar-max-width']
        },
        {
            id: 'sidebarColor',
            kind: 'aesthetic',
            modeDependent: true,
            usage: "Pinta o fundo da navegação lateral; a cor entra na paleta derivada do cromo.",
            interactsWith: ['navigationStyle'],
            label: 'Cor da Sidebar (Fundo)',
            type: 'color',
            description: 'Cor de fundo da sidebar — costuma diferenciar-se levemente do fundo geral da aplicação para demarcar a área de navegação.',
            axis: 'color',
            defaultValue: '#04060a',
            cssVars: ['--theme-sidebar-bg', '--sarak-sidebar-bg']
        },
        {
            id: 'sidebarHoverColor',
            kind: 'aesthetic',
            modeDependent: true,
            usage: "Fundo do item da navegação lateral sob o ponteiro; o padrão é um branco translúcido.",
            interactsWith: ['navigationStyle'],
            label: 'Hover da Sidebar',
            type: 'color',
            description: 'Cor de fundo de um item de menu da sidebar ao passar o mouse — sinaliza que o item é clicável antes de ser selecionado.',
            axis: 'color',
            defaultValue: 'rgba(255, 255, 255, 0.06)',
            cssVars: ['--sarak-sidebar-hover-color']
        },
        {
            id: 'sidebarActiveColor',
            kind: 'aesthetic',
            modeDependent: true,
            usage: "Fundo do item ativo da navegação lateral; o padrão é transparente, e o marcador do item vem de `navActiveMarkerColor`.",
            interactsWith: ['navigationStyle', 'navActiveMarkerColor'],
            label: 'Ativo da Sidebar',
            type: 'color',
            description: 'Cor de fundo do item de menu atualmente selecionado na sidebar — deve ter contraste claro em relação a `sidebarHoverColor` e ao restante dos itens, para indicar a localização atual do usuário.',
            axis: 'color',
            defaultValue: 'rgba(25, 227, 240, 0.08)',
            cssVars: ['--sarak-sidebar-active-color']
        },
        {
            id: 'sidebarNoiseOpacity',
            kind: 'aesthetic',
            modeDependent: true,
            usage: "Opacidade da textura de grão sobre a navegação lateral; 0 desliga.",
            interactsWith: ['navigationStyle'],
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
            kind: 'functional',
            modeDependent: false,
            usage: "Comportamento da barra do topo: fixa ao rolar, rola junto com o conteúdo ou oculta. Só vale com navegação no topo.",
            interactsWith: ['navigationStyle'],
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
            kind: 'functional',
            modeDependent: false,
            usage: "Altura da barra do topo, por breakpoint.",
            interactsWith: ['navigationStyle'],
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
            id: 'topbarCollapsedHeight',
            kind: 'functional',
            modeDependent: false,
            usage: "Altura da barra do topo recolhida; só aparece com `isNavHidden` ligado. Abaixo do alvo mínimo de toque (`touchTargetMin`) os controles da barra transbordam com ponteiro de dedo; por isso o padrão não cai abaixo dele.",
            interactsWith: ['isNavHidden'],
            label: 'Altura da Topbar (Recolhida)',
            type: 'slider',
            description: 'Altura, em pixels, da topbar quando está no modo recolhido (hover-to-expand) — independente de `topbarHeight`, que só vale no modo expandido.',
            axis: 'geometry',
            unit: 'px',
            constraints: { min: 44, max: 56 },
            defaultValue: 48,
            cssVars: ['--sarak-topbar-collapsed-height']
        },
        {
            id: 'brandLogoSizeCollapsed',
            kind: 'functional',
            modeDependent: false,
            usage: "Lado do logo na barra do topo recolhida; só aparece com `isNavHidden` ligado.",
            interactsWith: ['isNavHidden'],
            label: 'Altura do Logo da Marca (Recolhida)',
            type: 'slider',
            description: 'Altura, em pixels, do logo da marca no cabeçalho do shell quando a navegação está no modo recolhido — independente de `shellBrandLogoSize`, que só vale no modo expandido.',
            axis: 'geometry',
            unit: 'px',
            constraints: { min: 12, max: 32 },
            defaultValue: 20,
            cssVars: ['--sarak-brand-logo-size-collapsed']
        },
        {
            id: 'topbarColor',
            kind: 'aesthetic',
            modeDependent: true,
            usage: "Pinta o fundo da barra do topo; a cor entra na paleta derivada do cromo.",
            interactsWith: ['navigationStyle'],
            label: 'Cor da Topbar (Fundo)',
            type: 'color',
            description: 'Cor de fundo da barra de navegação superior — costuma diferenciar-se levemente do fundo geral da aplicação.',
            axis: 'color',
            defaultValue: '#04060a',
            cssVars: ['--theme-topbar-bg', '--sarak-topbar-bg']
        },
        {
            id: 'topbarHoverColor',
            kind: 'aesthetic',
            modeDependent: true,
            usage: "Fundo do item da barra do topo sob o ponteiro; o padrão é um branco translúcido.",
            interactsWith: ['navigationStyle'],
            label: 'Hover da Topbar',
            type: 'color',
            description: 'Cor de fundo de um item de menu da topbar ao passar o mouse.',
            axis: 'color',
            defaultValue: 'rgba(255, 255, 255, 0.06)',
            cssVars: ['--sarak-topbar-hover-color']
        },
        {
            id: 'topbarActiveColor',
            kind: 'aesthetic',
            modeDependent: true,
            usage: "Fundo do item ativo da barra do topo; o padrão é transparente.",
            interactsWith: ['navigationStyle'],
            label: 'Ativo da Topbar',
            type: 'color',
            description: 'Cor de fundo do item de menu atualmente selecionado na topbar — deve ter contraste claro em relação a `topbarHoverColor`.',
            axis: 'color',
            defaultValue: 'rgba(25, 227, 240, 0.08)',
            cssVars: ['--sarak-topbar-active-color']
        },
        {
            id: 'topbarNoiseOpacity',
            kind: 'aesthetic',
            modeDependent: true,
            usage: "Opacidade da textura de grão sobre a barra do topo; 0 desliga.",
            interactsWith: ['navigationStyle'],
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
            kind: 'aesthetic',
            modeDependent: true,
            usage: "Cor do nome da marca na barra do topo.",
            interactsWith: ['navigationStyle'],
            label: 'Cor do Título (Topbar)',
            type: 'color',
            description: 'Cor do texto de título/breadcrumb exibido na topbar — deve manter contraste alto contra `topbarColor`.',
            axis: 'color',
            defaultValue: '#f2f6fb',
            cssVars: ['--sarak-topbar-title-color']
        },
        {
            id: 'topbarLabelMaxWidth',
            kind: 'functional',
            modeDependent: false,
            usage: "Largura máxima do rótulo da marca na barra do topo; acima dela o texto é cortado.",
            interactsWith: ['navigationStyle'],
            label: 'Largura Máxima do Rótulo (Topbar)',
            type: 'slider',
            description: 'Largura máxima, em pixels, do texto de nome do sistema exibido na topbar — acima desse limite o texto trunca com reticências, para não invadir os itens de menu vizinhos.',
            axis: 'geometry',
            unit: 'px',
            constraints: { min: 60, max: 300 },
            defaultValue: 150,
            cssVars: ['--sarak-topbar-label-max-width']
        },
        // --- SEÇÕES E TABS ---
        {
            id: 'tabGap',
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Espaço entre os itens da navegação, por breakpoint; a lateral usa metade do valor em cada eixo.",
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
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Margem vertical das seções da navegação lateral e da barra do topo, por breakpoint.",
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
            kind: 'aesthetic',
            modeDependent: true,
            usage: "Cor do item ativo da navegação: texto, ícone e contorno do item atual, na lateral e no topo; também participa dos controles selecionados do cromo. Garanta contraste de texto e ícone nos dois modos.",
            label: 'Cor do Item Ativo',
            type: 'color',
            description: 'Cor de texto/ícone do item de menu atualmente selecionado — normalmente espelha a cor primária do sistema para reforçar onde o usuário está.',
            axis: 'color',
            defaultValue: '#19e3f0',
            // `--theme-primary` é variável de `primaryColor` (schema `colors.ts`), não deste
            // token: duas fontes escrevendo a mesma variável faria o vencedor depender da
            // ordem de iteração do mapa de tokens, não do autor do tema. `--sarak-nav-active-color`
            // é a variável própria deste token.
            cssVars: ['--sarak-nav-active-color']
        },
        {
            id: 'navActiveMarkerColor',
            kind: 'aesthetic',
            modeDependent: true,
            usage: "Cor do marcador luminoso ao lado do item ativo e do brilho dele.",
            interactsWith: ['navActiveMarkerGlow'],
            label: 'Cor do Marcador Ativo',
            type: 'color',
            description: 'Cor do indicador visual (barra/ponto) que marca qual item de menu está ativo — separado da cor do texto do item para permitir combinações independentes.',
            axis: 'color',
            defaultValue: '#19e3f0',
            cssVars: ['--sarak-nav-marker-color']
        },
        {
            id: 'navActiveMarkerGlow',
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Raio do brilho do marcador do item ativo; 0 deixa só a barrinha.",
            interactsWith: ['navActiveMarkerColor'],
            label: 'Brilho do Marcador',
            type: 'slider',
            description: 'Intensidade do brilho (glow) ao redor do marcador de item ativo — 0 remove o efeito; valores altos dão mais destaque ao indicador de seleção.',
            axis: 'elevation',
            constraints: { min: 0, max: 40 },
            defaultValue: 8,
            cssVars: ['--sarak-nav-marker-glow']
        },
        {
            id: 'navItemRadius',
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Raio dos cantos do item da navegação, o fundo do ativo e do hover, na lateral, no topo e no recolhido; 0 deixa o item reto e 16 ou mais o torna cápsula.",
            interactsWith: ['sidebarActiveColor', 'topbarActiveColor', 'sidebarHoverColor', 'topbarHoverColor'],
            label: 'Raio do Item de Menu',
            type: 'slider',
            description: 'Raio, em pixels, dos cantos de cada item de navegação — é a forma do fundo que marca o item ativo e o item sob o ponteiro, igual nas barras lateral e do topo. 0 deixa o item reto; valores altos o arredondam até a forma de cápsula.',
            axis: 'geometry',
            unit: 'px',
            constraints: { min: 0, max: 24 },
            defaultValue: 12,
            cssVars: ['--sarak-nav-item-radius']
        },
        // --- ESTÉTICA AVANÇADA DO SHELL ---
        {
            id: 'sidebarBlur',
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Desfoque do que passa atrás da navegação lateral, útil com cor translúcida.",
            interactsWith: ['sidebarColor'],
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
            kind: 'aesthetic',
            modeDependent: true,
            usage: "Sombra da navegação lateral, escrita como `box-shadow` completo; a cor da sombra precisa ser trocada na contraparte.",
            interactsWith: ['navigationStyle'],
            label: 'Sombra da Sidebar',
            type: 'text',
            description: 'Definição CSS completa de `box-shadow` da sidebar — separa visualmente a navegação do conteúdo principal com uma sombra projetada lateralmente.',
            axis: 'elevation',
            defaultValue: '10px 0 30px rgba(0,0,0,0.5)',
        },
        // --- PESQUISA (SEARCH BAR) ---
        {
            id: 'searchPositionTopbar',
            kind: 'functional',
            modeDependent: false,
            usage: "Onde a busca fica na barra do topo: esquerda (antes da navegação), centro (no meio do espaço livre entre a navegação e o grupo final, não no centro da barra), direita (no grupo final) ou oculta.",
            interactsWith: ['navigationStyle', 'chromeSearchPosition'],
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
            kind: 'functional',
            modeDependent: false,
            usage: "Onde a busca fica na navegação lateral: no topo ou no rodapé do bloco.",
            interactsWith: ['navigationStyle', 'chromeSearchPosition'],
            label: 'Posição Pesquisa (Sidebar)',
            type: 'select',
            description: 'Posição do campo de busca dentro da sidebar — Topo/Rodapé posicionam o campo. Para não oferecer a busca, use o token de composição da barra.',
            axis: 'geometry',
            constraints: {
                options: [
                    { id: 'top', value: 'top', label: 'Topo' },
                    { id: 'bottom', value: 'bottom', label: 'Rodapé' }
                ]
            },
            defaultValue: 'top'
        },
        {
            id: 'chromeSearchPosition',
            kind: 'functional',
            modeDependent: false,
            usage: "Posição do widget de busca no cromo: fixo na barra, dentro do menu de preferências ou não oferecido; fora da barra ele some do lugar de origem.",
            interactsWith: ['searchPositionTopbar', 'searchPositionSidebar'],
            label: 'Composição: Busca',
            type: 'select',
            description: 'Define se a busca fica fixa na barra, dentro do menu de preferências ou não é oferecida.',
            axis: 'geometry',
            constraints: {
                options: [
                    { id: 'pinned', value: 'pinned', label: 'Fixa na barra' },
                    { id: 'menu', value: 'menu', label: 'No menu' },
                    { id: 'off', value: 'off', label: 'Não oferecida' }
                ]
            },
            defaultValue: 'pinned'
        },
        {
            id: 'chromeUserPosition',
            kind: 'functional',
            modeDependent: false,
            usage: "Posição do widget de usuário no cromo: fixo, no menu de preferências ou não oferecido; sem ele a navegação ganha o espaço.",
            label: 'Composição: Usuário',
            type: 'select',
            description: 'Define se o widget do usuário fica fixo na barra, dentro do menu de preferências ou não é oferecido.',
            axis: 'geometry',
            constraints: {
                options: [
                    { id: 'pinned', value: 'pinned', label: 'Fixa na barra' },
                    { id: 'menu', value: 'menu', label: 'No menu' },
                    { id: 'off', value: 'off', label: 'Não oferecido' }
                ]
            },
            defaultValue: 'pinned'
        },
        {
            id: 'chromeNotificationsPosition',
            kind: 'functional',
            modeDependent: false,
            usage: "Posição das notificações no cromo: fixas, no menu de preferências ou não oferecidas.",
            label: 'Composição: Notificações',
            type: 'select',
            description: 'Define se as notificações ficam fixas na barra, dentro do menu de preferências ou não são oferecidas.',
            axis: 'geometry',
            constraints: {
                options: [
                    { id: 'pinned', value: 'pinned', label: 'Fixa na barra' },
                    { id: 'menu', value: 'menu', label: 'No menu' },
                    { id: 'off', value: 'off', label: 'Não oferecidas' }
                ]
            },
            defaultValue: 'pinned'
        },
        {
            id: 'searchDropdownGap',
            kind: 'functional',
            modeDependent: false,
            usage: "Distância, em rem, entre o topo da tela e a paleta de busca; empurra o painel para baixo.",
            interactsWith: ['searchDropdownWidth'],
            label: 'Espaço do Dropdown de Busca',
            type: 'slider',
            description: 'Distância, em `rem`, entre o campo de busca da topbar e o dropdown de resultados que aparece abaixo dele.',
            axis: 'geometry',
            unit: 'rem',
            constraints: { min: 0, max: 2, step: 0.5 },
            defaultValue: 0.5,
            cssVars: ['--sarak-search-dropdown-gap']
        },
        {
            id: 'searchDropdownWidth',
            kind: 'functional',
            modeDependent: false,
            usage: "Largura máxima da paleta de busca.",
            interactsWith: ['searchDropdownGap'],
            label: 'Largura do Dropdown de Busca',
            type: 'slider',
            description: 'Largura, em pixels, do painel de resultados exibido abaixo do campo de busca da topbar.',
            axis: 'geometry',
            unit: 'px',
            constraints: { min: 240, max: 600 },
            defaultValue: 400,
            cssVars: ['--sarak-search-dropdown-width']
        }
    ]
};
