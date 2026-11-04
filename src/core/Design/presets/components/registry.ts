import { CARD_PRESETS, CARD_TEXTURE_PRESETS, type ComponentPreset } from './cards';
import { BUTTON_PRESETS, BUTTON_STYLE_PRESETS } from './buttons';
import { INPUT_PRESETS } from './inputs';
import { AMBIENT_PRESETS, GRADIENT_PRESETS, MEDIA_PRESETS, TEXTURE_PRESETS } from './atmosphere';
import { TYPOGRAPHY_PRESETS } from './typography';
import { CONTENT_WIDTH_PRESETS, SIDEBAR_PRESETS, TOPBAR_PRESETS } from './layout';
import { CORNER_PRESETS, DENSITY_PRESETS } from './shapeGeometry';
import { BORDER_PRESETS, GLASS_PRESETS, MATERIAL_PRESETS, SHADOW_DIRECTION_PRESETS, SHADOW_PRESETS } from './shapeSurface';
import { CHART_PRESETS, TABLE_PRESETS } from './dataPresets';
import { MODAL_PRESETS, NOTICE_PRESETS, SWITCH_PRESETS } from './overlayPresets';
import { BADGE_PRESETS, EMPTY_STATE_PRESETS, SCROLL_PRESETS } from './feedbackPresets';
import { ICON_PRESETS, MOTION_PRESETS, PAGE_TRANSITION_PRESETS } from './motionIcons';
import { FEATURED_FONTS, FONT_PAIR_PRESETS, TYPE_SCALE_PRESETS } from './typographyKits';
import { FEATURED_TEXTURES } from './textureFamilies';

export type PresetDecisionId = 'fonts' | 'shape' | 'components' | 'layout';

/** O desenho que a galeria usa para mostrar a opção: sempre o componente real, nunca uma imagem. */
export type PresetSampleKind =
    | 'bar' | 'width' | 'card' | 'cardTexture' | 'surface' | 'glass' | 'atmosphere' | 'texture' | 'button' | 'input' | 'table' | 'chart'
    | 'modal' | 'notice' | 'switch' | 'scroll' | 'badge' | 'empty' | 'motion' | 'page' | 'icons' | 'fontPair' | 'typeScale' | 'font';

export interface PresetGroupDef {
    id: string;
    decision: PresetDecisionId;
    sample: PresetSampleKind;
    presets: readonly ComponentPreset[];
    /** Os ids que a galeria mostra antes do "Ver todas": de 6 a 8 quando o grupo tem mais que isso. */
    featured: readonly string[];
    /** Os schemas de onde os presets do grupo podem tirar token: a área dele. */
    areas: readonly string[];
    /** Estreita a área: só o token cujo id casa vale para o grupo. */
    owns?: RegExp;
    /** O grupo lista as opções de um token só (cada preset, um valor): a distinção é o valor, não dois tokens. */
    optionsOfOneToken?: boolean;
}

const firstIds = (presets: readonly ComponentPreset[], count: number): string[] => presets.slice(0, count).map((preset) => preset.id);
const idsOf = (presets: readonly ComponentPreset[]): string[] => presets.map((preset) => preset.id);
/** Tira das destacadas as opções que a miniatura não distingue das outras (menos de 2% dos pixels, medido no spec de navegador dos presets do painel); continuam em "Ver todas". */
const except = (ids: readonly string[], demoted: readonly string[]): string[] => ids.filter((id) => !demoted.includes(id));

const FEATURED_CARDS = ['card-glass-minimal', 'card-flat-minimal', 'card-soft-elevated', 'card-cyberpunk-neon', 'card-side-accent', 'card-glow-halo', 'card-centered', 'card-organic-craft'];
const FEATURED_BUTTONS = ['btn-industrial-matte', 'btn-solid-pill', 'btn-neon-pulse', 'btn-frosted-glass', 'btn-hollow-borderline', 'btn-square-flat', 'btn-neumorphism-soft', 'btn-bouncy'];
const FEATURED_INPUTS = ['input-soft-round', 'input-classic-underline', 'input-floating-pill', 'input-frosted-glass', 'input-sharp-outline', 'input-flat-filled', 'input-search-pill', 'input-neumorphic-press'];
const FEATURED_ATMOSPHERE = ['bg-none', 'bg-kinetic-flow', 'bg-stellar-nebula', 'bg-dark-cinematic', 'bg-vignette-soft', 'bg-film-grain', 'bg-vivid', 'bg-tone-cyber'];

