export const transformHeadingLetterSpacing = (v: string | undefined | null): string => {
    if (!v) return '0';
    // sarak-allow-hardcode: o transformador é a origem do valor do token (o px/em da opção escolhida vira a variável CSS); não há var() para onde levá-lo.
    const mapping: Record<string, string> = { tight: '-0.05em', normal: '0', wide: '0.1em', widest: '0.25em' };
    return mapping[v] || v;
};

export const transformFontScale = (v: string) => {
    const scales: Record<string, { px: string; factor: string }> = {
        // sarak-allow-hardcode: o transformador é a origem do valor do token (o px/em da opção escolhida vira a variável CSS); não há var() para onde levá-lo.
        'pp': { px: '12px', factor: '0.75' },
        // sarak-allow-hardcode: o transformador é a origem do valor do token (o px/em da opção escolhida vira a variável CSS); não há var() para onde levá-lo.
        'p': { px: '14px', factor: '0.85' },
        // sarak-allow-hardcode: o transformador é a origem do valor do token (o px/em da opção escolhida vira a variável CSS); não há var() para onde levá-lo.
        'm': { px: '16px', factor: '1.0' },
        // sarak-allow-hardcode: o transformador é a origem do valor do token (o px/em da opção escolhida vira a variável CSS); não há var() para onde levá-lo.
        'g': { px: '20px', factor: '1.25' },
        // sarak-allow-hardcode: o transformador é a origem do valor do token (o px/em da opção escolhida vira a variável CSS); não há var() para onde levá-lo.
        'gg': { px: '24px', factor: '1.5' }
    };
    return scales[v] || scales['m'];
};

export const transformScaleRatio = (v: string | number | undefined | null) => {
    const ratio = typeof v === 'number' ? v : parseFloat(v || '1') || 1.0;
    return {
        ratio,
        gap: `${1.25 * ratio}rem`,
        pad: `${1.5 * ratio}rem`,
        margin: `${1 * ratio}rem`,
        radius: `${12 * ratio}px`
    };
};

/** As quatro camadas da sombra empilhada (deslocamento e desfoque), da mais rente à mais difusa. */
// sarak-allow-hardcode: o transformador é a origem do valor do token (o px/em da opção escolhida vira a variável CSS); não há var() para onde levá-lo.
const LAYERED_SHADOW_STEPS = ['0 2px 4px', '0 4px 8px', '0 8px 16px', '0 16px 32px'] as const;

export const transformLayeredShadows = (v: string | number | undefined | null) => {
    const intensity = typeof v === 'number' ? v : parseFloat(v || '1') || 1.0;
    return LAYERED_SHADOW_STEPS.map((step) => `${step} rgba(0,0,0,${0.05 * intensity})`).join(', ');
};

export const transformFluidScaling = (v: string | number | undefined | null) => {
    const factor = typeof v === 'number' ? v : parseFloat(v || '1') || 1.0;
    return {
        // sarak-allow-hardcode: o transformador é a origem do valor do token (o px/em da opção escolhida vira a variável CSS); não há var() para onde levá-lo.
        base: `clamp(12px, ${0.8 * factor}vw + 8px, ${20 * factor}px)`,
        // sarak-allow-hardcode: o transformador é a origem do valor do token (o px/em da opção escolhida vira a variável CSS); não há var() para onde levá-lo.
        gap: `clamp(10px, ${1 * factor}vw + 4px, ${32 * factor}px)`,
        // sarak-allow-hardcode: o transformador é a origem do valor do token (o px/em da opção escolhida vira a variável CSS); não há var() para onde levá-lo.
        padding: `clamp(16px, ${1.5 * factor}vw + 8px, ${48 * factor}px)`
    };
};
