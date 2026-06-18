export const transformHeadingLetterSpacing = (v: any) => 
    (({ tight: '-0.05em', normal: '0', wide: '0.1em', widest: '0.25em' } as any)[v] || v);

export const transformFontScale = (v: string) => {
    const scales: any = {
        'pp': { px: '12px', factor: '0.75' },
        'p': { px: '14px', factor: '0.85' },
        'm': { px: '16px', factor: '1.0' },
        'g': { px: '20px', factor: '1.25' },
        'gg': { px: '24px', factor: '1.5' }
    };
    return scales[v] || scales['m'];
};

export const transformScaleRatio = (v: any) => {
    const ratio = parseFloat(v) || 1.0;
    return {
        ratio,
        gap: `${1.25 * ratio}rem`,
        pad: `${1.5 * ratio}rem`,
        margin: `${1 * ratio}rem`,
        radius: `${12 * ratio}px`
    };
};

export const transformLayeredShadows = (v: any) => {
    const intensity = parseFloat(v) || 1.0;
    return `0 2px 4px rgba(0,0,0,${0.05 * intensity}), 
            0 4px 8px rgba(0,0,0,${0.05 * intensity}), 
            0 8px 16px rgba(0,0,0,${0.05 * intensity}), 
            0 16px 32px rgba(0,0,0,${0.05 * intensity})`;
};

export const transformFluidScaling = (v: any) => {
    const factor = parseFloat(v) || 1.0;
    return {
        base: `clamp(12px, ${0.8 * factor}vw + 8px, ${20 * factor}px)`,
        gap: `clamp(10px, ${1 * factor}vw + 4px, ${32 * factor}px)`,
        padding: `clamp(16px, ${1.5 * factor}vw + 8px, ${48 * factor}px)`
    };
};
