import { ComponentSchema } from '../types';

/**
 * SCHEMA: CONFIGURAÇÕES GLOBAIS
 * Controla o comportamento base do sistema, scrollbars e layout.
 */
export const SystemSchema: ComponentSchema = {
    id: 'system',
    label: 'Configurações de Layout',
    tokens: [
        {
            id: 'bgBaseColor',
            label: 'Cor de Fundo Base',
            type: 'color',
            description: 'Cor de fundo base do sistema (camada mais profunda) — equivalente/paralela a `colorBgBody` em `colors.ts`, consumida pela camada de configurações de layout.',
            axis: 'color',
            defaultValue: '#0a0a0c',
            cssVars: ['--sarak-bg-base']
        },
        {
            id: 'layout',
            label: 'Modo de Layout',
            type: 'select',
            description: 'Estratégia de posicionamento macro usada pelo sistema para organizar containers — Grid System (colunas fixas, mais previsível) ou Flexbox Layout (fluxo flexível, mais adaptável a conteúdo variável).',
            axis: 'geometry',
            defaultValue: 'grid',
            options: [
                { value: 'grid', label: 'Grid System' },
                { value: 'flex', label: 'Flexbox Layout' }
            ]
        },

        {
            id: 'layoutDensity',
            label: 'Densidade Visual',
            type: 'select',
            description: 'Densidade visual geral do sistema — Compacto reduz espaçamentos para caber mais informação; Espaçoso aumenta a "respiração" entre elementos para um visual mais premium/legível.',
            axis: 'density',
            defaultValue: 'comfortable',
            options: [
                { value: 'compact', label: 'Compacto' },
                { value: 'comfortable', label: 'Confortável' },
                { value: 'spacious', label: 'Espaçoso' }
            ]
        },
        {
            id: 'maxContentWidth',
            label: 'Largura Máxima do Conteúdo',
            type: 'select',
            description: 'Largura máxima do container de conteúdo principal antes de centralizar com margens laterais — Fluido (100%) usa toda a tela; valores fixos (1200-1600px) melhoram a legibilidade em monitores muito largos.',
            axis: 'geometry',
            defaultValue: '1440px',
            options: [
                { value: '1200px', label: 'Estreito (1200px)' },
                { value: '1440px', label: 'Padrão (1440px)' },
                { value: '1600px', label: 'Largo (1600px)' },
                { value: '100%', label: 'Fluido (100%)' }
            ]
        },
        {
            id: 'layoutPadding',
            label: 'Respiro do Conteúdo (Padding)',
            type: 'slider',
            description: 'Espaçamento interno do container de conteúdo principal em relação às bordas da tela, em pixels, com valores independentes por breakpoint.',
            axis: 'geometry',
            isResponsive: true,
            unit: 'px',
            constraints: { min: 0, max: 80 },
            defaultValue: { mob: 16, tab: 24, desk: 32 },
            cssVars: ['--sarak-layout-padding']
        },
        {
            id: 'isSplitViewEnabled',
            label: 'Ativar Vista Dividida (Split)',
            type: 'boolean',
            description: 'Habilita o modo de visualização dividida (dois painéis lado a lado, ex. lista + detalhe) em telas que suportam esse layout.',
            defaultValue: false
        },
        {
            id: 'isAutoHideEnabled',
            label: 'Auto-ocultar Menus',
            type: 'boolean',
            description: 'Quando ativo, oculta automaticamente sidebar/topbar após um período de inatividade ou ao rolar a página, maximizando o espaço de conteúdo.',
            defaultValue: false
        },
        // --- ARQUITETURA DE BORDAS ---
        {
            id: 'borderRadius',
            label: 'Arredondamento Padrão',
            type: 'slider',
            description: 'Raio de borda padrão do sistema, usado como referência geral quando um componente específico não define seu próprio raio — com valores independentes por breakpoint.',
            axis: 'geometry',
            isResponsive: true,
            unit: 'px',
            constraints: { min: 0, max: 40 },
            defaultValue: { mob: 8, tab: 10, desk: 12 },
            cssVars: ['--radius-theme', '--sarak-border-radius', '--border-radius']
        },
        {
            id: 'borderRadiusSm',
            label: 'Arredondamento Pequeno',
            type: 'slider',
            description: 'Raio de borda da escala "pequena" do sistema, para elementos menores (ex. badges, inputs compactos).',
            axis: 'geometry',
            isResponsive: true,
            unit: 'px',
            constraints: { min: 0, max: 20 },
            defaultValue: { mob: 4, tab: 6, desk: 6 },
            cssVars: ['--sarak-border-radius-sm']
        },
        {
            id: 'borderRadiusMd',
            label: 'Arredondamento Médio',
            type: 'slider',
            description: 'Raio de borda da escala "média" do sistema — a referência mais usada para cards e containers de tamanho padrão.',
            axis: 'geometry',
            isResponsive: true,
            unit: 'px',
            constraints: { min: 0, max: 40 },
            defaultValue: { mob: 8, tab: 10, desk: 12 },
            cssVars: ['--sarak-border-radius-md']
        },
        {
            id: 'borderRadiusLg',
            label: 'Arredondamento Grande',
            type: 'slider',
            description: 'Raio de borda da escala "grande" do sistema, para containers maiores/de destaque (ex. modais, hero sections).',
            axis: 'geometry',
            isResponsive: true,
            unit: 'px',
            constraints: { min: 0, max: 60 },
            defaultValue: { mob: 12, tab: 16, desk: 20 },
            cssVars: ['--sarak-border-radius-lg']
        },
        {
            id: 'borderWidth',
            label: 'Espessura da Borda',
            type: 'slider',
            description: 'Espessura padrão das bordas em todo o sistema, em pixels. Valores maiores criam contornos mais evidentes/técnicos; 0 remove bordas visíveis (depende de cor/sombra para demarcar elementos).',
            axis: 'geometry',
            unit: 'px',
            constraints: { min: 0, max: 10 },
            defaultValue: 1,
            cssVars: ['--theme-border-width', '--border-width', '--sarak-border-width']
        },
        {
            id: 'borderStyle',
            label: 'Estilo da Borda',
            type: 'select',
            description: 'Padrão de traço das bordas do sistema — Contínuo é o padrão neutro; Tracejado/Pontilhado dão um clima mais técnico/rascunho; Sem borda remove o traço, dependendo de sombra/cor para demarcar.',
            axis: 'texture',
            defaultValue: 'solid',
            options: [
                { value: 'solid', label: 'Contínuo (Solid)' },
                { value: 'dashed', label: 'Tracejado' },
                { value: 'dotted', label: 'Pontilhado' },
                { value: 'none', label: 'Sem borda' }
            ],
            cssVars: ['--border-style', '--sarak-border-style']
        },
        // --- ESPAÇAMENTOS (GAPS) ---
        {
            id: 'layoutGap',
            label: 'Espaçamento Padrão (Gap)',
            type: 'slider',
            description: 'Espaçamento padrão entre elementos irmãos em todo o sistema quando um componente não define seu próprio gap — com valores independentes por breakpoint.',
            axis: 'density',
            isResponsive: true,
            unit: 'px',
            constraints: { min: 0, max: 80 },
            defaultValue: { mob: 16, tab: 20, desk: 24 },
            cssVars: ['--theme-gap', '--sarak-layout-gap']
        },
        {
            id: 'layoutGapSm',
            label: 'Espaçamento Pequeno',
            type: 'slider',
            description: 'Escala "pequena" de espaçamento entre elementos, para agrupamentos densos (ex. ícones lado a lado, tags).',
            axis: 'density',
            isResponsive: true,
            unit: 'px',
            constraints: { min: 0, max: 40 },
            defaultValue: { mob: 8, tab: 10, desk: 12 },
            cssVars: ['--sarak-layout-gap-sm']
        },
        {
            id: 'layoutGapMd',
            label: 'Espaçamento Médio',
            type: 'slider',
            description: 'Escala "média" de espaçamento entre elementos — a referência mais usada entre cards/blocos de conteúdo padrão.',
            axis: 'density',
            isResponsive: true,
            unit: 'px',
            constraints: { min: 0, max: 80 },
            defaultValue: { mob: 16, tab: 20, desk: 24 },
            cssVars: ['--sarak-layout-gap-md']
        },
        {
            id: 'layoutGapLg',
            label: 'Espaçamento Grande',
            type: 'slider',
            description: 'Escala "grande" de espaçamento entre elementos, para separar blocos de conteúdo maiores/seções distintas.',
            axis: 'density',
            isResponsive: true,
            unit: 'px',
            constraints: { min: 0, max: 120 },
            defaultValue: { mob: 24, tab: 32, desk: 36 },
            cssVars: ['--sarak-layout-gap-lg']
        },
        // --- ÍCONES ---
        {
            id: 'iconFamily',
            label: 'Família de Ícones',
            type: 'select',
            description: 'Biblioteca de ícones usada em toda a aplicação. Lucide é o padrão (traço uniforme, neutro); Phosphor e Tabler têm caráter visual próprio — trocar a família muda a "personalidade" de todos os ícones de uma vez.',
            axis: 'texture',
            defaultValue: 'lucide',
            options: [
                { value: 'lucide', label: 'Lucide (Padrão)' },
                { value: 'phosphor', label: 'Phosphor' },
                { value: 'tabler', label: 'Tabler Icons' }
            ]
        },
        {
            id: 'iconWeight',
            label: 'Peso / Estilo do Ícone',
            type: 'select',
            description: 'Peso visual dos ícones — Thin/Light para um clima delicado/editorial, Regular é o padrão equilibrado, Bold/Fill para mais presença/contraste, Duotone para um estilo bicolor decorativo. Nem toda família de ícones suporta todos os pesos.',
            axis: 'density',
            defaultValue: 'regular',
            options: [
                { value: 'thin', label: 'Thin' },
                { value: 'light', label: 'Light' },
                { value: 'regular', label: 'Regular' },
                { value: 'bold', label: 'Bold' },
                { value: 'fill', label: 'Fill (Preenchido)' },
                { value: 'duotone', label: 'Duotone' }
            ]
        },
        {
            id: 'iconStrokeWidth',
            label: 'Espessura do Ícone',
            type: 'slider',
            description: 'Espessura do traço dos ícones vetoriais, em unidades relativas do SVG — valores altos dão ícones mais "gordos"/impactantes; valores baixos, mais finos/técnicos.',
            axis: 'geometry',
            constraints: { min: 1, max: 4, step: 0.5 },
            defaultValue: 2,
            cssVars: ['--sarak-icon-stroke', '--theme-icon-stroke']
        },
        // --- SCROLLBARS ---
        {
            id: 'scrollbarWidth',
            label: 'Largura da Scrollbar',
            type: 'slider',
            description: 'Espessura da barra de rolagem, em pixels, com valores independentes por breakpoint. Nota: paralelo a `scrollWidth` em `scrollbars.ts`, que é o token efetivamente lido pelo CSS de produção (`_theme.css`) — este token em `system.ts` está catalogado mas atualmente sem consumidor próprio (ver backlog de cobertura, spec 01).',
            axis: 'geometry',
            isResponsive: true,
            unit: 'px',
            constraints: { min: 2, max: 12 },
            defaultValue: { mob: 4, tab: 4, desk: 6 },
            cssVars: ['--sarak-scrollbar-width']
        },
        {
            id: 'scrollbarThumbColor',
            label: 'Cor do Trilho (Thumb)',
            type: 'color',
            description: 'Cor do cursor da barra de rolagem. Nota: paralelo a `scrollThumbColor` em `scrollbars.ts` (que é o consumido de fato) — mesma pendência de duplicação de `scrollbarWidth`.',
            axis: 'color',
            defaultValue: 'rgba(255, 255, 255, 0.1)',
            cssVars: ['--sarak-scrollbar-thumb']
        },
        // --- CORE ENGINEERING ---
        {
            id: 'industrialRegistry',
            label: 'Modo do Registro Industrial',
            type: 'boolean',
            description: 'Chave de modo interno do motor de registro de componentes (Camada 6) — controla um comportamento de bootstrap/registro em tempo de execução, não uma propriedade visual. Mantenha ligado a menos que esteja depurando o próprio motor de registro.',
            defaultValue: true
        }
    ]
};
