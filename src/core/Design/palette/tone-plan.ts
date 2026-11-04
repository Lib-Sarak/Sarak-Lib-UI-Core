import { PAIRS as SHARED_PAIRS, type ContrastPair } from './contrast-pairs';
import { PALETTE_ROLE_MAP } from './role-map';
import type { PaletteColorRole, PaletteScaleName } from './types';

/** O que a paleta calcula: o papel de cada token e os pares de contraste que o texto precisa cumprir. */
export interface PalettePlan {
    roles: Readonly<Record<string, PaletteColorRole>>;
    pairs: readonly ContrastPair[];
    /** As barras cujo papel é contrastante: o hover e o ativo delas são véus que dependem do fundo efetivo. */
    contrastingBars?: readonly Bar[];
}

type Bar = 'sidebar' | 'topbar';
type BarTone = 'neutral' | 'surface' | 'primary' | 'secondary' | 'inverse';

/** A borda de foco do campo parte do acento e precisa de 3:1 (elemento de interface, não texto) sobre o campo e o corpo. */
const FOCUS_BORDER_MIN = 3;

export const PALETTE_PAIRS: readonly ContrastPair[] = [
    ...SHARED_PAIRS,
    { fg: 'inputFocusBorderColor', bgChain: ['inputBg', 'colorBgBody'], min: FOCUS_BORDER_MIN },
];

export const DEFAULT_PALETTE_PLAN: PalettePlan = { roles: PALETTE_ROLE_MAP, pairs: PALETTE_PAIRS };

type RoleSpec = readonly [PaletteScaleName, number, number, number?];

const role = ([scale, light, dark, alpha = 1]: RoleSpec): PaletteColorRole => ({
    scale,
    toneByMode: { light, dark },
    ...(alpha < 1 ? { alpha } : {}),
});

/**
 * Cada papel é uma coluna de especificações [escala, tom claro, tom escuro, opacidade] por função da barra. O
 * `surface` só troca o fundo, que continua claro (o texto da paleta neutra segue valendo); os outros três escurecem
 * (ou, no `inverse`, invertem em relação ao corpo) e por isso trazem o próprio texto, ícone e marcador.
 */
// @sarak-token-reader sidebarTone, topbarTone tabela
const TONE_SPECS: Record<Exclude<BarTone, 'neutral'>, Record<string, RoleSpec>> = {
    surface: {
        color: ['secondary', 100, 900],
        brandBackground: ['secondary', 100, 900],
        border: ['secondary', 200, 800, 0.64],
        footerBackground: ['secondary', 200, 800],
    },
    primary: {
        color: ['primary', 700, 800],
        hover: ['neutral', 50, 50, 0.12],
        active: ['neutral', 50, 50, 0.2],
        itemText: ['neutral', 100, 100],
        itemHoverText: ['neutral', 50, 50],
        category: ['neutral', 200, 200],
        brand: ['neutral', 50, 50],
        brandBackground: ['primary', 800, 900],
        border: ['primary', 600, 700, 0.64],
        icon: ['neutral', 100, 100],
        footerBackground: ['primary', 800, 900],
        title: ['neutral', 50, 50],
    },
    secondary: {
        color: ['secondary', 700, 800],
        hover: ['neutral', 50, 50, 0.12],
        active: ['neutral', 50, 50, 0.2],
        itemText: ['neutral', 100, 100],
        itemHoverText: ['neutral', 50, 50],
        category: ['neutral', 200, 200],
        brand: ['neutral', 50, 50],
        brandBackground: ['secondary', 800, 900],
        border: ['secondary', 600, 700, 0.64],
        icon: ['neutral', 100, 100],
        footerBackground: ['secondary', 800, 900],
        title: ['neutral', 50, 50],
    },
    inverse: {
        color: ['neutral', 900, 100],
        hover: ['neutral', 50, 900, 0.14],
        active: ['neutral', 50, 900, 0.2],
        itemText: ['neutral', 200, 800],
        itemHoverText: ['neutral', 50, 950],
        category: ['neutral', 300, 700],
        brand: ['neutral', 50, 950],
        brandBackground: ['neutral', 800, 200],
        border: ['neutral', 700, 300, 0.64],
        icon: ['neutral', 300, 700],
        footerBackground: ['neutral', 800, 200],
        title: ['neutral', 50, 950],
    },
};

