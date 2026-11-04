import type { ComponentPreset } from './cards';
import { THEME_FONTS } from '../../schema/typography';

/** Resolve o valor exato de uma fonte de `THEME_FONTS` pelo nome: o carregador reconhece só o valor da lista. */
const fontValue = (name: string): string => {
    const font = THEME_FONTS.find((candidate) => candidate.name === name);
    if (!font) throw new Error(`Fonte fora de THEME_FONTS: ${name}`);
    return font.value;
};

const pair = (id: string, name: string, description: string, keywords: string[], heading: string, body: string, mono?: string): ComponentPreset => ({
    id,
    name,
    description,
    keywords,
    design: { headingFont: fontValue(heading), bodyFont: fontValue(body), ...(mono ? { monoFont: fontValue(mono) } : {}) },
});

/** Pares de fonte por personalidade: o título, o corpo e, quando a personalidade pede, a fonte de código. */
export const FONT_PAIR_PRESETS: ComponentPreset[] = [
    pair('pair-editorial', 'Editorial', 'Título serifado clássico sobre um corpo limpo: ar de revista.', ['revista', 'editorial', 'serifa', 'classico'], 'Playfair Display', 'Source Sans 3'),
    pair('pair-modern', 'Moderno', 'Dois sem serifa familiares e neutros, de leitura fácil.', ['moderno', 'modern', 'neutro', 'limpo'], 'Outfit', 'Inter'),
    pair('pair-technical', 'Técnico', 'Título anguloso, corpo neutro e código em fonte de espaçamento fixo.', ['tecnico', 'technical', 'engenharia', 'codigo'], 'Chakra Petch', 'Inter', 'IBM Plex Mono'),
    pair('pair-humanist', 'Humanista', 'Serifa calorosa nos títulos e um corpo redondo e amigável.', ['humanista', 'humanist', 'caloroso', 'acolhedor'], 'Lora', 'Nunito'),
    pair('pair-corporate', 'Corporativo', 'Sem serifa sólida e confiável, no estilo de sistemas de empresa.', ['corporativo', 'corporate', 'empresa', 'formal'], 'Montserrat', 'Open Sans'),
    pair('pair-impact', 'Impacto', 'Títulos condensados e altos sobre um corpo neutro: cartaz.', ['impacto', 'impact', 'cartaz', 'chamativo'], 'Bebas Neue', 'Roboto'),
    pair('pair-futuristic', 'Futurista', 'Letras largas e geométricas, com ar de painel de nave.', ['futurista', 'futuristic', 'sci-fi', 'tecnologia'], 'Orbitron', 'Sora', 'Space Mono'),
    pair('pair-retro', 'Retrô', 'Fonte de terminal antigo nos títulos e espaçamento fixo no corpo.', ['retro', 'terminal', 'pixel', 'anos 80'], 'VT323', 'Space Mono', 'VT323'),
    pair('pair-elegant', 'Elegante', 'Serifa com personalidade nos títulos e um corpo geométrico discreto.', ['elegante', 'elegant', 'sofisticado', 'luxo'], 'Fraunces', 'DM Sans'),
    pair('pair-casual', 'Descontraído', 'Letra de mão nos títulos e corpo redondo: tom informal.', ['casual', 'informal', 'manuscrito', 'amigavel'], 'Patrick Hand', 'Lato'),
    pair('pair-journal', 'Jornalístico', 'Serifa de leitura longa nos títulos e sem serifa no corpo.', ['jornal', 'news', 'leitura', 'noticia'], 'Merriweather', 'PT Serif', 'Fira Code'),
    pair('pair-geometric', 'Geométrico', 'Formas redondas e regulares, do título ao corpo.', ['geometrico', 'geometric', 'redondo', 'regular'], 'Lexend', 'Manrope'),
];

/** Escala tipográfica: tamanho, peso, entrelinha e espaçamento dos títulos e do corpo, juntos. */
export const TYPE_SCALE_PRESETS: ComponentPreset[] = [
    {
        id: 'typescale-compact',
        name: 'Compacta',
        description: 'Títulos contidos e corpo bem justo: cabe mais texto na tela.',
        keywords: ['compacta', 'compact', 'pequena', 'densa'],
        design: {
            h1Size: 28, h1Weight: '700', h1LineHeight: 1.1, h1LetterSpacing: -0.5, h2Size: 20, h2Weight: '600', h2LineHeight: 1.2, h3Size: 16,
            bodyLineHeight: 1.4, bodyWeight: '400', headingTransform: 'none', cardTitleFontSize: 14, typeScaleXl: 16,
        },
    },
    {
        id: 'typescale-standard',
        name: 'Padrão',
        description: 'Proporções equilibradas, com títulos fortes e corpo confortável.',
        keywords: ['padrao', 'standard', 'normal', 'equilibrada'],
        design: {
            h1Size: 40, h1Weight: '800', h1LineHeight: 1.1, h1LetterSpacing: -1, h2Size: 28, h2Weight: '700', h2LineHeight: 1.2, h3Size: 24,
            bodyLineHeight: 1.6, bodyWeight: '400', headingTransform: 'none', cardTitleFontSize: 18, typeScaleXl: 20,
        },
    },
    {
        id: 'typescale-editorial',
        name: 'Editorial',
        description: 'Títulos leves e grandes, com entrelinha solta no corpo: leitura longa e calma.',
        keywords: ['editorial', 'leitura', 'revista', 'leve'],
        design: {
            h1Size: 52, h1Weight: '300', h1LineHeight: 1.15, h1LetterSpacing: -2, h2Size: 34, h2Weight: '400', h2LineHeight: 1.25, h3Size: 26,
            bodyLineHeight: 1.9, bodyWeight: '300', headingTransform: 'none', cardTitleFontSize: 20, typeScaleXl: 22,
        },
    },
    {
        id: 'typescale-impact',
        name: 'Impacto',
        description: 'Títulos enormes, pesados e em caixa alta: cada tela abre como um cartaz.',
        keywords: ['impacto', 'impact', 'cartaz', 'caixa alta'],
        design: {
            h1Size: 76, h1Weight: '900', h1LineHeight: 0.95, h1LetterSpacing: 1, h2Size: 44, h2Weight: '800', h2LineHeight: 1.05, h3Size: 30,
            bodyLineHeight: 1.5, bodyWeight: '500', headingTransform: 'uppercase', cardTitleFontSize: 24, typeScaleXl: 24,
        },
    },
    {
        id: 'typescale-friendly',
        name: 'Amigável',
        description: 'Títulos médios com a primeira letra de cada palavra em maiúscula e corpo redondo e aberto.',
        keywords: ['amigavel', 'friendly', 'maiuscula', 'acolhedor'],
        design: {
            h1Size: 44, h1Weight: '600', h1LineHeight: 1.2, h1LetterSpacing: 0, h2Size: 30, h2Weight: '600', h2LineHeight: 1.3, h3Size: 22,
            bodyLineHeight: 1.7, bodyWeight: '500', headingTransform: 'capitalize', cardTitleFontSize: 18, typeScaleXl: 20,
        },
    },
];

/** As categorias de `THEME_FONTS`, na ordem em que a galeria agrupa as 42 fontes. */
export const FONT_CATEGORIES: readonly string[] = ['Sans-Serif', 'Serif', 'Display', 'Monospace', 'Handwriting'];

/** Oito fontes que cobrem as cinco categorias, as que a galeria mostra antes do "Ver todas". */
export const FEATURED_FONTS: readonly string[] = ['Inter', 'Outfit', 'Space Grotesk', 'Playfair Display', 'Lora', 'Bebas Neue', 'JetBrains Mono', 'Caveat'];
