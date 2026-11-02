import type { ComponentSchema } from '../types';

/** Os papéis de cor que uma barra pode assumir; `neutral` é o fundo de sempre. */
const BAR_TONE_OPTIONS = [
    { id: 'neutral', value: 'neutral', label: 'Neutro' },
    { id: 'surface', value: 'surface', label: 'Superfície' },
    { id: 'primary', value: 'primary', label: 'Primária' },
    { id: 'secondary', value: 'secondary', label: 'Secundária' },
    { id: 'inverse', value: 'inverse', label: 'Invertido' },
];

const SIDEBAR_LOGO_PLACEMENT_OPTIONS = [
    { id: 'top', value: 'top', label: 'No topo' },
    { id: 'bottom', value: 'bottom', label: 'Na base' },
];

/**
 * Tokens que dão personalidade às barras: posição da marca, papel de cor e largura ajustável. Moram aqui, e não em
 * `navigation.ts`, só para esse arquivo caber no teto de linhas; `NavigationSchema` os incorpora.
 */
export const BarPersonalitySchema: ComponentSchema = {
    id: 'navigation-bar-personality',
    label: 'Personalidade das Barras',
    tokens: [
        {
            id: 'sidebarLogoPlacement',
            kind: 'aesthetic',
            modeDependent: false,
            usage: 'Põe a marca no topo da lateral (padrão) ou na base, acima do rodapé; só vale na lateral. Recolhida, fica só o símbolo.',
            interactsWith: ['sidebarPosition', 'shellBrandLogoSize'],
            label: 'Posição da Marca (Sidebar)',
            type: 'select',
            description: 'Em que ponto da barra lateral a marca aparece: no topo, antes da navegação, ou na base, logo acima do rodapé.',
            axis: 'geometry',
            constraints: { options: SIDEBAR_LOGO_PLACEMENT_OPTIONS },
            defaultValue: 'top',
            structuralConsumer: ['ChromeSidebarBody'],
        },
        {
            id: 'sidebarTone',
            kind: 'aesthetic',
            modeDependent: false,
            usage: 'Papel de cor do fundo da barra lateral: a paleta calcula o fundo e os textos legíveis sobre ele, nos dois modos. Uma cor declarada em `sidebarColor` continua vencendo.',
            interactsWith: ['sidebarColor', 'sidebarActiveItemStyle'],
            label: 'Papel de Cor (Sidebar)',
            type: 'select',
            description: 'Escolhe de qual papel da paleta vem o fundo da barra lateral: neutro (o de sempre), superfície, primária, secundária ou invertido em relação ao corpo. O texto e o ícone da barra seguem legíveis em qualquer papel.',
            axis: 'color',
            constraints: { options: BAR_TONE_OPTIONS },
            defaultValue: 'neutral',
            structuralConsumer: ['useNavigationAppearance', 'ChromeSidebarBody'],
        },
        {
            id: 'topbarTone',
            kind: 'aesthetic',
            modeDependent: false,
            usage: 'Papel de cor do fundo da barra do topo: a paleta calcula o fundo e os textos legíveis sobre ele, nos dois modos. Uma cor declarada em `topbarColor` continua vencendo.',
            interactsWith: ['topbarColor', 'topbarActiveItemStyle'],
            label: 'Papel de Cor (Topbar)',
            type: 'select',
            description: 'Escolhe de qual papel da paleta vem o fundo da barra do topo: neutro (o de sempre), superfície, primária, secundária ou invertido em relação ao corpo. O texto e o ícone da barra seguem legíveis em qualquer papel.',
            axis: 'color',
            constraints: { options: BAR_TONE_OPTIONS },
            defaultValue: 'neutral',
            structuralConsumer: ['useNavigationAppearance', 'ChromeTopbarBody'],
        },
        {
            id: 'sidebarResizable',
            kind: 'functional',
            modeDependent: false,
            usage: 'Liga uma alça na borda da lateral aberta: o usuário arrasta ou usa as setas, entre o piso e o teto de largura. O valor escolhido é preferência do usuário, nunca do tema.',
            interactsWith: ['sidebarWidth', 'sidebarMinWidth', 'sidebarMaxWidth'],
            label: 'Largura Ajustável (Sidebar)',
            type: 'boolean',
            description: 'Quando ativo, o usuário ajusta a largura da barra lateral aberta por uma alça na borda; duplo clique volta ao padrão. Some fora da faixa de cromo lateral.',
            defaultValue: false,
        },
    ],
};
