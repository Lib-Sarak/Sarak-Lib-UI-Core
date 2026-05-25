/**
 * Sarak Industrial Color Engine (v11.0)
 * Transforma cores hexadecimais (3/4/6/8 dígitos) e RGB/RGBA em variantes HSL/RGB para o motor de injeção.
 * Agora com suporte nativo a inversão dinâmica HSL (Zero Dependências).
 */

/**
 * Converte RGB para HSL (Matiz, Saturação, Luminosidade)
 */
export const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return [h * 360, s * 100, l * 100];
};

/**
 * Converte HSL para RGB
 */
export const hslToRgb = (h: number, s: number, l: number) => {
    h /= 360; s /= 100; l /= 100;
    let r, g, b;

    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p: number, q: number, t: number) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
};

/**
 * Formata RGB(A) para Hexadecimal
 */
export const rgbToHex = (r: number, g: number, b: number, a?: number) => {
    const toHex = (n: number) => n.toString(16).padStart(2, '0');
    const alpha = a !== undefined ? toHex(Math.round(a * 255)) : '';
    return `#${toHex(r)}${toHex(g)}${toHex(b)}${alpha}`;
};

/**
 * Parse de qualquer string de cor para objeto {r, g, b, a}
 */
export const parseToRgba = (color: string): { r: number, g: number, b: number, a: number } => {
    const defaultColor = { r: 0, g: 0, b: 0, a: 1 };
    if (!color || typeof color !== 'string') return defaultColor;

    const rgbRegex = /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/i;
    const rgbMatch = color.match(rgbRegex);

    if (rgbMatch) {
        return {
            r: Math.min(255, parseInt(rgbMatch[1], 10)),
            g: Math.min(255, parseInt(rgbMatch[2], 10)),
            b: Math.min(255, parseInt(rgbMatch[3], 10)),
            a: rgbMatch[4] !== undefined ? parseFloat(rgbMatch[4]) : 1
        };
    }

    if (color.startsWith('#') || /^[0-9a-fA-F]{3,8}$/.test(color.replace('#', ''))) {
        let hex = color.replace('#', '');
        if (hex.length === 3 || hex.length === 4) {
            hex = hex.split('').map(char => char + char).join('');
        }
        return {
            r: parseInt(hex.substring(0, 2), 16) || 0,
            g: parseInt(hex.substring(2, 4), 16) || 0,
            b: parseInt(hex.substring(4, 6), 16) || 0,
            a: hex.length === 8 ? parseInt(hex.substring(6, 8), 16) / 255 : 1
        };
    }

    if (color.trim().toLowerCase() === 'transparent') return { r: 0, g: 0, b: 0, a: 0 };

    return defaultColor;
};

/**
 * Realiza o Shift Matemático de cor preservando Matiz e Saturação (Identidade do Tema)
 */
export const shiftColorMode = (
    colorString: string,
    targetMode: 'light' | 'dark',
    semanticType: 'bg' | 'text' | 'border' | 'primary' = 'bg'
): string => {
    const { r, g, b, a } = parseToRgba(colorString);
    if (a === 0) return 'transparent';

    const [h, s, l] = rgbToHsl(r, g, b);
    let newL = l;
    let newA = a;

    const isLight = targetMode === 'light';

    if (semanticType === 'bg') {
        // Fundos: Dark < 15%, Light > 85%
        newL = isLight ? Math.max(88, 100 - (l * 0.1)) : Math.min(15, l * 0.8);
    } else if (semanticType === 'text') {
        // Textos: Dark > 85%, Light < 25%
        newL = isLight ? Math.min(25, l * 0.25) : Math.max(85, 100 - (l * 0.1));
        
        // Textos translúcidos no claro precisam de um BOOST de opacidade para legibilidade (WCAG)
        if (isLight && a < 0.8) {
            newA = Math.min(0.8, a * 1.8); 
        }
    } else if (semanticType === 'border') {
        // Bordas: Contraste suave
        newL = isLight ? 90 : 20;
        
        // Aumenta presença de borda translúcida no modo claro
        if (isLight && a < 0.5) {
             newA = Math.min(0.5, a * 1.5);
        }
    } else if (semanticType === 'primary') {
        // Cores Primárias: Ajuste leve para legibilidade sem perder o tom vibrante
        newL = isLight ? Math.min(l, 55) : Math.max(l, 45);
    }

    const [newR, newG, newB] = hslToRgb(h, s, newL);
    return rgbToHex(newR, newG, newB, newA);
};

export const computeColorVariants = (v: string, fallback: string) => {
    const { r, g, b, a } = parseToRgba(v || fallback);
    const resolvedColor = rgbToHex(r, g, b, a);

    if (a === 0) {
        return {
            main: 'transparent',
            rgb: '0, 0, 0',
            bg: 'rgba(0, 0, 0, 0)',
            border: 'rgba(0, 0, 0, 0)',
            10: 'rgba(0, 0, 0, 0)',
            20: 'rgba(0, 0, 0, 0)',
            30: 'rgba(0, 0, 0, 0)',
            40: 'rgba(0, 0, 0, 0)',
            50: 'rgba(0, 0, 0, 0)',
            hover: 'rgba(0, 0, 0, 0.05)',
            active: 'rgba(0, 0, 0, 0.1)',
            focus: 'rgba(0, 0, 0, 0.2)',
            light: 'rgba(0, 0, 0, 0)'
        };
    }

    const adjust = (c: number, f: number) => Math.round(Math.min(255, Math.max(0, c * f)));
    const toH = (n: number) => n.toString(16).padStart(2, '0');

    return {
        main: resolvedColor,
        rgb: `${r}, ${g}, ${b}`,
        bg: `rgba(${r}, ${g}, ${b}, 0.15)`,
        border: `rgba(${r}, ${g}, ${b}, 0.25)`,
        10: `rgba(${r}, ${g}, ${b}, 0.10)`,
        20: `rgba(${r}, ${g}, ${b}, 0.20)`,
        30: `rgba(${r}, ${g}, ${b}, 0.30)`,
        40: `rgba(${r}, ${g}, ${b}, 0.40)`,
        50: `rgba(${r}, ${g}, ${b}, 0.50)`,
        hover: `#${toH(adjust(r, 1.1))}${toH(adjust(g, 1.1))}${toH(adjust(b, 1.1))}`,
        active: `#${toH(adjust(r, 0.9))}${toH(adjust(g, 0.9))}${toH(adjust(b, 0.9))}`,
        focus: `rgba(${r}, ${g}, ${b}, 0.4)`,
        light: `rgba(${r}, ${g}, ${b}, 0.05)`
    };
};
