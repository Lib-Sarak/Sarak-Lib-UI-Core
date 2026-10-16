import { THEME_FONTS } from '../../Design/schema/typography';

/**
 * Pesos pedidos ao Google Fonts, por família. Família sem entrada aqui é pedida com os
 * pesos de `DEFAULT_WEIGHTS`; família com uma única face (display e manuscritas) fica
 * em `SINGLE_FACE`, que o Google rejeita se receber o eixo `wght`.
 */
const WEIGHT_AXES: Record<string, string> = {
    'Inter': '300;400;600;700;800;900',
    'Outfit': '300;400;600;700;800;900',
    'Roboto': '300;400;500;700;900',
    'Space Grotesk': '300;400;500;600;700',
    'JetBrains Mono': '300;400;600;800',
    'Lexend': '300;400;500;600;700;800;900',
    'Unbounded': '300;400;600;900',
    'Plus Jakarta Sans': '300;400;600;800',
    'Playfair Display': '400;500;600;700;800;900',
    'Montserrat': '300;400;500;600;700;800;900',
    'Sora': '400;500;600;700;800',
    'Syne': '400;500;600;700;800',
    'Archivo': '400;500;600;700',
    'Dancing Script': '400;500;600;700',
    'Caveat': '400;500;600;700',
    'Fraunces': '300;400;500;600;700;800;900',
};
const SINGLE_FACE = new Set(['Bebas Neue', 'Pacifico', 'Satisfy', 'VT323', 'Patrick Hand']);
const DEFAULT_WEIGHTS = '400;700';
const SYSTEM_FONT_PREFIX = 'system-ui';

/** Nome da família (`'Inter', sans-serif` → `Inter`); `null` para a fonte do sistema. */
function familyName(value: string): string | null {
    if (value.startsWith(SYSTEM_FONT_PREFIX)) return null;
    return value.split(',')[0].replace(/['"]/g, '').trim() || null;
}

/** Todas as famílias de `THEME_FONTS` que dependem de webfont, na ordem da lista. */
export function listLoadableFamilies(fonts: ReadonlyArray<{ value: string }> = THEME_FONTS): string[] {
    return fonts.map((font) => familyName(font.value)).filter((name): name is string => name !== null);
}

/**
 * URL `css2` do Google Fonts com TODA família oferecida em `THEME_FONTS` — a lista do
 * painel e o carregador têm uma fonte única, então uma fonte nova não nasce sem ser
 * carregada (cairia na fonte de reserva, em silêncio).
 */
export function buildGoogleFontsUrl(fonts: ReadonlyArray<{ value: string }> = THEME_FONTS): string {
    const families = listLoadableFamilies(fonts).map((name) => {
        const encoded = name.replace(/ /g, '+');
        if (SINGLE_FACE.has(name)) return `family=${encoded}`;
        return `family=${encoded}:wght@${WEIGHT_AXES[name] ?? DEFAULT_WEIGHTS}`;
    });
    return `https://fonts.googleapis.com/css2?${families.join('&')}&display=swap`;
}
