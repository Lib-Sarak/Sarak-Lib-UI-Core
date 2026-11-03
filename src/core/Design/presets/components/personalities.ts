import type { SarakDesignState } from '../../../Provider/types';
import type { ComponentPreset } from './cards';
import { ALL_COMPONENT_PRESETS } from './registry';

/**
 * Uma Personalidade é um preset composto de ESTRUTURA: forma, fontes, densidade, barras, tabela, movimento e ícones de uma
 * vez, sem nenhuma cor. A paleta continua a escolhida no rascunho; `sidebarTone` e `topbarTone` são papel da paleta, não cor.
 * Nasce dos grupos do registro (`parts`) e só o que nenhum grupo cobre vem em `extra`.
 */
export interface Personality extends ComponentPreset {
    /** Os ids dos presets do registro que compõem a Personalidade, na ordem em que se sobrepõem. */
    parts: readonly string[];
}

const BY_ID: ReadonlyMap<string, ComponentPreset> = new Map(ALL_COMPONENT_PRESETS.map((preset) => [preset.id, preset]));

const partDesign = (id: string): Partial<SarakDesignState> => {
    const preset = BY_ID.get(id);
    if (!preset) throw new Error(`Personalidade aponta para preset que não existe: ${id}`);
    return preset.design;
};

const personality = (
    id: string,
    name: string,
    description: string,
    keywords: string[],
    parts: string[],
    extra: Partial<SarakDesignState>,
): Personality => ({
    id,
    name,
    description,
    keywords,
    parts,
    design: Object.assign({}, ...parts.map(partDesign), extra) as Partial<SarakDesignState>,
});

/** A fonte de código do par técnico, que a Personalidade Técnica põe também no corpo do texto. */
const TECHNICAL_MONO = partDesign('pair-technical').monoFont;

