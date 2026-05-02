/**
 * Sarak Industrial Color Engine (v10.1)
 * Transforma cores hexadecimais em variantes HSL/RGB para o motor de injeção.
 */
export const computeColorVariants = (v: string, fallback: string) => {
    const val = v || fallback;
    if (!val || typeof val !== 'string' || val.length < 4) {
        return {
            main: fallback,
            rgb: '0,0,0',
            bg: 'rgba(0,0,0,0.1)',
            border: 'rgba(0,0,0,0.2)',
            hover: fallback,
            active: fallback,
            focus: 'rgba(0,0,0,0.4)',
            light: fallback
        };
    }

    const hex = val.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16) || 0;
    const g = parseInt(hex.substring(2, 4), 16) || 0;
    const b = parseInt(hex.substring(4, 6), 16) || 0;

    const adjust = (c: number, f: number) => Math.round(Math.min(255, Math.max(0, c * f)));
    const toH = (n: number) => n.toString(16).padStart(2, '0');

    return {
        main: val,
        rgb: `${r}, ${g}, ${b}`,
        bg: `rgba(${r}, ${g}, ${b}, 0.15)`,
        border: `rgba(${r}, ${g}, ${b}, 0.25)`,
        hover: `#${toH(adjust(r, 1.1))}${toH(adjust(g, 1.1))}${toH(adjust(b, 1.1))}`,
        active: `#${toH(adjust(r, 0.9))}${toH(adjust(g, 0.9))}${toH(adjust(b, 0.9))}`,
        focus: `rgba(${r}, ${g}, ${b}, 0.4)`,
        light: `rgba(${r}, ${g}, ${b}, 0.05)`
    };
};