const FUNCTION_TOKEN_SUFFIX: Record<string, string> = {
    color: 'Color',
    hover: 'HoverColor',
    active: 'ActiveColor',
    itemText: 'ItemTextColor',
    itemHoverText: 'ItemHoverTextColor',
    brand: 'BrandColor',
    brandBackground: 'BrandBackground',
    border: 'BorderColor',
    icon: 'IconColor',
    category: 'CategoryColor',
    footerBackground: 'FooterBackground',
    title: 'TitleColor',
};

/** Só a lateral tem categoria e rodapé; só a topbar tem título. */
const BAR_ONLY_FUNCTIONS: Record<string, Bar> = { category: 'sidebar', footerBackground: 'sidebar', title: 'topbar' };

const isBarTone = (value: unknown): value is BarTone =>
    value === 'neutral' || value === 'surface' || value === 'primary' || value === 'secondary' || value === 'inverse';

const toneRoles = (bar: Bar, tone: Exclude<BarTone, 'neutral'>): Record<string, PaletteColorRole> => {
    const roles: Record<string, PaletteColorRole> = {};
    Object.entries(TONE_SPECS[tone]).forEach(([fn, spec]) => {
        if (BAR_ONLY_FUNCTIONS[fn] && BAR_ONLY_FUNCTIONS[fn] !== bar) return;
        roles[bar + FUNCTION_TOKEN_SUFFIX[fn]] = role(spec);
    });
    return roles;
};

/** Papel que escurece (ou inverte) a barra: o texto do corpo deixa de valer sobre ela. */
const isContrastingTone = (tone: BarTone): boolean => tone === 'primary' || tone === 'secondary' || tone === 'inverse';

/** Os pares do texto do CORPO e do item ativo sobre a barra, que um fundo contrastante não pode cumprir. */
const isBodyTextOverBar = (pair: ContrastPair, bar: Bar): boolean =>
    !pair.fg.startsWith(bar) && pair.bgChain.some((token) => token === `${bar}Color` || token === `${bar}HoverColor`);

/** No lugar de `navItemActiveColor` (a cor de ênfase global), o texto do item ativo da barra contrastante é o do hover. */
const activeTextPair = (bar: Bar): ContrastPair => ({
    fg: `${bar}ItemHoverTextColor`,
    bgChain: [`${bar}ActiveColor`, `${bar}Color`, 'colorBgBody'],
    min: 4.5,
});

/** O plano da paleta para os papéis declarados; sem papel (ou `neutral`), é exatamente o de sempre. */
export const createPalettePlan = (declared?: Record<string, unknown>): PalettePlan => {
    const tones: Record<Bar, BarTone> = { sidebar: 'neutral', topbar: 'neutral' };
    (['sidebar', 'topbar'] as const).forEach((bar) => {
        const value = declared?.[`${bar}Tone`];
        if (isBarTone(value)) tones[bar] = value;
    });
    if (tones.sidebar === 'neutral' && tones.topbar === 'neutral') return DEFAULT_PALETTE_PLAN;

    let roles: Record<string, PaletteColorRole> = { ...PALETTE_ROLE_MAP };
    let pairs: ContrastPair[] = [...PALETTE_PAIRS];
    const contrastingBars: Bar[] = [];
    (['sidebar', 'topbar'] as const).forEach((bar) => {
        const tone = tones[bar];
        if (tone === 'neutral') return;
        roles = { ...roles, ...toneRoles(bar, tone) };
        if (!isContrastingTone(tone)) return;
        contrastingBars.push(bar);
        pairs = pairs.filter((pair) => !isBodyTextOverBar(pair, bar) && !(pair.fg === 'navItemActiveColor' && pair.bgChain[0] === `${bar}ActiveColor`));
        pairs.push(activeTextPair(bar));
    });
    return { roles, pairs, contrastingBars };
};