export const PERSONALITIES: Personality[] = [
    personality(
        'personality-corporate', 'Corporativo', 'Sóbrio e denso, com tabelas fortes e a lateral escura: o ar de um sistema de empresa.',
        ['corporativo', 'corporate', 'empresa', 'sobrio', 'formal'],
        ['corners-soft', 'shadow-defined', 'border-solid', 'pair-corporate', 'typescale-standard', 'density-compact', 'sidebar-inverted', 'topbar-solid', 'table-striped', 'motion-agile', 'icons-lucide-fine'],
        { navigationStyle: 'sidebar', sidebarLogoPlacement: 'top', sidebarTone: 'inverse', topbarTone: 'surface', sidebarActiveItemStyle: 'bar', tableDensity: 'compact', tableCellPadding: 8, tableBorderRadius: 6 },
    ),
    personality(
        'personality-executive', 'Executivo', 'Espaçoso e serifado, com a navegação no topo: poucas coisas por tela, cada uma com respiro.',
        ['executivo', 'executive', 'espacoso', 'serifado', 'elegante'],
        ['corners-soft', 'shadow-soft', 'border-double', 'pair-elegant', 'typescale-editorial', 'density-airy', 'sidebar-airy', 'topbar-flat', 'table-airy', 'motion-calm', 'icons-phosphor-thin'],
        { navigationStyle: 'topbar', sidebarLogoPlacement: 'top', sidebarTone: 'surface', topbarTone: 'secondary', topbarActiveItemStyle: 'underline' },
    ),
    personality(
        'personality-technical', 'Técnico', 'Fonte de código, cantos retos e tudo compacto: o ar de uma ferramenta de engenharia.',
        ['tecnico', 'technical', 'mono', 'engenharia', 'compacto'],
        ['corners-sharp', 'shadow-none', 'border-solid', 'pair-technical', 'typescale-compact', 'density-tight', 'sidebar-compact', 'topbar-compact', 'table-sharp-dense', 'motion-agile', 'icons-tabler-regular'],
        { navigationStyle: 'sidebar', sidebarLogoPlacement: 'bottom', sidebarTone: 'neutral', topbarTone: 'neutral', bodyFont: TECHNICAL_MONO, sidebarActiveItemStyle: 'outline' },
    ),
    personality(
        'personality-modern', 'Moderno', 'Arredondado e leve: a lateral flutua solta da tela, na cor da marca, e o movimento tem ricochete.',
        ['moderno', 'modern', 'arredondado', 'leve', 'flutuante'],
        ['corners-round', 'shadow-ambient', 'border-solid', 'pair-modern', 'typescale-standard', 'density-comfortable', 'sidebar-floating', 'topbar-glass', 'table-rounded-striped', 'motion-expressive', 'icons-phosphor-duotone'],
        { navigationStyle: 'sidebar', sidebarLogoPlacement: 'top', sidebarTone: 'primary', topbarTone: 'surface', sidebarActiveItemStyle: 'pill' },
    ),
    personality(
        'personality-soft', 'Suave', 'Sem bordas e com sombras macias: tudo se separa por volume e não por linha.',
        ['suave', 'soft', 'sem bordas', 'macio', 'sombras'],
        ['corners-round', 'shadow-ambient', 'border-none', 'material-organic', 'pair-humanist', 'typescale-friendly', 'density-comfortable', 'sidebar-solid', 'topbar-flat', 'table-default', 'motion-calm', 'icons-phosphor-fill'],
        { navigationStyle: 'sidebar', sidebarLogoPlacement: 'top', sidebarTone: 'surface', topbarTone: 'neutral', sidebarActiveItemStyle: 'pill', navItemRadius: 18 },
    ),
    personality(
        'personality-editorial', 'Editorial', 'O texto é o protagonista: títulos grandes e leves, barras discretas e entrelinha solta.',
        ['editorial', 'revista', 'magazine', 'jornal'],
        ['corners-soft', 'shadow-none', 'border-solid', 'pair-editorial', 'typescale-editorial', 'density-comfortable', 'sidebar-clean', 'topbar-divided', 'table-default', 'motion-calm', 'icons-lucide-fine'],
        { navigationStyle: 'topbar', sidebarLogoPlacement: 'top', sidebarTone: 'neutral', topbarTone: 'neutral', topbarActiveItemStyle: 'underline', bodyLineHeight: 1.8 },
    ),
    personality(
        'personality-brutalist', 'Brutalista', 'Bordas grossas, cantos retos e títulos pesados: contraste alto, sem disfarce.',
        ['brutalista', 'brutalist', 'bordas fortes', 'contraste', 'cru'],
        ['corners-sharp', 'shadow-defined', 'border-solid', 'pair-impact', 'typescale-impact', 'density-comfortable', 'sidebar-outlined', 'topbar-outlined', 'table-sharp-dense', 'motion-instant', 'icons-lucide-bold'],
        {
            navigationStyle: 'topbar', sidebarLogoPlacement: 'top', sidebarTone: 'primary', topbarTone: 'surface', sidebarActiveItemStyle: 'filled', topbarActiveItemStyle: 'filled',
            sidebarBorderWidth: 3, topbarBorderWidth: 3, cardBorderWidth: 3, tableDensity: 'comfortable', tableCellPadding: 10,
        },
    ),
    personality(
        'personality-glass', 'Vidro', 'Translúcido e com atmosfera: vidro cristalino sobre um fundo de manchas de cor, e o topo em pílulas.',
        ['vidro', 'glass', 'translucido', 'atmosfera', 'cristal'],
        ['corners-round', 'shadow-ambient', 'border-none', 'material-frosted', 'glass-crystal', 'bg-vignette-soft', 'bg-gradient-mesh', 'pair-geometric', 'typescale-friendly', 'density-comfortable', 'sidebar-floating', 'topbar-glass', 'table-default', 'motion-expressive', 'icons-phosphor-thin'],
        { navigationStyle: 'topbar', sidebarLogoPlacement: 'top', sidebarTone: 'surface', topbarTone: 'surface', sidebarActiveItemStyle: 'outline', topbarActiveItemStyle: 'pill' },
    ),
    personality(
        'personality-erp', 'ERP de alta densidade', 'O máximo de dados por tela: espaços mínimos, tabela de planilha e a marca na base da lateral.',
        ['erp', 'alta densidade', 'planilha', 'dados', 'denso'],
        ['corners-soft', 'shadow-none', 'border-solid', 'pair-geometric', 'typescale-compact', 'density-tight', 'sidebar-compact', 'topbar-compact', 'table-sharp-dense', 'motion-instant', 'icons-tabler-light'],
        { navigationStyle: 'sidebar', sidebarLogoPlacement: 'bottom', sidebarTone: 'secondary', topbarTone: 'surface', sidebarActiveItemStyle: 'bar', sidebarIconSize: 15, tableBorderRadius: 4 },
    ),
    personality(
        'personality-operations', 'Painel de operação', 'Para telas ligadas o dia todo: sem animação, ícones firmes, item ativo preenchido e linhas listradas.',
        ['operacao', 'operations', 'painel', 'monitoramento', 'sala de controle'],
        ['corners-soft', 'shadow-none', 'border-solid', 'pair-modern', 'typescale-standard', 'density-compact', 'sidebar-compact', 'topbar-flat', 'table-striped', 'motion-instant', 'icons-lucide-bold'],
        { navigationStyle: 'sidebar', sidebarLogoPlacement: 'bottom', sidebarTone: 'inverse', topbarTone: 'neutral', sidebarActiveItemStyle: 'filled', sidebarIconSize: 20, tableDensity: 'comfortable', tableCellPadding: 10 },
    ),
];

export const getPersonality = (id: string): Personality | undefined => PERSONALITIES.find((personality) => personality.id === id);
