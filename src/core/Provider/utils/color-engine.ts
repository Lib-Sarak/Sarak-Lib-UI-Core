/**
 * Sarak Industrial Color Engine (v10.2)
 * Transforma cores hexadecimais (3/4/6/8 dígitos) e RGB/RGBA em variantes HSL/RGB para o motor de injeção.
 */
export const computeColorVariants = (v: string, fallback: string) => {
    const val = v || fallback;
    if (!val || typeof val !== 'string' || val.length < 3) {
        return {
            main: fallback,
            rgb: '0, 0, 0',
            bg: 'rgba(0, 0, 0, 0.1)',
            border: 'rgba(0, 0, 0, 0.2)',
            hover: fallback,
            active: fallback,
            focus: 'rgba(0, 0, 0, 0.4)',
            light: fallback
        };
    }

    let r = 0, g = 0, b = 0;
    let resolvedColor = val;

    // 1. Detecção de Formato RGB / RGBA
    const rgbRegex = /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/i;
    const rgbMatch = val.match(rgbRegex);

    if (rgbMatch) {
        r = Math.min(255, Math.max(0, parseInt(rgbMatch[1], 10) || 0));
        g = Math.min(255, Math.max(0, parseInt(rgbMatch[2], 10) || 0));
        b = Math.min(255, Math.max(0, parseInt(rgbMatch[3], 10) || 0));
    } 
    // 2. Detecção de Formato Hexadecimal
    else if (val.startsWith('#') || /^[0-9a-fA-F]{3,8}$/.test(val.replace('#', ''))) {
        let hex = val.replace('#', '');
        
        // Expansão de Hex de 3 ou 4 caracteres (ex: 3bf -> 33bbff)
        if (hex.length === 3 || hex.length === 4) {
            hex = hex.split('').map(char => char + char).join('');
        }
        
        r = parseInt(hex.substring(0, 2), 16) || 0;
        g = parseInt(hex.substring(2, 4), 16) || 0;
        b = parseInt(hex.substring(4, 6), 16) || 0;
        resolvedColor = `#${hex.substring(0, 6)}`;
    } 
    // 3. Caso Especial: Transparente
    else if (val.trim().toLowerCase() === 'transparent') {
        return {
            main: 'transparent',
            rgb: '0, 0, 0',
            bg: 'rgba(0, 0, 0, 0)',
            border: 'rgba(0, 0, 0, 0)',
            hover: 'rgba(0, 0, 0, 0.05)',
            active: 'rgba(0, 0, 0, 0.1)',
            focus: 'rgba(0, 0, 0, 0.2)',
            light: 'rgba(0, 0, 0, 0)'
        };
    } 
    // 4. Fallback Geral (Palavras-chave de cor CSS ou inválido)
    else {
        return {
            main: val,
            rgb: '0, 0, 0',
            bg: 'rgba(0, 0, 0, 0.1)',
            border: 'rgba(0, 0, 0, 0.2)',
            hover: val,
            active: val,
            focus: 'rgba(0, 0, 0, 0.4)',
            light: val
        };
    }

    const adjust = (c: number, f: number) => Math.round(Math.min(255, Math.max(0, c * f)));
    const toH = (n: number) => n.toString(16).padStart(2, '0');

    return {
        main: resolvedColor,
        rgb: `${r}, ${g}, ${b}`,
        bg: `rgba(${r}, ${g}, ${b}, 0.15)`,
        border: `rgba(${r}, ${g}, ${b}, 0.25)`,
        hover: `#${toH(adjust(r, 1.1))}${toH(adjust(g, 1.1))}${toH(adjust(b, 1.1))}`,
        active: `#${toH(adjust(r, 0.9))}${toH(adjust(g, 0.9))}${toH(adjust(b, 0.9))}`,
        focus: `rgba(${r}, ${g}, ${b}, 0.4)`,
        light: `rgba(${r}, ${g}, ${b}, 0.05)`
    };
};