export const PRESET_GROUPS: readonly PresetGroupDef[] = [
    { id: 'fontPairs', decision: 'fonts', sample: 'fontPair', presets: FONT_PAIR_PRESETS, featured: firstIds(FONT_PAIR_PRESETS, 8), areas: ['typography'], owns: /^(headingFont|bodyFont|monoFont)$/ },
    { id: 'typeScale', decision: 'fonts', sample: 'typeScale', presets: TYPE_SCALE_PRESETS, featured: idsOf(TYPE_SCALE_PRESETS), areas: ['typography', 'cardTitle'], owns: /^(h[1-3]|body(LineHeight|Weight)|headingTransform|typeScale|cardTitleFontSize)/ },
    { id: 'fonts', decision: 'fonts', sample: 'font', presets: TYPOGRAPHY_PRESETS, featured: FEATURED_FONTS.map((name) => `typo-${name.toLowerCase().replace(/\s+/g, '-')}`), areas: ['typography'], owns: /^(headingFont|bodyFont)$/, optionsOfOneToken: true },

    { id: 'cards', decision: 'shape', sample: 'card', presets: CARD_PRESETS, featured: except(FEATURED_CARDS, ['card-glow-halo', 'card-organic-craft']), areas: ['cards', 'cardTitle', 'cardAction'] },
    { id: 'cardTextures', decision: 'shape', sample: 'cardTexture', presets: CARD_TEXTURE_PRESETS, featured: FEATURED_TEXTURES.map((texture) => `card-tex-${texture}`), areas: ['cards'], owns: /^cardTextureType$/, optionsOfOneToken: true },
    { id: 'corners', decision: 'shape', sample: 'surface', presets: CORNER_PRESETS, featured: except(idsOf(CORNER_PRESETS), ['corners-rounded', 'corners-round']), areas: ['system', 'cards', 'buttons', 'inputs', 'tables', 'overlays', 'status', 'navigation'], owns: /Radius$/ },
    { id: 'density', decision: 'shape', sample: 'surface', presets: DENSITY_PRESETS, featured: idsOf(DENSITY_PRESETS), areas: ['system', 'cards', 'tables', 'navigation', 'structural'], owns: /^(layout|cardPaddingMd|cardHeaderPadding|table(Density|CellPadding)|sidebarItemDensity|topbarItemDensity|formFieldDensity|globalSectionGap|tabGap)/ },
    { id: 'shadow', decision: 'shape', sample: 'card', presets: SHADOW_PRESETS, featured: except(idsOf(SHADOW_PRESETS), ['shadow-defined', 'shadow-colored', 'shadow-ambient', 'shadow-dramatic']), areas: ['atmosphere'], owns: /^(shadow|layeredShadows)/ },
    { id: 'shadowDirection', decision: 'shape', sample: 'card', presets: SHADOW_DIRECTION_PRESETS, featured: except(idsOf(SHADOW_DIRECTION_PRESETS), ['shadow-dir-top', 'shadow-dir-diagonal', 'shadow-dir-follow']), areas: ['atmosphere'], owns: /^shadowOrientation$/, optionsOfOneToken: true },
    { id: 'border', decision: 'shape', sample: 'surface', presets: BORDER_PRESETS, featured: except(idsOf(BORDER_PRESETS), ['border-cyber', 'border-glow', 'border-none']), areas: ['atmosphere'], owns: /^borderType$/, optionsOfOneToken: true },
    { id: 'material', decision: 'shape', sample: 'card', presets: MATERIAL_PRESETS, featured: idsOf(MATERIAL_PRESETS), areas: ['atmosphere'], owns: /^surfaceMaterial$/, optionsOfOneToken: true },
    { id: 'glass', decision: 'shape', sample: 'glass', presets: GLASS_PRESETS, featured: except(idsOf(GLASS_PRESETS), ['glass-frosted', 'glass-heavy']), areas: ['atmosphere'], owns: /^glass/ },
    { id: 'atmosphere', decision: 'shape', sample: 'atmosphere', presets: [...MEDIA_PRESETS, ...AMBIENT_PRESETS], featured: except(FEATURED_ATMOSPHERE, ['bg-vignette-soft', 'bg-film-grain', 'bg-vivid', 'bg-tone-cyber']), areas: ['atmosphere', 'media'] },
    { id: 'gradient', decision: 'shape', sample: 'atmosphere', presets: GRADIENT_PRESETS, featured: except(idsOf(GRADIENT_PRESETS), ['bg-gradient-radial', 'bg-gradient-mesh']), areas: ['atmosphere'], owns: /^bgGradient/, optionsOfOneToken: true },
    { id: 'textures', decision: 'shape', sample: 'texture', presets: TEXTURE_PRESETS, featured: FEATURED_TEXTURES.map((texture) => `tex-${texture}`), areas: ['atmosphere'], owns: /^texture$/, optionsOfOneToken: true },

    { id: 'buttons', decision: 'components', sample: 'button', presets: BUTTON_PRESETS, featured: except(FEATURED_BUTTONS, ['btn-bouncy']), areas: ['buttons'] },
    { id: 'buttonStyles', decision: 'components', sample: 'button', presets: BUTTON_STYLE_PRESETS, featured: idsOf(BUTTON_STYLE_PRESETS), areas: ['buttons'], owns: /^btnStyleType$/, optionsOfOneToken: true },
    { id: 'inputs', decision: 'components', sample: 'input', presets: INPUT_PRESETS, featured: except(FEATURED_INPUTS, ['input-sharp-outline', 'input-flat-filled', 'input-search-pill']), areas: ['inputs'] },
    { id: 'tables', decision: 'components', sample: 'table', presets: TABLE_PRESETS, featured: idsOf(TABLE_PRESETS), areas: ['tables'], owns: /^table/ },
    { id: 'charts', decision: 'components', sample: 'chart', presets: CHART_PRESETS, featured: except(idsOf(CHART_PRESETS), ['chart-radar-fine']), areas: ['data'], owns: /^chart/ },
    { id: 'modal', decision: 'components', sample: 'modal', presets: MODAL_PRESETS, featured: except(idsOf(MODAL_PRESETS), ['modal-stacked-center', 'modal-floating-sharp', 'modal-frosted-backdrop']), areas: ['overlays'], owns: /^modal/ },
    { id: 'notice', decision: 'components', sample: 'notice', presets: NOTICE_PRESETS, featured: idsOf(NOTICE_PRESETS), areas: ['overlays'], owns: /^(tooltip|toast)/ },
    { id: 'switch', decision: 'components', sample: 'switch', presets: SWITCH_PRESETS, featured: except(idsOf(SWITCH_PRESETS), ['switch-pulsing']), areas: ['switches'], owns: /^switch/, optionsOfOneToken: true },
    { id: 'scroll', decision: 'components', sample: 'scroll', presets: SCROLL_PRESETS, featured: except(idsOf(SCROLL_PRESETS), ['scroll-standard', 'scroll-bold', 'scroll-pill']), areas: ['scrollbars'] },
    { id: 'badge', decision: 'components', sample: 'badge', presets: BADGE_PRESETS, featured: idsOf(BADGE_PRESETS), areas: ['status'] },
    { id: 'emptyState', decision: 'components', sample: 'empty', presets: EMPTY_STATE_PRESETS, featured: idsOf(EMPTY_STATE_PRESETS), areas: ['specialized'], owns: /^(emptyState|skeleton)/ },
    { id: 'motion', decision: 'components', sample: 'motion', presets: MOTION_PRESETS, featured: except(idsOf(MOTION_PRESETS), ['motion-calm', 'motion-expressive', 'motion-agile']), areas: ['motion'] },
    { id: 'pageTransition', decision: 'components', sample: 'page', presets: PAGE_TRANSITION_PRESETS, featured: except(idsOf(PAGE_TRANSITION_PRESETS), ['page-slide-up', 'page-slide-side', 'page-zoom', 'page-none']), areas: ['animations'], owns: /^pageTransitionType$/, optionsOfOneToken: true },
    { id: 'icons', decision: 'components', sample: 'icons', presets: ICON_PRESETS, featured: except(idsOf(ICON_PRESETS), ['icons-tabler-light']), areas: ['system'], owns: /^icon/ },

    { id: 'sidebar', decision: 'layout', sample: 'bar', presets: SIDEBAR_PRESETS, featured: firstIds(SIDEBAR_PRESETS, 8), areas: ['navigation'], owns: /^(sidebar|nav)/ },
    { id: 'topbar', decision: 'layout', sample: 'bar', presets: TOPBAR_PRESETS, featured: firstIds(TOPBAR_PRESETS, 8), areas: ['navigation'], owns: /^topbar/ },
    { id: 'contentWidth', decision: 'layout', sample: 'width', presets: CONTENT_WIDTH_PRESETS, featured: except(idsOf(CONTENT_WIDTH_PRESETS), ['content-width-1600', 'content-width-full']), areas: ['system'], owns: /^maxContentWidth$/, optionsOfOneToken: true },
];

/** Todos os presets de componente, sem repetir: o que os testes, os gates e o mapa de cobertura varrem. */
export const ALL_COMPONENT_PRESETS: readonly ComponentPreset[] = [
    ...new Map(PRESET_GROUPS.flatMap((group) => group.presets).map((preset) => [preset.id, preset])).values(),
];

export const presetGroupsOf = (decision: PresetDecisionId): PresetGroupDef[] => PRESET_GROUPS.filter((group) => group.decision === decision);
export const getPresetGroup = (id: string): PresetGroupDef | undefined => PRESET_GROUPS.find((group) => group.id === id);
